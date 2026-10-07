"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import type { Customer, CustomerStatus, Package, Paginated } from "@/lib/types";

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus | "";
  packageId?: string;
  odpCode?: string;
  page?: number;
  limit?: number;
}

const CUSTOMER_KEY = ["customers"];

export function useCustomers(filters: CustomerFilters) {
  const { page = 1, limit = 20, ...rest } = filters;
  return useQuery<Paginated<Customer>>({
    queryKey: [...CUSTOMER_KEY, "list", { ...rest, page, limit }],
    queryFn: () =>
      api.get<Paginated<Customer>>("/customers", { ...rest, page, limit }),
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string | null) {
  return useQuery<Customer>({
    queryKey: [...CUSTOMER_KEY, "detail", id],
    queryFn: () => api.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

export function usePackages() {
  return useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: () => api.get<Package[]>("/packages"),
    staleTime: 5 * 60_000,
  });
}

function toastError(toast: ReturnType<typeof useToast>, err: unknown, fallback: string) {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error("Gagal", message);
}

export function useIsolateCustomer() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/customers/${id}/isolate`, { reason }),
    onSuccess: (_d, { id }) => {
      toast.success("Pelanggan diisolir", "Akses internet pelanggan telah dibatasi.");
      qc.invalidateQueries({ queryKey: CUSTOMER_KEY });
      qc.invalidateQueries({ queryKey: ["noc"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      void id;
    },
    onError: (err) => toastError(toast, err, "Gagal mengisolir pelanggan."),
  });
}

export function useUnisolateCustomer() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => api.post(`/customers/${id}/unisolate`),
    onSuccess: () => {
      toast.success("Pelanggan diaktifkan", "Akses internet pelanggan telah dipulihkan.");
      qc.invalidateQueries({ queryKey: CUSTOMER_KEY });
      qc.invalidateQueries({ queryKey: ["noc"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toastError(toast, err, "Gagal mengaktifkan pelanggan."),
  });
}

export function useThrottleCustomer() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, downKbps, upKbps }: { id: string; downKbps: number; upKbps: number }) =>
      api.post(`/customers/${id}/throttle`, { downKbps, upKbps }),
    onSuccess: () => {
      toast.success("Throttle diterapkan", "Batas kecepatan pelanggan telah diubah.");
      qc.invalidateQueries({ queryKey: CUSTOMER_KEY });
      qc.invalidateQueries({ queryKey: ["noc"] });
    },
    onError: (err) => toastError(toast, err, "Gagal menerapkan throttle."),
  });
}

export function useKickSession() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => api.post(`/customers/${id}/kick-session`),
    onSuccess: () => {
      toast.success("Sesi diputus", "Sesi aktif pelanggan telah di-kick.");
      qc.invalidateQueries({ queryKey: ["noc"] });
    },
    onError: (err) => toastError(toast, err, "Gagal memutus sesi."),
  });
}

export function useRebootOnu() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => api.post(`/customers/${id}/reboot-onu`),
    onSuccess: () => {
      toast.success("Perintah reboot dikirim", "ONU akan restart dalam beberapa saat.");
      qc.invalidateQueries({ queryKey: ["noc"] });
    },
    onError: (err) => toastError(toast, err, "Gagal mengirim perintah reboot ONU."),
  });
}
