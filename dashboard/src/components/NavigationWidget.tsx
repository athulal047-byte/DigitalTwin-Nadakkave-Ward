import { Navigation2, Plus, Minus, Settings2 } from 'lucide-react';

export default function NavigationWidget() {
  return (
    <div className="flex items-end gap-4 pointer-events-auto">
      
      {/* Compass Compass */}
      <div className="w-24 h-24 glass-panel rounded-full relative flex items-center justify-center">
        {/* Cardinal Directions */}
        <div className="absolute top-2 text-[8px] font-bold text-[var(--text-muted)]">N</div>
        <div className="absolute right-2 text-[8px] font-bold text-[var(--text-muted)]">E</div>
        <div className="absolute bottom-2 text-[8px] font-bold text-[var(--text-muted)]">S</div>
        <div className="absolute left-2 text-[8px] font-bold text-[var(--text-muted)]">W</div>
        
        {/* Inner Ring */}
        <div className="w-16 h-16 rounded-full border border-[var(--glass-border)] border-dashed flex items-center justify-center">
          <Navigation2 size={24} className="text-sky-400 fill-sky-400 -rotate-45" />
        </div>
      </div>

      {/* Vertical Controls */}
      <div className="w-10 glass-panel rounded-full flex flex-col items-center py-2 gap-2">
        <button className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors rounded-full hover:bg-[var(--glass-highlight)]">
          <Plus size={16} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors rounded-full hover:bg-[var(--glass-highlight)]">
          <Minus size={16} />
        </button>
        <div className="w-6 h-px bg-[var(--glass-border)] my-1" />
        <button className="w-8 h-8 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] hover:text-white transition-colors rounded-full hover:bg-[var(--glass-highlight)]">
          2D
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors rounded-full hover:bg-[var(--glass-highlight)]">
          <Settings2 size={16} />
        </button>
      </div>

    </div>
  );
}
