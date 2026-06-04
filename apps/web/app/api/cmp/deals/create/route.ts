// POST /api/cmp/deals/create — create deal from accepted proposal
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal, BuyerRequirement } from '@/lib/types'
import { ObjectId } from 'mongodb'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can create deals' }, { status: 403 })
    }

    const { proposal_id } = await request.json()
    if (!proposal_id) {
      return NextResponse.json({ error: 'proposal_id is required' }, { status: 400 })
    }

    const propCol = await getCollection<Proposal>('proposals')
    const proposal = await propCol.findOne({ _id: new ObjectId(proposal_id) })
    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    if (proposal.status !== 'pending') {
      return NextResponse.json({ error: 'Proposal is no longer pending' }, { status: 400 })
    }
    if (proposal.buyer_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create deal in Prisma
    const deal = await prisma.deal.create({
      data: {
        buyer_alias: profile.alias,
        vendor_alias: proposal.vendor_alias,
        requirement_id: proposal.requirement_id,
        status: 'NEGOTIATING',
        agreed_price: proposal.proposed_price,
      },
    })

    // Accept this proposal, reject all others for same requirement
    await propCol.updateOne(
      { _id: new ObjectId(proposal_id) },
      { $set: { status: 'accepted', updated_at: new Date() } }
    )
    await propCol.updateMany(
      { requirement_id: proposal.requirement_id, _id: { $ne: new ObjectId(proposal_id) }, status: 'pending' },
      { $set: { status: 'rejected', updated_at: new Date() } }
    )

    // Update requirement status
    const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
    await reqCol.updateOne(
      { _id: new ObjectId(proposal.requirement_id) },
      { $set: { status: 'matched', updated_at: new Date() } }
    )

    // Create deal event
    await prisma.dealEvent.create({
      data: {
        deal_id: deal.id,
        event_type: 'deal_created',
        to_status: 'NEGOTIATING',
        actor_alias: profile.alias,
        note: 'Deal created from accepted proposal',
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor_alias: profile.alias,
        action_type: 'deal_created',
        deal_id: deal.id,
        metadata: { proposal_id, vendor_alias: proposal.vendor_alias },
      },
    })

    const notif1 = await prisma.notification.create({
      data: {
        recipient_alias: proposal.vendor_alias,
        type: 'proposal_accepted',
        content: `Your proposal was accepted! Deal created.`,
        ref_id: deal.id,
      }
    })
    const notif2 = await prisma.notification.create({
      data: {
        recipient_alias: profile.alias,
        type: 'deal_created',
        content: `Deal created with ${proposal.vendor_alias}`,
        ref_id: deal.id,
      }
    })

    // Fire-and-forget Socket.IO notification emit
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${proposal.vendor_alias}`)
        .emit('new-notification', {
          id: notif1.id,
          type: notif1.type,
          content: notif1.content,
          ref_id: notif1.ref_id,
          read: false,
          created_at: new Date().toISOString()
        })
      io.to(`notifications-${profile.alias}`)
        .emit('new-notification', {
          id: notif2.id,
          type: notif2.type,
          content: notif2.content,
          ref_id: notif2.ref_id,
          read: false,
          created_at: new Date().toISOString()
        })
    }

    // --- Email Dispatch to Vendor ---
    try {
      const vendorUser = await prisma.user.findUnique({
        where: { alias: proposal.vendor_alias },
        select: { email: true },
      })

      if (vendorUser?.email) {
        await fetch(`${BASE_URL}/api/cmp/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
          body: JSON.stringify({
            template: 'proposal_accepted',
            to: vendorUser.email,
            variables: {
              vendor_alias: proposal.vendor_alias,
              deal_id: deal.id,
            }
          })
        })
      }
    } catch (emailErr) {
      console.error('Email dispatch failed:', emailErr)
    }

    return NextResponse.json({ data: { deal_id: deal.id }, status: 201 }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
