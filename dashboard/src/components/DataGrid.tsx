import { Database } from 'lucide-react';

interface DataGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  loading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (row: any) => void;
  selectedId?: string | null;
  idField?: string;
}

export default function DataGrid({ data, loading, onRowClick, selectedId, idField }: DataGridProps) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-[11px] min-w-max">
          <thead>
            <tr className="border-b border-[var(--glass-border)]">
              {[...Array(6)].map((_, i) => (
                <th key={i} className="text-left px-4 py-3">
                  <div className="h-2.5 w-16 bg-[var(--glass-highlight)] rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="border-b border-[var(--glass-border)]">
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-3 bg-white/5 rounded animate-pulse" style={{ width: `${40 + (j % 3) * 15}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-60">
        <Database size={24} className="text-[var(--text-muted)] mb-1 animate-glass-pulse" />
        <p className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide uppercase">No data available</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-[11px] min-w-max">
        <thead className="sticky top-0 bg-[var(--panel-bg)] z-10">
          <tr className="border-b border-[var(--glass-border)]">
            {columns.map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                {h.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isSelected = idField && selectedId === row[idField];
            return (
              <tr
                key={i}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-[var(--glass-border)] transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${
                  isSelected ? 'bg-[var(--accent-glow)]/30 shadow-[inset_2px_0_0_var(--accent-primary)]' : 'hover:bg-[var(--glass-highlight)]'
                }`}
              >
                {columns.map((col, j) => {
                  const val = row[col];
                  return (
                    <td key={j} className={`px-4 py-2.5 whitespace-nowrap ${j === 0 ? 'font-mono text-[var(--accent-light)]' : 'text-[var(--text-secondary)]'}`}>
                      {val === null || val === undefined || val === '' ? '—' : String(val)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
