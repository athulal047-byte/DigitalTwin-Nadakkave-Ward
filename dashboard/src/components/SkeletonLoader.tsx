export default function SkeletonLoader() {
  return (
    <div className="w-full flex flex-col gap-2 p-5 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="h-12 w-full bg-[var(--panel-bg)] rounded-xl border border-[var(--glass-border)] opacity-50"
        />
      ))}
    </div>
  );
}
