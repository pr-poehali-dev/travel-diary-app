import type { RouteType, ExpenseCategory, NoteTag } from '@/types';

export const ROUTE_TYPE_CONFIG: Record<
  RouteType,
  { label: string; emoji: string; color: string; bgColor: string; borderColor: string; badgeClass: string }
> = {
  planned: {
    label: 'Планируемый',
    emoji: '🔵',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  active: {
    label: 'Активный',
    emoji: '🟢',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  spontaneous: {
    label: 'Спонтанный',
    emoji: '🟡',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

export const EXPENSE_CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string; bgClass: string }
> = {
  food: { label: 'Еда', emoji: '🍽', color: 'text-orange-600', bgClass: 'bg-orange-50' },
  transport: { label: 'Транспорт', emoji: '⛽', color: 'text-blue-600', bgClass: 'bg-blue-50' },
  accommodation: { label: 'Жильё', emoji: '🏨', color: 'text-purple-600', bgClass: 'bg-purple-50' },
  souvenirs: { label: 'Сувениры', emoji: '🎁', color: 'text-pink-600', bgClass: 'bg-pink-50' },
  entertainment: { label: 'Развлечения', emoji: '🎟', color: 'text-indigo-600', bgClass: 'bg-indigo-50' },
  other: { label: 'Прочее', emoji: '📦', color: 'text-gray-600', bgClass: 'bg-gray-50' },
};

export const BLOG_TAGS: NoteTag[] = [
  '#пост',
  '#гайд',
  '#идея',
  '#черновик',
  '#спонтан',
];

export const TAG_CONFIG: Record<string, { color: string; bg: string }> = {
  '#пост': { color: 'text-violet-700', bg: 'bg-violet-100' },
  '#гайд': { color: 'text-teal-700', bg: 'bg-teal-100' },
  '#идея': { color: 'text-amber-700', bg: 'bg-amber-100' },
  '#черновик': { color: 'text-gray-700', bg: 'bg-gray-100' },
  '#спонтан': { color: 'text-rose-700', bg: 'bg-rose-100' },
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽';
}
