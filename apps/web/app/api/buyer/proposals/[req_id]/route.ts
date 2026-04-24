import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { Proposal, BuyerRequirement } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest, { params }: { params: Promise<{ req_id: string }> }) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'buyer') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { req_id } = await params
    
    // Validate requirement belongs to buyer
    const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
    const requirement = await reqCol.findOne({ _id: new ObjectId(req_id) })
    if (!requirement) {
      return NextResponse.json({ data: null, error: 'Requirement not found' }, { status: 404 })
    }
    if (requirement.alias !== profile.alias) {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    // Get all proposals for this requirement
    const propCol = await getCollection<Proposal>('proposals')
    const proposals = await propCol
      .find({ requirement_id: req_id })
      .sort({ created_at: -1 })
      .toArray()

    // Enrich with trust score from alias_directory
    if (proposals.length > 0) {
      const supabase = await getServerSupabase()
      const aliases = Array.from(new Set(proposals.map(p => p.vendor_alias)))
      
      const { data: aliasData } = await supabase
        .from('alias_directory')
        .select('alias, trust_score')
        .in('alias', aliases)

      const trustMap = new Map(aliasData?.map(d => [d.alias, d.trust_score]) || [])

      const enriched = proposals.map(p => ({
        ...p,
        _id: p._id!.toString(),
        trust_score: trustMap.get(p.vendor_alias) || 0,
      }))
      
      return NextResponse.json({ data: enriched, error: null }, { status: 200 })
    }

    return NextResponse.json({ data: [], error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
