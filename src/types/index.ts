// ─────────────────────────────────────────────────────────────────────────────
// NalarPublik — Kontrak TypeScript (shared FE & BE)
// Sumber: dokumentasi_teknis.md § 5
// ─────────────────────────────────────────────────────────────────────────────

export type RoleMode = 'public' | 'admin'

export type GapStatus = 'CRITICAL' | 'WARNING' | 'PROPORTIONAL'

export type SectorKey = 'infra' | 'health' | 'education' | 'social'

// ── Master wilayah kecamatan ──────────────────────────────────────────────────
export interface District {
  id: string               // slug: 'balige' | 'laguboti' | 'porsea' | 'habinsaran'
  bps_code: string         // Kode resmi BPS, mis. '1212010'
  name: string             // Nama kecamatan, mis. 'Kecamatan Balige'
  latitude: number         // Koordinat pusat pin marker Leaflet
  longitude: number
  population: number       // Jumlah penduduk (jiwa)
  total_budget_idr: number // Total pagu APBD (Rupiah)

  // Indikator Masalah Lapangan / BPS (skala 0–100%)
  infra_problem_pct: number    // % Jalan rusak sedang/berat
  health_problem_pct: number   // % Prevalensi stunting & keterbatasan faskes
  edu_problem_pct: number      // % Ruang kelas rusak & putus sekolah
  social_problem_pct: number   // % Penduduk miskin & rentan sosial

  // Persentase Alokasi Anggaran APBD saat ini (total 4 sektor = 100)
  budget_infra_pct: number
  budget_health_pct: number
  budget_edu_pct: number
  budget_social_pct: number

  // Field kalkulasi (computed di backend / helper, bukan kolom fisik DB)
  overall_gap_score?: number
  gap_status?: GapStatus
  bps_synced_at?: string
  updated_at?: string
}

// ── Hasil simulator anggaran partisipatif warga ───────────────────────────────
export interface CitizenSubmission {
  id?: string
  district_id: string       // Relasi ke District.id
  alloc_infra_pct: number   // Pilihan slider warga (0–100)
  alloc_health_pct: number
  alloc_edu_pct: number
  alloc_social_pct: number
  notes?: string            // Catatan/keluhan opsional (maks. 200 karakter)
  created_at?: string
}

// ── Agregasi rata-rata aspirasi warga per kecamatan ───────────────────────────
export interface AggregatedAspiration {
  district_id: string
  total_votes: number
  avg_infra_pct: number
  avg_health_pct: number
  avg_edu_pct: number
  avg_social_pct: number
}

// ── Rekomendasi kebijakan otomatis (output /api/analytics) ───────────────────
export interface PolicyRecommendation {
  district_id: string
  district_name: string
  sector: SectorKey
  sector_label: string
  problem_pct: number
  current_budget_pct: number
  citizen_aspiration_pct: number
  gap_score: number
  severity: GapStatus
  recommendation_text: string
}

// ── Respons API ───────────────────────────────────────────────────────────────
export interface DistrictsApiResponse {
  source: 'live_bps_hybrid' | 'cached_snapshot'
  last_synced: string | null
  data: District[]
}

export interface AnalyticsApiResponse {
  aspirations: AggregatedAspiration[]
  recommendations: PolicyRecommendation[]
}

