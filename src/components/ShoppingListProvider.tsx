"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { trackProductEvent } from "@/lib/analytics";
import { appendShoppingListItem } from "@/lib/shopping-list/mutations";
import { ShoppingListItem, ShoppingListSource } from "@/lib/shopping-list/types";
import {
  fetchShoppingList,
  removeShoppingListItem,
  upsertShoppingListItem,
} from "@/lib/supabase/shopping-list-sync";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/hooks/use-my-bar";

const STORAGE_KEY = "craft-shopping-list";

type ShoppingListContextValue = {
  items: ShoppingListItem[];
  loaded: boolean;
  hasIngredient: (ingredientId: string) => boolean;
  addItem: (input: {
    ingredientId: string;
    source?: ShoppingListSource;
    cocktailId?: string;
  }) => void;
  removeItem: (ingredientId: string) => void;
  markPurchased: (ingredientId: string) => void;
};

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

function readLocal(): ShoppingListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShoppingListItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: ShoppingListItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const { user, addIngredients } = useUserData();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    setItems(readLocal());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) {
      syncedUser.current = null;
      return;
    }
    if (syncedUser.current === user.id) return;

    let cancelled = false;
    void fetchShoppingList(supabase, user.id)
      .then((server) => {
        if (cancelled) return;
        const local = readLocal();
        const merged = mergeShoppingLists(local, server);
        setItems(merged);
        writeLocal(merged);
        syncedUser.current = user.id;
      })
      .catch(() => {
        syncedUser.current = user.id;
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const addItem = useCallback(
    (input: { ingredientId: string; source?: ShoppingListSource; cocktailId?: string }) => {
      const id = input.ingredientId.trim();
      if (!id) return;

      setItems((prev) => {
        const row: ShoppingListItem = {
          ingredientId: id,
          addedAt: new Date().toISOString(),
          source: input.source,
          cocktailId: input.cocktailId,
        };
        const { items: next, added } = appendShoppingListItem(prev, row);
        if (!added) return prev;
        writeLocal(next);
        trackProductEvent("shopping_list_item_added", {
          ingredientId: id,
          source: input.source ?? "manual",
        });
        if (user) {
          void upsertShoppingListItem(supabase, user.id, row).catch(() => undefined);
        }
        return next;
      });
    },
    [supabase, user]
  );

  const removeItem = useCallback(
    (ingredientId: string) => {
      setItems((prev) => {
        const next = prev.filter((x) => x.ingredientId !== ingredientId);
        writeLocal(next);
        trackProductEvent("shopping_list_item_removed", { ingredientId });
        if (user) {
          void removeShoppingListItem(supabase, user.id, ingredientId).catch(() => undefined);
        }
        return next;
      });
    },
    [supabase, user]
  );

  const markPurchased = useCallback(
    (ingredientId: string) => {
      trackProductEvent("shopping_list_item_purchased", { ingredientId });
      addIngredients([ingredientId]);
      removeItem(ingredientId);
    },
    [addIngredients, removeItem]
  );

  const hasIngredient = useCallback(
    (ingredientId: string) => items.some((x) => x.ingredientId === ingredientId),
    [items]
  );

  const value = useMemo(
    () => ({ items, loaded, hasIngredient, addItem, removeItem, markPurchased }),
    [items, loaded, hasIngredient, addItem, removeItem, markPurchased]
  );

  return (
    <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>
  );
}

function mergeShoppingLists(local: ShoppingListItem[], server: ShoppingListItem[]): ShoppingListItem[] {
  const map = new Map<string, ShoppingListItem>();
  for (const row of [...server, ...local]) {
    const prev = map.get(row.ingredientId);
    if (!prev || row.addedAt > prev.addedAt) map.set(row.ingredientId, row);
  }
  return [...map.values()].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export function useShoppingList(): ShoppingListContextValue {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error("useShoppingList must be used within ShoppingListProvider");
  return ctx;
}
