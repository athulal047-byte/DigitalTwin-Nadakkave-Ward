import { useEffect, useState } from 'react';
import { WidgetRegistry } from './WidgetRegistry';
import { api } from '../services/api';

interface WidgetConfig {
  widget_id: string;
  component_key: string;
  name: string;
}

const DashboardRenderer: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);

  useEffect(() => {
    // In production, fetch layout from /api/v1/digital-twin/dashboard/layout
    // Simulating metadata-driven load:
    const loadLayout = async () => {
      try {
        const res = await api.get<{ data: { widgets: WidgetConfig[] } }>('/api/v1/digital-twin/dashboard/layout');
        setWidgets(res.data.widgets || []);
      } catch (e) {
        // Fallback to defaults
        setWidgets([
          { widget_id: '1', component_key: 'SystemHealthWidget', name: 'Health' },
          { widget_id: '2', component_key: 'EventFeedWidget', name: 'Events' }
        ]);
      }
    };
    loadLayout();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map(w => {
        const WidgetComponent = WidgetRegistry.getWidget(w.component_key);
        return (
          <div key={w.widget_id} className="glass-panel rounded-xl overflow-hidden shadow-lg border border-white/10">
            <div className="bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 border-b border-white/5">
              {w.name}
            </div>
            <div className="h-48 overflow-y-auto custom-scrollbar">
              <WidgetComponent />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardRenderer;
