import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['ar', 'fr'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  localeDetection: true,
})

const protectedPaths = [
  '/client',
  '/owner',
  '/admin',
  '/profile',
  '/bookings',
  '/favorites',
  '/messages',
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if protected path (strip locale prefix)
  const pathnameWithoutLocale = pathname.replace(/^\/(ar|fr)/, '')
  const isProtected = protectedPaths.some((p) => pathnameWithoutLocale.startsWith(p))

  if (isProtected) {
    const token = request.cookies.get('access_token')?.value
    if (!token) {
      const locale = pathname.split('/')[1] || 'ar'
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
