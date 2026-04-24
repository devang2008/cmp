// GET /api/notifications — list my notifications
// PATCH /api/notifications — mark all read
import { NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const profile = await requireAuth()
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_alias', profile.alias)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const profile = await requireAuth()
    const supabase = await getServerSupabase()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_alias', profile.alias)
      .eq('read', false)

    return NextResponse.json({ data: { marked: true }, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
