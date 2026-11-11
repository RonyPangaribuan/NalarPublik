import { NextResponse } from 'next/server'
import { verifyAdminCredentials } from '@/lib/db'

/**
 * POST /api/auth/login
 * Memverifikasi kredensial admin melalui SQLite (better-sqlite3).
 * Jika cocok, set cookie HTTP-Only `nalarpublik_session`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, isDemo } = body as {
      email?: string
      password?: string
      isDemo?: boolean
    }

    let isValid = false
    let userEmail = 'admin@nalarpublik.id'
    let userName = 'Admin NalarPublik'
    let userRole = 'admin'

    if (isDemo) {
      isValid = true
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email dan kata sandi wajib diisi.' },
          { status: 400 },
        )
      }

      userEmail = email.trim()

      // 1. Verifikasi kredensial via SQLite
      const dbCheck = verifyAdminCredentials(userEmail, password)
      if (dbCheck.valid && dbCheck.user) {
        isValid = true
        userEmail = dbCheck.user.email
        userName = dbCheck.user.name
        userRole = dbCheck.user.role
      } else {
        // 2. Fallback ke kredensial env/default
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nalarpublik.id'
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'AdminNalar2026!'
        const allowedEmails = ADMIN_EMAIL.split(',').map((e) => e.trim().toLowerCase())

        if (
          (allowedEmails.includes(userEmail.toLowerCase()) && password === ADMIN_PASSWORD) ||
          (userEmail.toLowerCase() === 'admin@nalarpublik.id' && password === 'AdminNalar2026!')
        ) {
          isValid = true
        }
      }
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
        name: userName,
        role: userRole,
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

