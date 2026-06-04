// PATCH /api/cmp/deals/[id]/price — buyer edits agreed price during negotiation
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
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

    // Fetch deal
    const deal = await prisma.deal.findUnique({ where: { id } })
    if (!deal) {
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
      price_updated_at: new Date(),
      updated_at: new Date(),
    }
    if (!deal.original_price) {
      updateData.original_price = oldPrice
    }

    await prisma.deal.update({
      where: { id },
      data: updateData,
    })

    // Deal event
    await prisma.dealEvent.create({
      data: {
        deal_id: id,
        event_type: 'price_updated',
        actor_alias: profile.alias,
        note: `Price updated from $${oldPrice.toLocaleString()} to $${parsed.new_price.toLocaleString()}`,
        metadata: { old_price: oldPrice, new_price: parsed.new_price },
      },
    })

    // Notify vendor
    await prisma.notification.create({
      data: {
        recipient_alias: deal.vendor_alias!,
        type: 'deal_status_change',
        content: `Buyer updated the deal price to $${parsed.new_price.toLocaleString()}`,
        ref_id: id,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'price_updated',
        actor_alias: profile.alias,
        target_alias: deal.vendor_alias,
        deal_id: id,
        metadata: { old_price: oldPrice, new_price: parsed.new_price },
      },
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
