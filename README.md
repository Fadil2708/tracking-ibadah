# Ibadah Tracker Pesantren

Aplikasi web untuk tracking ibadah harian santri/anggota komunitas pesantren dengan fitur verifikasi foto sholat subuh menggunakan GPS + timestamp.

## 🚀 Features

- **Autentikasi** - Register dengan kode komunitas, login dengan username + password
- **Dashboard Harian** - Input ibadah harian (Tahajud, Duha, Subuh, Istigfar, Sholawat, ODOC)
- **Verifikasi Foto Subuh** - Upload foto dengan verifikasi GPS + waktu sholat subuh
  - Parsing EXIF metadata (GPS, timestamp) menggunakan `exifr`
  - Kalkulasi waktu sholat berdasarkan koordinat menggunakan `adhan`
  - Pencarian masjid terdekat via OpenStreetMap Overpass API
  - Tampilan peta lokasi menggunakan Leaflet.js
- **Counter Dzikir** - Counter istigfar & sholawat dengan target 100x
- **Statistik & Riwayat** - Kalender bulanan, streak counter, grafik mingguan
- **Dashboard Musyrif** - Rekap semua santri, export CSV

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (foto subuh) |
| Styling | Tailwind CSS |
| EXIF Parser | `exifr` |
| Prayer Times | `adhan` |
| Masjid Lookup | OpenStreetMap Overpass API |
| Peta | Leaflet.js |

## 📦 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project Supabase di https://supabase.com
2. Dapatkan URL dan API keys dari Settings > API
3. Buat file `.env.local` dan isi dengan credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Setup Database

Jalankan SQL di `supabase/schema.sql` di SQL Editor Supabase Anda:

```sql
-- Copy paste isi dari supabase/schema.sql
```

### 4. Setup Storage Bucket

1. Buka Storage di Supabase dashboard
2. Buat bucket baru bernama `subuh-photos`
3. Set policy agar authenticated users bisa upload

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Project Structure

```
app/
  (auth)/
    login/page.tsx          ← Halaman login
    register/page.tsx       ← Halaman register
  (dashboard)/
    page.tsx                ← Dashboard harian santri
    history/page.tsx        ← Riwayat & kalender
    musyrif/page.tsx        ← Dashboard musyrif
components/
  AuthProvider.tsx          ← Context provider auth
  SubuhUploader.tsx         ← Upload + EXIF parsing
  DzikirCounter.tsx         ← Counter istigfar & sholawat
  VerificationMap.tsx       ← Peta lokasi foto
  DailyChecklist.tsx        ← Daftar ibadah harian
lib/
  supabase.ts               ← Supabase client
  supabase-server.ts        ← Supabase server client
  prayerTime.ts             ← Wrapper adhan
  exifParser.ts             ← Wrapper exifr
  overpassApi.ts            ← Query masjid terdekat
  types.ts                  ← TypeScript types
supabase/
  schema.sql                ← Skema database
```

## 🎯 User Roles

| Role | Akses |
|------|-------|
| `santri` | Input ibadah harian, lihat progress pribadi |
| `musyrif` | Lihat rekap seluruh santri, export laporan |
| `admin` | Kelola user, setting komunitas |

## ✅ Verifikasi Foto Subuh

Alur verifikasi:
1. User upload foto subuh
2. Sistem parse EXIF metadata (GPS + timestamp)
3. Hitung jadwal subuh berdasarkan koordinat
4. Query masjid terdekat via Overpass API (radius 500m)
5. Validasi:
   - ✅ Waktu foto dalam rentang Subuh s/d Syuruq → LULUS
   - ✅ Ada masjid dalam radius 500m → `verified_masjid`
   - ⚠️ Waktu ✅ + tidak ada masjid → `verified_time`
   - ❌ Waktu di luar rentang → `failed`

## 🚀 Deploy

Deploy ke Vercel:

```bash
vercel
```

Pastikan set environment variables di Vercel dashboard.

## 📝 License

MIT
