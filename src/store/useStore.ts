import { useState, useEffect, useCallback } from 'react';
import type {
  AppStore,
  TravelRoute,
  Note,
  Expense,
  RouteType,
  Place,
  ChecklistItem,
} from '@/types';

const STORAGE_KEY = 'travel_blog_diary_v1';

function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { routes: [], notes: [], expenses: [] };
}

function saveStore(store: AppStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function uuid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Синглтон-стейт для синхронизации между хуками
let globalStore: AppStore = loadStore();
const listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

function setGlobal(updater: (prev: AppStore) => AppStore) {
  globalStore = updater(globalStore);
  saveStore(globalStore);
  notify();
}

// ============================================================
export function useStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  // --- ROUTES ---
  const addRoute = useCallback(
    (data: Omit<TravelRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
      const route: TravelRoute = {
        ...data,
        id: uuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        places: data.places ?? [],
        draftTopics: data.draftTopics ?? [],
        checklists: data.checklists ?? [],
      };
      setGlobal((s) => ({ ...s, routes: [route, ...s.routes] }));
      return route.id;
    },
    []
  );

  const updateRoute = useCallback(
    (id: string, data: Partial<Omit<TravelRoute, 'id' | 'createdAt'>>) => {
      setGlobal((s) => ({
        ...s,
        routes: s.routes.map((r) =>
          r.id === id
            ? { ...r, ...data, updatedAt: new Date().toISOString() }
            : r
        ),
      }));
    },
    []
  );

  const deleteRoute = useCallback((id: string) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.filter((r) => r.id !== id),
      notes: s.notes.filter((n) => n.routeId !== id),
      expenses: s.expenses.filter((e) => e.routeId !== id),
    }));
  }, []);

  const getRoute = useCallback(
    (id: string) => globalStore.routes.find((r) => r.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalStore.routes]
  );

  // --- PLACES ---
  const addPlace = useCallback((routeId: string, data: Omit<Place, 'id'>) => {
    const place: Place = { ...data, id: uuid() };
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              places: [...(r.places ?? []), place],
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  const togglePlace = useCallback((routeId: string, placeId: string) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              places: (r.places ?? []).map((p) =>
                p.id === placeId
                  ? {
                      ...p,
                      visited: !p.visited,
                      visitedAt: !p.visited ? new Date().toISOString() : undefined,
                    }
                  : p
              ),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  const deletePlace = useCallback((routeId: string, placeId: string) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              places: (r.places ?? []).filter((p) => p.id !== placeId),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  // --- CHECKLISTS ---
  const addChecklistItem = useCallback(
    (routeId: string, item: Omit<ChecklistItem, 'id'>) => {
      setGlobal((s) => ({
        ...s,
        routes: s.routes.map((r) =>
          r.id === routeId
            ? {
                ...r,
                checklists: [
                  ...(r.checklists ?? []),
                  { ...item, id: uuid() },
                ],
                updatedAt: new Date().toISOString(),
              }
            : r
        ),
      }));
    },
    []
  );

  const toggleChecklistItem = useCallback((routeId: string, itemId: string) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              checklists: (r.checklists ?? []).map((c) =>
                c.id === itemId ? { ...c, checked: !c.checked } : c
              ),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  const deleteChecklistItem = useCallback((routeId: string, itemId: string) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              checklists: (r.checklists ?? []).filter((c) => c.id !== itemId),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  // --- NOTES ---
  const addNote = useCallback(
    (data: Omit<Note, 'id' | 'createdAt'>) => {
      const note: Note = {
        ...data,
        id: uuid(),
        createdAt: new Date().toISOString(),
      };
      setGlobal((s) => ({ ...s, notes: [note, ...s.notes] }));
      return note.id;
    },
    []
  );

  const updateNote = useCallback(
    (id: string, data: Partial<Omit<Note, 'id' | 'createdAt' | 'routeId'>>) => {
      setGlobal((s) => ({
        ...s,
        notes: s.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
      }));
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setGlobal((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const getNotesByRoute = useCallback(
    (routeId: string) =>
      globalStore.notes
        .filter((n) => n.routeId === routeId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalStore.notes]
  );

  // --- EXPENSES ---
  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
    } as Expense;
    setGlobal((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
    return expense.id;
  }, []);

  const updateExpense = useCallback(
    (id: string, data: Partial<Expense>) => {
      setGlobal((s) => ({
        ...s,
        expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
      }));
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setGlobal((s) => ({
      ...s,
      expenses: s.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const getExpensesByRoute = useCallback(
    (routeId: string) =>
      globalStore.expenses
        .filter((e) => e.routeId === routeId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalStore.expenses]
  );

  // --- DRAFT TOPICS ---
  const addDraftTopic = useCallback((routeId: string, topic: string) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              draftTopics: [...(r.draftTopics ?? []), topic],
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  const deleteDraftTopic = useCallback((routeId: string, index: number) => {
    setGlobal((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              draftTopics: (r.draftTopics ?? []).filter((_, i) => i !== index),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  }, []);

  // --- CHANGE ROUTE TYPE ---
  const changeRouteType = useCallback(
    (id: string, type: RouteType) => {
      updateRoute(id, { type });
    },
    [updateRoute]
  );

  return {
    routes: globalStore.routes,
    notes: globalStore.notes,
    expenses: globalStore.expenses,
    // routes
    addRoute,
    updateRoute,
    deleteRoute,
    getRoute,
    changeRouteType,
    // places
    addPlace,
    togglePlace,
    deletePlace,
    // checklists
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    // draft topics
    addDraftTopic,
    deleteDraftTopic,
    // notes
    addNote,
    updateNote,
    deleteNote,
    getNotesByRoute,
    // expenses
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByRoute,
  };
}
