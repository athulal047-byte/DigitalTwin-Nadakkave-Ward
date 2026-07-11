import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  IndianRupee, AlertTriangle, Activity, 
  Plus, Bell, FileText, ArrowRight 
} from 'lucide-react';
import type { DashboardStats } from '../types';
import { api } from '../services/api';
import KPI from '../components/KPI';
import { useAuth } from '../contexts/AuthContext';
import NewGrievanceModal from '../components/NewGrievanceModal';
import SendAlertModal from '../components/SendAlertModal';
import AdminDashboard from './AdminDashboard';

const STATUS_COLORS = {
  open: '#ef4444',
  assigned: '#f59e0b',
  in_progress: '#3b82f6',
  resolved: '#10b981',
  closed: '#6b7280'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [grievances, setGrievances] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getRevenueStats(),
      api.getGrievanceStats(),
      user?.role === 'admin' ? api.getAuditLogs({ limit: '10' }) : Promise.resolve([]),
      api.getNotifications({ limit: '5' }).catch(() => ({ data: [], total: 0 }))
    ])
    .then(([statsRes, revRes, grvRes, _auditRes, notifRes]) => {
      setStats(statsRes);
      setRevenue(revRes);
      setGrievances(grvRes);
      setNotifications((notifRes as { data: any[] }).data || []);
    })
    .finally(() => setLoading(false));
  }, [user?.role]);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (loading) return (
    <div className="h-full w-full flex flex-col pointer-events-none">
      <div className="absolute top-24 left-32 bottom-24 w-[420px] pointer-events-auto flex flex-col gap-4">
        {[...Array(4)].map((_, i) => <div key={`l-${i}`} className="h-48 bg-[var(--panel-bg)] rounded-xl animate-pulse" />)}
      </div>
      <div className="absolute top-24 right-6 bottom-24 w-[420px] pointer-events-auto flex flex-col gap-4">
        {[...Array(4)].map((_, i) => <div key={`r-${i}`} className="h-48 bg-[var(--panel-bg)] rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!stats) return null;

  // Transform data for charts
  const grievancePieData = grievances?.by_department.map((d: any) => ({
    name: d.department,
    value: parseInt(d.active)
  })).filter((d: any) => d.value > 0);

  const revenueData = revenue?.bills_by_type.map((b: any) => ({
    name: b.utility_type,
    Collected: parseFloat(b.total_collected),
    Pending: parseFloat(b.pending_amount)
  }));

  const infraPct = (val: string) =>
    stats.total_buildings > 0
      ? Math.round((parseInt(val) / stats.total_buildings) * 100)
      : 0;

  const totalCollected = parseFloat(revenue?.tax?.total_collected || '0') + 
    revenue?.bills_by_type.reduce((s: number, b: any) => s + parseFloat(b.total_collected), 0);

  return (
    <>
      <div className="h-full w-full pointer-events-none">
        {/* LEFT COLUMN */}
        <div className="absolute top-24 left-32 bottom-24 w-[420px] pointer-events-auto">
          <div className="h-full overflow-y-auto space-y-5 no-scrollbar pb-6">
            
            {/* Key Metrics */}
            <section className="glass-panel p-5 space-y-4 shadow-xl">
              <h2 className="text-label flex items-center gap-2">
                <Activity size={14} className="text-sky-400" /> Executive Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <KPI label="Total Revenue" value={`₹${(totalCollected / 100000).toFixed(2)}L`} color="#10b981" />
                <KPI label="Active Grievances" value={grievances?.summary?.open_count || 0} color="#ef4444" />
                <KPI label="Buildings Synced" value={stats.total_buildings.toLocaleString()} color="#38bdf8" />
                <KPI label="Pending Taxes" value={`₹${(parseFloat(revenue?.tax?.pending_amount || '0') / 1000).toFixed(1)}k`} color="#f59e0b" />
              </div>
            </section>

            {/* Revenue Chart */}
            <section className="glass-panel p-5 shadow-xl">
              <h2 className="text-label mb-4 flex items-center gap-2">
                <IndianRupee size={14} className="text-emerald-400" /> Utility Revenue Collection
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${v/1000}k`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Active Grievances Chart */}
            <section className="glass-panel p-5 shadow-xl">
              <h2 className="text-label mb-2 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" /> Active Grievances by Dept
              </h2>
              <div className="h-48 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={grievancePieData}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {grievancePieData?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Infrastructure Coverage */}
            <section className="glass-panel p-5 shadow-xl">
              <h2 className="text-label mb-4">Infrastructure Coverage</h2>
              <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Water Supply', key: 'water', color: '#38bdf8' },
                { label: 'Electricity', key: 'electricity', color: '#fbbf24' },
                { label: 'Sewerage', key: 'sewer', color: '#a78bfa' },
                { label: 'Internet', key: 'internet', color: '#34d399' },
              ].map(item => {
                const pct = infraPct((stats.infrastructure as any)[item.key] ?? '0');
                return (
                  <div key={item.key} className="text-center">
                    <div className="relative w-14 h-14 mx-auto mb-2">
                      <svg className="w-14 h-14 -rotate-90">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                        <circle
                          cx="28" cy="28" r="22" fill="none"
                          stroke={item.color} strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 22 * pct / 100} ${2 * Math.PI * 22}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold tabular-nums" style={{ color: item.color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{item.label}</div>
                  </div>
                );
              })}
              </div>
            </section>

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="absolute top-24 right-6 bottom-24 w-[420px] pointer-events-auto">
          <div className="h-full overflow-y-auto space-y-5 no-scrollbar pb-6">
            
            {/* Quick Actions */}
            <section className="glass-panel p-5 shadow-xl">
              <h2 className="text-label mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowGrievanceModal(true)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-medium transition-colors">
                  <Plus size={14} /> New Grievance
                </button>
                <button 
                  onClick={() => setShowAlertModal(true)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition-colors">
                  <Bell size={14} /> Send Alert
                </button>
                <button 
                  onClick={() => window.location.hash = "#/reports"}
                  className="flex items-center justify-center gap-2 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-xl text-xs font-medium transition-colors col-span-2">
                  <FileText size={14} /> Generate Operations Report
                </button>
              </div>
            </section>

            {/* Dynamic Critical Alerts Banner */}
            {notifications.filter(n => n.priority === 'high' || n.priority === 'critical').slice(0, 1).map((n: any) => (
              <div key={n.notification_id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-xl shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-5">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="text-sm font-semibold text-red-400">{n.title}</h3>
                  <p className="text-xs text-red-400/80 mt-1">{n.message}</p>
                </div>
              </div>
            ))}

            {/* Recent Grievances List */}
            <section className="glass-panel p-5 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-label">Recent Grievances</h2>
                <a href="#/grievances" className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </a>
              </div>
              <div className="space-y-3">
                {grievances?.recent?.slice(0, 4).map((g: any) => (
                  <div key={g.grievance_id} className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-white truncate pr-2">{g.subject}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 whitespace-nowrap">{g.ticket_no}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-[var(--text-secondary)]">{g.department}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[g.status as keyof typeof STATUS_COLORS] || '#6b7280' }} />
                        <span className="text-[9px] font-medium" style={{ color: STATUS_COLORS[g.status as keyof typeof STATUS_COLORS] || '#6b7280' }}>
                          {g.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>



          </div>
        </div>
      </div>

      {showGrievanceModal && (
        <NewGrievanceModal 
          onClose={() => setShowGrievanceModal(false)}
          onSuccess={() => {
            api.getGrievanceStats().then(setGrievances);
          }}
        />
      )}
      
      {showAlertModal && (
        <SendAlertModal 
          onClose={() => setShowAlertModal(false)}
          onSuccess={() => {
            api.getNotifications({ limit: '5' }).then(res => setNotifications(res.data));
          }}
        />
      )}
    </>
  );
}
