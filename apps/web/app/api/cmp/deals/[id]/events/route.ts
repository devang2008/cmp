// GET/POST /api/cmp/deals/[id]/events — Deal timeline events and chat messages
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Verify deal exists and user is a participant
    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { buyer_alias: true, vendor_alias: true },
    })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (deal.buyer_alias !== session.alias && deal.vendor_alias !== session.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch deal events
    const events = await prisma.dealEvent.findMany({
      where: { deal_id: id },
    })

    // Fetch chat messages
    const dbMessages = await prisma.message.findMany({
      where: { deal_id: id },
    })

    // Combine and sort by created_at ascending
    const combined = [
      ...events.map(e => ({
        id: e.id,
        deal_id: e.deal_id,
        sender_alias: 'SYSTEM',
        encrypted_content: e.note || `${e.event_type}: ${e.from_status} -> ${e.to_status}`,
        message_type: 'system',
        created_at: e.created_at.toISOString(),
      })),
      ...dbMessages.map(m => ({
        id: m.id,
        deal_id: m.deal_id,
        sender_alias: m.sender_alias,
        encrypted_content: m.encrypted_content,
        message_type: m.message_type,
        created_at: m.created_at.toISOString(),
      }))
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return NextResponse.json({ data: { messages: combined }, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const { type, content } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Verify deal exists and user is a participant
    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { buyer_alias: true, vendor_alias: true },
    })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }
    if (deal.buyer_alias !== session.alias && deal.vendor_alias !== session.alias) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (type === 'MESSAGE') {
      const message = await prisma.message.create({
        data: {
          deal_id: id,
          sender_alias: session.alias,
          encrypted_content: content,
          message_type: 'text',
        }
      })

      return NextResponse.json({
        data: {
          message: {
            id: message.id,
            deal_id: message.deal_id,
            sender_alias: message.sender_alias,
            encrypted_content: message.encrypted_content,
            message_type: message.message_type,
            created_at: message.created_at.toISOString(),
          }
        },
        error: null
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Unsupported event type' }, { status: 400 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
