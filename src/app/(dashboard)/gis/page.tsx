"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const NetworkMap = dynamic(
  () => import("@/components/gis/network-map").then((m) => m.NetworkMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[70vh] w-full rounded-xl" />,
  }
);

export default function GisPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-50">Peta Jaringan FTTH</h2>
        <p className="text-sm text-slate-400">
          Visualisasi OLT, ODC, ODP, pelanggan, dan kabel fiber. Gunakan tombol{" "}
          <span className="font-medium text-slate-200">“Cek ODP Terdekat”</span> lalu klik peta
          untuk survei coverage calon pelanggan.
        </p>
      </div>
      <NetworkMap />
    </div>
  );
}
