
import { Zap, Plus, FileText, Bell, Users} from 'lucide-react';

export default function QuickActionsWidget() {
  const actions = [
    { icon: <Plus size={20} />, label: 'New Work Order', color: 'text-emerald-400' },
    { icon: <Bell size={20} />, label: 'Broadcast Alert', color: 'text-amber-400' },
    { icon: <FileText size={20} />, label: 'Export Report', color: 'text-blue-400' },
    { icon: <Users size={20} />, label: 'Manage Users', color: 'text-purple-400' },
  ];
  
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Zap className="text-yellow-400" size={20} />
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map(a => (
          <button key={a.label} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group">
            <div className={`p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform ${a.color}`}>
              {a.icon}
            </div>
            <span className="text-sm font-medium text-white">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
