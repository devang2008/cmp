// POST /api/cmp/deals/[id]/close — buyer closes a deal from REVIEW → CLOSED
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { computeTrustScore } from '@/lib/trust/compute'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params

    if (profile.role !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can close deals' }, { status: 403 })
    }

    // Fetch deal
    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Verify buyer owns this deal
    if (deal.buyer_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Must be in REVIEW state
    if (deal.status !== 'REVIEW') {
      return NextResponse.json({ error: `Deal must be in REVIEW state to close (current: ${deal.status})` }, { status: 400 })
    }

    // Update deal status to CLOSED
    await prisma.deal.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closed_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Insert deal event
    await prisma.dealEvent.create({
      data: {
        deal_id: id,
        event_type: 'deal_closed',
        from_status: 'REVIEW',
        to_status: 'CLOSED',
        actor_alias: profile.alias,
        note: 'Deal closed by buyer',
      },
    })

    // Insert system message in chat
    await prisma.message.create({
      data: {
        deal_id: id,
        sender_alias: profile.alias,
        encrypted_content: 'Deal has been closed. Both parties can now leave a review.',
        message_type: 'system',
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'deal_closed',
        actor_alias: profile.alias,
        target_alias: deal.vendor_alias,
        deal_id: id,
        metadata: { from_status: 'REVIEW', to_status: 'CLOSED' },
      },
    })

    const notif1 = await prisma.notification.create({
      data: {
        recipient_alias: profile.alias,
        type: 'deal_status_change',
        content: 'Deal closed successfully. Please rate the vendor.',
        ref_id: id,
      }
    })
    const notif2 = await prisma.notification.create({
      data: {
        recipient_alias: deal.vendor_alias!,
        type: 'deal_status_change',
        content: 'Deal closed by buyer. Please rate the buyer.',
        ref_id: id,
      }
    })

    // Fire-and-forget Socket.IO notification emit
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${profile.alias}`)
        .emit('new-notification', {
          id: notif1.id,
          type: notif1.type,
          content: notif1.content,
          ref_id: notif1.ref_id,
          read: false,
          created_at: new Date().toISOString()
        })
      io.to(`notifications-${deal.vendor_alias}`)
        .emit('new-notification', {
          id: notif2.id,
          type: notif2.type,
          content: notif2.content,
          ref_id: notif2.ref_id,
          read: false,
          created_at: new Date().toISOString()
        })
    }

    // Trust event: deal_completed for vendor (+15)
    if (deal.vendor_alias) {
      await prisma.trustEvent.create({
        data: {
          alias: deal.vendor_alias,
          event_type: 'deal_completed',
          score_delta: 15,
          deal_id: id,
        },
      })

      // Recompute trust score
      try {
        await computeTrustScore(deal.vendor_alias)
      } catch { /* fire-and-forget */ }
    }

    // Email dispatch
    try {
      if (deal.vendor_alias) {
        const vendorUser = await prisma.user.findUnique({
          where: { alias: deal.vendor_alias },
          select: { email: true },
        })
        if (vendorUser?.email) {
          fetch(`${BASE_URL}/api/cmp/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
            body: JSON.stringify({
              template: 'deal_status_change',
              to: vendorUser.email,
              variables: { recipient_alias: deal.vendor_alias, from_status: 'REVIEW', to_status: 'CLOSED', deal_id: id },
            }),
          }).catch(() => {})
        }
      }
    } catch {}

    return NextResponse.json({
      data: { deal_id: id, status: 'CLOSED' },
      error: null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
