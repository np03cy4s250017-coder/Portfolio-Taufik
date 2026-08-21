import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${profile.name} — ${profile.role}`

/**
 * Generated at build time. No external fonts or images are fetched — the
 * renderer has no network access to a CDN here, and a portfolio OG card does
 * not warrant shipping a font binary to save one weight.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', color: '#22C55E', fontSize: 28, letterSpacing: -0.5 }}>
          {profile.role} · {profile.location}
        </div>
        <div style={{ display: 'flex', color: '#F8FAFC', fontSize: 84, fontWeight: 600, marginTop: 24 }}>
          {profile.name}
        </div>
        <div style={{ display: 'flex', color: '#94A3B8', fontSize: 32, marginTop: 24, maxWidth: 900 }}>
          {profile.thesis}
        </div>
      </div>
    ),
    { ...size },
  )
}
