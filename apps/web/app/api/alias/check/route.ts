// ============================================================
// ALIAS CHECK API — Validate alias availability
// ============================================================
// Public endpoint (no auth required — used during signup)
// GET /api/alias/check?alias=Vendor-ShadowByte
// ============================================================
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Forbidden custom parts (case-insensitive check)
const FORBIDDEN_WORDS = [
  'admin', 'system', 'shield', 'support', 'help', 'mod', 'moderator',
  'root', 'test', 'demo', 'guest', 'anon', 'null', 'undefined',
]

// Full alias must match: (Vendor|Buyer)-[alphanumeric 3-16 chars]
const FULL_ALIAS_REGEX = /^(Vendor|Buyer)-[a-zA-Z0-9]{3,16}$/
// Custom part regex (what the user types)
const CUSTOM_PART_REGEX = /^[a-zA-Z0-9]{3,16}$/

export async function GET(request: NextRequest) {
  try {
    const alias = request.nextUrl.searchParams.get('alias')

    if (!alias) {
      return NextResponse.json(
        { available: false, reason: 'invalid' },
        { status: 400 }
      )
    }

    // 1. Validate full alias format
    if (!FULL_ALIAS_REGEX.test(alias)) {
      return NextResponse.json(
        { available: false, reason: 'invalid' },
        { status: 200 }
      )
    }

    // 2. Extract and check custom part against forbidden words
    const customPart = alias.split('-').slice(1).join('-')
    if (!CUSTOM_PART_REGEX.test(customPart)) {
      return NextResponse.json(
        { available: false, reason: 'invalid' },
        { status: 200 }
      )
    }

    if (FORBIDDEN_WORDS.includes(customPart.toLowerCase())) {
      return NextResponse.json(
        { available: false, reason: 'forbidden' },
        { status: 200 }
      )
    }

    // 3. Check database for existing alias
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data: existing } = await supabase
      .from('alias_directory')
      .select('alias')
      .eq('alias', alias)
      .single()

    if (existing) {
      return NextResponse.json(
        { available: false, reason: 'taken' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { available: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Alias check error:', error)
    return NextResponse.json(
      { available: false, reason: 'invalid' },
      { status: 500 }
    )
  }
}
