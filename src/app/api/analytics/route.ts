import { NextResponse } from 'next/server'
import { INITIAL_DISTRICTS, INITIAL_SUBMISSIONS } from '@/lib/data'
import { AggregatedAspiration, PolicyRecommendation } from '@/types'

export async function GET() {
  const aspirations: AggregatedAspiration[] = INITIAL_DISTRICTS.map((d) => {
    const subs = INITIAL_SUBMISSIONS.filter((s) => s.district_id === d.id)
    const count = subs.length
    return {
      district_id: d.id,
      total_votes: count,
      avg_infra_pct: count ? Number((subs.reduce((acc, s) => acc + s.alloc_infra_pct, 0) / count).toFixed(1)) : 0,
      avg_health_pct: count ? Number((subs.reduce((acc, s) => acc + s.alloc_health_pct, 0) / count).toFixed(1)) : 0,
      avg_edu_pct: count ? Number((subs.reduce((acc, s) => acc + s.alloc_edu_pct, 0) / count).toFixed(1)) : 0,
      avg_social_pct: count ? Number((subs.reduce((acc, s) => acc + s.alloc_social_pct, 0) / count).toFixed(1)) : 0,
    }
  })

  const recommendations: PolicyRecommendation[] = [
    {
      district_id: 'habinsaran',
      district_name: 'Kecamatan Habinsaran',
      sector: 'infra',
      sector_label: 'Infrastruktur Jalan',
      problem_pct: 46.0,
      current_budget_pct: 16.0,
      citizen_aspiration_pct: 47.5,
      gap_score: 30.0,
      severity: 'CRITICAL',
      recommendation_text:
        'Tingkat masalah infrastruktur mencapai 46%, sedangkan alokasi anggaran hanya 16% (Aspirasi warga: 47.5%). Disarankan realokasi minimal +15% ke sektor Infrastruktur dari pos anggaran surplus.',
    },
    {
      district_id: 'porsea',
      district_name: 'Kecamatan Porsea',
      sector: 'health',
      sector_label: 'Kesehatan & Stunting',
      problem_pct: 29.5,
      current_budget_pct: 14.0,
      citizen_aspiration_pct: 40.0,
      gap_score: 15.5,
      severity: 'WARNING',
      recommendation_text:
        'Prevalensi stunting mencapai 29.5%, namun alokasi faskes APBD hanya 14%. Direkomendasikan penambahan intervensi gizi balita posyandu minimal +8%.',
    },
  ]

  return NextResponse.json({
    aspirations,
    recommendations,
  })
}

