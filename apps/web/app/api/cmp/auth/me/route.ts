// GET /api/cmp/auth/me — Return current user session data
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'
import { getSessionFromRequest } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json(
        { data: null, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch fresh profile data from DB
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        alias: true,
        role: true,
        trust_score: true,
        onboarding_complete: true,
        rating_as_vendor: true,
        rating_as_buyer: true,
        total_vendor_reviews: true,
        total_buyer_reviews: true,
        created_at: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        profile: {
          id: user.id,
          alias: user.alias,
          role: user.role,
          trust_score: user.trust_score,
          onboarding_complete: user.onboarding_complete,
          rating_as_vendor: user.rating_as_vendor,
          rating_as_buyer: user.rating_as_buyer,
          total_vendor_reviews: user.total_vendor_reviews,
          total_buyer_reviews: user.total_buyer_reviews,
          created_at: user.created_at.toISOString(),
          updated_at: user.created_at.toISOString(),
        },
        alias: user.alias,
        role: user.role,
      },
      error: null,
    })

  } catch (err) {
    console.error('Auth me error:', err)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json(
        { data: null, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { onboarding_complete } = body

    if (typeof onboarding_complete !== 'boolean') {
      return NextResponse.json(
        { data: null, error: 'onboarding_complete must be a boolean' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { onboarding_complete },
      select: {
        id: true,
        email: true,
        alias: true,
        role: true,
        trust_score: true,
        onboarding_complete: true,
        rating_as_vendor: true,
        rating_as_buyer: true,
        total_vendor_reviews: true,
        total_buyer_reviews: true,
        created_at: true,
      }
    })

    return NextResponse.json({
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
        },
        profile: {
          id: updatedUser.id,
          alias: updatedUser.alias,
          role: updatedUser.role,
          trust_score: updatedUser.trust_score,
          onboarding_complete: updatedUser.onboarding_complete,
          rating_as_vendor: updatedUser.rating_as_vendor,
          rating_as_buyer: updatedUser.rating_as_buyer,
          total_vendor_reviews: updatedUser.total_vendor_reviews,
          total_buyer_reviews: updatedUser.total_buyer_reviews,
          created_at: updatedUser.created_at.toISOString(),
          updated_at: updatedUser.created_at.toISOString(),
        },
        alias: updatedUser.alias,
        role: updatedUser.role,
      },
      error: null,
    })
  } catch (err) {
    console.error('Auth me PATCH error:', err)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

