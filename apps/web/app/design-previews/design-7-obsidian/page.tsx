// Design 7: "Obsidian" — Premium dark
// Deep slate (#1C1F26) background, warm white (#F0EDE8) text
// Rose gold (#C49A6C) accent, very premium feel
// Card-based layout with subtle border-only cards
'use client'

import { useState } from 'react'

export default function ObsidianDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"DM Sans", "Inter", system-ui, sans-serif', background: '#1C1F26', color: '#F0EDE8', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? '#C49A6C' : '#2A2D36', color: activeTab === 'landing' ? '#1C1F26' : '#F0EDE8' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? '#C49A6C' : '#2A2D36', color: activeTab === 'dashboard' ? '#1C1F26' : '#F0EDE8' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <ObsidianLanding /> : <ObsidianDashboard />}
    </div>
  )
}

function ObsidianLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C49A6C' }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' }}>Obsidian</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#" style={{ color: '#8A8D94', textDecoration: 'none', fontSize: 14 }}>Platform</a>
          <a href="#" style={{ color: '#8A8D94', textDecoration: 'none', fontSize: 14 }}>Security</a>
          <button style={{ padding: '10px 28px', borderRadius: 8, border: '1px solid #C49A6C', background: 'transparent', color: '#C49A6C', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Sign In</button>
          <button style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#C49A6C', color: '#1C1F26', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Join</button>
        </div>
      </nav>

      <section style={{ padding: '120px 64px 100px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,108,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 13, color: '#C49A6C', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 32, fontWeight: 500 }}>Premium Security Marketplace</div>
        <h1 style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, marginBottom: 28, letterSpacing: -1, maxWidth: 780, margin: '0 auto 28px' }}>
          Where elite security<br />meets <span style={{ color: '#C49A6C' }}>absolute privacy</span>
        </h1>
        <p style={{ fontSize: 18, color: '#8A8D94', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>
          An exclusive platform for organizations and cybersecurity professionals who value discretion above all else.
        </p>
        <button style={{ padding: '16px 48px', borderRadius: 12, border: 'none', background: '#C49A6C', color: '#1C1F26', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Request Access</button>
      </section>

      <section style={{ padding: '80px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { title: 'Anonymous Identity', desc: 'Generated aliases protect your real identity throughout the entire engagement lifecycle.', metric: 'Zero PII exposure' },
            { title: 'Military-Grade Encryption', desc: 'NaCl box encryption ensures messages exist only between sender and receiver.', metric: 'E2E encrypted' },
            { title: 'Behavioral Trust', desc: 'Scores computed from verified actions — deal completion, certifications, responsiveness.', metric: '100% transparent' },
          ].map((item) => (
            <div key={item.title} style={{ padding: 32, borderRadius: 16, border: '1px solid #2A2D36' }}>
              <div style={{ fontSize: 12, color: '#C49A6C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>{item.metric}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: '#8A8D94', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid #2A2D36' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 40, fontWeight: 600, marginBottom: 16, letterSpacing: -0.5 }}>The Process</h2>
          <p style={{ color: '#8A8D94', fontSize: 16 }}>From anonymous signup to completed engagement</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { step: '01', title: 'Register', desc: 'Email only. Alias generated.' },
            { step: '02', title: 'Verify', desc: 'Upload certifications.' },
            { step: '03', title: 'Engage', desc: 'Encrypted negotiations.' },
            { step: '04', title: 'Deliver', desc: 'Escrowed completion.' },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 200, color: '#C49A6C', marginBottom: 16, fontFamily: '"DM Sans"' }}>{item.step}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#8A8D94' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function ObsidianDashboard() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <div>
          <div style={{ fontSize: 13, color: '#8A8D94', marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>
            <span style={{ fontFamily: 'monospace', color: '#C49A6C' }}>Vendor-K7f3</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Overview', 'Deals', 'Messages', 'Certs'].map((tab, i) => (
            <span key={tab} style={{ fontSize: 14, color: i === 0 ? '#C49A6C' : '#8A8D94', fontWeight: i === 0 ? 600 : 400, cursor: 'pointer', borderBottom: i === 0 ? '2px solid #C49A6C' : 'none', paddingBottom: 4 }}>{tab}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Trust Score', value: '78', suffix: '', highlight: true },
          { label: 'Active', value: '3', suffix: 'deals' },
          { label: 'Completed', value: '14', suffix: 'deals' },
          { label: 'Response', value: '97', suffix: '%' },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: 24, borderRadius: 16, border: stat.highlight ? '1px solid #C49A6C' : '1px solid #2A2D36' }}>
            <div style={{ fontSize: 12, color: '#8A8D94', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.highlight ? '#C49A6C' : '#F0EDE8' }}>
              {stat.value}<span style={{ fontSize: 16, color: '#8A8D94', fontWeight: 400, marginLeft: 4 }}>{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#C49A6C' }}>Active Engagements</h2>
      {[
        { buyer: 'Buyer-M2x9', service: 'Penetration Testing', status: 'In Progress', amount: '$12,000' },
        { buyer: 'Buyer-R4t6', service: 'Cloud Security Audit', status: 'Negotiating', amount: '$8,500' },
        { buyer: 'Buyer-J8n2', service: 'GDPR Assessment', status: 'Review', amount: '$15,000' },
      ].map((deal) => (
        <div key={deal.buyer} style={{ padding: 20, borderRadius: 12, border: '1px solid #2A2D36', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#C49A6C', marginRight: 12 }}>{deal.buyer}</span>
            <span style={{ fontSize: 15 }}>{deal.service}</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#8A8D94' }}>{deal.status}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#C49A6C' }}>{deal.amount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
