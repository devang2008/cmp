// GET /api/cmp/moderator/certifications
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
    const status = searchParams.get('status') || 'PENDING'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where =
      status === 'all' ? {} : { review_status: status }

    const [items, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        include: {
          vendor: {
            select: {
              alias: true,
              role: true,
              trust_score: true,
            },
          },
        },
        orderBy: { uploaded_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.certification.count({ where }),
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
