// GET /api/vendor/marketplace — all open requirements
// GET /api/vendor/marketplace/[id] — single requirement
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit
    const sort = url.searchParams.get('sort') || 'newest'

    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    
    let sortObj: Record<string, 1 | -1> = { created_at: -1 }
    if (sort === 'budget_high') sortObj = { 'budget_range.max': -1 }
    else if (sort === 'budget_low') sortObj = { 'budget_range.min': 1 }
    else if (sort === 'urgency') {
      sortObj = { urgency: -1 } // critical first
    }

    const [items, total] = await Promise.all([
      col.find({ status: 'open' }).sort(sortObj).skip(skip).limit(limit).toArray(),
      col.countDocuments({ status: 'open' }),
    ])

    return NextResponse.json(
      { data: { items, total, page, pages: Math.ceil(total / limit) }, error: null },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
