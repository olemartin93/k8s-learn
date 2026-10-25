export const TOPIC_IDS = [
  'basics',
  'architecture',
  'workloads',
  'networking',
  'storage',
  'config',
  'security',
  'scheduling',
  'kubectl',
  'ecosystem',
  'docker-desktop',
  'rancher',
  'history',
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export interface Topic {
  readonly id: TopicId;
  readonly name: string;
  /** Short label shown in the small tag chip. */
  readonly tag: string;
  readonly emoji: string;
  readonly description: string;
  /** Tailwind classes for the tag chip (light + dark). */
  readonly chipClass: string;
}

export interface Source {
  readonly title: string;
  readonly url: string;
}

export interface Lesson {
  readonly id: string;
  readonly topic: TopicId;
  readonly title: string;
  /** One or two sentence TL;DR. */
  readonly tldr: string;
  /** Key points to remember. */
  readonly points: readonly string[];
  /** Optional short command / YAML example. */
  readonly example?: string;
  readonly source: Source;
}

export interface QuizQuestion {
  readonly id: string;
  readonly topic: TopicId;
  readonly question: string;
  readonly options: readonly string[];
  /** Index into `options`. */
  readonly answer: number;
  readonly explanation: string;
  readonly source: Source;
}

export interface Flashcard {
  readonly id: string;
  readonly topic: TopicId;
  readonly front: string;
  readonly back: string;
  readonly source: Source;
}
