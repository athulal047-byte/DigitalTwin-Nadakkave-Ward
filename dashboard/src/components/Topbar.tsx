import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Route, Cpu, User as UserIcon, Bell, LogOut } from 'lucide-react';
import type { DashboardStats } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import NotificationDrawer from './NotificationDrawer';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sensorCount, setSensorCount] = useState(0);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      api.getStats()
        .then(data => {
          setStats(data);
          setApiStatus('online');
        })
        .catch(() => setApiStatus('offline'));

      api.getIot()
        .then(data => setSensorCount(data.length))
        .catch(console.error);

      api.getUnreadCount()
        .then(data => setUnreadCount(data.count))
        .catch(() => { });
    };

    fetchData();
    const dataTimer = setInterval(fetchData, 30000);
    return () => clearInterval(dataTimer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadge: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Administrator', color: 'text-sky-400', bg: 'bg-sky-500/10' },
    department: { label: user?.department || 'Department', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    public: { label: 'Citizen', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  };

  const badge = user ? (roleBadge[user.role] || roleBadge.department) : roleBadge.admin;

  return (
    <header className="h-16 flex items-center justify-between pointer-events-auto" aria-label="Command center topbar">

      {/* Left: Logo Card */}
      <div className="glass-panel flex items-center gap-3 px-4 h-full">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent-primary)] flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">Digital Twin </h1>
          <p className="text-[10px] text-[var(--text-secondary)] leading-tight">Nadakkave Ward</p>
        </div>
      </div>

      {/* Center: Real DB Stats */}
      <div className="glass-panel flex items-center h-full px-2">
        <div className="flex items-center gap-3 px-4 border-r border-[var(--glass-border)]">
          <Building2 size={20} className="text-[var(--text-secondary)]" />
          <div>
            <div className="text-xs font-semibold text-white">{stats?.total_buildings?.toLocaleString() ?? '–'}</div>
            <div className="text-label">Total Buildings</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 border-r border-[var(--glass-border)]">
          <Route size={20} className="text-[var(--text-secondary)]" />
          <div>
            <div className="text-xs font-semibold text-white">{stats?.total_roads?.toLocaleString() ?? '–'}</div>
            <div className="text-label">Total Roads</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4">
          <Cpu size={20} className="text-[var(--text-secondary)]" />
          <div>
            <div className="text-xs font-semibold text-white">{sensorCount}</div>
            <div className="text-label">Active Sensors</div>
          </div>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-3 h-full">
        {/* Status Pill */}
        <div className="glass-panel flex items-center gap-3 px-4 h-full">
          <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
          <div>
            <div className="text-xs font-semibold text-white">System Status</div>
            <div className="text-label">{apiStatus === 'online' ? 'All Systems Operational' : 'API Offline'}</div>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className={`w-12 h-12 glass-panel flex items-center justify-center transition-all relative ${notificationsOpen ? 'bg-white/10 text-white shadow-[0_0_15px_var(--accent-glow)]' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'}`}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`h-12 glass-panel flex items-center gap-3 px-3 transition-all duration-300 active:scale-95 ${profileOpen ? 'text-white border-white/20 shadow-[0_0_15px_var(--accent-glow)] bg-white/10' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
              <UserIcon size={16} className="text-sky-400" />
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-medium text-white leading-tight">{user?.full_name || 'User'}</div>
              <div className={`text-[10px] ${badge.color} leading-tight`}>{badge.label}</div>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute top-[60px] right-0 w-64 glass-panel flex flex-col p-2 z-50 animate-panel-in">
              <div className="px-3 py-3 border-b border-[var(--glass-border)] mb-1">
                <div className="text-sm font-semibold text-white tracking-tight">{user?.full_name}</div>
                <div className="text-label mt-0.5">{user?.email || user?.username}</div>
                <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-medium ${badge.color} ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <div className="h-[1px] bg-[var(--glass-border)] my-1" />
              <button
                onClick={handleLogout}
                className="text-left px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      </div>
    </header>
  );
}