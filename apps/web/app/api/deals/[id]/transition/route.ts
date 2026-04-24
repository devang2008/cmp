// POST /api/deals/[id]/transition — state machine
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/auth-helpers'
import { dealTransitionSchema } from '@/lib/validations'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

const TRANSITIONS: Record<string, { to: string; allowedRoles: string[] }[]> = {
  POSTED: [{ to: 'MATCHED', allowedRoles: ['admin'] }],
  MATCHED: [{ to: 'NEGOTIATING', allowedRoles: ['buyer'] }],
  NEGOTIATING: [
    { to: 'CONTRACTED', allowedRoles: ['buyer', 'vendor'] },
    { to: 'CANCELLED', allowedRoles: ['buyer', 'vendor'] },
  ],
  CONTRACTED: [{ to: 'IN_PROGRESS', allowedRoles: ['vendor'] }],
  IN_PROGRESS: [{ to: 'REVIEW', allowedRoles: ['vendor'] }],
  REVIEW: [
    // CLOSED is handled by /api/deals/[id]/close — do NOT add here
    { to: 'IN_PROGRESS', allowedRoles: ['buyer'] },
    { to: 'DISPUTED', allowedRoles: ['buyer'] },
  ],
  DISPUTED: [
    { to: 'CLOSED', allowedRoles: ['admin'] },
    { to: 'IN_PROGRESS', allowedRoles: ['admin'] },
  ],
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = dealTransitionSchema.parse(body)
    const targetStatus = parsed.action

    const supabase = await getServerSupabase()

    // Fetch current deal
    const { data: deal, error } = await supabase
      .from('deals').select('*').eq('id', id).single()
    if (error || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

    // Verify participant
    const isBuyer = deal.buyer_alias === profile.alias
    const isVendor = deal.vendor_alias === profile.alias
    if (!isBuyer && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine caller role in context of this deal
    const callerRole = isBuyer ? 'buyer' : 'vendor'

    // Check transition is allowed
    const allowed = TRANSITIONS[deal.status] || []
    const transition = allowed.find(
      t => t.to === targetStatus && t.allowedRoles.includes(callerRole)
    )
    if (!transition) {
      return NextResponse.json({
        error: `Cannot transition from ${deal.status} to ${targetStatus} as ${callerRole}`,
      }, { status: 400 })
    }

    // Execute transition
    const updateData: Record<string, unknown> = {
      status: targetStatus,
      updated_at: new Date().toISOString(),
    }
    if (targetStatus === 'CLOSED') {
      updateData.closed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('deals').update(updateData).eq('id', id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Insert deal event
    await supabase.from('deal_events').insert({
      deal_id: id,
      event_type: `status_change`,
      from_status: deal.status,
      to_status: targetStatus,
      actor_alias: profile.alias,
      note: parsed.note || `Status changed to ${targetStatus}`,
      metadata: parsed.metadata || {},
    })

    // Insert system message in chat
    await supabase.from('messages').insert({
      deal_id: id,
      sender_alias: 'SYSTEM',
      encrypted_content: `Deal status changed to ${targetStatus}`,
      message_type: 'system',
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_alias: profile.alias,
      action_type: 'deal_transition',
      target_type: 'deal',
      target_id: id,
      metadata: { from: deal.status, to: targetStatus },
    })

    // Notify other party
    const otherAlias = isBuyer ? deal.vendor_alias : deal.buyer_alias
    if (otherAlias) {
      await supabase.from('notifications').insert({
        recipient_alias: otherAlias,
        type: 'deal_status_change',
        content: `Deal status changed to ${targetStatus}`,
        ref_id: id,
      })
    }

    // Trust events on completion
    if (targetStatus === 'CLOSED' && deal.vendor_alias) {
      await supabase.from('trust_events').insert({
        alias: deal.vendor_alias,
        event_type: 'deal_completed',
        score_delta: 15,
        ref_id: id,
      })
    }
    if (targetStatus === 'CANCELLED') {
      if (deal.vendor_alias) {
        await supabase.from('trust_events').insert({
          alias: deal.vendor_alias,
          event_type: 'deal_cancelled',
          score_delta: -8,
          ref_id: id,
        })
      }
    }

    // --- NEW: Trigger Trust Score Recomputation ---
    if (deal.vendor_alias && (targetStatus === 'CLOSED' || targetStatus === 'CANCELLED')) {
      try {
        await supabase.functions.invoke('compute-trust', { body: { alias: deal.vendor_alias } })
      } catch (trustErr) {
        console.error('Trust update failed:', trustErr)
      }
    }

    // --- NEW: Email Dispatch ---
    if (otherAlias) {
      try {
        const { data: targetProfile } = await supabase
          .from('profiles').select('id').eq('alias', otherAlias).single()
        
        if (targetProfile) {
          const { data: targetAuth } = await supabase.auth.admin.getUserById(targetProfile.id)
          if (targetAuth?.user?.email) {
            await fetch(`${BASE_URL}/api/email/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
              body: JSON.stringify({
                template: 'deal_status_change',
                to: targetAuth.user.email,
                variables: {
                  recipient_alias: otherAlias,
                  from_status: deal.status,
                  to_status: targetStatus,
                  deal_id: id,
                }
              })
            })
          }
        }
      } catch (emailErr) {
        console.error('Email dispatch failed:', emailErr)
      }
    }

    return NextResponse.json({
      data: { deal_id: id, newStatus: targetStatus },
      status: 200,
    })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json({ error: 'Validation error', details: e }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
