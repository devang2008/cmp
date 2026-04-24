// GET/PATCH/DELETE /api/buyer/requirements/[id]
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement, Proposal } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    if (doc.alias !== profile.alias) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    // Get proposals for this requirement
    const propCol = await getCollection<Proposal>('proposals')
    const proposals = await propCol.find({ requirement_id: id }).sort({ created_at: -1 }).toArray()

    // Enrich proposals with vendor ratings from alias_directory
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const vendorAliases = Array.from(new Set(proposals.map(p => p.vendor_alias)))

    const ratingsMap: Record<string, { rating_as_vendor: number; total_vendor_reviews: number; trust_score: number }> = {}
    if (vendorAliases.length > 0) {
      const { data: directories } = await supabase
        .from('alias_directory')
        .select('alias, rating_as_vendor, total_vendor_reviews, trust_score')
        .in('alias', vendorAliases)
      if (directories) {
        for (const d of directories) {
          ratingsMap[d.alias] = {
            rating_as_vendor: d.rating_as_vendor || 0,
            total_vendor_reviews: d.total_vendor_reviews || 0,
            trust_score: d.trust_score || 0,
          }
        }
      }
    }

    const enrichedProposals = proposals.map(p => ({
      ...p,
      vendor_rating: ratingsMap[p.vendor_alias]?.rating_as_vendor || 0,
      vendor_total_reviews: ratingsMap[p.vendor_alias]?.total_vendor_reviews || 0,
      vendor_trust_score: ratingsMap[p.vendor_alias]?.trust_score || 0,
    }))

    return NextResponse.json({ data: { requirement: doc, proposals: enrichedProposals }, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    if (doc.alias !== profile.alias) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    if (doc.status !== 'open') return NextResponse.json({ data: null, error: 'Can only edit open requirements' }, { status: 400 })

    const body = await req.json()
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { ...body, updated_at: new Date() } })
    return NextResponse.json({ data: { id }, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const col = await getCollection<BuyerRequirement>('buyer_requirements')
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    if (doc.alias !== profile.alias) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    if (doc.status !== 'open') return NextResponse.json({ data: null, error: 'Can only delete open requirements' }, { status: 400 })

    await col.deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ data: { deleted: true }, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
