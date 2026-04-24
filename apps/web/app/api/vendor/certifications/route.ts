// GET /api/vendor/certifications — list my certs
import { NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const profile = await requireAuth()
    const supabase = await getServerSupabase()

    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('vendor_alias', profile.alias)
      .order('uploaded_at', { ascending: false })

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    // Generate signed URLs for files
    const enriched = await Promise.all(
      (data || []).map(async (cert) => {
        let signedUrl: string | null = null
        if (cert.file_url) {
          const { data: urlData } = await supabase.storage
            .from('certifications')
            .createSignedUrl(cert.file_url, 3600)
          signedUrl = urlData?.signedUrl || null
        }
        return { ...cert, signed_url: signedUrl }
      })
    )

    return NextResponse.json({ data: enriched, error: null }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
