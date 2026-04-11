# PRD — Ibadah Tracker Pesantren
**Version:** 1.0  
**Stack:** Next.js 14 (App Router) + Supabase + Tailwind CSS  
**Target:** Komunitas pesantren / halaqah

---

## 1. Overview

Aplikasi web untuk tracking ibadah harian santri/anggota komunitas. Setiap anggota mencatat ibadah harian mereka, dengan fitur unggulan **verifikasi foto sholat subuh** menggunakan GPS + timestamp untuk memastikan keaslian laporan.

---

## 2. User Roles

| Role | Akses |
|------|-------|
| `santri` | Input ibadah harian, lihat progress pribadi |
| `musyrif` | Lihat rekap seluruh santri, export laporan |
| `admin` | Kelola user, setting komunitas |

---

## 3. Fitur Utama

### 3.1 Autentikasi
- Register dengan nama lengkap, username, dan kode komunitas (kode unik per pesantren)
- Login dengan username + password
- Gunakan **Supabase Auth**

---

### 3.2 Dashboard Harian

Tampil setiap hari, reset setiap tengah malam.

Daftar ibadah yang bisa diceklis:

| Ibadah | Tipe Input | Verifikasi |
|--------|-----------|------------|
| Sholat Tahajud | Toggle (✓/✗) | Tidak |
| Sholat Duha | Toggle (✓/✗) | Tidak |
| Sholat Subuh | Upload foto | **GPS + Waktu** |
| Istigfar | Counter angka (target: 100) | Tidak |
| Sholawat | Counter angka (target: 100) | Tidak |
| ODOC (One Day One Concept) | Toggle (✓/✗) | Tidak |

---

### 3.3 Verifikasi Foto Subuh (FITUR UTAMA)

Ini adalah fitur paling kritis. Alur lengkapnya:

#### Flow Pengguna:
1. User tap tombol "Upload Foto Subuh"
2. Pilih foto dari galeri / ambil foto langsung
3. Sistem membaca **EXIF metadata** dari foto:
   - `GPS Latitude` & `GPS Longitude`
   - `DateTimeOriginal` (waktu foto diambil)
4. Sistem menghitung **jadwal subuh** berdasarkan koordinat GPS foto menggunakan library `adhan` (prayer times calculation)
5. Sistem query **masjid terdekat** via **Google Places API** atau **OpenStreetMap Overpass API** (radius 500m dari titik GPS foto)
6. Validasi:
   - ✅ Waktu foto dalam rentang **Subuh s/d Syuruq** → LULUS
   - ✅ Ada masjid dalam radius 500m → LULUS (opsional, tidak wajib lulus)
   - ❌ Waktu foto di luar rentang subuh → GAGAL
   - ❌ Foto tidak punya GPS metadata → GAGAL (minta ambil ulang)

#### Status Verifikasi:
- `verified_masjid` — waktu ✅ + masjid terdekat ✅
- `verified_time` — waktu ✅ + tidak terdeteksi masjid (mungkin sholat di rumah)
- `failed` — waktu ❌

#### Data yang Disimpan ke Database:
```
photo_url        : URL foto di Supabase Storage
photo_taken_at   : Timestamp dari EXIF (bukan waktu upload)
latitude         : GPS dari EXIF
longitude        : GPS dari EXIF
nearest_masjid   : Nama masjid terdekat (jika ada)
masjid_distance  : Jarak ke masjid (meter)
subuh_start      : Waktu subuh di lokasi tersebut
syuruq_time      : Waktu syuruq di lokasi tersebut
verification_status : 'verified_masjid' | 'verified_time' | 'failed'
```

#### Library yang Digunakan:
- `exifr` — parsing EXIF dari foto (client-side, ringan)
- `adhan` — kalkulasi waktu sholat dari koordinat
- **OpenStreetMap Overpass API** (gratis) untuk cari masjid terdekat

#### Contoh Query Overpass API:
```
[out:json];
node["amenity"="place_of_worship"]["religion"="muslim"](around:500,{lat},{lon});
out body;
```

#### Catatan Penting:
- Proses EXIF parsing dilakukan di **client-side** (browser) sebelum upload
- Jika foto diambil langsung dari kamera HP, EXIF GPS otomatis ada (jika izin lokasi aktif)
- Tampilkan peta kecil (Leaflet.js) yang menunjukkan lokasi foto + masjid terdekat

---

### 3.4 Counter Dzikir (Istigfar & Sholawat)

- Tampil sebagai tombol bulat besar yang bisa di-tap
- Target: 100x per amalan
- Progress bar visual
- Nilai tersimpan otomatis ke database setiap perubahan (debounce 2 detik)
- ODOC adalah toggle biasa dengan field teks opsional untuk judul konsep yang dipelajari

---

### 3.5 Statistik & Riwayat

- Kalender bulanan dengan warna per hari:
  - 🟢 Hijau — semua ibadah lengkap
  - 🟡 Kuning — sebagian
  - 🔴 Merah — tidak ada yang tercatat
