import { NextResponse } from 'next/server'

/**
 * GET /api/auth/google/callback
 * Menerima authorization code dari Google, tukar dengan access token,
 * verifikasi email admin, lalu set session cookie.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') ?? '/admin' // callbackUrl
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const loginUrl = `${appUrl}/login`

  if (error || !code) {
    return NextResponse.redirect(`${loginUrl}?error=google_denied`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${appUrl}/api/auth/google/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${loginUrl}?error=not_configured`)
  }

  try {
    // 1. Tukar code dengan access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${loginUrl}?error=token_failed`)
    }

    // 2. Ambil info user dari Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const userInfo = await userRes.json()

    if (!userInfo.email) {
      return NextResponse.redirect(`${loginUrl}?error=no_email`)
    }

    // 3. Verifikasi email admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nalarpublik.id'
    const allowedEmails = ADMIN_EMAIL.split(',').map((e) => e.trim().toLowerCase())
    const isExplicitlyAllowed = allowedEmails.includes(userInfo.email.toLowerCase())
    const isDefaultAdminOnly = allowedEmails.length === 1 && allowedEmails[0] === 'admin@nalarpublik.id'

    // Jika ADMIN_EMAIL bukan default dan user tidak ada di whitelist
    if (!isExplicitlyAllowed && !isDefaultAdminOnly) {
      return NextResponse.redirect(`${loginUrl}?error=not_authorized`)
    }

    // 4. Set session cookie HTTP-Only (Max-Age: 7 hari)
    const response = NextResponse.redirect(`${appUrl}${state}`)
    response.cookies.set('nalarpublik_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.redirect(`${loginUrl}?error=server_error`)
  }
}

