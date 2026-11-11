import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body?.email?.trim()
    const code = body?.code?.trim()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email dan kode OTP wajib diisi.' },
        { status: 400 },
      )
    }

    const check = verifyOtp(email, code)
    if (!check.valid) {
      return NextResponse.json(
        { success: false, error: check.reason ?? 'Kode OTP tidak valid.' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kode OTP terverifikasi.',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memverifikasi OTP.'
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    )
  }
}

