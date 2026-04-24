// ============================================================
// SUPABASE EDGE FUNCTION: generate-alias
// ============================================================
// Triggered on auth.users insert (via Database Webhook)
// Creates profile + alias_directory entry for new users
//
// SUPPORTS:
//   1. User-chosen alias: reads preferred_alias from user_metadata
//      → validates format, checks uniqueness, uses if available
//      → appends random digits if taken
//   2. Fallback: generates random alias if no preference given
//
// DEPLOYMENT:
//   supabase functions deploy generate-alias
//
// WEBHOOK CONFIGURATION:
//   1. Go to Supabase Dashboard > Database > Webhooks
//   2. Create webhook on auth.users INSERT
//   3. Point to: https://<project>.supabase.co/functions/v1/generate-alias
//   4. Add header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Custom alphabet: alphanumeric, no ambiguous chars
const ALIAS_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'

// Validation for the custom part (what the user types)
const CUSTOM_PART_REGEX = /^[a-zA-Z0-9]{3,16}$/
// Full alias: (Vendor|Buyer)-[alphanumeric 3-16]
const FULL_ALIAS_REGEX = /^(Vendor|Buyer)-[a-zA-Z0-9]{3,16}$/

function generateRandomSuffix(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => ALIAS_CHARS[b % ALIAS_CHARS.length])
    .join('')
}

function generateRandomAlias(role: 'buyer' | 'vendor'): string {
  const prefix = role === 'vendor' ? 'Vendor' : 'Buyer'
  const suffix = generateRandomSuffix(4)
  return `${prefix}-${suffix}`
}

async function isAliasAvailable(
  supabase: ReturnType<typeof createClient>,
  alias: string
): Promise<boolean> {
  const { data: existing } = await supabase
    .from('alias_directory')
    .select('alias')
    .eq('alias', alias)
    .single()
  return !existing
}

Deno.serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload = await req.json()

    // The webhook sends the new auth.users record
    const { record } = payload as {
      record: {
        id: string
        raw_user_meta_data?: {
          role?: string
          preferred_alias?: string
        }
      }
    }

    if (!record?.id) {
      return new Response(
        JSON.stringify({ error: 'Missing user record' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract role from user metadata (set during signup)
    const role = (record.raw_user_meta_data?.role as 'buyer' | 'vendor') || 'buyer'
    const preferredAlias = record.raw_user_meta_data?.preferred_alias

    // Create admin client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // ── Alias Resolution ──
    let alias: string | undefined
    let isUnique = false

    // Strategy 1: User-chosen alias
    if (preferredAlias && FULL_ALIAS_REGEX.test(preferredAlias)) {
      // Validate prefix matches role
      const expectedPrefix = role === 'vendor' ? 'Vendor' : 'Buyer'
      const actualPrefix = preferredAlias.split('-')[0]

      if (actualPrefix === expectedPrefix) {
        // Check if the preferred alias is available
        if (await isAliasAvailable(supabase, preferredAlias)) {
          alias = preferredAlias
          isUnique = true
        } else {
          // Preferred alias is taken → append random digits
          const customPart = preferredAlias.split('-').slice(1).join('-')
          for (let i = 0; i < 5; i++) {
            const digits = String(Math.floor(Math.random() * 100)).padStart(2, '0')
            const candidate = `${expectedPrefix}-${customPart}${digits}`
            // Ensure candidate doesn't exceed max length (Prefix + hyphen + 16 chars)
            if (CUSTOM_PART_REGEX.test(`${customPart}${digits}`) && await isAliasAvailable(supabase, candidate)) {
              alias = candidate
              isUnique = true
              break
            }
          }
        }
      }
    }

    // Strategy 2: Random alias fallback
    if (!isUnique) {
      let attempts = 0
      const maxAttempts = 10
      do {
        alias = generateRandomAlias(role)
        attempts++
        if (await isAliasAvailable(supabase, alias)) {
          isUnique = true
        }
      } while (!isUnique && attempts < maxAttempts)
    }

    if (!isUnique || !alias) {
      return new Response(
        JSON.stringify({ error: 'Could not generate unique alias after retries' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: record.id,
        alias,
        role,
        trust_score: 0,
        onboarding_complete: false,
      })

    if (profileError) {
      console.error('Profile insert error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to create profile', details: profileError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Insert into alias_directory table
    const { error: aliasError } = await supabase
      .from('alias_directory')
      .insert({
        alias,
        role,
        trust_score: 0,
        cert_badges: [],
        skills: [],
        completed_deals: 0,
        response_rate: 100,
      })

    if (aliasError) {
      console.error('Alias directory insert error:', aliasError)
      // Rollback: delete the profile we just created
      await supabase.from('profiles').delete().eq('id', record.id)

      return new Response(
        JSON.stringify({ error: 'Failed to create alias directory entry', details: aliasError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Created alias ${alias} for user ${record.id} (${role})${preferredAlias ? ` [preferred: ${preferredAlias}]` : ''}`)

    return new Response(
      JSON.stringify({ alias, role, success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
