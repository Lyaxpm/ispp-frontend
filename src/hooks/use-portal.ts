"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/customer-api";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type {
  Invoice,
  Paginated,
  PortalProfile,
  Ticket,
} from "@/lib/types";

const PORTAL_KEY = ["portal"];

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as Paginated<T>).data)) {
    return (data as Paginated<T>).data;
  }
  return [];
}

function toastError(toast: ReturnType<typeof useToast>, err: unknown, fallback: string) {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error("Gagal", message);
}

/* ---------------- Profil ---------------- */

export function usePortalProfile() {
  return useQuery<PortalProfile>({
    queryKey: [...PORTAL_KEY, "profile"],
    queryFn: () => customerApi.get<PortalProfile>("/portal/profile"),
    staleTime: 60_000,
  });
}

/* ---------------- Tagihan ---------------- */

export function usePortalInvoices() {
  return useQuery({
    queryKey: [...PORTAL_KEY, "invoices"],
    queryFn: async () => normalizeList<Invoice>(await customerApi.get("/portal/invoices")),
    staleTime: 60_000,
  });
}

export function usePortalInvoice(id: string | null) {
  return useQuery<Invoice>({
    queryKey: [...PORTAL_KEY, "invoices", id],
    queryFn: () => customerApi.get<Invoice>(`/portal/invoices/${id}`),
    enabled: !!id,
  });
}

/* ---------------- Tiket ---------------- */

export function usePortalTickets() {
  return useQuery({
    queryKey: [...PORTAL_KEY, "tickets"],
    queryFn: async () => normalizeList<Ticket>(await customerApi.get("/portal/tickets")),
    staleTime: 60_000,
  });
}

export function useCreatePortalTicket() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: { subject: string; message: string; category?: string }) =>
      customerApi.post<Ticket>("/portal/tickets", input),
    onSuccess: () => {
      toast.success("Tiket terkirim", "Keluhan Anda telah diteruskan ke tim support.");
      qc.invalidateQueries({ queryKey: [...PORTAL_KEY, "tickets"] });
    },
    onError: (err) => toastError(toast, err, "Gagal mengirim tiket."),
  });
}

/* ---------------- Kata sandi ---------------- */

export function useChangePortalPassword() {
  const toast = useToast();
  return useMutation({
    mutationFn: (input: { oldPassword: string; newPassword: string }) =>
      customerApi.post("/customer-auth/change-password", input),
    onSuccess: () => {
      toast.success("Kata sandi diperbarui", "Gunakan kata sandi baru saat masuk berikutnya.");
    },
    onError: (err) => toastError(toast, err, "Gagal mengubah kata sandi."),
  });
}

export function useChangePppoePassword() {
  const toast = useToast();
  return useMutation({
    mutationFn: (newPassword: string) =>
      customerApi.post("/portal/change-pppoe-password", { newPassword }),
    onSuccess: () => {
      toast.success(
        "Kata sandi WiFi diperbarui",
        "Sambungkan ulang perangkat dengan kata sandi baru."
      );
    },
    onError: (err) => toastError(toast, err, "Gagal mengubah kata sandi WiFi/PPPoE."),
  });
}
