import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin routes (UI + API) require PLATFORM_ADMIN role
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (token?.role !== UserRole.PLATFORM_ADMIN) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/403', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Reject unauthenticated requests before the middleware function runs
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  // Cover both Admin UI pages and Admin API routes
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
