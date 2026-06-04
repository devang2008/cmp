import { NextRequest } from 'next/server'
import { verifyToken, type JWTPayload } from './jwt'

export const TOKEN_COOKIE = 'shield_token'

export function getTokenFromRequest(
  request: NextRequest
): string | null {
  return request.cookies.get(TOKEN_COOKIE)?.value || null
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function createCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  }
}
