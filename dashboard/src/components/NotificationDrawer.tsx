import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Bell, X, AlertTriangle, Info, CheckCircle2, CloudLightning } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getNotifications()
      .then(res => setNotifications(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-[60px] right-20 w-80 glass-panel flex flex-col z-50 animate-panel-in shadow-2xl h-[500px]">
      <div className="px-4 py-3 border-b border-[var(--glass-border)] flex justify-between items-center bg-black/20">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bell size={16} className="text-sky-400" />
          Notifications
        </h3>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-xs">
            <Bell size={24} className="mb-2 opacity-20" />
            No new notifications
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div 
                key={n.notification_id} 
                className={`p-3 rounded-lg border transition-all ${n.is_read ? 'opacity-60 bg-black/20 border-white/5' : 'bg-white/10 border-white/20'}`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {n.priority === 'critical' ? <AlertTriangle size={16} className="text-red-400" /> :
                     n.priority === 'warning' ? <AlertTriangle size={16} className="text-amber-400" /> :
                     n.priority === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> :
                     n.type === 'weather' ? <CloudLightning size={16} className="text-sky-400" /> :
                     <Info size={16} className="text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white mb-1 truncate pr-2">{n.title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-tight line-clamp-2 mb-2">{n.message}</p>
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-[var(--text-muted)]">{new Date(n.created_at).toLocaleString()}</span>
                      {!n.is_read && (
                        <button onClick={() => markRead(n.notification_id)} className="text-sky-400 hover:text-sky-300 font-medium">Mark as read</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
