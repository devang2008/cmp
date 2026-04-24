// ============================================================
// useProfile Hook — Profile data fetching and updates
// ============================================================
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, AliasDirectory } from '@/types'

interface UseProfileReturn {
  profile: Profile | null
  aliasInfo: AliasDirectory | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateOnboardingStatus: (complete: boolean) => Promise<void>
}

export function useProfile(userId?: string): UseProfileReturn {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [aliasInfo, setAliasInfo] = useState<AliasDirectory | null>(null)
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

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw new Error(profileError.message)
      }

      setProfile(profileData as Profile)

      // Fetch alias directory info
      if (profileData?.alias) {
        const { data: aliasData, error: aliasError } = await supabase
          .from('alias_directory')
          .select('*')
          .eq('alias', profileData.alias)
          .single()

        if (!aliasError && aliasData) {
          setAliasInfo(aliasData as AliasDirectory)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile'
      setError(message)
      console.error('Profile fetch error:', message)
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateOnboardingStatus = useCallback(
    async (complete: boolean) => {
      if (!userId) return

      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ onboarding_complete: complete })
          .eq('id', userId)

        if (updateError) {
          throw new Error(updateError.message)
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
    [userId, supabase, fetchProfile]
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
