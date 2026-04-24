// GET /api/buyer/dashboard/stats
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getServerSupabase } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement, Proposal } from '@/lib/types'

export async function GET() {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'buyer') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const alias = profile.alias
    const supabase = await getServerSupabase()

    // Parallel queries
    const [reqCol, propCol, dealsRes, closedRes, auditRes] = await Promise.all([
      getCollection<BuyerRequirement>('buyer_requirements')
        .then(c => c.countDocuments({ alias, status: { $ne: 'closed' } }))
        .catch(() => 0),
      getCollection<Proposal>('proposals')
        .then(c => c.countDocuments({ buyer_alias: alias, status: 'pending' }))
        .catch(() => 0),
      supabase.from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_alias', alias)
        .in('status', ['CONTRACTED', 'IN_PROGRESS', 'REVIEW']),
      supabase.from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_alias', alias)
        .eq('status', 'CLOSED'),
      supabase.from('audit_logs')
        .select('*')
        .eq('actor_alias', alias)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    return NextResponse.json(
      {
        data: {
          active_requirements: reqCol,
          proposals_received: propCol,
          active_deals: dealsRes.count || 0,
          completed_deals: closedRes.count || 0,
          recent_activity: auditRes.data || [],
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
