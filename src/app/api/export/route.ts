import { NextResponse } from 'next/server'
import { getAllDistricts } from '@/lib/db'

export async function GET() {
  try {
    const districts = getAllDistricts()

    const headers = [
      'id',
      'bps_code',
      'name',
      'population',
      'total_budget_idr',
      'infra_problem_pct',
      'health_problem_pct',
      'edu_problem_pct',
      'social_problem_pct',
      'budget_infra_pct',
      'budget_health_pct',
      'budget_edu_pct',
      'budget_social_pct',
      'overall_gap_score',
      'gap_status',
    ]

    const rows = districts.map((d) => [
      d.id,
      d.bps_code,
      `"${d.name}"`,
      d.population,
      d.total_budget_idr,
      d.infra_problem_pct,
      d.health_problem_pct,
      d.edu_problem_pct,
      d.social_problem_pct,
      d.budget_infra_pct,
      d.budget_health_pct,
      d.budget_edu_pct,
      d.budget_social_pct,
      d.overall_gap_score,
      d.gap_status,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nalarpublik_toba_apbd_bps_2026.csv"',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengekspor data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

