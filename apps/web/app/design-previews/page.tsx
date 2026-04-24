// Design Gallery — Browse all 10 design concepts
'use client'

import Link from 'next/link'

const designs = [
  {
    id: 1,
    name: 'Cipher',
    subtitle: 'Dark Professional',
    description: 'Near-black background with electric indigo accents. Monospace aliases, glowing trust rings. Feels like a security operations center.',
    palette: ['#0D0D0D', '#6366F1', '#818CF8', '#111118'],
    tags: ['Dark', 'Monospace', 'SOC-inspired'],
    path: '/design-previews/design-1-cipher',
  },
  {
    id: 2,
    name: 'Vault',
    subtitle: 'Corporate Trust',
    description: 'Clean white background, navy primary with gold accents. Serif headings, formal sidebar. Feels like a financial institution.',
    palette: ['#FFFFFF', '#1E3A5F', '#D4A843', '#F8FAFC'],
    tags: ['Light', 'Corporate', 'Formal'],
    path: '/design-previews/design-2-vault',
  },
  {
    id: 3,
    name: 'Ghost',
    subtitle: 'Minimalist Anonymity',
    description: 'Off-white background, zero color. Ultra-thin typography, massive whitespace. Anonymity as aesthetic.',
    palette: ['#F7F7F5', '#2C2C2A', '#8A8A86', '#D4D4D0'],
    tags: ['Minimal', 'Swiss', 'No Color'],
    path: '/design-previews/design-3-ghost',
  },
  {
    id: 4,
    name: 'Neon Grid',
    subtitle: 'Tech Aggressive',
    description: 'Pitch-dark base with cyan and lime neons. Grid-line backgrounds, terminal-style commands. Monospace everything.',
    palette: ['#0A0A0F', '#00D4FF', '#A3FF5F', '#1A1A2F'],
    tags: ['Dark', 'Terminal', 'Neon'],
    path: '/design-previews/design-4-neon-grid',
  },
  {
    id: 5,
    name: 'Shield',
    subtitle: 'Security-First',
    description: 'Light background, slate blue primary, sky blue accents. Badge-heavy design with three-column layout. Certification-focused.',
    palette: ['#F8FAFC', '#334155', '#38BDF8', '#16A34A'],
    tags: ['Light', 'Badges', 'Compliance'],
    path: '/design-previews/design-5-shield',
  },
  {
    id: 6,
    name: 'Mercury',
    subtitle: 'Modern SaaS',
    description: 'Clean white, purple accent. Flat design inspired by Notion and Linear. Familiar, approachable, friendly.',
    palette: ['#FFFFFF', '#7C3AED', '#F5F3FF', '#F1F5F9'],
    tags: ['Light', 'SaaS', 'Friendly'],
    path: '/design-previews/design-6-mercury',
  },
  {
    id: 7,
    name: 'Obsidian',
    subtitle: 'Premium Dark',
    description: 'Deep slate background with rose gold accents. Elegant typography, border-only cards. Very premium feel.',
    palette: ['#1C1F26', '#C49A6C', '#F0EDE8', '#2A2D36'],
    tags: ['Dark', 'Premium', 'Elegant'],
    path: '/design-previews/design-7-obsidian',
  },
  {
    id: 8,
    name: 'Fortress',
    subtitle: 'Government/Enterprise',
    description: 'Muted gray, dark green accent. Dense data tables, small text, phase-based layout. Government procurement portal aesthetic.',
    palette: ['#F3F4F6', '#1F2937', '#166534', '#E5E7EB'],
    tags: ['Light', 'Data-Dense', 'Enterprise'],
    path: '/design-previews/design-8-fortress',
  },
  {
    id: 9,
    name: 'Aurora',
    subtitle: 'Gradient Futuristic',
    description: 'Dark base with vibrant purple-to-teal aurora gradients. Glassmorphism cards, blur effects, gradient text.',
    palette: ['#0B0F1A', '#8B5CF6', '#06B6D4', '#EC4899'],
    tags: ['Dark', 'Gradient', 'Glassmorphism'],
    path: '/design-previews/design-9-aurora',
  },
  {
    id: 10,
    name: 'Stealth',
    subtitle: 'Brutalist Dark',
    description: 'Pure black, single teal accent. Massive bold typography, no rounded corners. Raw brutalist aesthetic.',
    palette: ['#000000', '#14B8A6', '#FAFAFA', '#222222'],
    tags: ['Dark', 'Brutalist', 'Bold'],
    path: '/design-previews/design-10-stealth',
  },
]

export default function DesignGallery() {
  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', background: '#09090B', color: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ padding: '48px 48px 32px', textAlign: 'center', borderBottom: '1px solid #1C1C1E' }}>
        <div style={{ fontSize: 12, color: '#7C3AED', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Step 9 — Design Selection</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, letterSpacing: -1 }}>Design Gallery</h1>
        <p style={{ color: '#71717A', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          10 distinct design concepts for the Anonymous Cybersecurity Marketplace. Each includes a landing page and dashboard view.
        </p>
      </header>

      {/* Grid */}
      <div style={{ padding: '48px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
        {designs.map((design) => (
          <Link
            key={design.id}
            href={design.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              padding: 32,
              borderRadius: 16,
              border: '1px solid #27272A',
              background: '#18181B',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#7C3AED';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#27272A';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Color swatches */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {design.palette.map((color, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: color, border: '1px solid #333' }} />
                ))}
              </div>

              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#71717A', fontFamily: 'monospace' }}>#{String(design.id).padStart(2, '0')}</span>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>{design.name}</h2>
                <span style={{ fontSize: 14, color: '#7C3AED', fontWeight: 500 }}>{design.subtitle}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 1.6, marginBottom: 16 }}>{design.description}</p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {design.tags.map((tag) => (
                  <span key={tag} style={{ padding: '4px 12px', borderRadius: 999, background: '#27272A', fontSize: 12, color: '#71717A' }}>{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ padding: '48px', textAlign: 'center', borderTop: '1px solid #1C1C1E', color: '#71717A', fontSize: 14 }}>
        Click any design to view the full interactive preview (landing + dashboard views)
      </footer>
    </div>
  )
}
