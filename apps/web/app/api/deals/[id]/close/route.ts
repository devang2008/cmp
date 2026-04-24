// POST /api/deals/[id]/close — buyer closes a deal from REVIEW → CLOSED
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params

    if (profile.role !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can close deals' }, { status: 403 })
    }

    const supabase = await getServerSupabase()

    // Fetch deal
    const { data: deal, error } = await supabase
      .from('deals').select('*').eq('id', id).single()
    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Verify buyer owns this deal
    if (deal.buyer_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Must be in REVIEW state
    if (deal.status !== 'REVIEW') {
      return NextResponse.json({ error: `Deal must be in REVIEW state to close (current: ${deal.status})` }, { status: 400 })
    }

    // Update deal status to CLOSED
    const { error: updateError } = await supabase
      .from('deals')
      .update({ status: 'CLOSED', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Insert deal event (fire-and-forget)
    await supabase.from('deal_events').insert({
      deal_id: id,
      event_type: 'deal_closed',
      from_status: 'REVIEW',
      to_status: 'CLOSED',
      actor_alias: profile.alias,
      note: 'Deal closed by buyer',
    })

    // Insert system message in chat
    await supabase.from('messages').insert({
      deal_id: id,
      sender_alias: 'SYSTEM',
      encrypted_content: 'Deal has been closed. Both parties can now leave a review.',
      message_type: 'system',
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      action_type: 'deal_closed',
      actor_alias: profile.alias,
      target_alias: deal.vendor_alias,
      deal_id: id,
      metadata: { from_status: 'REVIEW', to_status: 'CLOSED' },
    })

    // Notifications for BOTH parties
    await supabase.from('notifications').insert([
      {
        recipient_alias: profile.alias,
        type: 'deal_status_change',
        content: 'Deal closed successfully. Please rate the vendor.',
        ref_id: id,
      },
      {
        recipient_alias: deal.vendor_alias,
        type: 'deal_status_change',
        content: 'Deal closed by buyer. Please rate the buyer.',
        ref_id: id,
      },
    ])

    // Trust event: deal_completed for vendor (+15)
    if (deal.vendor_alias) {
      await supabase.from('trust_events').insert({
        alias: deal.vendor_alias,
        event_type: 'deal_completed',
        score_delta: 15,
        ref_id: id,
      })

      // Fire-and-forget: recompute trust score
      supabase.functions.invoke('compute-trust', {
        body: { alias: deal.vendor_alias },
      }).catch(() => {})
    }

    // Fire-and-forget: email dispatch
    try {
      const { data: vendorProfile } = await supabase
        .from('profiles').select('id').eq('alias', deal.vendor_alias).single()
      if (vendorProfile) {
        const { data: vendorAuth } = await supabase.auth.admin.getUserById(vendorProfile.id)
        if (vendorAuth?.user?.email) {
          fetch(`${BASE_URL}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
            body: JSON.stringify({
              template: 'deal_status_change',
              to: vendorAuth.user.email,
              variables: { recipient_alias: deal.vendor_alias, from_status: 'REVIEW', to_status: 'CLOSED', deal_id: id },
            }),
          }).catch(() => {})
        }
      }
    } catch {}

    return NextResponse.json({
      data: { deal_id: id, status: 'CLOSED' },
      error: null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
