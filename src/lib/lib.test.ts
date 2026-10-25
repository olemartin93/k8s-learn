import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, parseDateKey, toDateKey } from './date';
import { hashString, mulberry32, shuffle } from './random';
import { parseHash, routeToHash, type Route } from './router';
import { gradeCard, isDue, isMastered, MAX_BOX, selectSession } from './srs';
import { currentStreak, lastNDays, longestStreak } from './streak';

describe('date helpers', () => {
  it('formats and parses local date keys', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(parseDateKey('2026-12-31'))).toBe('2026-12-31');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('computes days between dates (DST safe)', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
  });

  it('rejects invalid keys', () => {
    expect(() => parseDateKey('nope')).toThrow();
  });
});

describe('random helpers', () => {
  it('is deterministic for the same seed', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], mulberry32(42));
    const b = shuffle([1, 2, 3, 4, 5, 6], mulberry32(42));
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3];
    shuffle(input, mulberry32(1));
    expect(input).toEqual([1, 2, 3]);
  });

  it('hashes strings stably', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });
});

describe('spaced repetition (Leitner)', () => {
  const today = '2026-10-25';

  it('promotes a new card to box 1 due tomorrow when known', () => {
    expect(gradeCard(undefined, 'good', today)).toEqual({ box: 1, due: '2026-10-26', reviews: 1, introduced: today });
  });

  it('doubles the interval as the card climbs boxes', () => {
    let s = gradeCard(undefined, 'good', today);
    s = gradeCard(s, 'good', today);
    expect(s).toMatchObject({ box: 2, due: '2026-10-27' });
    s = gradeCard(s, 'good', today);
    expect(s).toMatchObject({ box: 3, due: '2026-10-29' });
  });

  it('caps at the max box', () => {
    let s = gradeCard(undefined, 'good', today);
    for (let i = 0; i < 20; i++) s = gradeCard(s, 'good', today);
    expect(s.box).toBe(MAX_BOX);
  });

  it('sends a missed card back to box 1', () => {
    const s = gradeCard({ box: 4, due: today, reviews: 5, introduced: '2026-09-01' }, 'again', today);
    expect(s).toEqual({ box: 1, due: '2026-10-26', reviews: 6, introduced: '2026-09-01' });
  });

  it('knows when cards are due and mastered', () => {
    expect(isDue(undefined, today)).toBe(true);
    expect(isDue({ box: 1, due: '2026-10-26', reviews: 1 }, today)).toBe(false);
    expect(isDue({ box: 1, due: '2026-10-20', reviews: 1 }, today)).toBe(true);
    expect(isMastered({ box: 4, due: today, reviews: 4 })).toBe(true);
    expect(isMastered({ box: 3, due: today, reviews: 3 })).toBe(false);
  });

  it('selects due reviews (oldest first) and limits new cards', () => {
    const states = {
      a: { box: 1, due: '2026-10-24', reviews: 1 },
      b: { box: 2, due: '2026-10-20', reviews: 2 },
      c: { box: 2, due: '2026-11-20', reviews: 2 },
    };
    const sel = selectSession(['a', 'b', 'c', 'd', 'e', 'f'], states, today, 2, 10);
    expect(sel.due).toEqual(['b', 'a']);
    expect(sel.fresh).toEqual(['d', 'e']);
  });

  it('counts cards introduced today against the new-card limit', () => {
    const states = { a: { box: 1, due: '2026-10-26', reviews: 1, introduced: today } };
    const sel = selectSession(['a', 'b', 'c', 'd'], states, today, 2, 10);
    expect(sel.fresh).toEqual(['b']);
  });

  it('respects the max session size', () => {
    const sel = selectSession(['a', 'b', 'c'], {}, today, 10, 2);
    expect(sel.fresh).toHaveLength(2);
  });
});

describe('streaks', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak({ '2026-10-23': 1, '2026-10-24': 2, '2026-10-25': 1 }, '2026-10-25')).toBe(3);
  });

  it('keeps the streak alive until a full day is missed', () => {
    expect(currentStreak({ '2026-10-23': 1, '2026-10-24': 1 }, '2026-10-25')).toBe(2);
    expect(currentStreak({ '2026-10-22': 1, '2026-10-23': 1 }, '2026-10-25')).toBe(0);
  });

  it('finds the longest streak', () => {
    expect(longestStreak({ '2026-01-01': 1, '2026-01-02': 1, '2026-01-03': 1, '2026-01-10': 1 })).toBe(3);
    expect(longestStreak({})).toBe(0);
  });

  it('lists the last n days oldest first', () => {
    const days = lastNDays({ '2026-10-25': 3 }, '2026-10-25', 3);
    expect(days).toEqual([
      { day: '2026-10-23', count: 0 },
      { day: '2026-10-24', count: 0 },
      { day: '2026-10-25', count: 3 },
    ]);
  });
});

describe('router', () => {
  it('parses hashes', () => {
    expect(parseHash('')).toEqual({ name: 'today' });
    expect(parseHash('#/learn')).toEqual({ name: 'learn' });
    expect(parseHash('#/learn/rancher')).toEqual({ name: 'learn', topic: 'rancher' });
    expect(parseHash('#/lesson/wl-pods')).toEqual({ name: 'lesson', id: 'wl-pods' });
    expect(parseHash('#/quiz')).toEqual({ name: 'quiz' });
    expect(parseHash('#/garbage')).toEqual({ name: 'today' });
  });

  it('round-trips routes', () => {
    const routes: Route[] = [
      { name: 'today' },
      { name: 'learn', topic: 'docker-desktop' },
      { name: 'lesson', id: 'hist-borg' },
      { name: 'cards' },
      { name: 'progress' },
    ];
    for (const r of routes) expect(parseHash(routeToHash(r))).toEqual(r);
  });
});
