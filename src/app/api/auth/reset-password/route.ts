import { NextResponse } from 'next/server'
import { verifyOtp, consumeOtp } from '@/lib/otp-store'
import { updateAdminPassword } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body?.email?.trim()
    const code = body?.code?.trim()
    const newPassword = body?.newPassword

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap.' },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi minimal 6 karakter.' },
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

    // Konsumsi OTP agar tidak bisa dipakai ulang
    consumeOtp(email)

    // Perbarui kata sandi di SQLite
    updateAdminPassword(email, newPassword)

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui.',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui kata sandi.'
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    )
  }
}

