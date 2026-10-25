import { describe, expect, it } from 'vitest';
import { flashcards } from './flashcards';
import { lessons } from './lessons';
import { quiz } from './quiz';
import { S, TRUSTED_DOMAINS } from './sources';
import { getTopic, topics } from './topics';
import { TOPIC_IDS, type Source } from './types';

const allSources: Source[] = [
  ...Object.values(S),
  ...lessons.map((l) => l.source),
  ...quiz.map((q) => q.source),
  ...flashcards.map((f) => f.source),
];

function isTrusted(url: string): boolean {
  const host = new URL(url).hostname;
  return TRUSTED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

describe('content integrity', () => {
  it('defines every topic exactly once with a tag', () => {
    expect(topics.map((t) => t.id).sort()).toEqual([...TOPIC_IDS].sort());
    for (const t of topics) {
      expect(t.tag.length).toBeGreaterThan(0);
      expect(t.tag.length).toBeLessThanOrEqual(16);
      expect(getTopic(t.id)).toBe(t);
    }
  });

  it('has unique ids across lessons, questions and cards', () => {
    const ids = [...lessons, ...quiz, ...flashcards].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every topic with lessons, quiz questions and flashcards', () => {
    for (const id of TOPIC_IDS) {
      expect(lessons.some((l) => l.topic === id), `lesson for ${id}`).toBe(true);
      expect(quiz.filter((q) => q.topic === id).length, `quiz for ${id}`).toBeGreaterThanOrEqual(4);
      expect(flashcards.some((f) => f.topic === id), `cards for ${id}`).toBe(true);
    }
  });

  it('includes the requested platform and history topics', () => {
    for (const id of ['docker-desktop', 'rancher', 'history'] as const) {
      expect(lessons.filter((l) => l.topic === id).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('has well-formed quiz questions', () => {
    for (const q of quiz) {
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      expect(Number.isInteger(q.answer), q.id).toBe(true);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, `${q.id} has duplicate options`).toBe(q.options.length);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
    }
  });

  it('has non-empty lessons with a TL;DR and key points', () => {
    for (const l of lessons) {
      expect(l.tldr.length, l.id).toBeGreaterThan(20);
      expect(l.tldr.length, `${l.id} TL;DR should stay short`).toBeLessThan(260);
      expect(l.points.length, l.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('links every item to an https source on a trusted, official domain', () => {
    for (const s of allSources) {
      const url = new URL(s.url);
      expect(url.protocol, s.url).toBe('https:');
      expect(isTrusted(s.url), `untrusted source: ${s.url}`).toBe(true);
      expect(s.title.length).toBeGreaterThan(3);
    }
  });
});
