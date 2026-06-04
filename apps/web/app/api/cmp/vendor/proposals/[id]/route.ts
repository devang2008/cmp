// PATCH /api/cmp/vendor/proposals/[id] — withdraw proposal
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const col = await getCollection<Proposal>('proposals')
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    if (doc.vendor_alias !== profile.alias) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    if (doc.status !== 'pending') return NextResponse.json({ data: null, error: 'Can only withdraw pending proposals' }, { status: 400 })

    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'withdrawn', updated_at: new Date() } }
    )

    return NextResponse.json({ data: { id, status: 'withdrawn' }, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
