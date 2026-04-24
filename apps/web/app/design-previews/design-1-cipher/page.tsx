// Design 1: "Cipher" — Dark professional
// Near-black (#0D0D0D) background with electric indigo (#6366F1) accents
// Monospace font for aliases and codes, sans-serif for content
// Trust score displayed as a glowing ring indicator
// Feels like a security operations center dashboard
'use client'

import { useState } from 'react'

export default function CipherDesign() {
  const [activeTab, setActiveTab] = useState('landing')

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0D0D0D', color: '#E5E7EB', minHeight: '100vh' }}>
      {/* Design Toggle */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setActiveTab('landing')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? '#6366F1' : '#1A1A2E', color: '#fff' }}
        >Landing</button>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? '#6366F1' : '#1A1A2E', color: '#fff' }}
        >Dashboard</button>
      </div>

      {activeTab === 'landing' ? <CipherLanding /> : <CipherDashboard />}
    </div>
  )
}

function CipherLanding() {
  return (
    <>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #1A1A2E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>C</div>
          <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>CIPHER</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#how" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>How It Works</a>
          <a href="#trust" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Trust</a>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #6366F1', background: 'transparent', color: '#6366F1', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Sign In</button>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#6366F1', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '120px 48px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#6366F1', letterSpacing: 4, marginBottom: 24, textTransform: 'uppercase' }}>Anonymous • Encrypted • Trusted</div>
        <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' }}>
          Cybersecurity services.{' '}
          <span style={{ color: '#6366F1' }}>Zero identity exposure.</span>
        </h1>
        <p style={{ fontSize: 20, color: '#9CA3AF', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6 }}>
          Connect with elite cybersecurity professionals under complete anonymity. Your identity stays hidden until you choose to reveal it.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button style={{ padding: '16px 40px', borderRadius: 12, border: 'none', background: '#6366F1', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}>Start Anonymously</button>
          <button style={{ padding: '16px 40px', borderRadius: 12, border: '1px solid #333', background: 'transparent', color: '#E5E7EB', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Learn More</button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, padding: '0 48px 80px' }}>
        {[
          { value: '500+', label: 'Verified Vendors' },
          { value: '2,400+', label: 'Deals Completed' },
          { value: '100%', label: 'E2E Encrypted' },
          { value: '0', label: 'Identity Leaks' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#111118', borderRadius: 12, padding: '32px 24px', textAlign: 'center', border: '1px solid #1A1A2E' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 800, color: '#6366F1', marginBottom: 8 }}>{stat.value}</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section id="how" style={{ padding: '80px 48px', background: '#0A0A14' }}>
        <h2 style={{ textAlign: 'center', fontSize: 40, fontWeight: 800, marginBottom: 64 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up with email only. Receive your anonymous alias instantly.', icon: '🔐' },
            { step: '02', title: 'Post or Browse', desc: 'Buyers post requirements. Vendors offer services. All under aliases.', icon: '📋' },
            { step: '03', title: 'Encrypted Comms', desc: 'All messages encrypted client-side. Server never sees plaintext.', icon: '🔒' },
            { step: '04', title: 'Close & Reveal', desc: 'Deal completed? Both parties can optionally reveal identities.', icon: '✅' },
          ].map((item) => (
            <div key={item.step} style={{ padding: 32, borderRadius: 16, border: '1px solid #1A1A2E', position: 'relative' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 48, fontWeight: 800, color: '#1A1A2E', position: 'absolute', top: 16, right: 20 }}>{item.step}</div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section id="trust" style={{ padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Built on Trust</h2>
        <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 64, maxWidth: 600, margin: '0 auto 64px' }}>Every interaction is scored. Every certification is verified. Trust is earned, not assumed.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['End-to-End Encryption', 'Row Level Security', 'Zero-Knowledge Aliases', 'Immutable Audit Logs', 'Verified Certifications'].map((item) => (
            <div key={item} style={{ padding: '12px 24px', borderRadius: 999, border: '1px solid #6366F1', color: '#818CF8', fontSize: 14, fontWeight: 500 }}>{item}</div>
          ))}
        </div>
      </section>
    </>
  )
}

function CipherDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: '#111118', borderBottom: '1px solid #1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>C</div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 }}>CIPHER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'monospace', background: '#6366F1/10', border: '1px solid #6366F130', padding: '6px 16px', borderRadius: 8, color: '#818CF8', fontSize: 14, fontWeight: 600, backgroundColor: 'rgba(99,102,241,0.1)' }}>Vendor-K7f3</div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚙️</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginTop: 64, padding: 32, width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: 32, maxWidth: 1400, margin: '0 auto' }}>
          {/* Left: Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Dashboard', active: true },
              { label: 'My Services' },
              { label: 'Open Requirements' },
              { label: 'Active Deals' },
              { label: 'Messages' },
              { label: 'Certifications' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '12px 16px', borderRadius: 10, background: item.active ? 'rgba(99,102,241,0.1)' : 'transparent', color: item.active ? '#818CF8' : '#9CA3AF', fontSize: 14, fontWeight: item.active ? 600 : 400, cursor: 'pointer' }}>{item.label}</div>
            ))}
          </div>

          {/* Center: Main Content */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Active Deals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { buyer: 'Buyer-M2x9', title: 'Penetration Testing for Web App', status: 'IN_PROGRESS', price: '$12,000' },
                { buyer: 'Buyer-R4t6', title: 'Cloud Security Audit', status: 'NEGOTIATING', price: '$8,500' },
                { buyer: 'Buyer-J8n2', title: 'GDPR Compliance Assessment', status: 'REVIEW', price: '$15,000' },
              ].map((deal) => (
                <div key={deal.title} style={{ padding: 20, borderRadius: 12, border: '1px solid #1A1A2E', background: '#111118' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6366F1', marginBottom: 4 }}>{deal.buyer}</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{deal.title}</div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, fontFamily: 'monospace', background: deal.status === 'IN_PROGRESS' ? 'rgba(34,197,94,0.1)' : deal.status === 'NEGOTIATING' ? 'rgba(234,179,8,0.1)' : 'rgba(99,102,241,0.1)', color: deal.status === 'IN_PROGRESS' ? '#22C55E' : deal.status === 'NEGOTIATING' ? '#EAB308' : '#818CF8' }}>{deal.status}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#6B7280' }}>{deal.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Trust Score & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 24, borderRadius: 16, border: '1px solid #1A1A2E', background: '#111118', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Trust Score</div>
              <svg width={100} height={100} style={{ margin: '0 auto', display: 'block' }}>
                <circle cx={50} cy={50} r={42} fill="none" stroke="#1A1A2E" strokeWidth={6} />
                <circle cx={50} cy={50} r={42} fill="none" stroke="#6366F1" strokeWidth={6} strokeDasharray={264} strokeDashoffset={264 * 0.22} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} />
                <text x={50} y={50} textAnchor="middle" dominantBaseline="central" fill="#6366F1" fontSize={24} fontWeight={800} fontFamily="monospace">78</text>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#818CF8', marginTop: 8 }}>Good</div>
            </div>
            <div style={{ padding: 20, borderRadius: 12, border: '1px solid #1A1A2E', background: '#111118' }}>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Quick Stats</div>
              {[
                { label: 'Completed Deals', value: '14' },
                { label: 'Response Rate', value: '97%' },
                { label: 'Active Deals', value: '3' },
                { label: 'Certifications', value: '4' },
              ].map((stat) => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A2E' }}>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>{stat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
