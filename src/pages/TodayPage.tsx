import { useState } from 'react';
import { QuizRunner } from '../components/QuizRunner';
import { TopicTag } from '../components/TopicTag';
import { learningTips } from '../data/tips';
import type { QuizQuestion } from '../data/types';
import { dayNumber } from '../lib/date';
import { dailyCards, dailyQuiz, lessonOfTheDay } from '../lib/daily';
import type { Route } from '../lib/router';
import { actions, getState, today, useAppState } from '../lib/store';
import { currentStreak } from '../lib/streak';

interface TodayPageProps {
  readonly navigate: (r: Route) => void;
}

function Check({ done }: { readonly done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 dark:border-slate-600'
      }`}
    >
      {done ? '✓' : ''}
    </span>
  );
}

export function TodayPage({ navigate }: TodayPageProps) {
  const state = useAppState();
  const day = today();
  const lesson = lessonOfTheDay(day, state);
  const lessonDone = state.lessonsRead[lesson.id] !== undefined;
  const cardsLeft = dailyCards(day, state).length;
  const quizDone = state.dailyQuizDone[day] === true;
  const streak = currentStreak(state.activity, day);
  const tip = learningTips[dayNumber(day) % learningTips.length];
  const [quizQuestions, setQuizQuestions] = useState<readonly QuizQuestion[] | null>(null);

  const doneCount = [lessonDone, cardsLeft === 0, quizDone].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-md">
        <p className="text-sm opacity-90">
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-1 text-2xl font-bold">Your daily Kubernetes</h1>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-3xl font-extrabold" data-testid="streak">
              🔥 {streak}
            </p>
            <p className="text-xs opacity-90">day streak</p>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div>
            <p className="text-3xl font-extrabold">{doneCount}/3</p>
            <p className="text-xs opacity-90">done today</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="plan-heading" className="space-y-3">
        <h2 id="plan-heading" className="text-lg font-bold">
          Today’s plan
        </h2>

        <button
          type="button"
          onClick={() => navigate({ name: 'lesson', id: lesson.id })}
          className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-slate-900"
        >
          <Check done={lessonDone} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">1 · Read a TL;DR</p>
            <p className="mt-1 font-semibold">{lesson.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{lesson.tldr}</p>
            <div className="mt-2">
              <TopicTag topic={lesson.topic} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate({ name: 'cards' })}
          className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-slate-900"
        >
          <Check done={cardsLeft === 0} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">2 · Flashcards</p>
            <p className="mt-1 font-semibold">
              {cardsLeft === 0 ? 'All reviews done' : `${cardsLeft} cards to review`}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Spaced repetition – active recall.</p>
          </div>
        </button>

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <Check done={quizDone} />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">3 · Daily quiz</p>
              <p className="mt-1 font-semibold">{quizDone ? 'Completed — nice!' : '5 mixed questions'}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Mixes topics and brings back questions you missed.
              </p>
              {quizQuestions === null && (
                <button
                  type="button"
                  onClick={() => setQuizQuestions(dailyQuiz(day, getState()))}
                  className="mt-3 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  {quizDone ? 'Take it again' : 'Start daily quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
        {quizQuestions !== null && (
          <QuizRunner
            questions={quizQuestions}
            onAnswer={actions.answerQuestion}
            onFinish={() => actions.completeDailyQuiz()}
            onRestart={() => setQuizQuestions(null)}
          />
        )}
      </section>

      {tip && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            💡 Learning tip · {tip.title}
          </p>
          <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">{tip.text}</p>
        </section>
      )}
    </div>
  );
}
