import * as React from "react";
import { Inbox, WifiOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** True bila kosong karena API tidak terjangkau. */
  offline?: boolean;
}

/** Tampilan kosong / API tidak terjangkau. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  offline = false,
}: EmptyStateProps) {
  const EffectiveIcon = offline ? WifiOff : Icon;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-slate-800 p-3">
        <EffectiveIcon className="h-6 w-6 text-slate-400" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
