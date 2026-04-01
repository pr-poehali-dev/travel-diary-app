import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RouteType } from '@/types';
import { ROUTE_TYPE_CONFIG } from '@/lib/routeUtils';

interface CreateRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    type: RouteType;
    title: string;
    destination: string;
    dateStart?: string;
    dateEnd?: string;
    description?: string;
  }) => void;
}

const ROUTE_TYPES: RouteType[] = ['planned', 'active', 'spontaneous'];

export default function CreateRouteDialog({ open, onClose, onCreate }: CreateRouteDialogProps) {
  const [type, setType] = useState<RouteType>('planned');
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      type,
      title: title.trim(),
      destination: destination.trim(),
      dateStart: dateStart || undefined,
      dateEnd: dateEnd || undefined,
      description: description.trim() || undefined,
    });
    // reset
    setType('planned');
    setTitle('');
    setDestination('');
    setDateStart('');
    setDateEnd('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Новый маршрут</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Тип маршрута */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Тип маршрута</Label>
            <div className="grid grid-cols-3 gap-2">
              {ROUTE_TYPES.map((t) => {
                const cfg = ROUTE_TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      type === t
                        ? `${cfg.borderColor} ${cfg.bgColor}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">{cfg.emoji.replace('🔵', '🗺').replace('🟢', '✈️').replace('🟡', '⚡')}</div>
                    <div className={`text-xs font-semibold mt-1 ${type === t ? cfg.color : 'text-gray-600'}`}>
                      {cfg.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">
                      {t === 'planned' && 'До поездки'}
                      {t === 'active' && 'В пути'}
                      {t === 'spontaneous' && 'Вне маршрута'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Название */}
          <div>
            <Label htmlFor="title" className="text-sm font-semibold">
              Название <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'spontaneous'
                  ? 'Например: «Набрёл на крутой маяк»'
                  : 'Например: «Алтай, лето 2024»'
              }
              className="mt-1"
              required
            />
          </div>

          {/* Направление */}
          {type !== 'spontaneous' && (
            <div>
              <Label htmlFor="dest" className="text-sm font-semibold">
                Направление
              </Label>
              <Input
                id="dest"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Республика Алтай, Горно-Алтайск..."
                className="mt-1"
              />
            </div>
          )}

          {/* Даты */}
          {type !== 'spontaneous' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dateStart" className="text-sm font-semibold">
                  Дата начала
                </Label>
                <Input
                  id="dateStart"
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateEnd" className="text-sm font-semibold">
                  Дата окончания
                </Label>
                <Input
                  id="dateEnd"
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Описание */}
          <div>
            <Label htmlFor="desc" className="text-sm font-semibold">
              {type === 'spontaneous' ? 'Быстрая заметка' : 'Описание / идея'}
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'spontaneous'
                  ? 'Что увидел, где находишься...'
                  : 'О чём эта поездка...'
              }
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
