"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Receipt, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerStatusBadge, InvoiceStatusBadge, TicketStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { usePortalInvoices, usePortalProfile, usePortalTickets } from "@/hooks/use-portal";
import { useCustomerAuth } from "@/components/customer-provider";
import { formatDate, formatRupiah } from "@/lib/format";

export default function PortalDashboardPage() {
  const { customer } = useCustomerAuth();
  const profile = usePortalProfile();
  const invoices = usePortalInvoices();
  const tickets = usePortalTickets();

  const unpaid = (invoices.data ?? []).filter((i) => i.status === "UNPAID" || i.status === "OVERDUE");
  const unpaidTotal = unpaid.reduce((sum, i) => sum + (i.total - i.paidAmount), 0);
  const openTickets = (tickets.data ?? []).filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-50">
          Halo, {customer?.name ?? "Pelanggan"}
        </h2>
        <p className="text-sm text-slate-400">
          No. pelanggan {customer?.customerNo ?? "-"} — ringkasan layanan Anda.
        </p>
      </div>

      {/* Status layanan */}
      <Card>
        <CardHeader>
          <CardTitle>Status Layanan</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.isLoading && <Skeleton className="h-20 w-full" />}
          {profile.isError && (
            <p className="text-sm text-slate-500">Data profil belum dapat dimuat.</p>
          )}
          {profile.data && (
            <div className="flex flex-wrap items-center gap-3">
              <CustomerStatusBadge status={profile.data.status} />
              {profile.data.subscription ? (
                <p className="text-sm text-slate-300">
                  Paket <span className="font-semibold text-slate-100">{profile.data.subscription.packageName}</span>
                  {profile.data.subscription.price != null && (
                    <> — {formatRupiah(profile.data.subscription.price)}/bln</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-slate-500">Belum ada langganan aktif.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ringkasan tagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Tagihan Belum Lunas</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.isLoading && <Skeleton className="h-16 w-full" />}
          {invoices.isError && (
            <p className="text-sm text-slate-500">Data tagihan belum dapat dimuat.</p>
          )}
          {invoices.data && unpaid.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              Tidak ada tagihan yang perlu dibayar. Terima kasih!
            </div>
          )}
          {unpaid.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertCircle className="h-5 w-5" aria-hidden />
                <p className="text-sm">
                  {unpaid.length} tagihan menunggak sebesar{" "}
                  <span className="font-bold text-slate-100">{formatRupiah(unpaidTotal)}</span>
                </p>
              </div>
              <Link href="/portal/tagihan">
                <Button variant="outline" size="sm" className="mt-1">
                  <Receipt className="h-4 w-4" aria-hidden />
                  Lihat & Bayar Tagihan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tiket terbuka */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tiket Terbuka</CardTitle>
            <Link href="/portal/tiket">
              <Button variant="ghost" size="sm">Kelola</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.isLoading && <Skeleton className="h-16 w-full" />}
          {tickets.data && openTickets.length === 0 && (
            <p className="text-sm text-slate-500">Tidak ada tiket terbuka.</p>
          )}
          {openTickets.length > 0 && (
            <ul className="space-y-2">
              {openTickets.slice(0, 3).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-900/50 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{t.subject}</p>
                    <p className="font-mono text-xs text-slate-500">{t.ticketNo}</p>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Tagihan terbaru */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tagihan Terakhir</CardTitle>
            <Link href="/portal/tagihan">
              <Button variant="ghost" size="sm">Semua</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.isLoading && <Skeleton className="h-16 w-full" />}
          {invoices.data && invoices.data.length === 0 && (
            <EmptyState
              icon={Receipt}
              title="Belum ada tagihan"
              description="Tagihan Anda akan muncul di sini setelah diterbitkan."
            />
          )}
          {invoices.data && invoices.data.length > 0 && (
            <ul className="space-y-2">
              {invoices.data.slice(0, 3).map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-900/50 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-300">
                      {inv.invoiceNo} · {inv.period}
                    </p>
                    <p className="text-xs text-slate-500">Jatuh tempo {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-100">{formatRupiah(inv.total)}</p>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
