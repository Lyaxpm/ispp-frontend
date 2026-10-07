"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers";
import {
  useCreateUser,
  useResetUserPassword,
  useSystemUsers,
  useUpdateUser,
} from "@/hooks/use-users";
import type { SystemRole, SystemUser } from "@/lib/types";
import { roleLabels } from "@/lib/format";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "NOC", label: "NOC" },
  { value: "CASHIER", label: "Kasir" },
  { value: "TECHNICIAN", label: "Teknisi" },
  { value: "CS", label: "CS" },
];

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const users = useSystemUsers(isAdmin && !authLoading);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [resetting, setResetting] = useState<SystemUser | null>(null);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Pengguna</h2>
          <p className="text-sm text-slate-400">Manajemen akun staf.</p>
        </div>
        <EmptyState
          icon={ShieldAlert}
          title="Akses ditolak"
          description="Halaman ini hanya dapat diakses oleh akun Admin."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Pengguna</h2>
          <p className="text-sm text-slate-400">Kelola akun staf dan hak akses per peran.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Tambah Pengguna
        </Button>
      </div>

      <Card>
        {users.isLoading && <TableSkeleton rows={6} cols={4} />}
        {users.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Pengguna tidak dapat dimuat"
              description="Server API tidak terjangkau. Coba lagi nanti."
              action={<Button variant="outline" onClick={() => users.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {users.data && users.data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-slate-100">{u.name}</TableCell>
                    <TableCell className="text-slate-300">{u.email}</TableCell>
                    <TableCell>
                      <Badge tone={u.role === "ADMIN" ? "purple" : "blue"}>
                        {roleLabels[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone={u.isActive ? "emerald" : "slate"}>
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(u)} aria-label={`Ubah ${u.name}`} title="Ubah peran/status">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setResetting(u)} aria-label={`Reset kata sandi ${u.name}`} title="Reset kata sandi">
                          <KeyRound className="h-4 w-4 text-amber-400" />
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

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserDialog user={editing} onClose={() => setEditing(null)} />
      <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />
    </div>
  );
}

function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SystemRole>("CS");
  const [error, setError] = useState<string | null>(null);
  const create = useCreateUser();

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("CS");
      setError(null);
    }
  }, [open ]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    create.mutate(
      { name: name.trim(), email: email.trim(), password, role },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Tambah Pengguna" description="Buat akun staf baru.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
        <Input label="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} disabled={create.isPending} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={create.isPending} />
        <Input label="Kata sandi awal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={create.isPending} hint="Minimal 6 karakter." />
        <Select
          label="Peran"
          value={role}
          onChange={(e) => setRole(e.target.value as SystemRole)}
          options={ROLE_OPTIONS}
          disabled={create.isPending}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={create.isPending}>
            Batal
          </Button>
          <Button type="submit" loading={create.isPending}>
            Tambah Pengguna
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function EditUserDialog({ user, onClose }: { user: SystemUser | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<SystemRole>("CS");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateUser();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
      setIsActive(user.isActive);
      setError(null);
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (name.trim().length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }
    update.mutate(
      { id: user.id, input: { name: name.trim(), role, isActive } },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog open={!!user} onClose={onClose} title="Ubah Pengguna" description={user?.email}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
        <Input label="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} disabled={update.isPending} />
        <Select
          label="Peran"
          value={role}
          onChange={(e) => setRole(e.target.value as SystemRole)}
          options={ROLE_OPTIONS}
          disabled={update.isPending}
        />
        <div className="flex items-center gap-2.5">
          <input
            id="user-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={update.isPending}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-brand-600"
          />
          <label htmlFor="user-active" className="text-sm text-slate-300">
            Akun aktif (bisa masuk)
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={update.isPending}>
            Batal
          </Button>
          <Button type="submit" loading={update.isPending}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose }: { user: SystemUser | null; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reset = useResetUserPassword();

  useEffect(() => {
    if (user) {
      setNewPassword("");
      setConfirm("");
      setError(null);
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    reset.mutate({ id: user.id, newPassword }, { onSuccess: onClose });
  }

  return (
    <Dialog
      open={!!user}
      onClose={onClose}
      title="Reset Kata Sandi"
      description={user ? `Atur kata sandi baru untuk ${user.name} (${user.email}).` : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
        <Input
          label="Kata sandi baru"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={reset.isPending}
          hint="Minimal 6 karakter."
        />
        <Input
          label="Konfirmasi kata sandi baru"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={reset.isPending}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={reset.isPending}>
            Batal
          </Button>
          <Button type="submit" loading={reset.isPending}>
            Reset Kata Sandi
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
