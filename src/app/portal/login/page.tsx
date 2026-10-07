"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth, CustomerAuthProvider } from "@/components/customer-provider";
import { ApiError } from "@/lib/customer-api";

function CustomerLoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace("/portal");
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/portal");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal masuk. Periksa kembali email dan kata sandi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="rounded-2xl bg-brand-600 p-3">
            <UserRound className="h-8 w-8 text-white" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-slate-50">Portal Pelanggan</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-400">
            <Zap className="h-3.5 w-3.5 text-brand-400" aria-hidden />
            ISP Manager
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl"
        >
          <h2 className="mb-5 text-lg font-semibold text-slate-100">Masuk sebagai Pelanggan</h2>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              label="Kata Sandi"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <Button type="submit" loading={submitting} className="w-full" size="lg">
              {submitting ? "Memeriksa..." : "Masuk ke Portal"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Email dan kata sandi didapat saat registrasi berlangganan. Hubungi CS bila lupa.
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <CustomerAuthProvider>
      <CustomerLoginForm />
    </CustomerAuthProvider>
  );
}
