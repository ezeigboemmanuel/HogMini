import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'HogMini — Feature flag infrastructure';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg,#ffffff 0%,#f4f6f8 100%)',
          fontFamily: 'Inter, Roboto, -apple-system, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: 36, alignItems: 'center', padding: 48 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#0b1220', lineHeight: 1 }}>{'HogMini'}</div>
              <div style={{ fontSize: 16, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Feature flags for teams</div>
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: '#0b1220', maxWidth: 520 }}>Decouple deployment. Control releases. Ship with confidence.</div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <div style={{ border: '1px solid #e6e9ee', padding: '8px 14px', borderRadius: 10, color: '#374151' }}>Trusted by engineering teams</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: 520, borderRadius: 12, background: '#fff', boxShadow: '18px 18px 0 rgba(11,17,32,0.06)', border: '1px solid #e6e9ee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderBottom: '1px solid #f1f5f9', background: '#fafbfd', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 6, background: '#FF5F56' }} />
              <div style={{ width: 10, height: 10, borderRadius: 6, background: '#FFBD2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: 6, background: '#27C93F' }} />
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'BETA_DASHBOARD', active: true },
                { label: 'NEW_PAYMENT_FLOW', active: false },
                { label: 'AI_SEARCH_V2', active: false },
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0b1220' }}>{feature.label}</div>
                  <div style={{ width: 54, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', padding: 4, background: feature.active ? '#0b1220' : '#f3f4f6', border: feature.active ? 'none' : '1px solid #e6e9ee' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: feature.active ? '#fff' : '#0b1220', marginLeft: feature.active ? 'auto' : 0 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}