// GET /api/cmp/moderator/actions — list moderator action history
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
    const actionType = searchParams.get('action_type')
    const moderatorAlias = searchParams.get('moderator_alias')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (actionType) {
      where.action_type = actionType
    }
    if (moderatorAlias) {
      where.moderator_alias = moderatorAlias
    }

    const [items, total] = await Promise.all([
      prisma.moderatorAction.findMany({
        where,
        include: {
          moderator: {
            select: { alias: true, role: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.moderatorAction.count({ where }),
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
