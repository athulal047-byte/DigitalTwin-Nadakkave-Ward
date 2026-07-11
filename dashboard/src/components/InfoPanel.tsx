import { useEffect, useState } from 'react';
import type { Building } from '../types';
import { api } from '../services/api';
import { 
  X, Star, Share, Building2, CheckCircle2,
  User, Droplets, Zap, Waves, FileText, 
  ClipboardCheck, Clock, FileBadge
} from 'lucide-react';

interface Props {
  buildingId: string | null;
  onClose: () => void;
  className?: string;
}

const TABS = [
  'General', 'Owner', 'Utilities', 'Taxes', 'Bills', 
  'Complaints', 'Inspections', 'History', 'Documents'
];

export default function InfoPanel({ 
  buildingId, 
  onClose,
  className = "absolute top-24 right-6 bottom-24 w-[460px] glass-panel flex flex-col pointer-events-auto shadow-2xl z-50 transition-all duration-300"
}: Props) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [owner, setOwner] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('General');

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    
    Promise.all([
      api.getBuilding(buildingId),
      api.getBuildingOwner(buildingId).catch(() => []),
      api.getBuildingTaxes(buildingId).catch(() => []),
      api.getBuildingBills(buildingId).catch(() => []),
      api.getBuildingGrievances(buildingId).catch(() => []),
      api.getBuildingInspections(buildingId).catch(() => [])
    ])
    .then(([bRes, oRes, tRes, billsRes, gRes, iRes]) => {
      setBuilding(bRes);
      setOwner(oRes);
      setTaxes(tRes);
      setBills(billsRes);
      setGrievances(gRes);
      setInspections(iRes);
    })
    .finally(() => setLoading(false));
  }, [buildingId]);

  if (!buildingId) return null;

  const isOperational = building?.operational_status === 'Operational';
  const primaryOwner = owner.length > 0 ? owner[0] : null;

  return (
    <div className={className}>
      {/* Header */}
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[var(--glass-border)] bg-black/20 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Building {building?.bldg_id ?? buildingId}</h2>
            <p className="text-[10px] text-[var(--text-secondary)] leading-tight">{building?.locality || `Ward ${building?.ward_no}`}</p>
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
              <div className="relative w-full h-40 rounded-xl shrink-0 border border-white/10 glass-panel flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent shadow-inner">
                <Building2 size={48} className="text-white/20" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors">
                    <Star size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors">
                    <Share size={14} />
                  </button>
                </div>
                {/* Status Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                  <div className={`w-2 h-2 rounded-full ${isOperational ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-[10px] font-medium text-white">{building?.operational_status || 'Unknown'}</span>
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
                    <span className="text-label mb-1">Building Type</span>
                    <div className="text-white font-medium text-sm">{building?.sub_class || 'Commercial'}</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Usage</span>
                    <div className="text-white font-medium text-sm">{building?.bldng_usage || '—'}</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Total Floors</span>
                    <div className="text-white font-medium text-lg">{building?.no_floors || '—'}</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl">
                    <span className="text-label mb-1">Height (m)</span>
                    <div className="text-white font-medium text-lg">{building?.height_m ? `${building.height_m} m` : '—'}</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-label mb-1">Total Footprint Area</span>
                      <div className="text-white font-medium text-lg">{building?.footprint_m2 ? `${Number(building.footprint_m2).toLocaleString()} m²` : '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── OWNER TAB ─── */}
              {tab === 'Owner' && (
                <div className="space-y-4">
                  {primaryOwner ? (
                    <div className="glass-panel p-5 rounded-xl space-y-4">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10">
                          <User size={24} className="text-sky-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{primaryOwner.owner_name}</h3>
                          <p className="text-[11px] text-[var(--text-secondary)]">{primaryOwner.ownership_type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                        <div><span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Phone</span><span className="text-xs text-white">{primaryOwner.phone}</span></div>
                        <div><span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Email</span><span className="text-xs text-white">{primaryOwner.email}</span></div>
                        <div><span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Father's Name</span><span className="text-xs text-white">{primaryOwner.father_name}</span></div>
                        <div><span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Since</span><span className="text-xs text-white">{new Date(primaryOwner.since_date).toLocaleDateString()}</span></div>
                        <div className="col-span-2"><span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Registered Address</span><span className="text-xs text-white">{primaryOwner.address || 'Same as property'}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-[var(--text-muted)] text-xs glass-panel rounded-xl">No ownership records found.</div>
                  )}
                </div>
              )}

              {/* ─── UTILITIES TAB ─── */}
              {tab === 'Utilities' && (
                <div className="space-y-3">
                  <div className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-sky-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400"><Droplets size={20} /></div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Water Supply</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">Connection Status</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded ${building?.water_connection === '1' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {building?.water_connection === '1' ? 'Active' : 'No Connection'}
                    </span>
                  </div>

                  <div className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Zap size={20} /></div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Electricity</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">Connection Status</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded ${building?.electricity_connection === '1' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {building?.electricity_connection === '1' ? 'Active' : 'No Connection'}
                    </span>
                  </div>

                  <div className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400"><Waves size={20} /></div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Sewerage</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">Connection Status</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded ${building?.sewer_connection === '1' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {building?.sewer_connection === '1' ? 'Active' : 'No Connection'}
                    </span>
                  </div>
                </div>
              )}

              {/* ─── TAXES TAB ─── */}
              {tab === 'Taxes' && (
                <div className="space-y-3">
                  {taxes.length > 0 ? taxes.map(tax => (
                    <div key={tax.tax_id} className="glass-panel p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">{tax.tax_type.replace('_', ' ')}</span>
                          <p className="text-[10px] text-[var(--text-secondary)]">FY {tax.financial_year}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                          tax.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          tax.status === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {tax.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Total Amount</span>
                          <span className="text-sm font-semibold text-white">₹{Number(tax.amount).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[var(--text-muted)] block">Due Date</span>
                          <span className="text-xs text-white">{new Date(tax.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-[var(--text-muted)] text-xs glass-panel rounded-xl">No tax records found.</div>
                  )}
                </div>
              )}

              {/* ─── BILLS TAB ─── */}
              {tab === 'Bills' && (
                <div className="space-y-3">
                  {bills.length > 0 ? bills.map(bill => (
                    <div key={bill.bill_id} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          bill.utility_type === 'water' ? 'bg-sky-500/10 text-sky-400' :
                          bill.utility_type === 'electricity' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-violet-500/10 text-violet-400'
                        }`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white capitalize">{bill.utility_type} Bill</h4>
                          <p className="text-[10px] text-[var(--text-secondary)]">Month: {bill.bill_month} • Mtr: {bill.meter_no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white mb-1">₹{Number(bill.bill_amount).toLocaleString()}</div>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                          bill.status === 'paid' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                        }`}>
                          {bill.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-[var(--text-muted)] text-xs glass-panel rounded-xl">No utility bills found.</div>
                  )}
                </div>
              )}

              {/* ─── COMPLAINTS TAB ─── */}
              {tab === 'Complaints' && (
                <div className="space-y-3">
                  {grievances.length > 0 ? grievances.map(g => (
                    <div key={g.grievance_id} className="glass-panel p-4 rounded-xl border-l-2 border-l-red-500">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-[var(--text-secondary)] border border-white/10">{g.ticket_no}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">{new Date(g.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white mb-1 leading-tight">{g.subject}</h4>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-sky-400">{g.department}</span>
                        <span className="text-[10px] font-medium uppercase text-red-400">{g.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-[var(--text-muted)] text-xs glass-panel rounded-xl flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-emerald-500/50" />
                      No active complaints or grievances.
                    </div>
                  )}
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
                      <Clock size={24} className="text-sky-500/30" />
                      No inspections on record.
                    </div>
                  )}
                </div>
              )}

              {/* ─── HISTORY & DOCUMENTS TABS ─── */}
              {(tab === 'History' || tab === 'Documents') && (
                <div className="text-center py-16 text-[var(--text-muted)] text-xs glass-panel rounded-xl border border-dashed border-white/10 flex flex-col items-center gap-3">
                  <FileBadge size={32} className="text-white/10" />
                  No {tab.toLowerCase()} available for this property yet.
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}