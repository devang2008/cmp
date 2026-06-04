// POST /api/cmp/deals/[id]/consent-reveal — identity reveal consent
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { computeTrustScore } from '@/lib/trust/compute'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params

    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    if (deal.status !== 'CLOSED') {
      return NextResponse.json({ error: 'Deal must be closed for identity reveal' }, { status: 400 })
    }

    const isBuyer = deal.buyer_alias === profile.alias
    const isVendor = deal.vendor_alias === profile.alias
    if (!isBuyer && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateField = isBuyer ? 'buyer_consented_reveal' : 'vendor_consented_reveal'
    await prisma.deal.update({
      where: { id },
      data: { [updateField]: true },
    })

    // Check if both have consented
    const otherConsented = isBuyer ? deal.vendor_consented_reveal : deal.buyer_consented_reveal
    if (otherConsented) {
      // Both consented — reveal identity
      await prisma.deal.update({
        where: { id },
        data: { identity_revealed: true },
      })

      await prisma.auditLog.create({
        data: {
          actor_alias: profile.alias,
          action_type: 'identity_revealed',
          deal_id: id,
          metadata: { buyer: deal.buyer_alias, vendor: deal.vendor_alias },
        },
      })

      // Notify both
      await prisma.notification.createMany({
        data: [
          {
            recipient_alias: deal.buyer_alias,
            type: 'identity_revealed',
            content: 'Both parties consented — identity revealed via email.',
            ref_id: id,
          },
          {
            recipient_alias: deal.vendor_alias!,
            type: 'identity_revealed',
            content: 'Both parties consented — identity revealed via email.',
            ref_id: id,
          },
        ],
      })

      // Identity Reveal Email Dispatch
      try {
        await fetch(`${BASE_URL}/api/cmp/email/send-reveal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': _req.headers.get('cookie') || '' },
          body: JSON.stringify({ deal_id: id })
        })
      } catch (emailErr) {
        console.error('Reveal email dispatch failed:', emailErr)
      }

      // Trigger Trust Score Recomputation
      if (deal.vendor_alias) {
        try {
          await computeTrustScore(deal.vendor_alias)
        } catch (trustErr) {
          console.error('Trust update failed:', trustErr)
        }
      }
    }

    return NextResponse.json({
      data: {
        consented: true,
        identity_revealed: otherConsented,
      },
      status: 200,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
