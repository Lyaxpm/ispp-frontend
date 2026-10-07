"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomerStatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  useCustomers,
  useCustomer,
  usePackages,
  useIsolateCustomer,
  useUnisolateCustomer,
  usePortalAccount,
  useCreatePortalAccount,
  useResetPortalPassword,
  type CustomerFilters,
} from "@/hooks/use-customers";
import { useCustomerInvoices } from "@/hooks/use-invoices";
import type { CustomerStatus } from "@/lib/types";
import {
  customerStatusLabels,
  formatDate,
  formatDbm,
  formatMbps,
  formatRupiah,
} from "@/lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "Semua status" },
  ...Object.entries(customerStatusLabels).map(([value, label]) => ({ value, label })),
];

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilters>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  const customers = useCustomers(filters);
  const packages = usePackages();

  const applySearch = () => setFilters((f) => ({ ...f, search: searchInput.trim() || undefined, page: 1 }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Pelanggan</h2>
        <p className="text-sm text-slate-400">Kelola data pelanggan, langganan, dan perangkat ONU.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative flex-1">
            <label htmlFor="customer-search" className="mb-1.5 block text-sm font-medium text-slate-300">
              Pencarian
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                id="customer-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Nama, ID pelanggan, alamat, kode ODP..."
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <Select
              label="Status"
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: (e.target.value || undefined) as CustomerStatus | undefined, page: 1 }))
              }
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="w-full lg:w-56">
            <Select
              label="Paket"
              value={filters.packageId ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, packageId: e.target.value || undefined, page: 1 }))
              }
              options={[
                { value: "", label: "Semua paket" },
                ...(packages.data ?? []).map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
          <Button onClick={applySearch}>Cari</Button>
        </div>
      </Card>

      <Card>
        {customers.isLoading && <TableSkeleton rows={8} cols={5} />}
        {customers.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Data pelanggan tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu coba lagi."
              action={<Button variant="outline" onClick={() => customers.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {customers.data && customers.data.data.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="Tidak ada pelanggan"
              description="Belum ada data pelanggan yang cocok dengan filter."
            />
          </div>
        )}
        {customers.data && customers.data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pelanggan</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.data.data.map((c) => (
                    <TableRow key={c.id} clickable onClick={() => setDetailId(c.id)}>
                      <TableCell className="font-mono text-xs">{c.customerNo}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-100">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.phone ?? "-"}</p>
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-slate-400">{c.address}</TableCell>
                      <TableCell className="text-slate-300">{c.subscription?.package?.name ?? "-"}</TableCell>
                      <TableCell>
                        <CustomerStatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-slate-700/60 p-4">
              <Pagination
                page={customers.data.meta.page}
                totalPages={customers.data.meta.totalPages}
                total={customers.data.meta.total}
                limit={customers.data.meta.limit}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            </div>
          </>
        )}
      </Card>

      <CustomerDetailDialog customerId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

function CustomerDetailDialog({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) {
  const detail = useCustomer(customerId);
  const customerInvoices = useCustomerInvoices(customerId, 3);
  const isolate = useIsolateCustomer();
  const unisolate = useUnisolateCustomer();

  const customer = detail.data;

  return (
    <Dialog
      open={!!customerId}
      onClose={onClose}
      title={customer ? `${customer.name}` : "Detail Pelanggan"}
      description={customer ? `No. ${customer.customerNo}` : undefined}
      wide
    >
      {detail.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {detail.isError && (
        <EmptyState
          offline
          title="Detail tidak dapat dimuat"
          description="Server API tidak terjangkau."
        />
      )}
      {customer && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <CustomerStatusBadge status={customer.status} />
            <span className="text-xs text-slate-500">Kategori: {customer.category}</span>
          </div>

          {/* Identitas */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-200">Identitas</h3>
            <dl className="grid grid-cols-1 gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 text-sm sm:grid-cols-2">
              <DetailItem label="Alamat" value={customer.address} />
              <DetailItem label="Telepon" value={customer.phone} />
              <DetailItem label="Email" value={customer.email} />
              <DetailItem label="No. KTP" value={customer.ktpNumber} />
              <DetailItem label="Jatuh tempo tiap tgl" value={String(customer.dueDay)} />
              <DetailItem label="Saldo" value={formatRupiah(customer.balance)} />
            </dl>
          </section>

          {/* Langganan */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-200">Langganan</h3>
            {customer.subscription ? (
              <dl className="grid grid-cols-1 gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 text-sm sm:grid-cols-2">
                <DetailItem label="Paket" value={customer.subscription.package?.name} />
                <DetailItem
                  label="Kecepatan"
                  value={
                    customer.subscription.package
                      ? `${customer.subscription.package.downloadMbps} / ${customer.subscription.package.uploadMbps} Mbps`
                      : undefined
                  }
                />
                <DetailItem
                  label="Harga"
                  value={customer.subscription.package ? formatRupiah(customer.subscription.package.price) : undefined}
                />
                <DetailItem label="Username PPPoE" value={customer.subscription.pppoeUsername} />
                <DetailItem label="IP Address" value={customer.subscription.ipAddress} />
                <DetailItem label="Mulai" value={formatDate(customer.subscription.startDate)} />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Belum ada langganan aktif.</p>
            )}
          </section>

          {/* ONU */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-200">Perangkat ONU</h3>
            {customer.onu ? (
              <dl className="grid grid-cols-1 gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 text-sm sm:grid-cols-2">
                <DetailItem label="Serial Number" value={customer.onu.serialNumber} />
                <DetailItem label="Model" value={`${customer.onu.vendor} ${customer.onu.model}`} />
                <DetailItem label="MAC" value={customer.onu.mac} />
                <DetailItem label="Status" value={customer.onu.status} />
                <DetailItem label="RX Power" value={formatDbm(customer.onu.rxPowerDbm)} />
                <DetailItem label="Terakhir terlihat" value={formatDate(customer.onu.lastSeenAt)} />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Belum ada ONU terdaftar.</p>
            )}
          </section>

          {/* Tagihan terakhir */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-200">Tagihan Terakhir</h3>
            {customerInvoices.isLoading && <Skeleton className="h-16 w-full" />}
            {customerInvoices.data && customerInvoices.data.data.length > 0 ? (
              <ul className="space-y-2">
                {customerInvoices.data.data.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/50 px-4 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-mono text-xs text-slate-400">{inv.invoiceNo}</p>
                      <p className="text-slate-300">{inv.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-100">{formatRupiah(inv.total)}</p>
                      <p className="text-xs text-slate-500">Jatuh tempo {formatDate(inv.dueDate)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Belum ada tagihan.</p>
            )}
          </section>

          {/* Akun Portal */}
          <PortalAccountSection customerId={customer.id} defaultEmail={customer.email} />

          {/* Aksi cepat */}
          <section className="flex flex-wrap gap-2 border-t border-slate-700/60 pt-4">
            {customer.status === "ISOLATED" ? (
              <Button
                variant="success"
                loading={unisolate.isPending}
                onClick={() => unisolate.mutate(customer.id, { onSuccess: onClose })}
              >
                Aktifkan Pelanggan
              </Button>
            ) : (
              <Button
                variant="danger"
                loading={isolate.isPending}
                onClick={() =>
                  isolate.mutate(
                    { id: customer.id, reason: "Isolir manual dari halaman pelanggan" },
                    { onSuccess: onClose }
                  )
                }
              >
                Isolir Pelanggan
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </section>
        </div>
      )}
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value ?? "-"}</dd>
    </div>
  );
}

function PortalAccountSection({
  customerId,
  defaultEmail,
}: {
  customerId: string;
  defaultEmail?: string | null;
}) {
  const account = usePortalAccount(customerId);
  const create = useCreatePortalAccount();
  const reset = useResetPortalPassword();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showReset, setShowReset] = useState(false);

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-200">Akun Portal Pelanggan</h3>
      <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-4 text-sm">
        {account.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : account.data?.hasAccount ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-slate-200">{account.data.email}</p>
                <p className="text-xs text-slate-500">
                  Login terakhir: {account.data.lastLoginAt ? formatDate(account.data.lastLoginAt) : "belum pernah"}
                </p>
              </div>
              <span className="inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/40">
                Akun aktif
              </span>
            </div>
            {showReset ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="password"
                  placeholder="Kata sandi baru (min 8 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  loading={reset.isPending}
                  onClick={() =>
                    reset.mutate(
                      { id: customerId, newPassword },
                      { onSuccess: () => { setNewPassword(""); setShowReset(false); } }
                    )
                  }
                >
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setShowReset(false)}>
                  Batal
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowReset(true)}>
                Reset Kata Sandi
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pelanggan belum punya akun portal. Buatkan agar ia bisa login di Portal Pelanggan.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder="email@contoh.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Kata sandi (min 8 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                loading={create.isPending}
                onClick={() =>
                  create.mutate(
                    { id: customerId, email, password },
                    { onSuccess: () => setPassword("") }
                  )
                }
              >
                Buat Akun
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
