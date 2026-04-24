// ============================================================
// LOGIN PAGE — SHIELD Design System
// ============================================================
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginPageClient } from './LoginPageClient'

export const metadata: Metadata = {
  title: 'Sign In — SHIELD Marketplace',
  description: 'Sign in to your anonymous SHIELD account. Zero identity exposure.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
