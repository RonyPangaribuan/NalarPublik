import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware: Proteksi route /admin/*
 * Memeriksa cookie `nalarpublik_session` di setiap request ke /admin.
 * Jika tidak ada → redirect ke /login.
 * Cookie di-set oleh POST /api/auth/login (backend Boy).
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get('nalarpublik_session')
  const { pathname } = request.nextUrl

  // Redirect /admin/login langsung ke /login agar tidak loop / 404
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Proteksi semua route di bawah /admin
  if (pathname.startsWith('/admin')) {
    if (!session?.value) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

