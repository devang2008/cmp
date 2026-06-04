// GET /api/cmp/vendor/trust/events — trust event history
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET() {
  try {
    const session = await requireAuth()

    // Fetch user's trust score from DB
    const user = await prisma.user.findUnique({
      where: { alias: session.alias },
      select: { trust_score: true },
    })
    const trustScore = user?.trust_score ?? 0

    const events = await prisma.trustEvent.findMany({
      where: { alias: session.alias },
      orderBy: { created_at: 'desc' },
      take: 20,
    })

    // Get vendor's percentile
    const allScores = await prisma.aliasDirectory.findMany({
      where: { role: 'vendor' },
      select: { trust_score: true },
    })

    let percentile = 0
    if (allScores.length > 0) {
      const below = allScores.filter(s => s.trust_score < trustScore).length
      percentile = Math.round((below / allScores.length) * 100)
    }

    return NextResponse.json({
      data: {
        events,
        trust_score: trustScore,
        percentile,
      },
      status: 200,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
