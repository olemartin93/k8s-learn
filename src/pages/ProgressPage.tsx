import { useRef, useState } from 'react';
import { flashcards } from '../data/flashcards';
import { lessons } from '../data/lessons';
import { quiz } from '../data/quiz';
import { topics } from '../data/topics';
import { isMastered } from '../lib/srs';
import { actions, getState, today, useAppState } from '../lib/store';
import { currentStreak, lastNDays, longestStreak } from '../lib/streak';

function Stat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm dark:bg-slate-900">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function ProgressPage() {
  const state = useAppState();
  const day = today();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lessonsRead = lessons.filter((l) => state.lessonsRead[l.id] !== undefined).length;
  const mastered = flashcards.filter((c) => isMastered(state.cards[c.id])).length;
  const answered = Object.values(state.quiz);
  const totalRight = answered.reduce((n, s) => n + s.correct, 0);
  const totalAnswers = answered.reduce((n, s) => n + s.correct + s.wrong, 0);
  const accuracy = totalAnswers === 0 ? '–' : `${Math.round((totalRight / totalAnswers) * 100)}%`;
  const days = lastNDays(state.activity, day, 28);

  const exportData = (): void => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `k8s-learn-backup-${day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File): Promise<void> => {
    const ok = actions.importState(await file.text());
    setMessage(ok ? 'Progress imported.' : 'That file is not a valid K8S learn backup.');
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Progress</h1>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Current streak" value={`🔥 ${currentStreak(state.activity, day)}`} />
        <Stat label="Longest streak" value={longestStreak(state.activity)} />
        <Stat label="Lessons learned" value={`${lessonsRead}/${lessons.length}`} />
        <Stat label="Cards mastered" value={`${mastered}/${flashcards.length}`} />
        <Stat label="Quiz accuracy" value={accuracy} />
        <Stat label="Answers given" value={totalAnswers} />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Last 4 weeks</h2>
        <div className="grid grid-cols-7 gap-1.5" aria-label="Activity in the last 28 days">
          {days.map(({ day: d, count }) => (
            <div
              key={d}
              title={`${d}: ${count} actions`}
              className={`aspect-square rounded-md ${
                count === 0
                  ? 'bg-slate-200 dark:bg-slate-800'
                  : count < 5
                    ? 'bg-brand-100 dark:bg-brand-700'
                    : count < 15
                      ? 'bg-brand-500'
                      : 'bg-brand-700 dark:bg-brand-100'
              }`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">By topic</h2>
        <ul className="space-y-2">
          {topics.map((t) => {
            const ls = lessons.filter((l) => l.topic === t.id);
            const qs = quiz.filter((q) => q.topic === t.id);
            const done =
              ls.filter((l) => state.lessonsRead[l.id] !== undefined).length +
              qs.filter((q) => (state.quiz[q.id]?.correct ?? 0) > 0).length;
            const total = ls.length + qs.length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <li key={t.id} className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.chipClass}`}>
                    {t.emoji} {t.tag}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Your data</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Progress is stored only on this device. Export a backup to move it to another device.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportData} className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white">
            Export
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border-2 border-brand-500 px-3 py-2 text-sm font-semibold text-brand-600 dark:text-brand-100"
          >
            Import
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all progress? This cannot be undone.')) actions.reset();
            }}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600"
          >
            Reset
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Import backup file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importData(file);
            e.target.value = '';
          }}
        />
        {message && (
          <p role="status" className="text-sm font-medium">
            {message}
          </p>
        )}
      </section>

      <p className="text-center text-xs text-slate-500">
        All content links to official documentation from Kubernetes, CNCF, Docker and SUSE/Rancher.
        <br />
        Kubernetes is a registered trademark of The Linux Foundation. This app is not affiliated with any of these projects.
      </p>
    </div>
  );
}
