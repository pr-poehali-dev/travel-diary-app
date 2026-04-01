import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EXPENSE_CATEGORY_CONFIG } from '@/lib/routeUtils';
import type { ExpenseCategory, Expense } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'food', 'transport', 'accommodation', 'souvenirs', 'entertainment', 'other',
];

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Expense, 'id' | 'createdAt' | 'routeId'>) => void;
}

export default function ExpenseForm({ open, onClose, onSave }: ExpenseFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => setFields((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const base = { category, amount: amt };
    let data: Omit<Expense, 'id' | 'createdAt' | 'routeId'>;

    switch (category) {
      case 'food':
        data = {
          ...base,
          category: 'food',
          place: fields.place || undefined,
          cuisine: fields.cuisine || undefined,
          rating: fields.rating ? parseInt(fields.rating) : undefined,
          dish: fields.dish || undefined,
        };
        break;
      case 'transport':
        data = {
          ...base,
          category: 'transport',
          transportType: fields.transportType || undefined,
          mileage: fields.mileage ? parseFloat(fields.mileage) : undefined,
          route: fields.route || undefined,
          fuelPricePerLiter: fields.fuelPrice ? parseFloat(fields.fuelPrice) : undefined,
        };
        break;
      case 'accommodation':
        data = {
          ...base,
          category: 'accommodation',
          nights: fields.nights ? parseInt(fields.nights) : undefined,
          placeName: fields.placeName || undefined,
          accomType: fields.accomType || undefined,
          comfort: fields.comfort ? parseInt(fields.comfort) : undefined,
        };
        break;
      case 'souvenirs':
        data = {
          ...base,
          category: 'souvenirs',
          item: fields.item || undefined,
          shopLocation: fields.shopLocation || undefined,
          forWhom: fields.forWhom || undefined,
        };
        break;
      case 'entertainment':
        data = {
          ...base,
          category: 'entertainment',
          activity: fields.activity || undefined,
          duration: fields.duration || undefined,
          impression: fields.impression || undefined,
        };
        break;
      default:
        data = { ...base, category: 'other', comment: fields.comment || undefined };
    }

    onSave(data);
    setAmount('');
    setFields({});
    setCategory('food');
    onClose();
  };

  const renderStars = (key: string, label: string) => (
    <div>
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => set(key, String(n))}
            className={`text-xl transition-transform hover:scale-110 ${
              parseInt(fields[key] || '0') >= n ? 'opacity-100' : 'opacity-30'
            }`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  );

  const renderDynamicFields = () => {
    switch (category) {
      case 'food':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Заведение</Label>
                <Input value={fields.place || ''} onChange={(e) => set('place', e.target.value)} placeholder="Кафе «Алтай»" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Кухня</Label>
                <Input value={fields.cuisine || ''} onChange={(e) => set('cuisine', e.target.value)} placeholder="Алтайская, русская..." className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Блюдо</Label>
              <Input value={fields.dish || ''} onChange={(e) => set('dish', e.target.value)} placeholder="Пельмени, шашлык..." className="mt-1" />
            </div>
            {renderStars('rating', 'Оценка')}
          </>
        );

      case 'transport':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Тип транспорта</Label>
                <Input value={fields.transportType || ''} onChange={(e) => set('transportType', e.target.value)} placeholder="Авто, такси, автобус..." className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Пробег (км)</Label>
                <Input type="number" value={fields.mileage || ''} onChange={(e) => set('mileage', e.target.value)} placeholder="450" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Маршрут</Label>
              <Input value={fields.route || ''} onChange={(e) => set('route', e.target.value)} placeholder="Горно-Алтайск → Кош-Агач" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Цена топлива (₽/л)</Label>
              <Input type="number" value={fields.fuelPrice || ''} onChange={(e) => set('fuelPrice', e.target.value)} placeholder="58.5" className="mt-1" />
            </div>
          </>
        );

      case 'accommodation':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Название места</Label>
                <Input value={fields.placeName || ''} onChange={(e) => set('placeName', e.target.value)} placeholder="Глэмпинг «Алтай»" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Количество ночей</Label>
                <Input type="number" value={fields.nights || ''} onChange={(e) => set('nights', e.target.value)} placeholder="2" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Тип жилья</Label>
              <Input value={fields.accomType || ''} onChange={(e) => set('accomType', e.target.value)} placeholder="Глэмпинг, хостел, отель..." className="mt-1" />
            </div>
            {renderStars('comfort', 'Комфорт')}
          </>
        );

      case 'souvenirs':
        return (
          <>
            <div>
              <Label className="text-sm font-semibold">Что купил</Label>
              <Input value={fields.item || ''} onChange={(e) => set('item', e.target.value)} placeholder="Кедровые орехи, мёд..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Где купил</Label>
                <Input value={fields.shopLocation || ''} onChange={(e) => set('shopLocation', e.target.value)} placeholder="Рынок в Чемале" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Для кого</Label>
                <Input value={fields.forWhom || ''} onChange={(e) => set('forWhom', e.target.value)} placeholder="Себе, маме..." className="mt-1" />
              </div>
            </div>
          </>
        );

      case 'entertainment':
        return (
          <>
            <div>
              <Label className="text-sm font-semibold">Активность</Label>
              <Input value={fields.activity || ''} onChange={(e) => set('activity', e.target.value)} placeholder="Рафтинг, квест, экскурсия..." className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Длительность</Label>
              <Input value={fields.duration || ''} onChange={(e) => set('duration', e.target.value)} placeholder="2 часа, полдня..." className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Впечатление</Label>
              <Textarea value={fields.impression || ''} onChange={(e) => set('impression', e.target.value)} placeholder="Советую, адреналин зашкаливал..." rows={2} className="mt-1 resize-none" />
            </div>
          </>
        );

      case 'other':
      default:
        return (
          <div>
            <Label className="text-sm font-semibold">Комментарий</Label>
            <Textarea value={fields.comment || ''} onChange={(e) => set('comment', e.target.value)} placeholder="Что за расход..." rows={2} className="mt-1 resize-none" />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Добавить расход</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Категория */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Категория</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const cfg = EXPENSE_CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setFields({}); }}
                    className={`rounded-xl border-2 p-2.5 text-center transition-all ${
                      category === cat
                        ? `border-current ${cfg.bgClass}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl">{cfg.emoji}</div>
                    <div className={`text-xs font-medium mt-0.5 ${category === cat ? cfg.color : 'text-gray-500'}`}>
                      {cfg.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Сумма */}
          <div>
            <Label className="text-sm font-semibold">
              Сумма (₽) <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1 500"
                className="pr-8 text-lg font-semibold"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₽</span>
            </div>
          </div>

          {/* Динамические поля */}
          {renderDynamicFields()}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Добавить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
