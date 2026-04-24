// Design 3: "Ghost" — Minimalist anonymity
// Off-white (#F7F7F5) background, charcoal (#2C2C2A) text, zero color
// Ultra-minimal typography, large whitespace
// Hidden navigation (hamburger), focus on content
// Anonymity represented through blurred/masked UI elements
'use client'

import { useState } from 'react'

export default function GhostDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', background: '#F7F7F5', color: '#2C2C2A', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #D4D4D0', cursor: 'pointer', fontSize: 13, background: activeTab === 'landing' ? '#2C2C2A' : '#F7F7F5', color: activeTab === 'landing' ? '#F7F7F5' : '#2C2C2A' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #D4D4D0', cursor: 'pointer', fontSize: 13, background: activeTab === 'dashboard' ? '#2C2C2A' : '#F7F7F5', color: activeTab === 'dashboard' ? '#F7F7F5' : '#2C2C2A' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <GhostLanding /> : <GhostDashboard />}
    </div>
  )
}

function GhostLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 64px' }}>
        <span style={{ fontSize: 16, fontWeight: 300, letterSpacing: 8, textTransform: 'uppercase' }}>Ghost</span>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a href="#" style={{ color: '#8A8A86', textDecoration: 'none', fontSize: 14, fontWeight: 300 }}>About</a>
          <a href="#" style={{ color: '#8A8A86', textDecoration: 'none', fontSize: 14, fontWeight: 300 }}>How</a>
          <a href="#" style={{ color: '#2C2C2A', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Enter →</a>
        </div>
      </nav>

      <section style={{ padding: '160px 64px 120px', maxWidth: 800 }}>
        <h1 style={{ fontSize: 72, fontWeight: 200, lineHeight: 1.05, marginBottom: 40, letterSpacing: -2 }}>
          Anonymous<br />cybersecurity<br />marketplace.
        </h1>
        <p style={{ fontSize: 18, color: '#8A8A86', lineHeight: 1.8, maxWidth: 480, fontWeight: 300, marginBottom: 48 }}>
          Your identity is yours. Trade cybersecurity services without revealing who you are. No names. No logos. Just trust scores.
        </p>
        <button style={{ padding: '14px 40px', border: '1px solid #2C2C2A', background: 'transparent', color: '#2C2C2A', fontSize: 14, fontWeight: 400, cursor: 'pointer', letterSpacing: 2 }}>Begin →</button>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid #E5E5E0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 80, maxWidth: 1000 }}>
          {[
            { num: '01', title: 'Anonymous by default', desc: 'Every interaction happens under a generated alias. No personal data exchanged.' },
            { num: '02', title: 'Encrypted always', desc: 'Client-side encryption means even we cannot read your messages.' },
            { num: '03', title: 'Trust, not identity', desc: 'Behavioral scoring replaces identity-based reputation.' },
          ].map((item) => (
            <div key={item.num}>
              <div style={{ fontSize: 12, color: '#BFBFBA', marginBottom: 16, fontWeight: 300 }}>{item.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#8A8A86', lineHeight: 1.8, fontWeight: 300 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid #E5E5E0' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 36, fontWeight: 200, marginBottom: 20, letterSpacing: -1 }}>Trust is earned.</h2>
            <p style={{ fontSize: 16, color: '#8A8A86', lineHeight: 1.8, fontWeight: 300 }}>Every completed deal, every fast response, every verified certification contributes to your trust score. No shortcuts.</p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['E2E Encryption', 'RLS Protection', 'Zero Knowledge', 'Audit Trail'].map((item) => (
              <div key={item} style={{ padding: '12px 20px', border: '1px solid #D4D4D0', fontSize: 13, fontWeight: 300, color: '#8A8A86' }}>{item}</div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function GhostDashboard() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64, paddingBottom: 24, borderBottom: '1px solid #E5E5E0' }}>
        <span style={{ fontSize: 14, fontWeight: 300, letterSpacing: 6, textTransform: 'uppercase', color: '#BFBFBA' }}>Ghost</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 300, color: '#8A8A86' }}>Vendor-K7f3</span>
          <span style={{ fontSize: 14, color: '#2C2C2A' }}>78</span>
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 12, color: '#BFBFBA', marginBottom: 8, fontWeight: 300, letterSpacing: 2 }}>TRUST</div>
        <div style={{ fontSize: 64, fontWeight: 200, letterSpacing: -3 }}>78<span style={{ fontSize: 24, color: '#BFBFBA' }}>/100</span></div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 12, color: '#BFBFBA', marginBottom: 24, fontWeight: 300, letterSpacing: 2 }}>ACTIVE</div>
        {[
          { alias: 'Buyer-M2x9', title: 'Penetration test for web application', status: 'In progress' },
          { alias: 'Buyer-R4t6', title: 'Cloud infrastructure security review', status: 'Negotiating' },
          { alias: 'Buyer-J8n2', title: 'GDPR compliance assessment', status: 'Review' },
        ].map((deal, i) => (
          <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid #E5E5E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: '#BFBFBA', marginBottom: 4, fontWeight: 300 }}>{deal.alias}</div>
              <div style={{ fontSize: 16, fontWeight: 300 }}>{deal.title}</div>
            </div>
            <span style={{ fontSize: 13, color: '#8A8A86', fontWeight: 300 }}>{deal.status}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 80 }}>
        <div>
          <div style={{ fontSize: 12, color: '#BFBFBA', marginBottom: 8, fontWeight: 300, letterSpacing: 2 }}>COMPLETED</div>
          <div style={{ fontSize: 32, fontWeight: 200 }}>14</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#BFBFBA', marginBottom: 8, fontWeight: 300, letterSpacing: 2 }}>RESPONSE</div>
          <div style={{ fontSize: 32, fontWeight: 200 }}>97%</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#BFBFBA', marginBottom: 8, fontWeight: 300, letterSpacing: 2 }}>CERTS</div>
          <div style={{ fontSize: 32, fontWeight: 200 }}>4</div>
        </div>
      </div>
    </div>
  )
}
