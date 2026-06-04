// ============================================================
// PUBLIC MARKETPLACE — Browse verified vendors (no auth required)
// ============================================================
import prisma from '@/lib/prisma/client'
import MarketplaceClient from './marketplace-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Vendor Marketplace — SHIELD',
  description: 'Browse verified cybersecurity vendors by skills, certifications, and trust score.',
}

export default async function MarketplacePage() {
  let vendors: any[] = []
  try {
    vendors = await prisma.aliasDirectory.findMany({
      where: { role: 'vendor' },
      orderBy: { trust_score: 'desc' },
    })
  } catch {
    // DB not ready
  }

  return <MarketplaceClient vendors={vendors} />
}
