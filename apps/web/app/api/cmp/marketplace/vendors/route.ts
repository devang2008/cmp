// GET /api/cmp/marketplace/vendors — public vendor profiles for buyer marketplace
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
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

    // Enrich with cert data from Prisma instead of Supabase
    const vendorAliases = vendors.map(v => v.alias)
    const certs = await prisma.certification.findMany({
      where: {
        vendor_alias: { in: vendorAliases },
        verified: true,
        review_status: 'approved',
      },
      select: {
        vendor_alias: true,
        cert_type: true,
      },
    })

    // Group certs by vendor alias
    const certMap = new Map<string, string[]>()
    for (const cert of certs) {
      const existing = certMap.get(cert.vendor_alias) || []
      existing.push(cert.cert_type)
      certMap.set(cert.vendor_alias, existing)
    }

    const enriched = vendors.map((v) => {
      const vendorCerts = certMap.get(v.alias) || []
      return {
        alias: v.alias,
        service_description: v.service_description,
        categories: v.categories,
        skills: v.skills,
        experience_years: v.experience_years,
        rate_range: v.rate_range,
        trust_score: (v as any).trust_score || 50,
        completed_deals: (v as any).completed_deals || 0,
        is_verified: vendorCerts.length > 0,
        certifications: vendorCerts,
      }
    })

    return NextResponse.json({ data: enriched, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
