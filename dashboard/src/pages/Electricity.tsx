import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface ElectricityData {
  id: number;
  transformers: number;
  distribution_poles: number;
  feeders: number;
  street_lights: number;
  solar_installation: number;
}

export default function Electricity() {
  const [data, setData] = useState<ElectricityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getElectricity()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const transformers = data.reduce((s, x) => s + x.transformers, 0);
  const poles = data.reduce((s, x) => s + x.distribution_poles, 0);
  const feeders = data.reduce((s, x) => s + x.feeders, 0);
  const lights = data.reduce((s, x) => s + x.street_lights, 0);
  const solar = data.reduce((s, x) => s + x.solar_installation, 0);

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Electricity Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      <div className="grid grid-cols-5 gap-3">

        <KPI label="Transformers" value={transformers} />

        <KPI label="Distribution Poles" value={poles} />

        <KPI label="Feeders" value={feeders} />

        <KPI label="Street Lights" value={lights} />

        <KPI label="Solar Installations" value={solar} />

      </div>

      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Electrical Infrastructure
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
