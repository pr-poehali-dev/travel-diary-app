import { Trash2 } from 'lucide-react';
import { EXPENSE_CATEGORY_CONFIG, formatDateTime, formatMoney } from '@/lib/routeUtils';
import type { Expense, FoodExpense, TransportExpense, AccommodationExpense, SouvenirExpense, EntertainmentExpense } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

function renderDetails(expense: Expense): string[] {
  const details: string[] = [];
  switch (expense.category) {
    case 'food': {
      const e = expense as FoodExpense;
      if (e.place) details.push(`📍 ${e.place}`);
      if (e.cuisine) details.push(`🍴 ${e.cuisine}`);
      if (e.dish) details.push(`🥘 ${e.dish}`);
      if (e.rating) details.push('⭐'.repeat(e.rating));
      break;
    }
    case 'transport': {
      const e = expense as TransportExpense;
      if (e.transportType) details.push(`🚗 ${e.transportType}`);
      if (e.route) details.push(`📍 ${e.route}`);
      if (e.mileage) details.push(`📏 ${e.mileage} км`);
      if (e.fuelPricePerLiter) details.push(`⛽ ${e.fuelPricePerLiter} ₽/л`);
      break;
    }
    case 'accommodation': {
      const e = expense as AccommodationExpense;
      if (e.placeName) details.push(`🏠 ${e.placeName}`);
      if (e.accomType) details.push(`🛏 ${e.accomType}`);
      if (e.nights) details.push(`📅 ${e.nights} ночей`);
      if (e.comfort) details.push('⭐'.repeat(e.comfort));
      break;
    }
    case 'souvenirs': {
      const e = expense as SouvenirExpense;
      if (e.item) details.push(`🎁 ${e.item}`);
      if (e.shopLocation) details.push(`📍 ${e.shopLocation}`);
      if (e.forWhom) details.push(`👤 ${e.forWhom}`);
      break;
    }
    case 'entertainment': {
      const e = expense as EntertainmentExpense;
      if (e.activity) details.push(`🎯 ${e.activity}`);
      if (e.duration) details.push(`⏱ ${e.duration}`);
      if (e.impression) details.push(`💬 ${e.impression}`);
      break;
    }
    case 'other': {
      if (expense.comment) details.push(`💬 ${expense.comment}`);
      break;
    }
  }
  return details;
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const cfg = EXPENSE_CATEGORY_CONFIG[expense.category];
  const details = renderDetails(expense);

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 group hover:border-slate-200 transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`text-2xl flex-shrink-0`}>{cfg.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${cfg.color} ${cfg.bgClass} px-2 py-0.5 rounded-full`}>
                {cfg.label}
              </span>
              <span className="text-xs text-slate-400">{formatDateTime(expense.createdAt)}</span>
            </div>
            {details.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                {details.map((d, i) => (
                  <span key={i} className="text-xs text-slate-600">{d}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-slate-900 text-base">{formatMoney(expense.amount)}</span>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
