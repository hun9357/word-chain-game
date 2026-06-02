import WordChainGame from '@/components/WordChainGame';
import { getTodayDateString, getPuzzleNumber } from '@/lib/words';

type RuleIconType = 'chain' | 'timer' | 'score' | 'streak';

function RuleIcon({ type }: { type: RuleIconType }) {
  const common = {
    className: 'mx-auto h-10 w-10 text-olive',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (type === 'chain') {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    );
  }

  if (type === 'timer') {
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l3 2M9 2h6M12 2v3" />
      </svg>
    );
  }

  if (type === 'score') {
    return (
      <svg {...common}>
        <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.3-4.2 6-.9L12 3Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 22c4 0 7-3 7-7 0-3-1.6-5.2-4.3-7.4.1 2.2-1 3.4-2.5 4.1C12.5 8.7 11 6.5 8.6 4 8.3 7.5 5 10 5 15c0 4 3 7 7 7Z" />
    </svg>
  );
}

const rules: Array<{
  type: RuleIconType;
  title: string;
  copy: string;
}> = [
  {
    type: 'chain',
    title: 'Chain',
    copy: 'Each word starts with the last letter of the previous word.',
  },
  {
    type: 'timer',
    title: 'Timer',
    copy: 'You have 60 seconds. Keep the chain going until time runs out.',
  },
  {
    type: 'score',
    title: 'Score',
    copy: 'Score points for each word. Longer words earn more points.',
  },
  {
    type: 'streak',
    title: 'Streak',
    copy: 'Play every day to build your streak and track your bests.',
  },
];

export default function Home() {
  const puzzleNo = getPuzzleNumber();
  const today = getTodayDateString();

  return (
    <div className="min-h-screen text-ink">
      {/* AdSense Placeholder - Top Banner (Desktop) */}
      {/* TODO: Replace with actual AdSense code */}
      <div className="hidden h-[72px] items-center justify-center border-b border-hairline text-sm text-ink-faint md:flex">
        Ad Space 728x90
      </div>

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-12 pt-5 sm:px-6 sm:pt-8">
        <header className="pb-8 text-center sm:pb-10">
          <div className="h-[3px] border-y border-ink" aria-hidden="true" />
          <h1 className="mt-6 font-serif text-[38px] font-bold leading-none text-ink sm:text-[72px] lg:text-[88px]">
            <span className="block sm:inline">Daily Word</span>
            {' '}
            <span className="block sm:inline">Chain</span>
          </h1>
          <p className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-center text-base font-semibold text-olive sm:gap-4 sm:text-lg">
            <span className="hidden h-px w-28 bg-hairline sm:block" aria-hidden="true" />
            <span className="min-w-0 max-w-[310px] sm:max-w-none">
              A daily word puzzle. Think fast. Chain words.
            </span>
            <span className="hidden h-px w-28 bg-hairline sm:block" aria-hidden="true" />
          </p>
        </header>

        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
          <WordChainGame />

          <aside className="rounded-lg border border-hairline bg-paper-soft/75 p-5">
            <h2 className="font-serif text-2xl font-semibold leading-tight text-ink">
              Round preview
            </h2>
            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 font-bold">
                  <span>Today's puzzle</span>
                  <span className="font-serif text-3xl text-clay">#{puzzleNo}</span>
                </div>
                <p className="text-sm leading-6 text-ink-muted">{today}</p>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 font-bold">
                  <span>Time</span>
                  <span className="font-serif text-3xl text-clay">60s</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                  <div className="h-full w-3/4 rounded-full bg-olive" />
                </div>
              </div>

              <div>
                <p className="mb-2 font-bold">Example chain</p>
                <div className="flex flex-wrap gap-2" aria-label="Example word chain">
                  {['PLANT', 'TRAIL', 'LANTERN', 'NORTH'].map((word, index) => (
                    <span
                      key={word}
                      className={`rounded-md border px-3 py-2 text-sm font-bold ${
                        index === 0
                          ? 'border-ink bg-ink text-paper-soft'
                          : 'border-hairline bg-paper-soft text-ink'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-9" aria-labelledby="how-to-play-heading">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
            <span className="h-px bg-clay" aria-hidden="true" />
            <h2 id="how-to-play-heading" className="text-xl font-extrabold text-ink">
              How to play
            </h2>
            <span className="h-px bg-clay" aria-hidden="true" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rules.map((rule) => (
              <article
                key={rule.type}
                className="rounded-lg border border-hairline bg-paper-soft/75 p-5 text-center"
              >
                <RuleIcon type={rule.type} />
                <h3 className="mt-3 text-xl font-extrabold leading-tight text-ink">{rule.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{rule.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-hairline pt-6 text-center text-sm leading-6 text-ink-faint">
          <p>New puzzle daily at midnight UTC. Share your score with friends.</p>
          <p className="mt-1">Made for word game enthusiasts.</p>
        </footer>
      </main>
    </div>
  );
}
