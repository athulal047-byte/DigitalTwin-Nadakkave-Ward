
// Mock components for widgets
const SystemHealthWidget = () => <div className="p-4 text-sm">System Health: Normal</div>;
const EventFeedWidget = () => <div className="p-4 text-sm">Live Event Feed...</div>;
const AlertFeedWidget = () => <div className="p-4 text-sm">Critical Alerts: 0</div>;
const TimelinePlaybackWidget = () => <div className="p-4 text-sm">Timeline Playback controls</div>;
const GISManagerWidget = () => <div className="p-4 text-sm">GIS Layers</div>;

const widgetMap: Record<string, React.FC<any>> = {
  SystemHealthWidget,
  EventFeedWidget,
  AlertFeedWidget,
  TimelinePlaybackWidget,
  GISManagerWidget
};

export const WidgetRegistry = {
  getWidget: (key: string) => {
    return widgetMap[key] || (() => <div className="p-4 text-red-500">Widget not found: {key}</div>);
  }
};
