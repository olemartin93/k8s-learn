import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Flashcard, QuizQuestion } from '../data/types';
import { FlashcardSession } from './FlashcardSession';
import { QuizRunner } from './QuizRunner';
import { TopicTag } from './TopicTag';

const source = { title: 'Kubernetes docs – Pods', url: 'https://kubernetes.io/docs/concepts/workloads/pods/' };

const questions: QuizQuestion[] = [
  {
    id: 't1',
    topic: 'workloads',
    question: 'Smallest deployable unit?',
    options: ['Container', 'Pod', 'Node'],
    answer: 1,
    explanation: 'Pods are the smallest deployable units.',
    source,
  },
  {
    id: 't2',
    topic: 'history',
    question: 'K8s means?',
    options: ['8 letters between K and s', 'Version 8', 'Eight founders'],
    answer: 0,
    explanation: 'It is a numeronym.',
    source,
  },
];

describe('TopicTag', () => {
  it('shows the topic label', () => {
    render(<TopicTag topic="docker-desktop" />);
    expect(screen.getByTestId('topic-tag')).toHaveTextContent('Docker Desktop');
  });
});

describe('QuizRunner', () => {
  it('gives feedback, explanation and source, then a score', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const onFinish = vi.fn();
    render(<QuizRunner questions={questions} onAnswer={onAnswer} onFinish={onFinish} />);

    expect(screen.getByText('Smallest deployable unit?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Pod/ }));
    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('Pods are the smallest deployable units.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Source: Kubernetes docs/ })).toHaveAttribute('href', source.url);
    expect(onAnswer).toHaveBeenLastCalledWith('t1', true);

    // Options are locked after answering.
    expect(screen.getByRole('button', { name: /Container/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next question' }));
    await user.click(screen.getByRole('button', { name: /Version 8/ }));
    expect(screen.getByText('Not quite.')).toBeInTheDocument();
    expect(onAnswer).toHaveBeenLastCalledWith('t2', false);

    await user.click(screen.getByRole('button', { name: 'See results' }));
    expect(screen.getByText('You scored 1 / 2')).toBeInTheDocument();
    expect(onFinish).toHaveBeenCalledWith(1, 2);
  });

  it('handles an empty question list', () => {
    render(<QuizRunner questions={[]} onAnswer={vi.fn()} />);
    expect(screen.getByText(/No questions here yet/)).toBeInTheDocument();
  });
});

describe('FlashcardSession', () => {
  const cards: Flashcard[] = [
    { id: 'c1', topic: 'workloads', front: 'Pod', back: 'Smallest unit', source },
    { id: 'c2', topic: 'networking', front: 'ClusterIP', back: 'Internal virtual IP', source },
  ];

  it('flips, grades and re-queues missed cards once', async () => {
    const user = userEvent.setup();
    const onGrade = vi.fn();
    render(<FlashcardSession cards={cards} onGrade={onGrade} />);

    expect(screen.getByText('Pod')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Got it/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reveal answer' }));
    expect(screen.getByTestId('card-back')).toHaveTextContent('Smallest unit');
    await user.click(screen.getByRole('button', { name: /Again/ }));
    expect(onGrade).toHaveBeenLastCalledWith('c1', 'again');

    await user.click(screen.getByRole('button', { name: 'Reveal answer' }));
    await user.click(screen.getByRole('button', { name: /Got it/ }));
    expect(onGrade).toHaveBeenLastCalledWith('c2', 'good');

    // The missed card comes back at the end.
    expect(screen.getByText('Pod')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reveal answer' }));
    await user.click(screen.getByRole('button', { name: /Got it/ }));

    expect(screen.getByText('All caught up!')).toBeInTheDocument();
    expect(onGrade).toHaveBeenCalledTimes(3);
  });
});
