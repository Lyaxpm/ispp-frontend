"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { SystemRole, SystemUser } from "@/lib/types";

const USERS_KEY = ["users"];

function toastError(toast: ReturnType<typeof useToast>, err: unknown, fallback: string) {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error("Gagal", message);
}

export function useSystemUsers(enabled = true) {
  return useQuery<SystemUser[]>({
    queryKey: USERS_KEY,
    queryFn: () => api.get<SystemUser[]>("/users"),
    enabled,
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string; role: SystemRole }) =>
      api.post<SystemUser>("/users", input),
    onSuccess: () => {
      toast.success("Pengguna ditambahkan", "Akun staf baru berhasil dibuat.");
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (err) => toastError(toast, err, "Gagal menambahkan pengguna."),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { name?: string; role?: SystemRole; isActive?: boolean };
    }) => api.patch<SystemUser>(`/users/${id}`, input),
    onSuccess: () => {
      toast.success("Pengguna diperbarui", "Perubahan data pengguna tersimpan.");
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (err) => toastError(toast, err, "Gagal memperbarui pengguna."),
  });
}

export function useResetUserPassword() {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      api.post(`/users/${id}/reset-password`, { newPassword }),
    onSuccess: () => {
      toast.success("Kata sandi direset", "Kata sandi baru sudah bisa dipakai masuk.");
    },
    onError: (err) => toastError(toast, err, "Gagal mereset kata sandi."),
  });
}
