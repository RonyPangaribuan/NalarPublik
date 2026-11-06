import { NextResponse } from 'next/server'
import { getAllSubmissions, createCitizenSubmission } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const districtId = searchParams.get('district_id') || undefined
    const limit = Number(searchParams.get('limit')) || 50

    const submissions = getAllSubmissions(undefined, districtId, limit)

    return NextResponse.json({
      total: submissions.length,
      data: submissions,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data aspirasi'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { district_id, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes } = body

    if (!district_id) {
      return NextResponse.json({ error: 'Kecamatan wajib dipilih' }, { status: 400 })
    }

    if (
      typeof alloc_infra_pct !== 'number' ||
      typeof alloc_health_pct !== 'number' ||
      typeof alloc_edu_pct !== 'number' ||
      typeof alloc_social_pct !== 'number'
    ) {
      return NextResponse.json({ error: 'Nilai alokasi simulasi harus berupa angka' }, { status: 400 })
    }

    const newSub = createCitizenSubmission({
      district_id,
      alloc_infra_pct,
      alloc_health_pct,
      alloc_edu_pct,
      alloc_social_pct,
      notes: typeof notes === 'string' ? notes.trim() : undefined,
    })

    return NextResponse.json({ success: true, data: newSub }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mencatat aspirasi'
    const isValidationError =
      message.includes('100%') ||
      message.includes('200 karakter') ||
      message.includes('wajib dipilih') ||
      message.includes('0% hingga 100%') ||
      message.includes('tidak valid')

    return NextResponse.json({ error: message }, { status: isValidationError ? 400 : 500 })
  }
}
