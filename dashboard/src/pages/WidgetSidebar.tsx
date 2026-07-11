import Sidebar from '../components/Sidebar';

/**
 * Standalone page that renders ONLY the Sidebar component.
 * Loaded by the sidebar Web Browser widget inside WB_3DView.
 * URL: index.html#/widget/sidebar
 */
export default function WidgetSidebar() {
  return (
    <div className="absolute inset-0 pointer-events-none text-white overflow-hidden font-sans">
      <div className="absolute top-24 left-6 bottom-24 z-50 pointer-events-auto">
        <Sidebar />
      </div>
    </div>
  );
}
