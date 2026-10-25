import { flashcards } from '../data/flashcards';
import { lessons } from '../data/lessons';
import { quiz } from '../data/quiz';
import type { Lesson, QuizQuestion, TopicId } from '../data/types';
import { dayNumber } from './date';
import { hashString, mulberry32, shuffle } from './random';
import { selectSession } from './srs';
import type { AppState } from './store';

export const DAILY_QUIZ_SIZE = 5;
export const DAILY_NEW_CARDS = 8;
export const DAILY_MAX_CARDS = 20;

/**
 * Today's lesson: walks through unread lessons in a stable, day-seeded order,
 * so the same lesson shows all day and tomorrow brings a new one.
 */
export function lessonOfTheDay(day: string, state: AppState, all: readonly Lesson[] = lessons): Lesson {
  const readToday = all.find((l) => state.lessonsRead[l.id] === day);
  if (readToday) return readToday;
  const unread = all.filter((l) => state.lessonsRead[l.id] === undefined);
  const pool = unread.length > 0 ? unread : all;
  const order = shuffle(pool, mulberry32(hashString('lessons')));
  const pick = order[dayNumber(day) % order.length];
  if (!pick) throw new Error('No lessons available');
  return pick;
}

/**
 * Today's quiz: previously-missed questions first (retrieval practice of weak
 * spots), then unseen ones, then the rest — interleaved across topics.
 */
export function dailyQuiz(day: string, state: AppState, all: readonly QuizQuestion[] = quiz): QuizQuestion[] {
  const rand = mulberry32(hashString(`quiz:${day}`));
  const mistakes = shuffle(all.filter((q) => state.quiz[q.id]?.lastWrong === true), rand);
  const unseen = shuffle(all.filter((q) => state.quiz[q.id] === undefined), rand);
  const rest = shuffle(
    all.filter((q) => state.quiz[q.id] !== undefined && state.quiz[q.id]?.lastWrong !== true),
    rand,
  );
  const picked: QuizQuestion[] = [];
  const usedTopics = new Set<TopicId>();
  const take = (pool: QuizQuestion[], preferNewTopic: boolean): void => {
    for (const q of pool) {
      if (picked.length >= DAILY_QUIZ_SIZE) return;
      if (picked.includes(q)) continue;
      if (preferNewTopic && usedTopics.has(q.topic)) continue;
      picked.push(q);
      usedTopics.add(q.topic);
    }
  };
  take(mistakes.slice(0, 2), false);
  take(unseen, true);
  take(rest, true);
  take(unseen, false);
  take(rest, false);
  take(mistakes, false);
  return picked;
}

export function dailyCards(day: string, state: AppState): string[] {
  const ids = flashcards.map((c) => c.id);
  const ordered = shuffle(ids, mulberry32(hashString('cards')));
  const { due, fresh } = selectSession(ordered, state.cards, day, DAILY_NEW_CARDS, DAILY_MAX_CARDS);
  return [...due, ...fresh];
}

/** Build a practice quiz for a topic (or all topics), in random order with shuffled answers. */
export function practiceQuiz(
  topic: TopicId | 'all' | 'mistakes',
  state: AppState,
  size: number,
  rand: () => number = Math.random,
  all: readonly QuizQuestion[] = quiz,
): QuizQuestion[] {
  const pool =
    topic === 'all'
      ? all
      : topic === 'mistakes'
        ? all.filter((q) => state.quiz[q.id]?.lastWrong === true)
        : all.filter((q) => q.topic === topic);
  return shuffle(pool, rand).slice(0, size);
}
