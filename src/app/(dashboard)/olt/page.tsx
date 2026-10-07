"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGeoJson } from "@/hooks/use-gis";
import type { GeoJsonFeature } from "@/lib/types";

function statusTone(status: string): "emerald" | "red" | "amber" | "slate" {
  const s = status.toUpperCase();
  if (s === "ONLINE" || s === "ACTIVE") return "emerald";
  if (s === "OFFLINE" || s === "DOWN") return "red";
  if (s === "DEGRADED" || s === "MAINTENANCE") return "amber";
  return "slate";
}

function statusLabel(status: string): string {
  const s = status.toUpperCase();
  if (s === "ONLINE" || s === "ACTIVE") return "Online";
  if (s === "OFFLINE" || s === "DOWN") return "Offline";
  if (s === "DEGRADED") return "Degraded";
  if (s === "MAINTENANCE") return "Maintenance";
  return status || "-";
}

function prop(f: GeoJsonFeature, key: string): string {
  const v = f.properties[key];
  return v === null || v === undefined ? "-" : String(v);
}

export default function OltPage() {
  const olt = useGeoJson("olt");

  const online =
    olt.data?.features.filter((f) =>
      ["ONLINE", "ACTIVE"].includes(String(f.properties.status).toUpperCase()),
    ).length ?? 0;
  const total = olt.data?.features.length ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">OLT / FTTH</h2>
        <p className="text-sm text-slate-400">
          Daftar OLT dan status operasional dari database GIS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {olt.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400">Total OLT</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-50">{total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400">Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-400">{online}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400">Bermasalah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-400">{total - online}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        {olt.isLoading && <TableSkeleton rows={5} cols={6} />}
        {olt.isError && (
          <div className="p-6">
            <EmptyState
              offline
              title="Data OLT tidak dapat dimuat"
              description="Server API tidak terjangkau. Periksa koneksi backend lalu coba lagi."
              action={<Button variant="outline" onClick={() => olt.refetch()}>Coba Lagi</Button>}
            />
          </div>
        )}
        {olt.data && olt.data.features.length === 0 && (
          <div className="p-6">
            <EmptyState title="Belum ada OLT" description="Tambahkan data OLT melalui modul GIS." />
          </div>
        )}
        {olt.data && olt.data.features.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>IP Manajemen</TableHead>
                  <TableHead>POP</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {olt.data.features.map((f, i) => (
                  <TableRow key={`${prop(f, "code")}-${i}`}>
                    <TableCell className="font-mono text-xs">{prop(f, "code")}</TableCell>
                    <TableCell className="font-medium text-slate-100">{prop(f, "name")}</TableCell>
                    <TableCell className="text-slate-300">{prop(f, "model")}</TableCell>
                    <TableCell className="text-slate-300">{prop(f, "vendor")}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{prop(f, "mgmtIp")}</TableCell>
                    <TableCell className="text-slate-300">{prop(f, "popName")}</TableCell>
                    <TableCell>
                      <Badge tone={statusTone(prop(f, "status"))}>
                        {statusLabel(prop(f, "status"))}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
