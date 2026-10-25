import { useState } from 'react';
import type { Flashcard } from '../data/types';
import type { Grade } from '../lib/srs';
import { SourceLink } from './SourceLink';
import { TopicTag } from './TopicTag';

interface FlashcardSessionProps {
  readonly cards: readonly Flashcard[];
  readonly onGrade: (id: string, grade: Grade) => void;
  readonly onDone?: () => void;
}

/**
 * Active recall: think of the answer, flip, then honestly grade yourself.
 * Cards marked "Again" come back once at the end of the session.
 */
export function FlashcardSession({ cards, onGrade, onDone }: FlashcardSessionProps) {
  const [queue, setQueue] = useState<readonly Flashcard[]>(cards);
  const [flipped, setFlipped] = useState(false);
  const [requeued, setRequeued] = useState<ReadonlySet<string>>(new Set());
  const [reviewed, setReviewed] = useState(0);

  const card = queue[0];
  if (!card) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-slate-900" role="status">
        <p className="text-5xl" aria-hidden="true">
          ✨
        </p>
        <h2 className="mt-2 text-xl font-bold">All caught up!</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {reviewed > 0 ? `You reviewed ${reviewed} cards. ` : ''}Come back tomorrow for more — spacing reviews out is what
          makes them stick.
        </p>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
          >
            Done
          </button>
        )}
      </div>
    );
  }

  const grade = (g: Grade): void => {
    onGrade(card.id, g);
    setReviewed((n) => n + 1);
    setFlipped(false);
    const rest = queue.slice(1);
    if (g === 'again' && !requeued.has(card.id)) {
      setRequeued(new Set([...requeued, card.id]));
      setQueue([...rest, card]);
    } else {
      setQueue(rest);
    }
  };

  return (
    <div data-testid="flashcards">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <TopicTag topic={card.topic} />
        <span>{queue.length} left</span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show question side' : 'Reveal answer'}
        className="relative block h-64 w-full [perspective:1000px]"
      >
        <div className={`card-flip relative h-full w-full ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-md [backface-visibility:hidden]">
            <p className="text-2xl font-bold">{card.front}</p>
            <p className="mt-4 text-xs opacity-80">Think of the answer, then tap to flip</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-6 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-slate-900">
            <p className="text-base leading-relaxed" data-testid="card-back">
              {flipped ? card.back : ''}
            </p>
          </div>
        </div>
      </button>
      {flipped ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => grade('again')}
              className="rounded-xl border-2 border-rose-400 bg-rose-50 px-4 py-3 font-semibold text-rose-800 dark:bg-rose-900/30 dark:text-rose-100"
            >
              🔁 Again
            </button>
            <button
              type="button"
              onClick={() => grade('good')}
              className="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100"
            >
              ✅ Got it
            </button>
          </div>
          <SourceLink source={card.source} />
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-slate-500">Tap the card to reveal the answer</p>
      )}
    </div>
  );
}
