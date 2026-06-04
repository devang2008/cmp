// GET /api/cmp/vendor/marketplace/[id] — single requirement detail
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement, Proposal } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Vendor only' }, { status: 403 })
    }

    const { id } = await params
    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    const doc = await col.findOne({ _id: new ObjectId(id) })
    
    if (!doc) {
      return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    }

    // Check if this vendor already has a proposal for this requirement
    const propCol = await getCollection<Proposal>('proposals')
    const existingProposal = await propCol.findOne({
      requirement_id: id,
      vendor_alias: profile.alias,
      status: { $ne: 'withdrawn' },
    })
    
    return NextResponse.json({
      data: {
        requirement: doc,
        existing_proposal: existingProposal ? {
          ...existingProposal,
          _id: existingProposal._id!.toString(),
        } : null,
      },
      error: null,
    }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