- Streak counter (hari berturut-turut lengkap)
- Grafik mingguan per jenis ibadah

---

### 3.6 Dashboard Musyrif

- Tabel rekap semua santri hari ini
- Filter: belum lengkap, sudah lengkap, tidak ada laporan
- Lihat foto bukti subuh tiap santri + status verifikasinya
- Export CSV laporan mingguan/bulanan

---

## 4. Struktur Database (Supabase)

### Tabel `profiles`
```sql
id          uuid references auth.users
username    text unique
full_name   text
role        text default 'santri'  -- santri | musyrif | admin
community_code text
created_at  timestamp
```

### Tabel `daily_records`
```sql
id          uuid primary key
user_id     uuid references profiles
date        date  -- tanggal ibadah
tahajud     boolean default false
duha        boolean default false
istigfar    integer default 0
sholawat    integer default 0
odoc        boolean default false
odoc_title  text  -- judul konsep ODOC (opsional)
created_at  timestamp
updated_at  timestamp

UNIQUE(user_id, date)
```

### Tabel `subuh_verifications`
```sql
id                    uuid primary key
user_id               uuid references profiles
date                  date
photo_url             text
photo_taken_at        timestamp  -- dari EXIF
latitude              decimal
longitude             decimal
nearest_masjid        text
masjid_distance       integer  -- meter
subuh_start           timestamp
syuruq_time           timestamp
verification_status   text  -- verified_masjid | verified_time | failed
created_at            timestamp

UNIQUE(user_id, date)
```

---

## 5. Struktur Folder Next.js

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    page.tsx              ← dashboard harian santri
    history/page.tsx      ← riwayat & kalender
    musyrif/page.tsx      ← dashboard musyrif
  api/
    verify-subuh/route.ts ← endpoint verifikasi foto
components/
  SubuhUploader.tsx       ← komponen upload + EXIF parsing
  DzikirCounter.tsx       ← counter istigfar & sholawat
  VerificationMap.tsx     ← peta lokasi foto (Leaflet)
  DailyChecklist.tsx      ← daftar ibadah harian
lib/
  supabase.ts
  prayerTime.ts           ← wrapper adhan
  exifParser.ts           ← wrapper exifr
  overpassApi.ts          ← query masjid terdekat
```

---

## 6. Tech Stack Detail

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (foto subuh) |
| Styling | Tailwind CSS |
| EXIF Parser | `exifr` |
| Prayer Times | `adhan` |
| Masjid Lookup | OpenStreetMap Overpass API (gratis) |
| Peta | Leaflet.js |
| Deploy | Vercel |

---

## 7. Halaman & UI Notes

### Dashboard Harian (`/`)
- Header: Tanggal hari ini + nama user
- Card tiap ibadah (tahajud, duha, subuh, istigfar, sholawat, odoc)
- Subuh card punya area khusus: tombol upload + preview foto + badge status verifikasi
- Bottom: ringkasan hari ini (X/6 ibadah tercatat)

### Upload Subuh
- Gunakan `<input type="file" accept="image/*">` untuk ambil foto
- Setelah dipilih: langsung parse EXIF di browser (tanpa upload dulu)
- Tampilkan hasil parsing: waktu foto + koordinat + nama masjid terdekat + status
- User konfirmasi → baru upload ke Supabase Storage

### Counter Dzikir
- Tombol bulat besar di tengah layar
- Angka counter di atas tombol
- Progress ring atau bar menuju 100
- Warna hijau jika sudah 100+

---

## 8. Prioritas Development

### Phase 1 (MVP)
1. Auth (register/login dengan kode komunitas)
2. Dashboard harian + input semua ibadah
3. Counter dzikir
4. **Verifikasi foto subuh (GPS + waktu)**

### Phase 2
5. Kalender & statistik
6. Dashboard musyrif
7. Streak & pencapaian

### Phase 3
8. Export laporan CSV
9. Notifikasi/pengingat (PWA push notification)
10. Halaman komunitas & leaderboard

---

## 9. Prompt untuk AI Agent

Gunakan teks berikut sebagai prompt awal ke Claude Code atau AI agent:

```
Buatkan aplikasi web ibadah tracker untuk komunitas pesantren menggunakan 
Next.js 14 (App Router) + Supabase + Tailwind CSS sesuai PRD ini.

Mulai dari Phase 1:
1. Setup project Next.js + Supabase
2. Buat skema database sesuai PRD
3. Implementasi auth (register dengan kode komunitas, login)
4. Dashboard harian dengan semua ibadah
5. Fitur verifikasi foto subuh: parsing EXIF (exifr), kalkulasi waktu subuh (adhan), 
   query masjid terdekat via Overpass API, tampilkan peta (Leaflet)

Pastikan:
- Mobile-first UI (mayoritas user akses dari HP)
- Dark mode friendly
- Supabase Row Level Security aktif (santri hanya bisa akses data sendiri)
- Error handling jika foto tidak punya GPS metadata
```

---

*Dokumen ini dibuat untuk keperluan vibe coding dengan AI agent. Paste ke Claude Code untuk mulai development.*
