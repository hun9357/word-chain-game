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
          background: 'linear-gradient(135deg,#4f46e5,#4338ca)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800 }}>🔗 {headline}</div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.9 }}>{sub}</div>
        <div style={{ fontSize: 28, marginTop: 48, opacity: 0.7 }}>dailywordchain.com</div>
      </div>
    ),
    { ...size }
  );
}
