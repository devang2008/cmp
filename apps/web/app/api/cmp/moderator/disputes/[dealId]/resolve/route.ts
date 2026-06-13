// POST /api/cmp/moderator/disputes/[dealId]/resolve — resolve a disputed deal
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { computeTrustScore } from '@/lib/trust/compute'

export async function POST(req: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { dealId } = await params
    const body = await req.json()
    const { resolution, reason, buyer_trust_adjustment = 0, vendor_trust_adjustment = 0 } = body

    // Validate resolution
    if (!['buyer_favor', 'vendor_favor', 'mutual'].includes(resolution)) {
      return NextResponse.json({ error: 'resolution must be "buyer_favor", "vendor_favor", or "mutual"' }, { status: 400 })
    }

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: 'reason is required and must be a non-empty string' }, { status: 400 })
    }

    // Validate trust adjustments
    const buyerAdj = Number(buyer_trust_adjustment)
    const vendorAdj = Number(vendor_trust_adjustment)
    if (isNaN(buyerAdj) || buyerAdj < -20 || buyerAdj > 20) {
      return NextResponse.json({ error: 'buyer_trust_adjustment must be between -20 and 20' }, { status: 400 })
    }
    if (isNaN(vendorAdj) || vendorAdj < -20 || vendorAdj > 20) {
      return NextResponse.json({ error: 'vendor_trust_adjustment must be between -20 and 20' }, { status: 400 })
    }

    // Fetch the deal
    const deal = await prisma.deal.findUnique({ where: { id: dealId } })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (deal.status !== 'DISPUTED') {
      return NextResponse.json({ error: `Deal is not in DISPUTED status (current: ${deal.status})` }, { status: 400 })
    }

    // Step 1: Update deal status to RESOLVED
    await prisma.deal.update({
      where: { id: dealId },
      data: { status: 'RESOLVED', closed_at: new Date() },
    })

    // Step 2: Create deal_event
    await prisma.dealEvent.create({
      data: {
        deal_id: dealId,
        event_type: 'dispute_resolved',
        from_status: 'DISPUTED',
        to_status: 'RESOLVED',
        actor_alias: session.alias,
        note: reason,
        metadata: { resolution, buyer_adj: buyerAdj, vendor_adj: vendorAdj },
      },
    })

    // Step 3: Apply buyer trust adjustment if non-zero
    if (buyerAdj !== 0) {
      await prisma.trustEvent.create({
        data: {
          alias: deal.buyer_alias,
          event_type: 'dispute_resolution',
          score_delta: buyerAdj,
          deal_id: dealId,
          metadata: { resolution, role: 'buyer', reason },
        },
      })
      await computeTrustScore(deal.buyer_alias)
    }

    // Step 4: Apply vendor trust adjustment if non-zero
    if (vendorAdj !== 0 && deal.vendor_alias) {
      await prisma.trustEvent.create({
        data: {
          alias: deal.vendor_alias,
          event_type: 'dispute_resolution',
          score_delta: vendorAdj,
          deal_id: dealId,
          metadata: { resolution, role: 'vendor', reason },
        },
      })
      await computeTrustScore(deal.vendor_alias)
    }

    // Step 5: Insert moderator_actions
    await prisma.moderatorAction.create({
      data: {
        moderator_alias: session.alias,
        action_type: 'DISPUTE_RESOLVED',
        target_type: 'DEAL',
        target_id: dealId,
        reason,
        metadata: { resolution, buyer_alias: deal.buyer_alias, vendor_alias: deal.vendor_alias, buyer_adj: buyerAdj, vendor_adj: vendorAdj },
      },
    })

    // Step 6: Notify buyer
    const buyerNotif = await prisma.notification.create({
      data: {
        recipient_alias: deal.buyer_alias,
        type: 'dispute_resolved',
        content: `Dispute for deal has been resolved (${resolution}). Reason: ${reason}`,
        ref_id: dealId,
      },
    })

    // Step 7: Notify vendor
    let vendorNotif = null
    if (deal.vendor_alias) {
      vendorNotif = await prisma.notification.create({
        data: {
          recipient_alias: deal.vendor_alias,
          type: 'dispute_resolved',
          content: `Dispute for deal has been resolved (${resolution}). Reason: ${reason}`,
          ref_id: dealId,
        },
      })
    }

    // Step 8: Emit Socket.IO to both
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${deal.buyer_alias}`).emit('new-notification', {
        id: buyerNotif.id,
        type: buyerNotif.type,
        content: buyerNotif.content,
        ref_id: buyerNotif.ref_id,
        read: false,
        created_at: new Date().toISOString(),
      })
      if (vendorNotif && deal.vendor_alias) {
        io.to(`notifications-${deal.vendor_alias}`).emit('new-notification', {
          id: vendorNotif.id,
          type: vendorNotif.type,
          content: vendorNotif.content,
          ref_id: vendorNotif.ref_id,
          read: false,
          created_at: new Date().toISOString(),
        })
      }
    }

    // Step 9: Insert audit_log
    await prisma.auditLog.create({
      data: {
        actor_alias: session.alias,
        action_type: 'dispute_resolved',
        deal_id: dealId,
        metadata: { resolution, reason, buyer_alias: deal.buyer_alias, vendor_alias: deal.vendor_alias, buyer_adj: buyerAdj, vendor_adj: vendorAdj },
      },
    })

    return NextResponse.json({
      data: { deal_id: dealId, resolution, reason },
      error: null,
    }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
