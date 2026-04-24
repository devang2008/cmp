// POST /api/matching/run — matching engine
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { BuyerRequirement, VendorProfile, MatchCache } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const { requirement_id, vendor_alias } = await request.json()

    if (requirement_id) {
      const result = await matchForRequirement(requirement_id)
      return NextResponse.json({ data: result, error: null }, { status: 200 })
    }
    if (vendor_alias) {
      const result = await matchForVendor(vendor_alias)
      return NextResponse.json({ data: result, error: null }, { status: 200 })
    }

    return NextResponse.json({ data: null, error: 'requirement_id or vendor_alias required' }, { status: 400 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

async function matchForRequirement(requirementId: string) {
  const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
  const req = await reqCol.findOne({ _id: new ObjectId(requirementId) })
  if (!req) throw new Error('Requirement not found')

  const vendorCol = await getCollection<VendorProfile>('vendor_profiles')
  const vendors = await vendorCol.find({ is_active: true }).toArray()

  const matches = await computeMatches(req, vendors)
  const top10 = matches.slice(0, 10)

  // Store results
  if (top10.length > 0) {
    await reqCol.updateOne(
      { _id: new ObjectId(requirementId) },
      {
        $set: {
          matched_vendor_aliases: top10.map(m => m.alias),
          status: req.status === 'open' ? 'matched' : req.status,
          updated_at: new Date(),
        },
      }
    )

    // Create notifications for matched vendors
    const supabase = await getServerSupabase()
    const notifications = top10.map(m => ({
      recipient_alias: m.alias,
      type: 'new_match' as const,
      content: `New requirement matches your profile: "${req.title}"`,
      ref_id: requirementId,
    }))
    await supabase.from('notifications').insert(notifications)
  }

  // Cache results
  const cacheCol = await getCollection<MatchCache>('match_cache')
  await cacheCol.createIndex({ computed_at: 1 }, { expireAfterSeconds: 86400 })
  for (const m of top10) {
    await cacheCol.updateOne(
      { requirement_id: requirementId, vendor_alias: m.alias },
      {
        $set: {
          scores: m.breakdown,
          computed_at: new Date(),
        },
      },
      { upsert: true }
    )
  }

  return { matches: top10 }
}

async function matchForVendor(vendorAlias: string) {
  const vendorCol = await getCollection<VendorProfile>('vendor_profiles')
  const vendor = await vendorCol.findOne({ alias: vendorAlias })
  if (!vendor) throw new Error('Vendor not found')

  const reqCol = await getCollection<BuyerRequirement>('buyer_requirements')
  const reqs = await reqCol.find({ status: 'open' }).toArray()

  const results = []
  for (const req of reqs) {
    const score = computeScore(vendor, req)
    if (score.final > 0.1) {
      results.push({
        requirement_id: req._id!.toString(),
        title: req.title,
        score: score.final,
        breakdown: score,
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return { matches: results.slice(0, 10) }
}

async function computeMatches(req: BuyerRequirement, vendors: VendorProfile[]) {
  // Step 1-2: Jaccard scores
  const scored = vendors.map(v => {
    const score = computeScore(v, req)
    return { alias: v.alias, score: score.final, breakdown: score }
  })

  // Step 3: Filter budget-incompatible
  const compatible = scored.filter(s => s.breakdown.budget > 0)
  compatible.sort((a, b) => b.score - a.score)

  // Step 3: HuggingFace semantic for top 20
  const top20 = compatible.slice(0, 20)
  const hfKey = process.env.HUGGINGFACE_API_KEY
  
  if (hfKey && top20.length > 0) {
    try {
      const vendorCol = await getCollection<VendorProfile>('vendor_profiles')
      for (const match of top20) {
        const vendor = await vendorCol.findOne({ alias: match.alias })
        if (!vendor?.service_description) continue
        
        try {
          const res = await fetch(
            'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${hfKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: {
                  source_sentence: vendor.service_description,
                  sentences: [req.description],
                },
              }),
            }
          )
          if (res.ok) {
            const data = await res.json()
            const semantic = Array.isArray(data) ? data[0] : 0
            match.breakdown.semantic = semantic
            // Recompute final
            match.breakdown.final =
              match.breakdown.jaccard * 0.35 +
              semantic * 0.45 +
              match.breakdown.budget * 0.10 +
              match.breakdown.trust_boost * 0.10
            match.score = match.breakdown.final
          }
        } catch { /* HuggingFace failed, keep jaccard score */ }
      }
    } catch { /* DB error, keep existing scores */ }
  }

  top20.sort((a, b) => b.score - a.score)
  return top20
}

function computeScore(vendor: VendorProfile, req: BuyerRequirement) {
  // Jaccard score
  const vendorTerms = new Set([
    ...(vendor.skills || []),
    ...(vendor.categories || []),
    ...(vendor.compliance_expertise || []),
    ...(vendor.tools_used || []),
  ].map((s: string) => s.toLowerCase()))

  const reqTerms = new Set([
    ...(req.service_type || []),
    ...(req.compliance_needs || []),
    ...(req.tech_stack || []),
  ].map((s: string) => s.toLowerCase()))

  let intersection = 0
  for (const t of Array.from(vendorTerms)) {
    if (reqTerms.has(t)) intersection++
  }
  const union = new Set([...Array.from(vendorTerms), ...Array.from(reqTerms)]).size
  const jaccard = union > 0 ? intersection / union : 0

  // Budget compatibility
  const vendorMin = vendor.rate_range?.min || 0
  const vendorMax = vendor.rate_range?.max || Infinity
  const reqMin = req.budget_range?.min || 0
  const reqMax = req.budget_range?.max || Infinity
  const overlap = Math.max(0, Math.min(vendorMax, reqMax) - Math.max(vendorMin, reqMin))
  const budget = overlap > 0 ? 1 : 0

  // Trust boost (placeholder — would come from Supabase, but we default to 0.5)
  const trustBoost = 0.5 / 100 * 0.1

  const final = jaccard * 0.35 + 0 * 0.45 + budget * 0.10 + trustBoost * 0.10

  return { jaccard, semantic: 0, budget, trust_boost: trustBoost, final }
}
