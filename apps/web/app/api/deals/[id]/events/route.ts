// GET /api/deals/[id]/events — Deal timeline events
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const supabase = await getServerSupabase()

    // Verify deal exists and user is a participant
    const { data: deal, error } = await supabase
      .from('deals').select('buyer_alias, vendor_alias').eq('id', id).single()
    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (deal.buyer_alias !== profile.alias && deal.vendor_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch events ordered by creation time
    const { data: events, error: eventsError } = await supabase
      .from('deal_events')
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: true })

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: events, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
