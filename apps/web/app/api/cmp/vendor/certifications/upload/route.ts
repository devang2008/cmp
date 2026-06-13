import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma/client'
import { getSessionFromRequest } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

// Removed: CERT_SCORES auto-scoring replaced by moderator review

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

    // Removed: auto-verify replaced by moderator review
    // verification_score is now set by moderator, not auto-calculated

    // Save to database with pending review status
    const certification = await prisma.certification.create({
      data: {
        vendor_alias: session.alias,
        cert_name,
        cert_type,
        file_url,
        verified: false,
        review_status: 'PENDING',
        verification_score: 0
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action_type: 'certification_uploaded',
        actor_alias: session.alias,
        metadata: { cert_name, cert_type }
      }
    })

    // Notify vendor that cert is under review
    await prisma.notification.create({
      data: {
        recipient_alias: session.alias,
        type: 'cert_submitted',
        content: `Your ${cert_name} certification has been submitted for moderator review. You will be notified once it is reviewed.`,
        ref_id: certification.id
      }
    })

    // Notify moderator room via Socket.IO for real-time queue update
    const io = (global as any).io
    if (io) {
      io.to('moderator-room').emit('new-cert-pending', {
        id: certification.id,
        vendor_alias: session.alias,
        cert_name,
        cert_type
      })
    }

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
