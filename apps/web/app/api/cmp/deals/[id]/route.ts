// GET /api/cmp/deals/[id] — deal detail
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal } from '@/lib/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params

    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

    // Verify caller is participant
    if (deal.buyer_alias !== profile.alias && deal.vendor_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get events timeline
    const events = await prisma.dealEvent.findMany({
      where: { deal_id: id },
      orderBy: { created_at: 'asc' },
    })

    // Get alias directory entries for both parties
    const aliasDirBuyer = await prisma.aliasDirectory.findUnique({
      where: { alias: deal.buyer_alias },
    })
    const aliasDirVendor = deal.vendor_alias
      ? await prisma.aliasDirectory.findUnique({
          where: { alias: deal.vendor_alias },
        })
      : null

    // Get proposal details from MongoDB
    let proposal = null
    if (deal.requirement_id && deal.vendor_alias) {
      try {
        const propCol = await getCollection<Proposal>('proposals')
        proposal = await propCol.findOne({
          requirement_id: deal.requirement_id,
          vendor_alias: deal.vendor_alias,
          status: 'accepted',
        })
      } catch { /* MongoDB may not be available */ }
    }

    return NextResponse.json({
      data: {
        deal,
        events: events || [],
        buyer_profile: aliasDirBuyer,
        vendor_profile: aliasDirVendor,
        proposal,
      },
      status: 200,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
