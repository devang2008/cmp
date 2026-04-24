// ============================================================
// DASHBOARD INDEX — Redirect to role-specific dashboard
// ============================================================
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const role = user.user_metadata?.role
      router.push(role === 'vendor' ? '/dashboard/vendor' : '/dashboard/buyer')
    }
    redirect()
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
