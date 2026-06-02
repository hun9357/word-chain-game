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
  const sub = c ? `Word Chain #${c.p} / Can you beat it?` : 'Play the daily word puzzle';

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
          background: '#f7f0e2',
          color: '#141414',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            width: 980,
            height: 3,
            borderTop: '1px solid #141414',
            borderBottom: '1px solid #141414',
          }}
        />
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 58 }}>
          {headline}
        </div>
        <div
          style={{
            width: 90,
            height: 4,
            background: '#58613a',
            margin: '30px 0',
            borderRadius: 2,
          }}
        />
        <div style={{ fontSize: 38, color: '#5c5c5c' }}>{sub}</div>
        <div
          style={{
            fontSize: 28,
            marginTop: 54,
            color: '#8a8478',
            fontFamily: 'sans-serif',
          }}
        >
          dailywordchain.com
        </div>
      </div>
    ),
    { ...size }
  );
}
