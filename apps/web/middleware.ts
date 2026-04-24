// ============================================================
// NEXT.JS MIDDLEWARE — Route protection + role-based isolation
// ============================================================
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { user, supabaseResponse, supabase } = await updateSession(request)
    const pathname = request.nextUrl.pathname

    // Public routes — allow without auth
    const publicPaths = ['/', '/login', '/signup', '/onboard', '/marketplace', '/vendor']
    const isPublic = publicPaths.some(path => pathname === path)

    if (isPublic) {
      return supabaseResponse
    }

    // Protected routes — redirect to login if no user
    if (!user && pathname.startsWith('/dashboard')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // ── Role-based dashboard isolation ──
    if (user && pathname.startsWith('/dashboard')) {
      // 1. Try JWT metadata (zero-latency)
      let role = user.user_metadata?.role as string | undefined

      // 2. Fallback for old accounts without role in metadata
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        role = profile?.role
      }

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

    return supabaseResponse
  } catch {
    // If Supabase is unreachable, pass through to avoid breaking the app
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
