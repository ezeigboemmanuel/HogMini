import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'HogMini - Feature Flag Infrastructure';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 100, fontWeight: 900, margin: 0, letterSpacing: '-0.05em' }}>HogMini</h1>
          <p style={{ fontSize: 24, color: '#666', margin: 0, letterSpacing: '0.1em' }}>DECOUPLE DEPLOYMENT. CONTROL RELEASE.</p>
        </div>

        {/* macOS Style Window */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 800,
            border: '3px solid black',
            backgroundColor: 'white',
            boxShadow: '20px 20px 0px 0px #000',
          }}
        >
          {/* Window Header with "Traffic Lights" */}
          <div style={{ display: 'flex', padding: 20, borderBottom: '3px solid black', backgroundColor: '#f5f5f5' }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, border: '1.5px solid black', marginRight: 8 }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, border: '1.5px solid black', marginRight: 8 }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, border: '1.5px solid black' }} />
          </div>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: 40 }}>
            {[
              { label: 'BETA_DASHBOARD', active: true },
              { label: 'NEW_PAYMENT_FLOW', active: false },
              { label: 'AI_SEARCH_V3', active: false },
            ].map((feature, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '15px 0',
                  borderBottom: i === 2 ? 'none' : '2px solid #eee'
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 700 }}>{feature.label}</span>
                {/* Toggle Switch */}
                <div style={{ 
                  width: 60, 
                  height: 32, 
                  borderRadius: 16, 
                  background: feature.active ? 'black' : 'white', 
                  border: '3px solid black',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                  justifyContent: feature.active ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: feature.active ? 'white' : 'black' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}