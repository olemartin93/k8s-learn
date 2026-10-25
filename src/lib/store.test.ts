import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { lessons } from '../data/lessons';
import { quiz } from '../data/quiz';
import { DAILY_QUIZ_SIZE, dailyCards, dailyQuiz, lessonOfTheDay, practiceQuiz } from './daily';
import { __testing, actions, getState, initialState, parseState, STORAGE_KEY, type AppState } from './store';

const DAY = '2026-10-25';

beforeEach(() => {
  localStorage.clear();
  __testing.setClock(() => new Date(2026, 9, 25, 12));
  actions.reset();
});

afterEach(() => {
  __testing.resetClock();
});

describe('store', () => {
  it('records lessons, answers and cards and persists them', () => {
    actions.markLessonRead('wl-pods');
    actions.answerQuestion('q-wl-1', true);
    actions.answerQuestion('q-wl-2', false);
    actions.gradeCard('f-pod', 'good');

    const s = getState();
    expect(s.lessonsRead['wl-pods']).toBe(DAY);
    expect(s.quiz['q-wl-1']).toEqual({ correct: 1, wrong: 0, lastWrong: false });
    expect(s.quiz['q-wl-2']).toEqual({ correct: 0, wrong: 1, lastWrong: true });
    expect(s.cards['f-pod']).toMatchObject({ box: 1 });
    expect(s.activity[DAY]).toBe(4);

    __testing.reload();
    expect(getState().lessonsRead['wl-pods']).toBe(DAY);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ version: 1 });
  });

  it('does not double count re-reading a lesson', () => {
    actions.markLessonRead('wl-pods');
    actions.markLessonRead('wl-pods');
    expect(getState().activity[DAY]).toBe(1);
  });

  it('clears a mistake once answered correctly', () => {
    actions.answerQuestion('q-wl-1', false);
    actions.answerQuestion('q-wl-1', true);
    expect(getState().quiz['q-wl-1']).toEqual({ correct: 1, wrong: 1, lastWrong: false });
  });

  it('tolerates corrupt or foreign storage', () => {
    expect(parseState(null)).toBe(initialState);
    expect(parseState('not json')).toBe(initialState);
    expect(parseState('{"version":99}')).toBe(initialState);
    expect(parseState('{"version":1,"quiz":[1,2]}').quiz).toEqual({});
  });

  it('imports a valid backup and rejects junk', () => {
    expect(actions.importState('garbage')).toBe(false);
    const backup: AppState = { ...initialState, lessonsRead: { 'hist-borg': '2026-01-01' } };
    expect(actions.importState(JSON.stringify(backup))).toBe(true);
    expect(getState().lessonsRead['hist-borg']).toBe('2026-01-01');
  });
});

describe('daily plan', () => {
  it('returns the same lesson all day and the read lesson after reading it', () => {
    const a = lessonOfTheDay(DAY, getState());
    expect(lessonOfTheDay(DAY, getState())).toBe(a);
    actions.markLessonRead(a.id);
    expect(lessonOfTheDay(DAY, getState())).toBe(a);
  });

  it('prefers unread lessons', () => {
    const readAllButOne: AppState = {
      ...initialState,
      lessonsRead: Object.fromEntries(lessons.slice(1).map((l) => [l.id, '2026-01-01'])),
    };
    expect(lessonOfTheDay(DAY, readAllButOne).id).toBe(lessons[0]?.id);
  });

  it('builds a daily quiz of unique, interleaved questions', () => {
    const q = dailyQuiz(DAY, getState());
    expect(q).toHaveLength(DAILY_QUIZ_SIZE);
    expect(new Set(q.map((x) => x.id)).size).toBe(DAILY_QUIZ_SIZE);
    expect(new Set(q.map((x) => x.topic)).size).toBe(DAILY_QUIZ_SIZE);
    expect(dailyQuiz(DAY, getState())).toEqual(q);
  });

  it('brings back previous mistakes in the daily quiz', () => {
    const missed = quiz[10];
    if (!missed) throw new Error('fixture');
    actions.answerQuestion(missed.id, false);
    expect(dailyQuiz(DAY, getState()).map((x) => x.id)).toContain(missed.id);
  });

  it('limits new flashcards per day so the daily task can be completed', () => {
    const first = dailyCards(DAY, getState());
    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBeLessThanOrEqual(8);
    for (const id of first) actions.gradeCard(id, 'good');
    // Graded cards are not due until tomorrow and today's new-card budget is used up.
    expect(dailyCards(DAY, getState())).toEqual([]);
  });

  it('builds topic and mistake practice rounds', () => {
    expect(practiceQuiz('rancher', getState(), 50).every((q) => q.topic === 'rancher')).toBe(true);
    expect(practiceQuiz('all', getState(), 10)).toHaveLength(10);
    expect(practiceQuiz('mistakes', getState(), 10)).toHaveLength(0);
  });
});
