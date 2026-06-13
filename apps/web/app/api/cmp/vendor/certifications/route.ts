// GET /api/cmp/vendor/certifications — list my certs
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET() {
  try {
    const profile = await requireAuth()

    const certs = await prisma.certification.findMany({
      where: { vendor_alias: profile.alias },
      orderBy: { uploaded_at: 'desc' },
      select: {
        id: true,
        vendor_alias: true,
        cert_name: true,
        cert_type: true,
        file_url: true,
        verified: true,
        review_status: true,
        verification_score: true,
        rejection_reason: true,
        reviewed_by: true,
        reviewed_at: true,
        uploaded_at: true,
        verified_at: true,
      },
    })

    // Return file_url directly (skip signed URL generation for now)
    const enriched = certs.map((cert) => ({
      ...cert,
      signed_url: cert.file_url, // placeholder — no storage signed URLs for now
    }))

    return NextResponse.json({ data: enriched, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
