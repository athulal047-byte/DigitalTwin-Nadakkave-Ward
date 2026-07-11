import { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendAlertModal({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('alert');
  const [priority, setPriority] = useState('high');
  const [targetRole, setTargetRole] = useState('public');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.createNotification({
        title,
        message,
        type,
        priority,
        target_role: targetRole === 'all' ? null : targetRole,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="glass-panel w-[500px] max-w-[90vw] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-emerald-400" />
            Send System Alert
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Alert Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.g., Emergency Weather Warning"
              className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="alert">Alert</option>
                <option value="update">Update</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Priority</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Target Audience</label>
            <select 
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="public">Citizens (Public)</option>
              <option value="department">Department Officials</option>
              <option value="all">Everyone</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Message</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Provide the alert details..."
              rows={4}
              className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-emerald-500/50 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--glass-border)]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Broadcast Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
