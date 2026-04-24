// GET /api/vendor/[alias]/reviews — public vendor reviews
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/auth-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ alias: string }> }) {
  try {
    const { alias } = await params
    const supabase = await getServerSupabase()

    // Only show buyer-to-vendor reviews on public profile
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, comment, created_at, deal_id')
      .eq('reviewee_alias', alias)
      .eq('reviewer_role', 'buyer')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Never expose reviewer_alias — show as "Anonymous Buyer"
    const sanitized = (reviews || []).map(r => ({
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
