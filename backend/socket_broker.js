const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const JWT_SECRET = process.env.JWT_SECRET || 'nadakkavu_super_secret_key_2026';

const pool = new Pool({
  host: 'localhost',
  database: 'nadakkave',
  user: 'postgres',
  password: 'athuldb47',
  port: 5432
});

function initSocketBroker(server) {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const namespaces = ['/admin', '/department', '/citizen', '/unreal'];
  const nsps = {};

  // Authentication Middleware
  namespaces.forEach(ns => {
    const nsp = io.of(ns);
    nsp.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
      if (!token) {
        console.warn(`[Socket Broker] Authentication failed on ${ns} - No token`);
        return next(new Error('Authentication error'));
      }
      
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      jwt.verify(cleanToken, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.warn(`[Socket Broker] Authentication failed on ${ns} - Invalid token`);
          return next(new Error('Authentication error'));
        }
        
        // Basic RBAC guard based on namespace
        if (ns === '/admin' && decoded.role !== 'admin') {
          return next(new Error('Forbidden: Requires admin'));
        }
        
        socket.user = decoded;
        next();
      });
    });
    
    nsp.on('connection', (socket) => {
      console.log(`[Socket Broker] Client connected to ${ns}: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`[Socket Broker] Client disconnected from ${ns}: ${socket.id}`);
      });
    });
    
    nsps[ns] = nsp;
  });

  // Event Batching logic
  let batchBuffer = [];
  
  function broadcastBatch() {
    if (batchBuffer.length === 0) return;
    const batch = [...batchBuffer];
    batchBuffer = [];
    
    namespaces.forEach(ns => {
      nsps[ns].emit('batch_events', batch);
    });
  }
  
  setInterval(broadcastBatch, 100);

  // Connect to PostgreSQL to listen to real-time events
  (async () => {
    const client = await pool.connect();
    try {
      await client.query('LISTEN digital_twin_events');
      console.log('[Socket Broker] Listening to PG channel "digital_twin_events"');
      
      client.on('notification', (msg) => {
        try {
          const payload = JSON.parse(msg.payload);
          if (payload.priority === 'CRITICAL') {
            namespaces.forEach(ns => {
              nsps[ns].emit('critical_event', payload);
            });
          } else {
            batchBuffer.push(payload);
          }
        } catch (e) {
          console.error('[Socket Broker] Failed to parse PG notification:', e);
        }
      });
    } catch (err) {
      console.error('[Socket Broker] PG Listen Error:', err);
    }
  })();

  return io;
}

module.exports = { initSocketBroker };
