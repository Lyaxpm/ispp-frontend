"use client";

import { LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function Topbar({ title, onMenuClick, searchPlaceholder, searchValue, onSearchChange }: TopbarProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-700/60 bg-slate-900/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Buka menu navigasi"
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="truncate text-lg font-semibold text-slate-50">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {onSearchChange && (
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              type="search"
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? "Cari..."}
              className="h-10 w-56 rounded-lg border border-slate-700 bg-slate-800/60 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:w-72"
            />
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Keluar" title="Keluar">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
