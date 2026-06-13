// GET /api/cmp/moderator/certifications/[id]
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'
import { getCollection } from '@/lib/mongodb/client'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const certification = await prisma.certification.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            alias: true,
            role: true,
            trust_score: true,
          },
        },
        reviewer: {
          select: {
            alias: true,
          },
        },
      },
    })

    if (!certification) {
      return NextResponse.json(
        { data: null, error: 'Certification not found' },
        { status: 404 }
      )
    }

    // Fetch vendor's MongoDB profile for skills and categories
    let vendor_profile = null
    try {
      const vendorProfiles = await getCollection('vendor_profiles')
      vendor_profile = await vendorProfiles.findOne({
        alias: certification.vendor_alias,
      })
    } catch {
      // MongoDB may be unavailable; continue without profile
    }

    return NextResponse.json(
      {
        data: {
          certification,
          vendor_profile,
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json(
      { data: null, error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    )
  }
}
