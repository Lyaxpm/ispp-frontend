"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { DashboardStats, RevenuePoint } from "@/lib/types";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.get<DashboardStats>("/dashboard/stats"),
  });
}

export function useRevenueChart(months = 6) {
  return useQuery<RevenuePoint[]>({
    queryKey: ["dashboard", "revenue-chart", months],
    queryFn: () => api.get<RevenuePoint[]>("/dashboard/revenue-chart", { months }),
  });
}
