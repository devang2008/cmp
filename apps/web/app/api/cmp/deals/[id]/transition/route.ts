// POST /api/cmp/deals/[id]/transition — state machine
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { dealTransitionSchema } from '@/lib/validations'
import { computeTrustScore } from '@/lib/trust/compute'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

const TRANSITIONS: Record<string, { to: string; allowedRoles: string[] }[]> = {
  POSTED: [{ to: 'MATCHED', allowedRoles: ['admin'] }],
  MATCHED: [{ to: 'NEGOTIATING', allowedRoles: ['buyer'] }],
  NEGOTIATING: [
    { to: 'CONTRACTED', allowedRoles: ['buyer', 'vendor'] },
    { to: 'CANCELLED', allowedRoles: ['buyer', 'vendor'] },
  ],
  CONTRACTED: [{ to: 'IN_PROGRESS', allowedRoles: ['vendor'] }],
  IN_PROGRESS: [{ to: 'REVIEW', allowedRoles: ['vendor'] }],
  REVIEW: [
    // CLOSED is handled by /api/cmp/deals/[id]/close — do NOT add here
    { to: 'IN_PROGRESS', allowedRoles: ['buyer'] },
    { to: 'DISPUTED', allowedRoles: ['buyer'] },
  ],
  DISPUTED: [
    { to: 'CLOSED', allowedRoles: ['admin'] },
    { to: 'IN_PROGRESS', allowedRoles: ['admin'] },
  ],
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = dealTransitionSchema.parse(body)
    const targetStatus = parsed.action

    // Fetch current deal
    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

    // Verify participant
    const isBuyer = deal.buyer_alias === profile.alias
    const isVendor = deal.vendor_alias === profile.alias
    if (!isBuyer && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine caller role in context of this deal
    const callerRole = isBuyer ? 'buyer' : 'vendor'

    // Check transition is allowed
    const allowed = TRANSITIONS[deal.status] || []
    const transition = allowed.find(
      t => t.to === targetStatus && t.allowedRoles.includes(callerRole)
    )
    if (!transition) {
      return NextResponse.json({
        error: `Cannot transition from ${deal.status} to ${targetStatus} as ${callerRole}`,
      }, { status: 400 })
    }

    // Execute transition
    const updateData: Record<string, unknown> = {
      status: targetStatus,
      updated_at: new Date(),
    }
    if (targetStatus === 'CLOSED') {
      updateData.closed_at = new Date()
    }

    await prisma.deal.update({
      where: { id },
      data: updateData,
    })

    // Insert deal event
    await prisma.dealEvent.create({
      data: {
        deal_id: id,
        event_type: 'status_change',
        from_status: deal.status,
        to_status: targetStatus,
        actor_alias: profile.alias,
        note: parsed.note || `Status changed to ${targetStatus}`,
        metadata: (parsed.metadata as any) || {},
      },
    })

    // Insert system message in chat
    await prisma.message.create({
      data: {
        deal_id: id,
        sender_alias: profile.alias,
        encrypted_content: `Deal status changed to ${targetStatus}`,
        message_type: 'system',
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor_alias: profile.alias,
        action_type: 'deal_transition',
        deal_id: id,
        metadata: { from: deal.status, to: targetStatus },
      },
    })

    // Notify other party
    const otherAlias = isBuyer ? deal.vendor_alias : deal.buyer_alias
    if (otherAlias) {
      const newNotification = await prisma.notification.create({
        data: {
          recipient_alias: otherAlias,
          type: 'deal_status_change',
          content: `Deal status changed to ${targetStatus}`,
          ref_id: id,
        },
      })

      // Fire-and-forget Socket.IO notification emit
      const io = (global as any).io
      if (io) {
        io.to(`notifications-${otherAlias}`)
          .emit('new-notification', {
            id: newNotification.id,
            type: newNotification.type,
            content: newNotification.content,
            ref_id: newNotification.ref_id,
            read: false,
            created_at: new Date().toISOString()
          })
      }
    }

    // Trust events on completion
    if (targetStatus === 'CLOSED' && deal.vendor_alias) {
      await prisma.trustEvent.create({
        data: {
          alias: deal.vendor_alias,
          event_type: 'deal_completed',
          score_delta: 15,
          deal_id: id,
        },
      })
    }
    if (targetStatus === 'CANCELLED') {
      if (deal.vendor_alias) {
        await prisma.trustEvent.create({
          data: {
            alias: deal.vendor_alias,
            event_type: 'deal_cancelled',
            score_delta: -8,
            deal_id: id,
          },
        })
      }
    }

    // Trigger Trust Score Recomputation
    if (deal.vendor_alias && (targetStatus === 'CLOSED' || targetStatus === 'CANCELLED')) {
      try {
        await computeTrustScore(deal.vendor_alias)
      } catch (trustErr) {
        console.error('Trust update failed:', trustErr)
      }
    }

    // Email Dispatch
    if (otherAlias) {
      try {
        const targetUser = await prisma.user.findUnique({
          where: { alias: otherAlias },
          select: { email: true },
        })

        if (targetUser?.email) {
          await fetch(`${BASE_URL}/api/cmp/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
            body: JSON.stringify({
              template: 'deal_status_change',
              to: targetUser.email,
              variables: {
                recipient_alias: otherAlias,
                from_status: deal.status,
                to_status: targetStatus,
                deal_id: id,
              }
            })
          })
        }
      } catch (emailErr) {
        console.error('Email dispatch failed:', emailErr)
      }
    }

    return NextResponse.json({
      data: { deal_id: id, newStatus: targetStatus },
      status: 200,
    })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
