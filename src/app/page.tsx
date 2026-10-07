"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  UserRound,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { publicApiClient } from "@/lib/customer-api";
import { formatRupiah } from "@/lib/format";

interface LandingPackage {
  id: string;
  name: string;
  downloadMbps: number;
  uploadMbps: number;
  price: number;
  description?: string | null;
  isActive?: boolean;
}

const FALLBACK_PACKAGES: LandingPackage[] = [
  { id: "p1", name: "Home 10 Mbps", downloadMbps: 10, uploadMbps: 10, price: 125000, description: "Cocok untuk browsing dan media sosial." },
  { id: "p2", name: "Home 20 Mbps", downloadMbps: 20, uploadMbps: 20, price: 175000, description: "Streaming HD dan WFH nyaman." },
  { id: "p3", name: "Home 50 Mbps", downloadMbps: 50, uploadMbps: 50, price: 275000, description: "Untuk keluarga dan banyak perangkat." },
];

const FEATURES = [
  {
    icon: Receipt,
    title: "Billing Otomatis",
    desc: "Invoice terbit otomatis tiap bulan, isolir saat jatuh tempo, dan aktivasi kembali setelah lunas.",
  },
  {
    icon: MapPin,
    title: "GIS FTTH",
    desc: "Petakan OLT, ODC, ODP, dan pelanggan di peta interaktif dengan cek ketersediaan port.",
  },
  {
    icon: Wifi,
    title: "Otomasi Jaringan",
    desc: "Integrasi MikroTik & RADIUS: PPPoE, queue, dan kick sesi otomatis dari satu panel.",
  },
  {
    icon: ShieldCheck,
    title: "NOC & Monitoring",
    desc: "Pantau status ONU, sesi pelanggan, dan alarm jaringan secara real-time.",
  },
  {
    icon: FileText,
    title: "Helpdesk & Tiket",
    desc: "Kelola keluhan pelanggan, penugasan teknisi, dan work order instalasi.",
  },
  {
    icon: UserRound,
    title: "Portal Pelanggan",
    desc: "Pelanggan bisa cek tagihan, bayar, buat tiket, dan ganti kata sandi WiFi sendiri.",
  },
];

const STEPS = [
  { n: "1", title: "Cek Coverage", desc: "Hubungi kami dan sampaikan alamat Anda untuk dicek ketersediaan jaringannya." },
  { n: "2", title: "Pilih Paket", desc: "Pilih paket sesuai kebutuhan — teknisi akan menjadwalkan survei & instalasi." },
  { n: "3", title: "Instalasi", desc: "Teknisi memasang perangkat di rumah Anda dan mengaktifkan layanan." },
  { n: "4", title: "Nikmati Internet", desc: "Bayar tagihan tepat waktu lewat portal pelanggan atau transfer bank." },
];

