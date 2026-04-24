// PATCH /api/deals/[id]/price — buyer edits agreed price during negotiation
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { z } from 'zod'

const priceSchema = z.object({
  new_price: z.number().positive().max(9999999),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params

    if (profile.role !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can update prices' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = priceSchema.parse(body)

    const supabase = await getServerSupabase()

    // Fetch deal
    const { data: deal, error } = await supabase
      .from('deals').select('*').eq('id', id).single()
    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.buyer_alias !== profile.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only during negotiation phases
    if (!['NEGOTIATING', 'CONTRACTED'].includes(deal.status)) {
      return NextResponse.json({ error: 'Price cannot be changed after work has begun' }, { status: 400 })
    }

    const oldPrice = Number(deal.agreed_price)

    // Save original price if not already saved
    const updateData: Record<string, unknown> = {
      agreed_price: parsed.new_price,
      price_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (!deal.original_price) {
      updateData.original_price = oldPrice
    }

    const { error: updateError } = await supabase
      .from('deals').update(updateData).eq('id', id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Deal event
    await supabase.from('deal_events').insert({
      deal_id: id,
      event_type: 'price_updated',
      actor_alias: profile.alias,
      note: `Price updated from $${oldPrice.toLocaleString()} to $${parsed.new_price.toLocaleString()}`,
      metadata: { old_price: oldPrice, new_price: parsed.new_price },
    })

    // Notify vendor
    await supabase.from('notifications').insert({
      recipient_alias: deal.vendor_alias,
      type: 'deal_status_change',
      content: `Buyer updated the deal price to $${parsed.new_price.toLocaleString()}`,
      ref_id: id,
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      action_type: 'price_updated',
      actor_alias: profile.alias,
      target_alias: deal.vendor_alias,
      deal_id: id,
      metadata: { old_price: oldPrice, new_price: parsed.new_price },
    })

    return NextResponse.json({
      data: { deal_id: id, new_price: parsed.new_price },
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
