import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface TelecomData {
  id: number;
  ofc_network: string;
  mobile_towers: number;
  wifi_hotspots: number;
}

export default function Telecom() {
  const [data, setData] = useState<TelecomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getTelecom()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const towers = data.reduce(
    (sum, item) => sum + item.mobile_towers,
    0
  );

  const hotspots = data.reduce(
    (sum, item) => sum + item.wifi_hotspots,
    0
  );

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Telecom Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      <div className="grid grid-cols-3 gap-3">

        <KPI label="OFC Networks" value={data.length} />

        <KPI label="Mobile Towers" value={towers} />

        <KPI label="WiFi Hotspots" value={hotspots} />

      </div>

      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Telecom Infrastructure
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
