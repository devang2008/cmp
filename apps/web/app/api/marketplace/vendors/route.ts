// GET /api/marketplace/vendors — public vendor profiles for buyer marketplace
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { VendorProfile } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const url = new URL(request.url)
    const category = url.searchParams.get('category') || 'All'

    const col = await getCollection<VendorProfile>('vendor_profiles')
    const filter: any = { is_active: true }
    if (category && category !== 'All') {
      filter.$or = [
        { categories: { $regex: category, $options: 'i' } },
        { skills: { $regex: category, $options: 'i' } },
      ]
    }

    const vendors = await col.find(filter).sort({ trust_score: -1 }).limit(50).toArray()

    // Enrich with cert data from Supabase
    const supabase = await getServerSupabase()
    const enriched = await Promise.all(
      vendors.map(async (v) => {
        const { data: certs } = await supabase
          .from('certifications')
          .select('cert_type')
          .eq('vendor_alias', v.alias)
          .eq('verified', true)

        return {
          alias: v.alias,
          service_description: v.service_description,
          categories: v.categories,
          skills: v.skills,
          experience_years: v.experience_years,
          rate_range: v.rate_range,
          trust_score: (v as any).trust_score || 50,
          completed_deals: (v as any).completed_deals || 0,
          is_verified: (certs?.length || 0) > 0,
          certifications: certs?.map((c: any) => c.cert_type) || [],
        }
      })
    )

    return NextResponse.json({ data: enriched, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
