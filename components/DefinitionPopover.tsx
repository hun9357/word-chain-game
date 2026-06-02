'use client';

import { useEffect, useState } from 'react';
import { getDefinition } from '@/lib/dictionary';

interface DefinitionPopoverProps {
  word: string;
  onClose: () => void;
}

export default function DefinitionPopover({ word, onClose }: DefinitionPopoverProps) {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDefinition(word).then((d) => {
      if (active) {
        setText(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [word]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-paper border border-hairline rounded-lg shadow-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-semibold text-ink">{word}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint text-2xl leading-none hover:text-ink"
          >
            ×
          </button>
        </div>
        <p className="text-ink-muted leading-relaxed">
          {loading ? '…' : text ?? 'No definition found.'}
        </p>
      </div>
    </div>
  );
}
