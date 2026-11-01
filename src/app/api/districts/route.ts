import { NextResponse } from 'next/server'
import { INITIAL_DISTRICTS } from '@/lib/data'
import { calculateOverallGap, calculateGapStatus } from '@/lib/gap-calculator'
import { District } from '@/types'

let memoryDistricts: District[] = [...INITIAL_DISTRICTS]

export async function GET() {
  return NextResponse.json({
    source: 'live_bps_hybrid',
    last_synced: new Date().toISOString(),
    data: memoryDistricts,
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, budget_infra_pct, budget_health_pct, budget_edu_pct, budget_social_pct } = body

    if (!id) {
      return NextResponse.json({ error: 'ID kecamatan wajib disertakan' }, { status: 400 })
    }

    const total = budget_infra_pct + budget_health_pct + budget_edu_pct + budget_social_pct
    if (total !== 100) {
      return NextResponse.json({ error: 'Total alokasi 4 sektor wajib berjumlah tepat 100%' }, { status: 400 })
    }

    const index = memoryDistricts.findIndex((d) => d.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Kecamatan tidak ditemukan' }, { status: 404 })
    }

    const current = memoryDistricts[index]
    const updated: District = {
      ...current,
      budget_infra_pct,
      budget_health_pct,
      budget_edu_pct,
      budget_social_pct,
    }

    updated.overall_gap_score = calculateOverallGap(updated)
    updated.gap_status = calculateGapStatus(updated)
    updated.updated_at = new Date().toISOString()

    memoryDistricts[index] = updated

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui anggaran' }, { status: 500 })
  }
}

