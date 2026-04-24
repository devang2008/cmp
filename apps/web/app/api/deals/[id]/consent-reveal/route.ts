// POST /api/deals/[id]/consent-reveal — identity reveal consent
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const supabase = await getServerSupabase()

    const { data: deal, error } = await supabase
      .from('deals').select('*').eq('id', id).single()
    if (error || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    if (deal.status !== 'CLOSED') {
      return NextResponse.json({ error: 'Deal must be closed for identity reveal' }, { status: 400 })
    }

    const isBuyer = deal.buyer_alias === profile.alias
    const isVendor = deal.vendor_alias === profile.alias
    if (!isBuyer && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateField = isBuyer ? 'buyer_consented_reveal' : 'vendor_consented_reveal'
    await supabase.from('deals').update({ [updateField]: true }).eq('id', id)

    // Check if both have consented
    const otherConsented = isBuyer ? deal.vendor_consented_reveal : deal.buyer_consented_reveal
    if (otherConsented) {
      // Both consented — reveal identity
      await supabase.from('deals').update({ identity_revealed: true }).eq('id', id)

      await supabase.from('audit_logs').insert({
        actor_alias: profile.alias,
        action_type: 'identity_revealed',
        target_type: 'deal',
        target_id: id,
        metadata: { buyer: deal.buyer_alias, vendor: deal.vendor_alias },
      })

      // Notify both
      await supabase.from('notifications').insert([
        {
          recipient_alias: deal.buyer_alias,
          type: 'identity_revealed',
          content: 'Both parties consented — identity revealed via email.',
          ref_id: id,
        },
        {
          recipient_alias: deal.vendor_alias!,
          type: 'identity_revealed',
          content: 'Both parties consented — identity revealed via email.',
          ref_id: id,
        },
      ])

      // --- NEW: Identity Reveal Email Dispatch ---
      try {
        await fetch(`${BASE_URL}/api/email/send-reveal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': _req.headers.get('cookie') || '' },
          body: JSON.stringify({ deal_id: id })
        })
      } catch (emailErr) {
        console.error('Reveal email dispatch failed:', emailErr)
      }

      // --- NEW: Trigger Trust Score Recomputation ---
      if (deal.vendor_alias) {
        try {
          await supabase.functions.invoke('compute-trust', { body: { alias: deal.vendor_alias } })
        } catch (trustErr) {
          console.error('Trust update failed:', trustErr)
        }
      }
    }

    return NextResponse.json({
      data: {
        consented: true,
        identity_revealed: otherConsented,
      },
      status: 200,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
