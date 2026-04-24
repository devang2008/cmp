// GET /api/vendor/trust/events — trust event history
import { NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const profile = await requireAuth()
    const supabase = await getServerSupabase()

    const { data, error } = await supabase
      .from('trust_events')
      .select('*')
      .eq('alias', profile.alias)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get vendor's percentile
    const { data: allScores } = await supabase
      .from('alias_directory')
      .select('trust_score')
      .eq('role', 'vendor')

    let percentile = 0
    if (allScores && allScores.length > 0) {
      const below = allScores.filter(s => s.trust_score < profile.trust_score).length
      percentile = Math.round((below / allScores.length) * 100)
    }

    return NextResponse.json({
      data: {
        events: data || [],
        trust_score: profile.trust_score,
        percentile,
      },
      status: 200,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
