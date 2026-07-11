
import { Map, AlertCircle } from 'lucide-react';

export default function WardStatusWidget({ wards }: { wards: any[] }) {
  return (
    <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Map className="text-indigo-400" size={20} />
        Ward Overview Matrix
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
        {wards?.map(w => (
          <div key={w.ward_no} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5">
            <div>
              <div className="text-sm font-medium text-white">Ward {w.ward_no} - {w.ward_name}</div>
              <div className="text-xs text-[var(--text-secondary)]">{Number(w.population).toLocaleString()} Citizens</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-amber-400 flex items-center justify-end gap-1">
                {w.open_grievances} <AlertCircle size={14} />
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Open Issues</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
