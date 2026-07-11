import Topbar from '../components/Topbar';

/**
 * Standalone page that renders ONLY the Topbar component.
 * Loaded by the topbar Web Browser widget inside WB_3DView.
 * URL: index.html#/widget/topbar
 */
export default function WidgetTopbar() {
  return (
    <div className="absolute inset-0 pointer-events-none text-white overflow-hidden font-sans">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-full max-w-5xl">
        <Topbar />
      </div>
    </div>
  );
}
