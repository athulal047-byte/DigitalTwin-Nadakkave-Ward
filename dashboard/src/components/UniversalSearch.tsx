import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface SearchResult {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string;
  icon?: string;
  score: number;
}

const UniversalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (q: string) => {
    setIsLoading(true);
    try {
      // API call to the FTS endpoint
      const response = await api.get<{ data: { results: SearchResult[] } }>(`/api/v1/digital-twin/search?q=${encodeURIComponent(q)}`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // Open Universal Object Panel (can dispatch event or update context)
    console.log(`Opened panel for ${result.entity_type}: ${result.entity_id}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center glass-panel px-4 py-2 rounded-lg">
        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input
          type="text"
          className="bg-transparent outline-none w-64 text-sm"
          placeholder="Universal Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (query.length > 2 || results.length > 0) && (
        <div className="absolute top-full mt-2 w-full glass-panel rounded-lg shadow-xl z-50 overflow-hidden">
          {isLoading && <div className="p-4 text-center text-sm text-gray-400">Searching...</div>}
          
          {!isLoading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-400">No results found</div>
          )}

          {!isLoading && results.map((res, i) => (
            <div 
              key={`${res.entity_id}-${i}`}
              className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0"
              onClick={() => handleSelectResult(res)}
            >
              <div className="font-medium text-sm">{res.title}</div>
              <div className="text-xs text-gray-400 flex justify-between mt-1">
                <span>{res.subtitle}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase">{res.entity_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
