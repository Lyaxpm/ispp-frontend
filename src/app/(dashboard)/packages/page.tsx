"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  useCreatePackage,
  useDeletePackage,
  useManagedPackages,
  useUpdatePackage,
} from "@/hooks/use-packages";
import type {
  BillingType,
  ManagedPackage,
  PackageFormInput,
  ServiceType,
} from "@/lib/types";
import { formatRupiah } from "@/lib/format";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  PPPOE: "PPPoE",
  STATIC_IP: "Static IP",
  DHCP: "DHCP",
  HOTSPOT: "Hotspot",
};

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  PREPAID: "Prabayar",
  POSTPAID: "Pascabayar",
};

function formatSpeed(download: number, upload: number): string {
  return `${download} / ${upload} Mbps`;
}

export default function PackagesPage() {
  const packages = useManagedPackages();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedPackage | null>(null);
  const [deleting, setDeleting] = useState<ManagedPackage | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (pkg: ManagedPackage) => {
    setEditing(pkg);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Paket Layanan</h2>
          <p className="text-sm text-slate-400">Kelola paket internet yang ditawarkan ke pelanggan.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          Tambah Paket
        </Button>
      </div>

      <Card>
        {packages.isLoading && <TableSkeleton rows={6} cols={5} />}
        {packages.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Paket tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu coba lagi."
              action={<Button variant="outline" onClick={() => packages.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {packages.data && packages.data.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="Belum ada paket"
              description="Tambahkan paket pertama untuk mulai menawarkan layanan."
              action={<Button onClick={openCreate}>Tambah Paket</Button>}
            />
          </div>
        )}
        {packages.data && packages.data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Paket</TableHead>
                  <TableHead>Kecepatan (D/U)</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Tipe Layanan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-slate-100">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {BILLING_TYPE_LABELS[p.billingType]}
                        {p.validityDays ? ` · ${p.validityDays} hari` : ""}
                        {p.fupGb ? ` · FUP ${p.fupGb} GB` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-slate-300">{formatSpeed(p.downloadMbps, p.uploadMbps)}</TableCell>
                    <TableCell className="font-semibold text-slate-100">{formatRupiah(p.price)}</TableCell>
                    <TableCell className="text-slate-300">{SERVICE_TYPE_LABELS[p.serviceType]}</TableCell>
                    <TableCell>
                      <Badge tone={p.isActive ? "emerald" : "slate"}>
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label={`Ubah ${p.name}`} title="Ubah">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {p.isActive && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleting(p)} aria-label={`Nonaktifkan ${p.name}`} title="Nonaktifkan">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <PackageFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
      <DeletePackageDialog pkg={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

const EMPTY_FORM: PackageFormInput = {
  name: "",
  downloadMbps: 10,
  uploadMbps: 10,
  price: 100000,
  serviceType: "PPPOE",
  billingType: "PREPAID",
};

function PackageFormDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: ManagedPackage | null;
}) {
  const [form, setForm] = useState<PackageFormInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const create = useCreatePackage();
  const update = useUpdatePackage();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setError(null);
      if (editing) {
        setForm({
          name: editing.name,
          downloadMbps: editing.downloadMbps,
          uploadMbps: editing.uploadMbps,
          price: editing.price,
          serviceType: editing.serviceType,
          billingType: editing.billingType,
          validityDays: editing.validityDays ?? undefined,
          fupGb: editing.fupGb ?? undefined,
          installFee: editing.installFee ?? undefined,
          setupFee: editing.setupFee ?? undefined,
          description: editing.description ?? undefined,
          mikrotikProfile: editing.mikrotikProfile ?? undefined,
          radiusRateLimit: editing.radiusRateLimit ?? undefined,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editing]);

  const set = <K extends keyof PackageFormInput>(key: K, value: PackageFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function cleanNumbers(f: PackageFormInput): PackageFormInput {
    const out = { ...f };
    for (const k of ["validityDays", "fupGb", "installFee", "setupFee"] as const) {
      if (out[k] === undefined || out[k] === null || Number.isNaN(out[k])) delete out[k];
    }
    for (const k of ["description", "mikrotikProfile", "radiusRateLimit"] as const) {
      if (!out[k]?.trim()) delete out[k];
    }
    return out;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 3) {
      setError("Nama paket minimal 3 karakter.");
      return;
    }
    if (!form.downloadMbps || form.downloadMbps <= 0 || !form.uploadMbps || form.uploadMbps <= 0) {
      setError("Kecepatan download/upload harus lebih dari 0.");
      return;
    }
    if (form.price < 0) {
      setError("Harga tidak boleh negatif.");
      return;
    }
    const payload = cleanNumbers({ ...form, name: form.name.trim() });
    if (editing) {
      update.mutate({ id: editing.id, input: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Ubah Paket" : "Tambah Paket"}
      description={editing ? `Mengubah paket ${editing.name}` : "Buat paket layanan baru."}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Nama paket"
          placeholder="Contoh: Home 20 Mbps"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          disabled={pending}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Download (Mbps)"
            type="number"
            min={1}
            value={form.downloadMbps}
            onChange={(e) => set("downloadMbps", Number(e.target.value))}
            disabled={pending}
          />
          <Input
            label="Upload (Mbps)"
            type="number"
            min={1}
            value={form.uploadMbps}
            onChange={(e) => set("uploadMbps", Number(e.target.value))}
            disabled={pending}
          />
          <Input
            label="Harga (Rp/bln)"
            type="number"
            min={0}
            step={1000}
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Tipe layanan"
            value={form.serviceType}
            onChange={(e) => set("serviceType", e.target.value as ServiceType)}
            options={Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            disabled={pending}
          />
          <Select
            label="Sistem bayar"
            value={form.billingType}
            onChange={(e) => set("billingType", e.target.value as BillingType)}
            options={Object.entries(BILLING_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Masa aktif (hari)"
            type="number"
            min={1}
            placeholder="Opsional"
            value={form.validityDays ?? ""}
            onChange={(e) => set("validityDays", e.target.value ? Number(e.target.value) : undefined)}
            disabled={pending}
          />
          <Input
            label="FUP (GB)"
            type="number"
            min={1}
            placeholder="Opsional"
            value={form.fupGb ?? ""}
            onChange={(e) => set("fupGb", e.target.value ? Number(e.target.value) : undefined)}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Biaya instalasi (Rp)"
            type="number"
            min={0}
            placeholder="Opsional"
            value={form.installFee ?? ""}
            onChange={(e) => set("installFee", e.target.value ? Number(e.target.value) : undefined)}
            disabled={pending}
          />
          <Input
            label="Biaya registrasi (Rp)"
            type="number"
            min={0}
            placeholder="Opsional"
            value={form.setupFee ?? ""}
            onChange={(e) => set("setupFee", e.target.value ? Number(e.target.value) : undefined)}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Profil MikroTik"
            placeholder="Opsional, cth: profile-20M"
            value={form.mikrotikProfile ?? ""}
            onChange={(e) => set("mikrotikProfile", e.target.value)}
            disabled={pending}
          />
          <Input
            label="Rate-limit RADIUS"
            placeholder="Opsional, cth: 20M/10M"
            value={form.radiusRateLimit ?? ""}
            onChange={(e) => set("radiusRateLimit", e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="package-desc" className="text-sm font-medium text-slate-300">
            Deskripsi
          </label>
          <textarea
            id="package-desc"
            rows={2}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            disabled={pending}
            placeholder="Keterangan tambahan untuk pelanggan (opsional)"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" loading={pending}>
            {editing ? "Simpan Perubahan" : "Tambah Paket"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function DeletePackageDialog({ pkg, onClose }: { pkg: ManagedPackage | null; onClose: () => void }) {
  const remove = useDeletePackage();
  return (
    <Dialog
      open={!!pkg}
      onClose={onClose}
      title="Nonaktifkan Paket"
      description={pkg ? `Paket "${pkg.name}" tidak lagi ditawarkan ke pelanggan baru. Pelanggan aktif tidak terpengaruh.` : undefined}
    >
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={remove.isPending}>
          Batal
        </Button>
        <Button
          variant="danger"
          loading={remove.isPending}
          onClick={() => pkg && remove.mutate(pkg.id, { onSuccess: onClose })}
        >
          Nonaktifkan
        </Button>
      </div>
    </Dialog>
  );
}
