import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconTone?: "emerald" | "amber" | "red" | "blue" | "purple";
  onClick?: () => void;
}

const toneBg: Record<NonNullable<StatCardProps["iconTone"]>, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400",
  amber: "bg-amber-500/15 text-amber-400",
  red: "bg-red-500/15 text-red-400",
  blue: "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
};

export function StatCard({ title, value, subtitle, icon: Icon, iconTone = "emerald", onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn("p-5", onClick && "cursor-pointer transition-colors hover:border-slate-600")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-50">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5", toneBg[iconTone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
