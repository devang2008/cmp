// ============================================================
// AUTH HELPERS — server-side user/alias resolution for API routes
// JWT-based (no Supabase) — reads shield_token cookie
// ============================================================
import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from '@/lib/auth/jwt'
import { TOKEN_COOKIE } from '@/lib/auth/session'
import prisma from '@/lib/prisma/client'

/**
 * Get current session from JWT cookie (for Server Components / API routes)
 */
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE)?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

/**
 * Get current user profile from JWT (lightweight — no DB call)
 */
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return {
    id: session.userId,
    alias: session.alias,
    role: session.role,
  }
}

/**
 * Get current profile with full data from DB
 */
export async function getCurrentProfile() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      alias: true,
      role: true,
      trust_score: true,
      onboarding_complete: true,
      created_at: true,
      updated_at: true,
    }
  })

  return user
}

/**
 * Require auth — throws if not authenticated.
 * Returns { userId, alias, role } from JWT.
 * Used by API routes to gate access.
 */
export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
