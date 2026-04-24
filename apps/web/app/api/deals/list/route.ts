// GET /api/deals/list — list deals for current user
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth()
    const url = new URL(request.url)
    const role = url.searchParams.get('role') || profile.role

    const supabase = await getServerSupabase()
    const aliasField = role === 'vendor' ? 'vendor_alias' : 'buyer_alias'

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq(aliasField, profile.alias)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
