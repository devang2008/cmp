// GET /api/cmp/deals/list — list deals for current user
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const url = new URL(request.url)
    const role = url.searchParams.get('role') || session.role

    const aliasField = role === 'vendor' ? 'vendor_alias' : 'buyer_alias'

    const data = await prisma.deal.findMany({
      where: { [aliasField]: session.alias },
      orderBy: { updated_at: 'desc' },
    })

    return NextResponse.json({ data, status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}
