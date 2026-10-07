"use client";

import { useState, type FormEvent } from "react";
import {
  Ban,
  CheckCircle2,
  Gauge,
  Power,
  RotateCw,
  Search,
  ZapOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, CustomerStatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useNocCustomers, customerRowStatus } from "@/hooks/use-noc";
import {
  useIsolateCustomer,
  useKickSession,
  useRebootOnu,
  useThrottleCustomer,
  useUnisolateCustomer,
} from "@/hooks/use-customers";
import type { NocCustomerRow } from "@/lib/types";
import { formatDbm } from "@/lib/format";
import { cn } from "@/lib/utils";

type ActionKind = "isolate" | "unisolate" | "throttle" | "kick" | "reboot" | null;

export default function NocPage() {
  const [status, setStatus] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<NocCustomerRow | null>(null);
  const [action, setAction] = useState<ActionKind>(null);

  const noc = useNocCustomers({ status, search: search.trim() });

  const isolate = useIsolateCustomer();
  const unisolate = useUnisolateCustomer();
  const throttle = useThrottleCustomer();
  const kick = useKickSession();
  const reboot = useRebootOnu();

  const closeDialog = () => {
    setAction(null);
    setTarget(null);
  };

  const openAction = (row: NocCustomerRow, kind: Exclude<ActionKind, null>) => {
    setTarget(row);
    setAction(kind);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-50">NOC & Jaringan</h2>
          <p className="text-sm text-slate-400">
            Status pelanggan real-time (diperbarui tiap 30 detik) dan aksi jaringan.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / nomor..."
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/60 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:w-56"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              aria-label="Filter status koneksi"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              options={[
                { value: "ALL", label: "Semua status" },
                { value: "ONLINE", label: "Online" },
                { value: "OFFLINE", label: "Offline" },
              ]}
            />
          </div>
        </div>
      </div>

      <Card>
        {noc.isLoading && <TableSkeleton rows={8} cols={6} />}
        {noc.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Data NOC tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu muat ulang."
              action={
                <Button variant="outline" onClick={() => noc.refetch()}>
                  Coba Lagi
                </Button>
              }
            />
          </div>
        )}
        {noc.data && noc.data.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="Tidak ada data"
              description="Tidak ada pelanggan yang cocok dengan filter saat ini."
            />
          </div>
        )}
        {noc.data && noc.data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RX Power</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noc.data.map((row) => (
                  <NocRow key={row.id} row={row} onAction={openAction} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Dialog Isolir */}
      <Dialog
        open={action === "isolate" && !!target}
        onClose={closeDialog}
        title="Isolir Pelanggan"
        description={target ? `${target.name} (${target.customerNo}) akan dibatasi akses internetnya.` : undefined}
      >
        <IsolateForm
          pending={isolate.isPending}
          onCancel={closeDialog}
          onSubmit={(reason) => {
            if (target) isolate.mutate({ id: target.id, reason }, { onSuccess: closeDialog });
          }}
        />
      </Dialog>

      {/* Dialog Throttle */}
      <Dialog
        open={action === "throttle" && !!target}
        onClose={closeDialog}
        title="Throttle Bandwidth"
        description={target ? `Batasi kecepatan ${target.name} (${target.customerNo}).` : undefined}
      >
        <ThrottleForm
          pending={throttle.isPending}
          onCancel={closeDialog}
          onSubmit={(downKbps, upKbps) => {
            if (target) throttle.mutate({ id: target.id, downKbps, upKbps }, { onSuccess: closeDialog });
          }}
        />
      </Dialog>

      {/* Dialog konfirmasi umum */}
      <Dialog
        open={(action === "unisolate" || action === "kick" || action === "reboot") && !!target}
        onClose={closeDialog}
        title={
          action === "unisolate" ? "Aktifkan Pelanggan" :
          action === "kick" ? "Putus Sesi Aktif" : "Reboot ONU"
        }
        description={target ? confirmDescription(action, target) : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>Batal</Button>
            <Button
              loading={unisolate.isPending || kick.isPending || reboot.isPending}
              variant={action === "kick" ? "danger" : "default"}
              onClick={() => {
                if (!target) return;
                if (action === "unisolate") unisolate.mutate(target.id, { onSuccess: closeDialog });
                if (action === "kick") kick.mutate(target.id, { onSuccess: closeDialog });
                if (action === "reboot") reboot.mutate(target.id, { onSuccess: closeDialog });
              }}
            >
              Ya, Lanjutkan
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          {action === "unisolate" && "Sesi pelanggan akan di-drop lalu diaktifkan kembali dengan profil penuh. Notifikasi WhatsApp akan dikirim otomatis."}
          {action === "kick" && "Sesi PPPoE/RADIUS aktif pelanggan akan diputus paksa. Pelanggan akan reconnect otomatis."}
          {action === "reboot" && "Perintah reboot dikirim ke ONU via OLT/TR-069. Koneksi pelanggan terputus sementara ±2 menit."}
        </p>
      </Dialog>
    </div>
  );
}

function confirmDescription(action: ActionKind, target: NocCustomerRow): string {
  return `${target.name} (${target.customerNo})`;
}

function NocRow({
  row,
  onAction,
}: {
  row: NocCustomerRow;
  onAction: (row: NocCustomerRow, kind: Exclude<ActionKind, null>) => void;
}) {
  const conn = customerRowStatus(row);
  const rxBad = row.rxPower !== null && row.rxPower < -27;

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-slate-100">{row.name}</p>
        <p className="text-xs text-slate-500">{row.customerNo}</p>
      </TableCell>
      <TableCell className="text-slate-300">{row.packageName}</TableCell>
      <TableCell className="font-mono text-xs text-slate-300">{row.ipAddress ?? "-"}</TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={conn.tone}>{conn.label}</Badge>
          {row.status !== "ACTIVE" && <CustomerStatusBadge status={row.status} />}
        </div>
      </TableCell>
      <TableCell>
        <span className={cn("font-mono text-xs", rxBad ? "font-semibold text-red-400" : "text-slate-300")}>
          {formatDbm(row.rxPower)}
        </span>
        {rxBad && <p className="text-[11px] text-red-400">Lemah (&lt; -27 dBm)</p>}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          {row.status === "ISOLATED" ? (
            <IconBtn title="Aktifkan" onClick={() => onAction(row, "unisolate")}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </IconBtn>
          ) : (
            <IconBtn title="Isolir" onClick={() => onAction(row, "isolate")}>
              <Ban className="h-4 w-4 text-red-400" />
            </IconBtn>
          )}
          <IconBtn title="Throttle" onClick={() => onAction(row, "throttle")}>
            <Gauge className="h-4 w-4 text-amber-400" />
          </IconBtn>
          <IconBtn title="Kick sesi" onClick={() => onAction(row, "kick")}>
            <ZapOff className="h-4 w-4 text-orange-400" />
          </IconBtn>
          <IconBtn title="Reboot ONU" onClick={() => onAction(row, "reboot")}>
            <RotateCw className="h-4 w-4 text-blue-400" />
          </IconBtn>
        </div>
      </TableCell>
    </TableRow>
  );
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-slate-100"
    >
      {children}
    </button>
  );
}

