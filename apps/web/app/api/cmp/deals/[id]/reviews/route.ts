// GET /api/cmp/deals/[id]/reviews — get reviews for a deal
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Fetch deal to verify participant
    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { buyer_alias: true, vendor_alias: true },
    })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (deal.buyer_alias !== session.alias && deal.vendor_alias !== session.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const reviews = await prisma.review.findMany({
      where: { deal_id: id },
      orderBy: { created_at: 'asc' },
    })

    return NextResponse.json({ data: reviews || [], error: null })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
