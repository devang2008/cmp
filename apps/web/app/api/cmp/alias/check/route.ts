// GET /api/cmp/alias/check — Check alias availability (public, no auth)
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export const dynamic = 'force-dynamic'

const FORBIDDEN_WORDS = [
  'admin', 'system', 'shield', 'support', 'help', 'mod',
  'moderator', 'root', 'test', 'demo', 'guest', 'anon',
  'null', 'undefined', 'staff'
]

export async function GET(request: NextRequest) {
  const alias = request.nextUrl.searchParams.get('alias')

  // 1. Must exist
  if (!alias) {
    return NextResponse.json(
      { available: false, reason: 'invalid' }
    )
  }

  // 2. Validate full alias format: Vendor-XYZ or Buyer-XYZ
  const fullAliasRegex = /^(Vendor|Buyer)-[a-zA-Z0-9]{3,16}$/
  if (!fullAliasRegex.test(alias)) {
    return NextResponse.json(
      { available: false, reason: 'invalid' }
    )
  }

  // 3. Extract custom part and check forbidden words
  const customPart = alias.split('-')[1].toLowerCase()
  if (FORBIDDEN_WORDS.includes(customPart)) {
    return NextResponse.json(
      { available: false, reason: 'forbidden' }
    )
  }

  // 4. Check database uniqueness
  const existing = await prisma.user.findUnique({
    where: { alias },
    select: { alias: true }
  })

  return NextResponse.json({
    available: !existing,
    reason: existing ? 'taken' : null
  })
}
