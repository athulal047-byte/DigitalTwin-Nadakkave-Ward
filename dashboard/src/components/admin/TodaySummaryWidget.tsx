
import { Calendar, Building2, Map, Users, AlertCircle, CheckCircle2, Wrench, IndianRupee } from 'lucide-react';

export default function TodaySummaryWidget({ summary }: { summary: any }) {
  if (!summary) return null;
  const items = [
    { label: 'New Buildings', val: summary.new_buildings, icon: <Building2 size={16}/>, color: 'text-blue-400' },
    { label: 'New Roads', val: summary.new_roads, icon: <Map size={16}/>, color: 'text-indigo-400' },
    { label: 'New Citizens', val: summary.new_citizens, icon: <Users size={16}/>, color: 'text-purple-400' },
    { label: 'New Grievances', val: summary.new_grievances, icon: <AlertCircle size={16}/>, color: 'text-amber-400' },
    { label: 'Resolved Grievances', val: summary.resolved_grievances, icon: <CheckCircle2 size={16}/>, color: 'text-emerald-400' },
    { label: 'Work Orders Created', val: summary.work_orders_created, icon: <Wrench size={16}/>, color: 'text-orange-400' },
    { label: 'Revenue Collected', val: `₹${Number(summary.revenue_collected).toLocaleString()}`, icon: <IndianRupee size={16}/>, color: 'text-emerald-400' },
    { label: 'System Logins', val: summary.system_logins, icon: <Users size={16}/>, color: 'text-sky-400' },
  ];
  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Calendar className="text-emerald-400" size={20} />
        Today's Summary
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:bg-white/10 transition-colors">
            <div className={`${item.color} mb-2`}>{item.icon}</div>
            <div className="text-xl font-bold text-white mb-1">{item.val || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
