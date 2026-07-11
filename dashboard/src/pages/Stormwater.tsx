import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface StormwaterData {
  id: number;
  drain_id: string;
  drain_type: string;
  culverts: number;
}

export default function Stormwater() {
  const [data, setData] = useState<StormwaterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getStormwater()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const totalDrains = data.length;

  const totalCulverts = data.reduce(
    (sum, item) => sum + item.culverts,
    0
  );

  const openDrains = data.filter(
    item => item.drain_type === 'Open Drain'
  ).length;

  const coveredDrains = data.filter(
    item => item.drain_type === 'Covered Drain'
  ).length;

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Stormwater Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">

        <KPI label="Drain Networks" value={totalDrains} />

        <KPI label="Culverts" value={totalCulverts} />

        <KPI label="Open Drains" value={openDrains} />

        <KPI label="Covered Drains" value={coveredDrains} />

      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Stormwater Drainage Network
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
