// GET /api/cmp/vendor/[alias]/reviews — public vendor reviews
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ alias: string }> }) {
  try {
    const { alias } = await params

    // Only show buyer-to-vendor reviews on public profile
    const reviews = await prisma.review.findMany({
      where: {
        reviewee_alias: alias,
        reviewer_role: 'buyer',
      },
      select: {
        rating: true,
        comment: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    })

    // Never expose reviewer_alias — show as "Anonymous Buyer"
    const sanitized = reviews.map(r => ({
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewer_display: 'Anonymous Buyer',
    }))

    return NextResponse.json({ data: sanitized, error: null })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
