"use client";

import { LogOut, Server, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers";
import { roleLabels } from "@/lib/format";
import { API_BASE_URL } from "@/lib/api-client";

const MAP_TILES = process.env.NEXT_PUBLIC_MAP_TILES ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Pengaturan</h2>
        <p className="text-sm text-slate-400">Profil pengguna dan konfigurasi koneksi aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-brand-400" />
              Profil Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Nama</dt>
                <dd className="mt-0.5 text-slate-100">{user?.name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="mt-0.5 text-slate-100">{user?.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Peran</dt>
                <dd className="mt-0.5">
                  <span className="inline-block rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-inset ring-brand-500/40">
                    {user ? roleLabels[user.role] ?? user.role : "-"}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-brand-400" />
              Koneksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">API Backend</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-slate-200">{API_BASE_URL}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Tile Server Peta</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-slate-200">{MAP_TILES}</dd>
              </div>
              <p className="text-xs text-slate-500">
                Nilai di atas berasal dari environment build (<span className="font-mono">NEXT_PUBLIC_*</span>).
                Ubah di file <span className="font-mono">.env</span> lalu build ulang untuk mengganti.
              </p>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-400">Zona Berbahaya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Keluar dari sesi ini dan hapus token autentikasi dari perangkat.
            </p>
            <Button variant="danger" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
