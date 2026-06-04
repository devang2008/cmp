// GET /api/cmp/vendor/proposals — my proposals
// POST /api/cmp/vendor/proposals — submit proposal
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal, BuyerRequirement } from '@/lib/types'
import { proposalSchema } from '@/lib/validations'
import { ObjectId } from 'mongodb'
import { computeTrustScore } from '@/lib/trust/compute'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function GET() {
  try {
    const profile = await requireAuth()
    const col = await getCollection<Proposal>('proposals')
    const items = await col.find({ vendor_alias: profile.alias })
      .sort({ created_at: -1 }).toArray()

    // Fetch requirement titles for each proposal
    const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
    const reqIds = Array.from(new Set(items.map(p => p.requirement_id)))
    const reqs = await reqCol.find({ _id: { $in: reqIds.map(id => new ObjectId(id)) } })
      .project({ title: 1 }).toArray()
    const reqMap = new Map(reqs.map(r => [r._id!.toString(), r.title]))

    const enriched = items.map(p => ({
      ...p,
      requirement_title: reqMap.get(p.requirement_id) || 'Unknown',
    }))

    return NextResponse.json({ data: enriched, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const parsed = proposalSchema.parse(body)

    // Verify requirement exists and is open
    const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
    const req = await reqCol.findOne({ _id: new ObjectId(parsed.requirement_id) })
    if (!req) return NextResponse.json({ data: null, error: 'Requirement not found' }, { status: 404 })
    if (req.status !== 'open' && req.status !== 'matched') {
      return NextResponse.json({ data: null, error: 'Requirement is not accepting proposals' }, { status: 400 })
    }

    // Check if vendor already submitted
    const propCol = await getCollection<Proposal>('proposals')
    const existing = await propCol.findOne({
      requirement_id: parsed.requirement_id,
      vendor_alias: profile.alias,
      status: { $ne: 'withdrawn' },
    })
    if (existing) {
      return NextResponse.json({ data: null, error: 'You already have a proposal for this requirement' }, { status: 409 })
    }

    const doc: Proposal = {
      _id: new ObjectId(),
      requirement_id: parsed.requirement_id,
      buyer_alias: req.alias,
      vendor_alias: profile.alias,
      cover_note: parsed.cover_note,
      proposed_price: parsed.proposed_price,
      proposed_timeline_weeks: parsed.proposed_timeline_weeks,
      methodology: parsed.methodology,
      relevant_experience: parsed.relevant_experience,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    }

    await propCol.insertOne(doc as any)

    // Update requirement proposal count and matched aliases
    await reqCol.updateOne(
      { _id: new ObjectId(parsed.requirement_id) },
      {
        $inc: { proposal_count: 1 },
        $addToSet: { matched_vendor_aliases: profile.alias },
        $set: { updated_at: new Date() },
      }
    )

    // Create notification for buyer via Prisma
    const newNotification = await prisma.notification.create({
      data: {
        recipient_alias: req.alias,
        type: 'new_proposal',
        content: `${profile.alias} submitted a proposal for "${req.title}"`,
        ref_id: parsed.requirement_id,
      },
    })

    // Fire-and-forget Socket.IO notification emit
    const io = (global as any).io
    if (io) {
      io.to(`notifications-${req.alias}`)
        .emit('new-notification', {
          id: newNotification.id,
          type: newNotification.type,
          content: newNotification.content,
          ref_id: newNotification.ref_id,
          read: false,
          created_at: new Date().toISOString()
        })
    }

    // --- Email Dispatch ---
    try {
      // Try resolving buyer email via Prisma
      const buyerUser = await prisma.user.findUnique({
        where: { alias: req.alias },
        select: { email: true },
      })

      if (buyerUser?.email) {
        await fetch(`${BASE_URL}/api/cmp/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
          body: JSON.stringify({
            template: 'new_proposal',
            to: buyerUser.email,
            variables: {
              recipient_alias: req.alias,
              vendor_alias: profile.alias,
              requirement_title: req.title,
              proposed_price: parsed.proposed_price.toString(),
            }
          })
        })
      }
    } catch (emailErr) {
      console.error('Email dispatch failed:', emailErr)
    }

    // --- Trigger Trust Score Recomputation ---
    try {
      await computeTrustScore(profile.alias)
    } catch (trustErr) {
      console.error('Trust update failed:', trustErr)
    }

    return NextResponse.json({ data: { id: doc._id!.toString() }, error: null }, { status: 201 })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ data: null, error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
