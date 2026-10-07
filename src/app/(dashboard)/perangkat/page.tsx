"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, PlugZap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  useCreateNasRouter,
  useDeleteNasRouter,
  useNasRouters,
  useTestNasConnection,
  useUpdateNasRouter,
} from "@/hooks/use-nas-routers";
import type { NasConnectionTestResult, NasRouter, NasRouterFormInput } from "@/lib/types";
import { ApiError } from "@/lib/api-client";

const TYPE_OPTIONS = [
  { value: "MIKROTIK", label: "MikroTik (RouterOS API)" },
  { value: "CISCO", label: "Cisco" },
  { value: "HUAWEI", label: "Huawei" },
  { value: "VYOS", label: "VyOS" },
  { value: "LAINNYA", label: "Lainnya" },
];

export default function NasRoutersPage() {
  const routers = useNasRouters();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NasRouter | null>(null);
  const [deleting, setDeleting] = useState<NasRouter | null>(null);
  const [testResult, setTestResult] = useState<{ name: string; result: NasConnectionTestResult } | null>(null);
  const testConnection = useTestNasConnection();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: NasRouter) => {
    setEditing(r);
    setFormOpen(true);
  };

  async function handleTest(router: NasRouter) {
    try {
      const result = await testConnection.mutateAsync(router.id);
      setTestResult({ name: router.name, result });
      if (result.ok) {
        toast.success(
          `Koneksi ke ${router.name} berhasil`,
          result.latencyMs != null ? `Latensi ${result.latencyMs} ms.` : undefined
        );
      } else {
        toast.error(
          `Koneksi ke ${router.name} gagal`,
          result.error ?? "Tidak ada pesan kesalahan dari server."
        );
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Gagal menguji koneksi.";
      toast.error(`Tes koneksi ${router.name} gagal`, message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Perangkat NAS / Router</h2>
          <p className="text-sm text-slate-400">Kelola router MikroTik dan NAS RADIUS yang terhubung.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          Tambah Perangkat
        </Button>
      </div>

      <Card>
        {routers.isLoading && <TableSkeleton rows={5} cols={4} />}
        {routers.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Perangkat tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu coba lagi."
              action={<Button variant="outline" onClick={() => routers.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {routers.data && routers.data.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="Belum ada perangkat"
              description="Tambahkan router pertama untuk mulai mengotomasi jaringan."
              action={<Button onClick={openCreate}>Tambah Perangkat</Button>}
            />
          </div>
        )}
        {routers.data && routers.data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routers.data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-slate-100">{r.name}</p>
                      {r.location && <p className="text-xs text-slate-500">{r.location}</p>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {r.host}
                      {r.apiPort ? `:${r.apiPort}` : ""}
                    </TableCell>
                    <TableCell className="text-slate-300">{r.type ?? "-"}</TableCell>
                    <TableCell>
                      <Badge tone={r.status === "ONLINE" ? "emerald" : r.status === "OFFLINE" ? "red" : "slate"}>
                        {r.status ?? "Belum dites"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={testConnection.isPending && testConnection.variables === r.id}
                          onClick={() => handleTest(r)}
                          title="Tes koneksi ke perangkat"
                        >
                          <PlugZap className="h-4 w-4" aria-hidden />
                          Tes Koneksi
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label={`Ubah ${r.name}`} title="Ubah">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(r)} aria-label={`Hapus ${r.name}`} title="Hapus">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <NasRouterFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
      <DeleteNasRouterDialog router={deleting} onClose={() => setDeleting(null)} />

      <Dialog
        open={!!testResult}
        onClose={() => setTestResult(null)}
        title="Hasil Tes Koneksi"
        description={testResult ? testResult.name : undefined}
      >
        {testResult && (
          <div
            className={`rounded-lg border p-4 text-sm ${
              testResult.result.ok
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-red-500/40 bg-red-500/10"
            }`}
          >
            {testResult.result.ok ? (
              <div className="space-y-1">
                <p className="font-semibold text-emerald-300">Berhasil terhubung.</p>
                {testResult.result.latencyMs != null && (
                  <p className="text-slate-300">
                    Latensi: <span className="font-mono">{testResult.result.latencyMs} ms</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-red-300">Gagal terhubung.</p>
                <p className="text-slate-300">{testResult.result.error ?? "Tidak ada pesan kesalahan."}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

const EMPTY_FORM: NasRouterFormInput = {
  name: "",
  host: "",
  username: "admin",
  password: "",
  useTls: false,
};

function NasRouterFormDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: NasRouter | null;
}) {
  const [form, setForm] = useState<NasRouterFormInput>(EMPTY_FORM);
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useCreateNasRouter();
  const update = useUpdateNasRouter();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setError(null);
      if (editing) {
        setForm({
          name: editing.name,
          host: editing.host,
          apiPort: editing.apiPort ?? undefined,
          username: editing.username,
          password: "",
          useTls: editing.useTls,
        });
        setType(editing.type ?? "");
        setLocation(editing.location ?? "");
      } else {
        setForm(EMPTY_FORM);
        setType("");
        setLocation("");
      }
    }
  }, [open, editing]);

  const set = <K extends keyof NasRouterFormInput>(key: K, value: NasRouterFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 3) {
      setError("Nama perangkat minimal 3 karakter.");
      return;
    }
    if (!form.host.trim()) {
      setError("Host/IP perangkat wajib diisi.");
      return;
    }
    if (!form.username.trim()) {
      setError("Username wajib diisi.");
      return;
    }
    if (!editing && !form.password) {
      setError("Kata sandi wajib diisi untuk perangkat baru.");
      return;
    }

    const payload: NasRouterFormInput = {
      name: form.name.trim(),
      host: form.host.trim(),
      username: form.username.trim(),
      useTls: form.useTls ?? false,
      ...(form.apiPort ? { apiPort: form.apiPort } : {}),
      ...(form.password ? { password: form.password } : {}),
      ...(type ? { type } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
    };

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
      title={editing ? "Ubah Perangkat" : "Tambah Perangkat"}
      description={editing ? `Mengubah ${editing.name}` : "Daftarkan router/NAS baru."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <Input label="Nama perangkat" placeholder="Contoh: Router POP Utama" value={form.name} onChange={(e) => set("name", e.target.value)} disabled={pending} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Host / IP" placeholder="192.168.1.1" value={form.host} onChange={(e) => set("host", e.target.value)} disabled={pending} />
          <Input
            label="Port API"
            type="number"
            min={1}
            max={65535}
            placeholder="8728 (default)"
            value={form.apiPort ?? ""}
            onChange={(e) => set("apiPort", e.target.value ? Number(e.target.value) : undefined)}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Username" value={form.username} onChange={(e) => set("username", e.target.value)} disabled={pending} />
          <Input
            label={editing ? "Kata sandi (kosongkan bila tidak diubah)" : "Kata sandi"}
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            disabled={pending}
          />
        </div>

        <Select
          label="Tipe perangkat"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[{ value: "", label: "Pilih tipe" }, ...TYPE_OPTIONS]}
          disabled={pending}
        />

        <Input label="Lokasi" placeholder="Opsional, cth: POP Jakarta" value={location} onChange={(e) => setLocation(e.target.value)} disabled={pending} />

        <div className="flex items-center gap-2.5">
          <input
            id="nas-use-tls"
            type="checkbox"
            checked={form.useTls ?? false}
            onChange={(e) => set("useTls", e.target.checked)}
            disabled={pending}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-brand-600"
          />
          <label htmlFor="nas-use-tls" className="text-sm text-slate-300">
            Gunakan TLS/SSL untuk koneksi API
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" loading={pending}>
            {editing ? "Simpan Perubahan" : "Tambah Perangkat"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function DeleteNasRouterDialog({ router, onClose }: { router: NasRouter | null; onClose: () => void }) {
  const remove = useDeleteNasRouter();
  return (
    <Dialog
      open={!!router}
      onClose={onClose}
      title="Hapus Perangkat"
      description={router ? `Hapus "${router.name}" (${router.host}) dari daftar? Tindakan ini tidak dapat dibatalkan.` : undefined}
    >
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={remove.isPending}>
          Batal
        </Button>
        <Button
          variant="danger"
          loading={remove.isPending}
          onClick={() => router && remove.mutate(router.id, { onSuccess: onClose })}
        >
          Hapus
        </Button>
      </div>
    </Dialog>
  );
}
