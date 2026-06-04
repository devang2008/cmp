// ============================================================
// useProfile Hook — Profile data fetching and updates
// JWT-based (no Supabase) — fetches from /api/cmp/auth/me
// ============================================================
'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Profile } from '@/types'

interface UseProfileReturn {
  profile: Profile | null
  aliasInfo: any | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateOnboardingStatus: (complete: boolean) => Promise<void>
}

export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [aliasInfo, setAliasInfo] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/cmp/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Failed to fetch profile')
      }

      const { data } = await res.json()
      if (data && data.profile) {
        setProfile(data.profile as Profile)
        // Set aliasInfo to a fallback shape representing user's rating/trust data
        setAliasInfo({
          alias: data.profile.alias,
          role: data.profile.role,
          trust_score: data.profile.trust_score,
          cert_badges: [],
          skills: [],
          completed_deals: 0,
          response_rate: 100,
          rating_as_vendor: data.profile.rating_as_vendor,
          rating_as_buyer: data.profile.rating_as_buyer,
          total_vendor_reviews: data.profile.total_vendor_reviews,
          total_buyer_reviews: data.profile.total_buyer_reviews,
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile'
      setError(message)
      console.error('Profile fetch error:', message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateOnboardingStatus = useCallback(
    async (complete: boolean) => {
      if (!userId) return

      try {
        const res = await fetch('/api/cmp/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboarding_complete: complete }),
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to update onboarding status')
        }

        // Refresh profile data
        await fetchProfile()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update onboarding status'
        setError(message)
        console.error('Onboarding update error:', message)
      }
    },
    [userId, fetchProfile]
  )

  return {
    profile,
    aliasInfo,
    isLoading,
    error,
    refetch: fetchProfile,
    updateOnboardingStatus,
  }
}
