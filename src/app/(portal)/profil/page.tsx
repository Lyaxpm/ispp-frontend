"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerStatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChangePortalPassword,
  useChangePppoePassword,
  usePortalProfile,
} from "@/hooks/use-portal";
import { useCustomerAuth } from "@/components/customer-provider";
import { customerStatusLabels, formatDate, formatRupiah } from "@/lib/format";

export default function PortalProfilePage() {
  const { customer } = useCustomerAuth();
  const profile = usePortalProfile();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Profil</h2>
        <p className="text-sm text-slate-400">Data akun dan pengaturan keamanan Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {profile.isError && (
            <p className="text-sm text-slate-500">Data profil belum dapat dimuat.</p>
          )}
          {profile.data && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <CustomerStatusBadge status={profile.data.status} />
                <span className="text-xs text-slate-500">
                  {customerStatusLabels[profile.data.status]}
                </span>
              </div>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Item label="Nama" value={profile.data.name} />
                <Item label="No. Pelanggan" value={profile.data.customerNo} mono />
                <Item label="Email" value={profile.data.email} />
                <Item label="Telepon" value={profile.data.phone} />
                <Item label="Alamat" value={profile.data.address} />
                <Item label="Jatuh tempo tiap tgl" value={String(profile.data.dueDay)} />
                <Item label="Saldo/deposit" value={formatRupiah(profile.data.balance)} />
                <Item
                  label="Username PPPoE"
                  value={profile.data.subscription?.pppoeUsername ?? "-"}
                  mono
                />
                <Item
                  label="Paket"
                  value={profile.data.subscription?.packageName ?? "Belum ada langganan"}
                />
                <Item
                  label="Mulai berlangganan"
                  value={formatDate(profile.data.subscription?.startDate)}
                />
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      <ChangePasswordCard />
      <ChangePppoePasswordCard />
    </div>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`mt-0.5 text-slate-200 ${mono ? "font-mono text-sm" : ""}`}>
        {value ?? "-"}
      </dd>
    </div>
  );
}

function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const change = useChangePortalPassword();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!oldPassword) {
      setError("Kata sandi lama wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    change.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          setConfirm("");
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti Kata Sandi Akun</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          {error && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}
          <Input
            label="Kata sandi lama"
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={change.isPending}
          />
          <Input
            label="Kata sandi baru"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={change.isPending}
            hint="Minimal 6 karakter."
          />
          <Input
            label="Konfirmasi kata sandi baru"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={change.isPending}
          />
          <Button type="submit" loading={change.isPending}>
            Simpan Kata Sandi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePppoePasswordCard() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const change = useChangePppoePassword();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError("Kata sandi WiFi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    change.mutate(newPassword, {
      onSuccess: () => {
        setNewPassword("");
        setConfirm("");
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti Kata Sandi WiFi / PPPoE</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <p className="text-xs text-slate-500">
            Kata sandi ini dipakai untuk koneksi internet (PPPoE) Anda. Setelah diganti,
            sambungkan ulang perangkat dengan kata sandi baru.
          </p>
          {error && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}
          <Input
            label="Kata sandi WiFi baru"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={change.isPending}
            hint="Minimal 6 karakter."
          />
          <Input
            label="Konfirmasi kata sandi WiFi"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={change.isPending}
          />
          <Button type="submit" loading={change.isPending}>
            Ganti Kata Sandi WiFi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
