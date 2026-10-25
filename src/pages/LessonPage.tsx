import { useState } from 'react';
import { QuizRunner } from '../components/QuizRunner';
import { SourceLink } from '../components/SourceLink';
import { TopicTag } from '../components/TopicTag';
import { lessons } from '../data/lessons';
import { quiz } from '../data/quiz';
import { hashString, mulberry32, shuffle } from '../lib/random';
import type { Route } from '../lib/router';
import { actions, useAppState } from '../lib/store';

interface LessonPageProps {
  readonly id: string;
  readonly navigate: (r: Route) => void;
}

/** Renders `inline code` segments inside a string. */
function RichText({ text }: { readonly text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export function LessonPage({ id, navigate }: LessonPageProps) {
  const state = useAppState();
  const index = lessons.findIndex((l) => l.id === id);
  const lesson = lessons[index];
  const [checking, setChecking] = useState(false);

  if (!lesson) {
    return (
      <div className="space-y-3">
        <p>Lesson not found.</p>
        <button type="button" className="text-brand-600 underline" onClick={() => navigate({ name: 'learn' })}>
          Back to lessons
        </button>
      </div>
    );
  }

  const read = state.lessonsRead[lesson.id] !== undefined;
  const next = lessons[index + 1];
  const quickCheck = shuffle(
    quiz.filter((q) => q.topic === lesson.topic),
    mulberry32(hashString(lesson.id)),
  ).slice(0, 2);

  return (
    <article className="space-y-4" key={lesson.id}>
      <button
        type="button"
        onClick={() => navigate({ name: 'learn', topic: lesson.topic })}
        className="block text-sm font-semibold text-brand-600 dark:text-brand-100"
      >
        ← Back
      </button>
      <TopicTag topic={lesson.topic} onClick={() => navigate({ name: 'learn', topic: lesson.topic })} />
      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      <section className="rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-4 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-100">TL;DR</p>
        <p className="mt-1 font-medium">
          <RichText text={lesson.tldr} />
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Key points</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {lesson.points.map((p) => (
            <li key={p}>
              <RichText text={p} />
            </li>
          ))}
        </ul>
      </section>

      {lesson.example && (
        <section>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">Try it</h2>
          <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs leading-relaxed text-emerald-200">
            <code className="bg-transparent p-0">{lesson.example}</code>
          </pre>
        </section>
      )}

      <section className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm dark:border-slate-700">
        <p className="font-semibold">🗣️ Explain it back</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Close your eyes and explain “{lesson.title}” in one sentence. Could you teach it to a colleague?
        </p>
      </section>

      <SourceLink source={lesson.source} />

      <button
        type="button"
        onClick={() => actions.markLessonRead(lesson.id)}
        disabled={read}
        className={`w-full rounded-xl px-4 py-3 font-semibold ${
          read ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100' : 'bg-brand-500 text-white hover:bg-brand-600'
        }`}
      >
        {read ? '✓ Learned' : 'Mark as learned'}
      </button>

      {quickCheck.length > 0 &&
        (checking ? (
          <QuizRunner key={lesson.id} questions={quickCheck} onAnswer={actions.answerQuestion} />
        ) : (
          <button
            type="button"
            onClick={() => setChecking(true)}
            className="w-full rounded-xl border-2 border-brand-500 px-4 py-3 font-semibold text-brand-600 dark:text-brand-100"
          >
            Quick check: {quickCheck.length} questions
          </button>
        ))}

      {next && (
        <button
          type="button"
          onClick={() => {
            setChecking(false);
            navigate({ name: 'lesson', id: next.id });
          }}
          className="w-full rounded-xl bg-white px-4 py-3 text-left text-sm shadow-sm dark:bg-slate-900"
        >
          <span className="text-slate-500">Next:</span> <span className="font-semibold">{next.title}</span> →
        </button>
      )}
    </article>
  );
}
