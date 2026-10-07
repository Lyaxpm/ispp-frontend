"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { ManagedPackage, PackageFormInput } from "@/lib/types";

export const PACKAGES_KEY = ["packages", "managed"];

function toastError(toast: ReturnType<typeof useToast>, err: unknown, fallback: string) {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error("Gagal", message);
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: PACKAGES_KEY });
  // Segarkan juga cache daftar paket bentuk lama (dipakai filter pelanggan).
  qc.invalidateQueries({ queryKey: ["packages"] });
}

export function useManagedPackages() {
  return useQuery<ManagedPackage[]>({
    queryKey: PACKAGES_KEY,
    queryFn: () => api.get<ManagedPackage[]>("/packages"),
    staleTime: 60_000,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: PackageFormInput) => api.post<ManagedPackage>("/packages", input),
    onSuccess: () => {
      toast.success("Paket ditambahkan", "Paket layanan baru berhasil disimpan.");
      invalidate(qc);
    },
    onError: (err) => toastError(toast, err, "Gagal menambahkan paket."),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PackageFormInput> }) =>
      api.patch<ManagedPackage>(`/packages/${id}`, input),
    onSuccess: () => {
      toast.success("Paket diperbarui", "Perubahan paket berhasil disimpan.");
      invalidate(qc);
    },
    onError: (err) => toastError(toast, err, "Gagal memperbarui paket."),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => api.del(`/packages/${id}`),
    onSuccess: () => {
      toast.success("Paket dinonaktifkan", "Paket tidak lagi ditawarkan ke pelanggan baru.");
      invalidate(qc);
    },
    onError: (err) => toastError(toast, err, "Gagal menonaktifkan paket."),
  });
}
