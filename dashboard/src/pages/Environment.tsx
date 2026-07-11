import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface EnvironmentData {
  id: number;
  water_body_id: string;
  waterbody_type: string;
  tree_id: string;
  parks: number;
  temperature_sensors: number;
  humidity_sensors: number;
  rainfall_stations: number;
  air_quality: string;
  water_quality: string;
  noise_levels: string;
}

export default function Environment() {
  const [data, setData] = useState<EnvironmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getEnvironment()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const parks = data.reduce((s, x) => s + x.parks, 0);
  const tempSensors = data.reduce((s, x) => s + x.temperature_sensors, 0);
  const rainfall = data.reduce((s, x) => s + x.rainfall_stations, 0);

  const avgAir =
    data.length > 0
      ? Math.round(
          data.reduce((s, x) => s + Number(x.air_quality), 0) /
          data.length
        )
      : 0;

  const avgWater =
    data.length > 0
      ? Math.round(
          data.reduce((s, x) => s + Number(x.water_quality), 0) /
          data.length
        )
      : 0;

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Environment Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      <div className="grid grid-cols-5 gap-3">

        <KPI label="Parks" value={parks} />

        <KPI label="Air Quality" value={avgAir} />

        <KPI label="Water Quality" value={avgWater} />

        <KPI label="Temp Sensors" value={tempSensors} />

        <KPI label="Rain Stations" value={rainfall} />

      </div>

      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Environmental Assets & Monitoring
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
