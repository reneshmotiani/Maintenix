import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth'

// Public routes — no auth required
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/signup']

export async function proxy(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  // Allow public routes
  if (isPublic) {
    // If logged in and tries to access /login → redirect to dashboard
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect everything else
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
