"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { Invoice, InvoiceStatus, Paginated, PaymentMethod } from "@/lib/types";

export interface InvoiceFilters {
  status?: InvoiceStatus | "";
  customerId?: string;
  page?: number;
  limit?: number;
}

const INVOICE_KEY = ["invoices"];

export function useInvoices(filters: InvoiceFilters) {
  const { page = 1, limit = 20, ...rest } = filters;
  return useQuery<Paginated<Invoice>>({
    queryKey: [...INVOICE_KEY, "list", { ...rest, page, limit }],
    queryFn: () => api.get<Paginated<Invoice>>("/billing/invoices", { ...rest, page, limit }),
    placeholderData: (prev) => prev,
  });
}

export function useRecentInvoices(limit = 5) {
  return useQuery<Paginated<Invoice>>({
    queryKey: [...INVOICE_KEY, "recent", limit],
    queryFn: () => api.get<Paginated<Invoice>>("/billing/invoices", { page: 1, limit }),
  });
}

export function useCustomerInvoices(customerId: string | null | undefined, limit = 5) {
  return useQuery<Paginated<Invoice>>({
    queryKey: [...INVOICE_KEY, "by-customer", customerId, limit],
    queryFn: () =>
      api.get<Paginated<Invoice>>("/billing/invoices", { customerId, page: 1, limit }),
    enabled: !!customerId,
  });
}

export interface CreateInvoiceInput {
  customerId: string;
  period: string;
  subtotal: number;
  discount?: number;
  adminFee?: number;
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => api.post<Invoice>("/billing/invoices", input),
    onSuccess: (inv) => {
      toast.success("Tagihan dibuat", `No. ${inv.invoiceNo} berhasil diterbitkan.`);
      qc.invalidateQueries({ queryKey: INVOICE_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Gagal membuat tagihan.";
      toast.error("Gagal", message);
    },
  });
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export function useRecordPayment() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ invoiceId, ...body }: RecordPaymentInput) =>
      api.post(`/billing/invoices/${invoiceId}/payments`, body),
    onSuccess: () => {
      toast.success("Pembayaran dicatat", "Status tagihan telah diperbarui.");
      qc.invalidateQueries({ queryKey: INVOICE_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Gagal mencatat pembayaran.";
      toast.error("Gagal", message);
    },
  });
}
