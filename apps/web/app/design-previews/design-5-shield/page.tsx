// Design 5: "Shield" — Security-first
// Slate blue (#334155) primary, clean white content areas
// Shield iconography throughout, badge-heavy design
// Three-column layout: sidebar + main + context panel
'use client'

import { useState } from 'react'

export default function ShieldDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', background: '#F8FAFC', color: '#1E293B', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? '#334155' : '#E2E8F0', color: activeTab === 'landing' ? '#fff' : '#334155' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? '#334155' : '#E2E8F0', color: activeTab === 'dashboard' ? '#fff' : '#334155' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <ShieldLanding /> : <ShieldDashboard />}
    </div>
  )
}

function ShieldLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#334155', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>🛡</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#334155' }}>Shield</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Platform</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Certifications</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Trust</a>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#334155', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Get Protected</button>
        </div>
      </nav>

      <section style={{ padding: '80px 48px', background: '#334155', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 999, fontSize: 13, marginBottom: 24, gap: 8, alignItems: 'center' }}>🛡 Security-First Platform</div>
            <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
              Cybersecurity services with{' '}
              <span style={{ color: '#38BDF8' }}>verified trust</span>
            </h1>
            <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, marginBottom: 40 }}>
              Every vendor is certified. Every interaction is encrypted. Every deal is tracked. Shield brings compliance-grade security to the marketplace.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ padding: '14px 32px', borderRadius: 8, border: 'none', background: '#38BDF8', color: '#0F172A', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Start as Buyer</button>
              <button style={{ padding: '14px 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Join as Vendor</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: '🔒', title: 'E2E Encrypted', desc: 'NaCl box encryption' },
              { icon: '✅', title: 'Cert Verified', desc: 'OSCP, CEH, CISSP...' },
              { icon: '📊', title: 'Trust Scored', desc: 'Behavioral analytics' },
              { icon: '🔍', title: 'Audit Logged', desc: 'Immutable trail' },
            ].map((item) => (
              <div key={item.title} style={{ padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>How Shield Protects You</h2>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: 64, fontSize: 16 }}>A four-step process designed for maximum security and trust</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { step: 1, title: 'Anonymous Signup', desc: 'Email-only registration with generated alias', badge: 'Zero PII' },
            { step: 2, title: 'Cert Verification', desc: 'Upload & verify professional certifications', badge: 'Verified' },
            { step: 3, title: 'Secure Matching', desc: 'AI-powered matching under full anonymity', badge: 'E2E' },
            { step: 4, title: 'Escrowed Delivery', desc: 'Payment held until service confirmed', badge: 'Protected' },
          ].map((item) => (
            <div key={item.step} style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', background: '#F0F9FF', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#0284C7' }}>{item.badge}</div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{item.step}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 48px', background: '#fff', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Supported Certifications</h3>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['OSCP', 'CEH', 'CISSP', 'CISM', 'ISO 27001', 'CompTIA Security+', 'GPEN', 'GWAPT', 'eJPT'].map((cert) => (
              <div key={cert} style={{ padding: '10px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#16A34A' }}>✓ {cert}</div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function ShieldDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', minHeight: '100vh' }}>
      {/* Left sidebar */}
      <div style={{ background: '#fff', borderRight: '1px solid #E2E8F0', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, padding: '0 8px' }}>
          <span style={{ fontSize: 20 }}>🛡</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Shield</span>
        </div>
        {['Dashboard', 'Requirements', 'Deals', 'Messages', 'Certifications', 'Trust Report', 'Settings'].map((item, i) => (
          <div key={item} style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 2, background: i === 0 ? '#F0F9FF' : 'transparent', color: i === 0 ? '#0284C7' : '#64748B', fontSize: 14, fontWeight: i === 0 ? 600 : 400, cursor: 'pointer' }}>{item}</div>
        ))}
      </div>

      {/* Main */}
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
          <div style={{ padding: '8px 16px', background: '#334155', borderRadius: 8, color: '#fff', fontFamily: 'monospace', fontSize: 14, fontWeight: 600 }}>Buyer-M2x9</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Active Deals', value: '3', color: '#0284C7' },
            { label: 'Pending Proposals', value: '7', color: '#D97706' },
            { label: 'Completed', value: '14', color: '#16A34A' },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Active Deals</h2>
        {[
          { vendor: 'Vendor-K7f3', service: 'Penetration Testing', status: 'In Progress', badge: 'OSCP', price: '$12,000' },
          { vendor: 'Vendor-R8m2', service: 'Compliance Audit', status: 'Contracted', badge: 'CISSP', price: '$18,500' },
        ].map((deal) => (
          <div key={deal.vendor} style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#334155', fontWeight: 600 }}>{deal.vendor}</span>
                <span style={{ padding: '2px 8px', background: '#F0FDF4', borderRadius: 4, fontSize: 11, color: '#16A34A', fontWeight: 600 }}>✓ {deal.badge}</span>
              </div>
              <div style={{ fontSize: 15 }}>{deal.service}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#0284C7', fontWeight: 600 }}>{deal.status}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{deal.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ background: '#fff', borderLeft: '1px solid #E2E8F0', padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Trust Score</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#334155' }}>82</div>
          <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, marginTop: 8 }}>
            <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #38BDF8, #334155)', borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#334155' }}>Certifications Verified</div>
        {['OSCP', 'CEH', 'CISSP'].map((cert) => (
          <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#16A34A' }}>✓</span>
            <span style={{ fontSize: 14 }}>{cert}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
