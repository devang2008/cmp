// POST /api/cmp/auth/resend-verification — Resend verification email
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import prisma from '@/lib/prisma/client'
import { sendEmail, buildVerificationEmail } from '@/lib/email/nodemailer'

export const dynamic = 'force-dynamic'

const ResendSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ResendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Invalid email' },
        { status: 400 }
      )
    }
    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user || user.email_verified) {
      return NextResponse.json({
        data: { message: 'If that email exists and is unverified, a new link has been sent.' },
        error: null,
      })
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_token: token,
        verification_expires: expires,
      }
    })

    // Send verification email
    try {
      const html = buildVerificationEmail(user.alias, token)
      await sendEmail({
        to: email,
        subject: 'Verify your SHIELD account',
        html,
      })
    } catch (err) {
      console.error('SMTP email send failed in resend-verification:', err)
    }

    return NextResponse.json({
      data: { message: 'If that email exists and is unverified, a new link has been sent.' },
      error: null,
    })

  } catch (err) {
    console.error('Resend verification error:', err)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
