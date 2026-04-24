// GET /api/buyer/requirements — list all
// POST /api/buyer/requirements — create new
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement } from '@/lib/types'
import { requirementSchema } from '@/lib/validations'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth()
    const alias = profile.alias
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit

    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    const [items, total] = await Promise.all([
      col.find({ alias }).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments({ alias }),
    ])

    return NextResponse.json(
      { data: { items, total, page, pages: Math.ceil(total / limit) }, error: null },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'buyer') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const parsed = requirementSchema.parse(body)

    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    const doc: BuyerRequirement = {
      _id: new ObjectId(),
      alias: profile.alias,
      ...parsed,
      compliance_needs: parsed.compliance_needs || [],
      tech_stack: parsed.tech_stack || [],
      status: 'open',
      matched_vendor_aliases: [],
      proposal_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }

    await col.insertOne(doc as any)

    // After successful save, we should trigger matching (simulated via client calling /api/matching/run in POST as per instructions, or we could fetch here)
    // The instructions say: "After success -> POST /api/matching/run { requirement_id }" in the UI portion.
    return NextResponse.json({ data: { id: doc._id!.toString() }, error: null }, { status: 201 })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ data: null, error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
