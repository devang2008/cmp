// Design 2: "Vault" — Corporate trust
// Pure white background, navy (#1E3A5F) primary, gold (#D4A843) accents
// Classic serif headings, clean sans body text
// Left sidebar navigation with icons + labels
// Conservative, formal — feels like a financial institution
'use client'

import { useState } from 'react'

export default function VaultDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', background: '#FFFFFF', color: '#1E3A5F', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'landing' ? '#1E3A5F' : '#F1F5F9', color: activeTab === 'landing' ? '#fff' : '#1E3A5F' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === 'dashboard' ? '#1E3A5F' : '#F1F5F9', color: activeTab === 'dashboard' ? '#fff' : '#1E3A5F' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <VaultLanding /> : <VaultDashboard />}
    </div>
  )
}

function VaultLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 64px', borderBottom: '2px solid #1E3A5F' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#D4A843', fontFamily: 'Georgia' }}>V</div>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#1E3A5F' }}>Vault</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
          <a href="#" style={{ color: '#4A6785', textDecoration: 'none', fontSize: 14 }}>Services</a>
          <a href="#" style={{ color: '#4A6785', textDecoration: 'none', fontSize: 14 }}>Trust Framework</a>
          <button style={{ padding: '10px 28px', borderRadius: 4, border: '2px solid #1E3A5F', background: 'transparent', color: '#1E3A5F', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Sign In</button>
          <button style={{ padding: '10px 28px', borderRadius: 4, border: 'none', background: '#1E3A5F', color: '#D4A843', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Open Account</button>
        </div>
      </nav>

      <section style={{ padding: '100px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#D4A843', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>Established Trust Protocol</div>
          <h1 style={{ fontSize: 52, fontWeight: 400, lineHeight: 1.2, marginBottom: 24, color: '#1E3A5F' }}>
            Secure Cybersecurity <span style={{ fontStyle: 'italic', color: '#D4A843' }}>Partnerships</span>
          </h1>
          <p style={{ fontSize: 17, color: '#4A6785', lineHeight: 1.8, marginBottom: 40, fontFamily: 'Inter, sans-serif', maxWidth: 500 }}>
            A trusted marketplace where organizations procure cybersecurity services with complete discretion. Identity-protected. Compliance-ready.
          </p>
          <button style={{ padding: '16px 48px', borderRadius: 4, border: 'none', background: '#1E3A5F', color: '#D4A843', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Begin Confidential Inquiry →</button>
        </div>
        <div style={{ background: '#F8FAFC', borderRadius: 4, border: '2px solid #E2E8F0', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#4A6785', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Platform Credentials</div>
          {[
            { value: 'ISO 27001', desc: 'Certified Infrastructure' },
            { value: 'SOC 2', desc: 'Type II Compliant' },
            { value: 'AES-256', desc: 'Message Encryption' },
            { value: 'Zero-Trust', desc: 'Architecture' },
          ].map((item) => (
            <div key={item.value} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #E2E8F0', fontFamily: 'Inter, sans-serif' }}>
              <span style={{ fontWeight: 700, color: '#1E3A5F' }}>{item.value}</span>
              <span style={{ color: '#9CA3AF', fontSize: 14 }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px', background: '#1E3A5F', color: '#fff' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, marginBottom: 64, fontWeight: 400 }}>The Trust Process</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { step: 'I', title: 'Account Opening', desc: 'Register with email only. Receive a formal alias designation.' },
            { step: 'II', title: 'Service Listing', desc: 'Post requirements or offer services under complete anonymity.' },
            { step: 'III', title: 'Secure Negotiation', desc: 'Encrypted bilateral communications via the platform.' },
            { step: 'IV', title: 'Settlement', desc: 'Escrowed payment, delivery confirmation, optional disclosure.' },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 18, color: '#D4A843', fontFamily: 'Georgia' }}>{item.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, marginBottom: 16, fontWeight: 400 }}>Trusted by Enterprise</h2>
        <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: 48, fontSize: 16 }}>Fortune 500 organizations use Vault for discreet security procurement</p>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
          {['GDPR Ready', 'HIPAA Compliant', 'SOX Aware', 'PCI DSS'].map((badge) => (
            <div key={badge} style={{ padding: '16px 32px', border: '2px solid #D4A843', borderRadius: 4, color: '#D4A843', fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>{badge}</div>
          ))}
        </div>
      </section>
    </>
  )
}

function VaultDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 260, background: '#1E3A5F', color: '#fff', padding: '24px 0', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid #2A4D6E' }}>
          <div style={{ fontFamily: 'Georgia', fontSize: 20, letterSpacing: 3, marginBottom: 4 }}>VAULT</div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Secure Marketplace</div>
        </div>
        <div style={{ padding: '24px 16px' }}>
          {['Dashboard', 'Requirements', 'Active Deals', 'Messages', 'Trust Report', 'Settings'].map((item, i) => (
            <div key={item} style={{ padding: '12px 16px', borderRadius: 4, marginBottom: 4, background: i === 0 ? 'rgba(212,168,67,0.15)' : 'transparent', color: i === 0 ? '#D4A843' : '#94A3B8', fontSize: 14, fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: i === 0 ? 600 : 400 }}>{item}</div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16, padding: 16, background: '#2A4D6E', borderRadius: 4 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#D4A843', marginBottom: 4 }}>Buyer-M2x9</div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Trust Score: 82/100</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, padding: 48, width: '100%', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, alignItems: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: 'Georgia' }}>Dashboard Overview</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '8px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4, fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>Buyer-M2x9</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
          {[
            { label: 'Active Deals', value: '3', accent: false },
            { label: 'Trust Score', value: '82', accent: true },
            { label: 'Total Spent', value: '$47.5K', accent: false },
            { label: 'Pending Reviews', value: '2', accent: false },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: 24, border: stat.accent ? '2px solid #D4A843' : '1px solid #E2E8F0', borderRadius: 4, background: '#fff' }}>
              <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: stat.accent ? '#D4A843' : '#1E3A5F' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, fontFamily: 'Georgia' }}>Recent Deals</h2>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#1E3A5F' }}>Vendor</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#1E3A5F' }}>Service</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#1E3A5F' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: '#1E3A5F' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { vendor: 'Vendor-K7f3', service: 'Penetration Testing', status: 'In Progress', amount: '$12,000' },
                { vendor: 'Vendor-R8m2', service: 'Compliance Audit', status: 'Contracted', amount: '$18,500' },
                { vendor: 'Vendor-P3n7', service: 'Incident Response', status: 'Review', amount: '$25,000' },
              ].map((deal) => (
                <tr key={deal.vendor} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#1E3A5F' }}>{deal.vendor}</td>
                  <td style={{ padding: '14px 16px' }}>{deal.service}</td>
                  <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 12px', borderRadius: 4, background: '#F0FDF4', color: '#16A34A', fontSize: 12, fontWeight: 600 }}>{deal.status}</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>{deal.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
