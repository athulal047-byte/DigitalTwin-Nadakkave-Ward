import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, AlertCircle, Map, Navigation, CreditCard, Activity, Users, FileDigit } from 'lucide-react';

export default function CitizenPortal() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<any>({ unread_notifs: 0, active_complaints: 0, pending_apps: 0, total_tax_due: 0 });
  const [properties, setProperties] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);

  const [nearbyWorks, setNearbyWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCitizenDashboard().catch(() => null),
      api.getCitizenProperties().catch(() => []),
      api.getCitizenTaxes().catch(() => [])
    ]).then(([dash, props, txs]) => {
      if (dash) setKpis(dash);
      setProperties(props as any);
      setTaxes(txs as any);

      // Fetch nearby works for the primary property
      const primary = props.find((p: any) => p.is_primary) || props[0];
      if (primary && primary.latitude) {
        api.getNearbyWorks(primary.latitude, primary.longitude).then(setNearbyWorks).catch(console.error);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handlePayTax = async (invoiceId: string, amount: number) => {
    try {
      await api.payCitizenTax(invoiceId, amount);
      alert('Payment Successful!');
      setTaxes(taxes.map(t => t.invoice_id === invoiceId ? { ...t, status: 'Paid' } : t));
      setKpis({ ...kpis, total_tax_due: kpis.total_tax_due - amount });
    } catch(e: any) {
      alert('Payment Failed: ' + e.message);
    }
  };

  const locateIn3D = (assetId: string) => {
    console.log('socket.emit(ue5_highlight_asset)', { asset_id: assetId });
    alert('Sent highlight command to Unreal Engine Digital Twin');
  };

  if (loading) return <div className="p-10 text-white">Loading Citizen Portal...</div>;

  return (
    <div className="absolute inset-0 pointer-events-none pt-24 p-6 overflow-y-auto no-scrollbar">
      <div className="pointer-events-auto max-w-[1400px] mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {user?.full_name}</h2>
            <p className="text-[var(--text-secondary)] mt-1">Smart City Citizen Command Center</p>
          </div>
          <button className="bg-sky-500/20 text-sky-400 px-4 py-2 rounded-lg font-medium hover:bg-sky-500/30 transition">
            My Profile
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-white/5">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Property Tax Due</div>
              <div className="text-2xl font-bold text-white mt-1">₹ {kpis.total_tax_due}</div>
            </div>
            <div className="p-3 rounded-full bg-red-500/20 text-red-400"><CreditCard size={20}/></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-white/5">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Active Grievances</div>
              <div className="text-2xl font-bold text-white mt-1">{kpis.active_complaints}</div>
            </div>
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400"><AlertCircle size={20}/></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-white/5">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Pending Applications</div>
              <div className="text-2xl font-bold text-white mt-1">{kpis.pending_apps}</div>
            </div>
            <div className="p-3 rounded-full bg-sky-500/20 text-sky-400"><FileText size={20}/></div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-white/5">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Unread Notifications</div>
              <div className="text-2xl font-bold text-white mt-1">{kpis.unread_notifs}</div>
            </div>
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-400"><Activity size={20}/></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Properties Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Home size={20} className="text-emerald-400"/> My Properties</h3>
            
            {properties.map(p => (
              <div key={p.relation_id} className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 bg-black/40 rounded-xl flex items-center justify-center min-h-[150px] relative overflow-hidden">
                   <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full uppercase">{p.ownership_type}</div>
                   <Map size={40} className="text-white/20"/>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white">{p.asset_name}</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Asset Code: {p.asset_code}</p>
                    <div className="flex gap-4 mt-4">
                       <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-white"><Users size={12} className="inline mr-1 text-sky-400"/> {p.family_count} Family Members</span>
                       <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-white"><FileDigit size={12} className="inline mr-1 text-amber-400"/> Primary Res</span>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => locateIn3D(p.asset_id)} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                      <Navigation size={16}/> Locate in 3D
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Nearby Works */}
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-8"><Activity size={20} className="text-amber-400"/> Neighborhood Disruptions (500m)</h3>
            <div className="glass-panel rounded-2xl p-6 border border-white/5">
               {nearbyWorks.length === 0 ? (
                 <p className="text-[var(--text-secondary)] text-sm">No active works near your properties.</p>
               ) : (
                 <div className="space-y-4">
                   {nearbyWorks.map(nw => (
                     <div key={nw.work_order_id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                       <div>
                         <h5 className="text-sm font-medium text-white">{nw.title}</h5>
                         <p className="text-xs text-[var(--text-secondary)] mt-1 capitalize">{nw.department.replace('_', ' ')} • Status: {nw.status}</p>
                       </div>
                       <button className="text-sky-400 text-xs bg-sky-500/20 px-3 py-1.5 rounded hover:bg-sky-500/30">View on Map</button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Property Tax */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5">
              <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4"><CreditCard size={18} className="text-red-400"/> Property Tax</h3>
              {taxes.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No tax records found.</p> : (
                <div className="space-y-4">
                  {taxes.map(t => (
                    <div key={t.invoice_id} className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-white">{t.financial_year}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full ${t.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</span>
                      </div>
                      <div className="text-xl font-bold text-white mb-4">₹ {t.amount_due}</div>
                      {t.status !== 'Paid' && (
                        <button onClick={() => handlePayTax(t.invoice_id, t.amount_due)} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg text-sm font-medium transition">
                          Pay Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Applications */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5">
              <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4"><FileText size={18} className="text-sky-400"/> e-Governance Services</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-left transition border border-white/5">
                  <div className="text-sm text-white font-medium">New Water Connection</div>
                </button>
                <button className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-left transition border border-white/5">
                  <div className="text-sm text-white font-medium">Trade License</div>
                </button>
                <button className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-left transition border border-white/5">
                  <div className="text-sm text-white font-medium">Building Permit</div>
                </button>
                <button className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-left transition border border-white/5">
                  <div className="text-sm text-white font-medium">Report Grievance</div>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
