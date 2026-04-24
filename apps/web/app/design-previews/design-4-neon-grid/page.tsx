// Design 4: "Neon Grid" — Tech aggressive
// Dark (#0A0A0F) background, cyan (#00D4FF) + lime (#A3FF5F) neons
// Grid-based layout with visible grid lines as decoration
// Monospace everything, terminal-inspired
'use client'

import { useState } from 'react'

export default function NeonGridDesign() {
  const [activeTab, setActiveTab] = useState('landing')
  return (
    <div style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', background: '#0A0A0F', color: '#E0E0E0', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('landing')} style={{ padding: '8px 16px', borderRadius: 0, border: '1px solid #00D4FF', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', background: activeTab === 'landing' ? '#00D4FF' : 'transparent', color: activeTab === 'landing' ? '#0A0A0F' : '#00D4FF' }}>LANDING</button>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', borderRadius: 0, border: '1px solid #A3FF5F', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', background: activeTab === 'dashboard' ? '#A3FF5F' : 'transparent', color: activeTab === 'dashboard' ? '#0A0A0F' : '#A3FF5F' }}>DASHBOARD</button>
      </div>
      {activeTab === 'landing' ? <NeonLanding /> : <NeonDashboard />}
    </div>
  )
}

function NeonLanding() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #1A1A2F' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#00D4FF', fontSize: 20, fontWeight: 700 }}>[</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: '#A3FF5F' }}>NEON//GRID</span>
          <span style={{ color: '#00D4FF', fontSize: 20, fontWeight: 700 }}>]</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 13 }}>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>&gt; PROTOCOL</a>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>&gt; TRUST_MATRIX</a>
          <button style={{ padding: '8px 20px', border: '1px solid #A3FF5F', background: 'transparent', color: '#A3FF5F', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>LOGIN_</button>
          <button style={{ padding: '8px 20px', border: 'none', background: '#A3FF5F', color: '#0A0A0F', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>INIT_</button>
        </div>
      </nav>

      <section style={{ padding: '120px 48px 80px', position: 'relative', backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <div style={{ fontSize: 11, color: '#00D4FF', marginBottom: 20 }}>$ system.init --anonymous --encrypted</div>
        <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, marginBottom: 32, maxWidth: 800 }}>
          <span style={{ color: '#00D4FF' }}>ANONYMOUS</span>{' '}
          <span style={{ color: '#E0E0E0' }}>CYBERSEC</span><br />
          <span style={{ color: '#A3FF5F' }}>MARKETPLACE</span>
          <span style={{ color: '#333', marginLeft: 4 }}>_</span>
        </h1>
        <p style={{ fontSize: 15, color: '#666', maxWidth: 560, lineHeight: 1.8, marginBottom: 40 }}>
          &gt; Zero-knowledge broker for cybersecurity services.<br />
          &gt; E2E encrypted communications.<br />
          &gt; Trust computed from behavior, not identity.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ padding: '14px 32px', border: 'none', background: '#00D4FF', color: '#0A0A0F', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>&gt; START_SESSION</button>
          <button style={{ padding: '14px 32px', border: '1px solid #333', background: 'transparent', color: '#666', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>&gt; VIEW_DOCS</button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #1A1A2F' }}>
        {[
          { value: '512', label: 'ACTIVE_NODES', color: '#00D4FF' },
          { value: '2.4K', label: 'DEALS_CLOSED', color: '#A3FF5F' },
          { value: '256bit', label: 'ENCRYPTION', color: '#00D4FF' },
          { value: '0x00', label: 'LEAKS_FOUND', color: '#A3FF5F' },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: 32, borderRight: '1px solid #1A1A2F', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginBottom: 8, textShadow: `0 0 20px ${stat.color}40` }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#444', letterSpacing: 2 }}>{stat.label}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: '80px 48px', backgroundImage: 'linear-gradient(rgba(163,255,95,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,95,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <div style={{ fontSize: 11, color: '#A3FF5F', marginBottom: 40 }}>$ protocol.describe()</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { cmd: 'ALIAS_GEN', desc: 'Cryptographic alias generation. No PII in system.', icon: '◈' },
            { cmd: 'E2E_CRYPT', desc: 'NaCl box encryption. Server is zero-knowledge.', icon: '◇' },
            { cmd: 'TRUST_CALC', desc: 'Behavioral scoring. Deals, certs, response time.', icon: '◆' },
            { cmd: 'REVEAL_OPT', desc: 'Mutual consent identity disclosure on close.', icon: '◉' },
          ].map((item) => (
            <div key={item.cmd} style={{ padding: 24, border: '1px solid #1A1A2F', position: 'relative' }}>
              <div style={{ fontSize: 24, color: '#00D4FF', marginBottom: 16, textShadow: '0 0 10px rgba(0,212,255,0.3)' }}>{item.icon}</div>
              <div style={{ fontSize: 13, color: '#A3FF5F', marginBottom: 8, fontWeight: 700 }}>$ {item.cmd}</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function NeonDashboard() {
  return (
    <div style={{ padding: '24px 48px', backgroundImage: 'linear-gradient(rgba(0,212,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid #1A1A2F' }}>
        <div style={{ fontSize: 14, color: '#444' }}>$ dashboard --user <span style={{ color: '#A3FF5F' }}>Vendor-K7f3</span></div>
        <div style={{ fontSize: 14, color: '#00D4FF' }}>TRUST: 78 | ACTIVE: 3 | CERTS: 4</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ padding: 24, border: '1px solid #1A1A2F' }}>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 12 }}>TRUST_SCORE</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#A3FF5F', textShadow: '0 0 20px rgba(163,255,95,0.3)' }}>78</div>
          <div style={{ marginTop: 12, height: 4, background: '#1A1A2F', borderRadius: 2 }}>
            <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #00D4FF, #A3FF5F)', borderRadius: 2, boxShadow: '0 0 8px rgba(163,255,95,0.4)' }} />
          </div>
        </div>
        <div style={{ padding: 24, border: '1px solid #1A1A2F' }}>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 12 }}>RESPONSE_RATE</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#00D4FF' }}>97<span style={{ fontSize: 20, color: '#444' }}>%</span></div>
        </div>
        <div style={{ padding: 24, border: '1px solid #1A1A2F' }}>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 12 }}>DEALS_COMPLETE</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#E0E0E0' }}>14</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#A3FF5F', marginBottom: 16 }}>$ deals.list --status active</div>
      <div style={{ border: '1px solid #1A1A2F' }}>
        {[
          { alias: 'Buyer-M2x9', service: 'pentest.web_app', status: 'IN_PROG', price: '12000', color: '#A3FF5F' },
          { alias: 'Buyer-R4t6', service: 'audit.cloud_sec', status: 'NEGOT', price: '8500', color: '#00D4FF' },
          { alias: 'Buyer-J8n2', service: 'comply.gdpr', status: 'REVIEW', price: '15000', color: '#FFD700' },
        ].map((deal, i) => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid #1A1A2F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <span style={{ color: '#444' }}>{`[${i}]`}</span>
              <span style={{ color: '#00D4FF', fontSize: 13 }}>{deal.alias}</span>
              <span style={{ color: '#666', fontSize: 13 }}>{deal.service}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ color: deal.color, fontSize: 12 }}>{deal.status}</span>
              <span style={{ color: '#A3FF5F', fontSize: 13 }}>${deal.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
