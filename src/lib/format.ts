import { format } from "date-fns";
import { id } from "date-fns/locale";
import type {
  CustomerStatus,
  InvoiceStatus,
  TicketPriority,
  TicketStatus,
} from "./types";

/** Format angka ke Rupiah, cth: Rp1.500.000 */
export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format tanggal ke id-ID, cth: 7 Okt 2026 */
export function formatDate(
  value: string | Date | null | undefined,
  pattern = "d MMM yyyy"
): string {
  if (!value) return "-";
  try {
    return format(new Date(value), pattern, { locale: id });
  } catch {
    return "-";
  }
}

/** Format tanggal + jam, cth: 7 Okt 2026, 19.04 */
export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "d MMM yyyy, HH.mm");
}

/** Format Kbps ke label Mbps yang mudah dibaca. */
export function formatMbps(kbps: number | null | undefined): string {
  if (kbps === null || kbps === undefined) return "-";
  if (kbps >= 1000) {
    const mbps = kbps / 1000;
    return `${Number.isInteger(mbps) ? mbps : mbps.toFixed(1)} Mbps`;
  }
  return `${kbps} Kbps`;
}

/** Format daya optik dBm. */
export function formatDbm(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(2)} dBm`;
}

export const customerStatusLabels: Record<CustomerStatus, string> = {
  CANDIDATE: "Kandidat",
  TRIAL: "Trial",
  ACTIVE: "Aktif",
  ISOLATED: "Terisolir",
  SUSPENDED: "Suspend",
  TERMINATED: "Terminasi",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  UNPAID: "Belum Bayar",
  PAID: "Lunas",
  OVERDUE: "Jatuh Tempo",
  PARTIAL: "Sebagian",
  VOID: "Batal",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  OPEN: "Terbuka",
  IN_PROGRESS: "Dikerjakan",
  RESOLVED: "Selesai",
  CLOSED: "Ditutup",
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  CRITICAL: "Kritis",
};

export const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  NOC: "NOC",
  CASHIER: "Kasir",
  TECHNICIAN: "Teknisi",
  CS: "CS",
};
