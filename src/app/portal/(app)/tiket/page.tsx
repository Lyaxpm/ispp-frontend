"use client";

import { useState, type FormEvent } from "react";
import { Plus, Ticket as TicketIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { TicketStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreatePortalTicket, usePortalTickets } from "@/hooks/use-portal";
import { formatDateTime } from "@/lib/format";

const CATEGORY_OPTIONS = [
  { value: "", label: "Pilih kategori" },
  { value: "GANGGUAN", label: "Gangguan koneksi" },
  { value: "PEMBAYARAN", label: "Pembayaran/tagihan" },
  { value: "UPGRADE", label: "Upgrade/downgrade paket" },
  { value: "PINDAH", label: "Pindah alamat" },
  { value: "LAINNYA", label: "Lainnya" },
];

export default function PortalTicketsPage() {
  const [open, setOpen] = useState(false);
  const tickets = usePortalTickets();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Tiket Bantuan</h2>
          <p className="text-sm text-slate-400">Laporkan gangguan atau sampaikan keluhan Anda.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Buat Tiket
        </Button>
      </div>

      <Card>
        {tickets.isLoading && <TableSkeleton rows={5} cols={3} />}
        {tickets.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Tiket tidak dapat dimuat"
              description="Server API tidak terjangkau. Coba lagi nanti."
              action={<Button variant="outline" onClick={() => tickets.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {tickets.data && tickets.data.length === 0 && (
          <div className="p-6">
            <EmptyState
              icon={TicketIcon}
              title="Belum ada tiket"
              description="Anda belum pernah membuat tiket bantuan."
              action={<Button onClick={() => setOpen(true)}>Buat Tiket</Button>}
            />
          </div>
        )}
        {tickets.data && tickets.data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Tiket</TableHead>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.data.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.ticketNo}</TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-100">{t.subject}</p>
                      <p className="max-w-[280px] truncate text-xs text-slate-500">{t.description}</p>
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
        )}
      </Card>

      <CreateTicketDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function CreateTicketDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useCreatePortalTicket();

  function reset() {
    setSubject("");
    setMessage("");
    setCategory("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (subject.trim().length < 5) {
      setError("Subjek minimal 5 karakter.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Jelaskan keluhan Anda minimal 10 karakter.");
      return;
    }
    create.mutate(
      { subject: subject.trim(), message: message.trim(), category: category || undefined },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Buat Tiket Baru" description="Sampaikan keluhan atau gangguan layanan Anda.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
        <Input
          label="Subjek"
          placeholder="Contoh: Internet lambat sejak kemarin"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={create.isPending}
        />
        <Select
          label="Kategori"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={create.isPending}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-message" className="text-sm font-medium text-slate-300">
            Pesan
          </label>
          <textarea
            id="ticket-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={create.isPending}
            placeholder="Ceritakan detail keluhan: sejak kapan, gejala yang dialami, lokasi..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={create.isPending}>
            Batal
          </Button>
          <Button type="submit" loading={create.isPending}>
            Kirim Tiket
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
