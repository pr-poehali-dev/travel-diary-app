import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, BookOpen, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import CreateRouteDialog from '@/components/CreateRouteDialog';
import RouteBadge from '@/components/RouteBadge';
import { formatDate, formatMoney, ROUTE_TYPE_CONFIG } from '@/lib/routeUtils';
import type { RouteType } from '@/types';

const TYPE_FILTER: { value: RouteType | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'planned', label: '🗺 Планируемые' },
  { value: 'active', label: '✈️ Активные' },
  { value: 'spontaneous', label: '⚡ Спонтанные' },
];

export default function Index() {
  const navigate = useNavigate();
  const store = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<RouteType | 'all'>('all');

  const filtered = store.routes.filter((r) => {
    const matchType = filter === 'all' || r.type === filter;
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.destination?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total: store.routes.length,
    active: store.routes.filter((r) => r.type === 'active').length,
    notes: store.notes.length,
    expenses: store.expenses.reduce((sum, e) => sum + e.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Тревел-дневник</h1>
              <p className="text-xs text-slate-400">Фиксируй моменты, пиши посты</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Маршрут
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <MapPin className="w-4 h-4" />, val: stats.total, label: 'Маршрутов', color: 'text-indigo-600' },
            { icon: <span className="text-base">✈️</span>, val: stats.active, label: 'В пути', color: 'text-emerald-600' },
            { icon: <BookOpen className="w-4 h-4" />, val: stats.notes, label: 'Заметок', color: 'text-violet-600' },
            { icon: <span className="text-base">₽</span>, val: formatMoney(stats.expenses), label: 'Расходов', color: 'text-rose-600', small: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <div className={`font-bold text-slate-900 ${s.small ? 'text-xs' : 'text-lg'} leading-tight`}>{s.val}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Поиск и фильтры */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по маршрутам..."
              className="pl-9 rounded-xl border-slate-200"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TYPE_FILTER.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Список маршрутов */}
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowCreate(true)} hasRoutes={store.routes.length > 0} />
        ) : (
          <div className="space-y-3">
            {filtered.map((route) => {
              const noteCount = store.notes.filter((n) => n.routeId === route.id).length;
              const expSum = store.expenses
                .filter((e) => e.routeId === route.id)
                .reduce((s, e) => s + e.amount, 0);
              const cfg = ROUTE_TYPE_CONFIG[route.type];

              return (
                <button
                  key={route.id}
                  onClick={() => navigate(`/route/${route.id}`)}
                  className={`w-full text-left bg-white rounded-2xl border ${cfg.borderColor} shadow-sm hover:shadow-md transition-all p-4 group`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <RouteBadge type={route.type} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-700 transition-colors">
                        {route.title}
                      </h3>
                      {route.destination && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {route.destination}
                        </p>
                      )}
                      {(route.dateStart || route.dateEnd) && (
                        <p className="text-xs text-slate-400 mt-1">
                          {route.dateStart && formatDate(route.dateStart)}
                          {route.dateEnd && ` — ${formatDate(route.dateEnd)}`}
                        </p>
                      )}
                    </div>
                    <div className="text-2xl">{cfg.emoji.replace('🔵', '🗺').replace('🟢', '✈️').replace('🟡', '⚡')}</div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {noteCount} заметок
                    </span>
                    {expSum > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span>💰</span>
                        {formatMoney(expSum)}
                      </span>
                    )}
                    {route.places && route.places.length > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.places.filter((p) => p.visited).length}/{route.places.length} точек
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {formatDate(route.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <CreateRouteDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          const id = store.addRoute(data);
          navigate(`/route/${id}`);
        }}
      />
    </div>
  );
}

function EmptyState({ onAdd, hasRoutes }: { onAdd: () => void; hasRoutes: boolean }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4">{hasRoutes ? '🔍' : '🗺'}</div>
      <h3 className="font-bold text-slate-800 text-xl mb-2">
        {hasRoutes ? 'Ничего не найдено' : 'Начни свой первый маршрут'}
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
        {hasRoutes
          ? 'Попробуй изменить фильтры или поисковый запрос'
          : 'Запланируй поездку, зафиксируй спонтанный момент или начни вести дневник прямо сейчас'}
      </p>
      {!hasRoutes && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={onAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Создать маршрут
          </Button>
          <Button variant="outline" className="rounded-xl gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Быстрая заметка
          </Button>
        </div>
      )}
    </div>
  );
}
