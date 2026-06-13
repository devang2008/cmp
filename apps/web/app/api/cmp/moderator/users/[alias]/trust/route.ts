// POST /api/cmp/moderator/users/[alias]/trust — manual trust score adjustment
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { computeTrustScore } from '@/lib/trust/compute'

export async function POST(req: NextRequest, { params }: { params: Promise<{ alias: string }> }) {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { alias } = await params
    const body = await req.json()
    const { adjustment, reason } = body

    // Validate adjustment
    if (adjustment === undefined || adjustment === null || typeof adjustment !== 'number' || adjustment < -50 || adjustment > 50) {
      return NextResponse.json({ error: 'adjustment must be a number between -50 and 50' }, { status: 400 })
    }

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: 'reason is required and must be a non-empty string' }, { status: 400 })
    }

    // Find user by alias
    const user = await prisma.user.findUnique({
      where: { alias },
      select: { id: true, alias: true, trust_score: true, role: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Step 1: Insert trust_event
    await prisma.trustEvent.create({
      data: {
        alias,
        event_type: 'moderator_adjustment',
        score_delta: adjustment,
        metadata: { reason, adjusted_by: session.alias },
      },
    })

    // Step 2: Recompute trust score
    const newTrustScore = await computeTrustScore(alias)

    // Step 3: Insert moderator_actions
    await prisma.moderatorAction.create({
      data: {
        moderator_alias: session.alias,
        action_type: 'USER_TRUST_ADJUSTED',
        target_type: 'USER',
        target_id: user.id,
        reason,
        metadata: { alias, adjustment, previous_score: user.trust_score, new_trust_score: newTrustScore },
      },
    })

    // Step 4: Insert notification
    const notification = await prisma.notification.create({
      data: {
        recipient_alias: alias,
        type: 'trust_adjusted',
        content: `Your trust score has been adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}. Reason: ${reason}`,
        ref_id: user.id,
      },
    })

    // Step 5: Emit Socket.IO notification
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${alias}`).emit('new-notification', {
        id: notification.id,
        type: notification.type,
        content: notification.content,
        ref_id: notification.ref_id,
        read: false,
        created_at: new Date().toISOString(),
      })
    }

    // Step 6: Insert audit_log
    await prisma.auditLog.create({
      data: {
        actor_alias: session.alias,
        action_type: 'trust_adjustment',
        target_alias: alias,
        metadata: { adjustment, reason, previous_score: user.trust_score, new_trust_score: newTrustScore },
      },
    })

    return NextResponse.json({
      data: { alias, new_trust_score: newTrustScore, adjustment },
      error: null,
    }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
