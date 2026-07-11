import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface SolidWasteData {
  id: number;
  collection_routes_id: string;
  bins: number;
  vehicles: number;
  transfer_stations: number;
  processing_plants: number;
}

export default function SolidWaste() {
  const [data, setData] = useState<SolidWasteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getSolidWaste()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const totalBins = data.reduce(
    (sum, item) => sum + item.bins,
    0
  );

  const totalVehicles = data.reduce(
    (sum, item) => sum + item.vehicles,
    0
  );

  const totalTransferStations = data.reduce(
    (sum, item) => sum + item.transfer_stations,
    0
  );

  const totalPlants = data.reduce(
    (sum, item) => sum + item.processing_plants,
    0
  );

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Solid Waste Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">

        <KPI label="Collection Routes" value={data.length} />

        <KPI label="Waste Bins" value={totalBins} />

        <KPI label="Vehicles" value={totalVehicles} />

        <KPI label="Transfer Stations" value={totalTransferStations} />

        <KPI label="Processing Plants" value={totalPlants} />

      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Solid Waste Management Network
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
