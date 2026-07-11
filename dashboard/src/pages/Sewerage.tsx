import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface SewerageData {
  id: number;
  sewer_network: string;
  manholes: number;
  stps: number;
  household_connections: number;
}

export default function Sewerage() {
  const [data, setData] = useState<SewerageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getSewerage()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const totalManholes = data.reduce(
    (sum, item) => sum + item.manholes,
    0
  );

  const totalStps = data.reduce(
    (sum, item) => sum + item.stps,
    0
  );

  const totalConnections = data.reduce(
    (sum, item) => sum + item.household_connections,
    0
  );

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Sewerage Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">

        <KPI label="Sewer Networks" value={data.length} />

        <KPI label="Manholes" value={totalManholes} />

        <KPI label="STPs" value={totalStps} />

        <KPI label="Household Connections" value={totalConnections} />

      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Sewerage Infrastructure
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
