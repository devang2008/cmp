// GET /api/cmp/moderator/users
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
    const role = searchParams.get('role') || 'all'
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const skip = (page - 1) * limit

    // Validate sort field
    const allowedSorts = ['created_at', 'trust_score', 'alias']
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at'
    const sortOrder = order === 'asc' ? 'asc' as const : 'desc' as const

    // Build where clause — exclude the moderator's own account
    const where: Record<string, unknown> = {
      alias: { not: session.alias },
    }

    if (role !== 'all') {
      where.role = role
    }

    if (search) {
      where.alias = {
        ...((where.alias as Record<string, unknown>) || {}),
        contains: search,
        mode: 'insensitive',
      }
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          alias: true,
          role: true,
          trust_score: true,
          email_verified: true,
          onboarding_complete: true,
          rating_as_vendor: true,
          rating_as_buyer: true,
          total_vendor_reviews: true,
          total_buyer_reviews: true,
          created_at: true,
          _count: {
            select: { certifications: true },
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
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
