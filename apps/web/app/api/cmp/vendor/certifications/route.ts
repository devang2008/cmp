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
