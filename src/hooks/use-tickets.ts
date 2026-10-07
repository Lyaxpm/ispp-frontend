"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Paginated, Ticket, TicketStatus } from "@/lib/types";

export interface TicketFilters {
  status?: TicketStatus | "";
  page?: number;
  limit?: number;
}

export function useTickets(filters: TicketFilters) {
  const { page = 1, limit = 20, ...rest } = filters;
  return useQuery<Paginated<Ticket>>({
    queryKey: ["tickets", "list", { ...rest, page, limit }],
    queryFn: () => api.get<Paginated<Ticket>>("/tickets", { ...rest, page, limit }),
    placeholderData: (prev) => prev,
  });
}
