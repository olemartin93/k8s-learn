import { lessons } from '../data/lessons';
import { topics } from '../data/topics';
import type { TopicId } from '../data/types';
import { TopicTag } from '../components/TopicTag';
import type { Route } from '../lib/router';
import { useAppState } from '../lib/store';

interface LearnPageProps {
  readonly topic?: string | undefined;
  readonly navigate: (r: Route) => void;
}

function isTopicId(value: string | undefined): value is TopicId {
  return topics.some((t) => t.id === value);
}

export function LearnPage({ topic, navigate }: LearnPageProps) {
  const state = useAppState();
  const active = isTopicId(topic) ? topic : undefined;
  const visible = active ? lessons.filter((l) => l.topic === active) : lessons;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Learn</h1>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filter by topic">
        <button
          type="button"
          role="tab"
          aria-selected={!active}
          onClick={() => navigate({ name: 'learn' })}
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
            !active ? 'bg-brand-500 text-white' : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => navigate({ name: 'learn', topic: t.id })}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
              active === t.id ? 'bg-brand-500 text-white' : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {t.emoji} {t.tag}
          </button>
        ))}
      </div>

      {active && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{topics.find((t) => t.id === active)?.description}</p>
      )}

      <ul className="space-y-3">
        {visible.map((l) => {
          const read = state.lessonsRead[l.id] !== undefined;
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => navigate({ name: 'lesson', id: l.id })}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <TopicTag topic={l.topic} />
                  {read && (
                    <span className="text-xs font-semibold text-emerald-600" aria-label="learned">
                      ✓ Learned
                    </span>
                  )}
                </div>
                <p className="mt-2 font-semibold">{l.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{l.tldr}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
