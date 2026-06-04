// GET/PATCH /api/cmp/vendor/profile
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getCollection } from '@/lib/mongodb/client'
import type { VendorProfile } from '@/lib/types'
import { vendorProfileSchema } from '@/lib/validations'

export async function GET() {
  try {
    const profile = await requireAuth()
    const col = await getCollection<VendorProfile>('vendor_profiles')
    const doc = await col.findOne({ alias: profile.alias })
    return NextResponse.json({ data: doc || null, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const parsed = vendorProfileSchema.parse(body)

    const col = await getCollection<VendorProfile>('vendor_profiles')
    await col.updateOne(
      { alias: profile.alias },
      {
        $set: { ...parsed, updated_at: new Date() },
        $setOnInsert: {
          alias: profile.alias,
          is_active: true,
          created_at: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ data: { updated: true }, error: null }, { status: 200 })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ data: null, error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
