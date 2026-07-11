import DataGrid from '../components/DataGrid';
import ErrorState from '../components/ErrorState';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import KPI from '../components/KPI';

interface GovernanceData {
  id: number;
  complaint_id: string;
  grievance_id: string;
  service_request_id: string;
  assessment: string;
  collection: string;
  arrears: string;
  trade_license_id: string;
  building_permit_id: string;
}

export default function Governance() {
  const [data, setData] = useState<GovernanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getGovernance()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to load data')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const assessment = data.reduce(
    (s, x) => s + Number(x.assessment),
    0
  );

  const collection = data.reduce(
    (s, x) => s + Number(x.collection),
    0
  );

  const arrears = data.reduce(
    (s, x) => s + Number(x.arrears),
    0
  );

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white tracking-tight">Governance Database</h2>
      </div>
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative">

      <div className="grid grid-cols-4 gap-3">

        <KPI label="Assessment" value={<>₹ {(assessment / 10000000).toFixed(1)} Cr</>} color="#38bdf8" />

        <KPI label="Collection" value={<>₹ {(collection / 10000000).toFixed(1)} Cr</>} color="#34d399" />

        <KPI label="Arrears" value={<>₹ {(arrears / 10000000).toFixed(1)} Cr</>} color="#fbbf24" />

        <KPI label="Complaints" value={data.length} />

      </div>

      <div className="glass-panel overflow-hidden">

        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="text-label">
            Governance & Citizen Services
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
