import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  buildingId?: string;
}

export default function NewGrievanceModal({ onClose, onSuccess, buildingId }: Props) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('General');
  const [bldgId, setBldgId] = useState(buildingId || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.createGrievance({
        subject,
        description,
        department,
        bldg_id: bldgId || undefined
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create grievance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="glass-panel w-[500px] max-w-[90vw] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle size={20} className="text-sky-400" />
            File New Grievance
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
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="E.g., Broken street light, Water logging"
              className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Department</label>
              <select 
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Water">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads & Transport</option>
                <option value="Waste">Solid Waste</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Building ID (Optional)</label>
              <input 
                type="text" 
                value={bldgId}
                onChange={e => setBldgId(e.target.value)}
                placeholder="E.g., BLDG-1234"
                className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide detailed information..."
              rows={4}
              className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-sky-500/50 transition-colors resize-none"
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
              className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-colors shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
