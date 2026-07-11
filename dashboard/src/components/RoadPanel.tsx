import { useEffect, useState } from 'react';
import type { Road } from '../types';
import { api } from '../services/api';
import { 
  X, Route as RouteIcon, Map, Ruler, CheckCircle2, 
  AlertTriangle, ClipboardCheck, Wrench, FileBadge
} from 'lucide-react';

interface Props {
  road: Road | null;
  onClose: () => void;
  className?: string;
}

const TABS = ['General', 'Maintenance', 'Inspections', 'History', 'Documents'];

export default function RoadPanel({ 
  road, 
  onClose,
  className = "absolute top-24 right-6 bottom-24 w-[460px] glass-panel flex flex-col pointer-events-auto shadow-2xl z-50 transition-all duration-300"
}: Props) {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('General');

  useEffect(() => {
    if (!road) return;
    setLoading(true);
    
    Promise.all([
      api.getWorkOrders({ entity_type: 'road', entity_id: road.road_id }).catch(() => []),
      api.getInspections({ entity_type: 'road', entity_id: road.road_id }).catch(() => [])
    ])
    .then(([woRes, iRes]) => {
      setWorkOrders(woRes);
      setInspections(iRes);
    })
    .finally(() => setLoading(false));
  }, [road]);

  if (!road) return null;

  const length = Number(road.shape_length_m || 0);
  const needsMaintenance = road.maintenance_status === 'Maintenance Due';

  return (
    <div className={className}>
      {/* Header */}
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">{road.road_name || `Road Segment ${road.road_id}`}</h2>
            <p className="text-[10px] text-[var(--text-secondary)] leading-tight">ID: {road.road_id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full glass-panel text-[var(--text-muted)] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="p-5 animate-pulse space-y-4">
            <div className="w-full h-40 bg-[var(--panel-bg)] rounded-xl" />
            <div className="flex gap-2"><div className="h-8 w-20 bg-[var(--panel-bg)] rounded-full" /><div className="h-8 w-20 bg-[var(--panel-bg)] rounded-full" /></div>
            <div className="grid grid-cols-2 gap-3"><div className="h-20 bg-[var(--panel-bg)] rounded-xl" /><div className="h-20 bg-[var(--panel-bg)] rounded-xl" /></div>
          </div>
        ) : (
          <div className="flex flex-col">
            
            {/* Hero Section */}
            <div className="p-5 pb-0">
              <div className="relative w-full h-40 rounded-xl shrink-0 border border-white/10 glass-panel flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1541888050672-91f165a2d615?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center overflow-hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                <RouteIcon size={48} className="text-white/40 relative z-10" />
                
                {/* Status Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md z-10">
                  <div className={`w-2 h-2 rounded-full ${needsMaintenance ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-[10px] font-medium text-white">{needsMaintenance ? 'Maintenance Due' : 'Good Condition'}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Tabs */}
            <div className="px-5 mt-5">
              <div className="flex items-center gap-1.5 border-b border-[var(--glass-border)] pb-3 overflow-x-auto shrink-0 no-scrollbar">
                {TABS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border
                      ${tab === t 
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                        : 'bg-white/5 text-[var(--text-secondary)] border-transparent hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Container */}
            <div className="p-5">
              {/* ─── GENERAL TAB ─── */}
              {tab === 'General' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Road Classification</span>
                    <div className="text-white font-medium text-sm flex items-center gap-2">
                      <Map size={16} className="text-sky-400" />
                      {road.sub_class || 'Public Road'}
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Surface Type</span>
                    <div className="text-white font-medium text-sm">Tarred / Asphalt</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Length</span>
                    <div className="text-white font-medium text-lg flex items-center gap-2">
                      <Ruler size={16} className="text-emerald-400" />
                      {length.toFixed(1)} m
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Carriageway Width</span>
                    <div className="text-white font-medium text-lg">{Number(road.cw_width_m || 0).toFixed(1)} m</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl col-span-2">
                    <span className="text-label mb-1">Ownership / Maintained By</span>
                    <div className="text-white font-medium text-sm">Nadakkavu Municipality - PWD</div>
                  </div>
                </div>
              )}

              {/* ─── MAINTENANCE (Work Orders) TAB ─── */}
              {tab === 'Maintenance' && (
                <div className="space-y-3">
                  {workOrders.length > 0 ? workOrders.map(wo => (
                    <div key={wo.work_order_id} className="glass-panel p-4 rounded-xl border-l-2 border-l-amber-500">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-[var(--text-secondary)] border border-white/10">{wo.wo_number}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">{new Date(wo.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white mb-1 leading-tight">{wo.title}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2">{wo.description}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <span className="text-[10px] text-sky-400 flex items-center gap-1"><Wrench size={10} /> {wo.department}</span>
                        <span className={`text-[9px] font-bold uppercase ${wo.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {wo.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-[var(--text-muted)] text-xs glass-panel rounded-xl flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-emerald-500/50" />
                      No active or past maintenance work orders.
                    </div>
                  )}
                  <button className="w-full mt-2 py-2 border border-dashed border-white/20 text-sky-400 hover:text-sky-300 hover:bg-white/5 rounded-lg text-[10px] font-medium transition-colors">
                    + Request Maintenance
                  </button>
                </div>
              )}

              {/* ─── INSPECTIONS TAB ─── */}
              {tab === 'Inspections' && (
                <div className="space-y-3">
                  {inspections.length > 0 ? inspections.map(i => (
                    <div key={i.inspection_id} className="glass-panel p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardCheck size={16} className="text-sky-400" />
                        <span className="text-xs font-semibold text-white capitalize">{i.inspection_type.replace('_', ' ')}</span>
                        <span className="ml-auto text-[10px] text-[var(--text-muted)]">{new Date(i.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                        {i.findings || 'No findings recorded yet.'}
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white font-bold">{i.inspector_name?.charAt(0) || 'I'}</div>
                        <span className="text-[10px] text-[var(--text-secondary)]">{i.inspector_name || 'Unassigned'} • {i.department}</span>
                        {i.score && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-400">Score: {i.score}/100</span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-[var(--text-muted)] text-xs glass-panel rounded-xl flex flex-col items-center gap-2">
                      <AlertTriangle size={24} className="text-amber-500/50" />
                      No inspections on record for this segment.
                    </div>
                  )}
                  <button className="w-full mt-2 py-2 border border-dashed border-white/20 text-sky-400 hover:text-sky-300 hover:bg-white/5 rounded-lg text-[10px] font-medium transition-colors">
                    + Schedule Inspection
                  </button>
                </div>
              )}

              {/* ─── HISTORY & DOCUMENTS TABS ─── */}
              {(tab === 'History' || tab === 'Documents') && (
                <div className="text-center py-16 text-[var(--text-muted)] text-xs glass-panel rounded-xl border border-dashed border-white/10 flex flex-col items-center gap-3">
                  <FileBadge size={32} className="text-white/10" />
                  No {tab.toLowerCase()} available for this road segment yet.
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
