// POST /api/cmp/auth/login — Authenticate user + set JWT cookie
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma/client'
import { verifyPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/jwt'
import { TOKEN_COOKIE } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 400 }
      )
    }
    const { email, password } = parsed.data

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check email verified
    if (!user.email_verified) {
      return NextResponse.json(
        {
          data: null,
          error: 'Please verify your email before logging in.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      )
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT
    const token = await signToken({
      userId: user.id,
      alias: user.alias,
      role: user.role,
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'user_login',
        actor_alias: user.alias,
      }
    })

    const response = NextResponse.json({
      data: {
        alias: user.alias,
        role: user.role,
        onboarding_complete: user.onboarding_complete,
      },
      error: null,
    })

    response.cookies.set(
      TOKEN_COOKIE,
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      }
    )

    return response

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
