// GET /api/matching/results/[req_id]
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { MatchCache } from '@/lib/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ reqId: string }> }) {
  try {
    await requireAuth()
    const { reqId } = await params
    const col = await getCollection<MatchCache>('match_cache')
    const results = await col.find({ requirement_id: reqId })
      .sort({ 'scores.final': -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({ data: results, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
