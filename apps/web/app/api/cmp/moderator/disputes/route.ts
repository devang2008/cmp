// GET /api/cmp/moderator/disputes — list disputed deals
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'DISPUTED'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status === 'DISPUTED') {
      where.status = 'DISPUTED'
    } else if (status === 'RESOLVED') {
      where.status = 'RESOLVED'
    }
    // 'all' — no status filter, returns both DISPUTED and RESOLVED

    const [items, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          buyer: {
            select: { alias: true, trust_score: true },
          },
          vendor: {
            select: { alias: true, trust_score: true },
          },
          deal_events: {
            orderBy: { created_at: 'desc' },
            take: 5,
          },
        },
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      data: { items, total, page, pages },
      error: null,
    }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
