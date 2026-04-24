import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  // 1. Fetch profile from Supabase (Trust Score, Joined At, Ratings)
  const { data: profile } = await supabase
    .from('profiles')
    .select('alias, trust_score, created_at, rating_as_vendor, total_vendor_reviews')
    .eq('alias', alias)
    .single()

  if (!profile) notFound()

  // 2. Fetch alias directory (Cert badges, completion stats)
  const { data: directory } = await supabase
    .from('alias_directory')
    .select('*')
    .eq('alias', alias)
    .single()

  // 3. Fetch certifications
  const { data: certs } = await supabase
    .from('certifications')
    .select('*')
    .eq('vendor_alias', alias)
    .eq('verified', true)

  // 4. Fetch rich details from MongoDB
  const col = await getCollection<VendorProfile>('vendor_profiles')
  const mongoProfile = await col.findOne({ alias })

  // 5. Fetch public reviews (buyer→vendor only)
  const { data: reviewsRaw } = await supabase
    .from('reviews')
    .select('rating, comment, created_at')
    .eq('reviewee_alias', alias)
    .eq('reviewer_role', 'buyer')
    .order('created_at', { ascending: false })
    .limit(20)

  const vendorReviews = (reviewsRaw || []).map(r => ({
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer_display: 'Anonymous Buyer',
  }))

  return (
    <VendorProfileClient 
      profile={profile} 
      directory={directory} 
      certs={certs || []}
      mongoProfile={mongoProfile}
      vendorReviews={vendorReviews}
    />
  )
}
