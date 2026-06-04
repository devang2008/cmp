import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma/client'
import { getSessionFromRequest } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

const CERT_SCORES: Record<string, number> = {
  OSCP: 20, CISSP: 20, CISM: 18, CEH: 15, GPEN: 15,
  GWAPT: 14, ISO27001: 12, CompTIA_Security: 10, eJPT: 8, other: 5
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'vendor') {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' }, { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const cert_name = formData.get('cert_name') as string
    const cert_type = formData.get('cert_type') as string

    if (!file || !cert_name || !cert_type) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { data: null, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase()
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png']
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { data: null, error: 'Only PDF, JPG, and PNG allowed' },
        { status: 400 }
      )
    }

    // Save file to disk
    const filename = `${uuidv4()}${ext}`
    const uploadDir = path.join(process.cwd(), 'uploads', 'certifications')
    mkdirSync(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, filename)

    const bytes = await file.arrayBuffer()
    writeFileSync(filePath, Buffer.from(bytes))

    // URL to access the file
    const file_url = `/api/cmp/files/certifications/${filename}`

    // Calculate verification score
    const verification_score = CERT_SCORES[cert_type] || 5

    // Save to database
    const certification = await prisma.certification.create({
      data: {
        vendor_alias: session.alias,
        cert_name,
        cert_type,
        file_url,
        verified: false,
        verification_score
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'certification_uploaded',
        actor_alias: session.alias,
        metadata: { cert_name, cert_type, verification_score }
      }
    })

    return NextResponse.json({
      data: certification,
      error: null
    }, { status: 201 })

  } catch (err) {
    console.error('Cert upload error:', err)
    return NextResponse.json(
      { data: null, error: 'Upload failed' }, { status: 500 }
    )
  }
}
