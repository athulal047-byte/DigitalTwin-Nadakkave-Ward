
import { AlertTriangle, AlertOctagon } from 'lucide-react';

export default function CriticalEventsWidget({ events }: { events: any[] }) {
  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
      <h3 className="text-lg font-medium text-red-400 mb-6 flex items-center gap-2">
        <AlertOctagon size={20} />
        Critical Events
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
        {events?.length === 0 ? (
          <div className="text-sm text-[var(--text-secondary)] text-center mt-10">No critical events</div>
        ) : events?.map((e, idx) => (
          <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 hover:bg-red-500/20 transition-colors cursor-pointer">
            <div className="flex gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{e.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{e.details}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-red-300 font-semibold">{e.type}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[10px] text-[var(--text-secondary)]">{new Date(e.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
