import { NextResponse } from 'next/server'
import { getAggregatedAspirations, generatePolicyRecommendations } from '@/lib/db'

export async function GET() {
  try {
    const aspirations = getAggregatedAspirations()
    const recommendations = generatePolicyRecommendations()

    return NextResponse.json({
      aspirations,
      recommendations,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analitika'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
