import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface WaterAsset {
  id: number;
  distribution_network_id: string;
  pipe_id: string;
  pipe_diameter: string;
  pipe_material: string;
  valve_id: string;
  overhead_tanks: number;
  consumer_connections: number;
  flow_meters: number;
}

export default function Water() {
  const [data, setData] = useState<WaterAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getWater()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const totalConnections = data.reduce(
    (sum, item) => sum + item.consumer_connections,
    0
  );

  const totalTanks = data.reduce(
    (sum, item) => sum + item.overhead_tanks,
    0
  );

  const totalMeters = data.reduce(
    (sum, item) => sum + item.flow_meters,
    0
  );

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Water Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KPI label="Networks" value={data.length} />

        <KPI label="Connections" value={totalConnections.toLocaleString()} />

        <KPI label="Overhead Tanks" value={totalTanks} />

        <KPI label="Flow Meters" value={totalMeters} />
      </div>

      {/* Water Network Table */}
      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Water Distribution Network
          </div>
        </div>

        {error ? (
          <ErrorState message={error.message} onRetry={loadData} />
        ) : <DataGrid data={data} loading={loading} />}
      </div>
    </div>
    </div>
  );
}
