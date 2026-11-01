import { District, CitizenSubmission } from '@/types'
import { calculateOverallGap, calculateGapStatus } from './gap-calculator'

export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'balige',
    bps_code: '1212010',
    name: 'Kecamatan Balige',
    latitude: 2.3333,
    longitude: 99.0667,
    population: 45820,
    total_budget_idr: 48500000000,
    infra_problem_pct: 14.5,
    health_problem_pct: 12.0,
    edu_problem_pct: 10.5,
    social_problem_pct: 9.8,
    budget_infra_pct: 40.0,
    budget_health_pct: 22.0,
    budget_edu_pct: 23.0,
    budget_social_pct: 15.0,
  },
  {
    id: 'laguboti',
    bps_code: '1212040',
    name: 'Kecamatan Laguboti',
    latitude: 2.35,
    longitude: 99.125,
    population: 23410,
    total_budget_idr: 29200000000,
    infra_problem_pct: 22.0,
    health_problem_pct: 18.5,
    edu_problem_pct: 24.0,
    social_problem_pct: 14.2,
    budget_infra_pct: 28.0,
    budget_health_pct: 25.0,
    budget_edu_pct: 27.0,
    budget_social_pct: 20.0,
  },
  {
    id: 'porsea',
    bps_code: '1212070',
    name: 'Kecamatan Porsea',
    latitude: 2.4411,
    longitude: 99.1553,
    population: 16890,
    total_budget_idr: 26800000000,
    infra_problem_pct: 19.0,
    health_problem_pct: 29.5,
    edu_problem_pct: 16.0,
    social_problem_pct: 15.5,
    budget_infra_pct: 35.0,
    budget_health_pct: 14.0,
    budget_edu_pct: 28.0,
    budget_social_pct: 23.0,
  },
  {
    id: 'habinsaran',
    bps_code: '1212020',
    name: 'Kecamatan Habinsaran',
    latitude: 2.2833,
    longitude: 99.25,
    population: 18950,
    total_budget_idr: 21500000000,
    infra_problem_pct: 46.0,
    health_problem_pct: 31.0,
    edu_problem_pct: 28.5,
    social_problem_pct: 24.0,
    budget_infra_pct: 16.0,
    budget_health_pct: 20.0,
    budget_edu_pct: 34.0,
    budget_social_pct: 30.0,
  },
].map((d) => ({
  ...d,
  overall_gap_score: calculateOverallGap(d),
  gap_status: calculateGapStatus(d),
}))

export const INITIAL_SUBMISSIONS: CitizenSubmission[] = [
  {
    id: 'sub-1',
    district_id: 'habinsaran',
    alloc_infra_pct: 50,
    alloc_health_pct: 20,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Jalan penghubung antar desa di Habinsaran banyak yang longsor dan rusak berat.',
    created_at: '2026-10-31T09:12:00Z',
  },
  {
    id: 'sub-2',
    district_id: 'habinsaran',
    alloc_infra_pct: 45,
    alloc_health_pct: 25,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Mohon prioritas pengaspalan jalan pertanian dan tambahan tenaga medis puskesmas.',
    created_at: '2026-10-31T10:45:00Z',
  },
  {
    id: 'sub-3',
    district_id: 'porsea',
    alloc_infra_pct: 25,
    alloc_health_pct: 40,
    alloc_edu_pct: 20,
    alloc_social_pct: 15,
    notes: 'Program penanganan stunting dan gizi balita di Porsea perlu ditingkatkan.',
    created_at: '2026-10-31T13:20:00Z',
  },
  {
    id: 'sub-4',
    district_id: 'laguboti',
    alloc_infra_pct: 30,
    alloc_health_pct: 20,
    alloc_edu_pct: 35,
    alloc_social_pct: 15,
    notes: 'Renovasi ruang kelas sekolah dasar dan fasilitas perpustakaan kecamatan.',
    created_at: '2026-10-31T15:05:00Z',
  },
  {
    id: 'sub-5',
    district_id: 'balige',
    alloc_infra_pct: 30,
    alloc_health_pct: 25,
    alloc_edu_pct: 25,
    alloc_social_pct: 20,
    notes: 'Drainase pasar dan penataan fasilitas publik perlu perawatan rutin.',
    created_at: '2026-10-31T16:30:00Z',
  },
]

export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `Rp ${(amount / 1_000_000_000_000).toFixed(2).replace('.', ',')} T`
  }
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.', ',')} Miliar`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(0)} Juta`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

