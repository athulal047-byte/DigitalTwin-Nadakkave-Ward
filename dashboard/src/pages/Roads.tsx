import { useEffect, useState, useCallback } from 'react';
import type { Road } from '../types';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Search, Filter, X, Route as RouteIcon } from 'lucide-react';
import RoadPanel from '../components/RoadPanel';
import ErrorState from '../components/ErrorState';

const ROAD_TYPES = ['National Highway', 'State Highway', 'MDR', 'ODR', 'Village road', 'Urban Road'];

export default function Roads() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('road_id');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 50;

  const loadData = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { limit: String(limit), offset: String(page * limit) };
      if (type !== 'all') params.type = type;
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      if (sort !== 'road_id') params.sort = sort;
      
      const res = await api.getRoads(params);
      setRoads(prev => isLoadMore ? [...prev, ...res.data] : res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      if (!isLoadMore) setLoading(false);
    }
  }, [type, status, search, sort, page]);

  useEffect(() => { loadData(page > 0); }, [loadData, page]);

  return (
    <>
      <div className="absolute top-24 left-32 bottom-24 w-[420px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
        <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold text-white tracking-tight">Road Network</h2>
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
                placeholder="Search road id, name or type..."
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
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                <select
                  value={type}
                  onChange={e => { setType(e.target.value); setPage(0); }}
                  className="bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {ROAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={status}
                  onChange={e => { setStatus(e.target.value); setPage(0); }}
                  className="bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Good Condition">Good Condition</option>
                  <option value="Maintenance Due">Maintenance Due</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-1 border-t border-[var(--glass-border)] mt-3">
              <span className="text-[10px] text-[var(--text-secondary)]">{total} segments found</span>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(0); }}
                className="bg-transparent text-label cursor-pointer hover:text-white outline-none appearance-none text-right"
              >
                <option value="road_id">Sort: ID ⌄</option>
                <option value="newest">Sort: Newest ⌄</option>
                <option value="length">Sort: Length ⌄</option>
              </select>
            </div>
          </div>

          {/* Card List */}
          <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-2 no-scrollbar">
            {error ? (
              <ErrorState message={error.message} onRetry={() => loadData(false)} />
            ) : loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--panel-bg)] rounded-xl animate-pulse" />
              ))
            ) : roads.map(r => {
              const isSelected = selected === r.road_id;
              const needsMaintenance = r.maintenance_status === 'Maintenance Due';
              
              return (
                <div
                  key={r.road_id}
                  onClick={() => {
                    setSelected(r.road_id);
                    // Tell UE5 to highlight/fly to road
                    socket.emit('dashboard:fly_to', r.road_id);
                  }}
                  className={`flex gap-3 p-2 rounded-xl border transition-all cursor-pointer select-none
                    ${isSelected 
                      ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent border-[var(--accent-light)] shadow-[0_0_15px_var(--accent-glow)]' 
                      : 'bg-[var(--panel-bg)] border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-white/5'
                    }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center shrink-0">
                    <RouteIcon size={20} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-semibold text-white tracking-wide truncate pr-2">{r.road_name || `Road Segment ${r.road_id}`}</h3>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] shrink-0">{r.road_id}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">{r.sub_class || 'Public Road'}</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-[9px] text-[var(--text-muted)]">
                        Length: {Number(r.shape_length_m).toFixed(1)}m
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${needsMaintenance ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-[9px] font-medium text-[var(--text-secondary)]">
                          {r.maintenance_status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!loading && roads.length < total && (
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

      <RoadPanel road={roads.find(r => r.road_id === selected) || null} onClose={() => setSelected(null)} />
    </>
  );
}
