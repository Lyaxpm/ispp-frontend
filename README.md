# ISP Platform — Frontend (Next.js)

Dashboard admin & konsol NOC untuk ISP Platform. **Backend (API NestJS) ada di
repo terpisah: [LyaXpm/ispp-backend](https://github.com/LyaXpm/ispp-backend).**
Panduan deploy cloud lengkap (Vercel + Railway + Supabase): lihat
[DEPLOY.md](https://github.com/LyaXpm/ispp-backend/blob/main/DEPLOY.md).

## Teknologi

Next.js 14 App Router · TypeScript · Tailwind CSS · Leaflet + react-leaflet
(peta GIS, `ssr: false`) · Recharts · TanStack Query · axios.

## Jalan lokal

```bash
npm install
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL=http://localhost:3000/api
npm run dev                  # http://localhost:3001
```

Login memakai akun dari backend (`admin@isp.local` / `admin123` bawaan seed).
Token JWT disimpan di `localStorage` (`isp_token`).

## Variabel environment

| Key | Contoh | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | URL basis API backend (termasuk `/api`) |
| `NEXT_PUBLIC_MAP_TILES` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Tile server peta (opsional) |

## Halaman

- `/` — dashboard (statistik, grafik pendapatan, alarm NOC)
- `/customers` — CRUD pelanggan + drawer detail (langganan, tagihan, ONU)
- `/billing` — daftar invoice, buat invoice manual, catat pembayaran
- `/gis` — peta FTTH (OLT/ODC/ODP/pelanggan/kabel), tool ODP terdekat
- `/noc` — konsol NOC (polling 30 dtk, aksi isolir/aktif/throttle/kick/reboot ONU)
- `/olt`, `/tickets`, `/inventory`, `/settings`, `/login`

## Deploy ke Vercel

1. Vercel → Add New → Project → Import `LyaXpm/ispp-frontend`
   (tidak perlu setting Root Directory — repo ini memang frontend saja).
2. Environment Variables: `NEXT_PUBLIC_API_URL=https://<url-backend-railway>/api`
3. Deploy. Setelah dapat URL Vercel, isi `CORS_ORIGIN` di backend (Railway)
   dengan URL tersebut lalu redeploy backend.

## Catatan

- Peta Leaflet di-load dengan `next/dynamic` + `ssr: false` — aman untuk
  build/SSR Vercel.
- Bahasa UI: Bahasa Indonesia.
