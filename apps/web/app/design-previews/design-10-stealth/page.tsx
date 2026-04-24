// Design 10: "Stealth" — Brutalist dark
// Pure black (#000000), single accent color teal (#14B8A6)
// Large bold typography, stark contrast
// Horizontal dividers as primary structure element
// No rounded corners, no cards — pure brutalist
'use client'

import { useState } from 'react'

export default function StealthDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"Instrument Sans", "Inter", system-ui, sans-serif', background: '#000000', color: '#FAFAFA', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 0, border: '1px solid #14B8A6', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? '#14B8A6' : 'transparent', color: activeTab === 'landing' ? '#000' : '#14B8A6' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 0, border: '1px solid #14B8A6', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? '#14B8A6' : 'transparent', color: activeTab === 'dashboard' ? '#000' : '#14B8A6' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <StealthLanding /> : <StealthDashboard />}
    </div>
  )
}

function StealthLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 64px', borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase' }}>Stealth</span>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Protocol</a>
          <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Trust</a>
          <button style={{ padding: '10px 28px', border: 'none', background: '#14B8A6', color: '#000', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Enter</button>
        </div>
      </nav>

      <section style={{ padding: '160px 64px 80px' }}>
        <h1 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.0, marginBottom: 40, letterSpacing: -3, maxWidth: 900 }}>
          BUY.<br />
          SELL.<br />
          <span style={{ color: '#14B8A6' }}>DISAPPEAR.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 500, lineHeight: 1.8, marginBottom: 48 }}>
          Anonymous cybersecurity marketplace. No names. No logos. No trails. Just encrypted deals between verified professionals.
        </p>
        <button style={{ padding: '16px 48px', border: 'none', background: '#14B8A6', color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 2 }}>Go Anonymous</button>
      </section>

      <section style={{ borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { value: '512', label: 'VENDORS' },
            { value: '2,417', label: 'DEALS' },
            { value: 'E2E', label: 'ENCRYPTED' },
            { value: 'ZERO', label: 'LEAKS' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ padding: '40px 32px', textAlign: 'center', borderRight: i < 3 ? '1px solid #222' : 'none' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#14B8A6', marginBottom: 8 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#555', letterSpacing: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            { title: 'ALIAS SYSTEM', desc: 'Cryptographic aliases. Zero personally identifiable information in the system. Ever.' },
            { title: 'E2E ENCRYPTION', desc: 'NaCl box encryption. Messages exist only between sender and receiver. Server is blind.' },
            { title: 'TRUST ENGINE', desc: 'Behavioral analytics compute your score. Deals completed, response time, certifications.' },
            { title: 'REVEAL PROTOCOL', desc: 'Identity disclosure is mutual and optional. Only on deal close. Only with consent.' },
          ].map((item, i) => (
            <div key={item.title} style={{ padding: '40px 32px', borderBottom: '1px solid #222', borderRight: i % 2 === 0 ? '1px solid #222' : 'none' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#14B8A6', marginBottom: 12, letterSpacing: 2 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: '#888', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function StealthDashboard() {
  return (
    <div style={{ padding: '32px 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, paddingBottom: 24, borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase' }}>Stealth</span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', color: '#14B8A6', fontSize: 14 }}>Vendor-K7f3</span>
          <span style={{ color: '#555', fontSize: 14 }}>Trust: 78</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 48, borderBottom: '1px solid #222' }}>
        {[
          { label: 'TRUST', value: '78', suffix: '/100' },
          { label: 'ACTIVE', value: '3', suffix: '' },
          { label: 'COMPLETED', value: '14', suffix: '' },
          { label: 'RESPONSE', value: '97', suffix: '%' },
        ].map((stat, i) => (
          <div key={stat.label} style={{ padding: '32px 0', borderRight: i < 3 ? '1px solid #222' : 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#555', letterSpacing: 3, marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#14B8A6' }}>{stat.value}<span style={{ fontSize: 16, color: '#555', fontWeight: 400 }}>{stat.suffix}</span></div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#555', letterSpacing: 3, marginBottom: 24 }}>ACTIVE DEALS</div>
      {[
        { buyer: 'Buyer-M2x9', service: 'PENETRATION TEST', status: 'ACTIVE', amount: '$12,000' },
        { buyer: 'Buyer-R4t6', service: 'CLOUD SECURITY', status: 'NEGOTIATING', amount: '$8,500' },
        { buyer: 'Buyer-J8n2', service: 'GDPR COMPLIANCE', status: 'REVIEW', amount: '$15,000' },
      ].map((deal) => (
        <div key={deal.buyer} style={{ padding: '20px 0', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', color: '#14B8A6', fontSize: 14 }}>{deal.buyer}</span>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>{deal.service}</span>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#555' }}>{deal.status}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#14B8A6' }}>{deal.amount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
