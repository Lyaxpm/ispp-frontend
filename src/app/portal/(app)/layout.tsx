"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Receipt, Ticket, UserRound, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerAuthProvider, useCustomerAuth } from "@/components/customer-provider";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: Home },
  { href: "/portal/tagihan", label: "Tagihan", icon: Receipt },
  { href: "/portal/tiket", label: "Tiket", icon: Ticket },
  { href: "/portal/profil", label: "Profil", icon: UserRound },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/portal") return pathname === "/portal";
  return pathname.startsWith(href);
}

function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/portal/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700/60 bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-brand-600 p-1.5">
              <Zap className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-50">Portal Pelanggan</p>
              <p className="max-w-[180px] truncate text-[11px] text-slate-500 sm:max-w-none">
                {customer?.name ?? "-"}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Keluar
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6" aria-label="Navigasi portal">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-500 text-brand-300"
                    : "border-transparent text-slate-400 hover:text-slate-100"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      <footer className="border-t border-slate-700/60 py-4">
        <p className="text-center text-xs text-slate-600">
          Portal Pelanggan — ISP Manager. Butuh bantuan? Hubungi layanan pelanggan.
        </p>
      </footer>
    </div>
  );
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <PortalShell>{children}</PortalShell>
    </CustomerAuthProvider>
  );
}
