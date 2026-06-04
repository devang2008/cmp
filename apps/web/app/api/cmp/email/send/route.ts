// POST /api/cmp/email/send — Internal email dispatch with templates
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { sendEmail } from '@/lib/email/nodemailer'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  console.warn('NEXT_PUBLIC_APP_URL not set, using localhost fallback')
}
const BASE_URL = appUrl || 'http://localhost:3000'

// Simple template engine
const TEMPLATES: Record<string, { subject: string; html: (vars: Record<string, string>) => string }> = {
  new_proposal: {
    subject: 'New Proposal Received — SHIELD',
    html: (v) => `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#06b6d4,#3b82f6);padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">🛡️ SHIELD — New Proposal</h1>
        </div>
        <div style="padding:32px;color:#e2e8f0">
          <p>Hello <strong style="color:#22d3ee">${v.recipient_alias}</strong>,</p>
          <p>Vendor <strong style="color:#22d3ee">${v.vendor_alias}</strong> submitted a proposal for your requirement: <em>"${v.requirement_title}"</em>.</p>
          <p>Proposed price: <strong style="color:#34d399">$${v.proposed_price}</strong></p>
          <a href="${v.app_url}/dashboard/buyer/requirements" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View Proposals</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #1e293b;color:#64748b;font-size:12px">
          You received this because you have an open requirement on SHIELD.
        </div>
      </div>
    `,
  },
  proposal_accepted: {
    subject: 'Your Proposal Was Accepted! — SHIELD',
    html: (v) => `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#10b981,#06b6d4);padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">🛡️ SHIELD — Proposal Accepted!</h1>
        </div>
        <div style="padding:32px;color:#e2e8f0">
          <p>Congratulations <strong style="color:#22d3ee">${v.vendor_alias}</strong>,</p>
          <p>Your proposal was accepted and a deal has been created. You can now start negotiating terms in the secure chat.</p>
          <a href="${v.app_url}/deal/${v.deal_id}/chat" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Open Deal Chat</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #1e293b;color:#64748b;font-size:12px">
          All communications remain alias-only until both parties consent to identity reveal.
        </div>
      </div>
    `,
  },
  deal_status_change: {
    subject: 'Deal Status Updated — SHIELD',
    html: (v) => `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">🛡️ SHIELD — Deal Update</h1>
        </div>
        <div style="padding:32px;color:#e2e8f0">
          <p>Hello <strong style="color:#22d3ee">${v.recipient_alias}</strong>,</p>
          <p>Deal status changed: <span style="color:#f87171">${v.from_status}</span> → <span style="color:#34d399">${v.to_status}</span></p>
          <a href="${v.app_url}/deal/${v.deal_id}/chat" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View Deal</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #1e293b;color:#64748b;font-size:12px">
          You are receiving this notification as a participant in this deal.
        </div>
      </div>
    `,
  },
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth() // Must be authenticated

    const { template, to, variables } = await request.json()

    if (!template || !to || !variables) {
      return NextResponse.json({ error: 'template, to, and variables are required' }, { status: 400 })
    }

    const tmpl = TEMPLATES[template]
    if (!tmpl) {
      return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 })
    }

    // Inject app URL into variables
    const vars = { ...variables, app_url: BASE_URL }

    const sent = await sendEmail({
      to,
      subject: tmpl.subject,
      html: tmpl.html(vars),
    })

    if (!sent) {
      console.error('[email/send] Nodemailer send failed')
      return NextResponse.json({ data: null, error: 'Send failed', sent: false }, { status: 200 })
    }

    return NextResponse.json({ data: { message: 'Email sent successfully' }, error: null, sent: true }, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    console.error('[email/send] Error:', msg)
    return NextResponse.json({ error: msg, sent: false }, { status: 200 }) // best-effort, don't 500
  }
}
