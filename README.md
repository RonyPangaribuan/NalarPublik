# NalarPublik

**Sistem Pendukung Keputusan Alokasi Anggaran Daerah Berbasis Analisis Gap Data Terbuka**

> Dari data publik menuju prioritas pembangunan yang lebih transparan dan partisipatif.

NalarPublik adalah proyek website untuk kompetisi **Web In Action (WIA) — Multimedia In Action 2026** pada subtema *Data-Driven Decision Support*. Platform ini dirancang untuk membantu warga memahami indikator pembangunan dan informasi anggaran daerah, mencoba alternatif prioritas alokasi anggaran, serta menyampaikan masukan berbasis data. Perspektif admin menyediakan ringkasan aspirasi dan indikasi kesenjangan sebagai bahan analisis, **bukan keputusan resmi pemerintah**.

> **Status:** tahap pengembangan / first draft. Fitur yang disebutkan di bawah adalah **rencana implementasi**, bukan klaim bahwa semuanya telah selesai.

## Ruang Lingkup Pilot

- **Wilayah:** Kabupaten Toba, Sumatera Utara (kode BPS `1212`).
- **Empat kecamatan sampel:** Balige, Laguboti, Porsea, dan Habinsaran.
- **Data yang direncanakan:** indikator publik BPS dan data APBD yang sumber, tahun, dan cakupan administratifnya akan diverifikasi.
- **Batasan penting:** APBD pemerintah kabupaten tidak boleh dilabeli sebagai APBD masing-masing kecamatan. Alokasi menurut kecamatan hanya ditampilkan bila data yang mendukungnya tersedia dan dapat dipertanggungjawabkan.

## Rencana Fitur

### Mode Warga

1. **Landing Page Transparansi** — ringkasan anggaran Kabupaten Toba, indikator pembangunan, dan navigasi fitur.
2. **Peta Gap Analysis** — peta berbasis empat *pin marker* kecamatan; detail indikator dan informasi anggaran pada setiap titik.
3. **Simulator Anggaran Partisipatif** — slider untuk membagi **100% poin anggaran virtual** pada sektor Infrastruktur, Kesehatan, Pendidikan, dan Sosial; menyimpan hasil simulasi sebagai masukan warga.
4. **Komparasi Head-to-Head Kecamatan** — memilih dua kecamatan dan membandingkan indikator serta data anggaran yang memang tersedia pada skala yang setara.
5. **Portal Data Ramah Awam** — penjelasan sederhana istilah APBD, indikator, sumber, dan keterbatasan data.

### Mode Admin / Perspektif Pemerintah (Demo)

1. **Dasbor Agregasi Aspirasi** — merangkum rata-rata pembagian poin anggaran virtual dari kiriman warga per kecamatan, serta membandingkannya dengan referensi anggaran yang relevan.
2. **Detektor Anomali & Rekomendasi** — menampilkan indikasi kesenjangan berdasarkan model analisis yang akan dirancang, diuji, dan dijelaskan secara transparan.
3. **Manajemen Data Indikator** — melihat dan, jika akses telah diamankan, memperbarui data indikator dan referensi anggaran.

**Quick Role Switcher** memudahkan perpindahan tampilan Warga dan Admin untuk demonstrasi. Toggle tampilan **bukan** autentikasi atau otorisasi; aksi pengubahan data memerlukan pengamanan di sisi server dan database.

## Alur Data-Driven Decision Support

```text
Sumber Data BPS + APBD
          |
          v
Validasi & Penyelarasan Data
          |
          v
Visualisasi & Analisis Kesenjangan
          |
          v
Simulator Prioritas Anggaran Virtual
          |
          v
Penyimpanan Suara / Skenario Warga
          |
          v
Agregasi Aspirasi & Tinjauan Admin
```

**Catatan metodologi:** rancangan awal mengusulkan `Gap Score = Indeks Masalah - Persentase Alokasi Anggaran`. Rumus tersebut **belum layak dipakai apa adanya** sebelum definisi indeks, normalisasi, kesetaraan unit analisis, dan relevansi anggaran diverifikasi. Nilai yang dihasilkan akan disajikan sebagai *indikasi analitis*, bukan bukti bahwa suatu kebijakan keliru.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend dan API | Next.js (React, Route Handlers) |
| Styling & komponen | Tailwind CSS, shadcn/ui, Lucide Icons |
| Grafik | Recharts |
| Peta | React-Leaflet (empat pin kecamatan) |
| State management | Zustand |
| Database | Supabase (PostgreSQL) |
| Data eksternal | Web API BPS (integrasi direncanakan; *fallback* lokal) |
| Deployment | Vercel |

## Arsitektur Data Awal

Sesuai rencana overview, tiga tabel inti yang diusulkan:

- `districts`: kecamatan pilot, koordinat, indikator, dan referensi anggaran dengan sumber yang jelas.
- `submissions`: kiriman pembagian poin anggaran virtual dari warga.
- `anomalies`: hasil/riwayat analisis indikasi kesenjangan atau catatan rekomendasi.

Skema final dan kebijakan akses database akan ditentukan saat implementasi.

## Menjalankan Proyek

**Prasyarat:** Node.js 20.9 atau lebih baru dan npm.

```bash
git clone <URL_REPOSITORY_ANDA>
cd nalarpublik
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Isi nilai pada `.env.local` saat integrasi Supabase dan BPS mulai dikerjakan. Ganti `<URL_REPOSITORY_ANDA>` dengan URL repo yang sebenarnya. Jangan menyimpan kunci rahasia atau `.env.local` di GitHub.

## Progres dan Milestone

| Periode | Target |
| --- | --- |
| 1 November 2026 | First Draft: repo publik, README, landing page, satu halaman lain, screenshot, dan materi konsep |
| 2–4 November 2026 | Database, data awal, integrasi BPS, API, serta role switcher |
| 5–7 November 2026 | Integrasi peta, komparasi, simulator, dan dashboard admin |
| 8–9 November 2026 | Pengujian, perbaikan, responsivitas, deployment |
| 10–11 November 2026 | Proposal akhir, surat orisinalitas, video pitching, dan pengumpulan |

**Status implementasi aktual:** perbarui bagian ini berdasarkan commit dan fitur yang sudah diuji. Jangan mencentang fitur sebelum benar-benar berjalan.

## Tim

| Anggota | Peran | Fokus |
| --- | --- | --- |
| Rony | Project Manager & Hustler | Riset APBD/BPS, dokumentasi, proposal, administrasi, pitching |
| Boy | Data & Backend Engineer | Next.js setup, Supabase, API BPS, kalkulasi, penyimpanan simulator |
| Max | Design & Frontend Engineer | UI/UX, halaman, visualisasi Recharts, peta React-Leaflet |

## Prinsip Data & Privasi

- Setiap data publik harus memiliki sumber, tahun, satuan, dan tingkat wilayah yang jelas.
- Dataset contoh atau anggaran virtual harus diberi label **simulasi**, bukan APBD aktual.
- Data dari kecamatan tidak boleh dibandingkan langsung dengan APBD kabupaten tanpa penjelasan cakupan.
- Kiriman warga tidak mewakili kebijakan resmi pemerintah.
- Hak mengubah data tidak diberikan hanya berdasarkan Quick Role Switcher.

## Kompetisi

Dikembangkan sebagai karya tim untuk **Web In Action (WIA), Multimedia In Action 2026**.

## Lisensi

Belum ditentukan. Seluruh hak cipta tetap pada pemilik karya. Tambahkan berkas `LICENSE` setelah tim menyepakati ketentuannya.
