// Design 9: "Aurora" — Gradient-rich, futuristic
// Dark base (#0B0F1A) with vibrant aurora gradients (purple → teal → pink)
// Glassmorphism cards, blur effects
// Bold, large headings with gradient text
'use client'

import { useState } from 'react'

export default function AuroraDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"Outfit", "Inter", system-ui, sans-serif', background: '#0B0F1A', color: '#E2E8F0', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)' : '#1E293B', color: '#fff', backgroundImage: activeTab === 'landing' ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)' : 'none' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)' : '#1E293B', color: '#fff', backgroundImage: activeTab === 'dashboard' ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)' : 'none' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <AuroraLanding /> : <AuroraDashboard />}
    </div>
  )
}

function AuroraLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, backgroundImage: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>A</div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Aurora</span>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Features</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Security</a>
          <button style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#E2E8F0', cursor: 'pointer', fontSize: 14 }}>Sign In</button>
          <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', backgroundImage: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Get Started</button>
        </div>
      </nav>

      <section style={{ padding: '120px 48px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Aurora glow effect */}
        <div style={{ position: 'absolute', top: -100, left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: 0, right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
        
        <div style={{ fontSize: 13, color: '#8B5CF6', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>Next-Gen Security Marketplace</div>
        <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 28, maxWidth: 800, margin: '0 auto 28px', backgroundImage: 'linear-gradient(135deg, #E2E8F0 0%, #8B5CF6 50%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Anonymous Security. Limitless Trust.
        </h1>
        <p style={{ fontSize: 20, color: '#64748B', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
          The future of cybersecurity procurement. Anonymous identities, encrypted communications, and behavioral trust — all in one platform.
        </p>
        <button style={{ padding: '16px 48px', borderRadius: 14, border: 'none', backgroundImage: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 60px rgba(139,92,246,0.3)' }}>Launch Platform →</button>
      </section>

      <section style={{ padding: '0 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { title: 'Zero-Knowledge Aliases', desc: 'Cryptographic aliases protect you. No PII stored or transmitted.', color: '#8B5CF6' },
            { title: 'E2E Encryption', desc: 'NaCl box encryption. Your messages exist only between you and the recipient.', color: '#06B6D4' },
            { title: 'Behavioral Trust', desc: 'Machine-computed scores based on actions, not claims. Transparent and fair.', color: '#EC4899' },
          ].map((item) => (
            <div key={item.title} style={{ padding: 32, borderRadius: 20, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.2)', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, marginBottom: 20, boxShadow: `0 0 12px ${item.color}80` }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 48px', borderTop: '1px solid rgba(100,116,139,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          {[
            { value: '500+', label: 'Vendors', color: '#8B5CF6' },
            { value: '2.4K', label: 'Deals', color: '#06B6D4' },
            { value: '100%', label: 'Encrypted', color: '#EC4899' },
            { value: '0', label: 'Breaches', color: '#10B981' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: 40, fontWeight: 800, color: stat.color, marginBottom: 4, textShadow: `0 0 20px ${stat.color}40` }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function AuroraDashboard() {
  return (
    <div style={{ padding: '32px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, backgroundImage: 'linear-gradient(135deg, #E2E8F0, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dashboard</h1>
        <div style={{ padding: '8px 20px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontFamily: 'monospace', fontSize: 14, color: '#8B5CF6' }}>Vendor-K7f3</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Trust Score', value: '78', gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' },
          { label: 'Active Deals', value: '3', gradient: 'linear-gradient(135deg, #06B6D4, #10B981)' },
          { label: 'Completed', value: '14', gradient: 'linear-gradient(135deg, #10B981, #8B5CF6)' },
          { label: 'Response Rate', value: '97%', gradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)' },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: 24, borderRadius: 16, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.2)' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, backgroundImage: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Active Engagements</h2>
      {[
        { buyer: 'Buyer-M2x9', service: 'Penetration Testing', status: 'In Progress', amount: '$12,000', color: '#8B5CF6' },
        { buyer: 'Buyer-R4t6', service: 'Cloud Security Audit', status: 'Negotiating', amount: '$8,500', color: '#06B6D4' },
        { buyer: 'Buyer-J8n2', service: 'GDPR Assessment', status: 'Review', amount: '$15,000', color: '#EC4899' },
      ].map((deal) => (
        <div key={deal.buyer} style={{ padding: 20, borderRadius: 16, background: 'rgba(30,41,59,0.3)', border: '1px solid rgba(100,116,139,0.15)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: deal.color, marginBottom: 4 }}>{deal.buyer}</div>
            <div style={{ fontSize: 15 }}>{deal.service}</div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ padding: '4px 14px', borderRadius: 999, background: `${deal.color}15`, color: deal.color, fontSize: 12, fontWeight: 600 }}>{deal.status}</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{deal.amount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
