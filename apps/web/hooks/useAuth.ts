// ============================================================
// useAuth Hook — Core authentication state management
// JWT-based (no Supabase) — fetches from /api/cmp/auth/me
// ============================================================
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, UserRole, AuthState } from '@/types'

export function useAuth() {
  const router = useRouter()

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    alias: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Fetch current session from /api/cmp/auth/me
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/cmp/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        setState({
          user: null,
          profile: null,
          alias: null,
          role: null,
          isLoading: false,
          isAuthenticated: false,
        })
        return
      }

      const { data } = await res.json()

      setState({
        user: data.user,
        profile: data.profile as Profile,
        alias: data.alias,
        role: data.role as UserRole,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch {
      setState({
        user: null,
        profile: null,
        alias: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  // Fetch session on mount
  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await fetch('/api/cmp/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setState({
        user: null,
        profile: null,
        alias: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [router])

  // Require auth — redirect to login if not authenticated
  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push(`/login?redirect=${window.location.pathname}`)
    }
  }, [state.isLoading, state.isAuthenticated, router])

  return {
    ...state,
    signOut,
    requireAuth,
    refreshSession: fetchSession,
  }
}
