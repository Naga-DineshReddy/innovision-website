export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--bg-card)] ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="w-full h-48 bg-[var(--bg-card)] rounded-xl mb-4" />
      <div className="h-5 bg-[var(--bg-card)] rounded-lg w-3/4 mb-3" />
      <div className="h-4 bg-[var(--bg-card)] rounded-lg w-full mb-2" />
      <div className="h-4 bg-[var(--bg-card)] rounded-lg w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-[var(--bg-card)] rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-[var(--bg-card)] rounded-xl" />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-[var(--bg-card)] rounded-lg w-1/2 mb-3" />
      <div className="h-8 bg-[var(--bg-card)] rounded-lg w-1/3" />
    </div>
  );
}
