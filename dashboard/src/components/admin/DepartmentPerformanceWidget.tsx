
import { Briefcase} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DepartmentPerformanceWidget({ depts }: { depts: any[] }) {
  const navigate = useNavigate();
  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Briefcase className="text-purple-400" size={20} />
        Department Performance Comparison
      </h3>
      
      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-3 text-sm font-medium text-[var(--text-secondary)]">Rank</th>
              <th className="p-3 text-sm font-medium text-[var(--text-secondary)]">Department</th>
              <th className="p-3 text-sm font-medium text-[var(--text-secondary)]">SLA</th>
              <th className="p-3 text-sm font-medium text-[var(--text-secondary)]">Satisfaction</th>
              <th className="p-3 text-sm font-medium text-[var(--text-secondary)]">Budget Utilization</th>
              <th className="p-3 text-sm font-medium text-[var(--text-secondary)]">Score</th>
            </tr>
          </thead>
          <tbody>
            {[...depts].sort((a,b) => b.overall_score - a.overall_score).map((d, idx) => (
              <tr key={d.dept_name} onClick={() => navigate('/department-dashboard')} className="border-b border-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                <td className="p-3 text-sm font-medium text-white">#{idx + 1}</td>
                <td className="p-3 text-sm font-medium text-white capitalize group-hover:text-sky-400">{d.dept_name.replace('_dept','')}</td>
                <td className="p-3 text-sm text-white">{d.sla_compliance}%</td>
                <td className="p-3 text-sm text-emerald-400">{d.citizen_satisfaction}%</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: `${d.budget_utilization}%` }} />
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">{d.budget_utilization}%</span>
                  </div>
                </td>
                <td className="p-3 text-sm font-bold text-white">{Number(d.overall_score).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