export default function LandingPage() {
  const [packages, setPackages] = useState<LandingPackage[]>(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await publicApiClient.get<LandingPackage[]>("/packages");
        const list = (Array.isArray(res.data) ? res.data : []).filter((p) => p.isActive !== false);
        if (!cancelled && list.length > 0) setPackages(list);
      } catch {
        // Endpoint butuh auth (401) atau backend mati → pakai paket contoh statis.
        if (!cancelled) setPackages(FALLBACK_PACKAGES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-700/60 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-brand-600 p-1.5">
              <Zap className="h-5 w-5 text-white" aria-hidden />
            </div>
            <p className="text-base font-bold text-slate-50">ISP Manager</p>
          </div>
          <nav className="ml-6 hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#paket" className="hover:text-slate-100">Paket</a>
            <a href="#fitur" className="hover:text-slate-100">Fitur</a>
            <a href="#cara" className="hover:text-slate-100">Cara Berlangganan</a>
            <a href="#kontak" className="hover:text-slate-100">Kontak</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/portal/login">
              <Button variant="outline" size="sm">
                <UserRound className="h-4 w-4" aria-hidden />
                Portal Pelanggan
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Login Admin
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge tone="blue" className="mb-5">Billing · Network Automation · FTTH GIS</Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-50 sm:text-6xl">
            Internet Cepat, Tagihan Otomatis, Jaringan Terpantau
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            ISP Manager adalah platform operasional ISP: penagihan otomatis, integrasi
            MikroTik & RADIUS, pemetaan jaringan FTTH, dan portal mandiri pelanggan.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/portal/login">
              <Button size="lg" className="w-full sm:w-auto">
                <UserRound className="h-5 w-5" aria-hidden />
                Portal Pelanggan
              </Button>
            </Link>
            <Link href="#paket">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Lihat Paket
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Paket */}
      <section id="paket" className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Pilihan Paket Internet</h2>
            <p className="mt-2 text-slate-400">Kecepatan simetris, tanpa batas kuota tersembunyi.</p>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-800/60" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <Card key={p.id} className="flex flex-col p-6">
                  <h3 className="text-lg font-bold text-slate-50">{p.name}</h3>
                  <p className="mt-1 text-3xl font-extrabold text-brand-300">
                    {p.downloadMbps}
                    <span className="text-base font-medium text-slate-400"> Mbps</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Upload {p.uploadMbps} Mbps</p>
                  {p.description && <p className="mt-3 flex-1 text-sm text-slate-400">{p.description}</p>}
                  <p className="mt-4 text-xl font-bold text-slate-50">
                    {formatRupiah(p.price)}
                    <span className="text-sm font-normal text-slate-500">/bln</span>
                  </p>
                  <Link href="#cara" className="mt-4">
                    <Button variant="outline" className="w-full">Berlangganan</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Fitur Unggulan</h2>
            <p className="mt-2 text-slate-400">Satu platform untuk seluruh operasional ISP Anda.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="p-6">
                  <div className="mb-3 inline-flex rounded-lg bg-brand-600/15 p-2.5 ring-1 ring-inset ring-brand-500/40">
                    <Icon className="h-5 w-5 text-brand-300" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-slate-100">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cara berlangganan */}
      <section id="cara" className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Cara Berlangganan</h2>
            <p className="mt-2 text-slate-400">Empat langkah mudah untuk terhubung.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <Card key={s.n} className="p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="font-semibold text-slate-100">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak */}
      <section id="kontak" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Hubungi Kami</h2>
            <p className="mt-2 text-slate-400">Tim kami siap membantu pemasangan dan layanan purna jual.</p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <Card className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-brand-600/15 p-3 ring-1 ring-inset ring-brand-500/40">
                <Phone className="h-6 w-6 text-brand-300" aria-hidden />
              </div>
              <div>
                <p className="text-sm text-slate-500">Telepon / WhatsApp</p>
                <p className="font-semibold text-slate-100">+62 812-3456-7890</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-brand-600/15 p-3 ring-1 ring-inset ring-brand-500/40">
                <MapPin className="h-6 w-6 text-brand-300" aria-hidden />
              </div>
              <div>
                <p className="text-sm text-slate-500">Alamat Kantor</p>
                <p className="font-semibold text-slate-100">Jl. Jaringan No. 1, Jakarta</p>
              </div>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <ul className="inline-flex flex-col items-start gap-2 text-sm text-slate-400">
              {["Cek coverage gratis", "Instalasi oleh teknisi bersertifikat", "Garansi perangkat instalasi"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-brand-600 p-1.5">
              <Zap className="h-4 w-4 text-white" aria-hidden />
            </div>
            <p className="text-sm font-bold text-slate-200">ISP Manager</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="/portal/login" className="hover:text-slate-200">Portal Pelanggan</Link>
            <Link href="/login" className="hover:text-slate-200">Login Admin</Link>
          </div>
          <p className="text-xs text-slate-600">© 2026 ISP Manager. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
