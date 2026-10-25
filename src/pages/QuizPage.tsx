import { useState } from 'react';
import { QuizRunner } from '../components/QuizRunner';
import { quiz } from '../data/quiz';
import { topics } from '../data/topics';
import type { QuizQuestion, TopicId } from '../data/types';
import { practiceQuiz } from '../lib/daily';
import { actions, getState, useAppState } from '../lib/store';

export const QUIZ_ROUND_SIZE = 10;

type Mode = TopicId | 'all' | 'mistakes';

interface Round {
  readonly mode: Mode;
  readonly questions: readonly QuizQuestion[];
  readonly n: number;
}

export function QuizPage() {
  const state = useAppState();
  const [round, setRound] = useState<Round | null>(null);
  const mistakes = quiz.filter((q) => state.quiz[q.id]?.lastWrong === true).length;

  const start = (mode: Mode): void => {
    setRound((r) => ({ mode, questions: practiceQuiz(mode, getState(), QUIZ_ROUND_SIZE), n: (r?.n ?? 0) + 1 }));
  };

  if (round) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setRound(null)} className="text-sm font-semibold text-brand-600 dark:text-brand-100">
          ← All quizzes
        </button>
        <QuizRunner
          key={round.n}
          questions={round.questions}
          onAnswer={actions.answerQuestion}
          onRestart={() => start(round.mode)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Rounds of up to {QUIZ_ROUND_SIZE} questions with instant feedback and an official source for each answer.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => start('all')}
          className="col-span-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-left text-white shadow-md"
        >
          <p className="text-lg font-bold">🎲 Mixed – all topics</p>
          <p className="text-sm opacity-90">{quiz.length} questions in the pool</p>
        </button>
        <button
          type="button"
          onClick={() => start('mistakes')}
          disabled={mistakes === 0}
          className="col-span-2 rounded-2xl bg-rose-50 p-4 text-left shadow-sm disabled:opacity-50 dark:bg-rose-950/40"
        >
          <p className="font-bold text-rose-800 dark:text-rose-200">🎯 Review mistakes</p>
          <p className="text-sm text-rose-700 dark:text-rose-300">
            {mistakes === 0 ? 'No mistakes to review' : `${mistakes} question${mistakes === 1 ? '' : 's'} to retry`}
          </p>
        </button>
        {topics.map((t) => {
          const count = quiz.filter((q) => q.topic === t.id).length;
          const correct = quiz.filter((q) => q.topic === t.id && (state.quiz[q.id]?.correct ?? 0) > 0).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => start(t.id)}
              className="rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-slate-900"
            >
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${t.chipClass}`}>
                {t.emoji} {t.tag}
              </span>
              <p className="mt-2 text-xs text-slate-500">
                {correct}/{count} answered right
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
