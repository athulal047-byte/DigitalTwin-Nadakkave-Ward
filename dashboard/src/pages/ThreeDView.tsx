import { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import InfoPanel from '../components/InfoPanel';

export default function ThreeDView() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  useEffect(() => {
    const onShow = (buildingId: string) => {
      setSelectedBuilding(buildingId);
    };
    
    // Listen for building clicks originating from the Unreal Engine 3D viewport
    socket.on('dashboard:show_building', onShow);
    
    return () => {
      socket.off('dashboard:show_building', onShow);
    };
  }, []);

  return (
    <>
      {/* 3D View overlay — sidebar + topbar only, 3D scene shows through */}

      <InfoPanel 
        buildingId={selectedBuilding} 
        onClose={() => setSelectedBuilding(null)} 
      />
    </>
  );
}