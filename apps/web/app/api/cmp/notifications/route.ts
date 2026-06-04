// GET /api/cmp/notifications — list my notifications
// PATCH /api/cmp/notifications — mark all read
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET() {
  try {
    const session = await requireAuth()

    const data = await prisma.notification.findMany({
      where: { recipient_alias: session.alias },
      orderBy: { created_at: 'desc' },
      take: 50,
    })

    return NextResponse.json({ data, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

export async function PATCH() {
  try {
    const session = await requireAuth()

    await prisma.notification.updateMany({
      where: {
        recipient_alias: session.alias,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json({ data: { marked: true }, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
