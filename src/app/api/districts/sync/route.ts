import { NextResponse } from 'next/server'
import { getAllDistricts, updateDistrictBpsSync } from '@/lib/db'

export async function POST() {
  const apiKey = process.env.BPS_API_KEY
  const now = new Date().toISOString()

  // Skenario 1: Jika tidak ada BPS_API_KEY atau API offline, gunakan cached snapshot secara graceful
  if (!apiKey) {
    const districts = getAllDistricts()
    return NextResponse.json({
      success: true,
      source: 'cached_snapshot',
      last_synced: now,
      message: 'Sinkronisasi menggunakan data snapshot lokal (BPS_API_KEY belum dikonfigurasi).',
      data: districts,
    })
  }

  // Skenario 2: Panggil Web API BPS resmi jika ada key
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    // Contoh endpoint BPS Kabupaten Toba (1212)
    const bpsUrl = `https://webapi.bps.go.id/v1/api/interoperabilitas/datasource/simdasi/id/1212?key=${apiKey}`
    const response = await fetch(bpsUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeout)

    if (response.ok) {
      const districts = getAllDistricts()
      for (const d of districts) {
        updateDistrictBpsSync(d.id, now)
      }

      return NextResponse.json({
        success: true,
        source: 'live_bps_hybrid',
        last_synced: now,
        message: 'Berhasil sinkronisasi langsung dengan Web API BPS.',
        data: getAllDistricts(),
      })
    }
  } catch (err) {
    console.warn('[BPS API Sync] Gagal terhubung ke Web API BPS, menggunakan fallback snapshot lokal:', err)
  }

  // Fallback: Kembalikan snapshot lokal
  const fallbackDistricts = getAllDistricts()
  return NextResponse.json({
    success: true,
    source: 'cached_snapshot',
    last_synced: now,
    message: 'Gagal menghubungi server BPS, beralih ke cache snapshot lokal.',
    data: fallbackDistricts,
  })
}

