// GET /api/buyer/proposals — all proposals across buyer's requirements
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement, Proposal } from '@/lib/types'

export async function GET() {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'buyer') return NextResponse.json({ data: null, error: 'Buyer only' }, { status: 403 })

    // Get all requirements for this buyer
    const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
    const reqs = await reqCol.find({ buyer_alias: profile.alias }).toArray()
    const reqIds = reqs.map(r => r._id!.toString())
    const reqMap = new Map(reqs.map(r => [r._id!.toString(), r.title]))

    if (reqIds.length === 0) return NextResponse.json({ data: [], error: null }, { status: 200 })

    // Get all proposals for these requirements
    const propCol = await getCollection<Proposal>('proposals')
    const proposals = await propCol
      .find({ requirement_id: { $in: reqIds } })
      .sort({ created_at: -1 })
      .toArray()

    const enriched = proposals.map(p => ({
      ...p,
      _id: p._id!.toString(),
      requirement_title: reqMap.get(p.requirement_id) || 'Unknown',
    }))

    return NextResponse.json({ data: enriched, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
