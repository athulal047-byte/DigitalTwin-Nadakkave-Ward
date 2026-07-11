import { useEffect, useState, useCallback } from 'react';
import type { Building } from '../types';
import { api } from '../services/api';
import { socket } from '../services/socket';
import InfoPanel from '../components/InfoPanel';
import ErrorState from '../components/ErrorState';


import { Search, Filter, X } from 'lucide-react';

const BUILDING_TYPES = ['House', 'Office', 'Temple', 'School', 'College', 'Retail', 'Service', 'Hotel/Restaurant', 'Manufacturing', 'Private Hospital', 'Bank'];

export default function Buildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('all');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 50;

  const load = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { limit: String(limit), offset: String(page * limit) };
      if (ward !== 'all') params.ward = ward;
      if (type !== 'all') params.type = type;
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      if (sort !== 'newest') params.sort = sort;
      
      const res = await api.getBuildings(params);
      setBuildings(prev => isLoadMore ? [...prev, ...res.data] : res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      if (!isLoadMore) setLoading(false);
    }
  }, [ward, type, status, search, sort, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(page > 0); }, [load, page]);
  useEffect(() => {
    const onShow = (buildingId: string) => setSelected(buildingId);
    socket.on('dashboard:show_building', onShow);
    return () => { socket.off('dashboard:show_building', onShow); };
  }, []);

  return (
    <>
      <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
        <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold text-white tracking-tight">Buildings</h2>
            <button className="text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="px-5 py-4 space-y-3 shrink-0">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search buildings..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] transition-colors shadow-inner"
              />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${showFilters ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
              >
                <Filter size={14} />
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2">
                <select
                  value={type}
                  onChange={e => { setType(e.target.value); setPage(0); }}
                  className="bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={ward}
                  onChange={e => { setWard(e.target.value); setPage(0); }}
                  className="bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Zones</option>
                  {['65', '66', '67', '68'].map(w => <option key={w} value={w}>Zone {w}</option>)}
                </select>
                <select 
                  value={status}
                  onChange={e => { setStatus(e.target.value); setPage(0); }}
                  className="bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-1 border-t border-[var(--glass-border)] mt-3">
              <span className="text-[10px] text-[var(--text-secondary)]">{total} buildings found</span>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(0); }}
                className="bg-transparent text-label cursor-pointer hover:text-white outline-none appearance-none text-right"
              >
                <option value="newest">Sort: Newest ⌄</option>
                <option value="id">Sort: ID ⌄</option>
              </select>
            </div>
          </div>

          {/* Card List */}
          <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-2">
            {error ? (
              <ErrorState message={error.message} onRetry={() => load(false)} />
            ) : loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-[var(--panel-bg)] rounded-xl animate-pulse" />
              ))
            ) : buildings.map(b => {
              const isSelected = selected === b.bldg_id;
              const isOperational = b.operational_status === 'Operational';
              
              return (
                <div
                  key={b.bldg_id}
                  onClick={() => {
                    setSelected(b.bldg_id);
                    socket.emit('dashboard:fly_to', b.bldg_id);
                  }}
                  className={`flex gap-3 p-2 rounded-xl border transition-all cursor-pointer select-none
                    ${isSelected 
                      ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent border-[var(--accent-light)] shadow-[0_0_15px_var(--accent-glow)]' 
                      : 'bg-[var(--panel-bg)] border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-white/5'
                    }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/></svg>
                  </div>
                  <div className="flex flex-col justify-center flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-semibold text-white tracking-wide">{b.bldg_id}</h3>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{b.sub_class || 'Unknown Type'}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {b.locality || `Zone ${b.ward_no}`}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="text-[9px] font-medium text-[var(--text-secondary)]">
                          {b.operational_status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!loading && buildings.length < total && (
              <button 
                onClick={() => setPage(p => p + 1)}
                className="w-full py-3 mt-4 mb-2 text-[11px] font-medium text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-dashed border-[var(--glass-border)]"
              >
                Load More
              </button>
            )}
          </div>

        </div>
      </div>

      <InfoPanel buildingId={selected} onClose={() => setSelected(null)} />


    </>
  );
}
