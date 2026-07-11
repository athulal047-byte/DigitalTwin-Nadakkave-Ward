import { useEffect, useState } from 'react';
import { api } from '../services/api';
import HealthScoreWidget from '../components/admin/HealthScoreWidget';
import ActivityFeedWidget from '../components/admin/ActivityFeedWidget';
import DepartmentPerformanceWidget from '../components/admin/DepartmentPerformanceWidget';
import PlatformHealthWidget from '../components/admin/PlatformHealthWidget';
import WardStatusWidget from '../components/admin/WardStatusWidget';
import QuickActionsWidget from '../components/admin/QuickActionsWidget';
import TodaySummaryWidget from '../components/admin/TodaySummaryWidget';
import CriticalEventsWidget from '../components/admin/CriticalEventsWidget';
import { Settings, Save } from 'lucide-react';

export default function AdminDashboard() {
  const [healthScore, setHealthScore] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [deptPerf, setDeptPerf] = useState<any[]>([]);
  const [platformHealth, setPlatformHealth] = useState<any>(null);
  const [wardStatus, setWardStatus] = useState<any[]>([]);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [criticalEvents, setCriticalEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Customization state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layout, setLayout] = useState<string[]>(['healthScore', 'platformHealth', 'quickActions', 'todaySummary', 'deptPerf', 'wardStatus', 'activityFeed', 'criticalEvents']);

  useEffect(() => {
    Promise.all([
      api.getAdminHealthScore().catch(() => null),
      api.getAdminActivities().catch(() => []),
      api.getAdminDeptPerformance().catch(() => []),
      api.getAdminPlatformHealth().catch(() => null),
      api.getAdminWardStatus().catch(() => []),
      api.getAdminTodaySummary().catch(() => null),
      api.getAdminCriticalEvents().catch(() => []),
      api.getAdminPreferences().catch(() => ({ widget_order: [] }))
    ])
    .then(([healthRes, actRes, deptRes, sysRes, wardRes, summaryRes, critRes, prefRes]) => {
      setHealthScore(healthRes);
      setActivities(actRes);
      setDeptPerf(deptRes);
      setPlatformHealth(sysRes);
      setWardStatus(wardRes);
      setTodaySummary(summaryRes);
      setCriticalEvents(critRes);
      
      if (prefRes?.widget_order && prefRes.widget_order.length > 0) {
        setLayout(prefRes.widget_order);
      }
    })
    .finally(() => setLoading(false));
  }, []);

  const saveLayout = async () => {
    setIsCustomizing(false);
    try {
      await api.saveAdminPreferences({ widget_order: layout });
    } catch(e) {
      console.error(e);
    }
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newL = [...layout];
    const temp = newL[idx];
    newL[idx] = newL[idx-1];
    newL[idx-1] = temp;
    setLayout(newL);
  };

  if (loading) {
    return (
      <div className="absolute inset-0 pointer-events-none p-6 pt-24 grid grid-cols-12 gap-6 opacity-50">
        <div className="col-span-12 lg:col-span-8 animate-pulse bg-[var(--panel-bg)] rounded-2xl" />
        <div className="col-span-12 lg:col-span-4 animate-pulse bg-[var(--panel-bg)] rounded-2xl" />
      </div>
    );
  }

  // Render mapper
  const renderWidget = (id: string) => {
    switch(id) {
      case 'healthScore':
        return (
          <div className="lg:col-span-4" key={id}>
            <HealthScoreWidget data={healthScore} />
          </div>
        );
      case 'platformHealth':
        return (
          <div className="lg:col-span-4" key={id}>
            <PlatformHealthWidget health={platformHealth} />
          </div>
        );
      case 'quickActions':
        return (
          <div className="lg:col-span-4" key={id}>
            <QuickActionsWidget />
          </div>
        );
      case 'todaySummary':
        return (
          <div className="lg:col-span-12" key={id}>
            <TodaySummaryWidget summary={todaySummary} />
          </div>
        );
      case 'deptPerf':
        return (
          <div className="lg:col-span-8" key={id}>
            <DepartmentPerformanceWidget depts={deptPerf} />
          </div>
        );
      case 'wardStatus':
        return (
          <div className="lg:col-span-4 h-[400px]" key={id}>
            <WardStatusWidget wards={wardStatus} />
          </div>
        );
      case 'activityFeed':
        return (
          <div className="lg:col-span-8 h-[500px]" key={id}>
            <ActivityFeedWidget activities={activities} />
          </div>
        );
      case 'criticalEvents':
        return (
          <div className="lg:col-span-4 h-[500px]" key={id}>
            <CriticalEventsWidget events={criticalEvents} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none pt-24 p-6 pr-8 overflow-y-auto no-scrollbar">
      <div className="pointer-events-auto max-w-[1400px] mx-auto space-y-6 pb-12">
        
        <div className="flex justify-between items-center bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
          <h2 className="text-xl font-bold text-white">Enterprise Admin Center</h2>
          <div className="flex gap-2">
            {isCustomizing ? (
              <button onClick={saveLayout} className="btn-primary flex items-center gap-2">
                <Save size={16}/> Save Layout
              </button>
            ) : (
              <button onClick={() => setIsCustomizing(true)} className="btn-secondary flex items-center gap-2">
                <Settings size={16}/> Customize
              </button>
            )}
          </div>
        </div>

        {isCustomizing && (
          <div className="bg-sky-500/20 border border-sky-500/50 p-4 rounded-xl text-sky-100 flex gap-4 overflow-x-auto">
            <span className="font-bold shrink-0">Layout Editor:</span>
            {layout.map((item, idx) => (
              <div key={item} className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full cursor-pointer hover:bg-white/10" onClick={() => moveUp(idx)}>
                {item} <span className="text-xs opacity-50">&lt; Move Left</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {layout.map(id => renderWidget(id))}
        </div>

      </div>
    </div>
  );
}
