"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type {
  NasConnectionTestResult,
  NasRouter,
  NasRouterFormInput,
} from "@/lib/types";

const NAS_KEY = ["nas-routers"];

function toastError(toast: ReturnType<typeof useToast>, err: unknown, fallback: string) {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error("Gagal", message);
}

export function useNasRouters() {
  return useQuery<NasRouter[]>({
    queryKey: NAS_KEY,
    queryFn: () => api.get<NasRouter[]>("/nas-routers"),
    staleTime: 60_000,
  });
}

export function useCreateNasRouter() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: NasRouterFormInput) => api.post<NasRouter>("/nas-routers", input),
    onSuccess: () => {
      toast.success("Perangkat ditambahkan", "Router/NAS baru berhasil disimpan.");
      qc.invalidateQueries({ queryKey: NAS_KEY });
    },
    onError: (err) => toastError(toast, err, "Gagal menambahkan perangkat."),
  });
}

export function useUpdateNasRouter() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NasRouterFormInput> }) =>
      api.patch<NasRouter>(`/nas-routers/${id}`, input),
    onSuccess: () => {
      toast.success("Perangkat diperbarui", "Perubahan perangkat tersimpan.");
      qc.invalidateQueries({ queryKey: NAS_KEY });
    },
    onError: (err) => toastError(toast, err, "Gagal memperbarui perangkat."),
  });
}

export function useDeleteNasRouter() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => api.del(`/nas-routers/${id}`),
    onSuccess: () => {
      toast.success("Perangkat dihapus", "Router/NAS telah dihapus dari daftar.");
      qc.invalidateQueries({ queryKey: NAS_KEY });
    },
    onError: (err) => toastError(toast, err, "Gagal menghapus perangkat."),
  });
}

/** Tes koneksi ke router — hasil ditampilkan pemanggil (toast/dialog). */
export function useTestNasConnection() {
  return useMutation({
    mutationFn: (id: string) =>
      api.post<NasConnectionTestResult>(`/nas-routers/${id}/test-connection`),
  });
}
