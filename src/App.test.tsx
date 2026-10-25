import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { UpdatePrompt } from './components/UpdatePrompt';
import { lessons } from './data/lessons';
import { actions, getState } from './lib/store';

const sw = vi.hoisted(() => ({ offlineReady: false, needRefresh: false, update: vi.fn() }));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [sw.offlineReady, vi.fn()],
    needRefresh: [sw.needRefresh, vi.fn()],
    updateServiceWorker: sw.update,
  }),
}));

beforeEach(() => {
  actions.reset();
  window.location.hash = '';
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

function nav() {
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

describe('App', () => {
  it('shows the app name and today’s plan', () => {
    render(<App />);
    expect(screen.getByText('K8S learn')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Today’s plan' })).toBeInTheDocument();
    expect(screen.getByTestId('streak')).toHaveTextContent('0');
    expect(screen.getAllByTestId('topic-tag').length).toBeGreaterThan(0);
  });

  it('navigates between all tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(nav().getByRole('button', { name: /Learn/ }));
    expect(screen.getByRole('heading', { name: 'Learn' })).toBeInTheDocument();

    await user.click(nav().getByRole('button', { name: /Quiz/ }));
    expect(screen.getByRole('heading', { name: 'Quiz' })).toBeInTheDocument();

    await user.click(nav().getByRole('button', { name: /Cards/ }));
    expect(screen.getByRole('heading', { name: 'Flashcards' })).toBeInTheDocument();

    await user.click(nav().getByRole('button', { name: /Progress/ }));
    expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument();

    await user.click(nav().getByRole('button', { name: /Today/ }));
    expect(screen.getByRole('heading', { name: 'Today’s plan' })).toBeInTheDocument();
  });

  it('filters lessons by topic tag and marks a lesson as learned', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(nav().getByRole('button', { name: /Learn/ }));
    await user.click(screen.getByRole('tab', { name: /Rancher/ }));

    const rancherLessons = lessons.filter((l) => l.topic === 'rancher');
    for (const l of rancherLessons) expect(screen.getByText(l.title)).toBeInTheDocument();
    expect(screen.queryByText('Pods')).not.toBeInTheDocument();

    const first = rancherLessons[0];
    if (!first) throw new Error('fixture');
    await user.click(screen.getByText(first.title));
    expect(screen.getByText('TL;DR')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Source:/ })).toHaveAttribute('href', first.source.url);

    await user.click(screen.getByRole('button', { name: 'Mark as learned' }));
    expect(screen.getByRole('button', { name: '✓ Learned' })).toBeDisabled();
    expect(getState().lessonsRead[first.id]).toBeDefined();
  });

  it('runs the daily quiz to completion', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Start daily quiz' }));
    for (let i = 0; i < 5; i++) {
      const quizEl = within(screen.getByTestId('quiz'));
      const options = quizEl.getAllByRole('listitem').map((li) => within(li).getByRole('button'));
      const firstOption = options[0];
      if (!firstOption) throw new Error('no options');
      await user.click(firstOption);
      await user.click(quizEl.getByRole('button', { name: i === 4 ? 'See results' : 'Next question' }));
    }
    expect(screen.getByText(/You scored \d \/ 5/)).toBeInTheDocument();
    expect(Object.values(getState().dailyQuizDone)).toContain(true);
    expect(screen.getByText('Completed — nice!')).toBeInTheDocument();
  });

  it('reviews flashcards from the Cards tab', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(nav().getByRole('button', { name: /Cards/ }));
    await user.click(screen.getByRole('button', { name: 'Reveal answer' }));
    await user.click(screen.getByRole('button', { name: /Got it/ }));
    expect(Object.keys(getState().cards)).toHaveLength(1);
  });

  it('opens a lesson directly from a deep link', () => {
    window.location.hash = '#/lesson/hist-borg';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Borg and Omega' })).toBeInTheDocument();
  });

  it('shows an offline badge when the network is lost', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<App />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe('UpdatePrompt', () => {
  it('renders nothing when there is no update', () => {
    sw.offlineReady = false;
    sw.needRefresh = false;
    const { container } = render(<UpdatePrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('offers to update when a new version is waiting', async () => {
    sw.needRefresh = true;
    const user = userEvent.setup();
    render(<UpdatePrompt />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(sw.update).toHaveBeenCalledWith(true);
    sw.needRefresh = false;
  });

  it('tells the user when the app is ready offline', () => {
    sw.offlineReady = true;
    render(<UpdatePrompt />);
    expect(screen.getByRole('alert')).toHaveTextContent('Ready to work offline');
    sw.offlineReady = false;
  });
});
