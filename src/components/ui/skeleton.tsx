import * as React from "react";
import { cn } from "@/lib/utils";

/** Skeleton loading shimmer. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-700/60", className)}
      aria-hidden
      {...props}
    />
  );
}

/** Skeleton untuk kartu statistik. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

/** Skeleton untuk baris tabel. */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4" aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
