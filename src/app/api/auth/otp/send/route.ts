import { NextResponse } from 'next/server'
import { saveOtp } from '@/lib/otp-store'
import { sendOtpEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body?.email?.trim()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Alamat email tidak valid.' },
        { status: 400 },
      )
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Simpan ke OTP store (5 menit)
    saveOtp(email, code, 300)

    // Kirim via Gmail SMTP
    await sendOtpEmail(email, code)

    return NextResponse.json({
      success: true,
      message: 'Kode OTP telah dikirim ke email Anda.',
    })
  } catch (err: unknown) {
    console.error('Error sending OTP email:', err)
    const msg = err instanceof Error ? err.message : 'Gagal mengirim email OTP.'
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    )
  }
}

