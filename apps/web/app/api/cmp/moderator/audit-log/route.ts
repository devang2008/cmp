// GET /api/cmp/moderator/audit-log
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const action_type = searchParams.get('action_type') || ''
    const actor_alias = searchParams.get('actor_alias') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (action_type) {
      where.action_type = action_type
    }

    if (actor_alias) {
      where.actor_alias = actor_alias
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              alias: true,
              role: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json(
      {
        data: {
          items,
          total,
          page,
          pages: Math.ceil(total / limit),
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json(
      { data: null, error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    )
  }
}
