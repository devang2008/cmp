// POST /api/cmp/moderator/certifications/[id]/review — approve or reject a certification
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { computeTrustScore } from '@/lib/trust/compute'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { action, score, reason } = body

    // Validate action
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
    }

    // Validate approve-specific fields
    if (action === 'approve') {
      if (score === undefined || score === null || typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 100) {
        return NextResponse.json({ error: 'score must be an integer between 0 and 100' }, { status: 400 })
      }
    }

    // Validate reject-specific fields
    if (action === 'reject') {
      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return NextResponse.json({ error: 'reason is required for rejection' }, { status: 400 })
      }
    }

    // Fetch the certification
    const cert = await prisma.certification.findUnique({ where: { id } })
    if (!cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 })
    }

    // Must be PENDING
    if (cert.review_status !== 'PENDING') {
      return NextResponse.json({ error: `Certification already reviewed (status: ${cert.review_status})` }, { status: 400 })
    }

    if (action === 'approve') {
      // ── Step 1: Update certification ──
      const updatedCert = await prisma.certification.update({
        where: { id },
        data: {
          review_status: 'APPROVED',
          verified: true,
          verification_score: score,
          reviewed_by: session.alias,
          reviewed_at: new Date(),
          verified_at: new Date(),
        },
      })

      // ── Step 2: Insert trust_event (+10) ──
      await prisma.trustEvent.create({
        data: {
          alias: cert.vendor_alias,
          event_type: 'cert_approved',
          score_delta: 10,
          metadata: { cert_id: id, cert_name: cert.cert_name, score },
        },
      })

      // ── Step 3: Recompute vendor trust score ──
      const newTrustScore = await computeTrustScore(cert.vendor_alias)

      // ── Step 4: Update alias_directory cert_badges ──
      const currentDir = await prisma.aliasDirectory.findUnique({ where: { alias: cert.vendor_alias } })
      const currentBadges = currentDir?.cert_badges || []
      if (!currentBadges.includes(cert.cert_name)) {
        await prisma.aliasDirectory.update({
          where: { alias: cert.vendor_alias },
          data: { cert_badges: [...currentBadges, cert.cert_name] },
        })
      }

      // ── Step 5: Insert moderator_actions ──
      await prisma.moderatorAction.create({
        data: {
          moderator_alias: session.alias,
          action_type: 'CERT_APPROVED',
          target_type: 'CERTIFICATION',
          target_id: id,
          reason: reason || null,
          metadata: { cert_name: cert.cert_name, vendor_alias: cert.vendor_alias, score, new_trust_score: newTrustScore },
        },
      })

      // ── Step 6: Insert notification ──
      const notification = await prisma.notification.create({
        data: {
          recipient_alias: cert.vendor_alias,
          type: 'cert_approved',
          content: `Your certification "${cert.cert_name}" has been approved with a score of ${score}/100.`,
          ref_id: id,
        },
      })

      // ── Step 7: Emit Socket.IO notification ──
      const io = (global as any).io
      if (io) {
        io.to(`notifications-${cert.vendor_alias}`).emit('new-notification', {
          id: notification.id,
          type: notification.type,
          content: notification.content,
          ref_id: notification.ref_id,
          read: false,
          created_at: new Date().toISOString(),
        })
      }

      // ── Step 8: Insert audit_log ──
      await prisma.auditLog.create({
        data: {
          actor_alias: session.alias,
          action_type: 'cert_review',
          target_alias: cert.vendor_alias,
          metadata: { cert_id: id, action: 'approve', score, cert_name: cert.cert_name, new_trust_score: newTrustScore },
        },
      })

      return NextResponse.json({
        data: { certification: updatedCert, trust_score: newTrustScore },
        error: null,
      }, { status: 200 })
    }

    // ── REJECT flow ──

    // Step 1: Update certification
    const updatedCert = await prisma.certification.update({
      where: { id },
      data: {
        review_status: 'REJECTED',
        verified: false,
        verification_score: 0,
        reviewed_by: session.alias,
        reviewed_at: new Date(),
        rejection_reason: reason,
      },
    })

    // Step 2: Insert trust_event (-5)
    await prisma.trustEvent.create({
      data: {
        alias: cert.vendor_alias,
        event_type: 'cert_rejected',
        score_delta: -5,
        metadata: { cert_id: id, cert_name: cert.cert_name, reason },
      },
    })

    // Step 3: Recompute trust score
    const newTrustScore = await computeTrustScore(cert.vendor_alias)

    // Step 4: (skipped for reject — do NOT update cert_badges)

    // Step 5: Insert moderator_actions
    await prisma.moderatorAction.create({
      data: {
        moderator_alias: session.alias,
        action_type: 'CERT_REJECTED',
        target_type: 'CERTIFICATION',
        target_id: id,
        reason,
        metadata: { cert_name: cert.cert_name, vendor_alias: cert.vendor_alias, reason, new_trust_score: newTrustScore },
      },
    })

    // Step 6: Insert notification
    const notification = await prisma.notification.create({
      data: {
        recipient_alias: cert.vendor_alias,
        type: 'cert_rejected',
        content: `Your certification "${cert.cert_name}" has been rejected. Reason: ${reason}`,
        ref_id: id,
      },
    })

    // Step 7: Emit Socket.IO notification
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${cert.vendor_alias}`).emit('new-notification', {
        id: notification.id,
        type: notification.type,
        content: notification.content,
        ref_id: notification.ref_id,
        read: false,
        created_at: new Date().toISOString(),
      })
    }

    // Step 8: Insert audit_log
    await prisma.auditLog.create({
      data: {
        actor_alias: session.alias,
        action_type: 'cert_review',
        target_alias: cert.vendor_alias,
        metadata: { cert_id: id, action: 'reject', reason, cert_name: cert.cert_name, new_trust_score: newTrustScore },
      },
    })

    return NextResponse.json({
      data: { certification: updatedCert, trust_score: newTrustScore },
      error: null,
    }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
