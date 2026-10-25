import { useState } from 'react';
import { FlashcardSession } from '../components/FlashcardSession';
import { flashcards } from '../data/flashcards';
import type { Flashcard } from '../data/types';
import { dailyCards } from '../lib/daily';
import { actions, getState, today } from '../lib/store';
import { shuffle } from '../lib/random';

const byId = new Map(flashcards.map((c) => [c.id, c]));

function toCards(ids: readonly string[]): Flashcard[] {
  return ids.map((id) => byId.get(id)).filter((c): c is Flashcard => c !== undefined);
}

export function CardsPage() {
  // Freeze the session when the page opens so grading doesn't reshuffle it.
  const [session, setSession] = useState(() => ({ n: 0, cards: toCards(dailyCards(today(), getState())) }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Flashcards</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Spaced repetition: cards you know come back after 1, 2, 4, 8, 16 then 32 days. Cards you miss start over.
      </p>
      <FlashcardSession key={session.n} cards={session.cards} onGrade={actions.gradeCard} />
      <button
        type="button"
        onClick={() => setSession((s) => ({ n: s.n + 1, cards: shuffle(flashcards).slice(0, 10) }))}
        className="w-full rounded-xl border-2 border-brand-500 px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-100"
      >
        Extra practice: 10 random cards
      </button>
    </div>
  );
}
