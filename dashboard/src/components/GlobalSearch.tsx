import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Building2, Route as RouteIcon, User, ShieldAlert, X, ChevronRight } from 'lucide-react';
import { socket } from '../services/socket';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.globalSearch(query);
        setResults(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    if (item.type === 'building') {
      navigate('/buildings');
      setTimeout(() => {
        socket.emit('dashboard:show_building', item.id);
        socket.emit('dashboard:fly_to', item.id);
      }, 500);
    } else if (item.type === 'road') {
      navigate('/roads');
      setTimeout(() => socket.emit('dashboard:fly_to', item.id), 500);
    } else if (item.type === 'grievance') {
      navigate('/grievances');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0f172a]/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-panel-in">
        
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-white/10">
          <Search size={20} className="text-sky-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search buildings, roads, owners, or grievances..."
            className="flex-1 bg-transparent border-none text-white px-4 py-5 outline-none placeholder-[var(--text-muted)] text-lg font-light"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono text-[var(--text-muted)] bg-white/5 rounded border border-white/10">ESC</kbd>
            <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="p-4 space-y-2">
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((item, i) => (
                <button
                  key={`${item.type}-${item.id}-${i}`}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                      {item.type === 'building' ? <Building2 size={18} className="text-sky-400" /> :
                       item.type === 'road' ? <RouteIcon size={18} className="text-emerald-400" /> :
                       item.type === 'owner' ? <User size={18} className="text-violet-400" /> :
                       <ShieldAlert size={18} className="text-amber-400" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="px-4 py-12 text-center">
              <Search size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
              <h3 className="text-sm font-medium text-white mb-1">No results found</h3>
              <p className="text-xs text-[var(--text-secondary)]">We couldn't find anything matching "{query}"</p>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
              Type to start searching...
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↵</kbd>
            Select
          </span>
        </div>
      </div>
    </div>
  );
}
