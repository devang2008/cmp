// ============================================================
// PUBLIC MARKETPLACE — Browse verified vendors (no auth required)
// ============================================================
import { createClient } from '@/lib/supabase/server'
import MarketplaceClient from './marketplace-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Vendor Marketplace — SHIELD',
  description: 'Browse verified cybersecurity vendors by skills, certifications, and trust score.',
}

export default async function MarketplacePage() {
  const supabase = await createClient()

  // Fetch all active vendors from alias_directory
  const { data: vendors } = await supabase
    .from('alias_directory')
    .select('*')
    .eq('role', 'vendor')
    .order('trust_score', { ascending: false })

  return <MarketplaceClient vendors={vendors || []} />
}
