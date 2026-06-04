// GET /api/cmp/buyer/dashboard/stats
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement, Proposal } from '@/lib/types'

export async function GET() {
  try {
    const session = await requireAuth()
    if (session.role !== 'buyer') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const alias = session.alias

    const [activeReqs, proposalsReceived, activeDealsCount, completedDealsCount, recentActivity] =
      await Promise.all([
        getCollection<BuyerRequirement>('buyer_requirements')
          .then(c => c.countDocuments({ alias, status: { $ne: 'closed' } }))
          .catch(() => 0),
        getCollection<Proposal>('proposals')
          .then(c => c.countDocuments({ buyer_alias: alias, status: 'pending' }))
          .catch(() => 0),
        prisma.deal.count({
          where: {
            buyer_alias: alias,
            status: { in: ['CONTRACTED', 'IN_PROGRESS', 'REVIEW'] },
          },
        }),
        prisma.deal.count({
          where: {
            buyer_alias: alias,
            status: 'CLOSED',
          },
        }),
        prisma.auditLog.findMany({
          where: { actor_alias: alias },
          orderBy: { created_at: 'desc' },
          take: 10,
        }),
      ])

    return NextResponse.json(
      {
        data: {
          active_requirements: activeReqs,
          proposals_received: proposalsReceived,
          active_deals: activeDealsCount,
          completed_deals: completedDealsCount,
          recent_activity: recentActivity,
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
