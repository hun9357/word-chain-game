import WordChainGame from '@/components/WordChainGame';
import { getTodayDateString } from '@/lib/words';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* AdSense Placeholder - Top Banner (Desktop) */}
      {/* TODO: Replace with actual AdSense code */}
      <div className="hidden md:flex items-center justify-center h-[90px] bg-gray-100 border-b border-gray-200">
        <p className="text-gray-400 text-sm">Ad Space 728x90</p>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Daily Word Chain
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-2">
            Connect Words, Beat the Clock
          </p>
          <p className="text-sm text-gray-500">
            {getTodayDateString()}
          </p>
        </header>

        {/* Game Component */}
        <WordChainGame />

        {/* How It Works Section */}
        <section className="max-w-2xl mx-auto mt-12 sm:mt-16">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create the longest word chain in 60 seconds
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Daily Word Chain is a fast-paced word puzzle game that tests your vocabulary
                and quick thinking. Each day brings a new starting word and a fresh challenge.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Chain Words</h3>
                  <p className="text-sm">
                    Each word must start with the last letter of the previous word
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">⏱️</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Beat the Timer</h3>
                  <p className="text-sm">
                    You have 60 seconds to create the longest chain possible
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Score Points</h3>
                  <p className="text-sm">
                    Earn points for each word plus bonuses for longer words
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">🔥</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Build Streaks</h3>
                  <p className="text-sm">
                    Play daily to build your streak and track your progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-12 sm:mt-16 text-gray-500 text-sm">
          <p>
            New puzzle daily at midnight UTC | Share your score with friends
          </p>
          <p className="mt-2">
            Made with ❤️ for word game enthusiasts
          </p>
        </footer>
      </main>
    </div>
  );
}
