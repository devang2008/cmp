// POST /api/vendor/certifications/upload — upload a cert
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { CERT_SCORES } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const profile = await requireAuth()
    if (profile.role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const certName = formData.get('cert_name') as string
    const certType = formData.get('cert_type') as string

    if (!certName || !certType) {
      return NextResponse.json({ data: null, error: 'cert_name and cert_type are required' }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    let fileUrl: string | null = null

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ data: null, error: 'File must be under 5MB' }, { status: 400 })
      }

      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ data: null, error: 'File must be PDF or image' }, { status: 400 })
      }

      const ext = file.name.split('.').pop()
      const path = `${profile.alias}/${crypto.randomUUID()}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from('certifications')
        .upload(path, file, { contentType: file.type })

      if (uploadError) {
        return NextResponse.json({ data: null, error: `Upload failed: ${uploadError.message}` }, { status: 500 })
      }
      fileUrl = path
    }

    const verificationScore = CERT_SCORES[certType] || CERT_SCORES.other

    const { data, error } = await supabase.from('certifications').insert({
      vendor_alias: profile.alias,
      cert_name: certName,
      cert_type: certType,
      file_url: fileUrl,
      verified: false,
      verification_score: verificationScore,
    }).select().single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: { id: data.id, file_url: fileUrl },
      error: null
    }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
