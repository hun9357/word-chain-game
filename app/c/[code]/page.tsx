import type { Metadata } from 'next';
import { decodeChallenge } from '@/lib/share';
import WordChainGame from '@/components/WordChainGame';

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
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-gray-50">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Word Chain</h1>
        {c && (
          <p className="text-gray-600 mt-1">
            {(c.n ?? 'A friend')} scored {c.s} on #{c.p}. Beat it!
          </p>
        )}
      </header>
      <WordChainGame challenge={c ?? undefined} />
    </main>
  );
}
