// ============================================================
// NEXT.JS MIDDLEWARE — Route protection + role-based isolation
// JWT-based auth (no Supabase)
// ============================================================
import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { TOKEN_COOKIE } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname
    console.log(`[MIDDLEWARE] Request Path: ${pathname}`)

    // ── Fast path: skip middleware for public API routes ──
    const isPublicApi = pathname.startsWith('/api/cmp/auth/') ||
                        pathname === '/api/cmp/alias/check'
    if (isPublicApi) {
      return NextResponse.next()
    }

    // ── Fast path: skip middleware for all other API routes (they do their own auth) ──
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // ── Public page routes — no auth required ──
    const publicPaths = ['/', '/login', '/signup', '/marketplace']
    const isPublic = publicPaths.some(path => pathname === path) ||
                     pathname.startsWith('/vendor/')

    if (isPublic) {
      return NextResponse.next()
    }

    // ── Protected routes: read JWT from cookie ──
    const token = request.cookies.get(TOKEN_COOKIE)?.value
    console.log(`[MIDDLEWARE] Token cookie value: ${token ? (token.substring(0, 15) + '...') : 'undefined'}`)

    if (!token && (pathname.startsWith('/dashboard') || pathname === '/onboard')) {
      console.log(`[MIDDLEWARE] No token found. Redirecting to /login from ${pathname}`)
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (!token) {
      return NextResponse.next()
    }

    // Verify JWT
    let payload
    try {
      payload = await verifyToken(token)
      console.log(`[MIDDLEWARE] Token verified successfully. Payload: ${JSON.stringify(payload)}`)
    } catch (err: any) {
      console.error(`[MIDDLEWARE] Token verification failed! Error: ${err?.message || err}`)
      // Invalid/expired token → redirect to login for protected routes
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/deal/') || pathname === '/onboard') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.next()
    }

    const role = payload.role

    // ── Role-based dashboard isolation ──
    if (pathname.startsWith('/dashboard')) {
      // /dashboard alone → redirect to correct dashboard
      if (pathname === '/dashboard') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = role === 'vendor' ? '/dashboard/vendor' : '/dashboard/buyer'
        return NextResponse.redirect(redirectUrl)
      }

      // Buyer trying to access vendor routes → redirect to buyer dashboard
      if (role === 'buyer' && pathname.startsWith('/dashboard/vendor')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard/buyer'
        return NextResponse.redirect(redirectUrl)
      }

      // Vendor trying to access buyer routes → redirect to vendor dashboard
      if (role === 'vendor' && pathname.startsWith('/dashboard/buyer')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard/vendor'
        return NextResponse.redirect(redirectUrl)
      }
    }

    return NextResponse.next()
  } catch (err: any) {
    console.error(`[MIDDLEWARE ERROR] Global middleware catch: ${err?.message || err}`)
    // If anything fails, pass through to avoid breaking the app
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Only match page routes, skip all static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}
