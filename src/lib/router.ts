import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tiny hash router. Hash routes work on GitHub Pages without server rewrites
 * and keep the service worker's navigation fallback simple.
 */
export type Route =
  | { name: 'today' }
  | { name: 'learn'; topic?: string }
  | { name: 'lesson'; id: string }
  | { name: 'quiz'; mode?: string }
  | { name: 'cards' }
  | { name: 'progress' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [head, arg] = parts;
  switch (head) {
    case 'learn':
      return arg ? { name: 'learn', topic: arg } : { name: 'learn' };
    case 'lesson':
      return arg ? { name: 'lesson', id: arg } : { name: 'learn' };
    case 'quiz':
      return arg ? { name: 'quiz', mode: arg } : { name: 'quiz' };
    case 'cards':
      return { name: 'cards' };
    case 'progress':
      return { name: 'progress' };
    default:
      return { name: 'today' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'today':
      return '#/today';
    case 'learn':
      return route.topic ? `#/learn/${encodeURIComponent(route.topic)}` : '#/learn';
    case 'lesson':
      return `#/lesson/${encodeURIComponent(route.id)}`;
    case 'quiz':
      return route.mode ? `#/quiz/${encodeURIComponent(route.mode)}` : '#/quiz';
    case 'cards':
      return '#/cards';
    case 'progress':
      return '#/progress';
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

const getHash = (): string => window.location.hash;

export function useRoute(): [Route, (r: Route) => void] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  const navigate = useCallback((r: Route) => {
    window.location.hash = routeToHash(r);
    window.scrollTo({ top: 0 });
  }, []);
  return [parseHash(hash), navigate];
}
