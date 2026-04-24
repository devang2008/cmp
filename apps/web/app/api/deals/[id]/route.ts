// GET /api/deals/[id] — deal detail
// POST /api/deals/[id]/transition — state machine
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TRANSITIONS: Record<string, { to: string; allowedRoles: string[] }[]> = {
  POSTED: [{ to: 'MATCHED', allowedRoles: ['admin'] }],
  MATCHED: [{ to: 'NEGOTIATING', allowedRoles: ['buyer'] }],
  NEGOTIATING: [
    { to: 'CONTRACTED', allowedRoles: ['buyer', 'vendor'] },
    { to: 'CANCELLED', allowedRoles: ['buyer', 'vendor'] },
  ],
  CONTRACTED: [{ to: 'IN_PROGRESS', allowedRoles: ['vendor'] }],
  IN_PROGRESS: [{ to: 'REVIEW', allowedRoles: ['vendor'] }],
  REVIEW: [
    { to: 'CLOSED', allowedRoles: ['buyer'] },
    { to: 'IN_PROGRESS', allowedRoles: ['buyer'] },
    { to: 'DISPUTED', allowedRoles: ['buyer'] },
  ],
  DISPUTED: [
    { to: 'CLOSED', allowedRoles: ['admin'] },
    { to: 'IN_PROGRESS', allowedRoles: ['admin'] },
  ],
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const supabase = await getServerSupabase()

    const { data: deal, error } = await supabase
      .from('deals').select('*').eq('id', id).single()
    if (error || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

    // Verify caller is participant
    if (deal.buyer_alias !== profile.alias && deal.vendor_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get events timeline
    const { data: events } = await supabase
      .from('deal_events')
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: true })

    // Get alias directory entries for both parties
    const { data: aliasDirBuyer } = await supabase
      .from('alias_directory')
      .select('*')
      .eq('alias', deal.buyer_alias)
      .single()
    const { data: aliasDirVendor } = await supabase
      .from('alias_directory')
      .select('*')
      .eq('alias', deal.vendor_alias)
      .single()

    // Get proposal details from MongoDB
    let proposal = null
    if (deal.requirement_id) {
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
