"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Ban,
  Bell,
  Radio,
  Ticket as TicketIcon,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatCardSkeleton, Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStats, useRevenueChart } from "@/hooks/use-dashboard";
import { useRecentInvoices } from "@/hooks/use-invoices";
import { customerStatusLabels, formatDate, formatRupiah } from "@/lib/format";
import type { CustomerStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<CustomerStatus, string> = {
  ACTIVE: "#10b981",
  TRIAL: "#14b8a6",
  CANDIDATE: "#3b82f6",
  ISOLATED: "#ef4444",
  SUSPENDED: "#f59e0b",
  TERMINATED: "#64748b",
};

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "border-red-500/40 bg-red-500/10",
  WARNING: "border-amber-500/40 bg-amber-500/10",
  INFO: "border-blue-500/40 bg-blue-500/10",
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number | string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-slate-300">{label}</p>
      <p className="font-semibold text-brand-300">{formatRupiah(Number(payload[0].value ?? 0))}</p>
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name?: string; value?: number | string }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300">
        <span className="font-medium">{payload[0].name}</span>:{" "}
        <span className="font-semibold text-slate-100">{payload[0].value}</span>
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useDashboardStats();
  const revenue = useRevenueChart(6);
  const recentInvoices = useRecentInvoices(5);

  const revenueData = useMemo(
    () =>
      (revenue.data ?? []).map((p) => ({
        ...p,
        label: safeMonthLabel(p.month),
      })),
    [revenue.data]
  );

  const statusData = useMemo(
    () =>
      (stats.data?.customersByStatus ?? []).map((s) => ({
        name: customerStatusLabels[s.status],
        value: s.count,
        fill: STATUS_COLORS[s.status],
      })),
    [stats.data]
  );

  const failed = stats.isError;

  return (
    <div className="space-y-6">
      {/* Kartu statistik */}
      {stats.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : failed || !stats.data ? (
        <EmptyState
          offline
          title="Dashboard tidak dapat dimuat"
          description="Server API tidak terjangkau. Pastikan backend berjalan lalu muat ulang."
          action={
            <Button variant="outline" onClick={() => stats.refetch()}>
              Coba Lagi
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Pelanggan Aktif"
            value={stats.data.activeCustomers.toLocaleString("id-ID")}
            icon={Users}
            iconTone="emerald"
          />
          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatRupiah(stats.data.monthlyRevenue)}
            icon={Wallet}
            iconTone="blue"
          />
          <StatCard
            title="Tagihan Jatuh Tempo"
            value={stats.data.overdueInvoices.toLocaleString("id-ID")}
            subtitle="Perlu penagihan"
            icon={AlertTriangle}
            iconTone="amber"
          />
          <StatCard
            title="ONU Online"
            value={stats.data.onlineOnus.toLocaleString("id-ID")}
            icon={Radio}
            iconTone="emerald"
          />
          <StatCard
            title="Pelanggan Terisolir"
            value={stats.data.isolatedCount.toLocaleString("id-ID")}
            icon={Ban}
            iconTone="red"
          />
          <StatCard
            title="Tiket Terbuka"
            value={stats.data.ticketsOpen.toLocaleString("id-ID")}
            icon={TicketIcon}
            iconTone="purple"
          />
        </div>
      )}

      {/* Grafik */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Pendapatan 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {revenue.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : revenue.isError || revenueData.length === 0 ? (
              <EmptyState
                title="Data pendapatan kosong"
                description="Belum ada data pendapatan yang dapat ditampilkan."
                className="border-0"
              />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => compactRupiah(v)}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Pendapatan"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : statusData.length === 0 ? (
              <EmptyState
                title="Data kosong"
                description="Belum ada distribusi status pelanggan."
                className="border-0"
              />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {statusData.map((s) => (
                        <Cell key={s.name} fill={s.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
                      formatter={(value: string) => <span className="text-slate-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tagihan terbaru + alarm NOC */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Tagihan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentInvoices.isLoading && <TableSkeleton rows={5} cols={4} />}
            {recentInvoices.isError && (
              <div className="p-6">
                <EmptyState offline title="Gagal memuat tagihan" description="Server API tidak terjangkau." />
              </div>
            )}
            {recentInvoices.data && recentInvoices.data.data.length === 0 && (
              <div className="p-6">
                <EmptyState title="Belum ada tagihan" description="Invoice terbaru akan muncul di sini." />
              </div>
            )}
            {recentInvoices.data && recentInvoices.data.data.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.data.data.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.invoiceNo}</TableCell>
                        <TableCell className="text-slate-200">{inv.customer?.name ?? "-"}</TableCell>
                        <TableCell className="font-semibold text-slate-100">
                          {formatRupiah(inv.total)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={inv.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              Alarm NOC
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : stats.data?.alarms && stats.data.alarms.length > 0 ? (
              <ul className="space-y-2">
                {stats.data.alarms.map((a) => (
                  <li
                    key={a.id}
                    className={cn("rounded-lg border p-3 text-xs", SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.INFO)}
                  >
                    <p className="font-semibold text-slate-100">{a.title}</p>
                    <p className="mt-0.5 text-slate-400">{a.message}</p>
                    <p className="mt-1 text-slate-500">{formatDate(a.createdAt, "d MMM yyyy, HH.mm")}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Tidak ada alarm"
                description="Jaringan dalam kondisi normal. Alarm link down / LOS akan muncul di sini."
                className="border-0 py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function safeMonthLabel(month: string): string {
  // Backend mengirim "2026-10" atau "Okt 2026" apa adanya.
  try {
    const d = new Date(`${month}-01`);
    if (!Number.isNaN(d.getTime())) return format(d, "MMM yy", { locale: localeId });
  } catch {
    /* abaikan, pakai mentah */
  }
  return month;
}

function compactRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}jt`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`;
  return `Rp${value}`;
}
