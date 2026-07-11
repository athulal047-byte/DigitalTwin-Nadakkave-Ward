
import { Clock, AlertTriangle, FileText} from 'lucide-react';

export default function ActivityFeedWidget({ activities }: { activities: any[] }) {
  return (
    <div className="glass-panel p-6 rounded-2xl h-[500px] flex flex-col">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Clock className="text-blue-400" size={20} />
        Live Activity Feed
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
        {activities?.map(a => (
          <div key={a.id} className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
            <div className="mt-1">
              {a.entity_type === 'grievance' ? <AlertTriangle size={16} className="text-amber-400" /> : <FileText size={16} className="text-blue-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{a.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--text-secondary)] capitalize">{a.department || 'System'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-xs text-[var(--text-secondary)]">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
