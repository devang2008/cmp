import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Must be authenticated
  const session = await getSessionFromRequest(request)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Build safe file path
  const filePath = path.join(
    process.cwd(),
    'uploads',
    ...params.path
  )

  // Security: prevent path traversal
  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (!existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const file = readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()

    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch {
    return new NextResponse('Error reading file', { status: 500 })
  }
}
