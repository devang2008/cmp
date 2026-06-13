// GET /api/cmp/moderator/dashboard/stats
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma/client'

export async function GET() {
  try {
    const session = await requireAuth()
    if (session.role !== 'moderator') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const [
      totalUsers,
      totalVendors,
      totalBuyers,
      totalCertifications,
      pendingCertifications,
      approvedCertifications,
      rejectedCertifications,
      totalDeals,
      activeDeals,
      totalDisputes,
      recentActions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'vendor' } }),
      prisma.user.count({ where: { role: 'buyer' } }),
      prisma.certification.count(),
      prisma.certification.count({ where: { review_status: 'PENDING' } }),
      prisma.certification.count({ where: { review_status: 'APPROVED' } }),
      prisma.certification.count({ where: { review_status: 'REJECTED' } }),
      prisma.deal.count(),
      prisma.deal.count({
        where: { status: { notIn: ['CLOSED', 'CANCELLED'] } },
      }),
      prisma.deal.count({ where: { status: 'DISPUTED' } }),
      prisma.moderatorAction.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
    ])

    return NextResponse.json(
      {
        data: {
          total_users: totalUsers,
          total_vendors: totalVendors,
          total_buyers: totalBuyers,
          total_certifications: totalCertifications,
          pending_certifications: pendingCertifications,
          approved_certifications: approvedCertifications,
          rejected_certifications: rejectedCertifications,
          total_deals: totalDeals,
          active_deals: activeDeals,
          total_disputes: totalDisputes,
          recent_actions: recentActions,
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json(
      { data: null, error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    )
  }
}
