import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface DisasterRecord {
  id: number;
  flood_zone_id: string;
  water_logging_point_id: string;
  fire_incident_id: string;
  vulnerable_population: number;
  critical_infrastructure: string;
  evacuation_route_id: string;
  relief_centre_id: string;
  emergency_equipment_id: string;
  response_team_id: string;
}

export default function Disaster() {
  const [data, setData] = useState<DisasterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getDisaster()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const totalVulnerable = data.reduce(
    (sum, d) => sum + d.vulnerable_population,
    0
  );

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Disaster Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      <div className="grid grid-cols-4 gap-3">

        <KPI label="Flood Zones" value={data.length} />

        <KPI label="Vulnerable Population" value={totalVulnerable.toLocaleString()} />

        <KPI label="Relief Centres" value={data.length} />

        <KPI label="Response Teams" value={data.length} />

      </div>

      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Disaster Management Assets
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
