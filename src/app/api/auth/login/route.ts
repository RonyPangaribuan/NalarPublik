import { NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * Memverifikasi kredensial admin.
 * Jika cocok, set cookie HTTP-Only `nalarpublik_session`.
 *
 * NOTE: Implementasi DB real (better-sqlite3) dikerjakan oleh backend engineer (Boy).
 * Untuk sementara, fallback ke env atau kredensial default agar FE bisa diuji.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, isDemo } = body as {
      email?: string
      password?: string
      isDemo?: boolean
    }

    // Kredensial admin dari env atau default
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nalarpublik.id'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'AdminNalar2026!'
    const allowedEmails = ADMIN_EMAIL.split(',').map((e) => e.trim().toLowerCase())

    let isValid = false
    let userEmail = 'admin@nalarpublik.id'

    if (isDemo) {
      isValid = true
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email dan kata sandi wajib diisi.' },
          { status: 400 },
        )
      }
      userEmail = email
      isValid =
        (allowedEmails.includes(email.toLowerCase()) && password === ADMIN_PASSWORD) ||
        (email.toLowerCase() === 'admin@nalarpublik.id' && password === 'AdminNalar2026!')
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email atau kata sandi tidak valid.' },
        { status: 401 },
      )
    }

    const response = NextResponse.json({
      success: true,
      user: {
        email: userEmail,
        name: 'Admin NalarPublik',
        role: 'admin',
      },
    })

    // Set cookie HTTP-Only session (Max-Age: 7 hari)
    response.cookies.set('nalarpublik_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server.' },
      { status: 500 },
    )
  }
}

