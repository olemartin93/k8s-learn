import { addDays } from './date';

/**
 * Leitner-style spaced repetition. Cards move up a box when you know them and
 * back to box 1 when you don't. Higher boxes are reviewed less often.
 */
export const BOX_INTERVALS_DAYS: readonly number[] = [1, 2, 4, 8, 16, 32];
export const MAX_BOX = BOX_INTERVALS_DAYS.length;

export interface CardState {
  /** 1-based Leitner box. */
  readonly box: number;
  /** Date key when the card is next due. */
  readonly due: string;
  readonly reviews: number;
  /** Date key of the first review — used to cap new cards per day. */
  readonly introduced?: string;
}

export type Grade = 'again' | 'good';

export function intervalForBox(box: number): number {
  const clamped = Math.min(Math.max(box, 1), MAX_BOX);
  return BOX_INTERVALS_DAYS[clamped - 1] ?? 1;
}

export function gradeCard(prev: CardState | undefined, grade: Grade, today: string): CardState {
  const reviews = (prev?.reviews ?? 0) + 1;
  const introduced = prev ? (prev.introduced ?? prev.due) : today;
  if (grade === 'again') {
    // Back to the start; review again tomorrow.
    return { box: 1, due: addDays(today, 1), reviews, introduced };
  }
  const box = Math.min((prev?.box ?? 0) + 1, MAX_BOX);
  return { box, due: addDays(today, intervalForBox(box)), reviews, introduced };
}

export function isDue(state: CardState | undefined, today: string): boolean {
  return state === undefined || state.due <= today;
}

/** A card counts as "mastered" once it reaches box 4 or higher. */
export function isMastered(state: CardState | undefined): boolean {
  return state !== undefined && state.box >= 4;
}

export interface DueSelection {
  readonly due: string[];
  readonly fresh: string[];
}

/**
 * Pick cards for today's session: all due review cards (oldest first) plus up to
 * `newLimit` cards never seen before.
 */
export function selectSession(
  ids: readonly string[],
  states: Readonly<Record<string, CardState>>,
  today: string,
  newLimit: number,
  maxTotal: number,
): DueSelection {
  const reviews = ids
    .filter((id) => states[id] !== undefined && isDue(states[id], today))
    .sort((a, b) => (states[a]?.due ?? '').localeCompare(states[b]?.due ?? ''));
  const fresh = ids.filter((id) => states[id] === undefined);
  const introducedToday = ids.filter((id) => states[id]?.introduced === today).length;
  const due = reviews.slice(0, maxTotal);
  const room = Math.max(0, Math.min(newLimit - introducedToday, maxTotal - due.length));
  return { due, fresh: fresh.slice(0, room) };
}
