// POST /api/cmp/auth/signup — Create new user account
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import prisma from '@/lib/prisma/client'
import { hashPassword } from '@/lib/auth/password'
import { sendEmail, buildVerificationEmail } from '@/lib/email/nodemailer'

export const dynamic = 'force-dynamic'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  alias: z.string().regex(/^(Vendor|Buyer)-[a-zA-Z0-9]{3,16}$/, 'Invalid alias format'),
  role: z.enum(['buyer', 'vendor'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SignupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }
    const { email, password, alias, role } = parsed.data

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { data: null, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Check alias uniqueness
    const existingAlias = await prisma.user.findUnique({ where: { alias } })
    if (existingAlias) {
      return NextResponse.json(
        { data: null, error: 'Alias already taken' },
        { status: 409 }
      )
    }

    // Generate verification token (built for later use)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // Hash password
    const password_hash = await hashPassword(password)

    // Create user
    await prisma.user.create({
      data: {
        email,
        password_hash,
        alias,
        role,
        email_verified: false,
        verification_token: token,
        verification_expires: expires,
        onboarding_complete: false
      }
    })

    // Create alias directory entry
    await prisma.aliasDirectory.create({
      data: {
        alias,
        role,
        cert_badges: [],
        skills: [],
      }
    })

    // Send real verification email
    try {
      const html = buildVerificationEmail(alias, token)
      await sendEmail({
        to: email,
        subject: 'Verify your SHIELD account',
        html
      })
    } catch (err) {
      console.error('SMTP email send failed:', err)
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'user_signup',
        actor_alias: alias,
        metadata: { role },
      }
    })

    return NextResponse.json({
      data: {
        message: 'Account created! Check your email to verify your account.'
      },
      error: null
    }, { status: 201 })

  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
