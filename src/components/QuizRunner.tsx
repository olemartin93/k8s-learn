import { useState } from 'react';
import type { QuizQuestion } from '../data/types';
import { shuffle } from '../lib/random';
import { SourceLink } from './SourceLink';
import { TopicTag } from './TopicTag';

interface QuizRunnerProps {
  readonly questions: readonly QuizQuestion[];
  readonly onAnswer: (id: string, correct: boolean) => void;
  readonly onFinish?: (score: number, total: number) => void;
  readonly onRestart?: () => void;
  readonly rand?: () => number;
}

interface ShuffledQuestion {
  readonly q: QuizQuestion;
  /** order[i] = index in q.options shown at position i */
  readonly order: readonly number[];
}

export function QuizRunner({ questions, onAnswer, onFinish, onRestart, rand }: QuizRunnerProps) {
  // Shuffle once per mount so the option order stays put while answering.
  // Parents pass a new `key` to start a fresh round.
  const [items] = useState<ShuffledQuestion[]>(() =>
    questions.map((q) => ({ q, order: shuffle(q.options.map((_, i) => i), rand) })),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (items.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">No questions here yet. 🎉</p>;
  }

  if (finished) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-slate-900" role="status">
        <p className="text-5xl" aria-hidden="true">
          {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}
        </p>
        <h2 className="mt-2 text-xl font-bold">
          You scored {score} / {items.length}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {pct >= 80
            ? 'Excellent! Spaced practice keeps it that way.'
            : 'Missed questions come back in your daily quiz and in “Review mistakes”.'}
        </p>
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
          >
            New round
          </button>
        )}
      </div>
    );
  }

  const current = items[index];
  if (!current) return null;
  const { q, order } = current;
  const answered = selected !== null;
  const isCorrect = selected === q.answer;

  const choose = (optionIndex: number): void => {
    if (answered) return;
    setSelected(optionIndex);
    const correct = optionIndex === q.answer;
    if (correct) setScore((s) => s + 1);
    onAnswer(q.id, correct);
  };

  const next = (): void => {
    if (index + 1 >= items.length) {
      setFinished(true);
      onFinish?.(score, items.length);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900" data-testid="quiz">
      <div className="mb-3 flex items-center justify-between">
        <TopicTag topic={q.topic} />
        <span className="text-xs font-medium text-slate-500" aria-label="progress">
          {index + 1} / {items.length}
        </span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>
      <h2 className="text-lg font-semibold leading-snug">{q.question}</h2>
      <ul className="mt-4 space-y-2">
        {order.map((optIdx) => {
          const isAnswer = optIdx === q.answer;
          const isPicked = optIdx === selected;
          let style =
            'border-slate-200 bg-slate-50 hover:border-brand-500 dark:border-slate-700 dark:bg-slate-800';
          if (answered && isAnswer)
            style = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100';
          else if (answered && isPicked)
            style = 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100';
          else if (answered) style = 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-800';
          return (
            <li key={optIdx}>
              <button
                type="button"
                disabled={answered}
                onClick={() => choose(optIdx)}
                className={`w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition ${style}`}
              >
                {answered && isAnswer && <span aria-hidden="true">✅ </span>}
                {answered && isPicked && !isAnswer && <span aria-hidden="true">❌ </span>}
                {q.options[optIdx]}
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div className="mt-4 space-y-2" aria-live="polite">
          <p className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{q.explanation}</p>
          <SourceLink source={q.source} />
          <button
            type="button"
            onClick={next}
            className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white hover:bg-brand-600"
          >
            {index + 1 >= items.length ? 'See results' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}
