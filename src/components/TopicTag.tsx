import { getTopic } from '../data/topics';
import type { TopicId } from '../data/types';

interface TopicTagProps {
  readonly topic: TopicId;
  readonly onClick?: () => void;
}

export function TopicTag({ topic, onClick }: TopicTagProps) {
  const t = getTopic(topic);
  const className = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${t.chipClass}`;
  const content = (
    <>
      <span aria-hidden="true">{t.emoji}</span>
      {t.tag}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} data-testid="topic-tag">
        {content}
      </button>
    );
  }
  return (
    <span className={className} data-testid="topic-tag">
      {content}
    </span>
  );
}
