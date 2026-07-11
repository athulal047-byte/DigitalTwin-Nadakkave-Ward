import { useEffect, useState } from 'react';

interface Props {
  label: string;
  value: React.ReactNode;
  sub?: string;
  color?: string;
  className?: string;
  icon?: React.ReactNode;
}

function useCountUp(end: number, duration: number = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.round(easeOutExpo(progress) * end);
      
      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export default function KPI({ label, value, sub, color = '#38bdf8', className = '', icon }: Props) {
  const isNumber = typeof value === 'number';
  const animatedValue = useCountUp(isNumber ? value as number : 0);

  return (
    <div 
      className={`bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2.5 flex flex-col h-24 hover:border-white/20 transition-colors overflow-hidden ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      <div className="flex-1 flex flex-col justify-start">
        <div 
          className="font-semibold text-[var(--text-muted)] uppercase text-balance leading-tight break-words w-full flex items-center gap-1.5"
          style={{ fontSize: 'clamp(8px, 14cqw, 11px)', letterSpacing: '0.02em' }}
        >
          {icon}
          {label}
        </div>
      </div>
      <div className="flex flex-col justify-end shrink-0">
        <div 
          className="font-bold tracking-tighter text-white leading-none break-words w-full" 
          style={{ color, fontSize: 'clamp(0.75rem, 20cqw, 1.75rem)' }}
        >
          {isNumber ? animatedValue.toLocaleString('en-IN') : value}
        </div>
        {sub && (
          <div 
            className="font-semibold text-[var(--text-muted)] mt-1 text-balance leading-tight break-words w-full"
            style={{ fontSize: 'clamp(8px, 12cqw, 10px)', letterSpacing: '0.02em' }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}