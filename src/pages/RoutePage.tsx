import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  MapPin,
  BookOpen,
  DollarSign,
  List,
  Send,
  Trash2,
  Check,
  ChevronRight,
  FileText,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import NoteEditor from '@/components/NoteEditor';
import NoteCard from '@/components/NoteCard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseCard from '@/components/ExpenseCard';
import RouteBadge from '@/components/RouteBadge';
import TagBadge from '@/components/TagBadge';
import ExportSheet from '@/components/ExportSheet';
import {
  formatDate,
  formatMoney,
  EXPENSE_CATEGORY_CONFIG,
  ROUTE_TYPE_CONFIG,
} from '@/lib/routeUtils';
import type { NoteTag, Expense, RouteType } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RoutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStore();

  const route = store.routes.find((r) => r.id === id);
  const notes = id ? store.getNotesByRoute(id) : [];
  const expenses = id ? store.getExpensesByRoute(id) : [];

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

  // Планирование: точки
  const [newPlace, setNewPlace] = useState('');
  const [newPlaceType, setNewPlaceType] = useState('');
  // Планирование: темы постов
  const [newTopic, setNewTopic] = useState('');
  // Планирование: чек-лист
  const [newCheckItem, setNewCheckItem] = useState('');
  const [checkCategory, setCheckCategory] = useState<'docs' | 'things' | 'contacts' | 'other'>('things');

  // Фильтр заметок
  const [noteFilter, setNoteFilter] = useState<NoteTag | 'all'>('all');

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🗺</div>
          <p className="text-slate-600">Маршрут не найден</p>
          <Button onClick={() => navigate('/')} className="mt-4">← На главную</Button>
        </div>
      </div>
    );
  }

  const cfg = ROUTE_TYPE_CONFIG[route.type];
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Сгруппировать расходы по категориям
  const expByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const filteredNotes =
    noteFilter === 'all' ? notes : notes.filter((n) => n.tags.includes(noteFilter));

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  const handleDeleteRoute = () => {
    store.deleteRoute(route.id);
    navigate('/');
  };

  const changeType = (type: RouteType) => {
    store.changeRouteType(route.id, type);
  };

  // Tabs to show depend on type
  const canShowNotes = route.type === 'active' || route.type === 'spontaneous';
  const canShowExpenses = route.type === 'active' || route.type === 'spontaneous';
  const canShowPlan = route.type === 'planned' || route.type === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className={`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b ${cfg.borderColor}`}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-slate-900 text-lg truncate leading-tight">{route.title}</h1>
              {route.destination && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {route.destination}
                  {route.dateStart && ` · ${formatDate(route.dateStart)}`}
                  {route.dateEnd && ` — ${formatDate(route.dateEnd)}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <RouteBadge type={route.type} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs px-2">
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Тип маршрута</DropdownMenuLabel>
                  {(['planned', 'active', 'spontaneous'] as RouteType[]).map((t) => (
                    <DropdownMenuItem key={t} onClick={() => changeType(t)}>
                      {ROUTE_TYPE_CONFIG[t].emoji} {ROUTE_TYPE_CONFIG[t].label}
                      {route.type === t && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowExport(true)} className="text-indigo-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Экспортировать
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить маршрут
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Быстрая статистика */}
          <div className="flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {notes.length} заметок
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatMoney(totalExpenses)}
            </span>
            {route.places && route.places.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {route.places.filter((p) => p.visited).length}/{route.places.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white border border-slate-200 rounded-xl mb-4 h-auto p-1 grid grid-cols-4">
            <TabsTrigger value="notes" className="rounded-lg text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Заметки
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              Расходы
            </TabsTrigger>
            <TabsTrigger value="places" className="rounded-lg text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Точки
            </TabsTrigger>
            <TabsTrigger value="plan" className="rounded-lg text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <List className="w-3.5 h-3.5 mr-1" />
              План
            </TabsTrigger>
          </TabsList>

          {/* ===== ЗАМЕТКИ ===== */}
          <TabsContent value="notes" className="space-y-4">
            {(canShowNotes) ? (
              <>
                <NoteEditor
                  onSave={(text, tags, location) => {
                    store.addNote({ routeId: route.id, text, tags, location });
                  }}
                />

                {/* Фильтр по тегам */}
                {allTags.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => setNoteFilter('all')}
                      className={`whitespace-nowrap text-xs px-3 py-1 rounded-full border transition-all ${
                        noteFilter === 'all'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Все
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setNoteFilter(tag === noteFilter ? 'all' : tag)}
                        className={`whitespace-nowrap text-xs px-3 py-1 rounded-full border transition-all ${
                          noteFilter === tag
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">
                      {notes.length === 0
                        ? 'Пока нет заметок. Запиши первое впечатление!'
                        : 'Нет заметок с этим тегом'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={store.deleteNote}
                        onUpdate={(id, text, tags) => store.updateNote(id, { text, tags })}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <PlannedModeNotice
                onActivate={() => changeType('active')}
                message="В режиме «Планируемый» заметки недоступны. Переведи маршрут в режим «Активный», чтобы начать вести дневник."
              />
            )}
          </TabsContent>

          {/* ===== РАСХОДЫ ===== */}
          <TabsContent value="expenses" className="space-y-4">
            {canShowExpenses ? (
              <>
                {/* Сводка по категориям */}
                {Object.keys(expByCategory).length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800">Итого</h3>
                      <span className="text-lg font-bold text-slate-900">{formatMoney(totalExpenses)}</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(expByCategory).map(([cat, sum]) => {
                        const catCfg = EXPENSE_CATEGORY_CONFIG[cat as keyof typeof EXPENSE_CATEGORY_CONFIG];
                        const pct = Math.round((sum / totalExpenses) * 100);
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">{catCfg.emoji} {catCfg.label}</span>
                              <span className="font-medium text-slate-800">{formatMoney(sum)} <span className="text-slate-400">({pct}%)</span></span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${catCfg.bgClass} rounded-full transition-all`}
                                style={{ width: `${pct}%`, filter: 'brightness(0.85)' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowExpenseForm(true)}
                  className="w-full bg-white text-slate-700 border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600 rounded-2xl h-12"
                  variant="ghost"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить расход
                </Button>

                {expenses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Расходов пока нет</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {expenses.map((exp) => (
                      <ExpenseCard key={exp.id} expense={exp} onDelete={store.deleteExpense} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <PlannedModeNotice
                onActivate={() => changeType('active')}
                message="В режиме «Планируемый» расходы недоступны. Переведи маршрут в режим «Активный»."
              />
            )}
          </TabsContent>

          {/* ===== ТОЧКИ ПОСЕЩЕНИЯ ===== */}
          <TabsContent value="places" className="space-y-4">
            {/* Форма добавления */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Добавить точку</h3>
              <div className="flex gap-2">
                <Input
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  placeholder="Перевал Кату-Ярык"
                  className="flex-1 text-sm rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPlace.trim()) {
                      store.addPlace(route.id, {
                        name: newPlace.trim(),
                        type: newPlaceType.trim() || 'место',
                        visited: false,
                      });
                      setNewPlace('');
                      setNewPlaceType('');
                    }
                  }}
                />
                <Input
                  value={newPlaceType}
                  onChange={(e) => setNewPlaceType(e.target.value)}
                  placeholder="Тип"
                  className="w-24 text-sm rounded-xl"
                />
                <Button
                  onClick={() => {
                    if (!newPlace.trim()) return;
                    store.addPlace(route.id, {
                      name: newPlace.trim(),
                      type: newPlaceType.trim() || 'место',
                      visited: false,
                    });
                    setNewPlace('');
                    setNewPlaceType('');
                  }}
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  disabled={!newPlace.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!route.places || route.places.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Добавь точки маршрута</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 px-1">
                  {route.places.filter((p) => p.visited).length} из {route.places.length} посещено
                </div>
                {route.places.map((place) => (
                  <div
                    key={place.id}
                    className={`bg-white rounded-2xl border shadow-sm p-3.5 flex items-center gap-3 transition-all ${
                      place.visited ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => store.togglePlace(route.id, place.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        place.visited
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {place.visited && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${place.visited ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {place.name}
                      </p>
                      <p className="text-xs text-slate-400">{place.type}</p>
                      {place.visitedAt && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          ✓ {formatDate(place.visitedAt)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => store.deletePlace(route.id, place.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== ПЛАН (темы + чек-лист) ===== */}
          <TabsContent value="plan" className="space-y-6">
            {/* Темы постов */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>✍️</span> Черновики тем постов
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="«О чём рассказать про Чуйский тракт»"
                  className="flex-1 text-sm rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTopic.trim()) {
                      store.addDraftTopic(route.id, newTopic.trim());
                      setNewTopic('');
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (!newTopic.trim()) return;
                    store.addDraftTopic(route.id, newTopic.trim());
                    setNewTopic('');
                  }}
                  size="sm"
                  className="rounded-xl bg-violet-600 hover:bg-violet-700"
                  disabled={!newTopic.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              {route.draftTopics && route.draftTopics.length > 0 ? (
                <div className="space-y-2">
                  {route.draftTopics.map((topic, i) => (
                    <div key={i} className="bg-white rounded-xl border border-violet-100 p-3 flex items-start gap-2 group">
                      <ChevronRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 flex-1">{topic}</p>
                      <button
                        onClick={() => store.deleteDraftTopic(route.id, i)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Темы не добавлены</p>
              )}
            </div>

            {/* Чек-лист */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>✅</span> Чек-лист
              </h3>
              <div className="flex gap-2">
                <select
                  value={checkCategory}
                  onChange={(e) => setCheckCategory(e.target.value as typeof checkCategory)}
                  className="text-xs rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                >
                  <option value="docs">📄 Документы</option>
                  <option value="things">🎒 Вещи</option>
                  <option value="contacts">📞 Контакты</option>
                  <option value="other">📋 Прочее</option>
                </select>
                <Input
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  placeholder="Загранпаспорт, страховка..."
                  className="flex-1 text-sm rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCheckItem.trim()) {
                      store.addChecklistItem(route.id, {
                        text: newCheckItem.trim(),
                        category: checkCategory,
                        checked: false,
                      });
                      setNewCheckItem('');
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (!newCheckItem.trim()) return;
                    store.addChecklistItem(route.id, {
                      text: newCheckItem.trim(),
                      category: checkCategory,
                      checked: false,
                    });
                    setNewCheckItem('');
                  }}
                  size="sm"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  disabled={!newCheckItem.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {!route.checklists || route.checklists.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Список пуст</p>
              ) : (
                <div className="space-y-1.5">
                  {(['docs', 'things', 'contacts', 'other'] as const).map((cat) => {
                    const items = (route.checklists ?? []).filter((c) => c.category === cat);
                    if (!items.length) return null;
                    const catLabel: Record<string, string> = {
                      docs: '📄 Документы',
                      things: '🎒 Вещи',
                      contacts: '📞 Контакты',
                      other: '📋 Прочее',
                    };
                    return (
                      <div key={cat}>
                        <p className="text-xs font-semibold text-slate-500 mb-1 px-1">{catLabel[cat]}</p>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`bg-white rounded-xl border p-3 flex items-center gap-3 mb-1 transition-all group ${
                              item.checked ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-100'
                            }`}
                          >
                            <button
                              onClick={() => store.toggleChecklistItem(route.id, item.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                item.checked
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 hover:border-emerald-400'
                              }`}
                            >
                              {item.checked && <Check className="w-3 h-3" />}
                            </button>
                            <p className={`text-sm flex-1 ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {item.text}
                            </p>
                            <button
                              onClick={() => store.deleteChecklistItem(route.id, item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* FAB Экспорт */}
      <button
        onClick={() => setShowExport(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Экспортировать"
      >
        <FileText className="w-6 h-6" />
      </button>

      <ExpenseForm
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSave={(data) => store.addExpense({ ...data, routeId: route.id })}
      />

      <ExportSheet
        open={showExport}
        onClose={() => setShowExport(false)}
        route={route}
        notes={notes}
        expenses={expenses}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить маршрут?</AlertDialogTitle>
            <AlertDialogDescription>
              Будут удалены все заметки и расходы маршрута «{route.title}». Действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoute} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PlannedModeNotice({
  onActivate,
  message,
}: {
  onActivate: () => void;
  message: string;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">🗺</div>
      <p className="text-slate-600 text-sm mb-4 max-w-sm mx-auto">{message}</p>
      <Button onClick={onActivate} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
        ✈️ Перевести в «Активный»
      </Button>
    </div>
  );
}
