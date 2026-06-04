// POST /api/cmp/email/send-reveal — Identity reveal notification email
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { sendEmail } from '@/lib/email/nodemailer'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const profile = await requireAuth()
    const { deal_id } = await request.json()
    if (!deal_id) {
      return NextResponse.json({ error: 'deal_id is required' }, { status: 400 })
    }

    // Fetch deal
    const deal = await prisma.deal.findUnique({ where: { id: deal_id } })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Must be identity_revealed
    if (!deal.identity_revealed) {
      return NextResponse.json({ error: 'Identity not yet revealed' }, { status: 400 })
    }

    // Only participants
    if (deal.buyer_alias !== profile.alias && deal.vendor_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Lookup both users' emails
    const buyerUser = await prisma.user.findUnique({
      where: { alias: deal.buyer_alias },
      select: { email: true },
    })
    const vendorUser = deal.vendor_alias
      ? await prisma.user.findUnique({
          where: { alias: deal.vendor_alias },
          select: { email: true },
        })
      : null

    if (!buyerUser || !vendorUser) {
      return NextResponse.json({ error: 'Could not resolve user emails' }, { status: 500 })
    }

    const buyerEmail = buyerUser.email
    const vendorEmail = vendorUser.email

    const revealHtml = (recipientAlias: string, otherAlias: string, otherEmail: string) => `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">🛡️ SHIELD — Identity Revealed</h1>
        </div>
        <div style="padding:32px;color:#e2e8f0">
          <p>Hello <strong style="color:#22d3ee">${recipientAlias}</strong>,</p>
          <p>Both parties have consented to identity reveal for deal <strong>${deal_id.slice(0, 8)}…</strong>.</p>
          <div style="margin:20px 0;padding:16px;background:#1e293b;border-radius:8px;border-left:3px solid #f59e0b">
            <p style="margin:0 0 8px 0;color:#94a3b8;font-size:13px">The other party's details:</p>
            <p style="margin:0;font-size:16px"><strong>Alias:</strong> <span style="color:#22d3ee">${otherAlias}</span></p>
            <p style="margin:4px 0 0 0;font-size:16px"><strong>Email:</strong> <a href="mailto:${otherEmail}" style="color:#34d399">${otherEmail}</a></p>
          </div>
          <p style="color:#64748b;font-size:13px">You can now communicate directly outside the platform.</p>
          <a href="${BASE_URL}/deal/${deal_id}/chat" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View Deal</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #1e293b;color:#64748b;font-size:12px">
          This is an automated reveal notification. Handle shared information responsibly.
        </div>
      </div>
    `

    const results = []

    // Send to buyer
    if (buyerEmail && vendorEmail) {
      const s1 = await sendEmail({
        to: buyerEmail,
        subject: 'Identity Revealed — SHIELD Deal',
        html: revealHtml(deal.buyer_alias, deal.vendor_alias!, vendorEmail),
      })
      results.push({ to: 'buyer', sent: s1 })

      const s2 = await sendEmail({
        to: vendorEmail,
        subject: 'Identity Revealed — SHIELD Deal',
        html: revealHtml(deal.vendor_alias!, deal.buyer_alias, buyerEmail),
      })
      results.push({ to: 'vendor', sent: s2 })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor_alias: profile.alias,
        action_type: 'reveal_email_sent',
        deal_id: deal_id,
        metadata: { buyer: deal.buyer_alias, vendor: deal.vendor_alias },
      },
    })

    return NextResponse.json({ data: { results }, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    console.error('[email/send-reveal] Error:', msg)
    return NextResponse.json({ error: msg, sent: false }, { status: 200 }) // best-effort
  }
}
