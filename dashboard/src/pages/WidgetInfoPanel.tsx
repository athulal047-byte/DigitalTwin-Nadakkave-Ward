import { useParams, useNavigate } from 'react-router-dom';
import InfoPanel from '../components/InfoPanel';

/**
 * Standalone page that renders ONLY the InfoPanel component.
 * Loaded by a right-side Web Browser widget inside WB_3DView.
 * URL: index.html#/widget/infopanel/<building_id>
 */
export default function WidgetInfoPanel() {
  const { id } = useParams();
  const navigate = useNavigate();

  // If no building ID is provided, render nothing (transparent background)
  if (!id || id === 'empty') return null;

  return (
    <div className="absolute inset-0 pointer-events-none text-white overflow-hidden font-sans p-2">
      <InfoPanel 
        buildingId={id} 
        onClose={() => navigate('/widget/empty')} 
        className="w-full h-full glass-panel flex flex-col pointer-events-auto shadow-2xl z-50"
      />
    </div>
  );
}
