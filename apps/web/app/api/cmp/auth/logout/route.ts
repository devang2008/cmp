// POST /api/cmp/auth/logout — Clear JWT cookie
import { NextResponse } from 'next/server'
import { TOKEN_COOKIE } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const response = NextResponse.json(
      { data: { success: true }, error: null }
    )
    response.cookies.set(TOKEN_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // expire immediately
      path: '/'
    })
    return response
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
