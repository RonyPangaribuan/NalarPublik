import { NextResponse } from 'next/server'
import { INITIAL_SUBMISSIONS } from '@/lib/data'
import { CitizenSubmission } from '@/types'

let memorySubmissions: CitizenSubmission[] = [...INITIAL_SUBMISSIONS]

export async function GET() {
  return NextResponse.json({
    total: memorySubmissions.length,
    data: memorySubmissions,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { district_id, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes } = body

    if (!district_id) {
      return NextResponse.json({ error: 'Kecamatan wajib dipilih' }, { status: 400 })
    }

    const total = alloc_infra_pct + alloc_health_pct + alloc_edu_pct + alloc_social_pct
    if (total !== 100) {
      return NextResponse.json({ error: 'Total alokasi simulasi wajib tepat 100%' }, { status: 400 })
    }

    if (notes && notes.length > 200) {
      return NextResponse.json({ error: 'Catatan aspirasi maksimal 200 karakter' }, { status: 400 })
    }

    const newSub: CitizenSubmission = {
      id: `sub-${Date.now()}`,
      district_id,
      alloc_infra_pct,
      alloc_health_pct,
      alloc_edu_pct,
      alloc_social_pct,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    }

    memorySubmissions.unshift(newSub)

    return NextResponse.json({ success: true, data: newSub }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mencatat aspirasi' }, { status: 500 })
  }
}

