import { useState, useMemo } from 'react';
import { Copy, Check, FileText, BookOpen, Map } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BLOG_TAGS, EXPENSE_CATEGORY_CONFIG, formatDate, formatDateTime, formatMoney } from '@/lib/routeUtils';
import type { TravelRoute, Note, Expense, NoteTag } from '@/types';

interface ExportSheetProps {
  open: boolean;
  onClose: () => void;
  route: TravelRoute;
  notes: Note[];
  expenses: Expense[];
}

function buildPostText(notes: Note[], filterTag: NoteTag | null, route: TravelRoute): string {
  const sorted = [...notes]
    .filter((n) => !filterTag || n.tags.includes(filterTag))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (!sorted.length) return '(Нет заметок для этого фильтра)';

  const header = `**${route.title}**\n${route.destination ? `📍 ${route.destination}` : ''}${route.dateStart ? `\n📅 ${formatDate(route.dateStart)}${route.dateEnd ? ` — ${formatDate(route.dateEnd)}` : ''}` : ''}\n\n---\n`;

  const body = sorted
    .map((n) => {
      const tagStr = n.tags.length ? ` ${n.tags.join(' ')}` : '';
      const geo = n.location ? ` 📍 ${n.location.label}` : '';
      return `_${formatDateTime(n.createdAt)}${geo}${tagStr}_\n\n${n.text}`;
    })
    .join('\n\n---\n\n');

  return header + body;
}

function buildSummaryText(route: TravelRoute, notes: Note[], expenses: Expense[]): string {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const catLines = Object.entries(byCategory)
    .map(([cat, sum]) => {
      const c = EXPENSE_CATEGORY_CONFIG[cat as keyof typeof EXPENSE_CATEGORY_CONFIG];
      return `  ${c.emoji} ${c.label}: ${formatMoney(sum)}`;
    })
    .join('\n');

  const placeLines =
    route.places && route.places.length > 0
      ? route.places
          .map((p) => `  ${p.visited ? '✅' : '⬜'} ${p.name} (${p.type})`)
          .join('\n')
      : '  —';

  return `# Итоги поездки: ${route.title}

📍 ${route.destination || '—'}
${route.dateStart ? `📅 ${formatDate(route.dateStart)}${route.dateEnd ? ` — ${formatDate(route.dateEnd)}` : ''}` : ''}

## Маршрут
${placeLines}

## Статистика
📝 Заметок: ${notes.length}
💰 Итого расходов: ${formatMoney(total)}

## Расходы по категориям
${catLines || '  —'}

## Хронология заметок
${[...notes]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((n) => `_${formatDateTime(n.createdAt)}_ — ${n.text.slice(0, 100)}${n.text.length > 100 ? '...' : ''}`)
    .join('\n')
    || '—'}
`;
}

function buildGuideText(route: TravelRoute, notes: Note[], expenses: Expense[]): string {
  const guideNotes = notes.filter((n) => n.tags.includes('#гайд'));
  const foodExp = expenses.filter((e) => e.category === 'food');
  const accomExp = expenses.filter((e) => e.category === 'accommodation');

  const noteLines = guideNotes.length
    ? guideNotes
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((n) => `• ${n.text}`)
        .join('\n\n')
    : '(нет заметок с тегом #гайд)';

  const foodLines = foodExp.length
    ? foodExp.map((e) => {
        const f = e as Extract<typeof e, { category: 'food' }>;
        return `• ${f.place || 'Заведение'}: ${formatMoney(f.amount)}${f.dish ? `, ${f.dish}` : ''}${f.rating ? ` ${'⭐'.repeat(f.rating)}` : ''}`;
      }).join('\n')
    : '—';

  const accomLines = accomExp.length
    ? accomExp.map((e) => {
        const a = e as Extract<typeof e, { category: 'accommodation' }>;
        return `• ${a.placeName || 'Жильё'}: ${formatMoney(a.amount)}${a.nights ? ` (${a.nights} ночей)` : ''}${a.accomType ? `, ${a.accomType}` : ''}${a.comfort ? ` ${'⭐'.repeat(a.comfort)}` : ''}`;
      }).join('\n')
    : '—';

  return `# Гайд: ${route.title}
📍 ${route.destination || '—'}

## Советы и полезное
${noteLines}

## Где поесть
${foodLines}

## Где остановиться
${accomLines}
`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button
      onClick={copy}
      variant="outline"
      size="sm"
      className={`rounded-xl gap-1.5 transition-all ${copied ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : ''}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Скопировано!' : 'Скопировать'}
    </Button>
  );
}

function TextPreview({ text }: { text: string }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-80 overflow-y-auto">
      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{text}</pre>
    </div>
  );
}

export default function ExportSheet({ open, onClose, route, notes, expenses }: ExportSheetProps) {
  const [postTag, setPostTag] = useState<NoteTag | null>(null);

  const postText = useMemo(() => buildPostText(notes, postTag, route), [notes, postTag, route]);
  const summaryText = useMemo(() => buildSummaryText(route, notes, expenses), [route, notes, expenses]);
  const guideText = useMemo(() => buildGuideText(route, notes, expenses), [route, notes, expenses]);

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg font-bold">Экспорт контента</SheetTitle>
          <p className="text-sm text-slate-500">Превращай заметки в готовые посты для блога</p>
        </SheetHeader>

        <Tabs defaultValue="post">
          <TabsList className="w-full bg-slate-100 rounded-xl mb-4 h-auto p-1 grid grid-cols-3">
            <TabsTrigger value="post" className="rounded-lg text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1">
              <FileText className="w-3.5 h-3.5" />
              Пост
            </TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Итоги
            </TabsTrigger>
            <TabsTrigger value="guide" className="rounded-lg text-xs py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1">
              <Map className="w-3.5 h-3.5" />
              Гайд
            </TabsTrigger>
          </TabsList>

          {/* Пост */}
          <TabsContent value="post" className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Фильтр по тегу</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setPostTag(null)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    postTag === null
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Все заметки
                </button>
                {[...BLOG_TAGS, ...allTags.filter((t) => !BLOG_TAGS.includes(t))].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setPostTag(tag === postTag ? null : tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      postTag === tag
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {notes.filter((n) => !postTag || n.tags.includes(postTag)).length} заметок
              </p>
              <CopyButton text={postText} />
            </div>
            <TextPreview text={postText} />
          </TabsContent>

          {/* Итоги */}
          <TabsContent value="summary" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Даты, маршрут, статистика расходов</p>
              <CopyButton text={summaryText} />
            </div>
            <TextPreview text={summaryText} />
          </TabsContent>

          {/* Гайд */}
          <TabsContent value="guide" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Заметки с тегом <span className="font-medium text-teal-700">#гайд</span> + цены на еду и жильё
              </p>
              <CopyButton text={guideText} />
            </div>
            <TextPreview text={guideText} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
