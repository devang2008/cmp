import nodemailer from 'nodemailer'

function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    console.error('Gmail credentials missing in .env.local')
    console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD')
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })
}

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const transporter = createTransporter()
  if (!transporter) {
    console.error('Email not sent: transporter not configured')
    return false
  }

  try {
    await transporter.sendMail({
      from: `"SHIELD Platform" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    })
    console.log(`Email sent to ${to}`)
    return true
  } catch (err) {
    console.error('Email send failed:', err)
    return false
  }
}

export function buildVerificationEmail(
  alias: string,
  token: string
): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/cmp/auth/verify?token=${token}`
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to SHIELD, ${alias}</h2>
      <p>You are one step away from accessing the anonymous cybersecurity marketplace.</p>
      <p>Click the button below to verify your email address:</p>
      <a href="${url}"
         style="background: #6366F1; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 6px;
                display: inline-block; margin: 16px 0;">
        Verify my account
      </a>
      <p style="color: #666; font-size: 14px;">
        This link expires in 24 hours.
        If you did not create this account, ignore this email.
      </p>
      <hr/>
      <p style="color: #999; font-size: 12px;">
        SHIELD — Anonymous Cybersecurity Marketplace
      </p>
    </div>
  `
}

export function buildPasswordResetEmail(
  alias: string,
  token: string
): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset — SHIELD</h2>
      <p>Hello ${alias}, a password reset was requested.</p>
      <a href="${url}"
         style="background: #6366F1; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 6px;
                display: inline-block; margin: 16px 0;">
        Reset my password
      </a>
      <p style="color: #666; font-size: 14px;">
        This link expires in 1 hour.
        If you did not request this, ignore this email.
      </p>
    </div>
  `
}
