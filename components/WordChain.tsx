'use client';

interface WordChainProps {
  words: string[];
  startWord: string;
}

export default function WordChain({ words, startWord }: WordChainProps) {
  const allWords = [startWord, ...words];

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Word Chain</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {allWords.map((word, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`px-4 py-2 rounded-lg font-semibold text-lg ${
                  index === 0
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {word}
              </div>
              {index < allWords.length - 1 && (
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
