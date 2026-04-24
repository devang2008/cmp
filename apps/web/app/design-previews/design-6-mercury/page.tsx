// Design 6: "Mercury" — Modern SaaS
// White + light gray (#F1F5F9), purple (#7C3AED) accent
// Completely flat design, no gradients
// Familiar and approachable, similar to Notion/Linear aesthetic
'use client'

import { useState } from 'react'

export default function MercuryDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', background: '#FFFFFF', color: '#0F172A', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? '#7C3AED' : '#F1F5F9', color: activeTab === 'landing' ? '#fff' : '#0F172A' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? '#7C3AED' : '#F1F5F9', color: activeTab === 'dashboard' ? '#fff' : '#0F172A' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <MercuryLanding /> : <MercuryDashboard />}
    </div>
  )
}

function MercuryLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', background: '#fff', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800 }}>M</div>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Mercury</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Features</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Pricing</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: 14 }}>Docs</a>
          <button style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Log in</button>
          <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#7C3AED', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Sign up</button>
        </div>
      </nav>

      <section style={{ padding: '100px 48px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '6px 16px', background: '#F5F3FF', borderRadius: 999, fontSize: 13, color: '#7C3AED', fontWeight: 500, marginBottom: 24 }}>✦ Now in public beta</div>
        <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, marginBottom: 24, letterSpacing: -1, maxWidth: 720, margin: '0 auto 24px' }}>
          The anonymous marketplace for cybersecurity
        </h1>
        <p style={{ fontSize: 18, color: '#64748B', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Connect with security professionals under complete anonymity. E2E encrypted. Trust-scored. Identity-protected.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: '#7C3AED', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Get started free →</button>
          <button style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 15, cursor: 'pointer', color: '#64748B' }}>See how it works</button>
        </div>
      </section>

      <section style={{ padding: '0 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {[
            { title: 'Anonymous by design', desc: 'Generated aliases keep your identity private through the entire deal lifecycle.', icon: '👤' },
            { title: 'End-to-end encrypted', desc: 'NaCl encryption means messages are cryptographically secure. Server never sees plaintext.', icon: '🔐' },
            { title: 'Behavioral trust', desc: 'Trust scores computed from deal completion, response times, and verified certifications.', icon: '📊' },
          ].map((item) => (
            <div key={item.title} style={{ padding: 32, borderRadius: 16, border: '1px solid #F1F5F9', background: '#FAFAFA' }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 48px', background: '#FAFAFA', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>Simple. Secure. Fast.</h2>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7, marginBottom: 48 }}>Four steps from anonymous signup to completed deal.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { step: '1', title: 'Sign up', desc: 'Email only. Get your alias.' },
            { step: '2', title: 'Post or browse', desc: 'List needs or offer services.' },
            { step: '3', title: 'Negotiate securely', desc: 'Encrypted messaging.' },
            { step: '4', title: 'Complete deal', desc: 'Escrow, deliver, review.' },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, margin: '0 auto 16px' }}>{item.step}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#94A3B8' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function MercuryDashboard() {
  return (
    <div style={{ padding: '24px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800 }}>M</div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Mercury</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Dashboard', 'Deals', 'Messages', 'Certifications'].map((item, i) => (
            <span key={item} style={{ fontSize: 14, color: i === 0 ? '#7C3AED' : '#64748B', fontWeight: i === 0 ? 600 : 400, cursor: 'pointer' }}>{item}</span>
          ))}
          <div style={{ padding: '6px 14px', background: '#F5F3FF', borderRadius: 8, fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>Vendor-K7f3</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Good evening, <span style={{ color: '#7C3AED' }}>Vendor-K7f3</span></h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Trust Score', value: '78', suffix: '/100' },
              { label: 'Active Deals', value: '3', suffix: '' },
              { label: 'Completed', value: '14', suffix: '' },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: 20, borderRadius: 12, background: '#FAFAFA', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{stat.value}<span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 400 }}>{stat.suffix}</span></div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Active deals</h2>
          {[
            { buyer: 'Buyer-M2x9', title: 'Penetration Testing for Web App', status: 'In Progress', amount: '$12,000' },
            { buyer: 'Buyer-R4t6', title: 'Cloud Security Audit', status: 'Negotiating', amount: '$8,500' },
          ].map((deal) => (
            <div key={deal.buyer} style={{ padding: 16, borderRadius: 12, border: '1px solid #F1F5F9', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#7C3AED', fontWeight: 500, marginBottom: 2 }}>{deal.buyer}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{deal.title}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#64748B' }}>{deal.status}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{deal.amount}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ padding: 24, borderRadius: 16, background: '#FAFAFA', border: '1px solid #F1F5F9', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Trust Score</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: '#7C3AED' }}>78</div>
            <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, marginTop: 12 }}>
              <div style={{ width: '78%', height: '100%', background: '#7C3AED', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>Good standing</div>
          </div>
          <div style={{ padding: 20, borderRadius: 12, background: '#FAFAFA', border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Quick stats</div>
            {[
              { label: 'Response Rate', value: '97%' },
              { label: 'Avg Delivery', value: '3.2 weeks' },
              { label: 'Certifications', value: '4 verified' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 14 }}>
                <span style={{ color: '#64748B' }}>{stat.label}</span>
                <span style={{ fontWeight: 600 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
