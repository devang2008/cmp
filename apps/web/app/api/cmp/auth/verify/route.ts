// GET /api/cmp/auth/verify — Verify email via token link
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'
import { signToken } from '@/lib/auth/jwt'
import { TOKEN_COOKIE } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=missing_token', request.url)
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        verification_token: token,
        verification_expires: { gt: new Date() },
        email_verified: false,
      }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_or_expired_token', request.url)
      )
    }

    // Mark as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        verification_token: null,
        verification_expires: null,
      }
    })

    // Create JWT
    const jwtToken = await signToken({
      userId: user.id,
      alias: user.alias,
      role: user.role,
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'email_verified',
        actor_alias: user.alias,
      }
    })

    const redirectResponse = NextResponse.redirect(
      new URL('/onboard', request.url)
    )
    redirectResponse.cookies.set(
      TOKEN_COOKIE,
      jwtToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      }
    )
    return redirectResponse

  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.redirect(
      new URL('/login?error=verification_failed', request.url)
    )
  }
}
