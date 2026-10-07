"use client";

import { useState } from "react";
import { Banknote, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePortalInvoice, usePortalInvoices } from "@/hooks/use-portal";
import { formatDate, formatRupiah } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export default function PortalInvoicesPage() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const invoices = usePortalInvoices();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Tagihan</h2>
        <p className="text-sm text-slate-400">Daftar dan detail tagihan langganan Anda.</p>
      </div>

      <Card>
        {invoices.isLoading && <TableSkeleton rows={5} cols={4} />}
        {invoices.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Tagihan tidak dapat dimuat"
              description="Server API tidak terjangkau. Coba lagi nanti."
              action={<Button variant="outline" onClick={() => invoices.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {invoices.data && invoices.data.length === 0 && (
          <div className="p-6">
            <EmptyState
              icon={Receipt}
              title="Belum ada tagihan"
              description="Tagihan Anda akan muncul di sini setelah diterbitkan."
            />
          </div>
        )}
        {invoices.data && invoices.data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Tagihan</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.data.map((inv) => (
                  <TableRow key={inv.id} clickable onClick={() => setDetailId(inv.id)}>
                    <TableCell className="font-mono text-xs">{inv.invoiceNo}</TableCell>
                    <TableCell className="text-slate-300">{inv.period}</TableCell>
                    <TableCell className="font-semibold text-slate-100">{formatRupiah(inv.total)}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <InvoiceDetailDialog invoiceId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

function InvoiceDetailDialog({
  invoiceId,
  onClose,
}: {
  invoiceId: string | null;
  onClose: () => void;
}) {
  const detail = usePortalInvoice(invoiceId);
  const invoice: Invoice | undefined = detail.data;

  return (
    <Dialog
      open={!!invoiceId}
      onClose={onClose}
      title={invoice ? invoice.invoiceNo : "Detail Tagihan"}
      description={invoice ? `Periode ${invoice.period}` : undefined}
    >
      {detail.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}
      {detail.isError && (
        <EmptyState offline title="Detail tidak dapat dimuat" description="Coba lagi nanti." />
      )}
      {invoice && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <InvoiceStatusBadge status={invoice.status} />
            <p className="text-xs text-slate-500">Jatuh tempo {formatDate(invoice.dueDate)}</p>
          </div>

          <dl className="space-y-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 text-sm">
            <Row label="Subtotal" value={formatRupiah(invoice.subtotal)} />
            {invoice.discount > 0 && <Row label="Diskon" value={`-${formatRupiah(invoice.discount)}`} />}
            {invoice.adminFee > 0 && <Row label="Biaya admin" value={formatRupiah(invoice.adminFee)} />}
            {invoice.tax > 0 && <Row label="Pajak" value={formatRupiah(invoice.tax)} />}
            <Row label="Total" value={formatRupiah(invoice.total)} strong />
            <Row label="Sudah dibayar" value={formatRupiah(invoice.paidAmount)} />
            <Row
              label="Sisa"
              value={formatRupiah(Math.max(invoice.total - invoice.paidAmount, 0))}
              strong
            />
          </dl>

          {(invoice.status === "UNPAID" || invoice.status === "OVERDUE" || invoice.status === "PARTIAL") && (
            <div className="rounded-lg border border-brand-500/30 bg-brand-500/10 p-4 text-sm">
              <div className="flex items-start gap-2">
                <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden />
                <div className="space-y-1 text-slate-300">
                  <p className="font-semibold text-slate-100">Cara membayar</p>
                  <p>
                    Lakukan transfer ke rekening perusahaan, lalu kirim bukti pembayaran ke
                    layanan pelanggan agar pembayaran segera dikonfirmasi.
                  </p>
                  <p className="text-xs text-slate-400">
                    Cantumkan nomor tagihan {invoice.invoiceNo} pada keterangan transfer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className={strong ? "font-bold text-slate-100" : "text-slate-200"}>{value}</dd>
    </div>
  );
}
