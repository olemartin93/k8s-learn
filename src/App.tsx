import type { ReactNode } from 'react';
import { useOnline } from './components/useOnline';
import { CardsPage } from './pages/CardsPage';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';
import { ProgressPage } from './pages/ProgressPage';
import { QuizPage } from './pages/QuizPage';
import { TodayPage } from './pages/TodayPage';
import { useRoute, type Route } from './lib/router';
import { today, useAppState } from './lib/store';
import { currentStreak } from './lib/streak';

interface NavItem {
  readonly name: Route['name'];
  readonly label: string;
  readonly icon: string;
  readonly to: Route;
}

const NAV: readonly NavItem[] = [
  { name: 'today', label: 'Today', icon: '🏠', to: { name: 'today' } },
  { name: 'learn', label: 'Learn', icon: '📚', to: { name: 'learn' } },
  { name: 'quiz', label: 'Quiz', icon: '❓', to: { name: 'quiz' } },
  { name: 'cards', label: 'Cards', icon: '🃏', to: { name: 'cards' } },
  { name: 'progress', label: 'Progress', icon: '📈', to: { name: 'progress' } },
];

interface AppProps {
  /** Rendered once at the root, e.g. the service-worker update prompt. */
  readonly extra?: ReactNode;
}

export function App({ extra }: AppProps) {
  const [route, navigate] = useRoute();
  const online = useOnline();
  const state = useAppState();
  const streak = currentStreak(state.activity, today());
  const activeTab = route.name === 'lesson' ? 'learn' : route.name;

  let page: ReactNode;
  switch (route.name) {
    case 'today':
      page = <TodayPage navigate={navigate} />;
      break;
    case 'learn':
      page = <LearnPage topic={route.topic} navigate={navigate} />;
      break;
    case 'lesson':
      page = <LessonPage id={route.id} navigate={navigate} />;
      break;
    case 'quiz':
      page = <QuizPage />;
      break;
    case 'cards':
      page = <CardsPage />;
      break;
    case 'progress':
      page = <ProgressPage />;
      break;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <button
          type="button"
          onClick={() => navigate({ name: 'today' })}
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="h-7 w-7" />
          K8S learn
        </button>
        <div className="flex items-center gap-2 text-sm">
          {!online && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
              Offline
            </span>
          )}
          <span className="font-semibold" aria-label={`${streak} day streak`}>
            🔥 {streak}
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{page}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map((item) => {
            const active = activeTab === item.name;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => navigate(item.to)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full flex-col items-center gap-0.5 py-2 text-xs font-semibold ${
                    active ? 'text-brand-600 dark:text-brand-100' : 'text-slate-500'
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {extra}
    </div>
  );
}
