// ============================================================
// SIGNUP PAGE — SHIELD Design System
// ============================================================
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SignupPageClient } from './SignupPageClient'

export const metadata: Metadata = {
  title: 'Sign Up — SHIELD Marketplace',
  description: 'Create an anonymous SHIELD account.',
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <SignupPageClient />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
