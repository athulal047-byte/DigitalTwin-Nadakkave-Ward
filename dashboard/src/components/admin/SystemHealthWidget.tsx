
import { Server, Database, Users, Cpu } from 'lucide-react';

export default function SystemHealthWidget({ health }: { health: any }) {
  if (!health) return null;
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Server className="text-cyan-400" size={20} />
        System & Architecture Health
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <Cpu className="text-blue-400 mb-2" size={20} />
          <div className="text-xs text-[var(--text-secondary)] mb-1">CPU Load</div>
          <div className="text-xl font-bold text-white">{health.cpu_load}%</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <Database className="text-emerald-400 mb-2" size={20} />
          <div className="text-xs text-[var(--text-secondary)] mb-1">RAM Usage</div>
          <div className="text-xl font-bold text-white">{health.memory_usage_percent}%</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <Server className="text-purple-400 mb-2" size={20} />
          <div className="text-xs text-[var(--text-secondary)] mb-1">DB Ping</div>
          <div className="text-xl font-bold text-white">{health.database_ping_ms}ms</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <Users className="text-amber-400 mb-2" size={20} />
          <div className="text-xs text-[var(--text-secondary)] mb-1">Live Sockets</div>
          <div className="text-xl font-bold text-white">{health.connected_clients}</div>
        </div>
      </div>
    </div>
  );
}
