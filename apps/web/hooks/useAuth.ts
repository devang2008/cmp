// ============================================================
// useAuth Hook — Core authentication state management
// ============================================================
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole, AuthState } from '@/types'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    alias: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Fetch profile from Supabase
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error.message)
          return null
        }

        return data as Profile
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        return null
      }
    },
    [supabase]
  )

  // Update state from user object
  const updateAuthState = useCallback(
    async (user: User | null) => {
      if (!user) {
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

      const profile = await fetchProfile(user.id)

      setState({
        user: { id: user.id, email: user.email ?? '' },
        profile,
        alias: profile?.alias ?? null,
        role: (profile?.role as UserRole) ?? null,
        isLoading: false,
        isAuthenticated: true,
      })
    },
    [fetchProfile]
  )

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      await updateAuthState(user)
    }

    initAuth()

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await updateAuthState(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, updateAuthState])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [supabase.auth, router])

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
  }
}
