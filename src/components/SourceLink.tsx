import type { Source } from '../data/types';

export function SourceLink({ source }: { readonly source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-start gap-1 text-xs text-brand-600 underline-offset-2 hover:underline dark:text-brand-100"
    >
      <span aria-hidden="true">📖</span>
      <span>
        Source: {source.title}
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
    </a>
  );
}
