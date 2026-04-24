// Design 8: "Fortress" — Government/enterprise
// Gray (#6B7280) + dark green (#166534), very muted palette
// Dense information layout, small text, data-table focused
// Feels like a government procurement portal
'use client'

import { useState } from 'react'

export default function FortressDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"Roboto", "Segoe UI", system-ui, sans-serif', background: '#F3F4F6', color: '#1F2937', minHeight: '100vh', fontSize: 14 }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #9CA3AF', cursor: 'pointer', fontSize: 12, background: activeTab === 'landing' ? '#166534' : '#fff', color: activeTab === 'landing' ? '#fff' : '#1F2937' }}>Landing</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #9CA3AF', cursor: 'pointer', fontSize: 12, background: activeTab === 'dashboard' ? '#166534' : '#fff', color: activeTab === 'dashboard' ? '#fff' : '#1F2937' }}>Dashboard</button>
      </div>
      {activeTab === 'landing' ? <FortressLanding /> : <FortressDashboard />}
    </div>
  )
}

function FortressLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 32px', background: '#1F2937', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>F</div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1 }}>FORTRESS</span>
          <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>Cybersecurity Procurement Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13 }}>
          <a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Platform Guide</a>
          <a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Compliance</a>
          <a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Support</a>
          <button style={{ padding: '6px 16px', background: '#166534', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Login</button>
          <button style={{ padding: '6px 16px', background: '#fff', border: 'none', color: '#1F2937', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Register</button>
        </div>
      </nav>

      <section style={{ padding: '60px 32px', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48 }}>
          <div>
            <div style={{ fontSize: 11, color: '#166534', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Authorized Cybersecurity Services Procurement</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: '#1F2937' }}>
              Secure, Anonymous Cybersecurity Service Marketplace for Enterprise & Government
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 24, maxWidth: 600 }}>
              Procure cybersecurity services under full anonymity with compliance-grade audit trails, verified vendor certifications, and end-to-end encrypted communications.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ padding: '10px 24px', background: '#166534', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Submit Requirement ▸</button>
              <button style={{ padding: '10px 24px', background: '#F3F4F6', border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: 13, color: '#4B5563' }}>Vendor Registration ▸</button>
            </div>
          </div>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: 20, fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#166534', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Platform Status</div>
            {[
              { label: 'Registered Vendors', value: '512' },
              { label: 'Active Contracts', value: '89' },
              { label: 'Completed Engagements', value: '2,417' },
              { label: 'Compliance Frameworks', value: '12' },
              { label: 'Identity Incidents', value: '0' },
              { label: 'System Uptime', value: '99.97%' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: '#6B7280' }}>{item.label}</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Procurement Process</h2>
        <p style={{ color: '#6B7280', marginBottom: 32, fontSize: 14 }}>Standardized four-phase engagement model</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { phase: 'Phase 1', title: 'Registration', desc: 'Anonymous account creation with email verification. Alias assignment via cryptographic generation.', status: 'Mandatory' },
            { phase: 'Phase 2', title: 'Requirements', desc: 'Submit detailed service requirements or register vendor capabilities for marketplace listing.', status: 'Required' },
            { phase: 'Phase 3', title: 'Selection', desc: 'Review proposals, negotiate terms via E2E encrypted channel. Trust scores inform selection.', status: 'Interactive' },
            { phase: 'Phase 4', title: 'Delivery', desc: 'Execute contract, escrow payment, deliver services, optional identity disclosure on completion.', status: 'Audited' },
          ].map((item) => (
            <div key={item.phase} style={{ background: '#fff', border: '1px solid #E5E7EB', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>{item.phase}</span>
                <span style={{ fontSize: 10, padding: '2px 8px', background: '#F0FDF4', color: '#166534', fontWeight: 600 }}>{item.status}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function FortressDashboard() {
  return (
    <div style={{ padding: '16px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ background: '#1F2937', color: '#fff', padding: '12px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>FORTRESS</span>
          <span style={{ color: '#9CA3AF', fontSize: 12 }}>|</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Buyer Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12 }}>
          <span style={{ fontFamily: 'monospace', color: '#22C55E' }}>Buyer-M2x9</span>
          <span style={{ color: '#9CA3AF' }}>Trust: 82</span>
          <span style={{ color: '#9CA3AF' }}>|</span>
          <span style={{ color: '#D1D5DB', cursor: 'pointer' }}>Logout</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active Contracts', value: '3' },
          { label: 'Pending Proposals', value: '7' },
          { label: 'Completed', value: '14' },
          { label: 'Total Spend', value: '$142.5K' },
          { label: 'Trust Score', value: '82/100' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <div style={{ padding: '12px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Contract Registry</span>
          <span style={{ fontSize: 12, color: '#166534', cursor: 'pointer' }}>+ New Requirement</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['CONTRACT ID', 'VENDOR', 'SERVICE', 'STATUS', 'VALUE', 'TRUST', 'DEADLINE'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'CTR-001', vendor: 'Vendor-K7f3', service: 'Penetration Test', status: 'Active', value: '$12,000', trust: '78', deadline: '2026-05-15' },
              { id: 'CTR-002', vendor: 'Vendor-R8m2', service: 'Compliance Audit', status: 'Pending', value: '$18,500', trust: '85', deadline: '2026-06-01' },
              { id: 'CTR-003', vendor: 'Vendor-P3n7', service: 'Incident Response', status: 'Review', value: '$25,000', trust: '92', deadline: '2026-04-30' },
              { id: 'CTR-004', vendor: '—', service: 'Cloud Security', status: 'Open', value: '$15,000', trust: '—', deadline: '2026-07-01' },
            ].map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{row.id}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#166534' }}>{row.vendor}</td>
                <td style={{ padding: '10px 12px' }}>{row.service}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: row.status === 'Active' ? '#F0FDF4' : row.status === 'Pending' ? '#FEF9C3' : row.status === 'Review' ? '#EFF6FF' : '#F3F4F6', color: row.status === 'Active' ? '#166534' : row.status === 'Pending' ? '#A16207' : row.status === 'Review' ? '#1D4ED8' : '#6B7280' }}>{row.status}</span></td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{row.value}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{row.trust}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>{row.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
