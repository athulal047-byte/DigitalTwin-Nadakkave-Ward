import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface EconomicData {
  id: number;
  shop_id: string;
  market_id: string;
  vendor_id: string;
  office_id: string;
  industry_id: string;
  service_centre_id: string;
  land_value: string;
  rental_value: string;
  commercial_value: string;
}

export default function EconomicActivity() {
  const [data, setData] = useState<EconomicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getEconomicActivity()
      .then((res: unknown) => setData(Array.isArray(res) ? res as EconomicData[] : ((res as any)?.value || (res as any)?.data || [])))
      .catch((err: unknown) => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const totalLandValue = (data || []).reduce(
    (sum, item) => sum + Number(item.land_value || 0),
    0
  );

  const totalCommercialValue = (data || []).reduce(
    (sum, item) => sum + Number(item.commercial_value || 0),
    0
  );

  const avgRental =
    (data || []).length > 0
      ? Math.round(
          (data || []).reduce(
            (sum, item) => sum + Number(item.rental_value || 0),
            0
          ) / (data || []).length
        )
      : 0;

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Economic Activity Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">

        <KPI label="Shops & Markets" value={data.length} />

        <KPI label="Land Value" value={<>₹ {(totalLandValue / 10000000).toFixed(2)} Cr</>} color="#38bdf8" />

        <KPI label="Commercial Value" value={<>₹ {(totalCommercialValue / 10000000).toFixed(2)} Cr</>} color="#34d399" />

        <KPI label="Avg Rental Value" value={<>₹ {avgRental.toLocaleString()}</>} color="#fbbf24" />

      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Economic Activity Assets
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
