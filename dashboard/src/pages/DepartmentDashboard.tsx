import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Map, Briefcase, AlertCircle, Box, Navigation, Users, Clock, DollarSign, Activity } from 'lucide-react';

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const department = user?.department || 'electricity_dept';
  
  const [kpis, setKpis] = useState<any>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<any[]>([]);
  const [teamWorkload, setTeamWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDeptDashboard(department).catch(() => null),
      api.getDeptWorkOrders(department).catch(() => []),
      api.getDeptAssets(department).catch(() => []),
      api.getWorkflowStatus(department).catch(() => []),
      api.getTeamWorkload(department).catch(() => []),
      api.getDepartmentKPIs(department).catch(() => null)
    ])
    .then(([kRes, wRes, aRes, wsRes, tRes, kpiRes]) => {
      setKpis({ ...kRes, ...kpiRes });
      setWorkOrders(wRes);
      setAssets(aRes);
      setWorkflowStatus(wsRes);
      setTeamWorkload(tRes);
    })
    .finally(() => setLoading(false));
  }, [department]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('workOrderId', id);
  };

  const handleDrop = async (e: React.DragEvent, newStatusName: string, newStatusId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('workOrderId');
    const updated = workOrders.map(wo => wo.work_order_id === id ? { ...wo, status: newStatusName } : wo);
    setWorkOrders(updated);
    try {
      await api.updateWorkOrderDynamicStatus(id, newStatusId, newStatusName);
    } catch(err: any) {
      alert("Transition failed: " + err.message);
      // Revert on failure (simplified)
      api.getDeptWorkOrders(department).then(setWorkOrders);
    }
  };

  const locateIn3D = (assetId: string) => {
    console.log('socket.emit(ue5_highlight_asset)', { asset_id: assetId });
  };
  
  const openWorkOrderUE5 = (woId: string, assetId: string) => {
    console.log('socket.emit(ue5_open_work_order)', { work_order_id: woId, asset_id: assetId });
  };

  if (loading) {
    return (
      <div className="absolute inset-0 pointer-events-none p-6 pt-24 opacity-50">
        <div className="animate-pulse bg-[var(--panel-bg)] rounded-2xl h-64 mb-6" />
        <div className="animate-pulse bg-[var(--panel-bg)] rounded-2xl h-96" />
      </div>
    );
  }

  // Fallback if DB doesn't have statuses yet
  const displayStatuses = workflowStatus.length > 0 ? workflowStatus : [
    { status_name: 'draft', display_name: 'Draft' },
    { status_name: 'in_progress', display_name: 'In Progress' },
    { status_name: 'completed', display_name: 'Completed' }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none pt-24 p-6 pr-8 overflow-y-auto no-scrollbar">
      <div className="pointer-events-auto max-w-[1600px] mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
          <h2 className="text-xl font-bold text-white capitalize">{department.replace('_', ' ')} Command Center</h2>
          <div className="text-sm text-[var(--text-secondary)] flex gap-4">
            <span>MTTR: <strong className="text-white">{kpis?.avg_resolution_time_hrs ? Number(kpis.avg_resolution_time_hrs).toFixed(1) + ' hrs' : 'N/A'}</strong></span>
            <span>Total WO: <strong className="text-white">{kpis?.total_orders || 0}</strong></span>
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
            <div><div className="text-xs text-[var(--text-secondary)]">Pending Work</div><div className="text-2xl font-bold text-white mt-1">{kpis?.pending_work_orders || 0}</div></div>
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400"><Briefcase size={18}/></div>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
            <div><div className="text-xs text-[var(--text-secondary)]">Critical Alerts</div><div className="text-2xl font-bold text-white mt-1">{kpis?.critical_alerts || 0}</div></div>
            <div className="p-3 rounded-full bg-red-500/20 text-red-400"><AlertCircle size={18}/></div>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
            <div><div className="text-xs text-[var(--text-secondary)]">Avg Cost / WO</div><div className="text-2xl font-bold text-white mt-1">₹ {kpis?.avg_cost || '0.00'}</div></div>
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400"><DollarSign size={18}/></div>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
            <div><div className="text-xs text-[var(--text-secondary)]">SLA Compliance</div><div className="text-2xl font-bold text-white mt-1">{kpis?.sla_compliance || '100%'}</div></div>
            <div className="p-3 rounded-full bg-sky-500/20 text-sky-400"><Clock size={18}/></div>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
            <div><div className="text-xs text-[var(--text-secondary)]">Fleet / Assets</div><div className="text-2xl font-bold text-white mt-1">{kpis?.total_assets || 0}</div></div>
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-400"><Box size={18}/></div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[750px]">
          
          {/* Dynamic Kanban Board */}
          <div className="xl:col-span-9 glass-panel rounded-2xl p-6 flex flex-col h-full overflow-hidden">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-sky-400"/> Dynamic Work Order Workflow
            </h3>
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {displayStatuses.map(status => (
                <div 
                  key={status.status_id || status.status_name}
                  className="min-w-[300px] w-[300px] bg-black/30 rounded-xl p-4 overflow-y-auto flex flex-col gap-3 border border-white/5 no-scrollbar"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, status.status_name, status.status_id)}
                >
                  <h4 className="text-sm font-semibold text-white capitalize mb-2 flex items-center justify-between">
                    <span>{status.display_name}</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{workOrders.filter(wo => wo.status === status.status_name).length}</span>
                  </h4>
                  {workOrders.filter(wo => wo.status === status.status_name).map(wo => (
                    <div 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, wo.work_order_id)}
                      key={wo.work_order_id} 
                      className="bg-white/5 border border-white/10 rounded-lg p-4 cursor-grab hover:bg-white/10 transition-colors shadow-lg"
                    >
                      <div className="text-xs flex justify-between items-start mb-2">
                        <span className={`text-[var(--text-secondary)] font-mono`}>{wo.wo_number || `WO-${wo.work_order_id.toString().substring(0,6)}`}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${wo.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : wo.priority === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>
                          {wo.priority}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white mb-2">{wo.title}</div>
                      {wo.emergency_flag && <div className="text-xs text-red-400 mb-2 font-bold animate-pulse">EMERGENCY</div>}
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="text-xs text-[var(--text-secondary)]">
                          {wo.assigned_team || 'Unassigned'}
                        </div>
                        <button 
                          onClick={() => openWorkOrderUE5(wo.work_order_id, wo.asset_id)}
                          className="bg-white/5 hover:bg-sky-500/20 text-sky-300 py-1 px-2 text-[10px] rounded transition-colors"
                        >
                          UE5 View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Team Workload & Master Assets */}
          <div className="xl:col-span-3 flex flex-col gap-6 h-full">
            
            {/* Team Workload Widget */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col h-[40%]">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-emerald-400"/> Team Workload
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                {teamWorkload.length === 0 ? <div className="text-sm text-[var(--text-secondary)]">No active staff</div> : teamWorkload.map(user => (
                  <div key={user.user_id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-white">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{user.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-sky-400">{user.active_tasks} Open WOs</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">{user.hours_today || 0} hrs today</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Asset Registry Sidebar */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col h-[60%]">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Map size={20} className="text-emerald-400"/> Master Assets
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                {assets.length === 0 ? (
                  <div className="text-sm text-[var(--text-secondary)] text-center mt-10">No assets registered</div>
                ) : assets.map(a => (
                  <div key={a.asset_id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-white">{a.asset_name}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{a.asset_code}</p>
                      </div>
                      <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${a.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => locateIn3D(a.asset_id)} className="w-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 py-1.5 text-xs rounded-lg flex justify-center items-center gap-1 transition-colors">
                        <Navigation size={12}/> Highlight 3D
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
