import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'HogMini - Feature Flag Infrastructure';
export const size = {
  width: 1200,
  height: 630,
};

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
          padding: '80px',
        }}
      >
        {/* Main Brand Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 80, fontWeight: 900, letterSpacing: '-0.05em', margin: 0 }}>
            HogMini
          </h1>
          <p style={{ fontSize: 24, fontWeight: 400, color: '#666', marginTop: '10px', letterSpacing: '0.1em' }}>
            DECOUPLE DEPLOYMENT. CONTROL RELEASE.
          </p>
        </div>

        {/* macOS Style Window Mockup */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '800px',
            border: '2px solid black',
            backgroundColor: 'white',
            boxShadow: '20px 20px 0px 0px #000', 
          }}
        >
          {/* Window Header */}
          <div style={{ display: 'flex', padding: '15px', borderBottom: '2px solid black', background: '#f5f5f5' }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#FF5F56', marginRight: 8 }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#FFBD2E', marginRight: 8 }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#27C93F' }} />
          </div>

          {/* Window Content: Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '30px' }}>
            {[
              { label: 'BETA_DASHBOARD', active: true },
              { label: 'NEW_PAYMENT_FLOW', active: false },
              { label: 'AI_SEARCH_V2', active: false },
            ].map((feature, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 0',
                  borderBottom: i === 2 ? 'none' : '1px solid #eee'
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700 }}>{feature.label}</span>
                {/* Apple Style Toggle */}
                <div style={{ 
                  width: 50, 
                  height: 28, 
                  borderRadius: 14, 
                  background: feature.active ? 'black' : 'white', 
                  border: '2px solid black',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  justifyContent: feature.active ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: feature.active ? 'white' : 'black' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}