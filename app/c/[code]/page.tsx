import type { Metadata } from 'next';
import { decodeChallenge } from '@/lib/share';
import WordChainGame from '@/components/WordChainGame';

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const c = decodeChallenge(params.code);
  const title = c ? `${c.n ?? 'A friend'} scored ${c.s} - can you beat it?` : 'Daily Word Chain';
  return {
    title,
    description: c ? `Word Chain #${c.p}. Beat ${c.s} points!` : 'Play the daily word puzzle.',
  };
}

export default function ChallengePage({ params }: { params: { code: string } }) {
  const c = decodeChallenge(params.code);

  return (
    <main className="min-h-screen px-4 pb-12 pt-5 text-ink sm:px-6 sm:pt-8">
      <div className="mx-auto w-full max-w-[860px]">
        <header className="pb-8 text-center">
          <div className="h-[3px] border-y border-ink" aria-hidden="true" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">
            {c ? `Challenge / No. ${c.p}` : 'Daily'}
          </p>
          <h1 className="mt-2 font-serif text-[38px] font-bold leading-none text-ink sm:text-[72px]">
            <span className="block sm:inline">Daily Word</span>
            {' '}
            <span className="block sm:inline">Chain</span>
          </h1>
          {c && (
            <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-olive">
              {(c.n ?? 'A friend')} scored {c.s}. Beat it with a longer chain.
            </p>
          )}
        </header>

        <WordChainGame challenge={c ?? undefined} />
      </div>
    </main>
  );
}
