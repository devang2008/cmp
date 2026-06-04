// POST /api/cmp/deals/[id]/review — submit a rating after deal closes
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { computeTrustScore } from '@/lib/trust/compute'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().default(''),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = reviewSchema.parse(body)

    // Fetch deal
    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Verify caller is participant
    const isBuyer = deal.buyer_alias === profile.alias
    const isVendor = deal.vendor_alias === profile.alias
    if (!isBuyer && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Must be CLOSED
    if (deal.status !== 'CLOSED') {
      return NextResponse.json({ error: 'Deal must be closed before reviewing' }, { status: 400 })
    }

    // Determine roles
    const reviewer_role = isBuyer ? 'buyer' : 'vendor'
    const reviewee_alias = isBuyer ? deal.vendor_alias! : deal.buyer_alias

    // Check for duplicate review
    const existing = await prisma.review.findUnique({
      where: {
        deal_id_reviewer_role: {
          deal_id: id,
          reviewer_role,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this deal' }, { status: 409 })
    }

    // Insert review
    const review = await prisma.review.create({
      data: {
        deal_id: id,
        reviewer_alias: profile.alias,
        reviewee_alias,
        reviewer_role,
        rating: parsed.rating,
        comment: parsed.comment,
      },
      select: { id: true, rating: true, reviewee_alias: true },
    })

    // Trust event for vendor reviews only (buyer reviewing vendor)
    if (reviewer_role === 'buyer' && parsed.rating !== 3) {
      const scoreDelta = parsed.rating - 3
      await prisma.trustEvent.create({
        data: {
          alias: reviewee_alias,
          event_type: 'review_received',
          score_delta: scoreDelta,
          deal_id: id,
        },
      })

      // Recompute trust score
      try {
        await computeTrustScore(reviewee_alias)
      } catch { /* fire-and-forget */ }
    }

    // Notify reviewee
    const newNotification = await prisma.notification.create({
      data: {
        recipient_alias: reviewee_alias,
        type: 'review_received',
        content: `${profile.alias} left you a ${parsed.rating}-star review`,
        ref_id: id,
      },
    })

    // Fire-and-forget Socket.IO notification emit
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${reviewee_alias}`)
        .emit('new-notification', {
          id: newNotification.id,
          type: newNotification.type,
          content: newNotification.content,
          ref_id: newNotification.ref_id,
          read: false,
          created_at: new Date().toISOString()
        })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'review_submitted',
        actor_alias: profile.alias,
        target_alias: reviewee_alias,
        deal_id: id,
        metadata: { rating: parsed.rating, reviewer_role },
      },
    })

    return NextResponse.json({
      data: { review_id: review?.id, rating: parsed.rating, reviewee_alias },
      error: null,
    })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
