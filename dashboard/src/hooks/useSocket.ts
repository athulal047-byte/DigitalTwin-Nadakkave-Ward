import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketEvent {
  event_id: string;
  sequence_number: string;
  schema_version: string;
  correlation_id: string | null;
  tenant_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  department: string | null;
  priority: string;
  created_at: string;
  payload: any;
}

interface UseSocketOptions {
  namespace?: '/citizen' | '/department' | '/admin' | '/unreal';
  autoConnect?: boolean;
}

export function useSocket({ namespace = '/citizen', autoConnect = true }: UseSocketOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [latency, setLatency] = useState(0);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Socket connection aborted: No token found');
      return;
    }
    const socketUrl = `http://localhost:3000${namespace}`;
    
    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      setReconnecting(false);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Disconnected explicitly
      } else {
        setReconnecting(true);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
      setReconnecting(true);
    });

    // Handle incoming events
    socket.on('live_event', (event: SocketEvent) => {
      setLastEvent(event);
    });

    socket.on('batch_events', (events: SocketEvent[]) => {
      if (events.length > 0) {
        setLastEvent(events[events.length - 1]); // Store the latest for state, but emit all if subscribed
      }
    });

    // Measure latency periodically
    const pingInterval = setInterval(() => {
      const start = Date.now();
      socket.emit('ping', () => {
        setLatency(Date.now() - start);
      });
    }, 10000);

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace, autoConnect]);

  // Methods
  const emit = useCallback((eventName: string, payload: any, ack?: (res: any) => void) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, payload, ack);
    }
  }, []);

  const subscribe = useCallback((eventName: string, callback: (payload: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  }, []);

  const unsubscribe = useCallback((eventName: string, callback?: (payload: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(eventName, callback);
      } else {
        socketRef.current.off(eventName);
      }
    }
  }, []);

  return {
    connected,
    reconnecting,
    latency,
    namespace,
    lastEvent,
    emit,
    subscribe,
    unsubscribe
  };
}
