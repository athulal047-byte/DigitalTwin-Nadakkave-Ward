import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { 
  Search, ShieldAlert, Plus, CheckCircle2, 
  Clock, AlertTriangle, ChevronRight, MessageSquare 
} from 'lucide-react';

const STATUS_COLORS = {
  open: 'text-red-400 bg-red-500/10 border-red-500/20',
  assigned: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  in_progress: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  closed: 'text-[var(--text-muted)] bg-white/5 border-white/10'
};

const PRIORITY_COLORS = {
  critical: 'text-red-500',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-sky-400'
};

export default function Grievances() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [department, setDepartment] = useState('all');
  const [page, setPage] = useState(0);
  const limit = 20;
  
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: String(limit), offset: String(page * limit) };
      if (status !== 'all') params.status = status;
      if (department !== 'all') params.department = department;
      if (search) params.search = search;
      
      const res = await api.getGrievances(params);
      setGrievances(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, department, search, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="absolute inset-0 pt-24 px-6 pb-6 pointer-events-none flex justify-center">
      
      {/* Main Panel */}
      <div className={`glass-panel flex flex-col pointer-events-auto transition-all duration-300 ${selectedGrievance ? 'w-[800px] -translate-x-48' : 'w-[1000px]'}`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-[var(--glass-border)] bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight leading-tight">Grievance Management</h2>
              <p className="text-[10px] text-[var(--text-secondary)]">Manage citizen complaints and maintenance requests</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Plus size={14} /> New Ticket
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-[var(--glass-border)] flex gap-4 bg-white/5 shrink-0">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by ticket number, subject, or complainant..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[var(--text-muted)] outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
          <select 
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(0); }}
            className="w-40 bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select 
            value={department}
            onChange={e => { setDepartment(e.target.value); setPage(0); }}
            className="w-48 bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none"
          >
            <option value="all">All Departments</option>
            <option value="Water Department">Water Department</option>
            <option value="Electricity Department">Electricity Department</option>
            <option value="Health Department">Health Department</option>
            <option value="Solid Waste Department">Solid Waste Department</option>
          </select>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : grievances.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
              <CheckCircle2 size={48} className="mb-4 text-white/10" />
              <p>No grievances found matching the criteria.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {grievances.map(g => (
                <div 
                  key={g.grievance_id}
                  onClick={() => setSelectedGrievance(g)}
                  className={`group flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedGrievance?.grievance_id === g.grievance_id 
                      ? 'bg-sky-500/10 border-sky-500/30' 
                      : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="w-1.5 h-10 rounded-full mr-4 shrink-0" 
                    style={{ backgroundColor: g.status === 'open' ? '#ef4444' : g.status === 'resolved' ? '#10b981' : g.status === 'in_progress' ? '#38bdf8' : '#f59e0b' }} 
                  />
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">{g.ticket_no}</span>
                      <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${PRIORITY_COLORS[g.priority as keyof typeof PRIORITY_COLORS] || 'text-white'}`}>
                        {g.priority === 'critical' && <AlertTriangle size={10} />}
                        {g.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white truncate">{g.subject}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{g.complainant_name} • {g.department}</p>
                  </div>

                  <div className="w-32 shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded border uppercase ${STATUS_COLORS[g.status as keyof typeof STATUS_COLORS]}`}>
                      {g.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={10} /> {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} className="text-[var(--text-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="h-12 border-t border-[var(--glass-border)] bg-black/20 flex items-center justify-between px-6 shrink-0">
          <span className="text-[10px] text-[var(--text-muted)]">Showing {grievances.length} of {total} results</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs text-white transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={(page + 1) * limit >= total} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs text-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedGrievance && (
        <div className="w-[360px] glass-panel pointer-events-auto ml-4 flex flex-col animate-panel-in shadow-2xl">
          <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20">
            <h3 className="text-sm font-semibold text-white">Ticket Details</h3>
            <button onClick={() => setSelectedGrievance(null)} className="text-[var(--text-muted)] hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">{selectedGrievance.ticket_no}</span>
                <span className={`text-[10px] font-medium px-2 py-1 rounded border uppercase ${STATUS_COLORS[selectedGrievance.status as keyof typeof STATUS_COLORS]}`}>
                  {selectedGrievance.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white mb-2">{selectedGrievance.subject}</h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{selectedGrievance.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
              <div>
                <span className="block text-[10px] text-[var(--text-muted)] mb-1">Department</span>
                <span className="text-xs text-white font-medium">{selectedGrievance.department}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[var(--text-muted)] mb-1">Category</span>
                <span className="text-xs text-white font-medium">{selectedGrievance.category || 'General'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[var(--text-muted)] mb-1">Complainant</span>
                <span className="text-xs text-white font-medium">{selectedGrievance.complainant_name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[var(--text-muted)] mb-1">Contact</span>
                <span className="text-xs text-white font-medium">{selectedGrievance.phone}</span>
              </div>
            </div>

            {selectedGrievance.bldg_id && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)] mb-0.5">Linked Asset</span>
                  <span className="text-xs text-white font-semibold flex items-center gap-1">Building {selectedGrievance.bldg_id}</span>
                </div>
                <ChevronRight size={14} className="text-[var(--text-muted)]" />
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2"><MessageSquare size={12} /> Internal Notes</h4>
              <div className="bg-black/20 border border-white/5 rounded-lg p-4 text-center text-[var(--text-muted)] text-[10px]">
                No internal notes yet.
              </div>
              <button className="w-full mt-2 py-2 border border-dashed border-white/20 text-white/70 hover:text-white rounded-lg text-[10px] font-medium transition-colors">
                + Add Note
              </button>
            </div>
          </div>
          
          <div className="p-4 border-t border-[var(--glass-border)] bg-black/20">
            <button className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-colors">
              Update Status
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
