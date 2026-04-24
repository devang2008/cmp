// GET /api/vendor/dashboard/stats
import { NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal, BuyerRequirement } from '@/lib/types'

export async function GET() {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const alias = profile.alias
    const supabase = await getServerSupabase()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [openReqs, activeProps, dealsRes, earningsRes, trustRes] = await Promise.all([
      getCollection<BuyerRequirement>('buyer_requirements')
        .then(c => c.countDocuments({ status: 'open' }))
        .catch(() => 0),
      getCollection<Proposal>('proposals')
        .then(c => c.countDocuments({ vendor_alias: alias, status: 'pending' }))
        .catch(() => 0),
      supabase.from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_alias', alias)
        .in('status', ['CONTRACTED', 'IN_PROGRESS', 'REVIEW']),
      supabase.from('deals')
        .select('agreed_price')
        .eq('vendor_alias', alias)
        .eq('status', 'CLOSED')
        .gte('closed_at', monthStart),
      supabase.from('profiles')
        .select('trust_score')
        .eq('alias', alias)
        .single(),
    ])

    const earnings = (earningsRes.data || []).reduce((sum: number, d: { agreed_price: number | null }) => sum + (d.agreed_price || 0), 0)

    return NextResponse.json(
      {
        data: {
          open_opportunities: openReqs,
          active_proposals: activeProps,
          active_deals: dealsRes.count || 0,
          trust_score: trustRes.data?.trust_score || 0,
          earnings_this_month: earnings,
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
