"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  serialNumber: string | null;
  mac: string | null;
  quantity: number;
  warehouse: string | null;
  condition: string;
}

const CATEGORY_FILTER = [
  { value: "", label: "Semua kategori" },
  { value: "ONU", label: "ONU / ONT" },
  { value: "ROUTER", label: "Router" },
  { value: "SPLITTER", label: "Splitter" },
  { value: "CABLE", label: "Kabel Fiber" },
  { value: "OTHER", label: "Lainnya" },
];

function useInventory(category: string, page: number) {
  return useQuery<Paginated<InventoryItem>>({
    queryKey: ["inventory", "items", category, page],
    queryFn: () =>
      api.get<Paginated<InventoryItem>>("/inventory/items", {
        category: category || undefined,
        page,
        limit: 20,
      }),
    placeholderData: (prev) => prev,
  });
}

export default function InventoryPage() {
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const items = useInventory(category, page);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Inventaris</h2>
        <p className="text-sm text-slate-400">
          Stok perangkat: ONU, router, splitter, dan kabel fiber.
        </p>
      </div>

      <Card className="p-4">
        <div className="w-full sm:w-56">
          <Select
            label="Filter kategori"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={CATEGORY_FILTER}
          />
        </div>
      </Card>

      <Card>
        {items.isLoading && <TableSkeleton rows={8} cols={5} />}
        {items.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Data inventaris tidak dapat dimuat"
              description="Server API tidak terjangkau atau modul inventaris belum aktif di backend."
              action={<Button variant="outline" onClick={() => items.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {items.data && items.data.data.length === 0 && (
          <div className="p-6">
            <EmptyState title="Stok kosong" description="Belum ada barang pada kategori ini." />
          </div>
        )}
        {items.data && items.data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>SN / MAC</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Kondisi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.data.data.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-mono text-xs">{it.sku}</TableCell>
                      <TableCell className="font-medium text-slate-100">{it.name}</TableCell>
                      <TableCell className="text-slate-300">{it.category}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {it.serialNumber ?? it.mac ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge tone={it.quantity > 0 ? "emerald" : "red"}>
                          {it.quantity} unit
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{it.condition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-slate-700/60 p-4">
              <Pagination
                page={items.data.meta.page}
                totalPages={items.data.meta.totalPages}
                total={items.data.meta.total}
                limit={items.data.meta.limit}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
