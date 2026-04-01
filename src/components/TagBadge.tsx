import { TAG_CONFIG } from '@/lib/routeUtils';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function TagBadge({ tag, onRemove, size = 'sm' }: TagBadgeProps) {
  const cfg = TAG_CONFIG[tag] ?? { color: 'text-slate-700', bg: 'bg-slate-100' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClass} ${cfg.color} ${cfg.bg} border-transparent`}
    >
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity leading-none ml-0.5"
          type="button"
          aria-label={`Удалить тег ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
