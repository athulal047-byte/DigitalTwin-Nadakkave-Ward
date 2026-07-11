
import { Server, Database, Users, Cpu, Activity, Clock, Layers, Link as LinkIcon, HardDrive } from 'lucide-react';

export default function PlatformHealthWidget({ health }: { health: any }) {
  if (!health) return null;
  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Activity className="text-cyan-400" size={20} />
        Platform Health
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
          <HardDrive className="text-indigo-400 mb-2" size={20} />
          <div className="text-xs text-[var(--text-secondary)] mb-1">Disk Usage</div>
          <div className="text-xl font-bold text-white">{health.disk_usage_percent}%</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <Server className="text-purple-400 mb-2" size={20} />
          <div className="text-xs text-[var(--text-secondary)] mb-1">API Response</div>
          <div className="text-xl font-bold text-white">{health.api_response_time_ms}ms</div>
        </div>
      </div>
      
      <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)] flex items-center gap-2"><LinkIcon size={14}/> UE5 Connection</span>
          <span className="text-emerald-400 font-medium">{health.ue5_connection}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)] flex items-center gap-2"><Database size={14}/> DB Latency</span>
          <span className="text-white font-medium">{health.database_latency_ms}ms</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)] flex items-center gap-2"><Clock size={14}/> Last Backup</span>
          <span className="text-white font-medium">{new Date(health.last_backup).toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)] flex items-center gap-2"><Users size={14}/> Active Users</span>
          <span className="text-white font-medium">{health.connected_users}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-secondary)] flex items-center gap-2"><Layers size={14}/> Background Jobs</span>
          <span className="text-white font-medium">{health.background_jobs}</span>
        </div>
      </div>
    </div>
  );
}
