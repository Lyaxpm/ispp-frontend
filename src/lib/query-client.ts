"use client";

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-client";

/**
 * QueryClient global: staleTime 30 detik, retry hanya untuk error jaringan,
 * tidak untuk error 4xx (mis. validasi / otorisasi).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
