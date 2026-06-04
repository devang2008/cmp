// ============================================================
// TRUST SCORE COMPUTATION — Replaces Supabase edge function
// Recomputes trust score from trust_events for a given alias
// ============================================================
import prisma from '@/lib/prisma/client'

export async function computeTrustScore(alias: string): Promise<number> {
  // Sum all trust event deltas for this alias
  const result = await prisma.trustEvent.aggregate({
    where: { alias },
    _sum: { score_delta: true },
  })

  const newScore = Math.max(0, Math.min(100, result._sum.score_delta ?? 0))

  // Update the user's trust score
  await prisma.user.update({
    where: { alias },
    data: { trust_score: newScore },
  })

  // Update the alias directory entry
  await prisma.aliasDirectory.updateMany({
    where: { alias },
    data: { trust_score: newScore },
  })

  return newScore
}

/**
 * Recompute vendor review rating
 */
export async function recomputeVendorRating(alias: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { reviewee_alias: alias, reviewer_role: 'buyer' },
    select: { rating: true },
  })

  if (reviews.length === 0) return

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.user.update({
    where: { alias },
    data: {
      rating_as_vendor: Math.round(avg * 10) / 10,
      total_vendor_reviews: reviews.length,
    },
  })

  await prisma.aliasDirectory.updateMany({
    where: { alias },
    data: {
      rating_as_vendor: Math.round(avg * 10) / 10,
      total_vendor_reviews: reviews.length,
    },
  })
}
