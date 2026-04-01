import { ROUTE_TYPE_CONFIG } from '@/lib/routeUtils';
import type { RouteType } from '@/types';

interface RouteBadgeProps {
  type: RouteType;
  size?: 'sm' | 'md';
}

export default function RouteBadge({ type, size = 'sm' }: RouteBadgeProps) {
  const cfg = ROUTE_TYPE_CONFIG[type];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClass} ${cfg.badgeClass}`}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}
