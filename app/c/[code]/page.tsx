import type { Metadata } from 'next';
import { decodeChallenge } from '@/lib/share';

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const c = decodeChallenge(params.code);
  const title = c ? `${c.n ?? 'A friend'} scored ${c.s} — can you beat it?` : 'Daily Word Chain';
  return {
    title,
    description: c ? `Word Chain #${c.p}. Beat ${c.s} points!` : 'Play the daily word puzzle.',
  };
}

export default function ChallengePage({ params }: { params: { code: string } }) {
  const c = decodeChallenge(params.code);
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          {c ? `${c.n ?? 'A friend'} scored ${c.s}` : 'Daily Word Chain'}
        </h1>
        <p className="text-gray-600 mb-6">
          {c ? `Word Chain #${c.p}. Can you beat it?` : 'Play the daily puzzle.'}
        </p>
        <a href="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl">
          Play
        </a>
      </div>
    </main>
  );
}
