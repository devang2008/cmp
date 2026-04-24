// POST /api/deals/[id]/review — submit a rating after deal closes
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().default(''),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = reviewSchema.parse(body)

    const supabase = await getServerSupabase()

    // Fetch deal
    const { data: deal, error } = await supabase
      .from('deals').select('*').eq('id', id).single()
    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Verify caller is participant
    const isBuyer = deal.buyer_alias === profile.alias
    const isVendor = deal.vendor_alias === profile.alias
    if (!isBuyer && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Must be CLOSED
    if (deal.status !== 'CLOSED') {
      return NextResponse.json({ error: 'Deal must be closed before reviewing' }, { status: 400 })
    }

    // Determine roles
    const reviewer_role = isBuyer ? 'buyer' : 'vendor'
    const reviewee_alias = isBuyer ? deal.vendor_alias : deal.buyer_alias

    // Check for duplicate review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('deal_id', id)
      .eq('reviewer_role', reviewer_role)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this deal' }, { status: 409 })
    }

    // Insert review (trigger auto-updates averages)
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        deal_id: id,
        reviewer_alias: profile.alias,
        reviewee_alias,
        reviewer_role,
        rating: parsed.rating,
        comment: parsed.comment,
      })
      .select('id, rating, reviewee_alias')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Trust event for vendor reviews only (buyer reviewing vendor)
    if (reviewer_role === 'buyer' && parsed.rating !== 3) {
      const scoreDelta = parsed.rating - 3
      await supabase.from('trust_events').insert({
        alias: reviewee_alias,
        event_type: 'review_received',
        score_delta: scoreDelta,
        ref_id: id,
      })

      // Recompute trust score
      supabase.functions.invoke('compute-trust', {
        body: { alias: reviewee_alias },
      }).catch(() => {})
    }

    // Notify reviewee
    await supabase.from('notifications').insert({
      recipient_alias: reviewee_alias,
      type: 'review_received',
      content: `${profile.alias} left you a ${parsed.rating}-star review`,
      ref_id: id,
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      action_type: 'review_submitted',
      actor_alias: profile.alias,
      target_alias: reviewee_alias,
      deal_id: id,
      metadata: { rating: parsed.rating, reviewer_role },
    })

    return NextResponse.json({
      data: { review_id: review?.id, rating: parsed.rating, reviewee_alias },
      error: null,
    })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