/* ---- Form isolir ---- */

function IsolateForm({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(reason.trim() || "Isolir manual oleh NOC");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="isolate-reason" className="text-sm font-medium text-slate-300">
          Alasan isolir
        </label>
        <textarea
          id="isolate-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="cth: Menunggak 2 bulan, melewati masa tenggang"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
        <p className="text-xs text-slate-500">
          Alasan tercatat di log layanan dan dikirim sebagai notifikasi WhatsApp.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="danger" loading={pending}>
          <Power className="h-4 w-4" />
          Isolir Sekarang
        </Button>
      </div>
    </form>
  );
}

function ThrottleForm({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (downKbps: number, upKbps: number) => void;
}) {
  const [down, setDown] = useState("1024");
  const [up, setUp] = useState("512");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const downKbps = Number(down);
    const upKbps = Number(up);
    if (!Number.isFinite(downKbps) || downKbps <= 0 || !Number.isFinite(upKbps) || upKbps <= 0) {
      setError("Kecepatan download & upload harus angka positif (Kbps).");
      return;
    }
    setError(null);
    onSubmit(downKbps, upKbps);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Download (Kbps)"
          type="number"
          min={1}
          value={down}
          onChange={(e) => setDown(e.target.value)}
        />
        <Input
          label="Upload (Kbps)"
          type="number"
          min={1}
          value={up}
          onChange={(e) => setUp(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={pending}>
          Terapkan Throttle
        </Button>
      </div>
    </form>
  );
}
