"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useTickets } from "@/hooks/use-tickets";
import type { Ticket, TicketStatus } from "@/lib/types";
import { formatDateTime, ticketStatusLabels } from "@/lib/format";

const STATUS_FILTER = [
  { value: "", label: "Semua status" },
  ...Object.entries(ticketStatusLabels).map(([value, label]) => ({ value, label })),
];

export default function TicketsPage() {
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Ticket | null>(null);

  const tickets = useTickets({ status: status || undefined, page, limit: 20 });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Tiket</h2>
        <p className="text-sm text-slate-400">Laporan gangguan pelanggan dan work order teknisi.</p>
      </div>

      <Card className="p-4">
        <div className="w-full sm:w-56">
          <Select
            label="Filter status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TicketStatus | "");
              setPage(1);
            }}
            options={STATUS_FILTER}
          />
        </div>
      </Card>

      <Card>
        {tickets.isLoading && <TableSkeleton rows={8} cols={5} />}
        {tickets.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Data tiket tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu coba lagi."
              action={<Button variant="outline" onClick={() => tickets.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {tickets.data && tickets.data.data.length === 0 && (
          <div className="p-6">
            <EmptyState title="Tidak ada tiket" description="Belum ada tiket pada filter ini." />
          </div>
        )}
        {tickets.data && tickets.data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Tiket</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.data.data.map((t) => (
                    <TableRow key={t.id} clickable onClick={() => setDetail(t)}>
                      <TableCell className="font-mono text-xs">{t.ticketNo}</TableCell>
                      <TableCell className="max-w-[260px] truncate font-medium text-slate-100">
                        {t.subject}
                      </TableCell>
                      <TableCell className="text-slate-300">{t.customer?.name ?? "-"}</TableCell>
                      <TableCell>
                        <TicketPriorityBadge priority={t.priority} />
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="text-slate-400">{formatDateTime(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-slate-700/60 p-4">
              <Pagination
                page={tickets.data.meta.page}
                totalPages={tickets.data.meta.totalPages}
                total={tickets.data.meta.total}
                limit={tickets.data.meta.limit}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Dialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? detail.subject : "Detail Tiket"}
        description={detail ? `No. ${detail.ticketNo}` : undefined}
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <TicketStatusBadge status={detail.status} />
              <TicketPriorityBadge priority={detail.priority} />
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{detail.description}</p>
            <dl className="grid grid-cols-1 gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Pelanggan</dt>
                <dd className="mt-0.5 text-slate-200">{detail.customer?.name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Teknisi</dt>
                <dd className="mt-0.5 text-slate-200">{detail.assignee ?? "Belum ditugaskan"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Dibuat</dt>
                <dd className="mt-0.5 text-slate-200">{formatDateTime(detail.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Diperbarui</dt>
                <dd className="mt-0.5 text-slate-200">{formatDateTime(detail.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        )}
      </Dialog>
    </div>
  );
}
