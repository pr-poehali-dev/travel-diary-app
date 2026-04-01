// ============================================================
// ТИПЫ ДАННЫХ — Дневник тревел-блогера
// ============================================================

export type RouteType = 'planned' | 'active' | 'spontaneous';

export type RouteStatus = 'planned' | 'active' | 'completed';

export interface TravelRoute {
  id: string;
  type: RouteType;
  title: string;
  destination: string;
  dateStart?: string;
  dateEnd?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Для планируемых: точки посещения
  places?: Place[];
  // Для планируемых: черновики тем постов
  draftTopics?: string[];
  // Для планируемых: чек-листы
  checklists?: ChecklistItem[];
}

export interface Place {
  id: string;
  name: string;
  type: string; // кафе, смотровая, перевал и т.д.
  comment?: string;
  visited: boolean;
  visitedAt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'docs' | 'things' | 'contacts' | 'other';
}

// ============================================================
// ЗАМЕТКИ
// ============================================================

export type NoteTag =
  | '#пост'
  | '#гайд'
  | '#идея'
  | '#черновик'
  | '#спонтан'
  | string;

export interface Note {
  id: string;
  routeId: string;
  text: string;
  tags: NoteTag[];
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
}

// ============================================================
// РАСХОДЫ
// ============================================================

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'souvenirs'
  | 'entertainment'
  | 'other';

export interface BaseExpense {
  id: string;
  routeId: string;
  category: ExpenseCategory;
  amount: number;
  createdAt: string;
  comment?: string;
}

export interface FoodExpense extends BaseExpense {
  category: 'food';
  place?: string;
  cuisine?: string;
  rating?: number; // 1-5
  dish?: string;
}

export interface TransportExpense extends BaseExpense {
  category: 'transport';
  transportType?: string; // авто, такси, автобус...
  mileage?: number;
  route?: string;
  fuelPricePerLiter?: number;
}

export interface AccommodationExpense extends BaseExpense {
  category: 'accommodation';
  nights?: number;
  placeName?: string;
  accomType?: string; // отель, глэмпинг, хостел...
  comfort?: number; // 1-5
}

export interface SouvenirExpense extends BaseExpense {
  category: 'souvenirs';
  item?: string;
  shopLocation?: string;
  forWhom?: string;
}

export interface EntertainmentExpense extends BaseExpense {
  category: 'entertainment';
  activity?: string;
  duration?: string;
  impression?: string;
}

export interface OtherExpense extends BaseExpense {
  category: 'other';
}

export type Expense =
  | FoodExpense
  | TransportExpense
  | AccommodationExpense
  | SouvenirExpense
  | EntertainmentExpense
  | OtherExpense;

// ============================================================
// STORE TYPES
// ============================================================

export interface AppStore {
  routes: TravelRoute[];
  notes: Note[];
  expenses: Expense[];
}
