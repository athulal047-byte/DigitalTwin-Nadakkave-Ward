import { NavLink, useLocation } from 'react-router-dom';
import { useUE5 } from '../hooks/useUE5';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Home, Building2, Route, Droplets, Zap, Wifi, Waves, CloudRain, Leaf, Trash2, Heart, Users, TrendingUp, ShieldAlert, Landmark, Cpu, FileBarChart
} from 'lucide-react';

const baseNavItems = [
  { path: '/3d', label: '3D View', icon: <Box size={20} />, permission: 'digital_twin' },
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/buildings', label: 'Buildings', icon: <Building2 size={20} />, permission: 'buildings' },
  { path: '/roads', label: 'Roads', icon: <Route size={20} />, permission: 'roads' },
  { path: '/grievances', label: 'Grievances', icon: <ShieldAlert size={20} />, permission: 'grievances' },
  { path: '/reports', label: 'Reports', icon: <FileBarChart size={20} />, permission: 'reports' },
  { path: '/water', label: 'Water', icon: <Droplets size={20} />, permission: 'water' },
  { path: '/electricity', label: 'Electricity', icon: <Zap size={20} />, permission: 'electricity' },
  { path: '/telecom', label: 'Telecom', icon: <Wifi size={20} />, permission: 'telecom' },
  { path: '/sewerage', label: 'Sewerage', icon: <Waves size={20} />, permission: 'water' },
  { path: '/stormwater', label: 'Stormwater', icon: <CloudRain size={20} />, permission: 'water' },
  { path: '/environment', label: 'Environment', icon: <Leaf size={20} />, permission: 'environment' },
  { path: '/solid-waste', label: 'Solid Waste', icon: <Trash2 size={20} />, permission: 'solid_waste' },
  { path: '/social', label: 'Social Infrastructure', icon: <Heart size={20} />, permission: 'buildings' },
  { path: '/demographics', label: 'Demographics', icon: <Users size={20} />, permission: 'users' },
  { path: '/economic', label: 'Economic Activity', icon: <TrendingUp size={20} />, permission: 'reports' },
  { path: '/disaster', label: 'Disaster Management', icon: <ShieldAlert size={20} />, permission: 'disaster' },
  { path: '/governance', label: 'Governance', icon: <Landmark size={20} />, permission: 'users' },
  { path: '/iot', label: 'IoT Sensors', icon: <Cpu size={20} />, permission: 'electricity' },
];

export default function Sidebar() {
  const { isUE5, open3DView, openDashboard } = useUE5();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  
  const dashboardPath = user?.role === 'admin' || user?.role === 'corporation' ? '/' 
                      : user?.role === 'citizen' ? '/citizen-portal' 
                      : '/department-dashboard';
  
  const topNavItems = baseNavItems
    .filter(item => {
      if (item.permission && !hasPermission(item.permission)) return false;
      if (item.path === '/governance' && user?.role !== 'admin' && user?.role !== 'corporation') return false;
      return true;
    })
    .map(item => {
      if (item.id === 'dashboard') {
        return { ...item, path: dashboardPath };
      }
      return item;
    });

  // Are we in an isolated widget route inside WB_3DView?
  const isWidgetMode = location.pathname.startsWith('/widget');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (isWidgetMode) {
      // In widget mode, ALWAYS prevent React Router navigation.
      // Instead, directly change the URL hash to trigger Unreal's OnUrlChanged.
      e.preventDefault();
      if (path === '/3d') {
        // Already in 3D view, do nothing
      } else {
        // Change hash from #/widget/sidebar to #/dashboard (or #/buildings, etc.)
        // Unreal's OnUrlChanged detects URL no longer contains #/widget/ → swaps to WB_Dashboard
        window.location.hash = '#' + path;
      }
      return;
    }

    if (!isUE5) return; // Let React Router handle it if not in Unreal

    // In full dashboard mode, let React Router change the hash normally.
    // Bridge calls are optional redundant signals.
    if (path === '/3d') {
      open3DView();
    } else if (location.pathname === '/3d') {
      openDashboard(path);
    }
  };

  return (
    <aside className="w-[72px] h-full flex flex-col items-center py-4 shrink-0 pointer-events-auto glass-panel gap-4 shadow-2xl">
      {/* Top Navigation */}
      <nav className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto no-scrollbar" aria-label="Primary navigation">
        {topNavItems.map((item) => {
          // In widget mode, "3D View" should always appear active
          const isActive = isWidgetMode
            ? item.path === '/3d'
            : undefined; // let NavLink handle it normally

          return (
            <NavLink
              key={item.path}
              to={item.path as string}
              end={item.path === '/' || item.path === '/department-dashboard' || item.path === '/citizen-portal'}
              className={({ isActive: routerActive }) => {
                const active = isActive ?? routerActive;
                return `w-12 h-12 flex items-center justify-center rounded-[14px] transition-all duration-300 relative group
                ${active
                  ? 'text-white bg-white/10 shadow-[0_0_15px_var(--accent-glow)] border border-white/20'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent'
                }`;
              }}
              onClick={(e) => handleNavClick(e, item.path as string)}
            >
              {item.icon}
              {/* Tooltip */}
              <div className="absolute left-16 px-3 py-1.5 bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-xl">
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
}