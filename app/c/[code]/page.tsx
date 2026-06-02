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
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-paper">
      <header className="text-center mb-6">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-faint font-semibold">
          {c ? `Challenge · No. ${c.p}` : 'Daily'}
        </p>
        <h1 className="font-serif text-3xl font-semibold text-ink mt-2">Word Chain</h1>
        {c && (
          <p className="text-ink-muted mt-2">
            {(c.n ?? 'A friend')} scored {c.s}. Beat it!
          </p>
        )}
      </header>
      <WordChainGame challenge={c ?? undefined} />
    </main>
  );
}
