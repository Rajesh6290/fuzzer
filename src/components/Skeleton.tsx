// Base shimmer block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg${className ? " " + className : ""}`}
      style={{ background: "var(--bg-secondary)" }}
    />
  );
}

// Stat card skeleton (matches StatsCard layout)
export function StatCardSkeleton() {
  return (
    <div className="glass-card p-3 sm:p-5 flex items-center gap-3">
      <Skeleton className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-10" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Generic list row skeleton (matches scan/report card layout)
export function RowSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        {lines >= 2 && <Skeleton className="h-3 w-3/5" />}
        {lines >= 3 && <Skeleton className="h-3 w-1/4" />}
      </div>
      <Skeleton className="h-7 w-14 rounded-lg shrink-0" />
    </div>
  );
}

// Chart placeholder skeleton
export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="glass-card p-5 flex flex-col gap-3"
      style={{ minHeight: height }}
    >
      <Skeleton className="h-4 w-32" />
      <div className="flex-1 flex items-end gap-2 pt-4">
        {[60, 80, 50, 90, 40, 70, 55].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-md animate-pulse"
            style={{ height: `${h}%`, background: "var(--bg-secondary)" }}
          />
        ))}
      </div>
    </div>
  );
}
