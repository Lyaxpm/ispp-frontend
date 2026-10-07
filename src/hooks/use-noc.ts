"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { CustomerStatus, NocCustomerRow } from "@/lib/types";

export interface NocFilters {
  status?: "ALL" | "ONLINE" | "OFFLINE";
  search?: string;
}

/**
 * Daftar pelanggan NOC dengan polling 30 detik untuk status real-time.
 */
export function useNocCustomers(filters: NocFilters = {}) {
  const { status = "ALL", search = "" } = filters;
  return useQuery<NocCustomerRow[]>({
    queryKey: ["noc", "customers", status, search],
    queryFn: () =>
      api.get<NocCustomerRow[]>("/network/noc/customers", {
        status: status === "ALL" ? undefined : status,
        search: search || undefined,
      }),
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function customerRowStatus(row: NocCustomerRow): {
  label: string;
  tone: "emerald" | "slate" | "red";
} {
  if (row.status === "ISOLATED") return { label: "Terisolir", tone: "red" };
  if (row.online) return { label: "Online", tone: "emerald" };
  return { label: "Offline", tone: "slate" };
}

export type { CustomerStatus };
