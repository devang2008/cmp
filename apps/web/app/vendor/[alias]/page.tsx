import prisma from '@/lib/prisma/client'
import { notFound } from 'next/navigation'
import VendorProfileClient from './VendorProfileClient'
import { getCollection } from '@/lib/mongodb/client'
import { VendorProfile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ alias: string }> }) {
  const { alias } = await params
  return {
    title: `${alias} — Verified Security Expert | SHIELD`,
    description: `View certifications, trust score, and expertise of ${alias} on the SHIELD platform.`,
  }
}

export default async function VendorProfilePage({ params }: { params: Promise<{ alias: string }> }) {
  const { alias } = await params

  // 1. Fetch user profile from Prisma (using alias)
  const profile = await prisma.user.findUnique({
    where: { alias },
    select: {
      alias: true,
      trust_score: true,
      created_at: true,
      rating_as_vendor: true,
      total_vendor_reviews: true,
    }
  })

  if (!profile) notFound()

  // Convert Date properties to ISO strings for client compatibility
  const serializedProfile = {
    ...profile,
    created_at: profile.created_at.toISOString(),
  }

  // 2. Fetch alias directory from Prisma
  const directory = await prisma.aliasDirectory.findUnique({
    where: { alias }
  })

  // 3. Fetch certifications from Prisma
  const certs = await prisma.certification.findMany({
    where: {
      vendor_alias: alias,
      verified: true,
    }
  })

  const serializedCerts = certs.map(c => ({
    ...c,
    uploaded_at: c.uploaded_at.toISOString(),
    verified_at: c.verified_at ? c.verified_at.toISOString() : null,
  }))

  // 4. Fetch rich details from MongoDB
  const col = await getCollection<VendorProfile>('vendor_profiles')
  const mongoProfile = await col.findOne({ alias })

  // Convert MongoDB ObjectID or Date fields if needed for serialization, but usually fine
  const serializedMongoProfile = mongoProfile ? JSON.parse(JSON.stringify(mongoProfile)) : null

  // 5. Fetch public reviews from Prisma (buyer→vendor reviews only)
  const reviewsRaw = await prisma.review.findMany({
    where: {
      reviewee_alias: alias,
      reviewer_role: 'buyer',
    },
    select: {
      rating: true,
      comment: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 20,
  })

  const vendorReviews = reviewsRaw.map(r => ({
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at.toISOString(),
    reviewer_display: 'Anonymous Buyer',
  }))

  return (
    <VendorProfileClient 
      profile={serializedProfile} 
      directory={directory} 
      certs={serializedCerts}
      mongoProfile={serializedMongoProfile}
      vendorReviews={vendorReviews}
    />
  )
}
