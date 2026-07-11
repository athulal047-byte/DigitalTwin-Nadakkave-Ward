import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Failed to load module data.', onRetry }: Props) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 gap-3 text-center h-full">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-white tracking-tight">Data Unavailable</h3>
      <p className="text-[11px] text-[var(--text-secondary)] max-w-[250px] leading-relaxed text-balance">
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-[var(--panel-bg)] hover:bg-white/10 border border-[var(--glass-border)] rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-all group"
        >
          <RefreshCw size={14} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
          Retry Connection
        </button>
      )}
    </div>
  );
}
