
import { Activity, Home, Droplet, Users, DollarSign } from 'lucide-react';

export default function HealthScoreWidget({ data }: { data: any }) {
  if (!data) return <div className="h-64 glass-panel animate-pulse rounded-2xl" />;
  
  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Activity className="text-emerald-400" size={20} />
        City Health Index
      </h3>
      
      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            <circle cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="351" strokeDashoffset={351 - (351 * data.overall_score) / 100} className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{data.overall_score}</span>
            <span className="text-xs text-[var(--text-secondary)]">/ 100</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1"><Home size={14} className="text-blue-400" /><span className="text-xs text-[var(--text-secondary)]">Infrastructure</span></div>
          <div className="text-lg font-semibold text-white">{data.infrastructure}%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1"><Droplet size={14} className="text-cyan-400" /><span className="text-xs text-[var(--text-secondary)]">Utilities</span></div>
          <div className="text-lg font-semibold text-white">{data.utilities}%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-purple-400" /><span className="text-xs text-[var(--text-secondary)]">Satisfaction</span></div>
          <div className="text-lg font-semibold text-white">{data.citizen_satisfaction}%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={14} className="text-emerald-400" /><span className="text-xs text-[var(--text-secondary)]">Revenue</span></div>
          <div className="text-lg font-semibold text-white">{data.revenue}%</div>
        </div>
      </div>
    </div>
  );
}
