// ============================================================
// DASHBOARD INDEX — Redirect to role-specific dashboard
// ============================================================
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { role, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push(
      role === 'moderator' ? '/dashboard/moderator' :
      role === 'vendor' ? '/dashboard/vendor' : '/dashboard/buyer'
    )
  }, [role, isLoading, isAuthenticated, router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
