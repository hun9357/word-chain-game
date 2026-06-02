import { ImageResponse } from 'next/og';
import { decodeChallenge } from '@/lib/share';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image({ params }: { params: { code: string } }) {
  const c = decodeChallenge(params.code);
  const headline = c
    ? `${c.n ?? 'A friend'} scored ${c.s}`
    : 'Daily Word Chain';
  const sub = c ? `Word Chain #${c.p} · Can you beat it?` : 'Play the daily word puzzle';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf7ef',
          color: '#141414',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>🔗 {headline}</div>
        <div
          style={{ width: 60, height: 4, background: '#141414', margin: '28px 0', borderRadius: 2 }}
        />
        <div style={{ fontSize: 36, color: '#5c5c5c' }}>{sub}</div>
        <div style={{ fontSize: 26, marginTop: 48, color: '#8a8478' }}>dailywordchain.com</div>
      </div>
    ),
    { ...size }
  );
}
