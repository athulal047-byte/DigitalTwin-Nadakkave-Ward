import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface Demographic {
  id: number;
  total_population: number;
  density: string;
  age_distribution: string;
  gender_distribution: string;
  income_groups: string;
  employment: string;
  literacy: string;
  elderly: number;
  children: number;
  pwd: number;
}

export default function Demographics() {
  const [data, setData] = useState<Demographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getDemographics()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const totalPopulation = data.reduce(
    (sum, d) => sum + d.total_population,
    0
  );

  const totalChildren = data.reduce(
    (sum, d) => sum + d.children,
    0
  );

  const totalElderly = data.reduce(
    (sum, d) => sum + d.elderly,
    0
  );

  const avgLiteracy =
    data.length > 0
      ? (
          data.reduce((sum, d) => sum + Number(d.literacy), 0) /
          data.length
        ).toFixed(1)
      : '0';

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Demographics Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">

        <KPI label="Population" value={totalPopulation.toLocaleString()} />

        <KPI label="Literacy" value={<>{avgLiteracy}%</>} />

        <KPI label="Children" value={totalChildren.toLocaleString()} />

        <KPI label="Elderly" value={totalElderly.toLocaleString()} />

      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Demographic Profile
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
