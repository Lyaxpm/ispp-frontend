"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/components/providers";

const routeTitles: { prefix: string; title: string }[] = [
  { prefix: "/customers", title: "Pelanggan" },
  { prefix: "/packages", title: "Paket Layanan" },
  { prefix: "/perangkat", title: "Perangkat NAS / Router" },
  { prefix: "/users", title: "Pengguna" },
  { prefix: "/billing", title: "Tagihan" },
  { prefix: "/noc", title: "NOC & Jaringan" },
  { prefix: "/gis", title: "Peta GIS" },
  { prefix: "/olt", title: "OLT / FTTH" },
  { prefix: "/tickets", title: "Tiket" },
  { prefix: "/inventory", title: "Inventaris" },
  { prefix: "/settings", title: "Pengaturan" },
  { prefix: "/dashboard", title: "Dashboard" },
];

function titleFor(pathname: string): string {
  return routeTitles.find((r) => pathname.startsWith(r.prefix))?.title ?? "Dashboard";
}

/**
 * Layout dashboard: guard sisi-klien (token di localStorage, bukan cookie —
 * middleware tidak bisa membaca localStorage). Redirect ke /login bila
 * tidak terautentikasi.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={titleFor(pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
