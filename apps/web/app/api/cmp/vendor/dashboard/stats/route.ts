// GET /api/cmp/vendor/dashboard/stats
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal, BuyerRequirement } from '@/lib/types'

export async function GET() {
  try {
    const session = await requireAuth()
    if (session.role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const alias = session.alias
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [openReqs, activeProps, activeDealsCount, earningsData, trustRes] = await Promise.all([
      getCollection<BuyerRequirement>('buyer_requirements')
        .then(c => c.countDocuments({ status: 'open' }))
        .catch(() => 0),
      getCollection<Proposal>('proposals')
        .then(c => c.countDocuments({ vendor_alias: alias, status: 'pending' }))
        .catch(() => 0),
      prisma.deal.count({
        where: {
          vendor_alias: alias,
          status: { in: ['CONTRACTED', 'IN_PROGRESS', 'REVIEW'] },
        },
      }),
      prisma.deal.findMany({
        where: {
          vendor_alias: alias,
          status: 'CLOSED',
          closed_at: { gte: monthStart },
        },
        select: { agreed_price: true },
      }),
      prisma.user.findUnique({
        where: { alias },
        select: { trust_score: true },
      }),
    ])

    const earnings = earningsData.reduce(
      (sum: number, d: { agreed_price: number | null }) => sum + (d.agreed_price || 0),
      0
    )

    return NextResponse.json(
      {
        data: {
          open_opportunities: openReqs,
          active_proposals: activeProps,
          active_deals: activeDealsCount,
          trust_score: trustRes?.trust_score || 0,
          earnings_this_month: earnings,
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
