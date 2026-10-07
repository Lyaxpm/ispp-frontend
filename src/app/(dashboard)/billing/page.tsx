"use client";

import { useState, type FormEvent } from "react";
import { FilePlus2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  useCreateInvoice,
  useInvoices,
  useRecordPayment,
  type CreateInvoiceInput,
} from "@/hooks/use-invoices";
import { useCustomers } from "@/hooks/use-customers";
import type { Invoice, InvoiceStatus, PaymentMethod } from "@/lib/types";
import { formatDate, formatRupiah, invoiceStatusLabels } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_FILTER = [
  { value: "", label: "Semua status" },
  ...Object.entries(invoiceStatusLabels).map(([value, label]) => ({ value, label })),
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "TRANSFER", label: "Transfer Bank" },
  { value: "VA", label: "Virtual Account" },
  { value: "QRIS", label: "QRIS" },
  { value: "EWALLET", label: "E-Wallet" },
  { value: "RETAIL", label: "Gerai Retail" },
];

export default function BillingPage() {
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);

  const invoices = useInvoices({ status: status || undefined, page, limit: 20 });
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();

  const totalTagihan = (invoices.data?.data ?? []).reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Tagihan</h2>
          <p className="text-sm text-slate-400">Kelola invoice pelanggan dan pencatatan pembayaran.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <FilePlus2 className="h-4 w-4" />
          Buat Tagihan Manual
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-56">
            <Select
              label="Filter status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as InvoiceStatus | "");
                setPage(1);
              }}
              options={STATUS_FILTER}
            />
          </div>
          <p className="text-sm text-slate-400">
            Total pada halaman ini:{" "}
            <span className="font-semibold text-slate-100">{formatRupiah(totalTagihan)}</span>
          </p>
        </div>
      </Card>

      <Card>
        {invoices.isLoading && <TableSkeleton rows={8} cols={6} />}
        {invoices.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Data tagihan tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu coba lagi."
              action={<Button variant="outline" onClick={() => invoices.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {invoices.data && invoices.data.data.length === 0 && (
          <div className="p-6">
            <EmptyState title="Tidak ada tagihan" description="Belum ada invoice pada filter ini." />
          </div>
        )}
        {invoices.data && invoices.data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.data.data.map((inv) => (
                    <TableRow key={inv.id} className={cn(inv.isOverdue && "bg-red-500/5")}>
                      <TableCell className="font-mono text-xs">{inv.invoiceNo}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-100">{inv.customer?.name ?? "-"}</p>
                        <p className="text-xs text-slate-500">{inv.customer?.customerNo ?? ""}</p>
                      </TableCell>
                      <TableCell className="text-slate-300">{inv.period}</TableCell>
                      <TableCell>
                        <p className={cn("font-semibold", inv.isOverdue ? "text-red-300" : "text-slate-100")}>
                          {formatRupiah(inv.total)}
                        </p>
                        {inv.paidAmount > 0 && inv.status === "PARTIAL" && (
                          <p className="text-xs text-slate-500">
                            Terbayar {formatRupiah(inv.paidAmount)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className={cn(inv.isOverdue && "font-medium text-red-300")}>
                        {formatDate(inv.dueDate)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status !== "PAID" && inv.status !== "VOID" && (
                          <Button size="sm" variant="outline" onClick={() => setPayTarget(inv)}>
                            <Wallet className="h-3.5 w-3.5" />
                            Catat Pembayaran
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-slate-700/60 p-4">
              <Pagination
                page={invoices.data.meta.page}
                totalPages={invoices.data.meta.totalPages}
                total={invoices.data.meta.total}
                limit={invoices.data.meta.limit}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      {/* Dialog buat tagihan manual */}
      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Tagihan Manual"
        description="Terbitkan invoice baru untuk pelanggan di luar siklus otomatis."
      >
        <CreateInvoiceForm
          pending={createInvoice.isPending}
          onCancel={() => setShowCreate(false)}
          onSubmit={(input) => createInvoice.mutate(input, { onSuccess: () => setShowCreate(false) })}
        />
      </Dialog>

      {/* Dialog catat pembayaran */}
      <Dialog
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        title="Catat Pembayaran"
        description={
          payTarget
            ? `Invoice ${payTarget.invoiceNo} — sisa ${formatRupiah(payTarget.total - payTarget.paidAmount)}`
            : undefined
        }
      >
        {payTarget && (
          <RecordPaymentForm
            invoice={payTarget}
            pending={recordPayment.isPending}
            onCancel={() => setPayTarget(null)}
            onSubmit={(amount, method, reference) =>
              recordPayment.mutate(
                { invoiceId: payTarget.id, amount, method, reference },
                { onSuccess: () => setPayTarget(null) }
              )
            }
          />
        )}
      </Dialog>
    </div>
  );
}

function CreateInvoiceForm({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateInvoiceInput) => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [discount, setDiscount] = useState("0");
  const [adminFee, setAdminFee] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const customerSearch = useCustomers({ search: search.trim() || undefined, limit: 10, page: 1 });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const sub = Number(subtotal);
    if (!customerId) {
      setError("Pilih pelanggan terlebih dahulu.");
      return;
    }
    if (!period.trim()) {
      setError("Periode wajib diisi (cth: 2026-10).");
      return;
    }
    if (!Number.isFinite(sub) || sub <= 0) {
      setError("Subtotal harus angka positif.");
      return;
    }
    setError(null);
    onSubmit({
      customerId,
      period: period.trim(),
      subtotal: sub,
      discount: Number(discount) || 0,
      adminFee: Number(adminFee) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="inv-cust-search" className="text-sm font-medium text-slate-300">
          Pelanggan
        </label>
        <input
          id="inv-cust-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ketik nama / nomor pelanggan..."
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
        <select
          aria-label="Pilih pelanggan"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          size={Math.min(5, Math.max(2, (customerSearch.data?.data.length ?? 0)))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="">— Pilih dari hasil pencarian —</option>
          {(customerSearch.data?.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.customerNo} — {c.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Periode"
        placeholder="2026-10"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Subtotal (Rp)"
          type="number"
          min={1}
          value={subtotal}
          onChange={(e) => setSubtotal(e.target.value)}
        />
        <Input
          label="Diskon (Rp)"
          type="number"
          min={0}
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        <Input
          label="Biaya Admin (Rp)"
          type="number"
          min={0}
          value={adminFee}
          onChange={(e) => setAdminFee(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={pending}>
          Terbitkan Tagihan
        </Button>
      </div>
    </form>
  );
}

function RecordPaymentForm({
  invoice,
  pending,
  onCancel,
  onSubmit,
}: {
  invoice: Invoice;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (amount: number, method: PaymentMethod, reference?: string) => void;
}) {
  const remaining = invoice.total - invoice.paidAmount;
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Jumlah pembayaran harus angka positif.");
      return;
    }
    if (value > remaining) {
      setError(`Jumlah melebihi sisa tagihan (${formatRupiah(remaining)}).`);
      return;
    }
    setError(null);
    onSubmit(value, method, reference.trim() || undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Jumlah (Rp)"
        type="number"
        min={1}
        max={remaining}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        hint={`Sisa tagihan: ${formatRupiah(remaining)}`}
      />
      <Select
        label="Metode pembayaran"
        value={method}
        onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        options={PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label }))}
      />
      <Input
        label="Referensi (opsional)"
        placeholder="No. bukti transfer / VA / kuitansi"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={pending}>
          Simpan Pembayaran
        </Button>
      </div>
    </form>
  );
}
