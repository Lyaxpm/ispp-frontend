"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Box,
  LayoutDashboard,
  Map as MapIcon,
  Network,
  Receipt,
  Settings,
  Ticket,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";
import { roleLabels } from "@/lib/format";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/billing", label: "Tagihan", icon: Receipt },
  { href: "/noc", label: "NOC & Jaringan", icon: Activity },
  { href: "/gis", label: "Peta GIS", icon: MapIcon },
  { href: "/olt", label: "OLT / FTTH", icon: Network },
  { href: "/tickets", label: "Tiket", icon: Ticket },
  { href: "/inventory", label: "Inventaris", icon: Box },
  { href: "/settings", label: "Pengaturan", icon: Settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-700/60 bg-slate-900 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigasi utama"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700/60 px-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-brand-600 p-1.5">
              <Zap className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-50">ISP Manager</p>
              <p className="text-[11px] text-slate-500">Billing & Network</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-600/15 text-brand-300 ring-1 ring-inset ring-brand-500/40"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/60 p-4">
          <div className="rounded-lg bg-slate-800/80 p-3">
            <p className="truncate text-sm font-medium text-slate-200">{user?.name ?? "-"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? ""}</p>
            {user && (
              <span className="mt-2 inline-block rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-inset ring-brand-500/40">
                {roleLabels[user.role] ?? user.role}
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
