import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface Facility {
  id: number;
  facility_id: string;
  facility_name: string;
  facility_type: string;
}

export default function SocialInfrastructure() {
  const [data, setData] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getSocialInfrastructure()
      .then((res: unknown) => setData(Array.isArray(res) ? res as Facility[] : ((res as any)?.value || (res as any)?.data || [])))
      .catch((err: unknown) => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const education = (data || []).filter(
    item => item.facility_type === 'Education'
  ).length;

  const health = (data || []).filter(
    item => item.facility_type === 'Health'
  ).length;

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Social Infrastructure</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">

        <KPI label="Education Facilities" value={education} color="#3b82f6" />

        <KPI label="Healthcare Facilities" value={health} color="#ef4444" />

      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Facility Directory
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
