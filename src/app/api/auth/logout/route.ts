import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Menghapus cookie session admin.
 */
export async function POST() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('nalarpublik_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // expire immediately
    path: '/',
  })

  return response
}

