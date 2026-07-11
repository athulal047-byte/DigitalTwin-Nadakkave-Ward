import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface DigitalTwinState {
  emergencyMode: boolean;
  selectedAsset: string | null;
  activeLayers: string[];
  weather: any;
  liveStats: Record<string, number>;
}

interface DigitalTwinContextType {
  state: DigitalTwinState;
  updateState: (updates: Partial<DigitalTwinState>) => void;
}

const defaultState: DigitalTwinState = {
  emergencyMode: false,
  selectedAsset: null,
  activeLayers: [],
  weather: { temp: 28, condition: 'Sunny' },
  liveStats: {}
};

const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined);

export const DigitalTwinStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DigitalTwinState>(defaultState);
  const { subscribe } = useSocket({ namespace: '/department' });

  useEffect(() => {
    // Listen for state updates broadcast by the socket broker
    subscribe('state_updated', (updates: Partial<DigitalTwinState>) => {
      setState(prev => ({ ...prev, ...updates }));
    });
  }, [subscribe]);

  const updateState = (updates: Partial<DigitalTwinState>) => {
    setState(prev => ({ ...prev, ...updates }));
    // Ideally, emit to server if authorized, but mostly read-only for local UI
  };

  return (
    <DigitalTwinContext.Provider value={{ state, updateState }}>
      {children}
    </DigitalTwinContext.Provider>
  );
};

export const useDigitalTwinState = () => {
  const context = useContext(DigitalTwinContext);
  if (!context) throw new Error('useDigitalTwinState must be used within DigitalTwinStateProvider');
  return context;
};
