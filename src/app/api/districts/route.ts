import { NextResponse } from 'next/server'
import { getAllDistricts, updateDistrictBudget } from '@/lib/db'

export async function GET() {
  try {
    const districts = getAllDistricts()
    return NextResponse.json({
      source: 'live_bps_hybrid',
      last_synced: new Date().toISOString(),
      data: districts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data kecamatan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, budget_infra_pct, budget_health_pct, budget_edu_pct, budget_social_pct, total_budget_idr } = body

    if (!id) {
      return NextResponse.json({ error: 'ID kecamatan wajib disertakan' }, { status: 400 })
    }

    if (
      typeof budget_infra_pct !== 'number' ||
      typeof budget_health_pct !== 'number' ||
      typeof budget_edu_pct !== 'number' ||
      typeof budget_social_pct !== 'number'
    ) {
      return NextResponse.json({ error: 'Nilai alokasi anggaran 4 sektor harus berupa angka' }, { status: 400 })
    }

    if (total_budget_idr !== undefined && (typeof total_budget_idr !== 'number' || total_budget_idr < 0)) {
      return NextResponse.json({ error: 'Pagu anggaran total (total_budget_idr) harus berupa angka positif' }, { status: 400 })
    }

    const updated = updateDistrictBudget(id, {
      total_budget_idr,
      budget_infra_pct,
      budget_health_pct,
      budget_edu_pct,
      budget_social_pct,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui anggaran'
    const isValidationError =
      message.includes('100%') ||
      message.includes('tidak ditemukan') ||
      message.includes('0% hingga 100%')
    return NextResponse.json({ error: message }, { status: isValidationError ? 400 : 500 })
  }
}
