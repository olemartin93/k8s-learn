import { useSyncExternalStore } from 'react';
import { toDateKey } from './date';
import { gradeCard, type CardState, type Grade } from './srs';

export const STORAGE_KEY = 'k8s-learn:v1';

export interface QuizStat {
  readonly correct: number;
  readonly wrong: number;
  /** True if the most recent answer was wrong — used for "review mistakes". */
  readonly lastWrong: boolean;
}

export interface AppState {
  readonly version: 1;
  /** lesson id → date key first read */
  readonly lessonsRead: Readonly<Record<string, string>>;
  readonly quiz: Readonly<Record<string, QuizStat>>;
  readonly cards: Readonly<Record<string, CardState>>;
  /** date key → number of learning actions that day */
  readonly activity: Readonly<Record<string, number>>;
  /** date key → true when the daily quiz was finished */
  readonly dailyQuizDone: Readonly<Record<string, boolean>>;
}

export const initialState: AppState = {
  version: 1,
  lessonsRead: {},
  quiz: {},
  cards: {},
  activity: {},
  dailyQuizDone: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parse persisted JSON defensively; anything unexpected falls back to defaults. */
export function parseState(raw: string | null): AppState {
  if (raw === null) return initialState;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data['version'] !== 1) return initialState;
    const pick = <T>(key: keyof AppState): Readonly<Record<string, T>> => {
      const v = data[key];
      return isRecord(v) ? (v as Record<string, T>) : {};
    };
    return {
      version: 1,
      lessonsRead: pick<string>('lessonsRead'),
      quiz: pick<QuizStat>('quiz'),
      cards: pick<CardState>('cards'),
      activity: pick<number>('activity'),
      dailyQuizDone: pick<boolean>('dailyQuizDone'),
    };
  } catch {
    return initialState;
  }
}

function readStorage(): AppState {
  try {
    return parseState(globalThis.localStorage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return initialState;
  }
}

let state: AppState = readStorage();
const listeners = new Set<() => void>();
let clock: () => Date = () => new Date();

function persist(): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (e.g. private mode) — keep working in memory.
  }
}

function setState(next: AppState): void {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function today(): string {
  return toDateKey(clock());
}

function bumpActivity(s: AppState, day: string): AppState['activity'] {
  return { ...s.activity, [day]: (s.activity[day] ?? 0) + 1 };
}

export const actions = {
  markLessonRead(id: string): void {
    if (state.lessonsRead[id] !== undefined) return;
    const day = today();
    setState({ ...state, lessonsRead: { ...state.lessonsRead, [id]: day }, activity: bumpActivity(state, day) });
  },
  answerQuestion(id: string, correct: boolean): void {
    const prev = state.quiz[id] ?? { correct: 0, wrong: 0, lastWrong: false };
    const next: QuizStat = {
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      lastWrong: !correct,
    };
    setState({ ...state, quiz: { ...state.quiz, [id]: next }, activity: bumpActivity(state, today()) });
  },
  gradeCard(id: string, grade: Grade): void {
    const day = today();
    const next = gradeCard(state.cards[id], grade, day);
    setState({ ...state, cards: { ...state.cards, [id]: next }, activity: bumpActivity(state, day) });
  },
  completeDailyQuiz(): void {
    setState({ ...state, dailyQuizDone: { ...state.dailyQuizDone, [today()]: true } });
  },
  reset(): void {
    setState(initialState);
  },
  /** Replace all state, e.g. from an imported backup. */
  importState(raw: string): boolean {
    const parsed = parseState(raw);
    if (parsed === initialState) return false;
    setState(parsed);
    return true;
  },
};

export function getState(): AppState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

/** Test helpers. */
export const __testing = {
  setClock(fn: () => Date): void {
    clock = fn;
  },
  resetClock(): void {
    clock = () => new Date();
  },
  reload(): void {
    state = readStorage();
    listeners.forEach((l) => l());
  },
};
