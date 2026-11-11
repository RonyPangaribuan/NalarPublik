import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /api/auth/me
 * Mengecek status autentikasi admin berdasarkan session cookie.
 */
export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('nalarpublik_session')

  if (!session?.value) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nalarpublik.id'

  return NextResponse.json({
    authenticated: true,
    user: {
      email: ADMIN_EMAIL,
      name: 'Admin NalarPublik',
      role: 'admin',
    },
  })
}

