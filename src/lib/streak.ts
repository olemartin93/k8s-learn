import { addDays } from './date';

/**
 * Current streak: consecutive active days ending today, or ending yesterday
 * (so the streak isn't "lost" until a full day is missed).
 */
export function currentStreak(activity: Readonly<Record<string, number>>, today: string): number {
  const active = (key: string): boolean => (activity[key] ?? 0) > 0;
  let cursor = active(today) ? today : addDays(today, -1);
  let streak = 0;
  while (active(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(activity: Readonly<Record<string, number>>): number {
  const days = Object.keys(activity)
    .filter((k) => (activity[k] ?? 0) > 0)
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | undefined;
  for (const day of days) {
    run = prev !== undefined && addDays(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

/** Last `n` days (oldest first) with their activity counts, for a mini heatmap. */
export function lastNDays(
  activity: Readonly<Record<string, number>>,
  today: string,
  n: number,
): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    out.push({ day, count: activity[day] ?? 0 });
  }
  return out;
}
