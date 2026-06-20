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
import type { User } from "@supabase/supabase-js";
import {
  addFavorite,
  fetchBarItems,
  fetchFavorites,
  fetchRecentCocktails,
  removeFavorite,
  saveBarItems,
  syncFavoritesToServer,
  trackRecentCocktail,
} from "@/lib/supabase/bar-sync";
import { migrateBarInventory } from "@/lib/inventory-migration";
import { isHouseStaple } from "@/lib/inventory-tiers";
import { createClient } from "@/lib/supabase/client";

const BAR_KEY = "craft-my-bar";
const FAVORITES_KEY = "craft-favorites";
const RECENT_KEY = "craft-recent";

type UserDataContextValue = {
  user: User | null;
  barIds: string[];
  favoriteIds: string[];
  recentIds: string[];
  loaded: boolean;
  syncing: boolean;
  error: string | null;
  isAuthenticated: boolean;
  toggleIngredient: (id: string) => void;
  clearBar: () => void;
  setBarIds: (ids: string[]) => void;
  addIngredients: (ids: string[]) => void;
  toggleFavorite: (cocktailId: string) => Promise<void>;
  isFavorite: (cocktailId: string) => boolean;
  trackRecent: (cocktailId: string) => void;
  clearError: () => void;
  signOut: () => Promise<void>;
};

function normalizeBarIds(ids: string[]): string[] {
  return migrateBarInventory(ids);
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [barIds, setBarIdsState] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedForUser = useRef<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      hydratedForUser.current = null;
      setLoaded(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setBarIdsState(normalizeBarIds(readJson(BAR_KEY, [])));
      setFavoriteIds(readJson(FAVORITES_KEY, []));
      setRecentIds(readJson(RECENT_KEY, []));
      setLoaded(true);
      hydratedForUser.current = null;
      return;
    }

    if (hydratedForUser.current === user.id) {
      setLoaded(true);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      setSyncing(true);
      setError(null);

      const localBar = readJson<string[]>(BAR_KEY, []);
      const localFavorites = readJson<string[]>(FAVORITES_KEY, []);
      const localRecent = readJson<string[]>(RECENT_KEY, []);

      try {
        const [serverBar, serverFavorites, serverRecent] = await Promise.all([
          fetchBarItems(supabase, user!.id),
          fetchFavorites(supabase, user!.id),
          fetchRecentCocktails(supabase, user!.id),
        ]);

        const mergedBar = normalizeBarIds(
          serverBar.length > 0 && localBar.length > 0
            ? [...new Set([...serverBar, ...localBar])]
            : serverBar.length > 0
              ? serverBar
              : localBar
        );
        const mergedFavorites =
          serverFavorites.length > 0 && localFavorites.length > 0
            ? [...new Set([...serverFavorites, ...localFavorites])]
            : serverFavorites.length > 0
              ? serverFavorites
              : localFavorites;
        const mergedRecent =
          serverRecent.length > 0 && localRecent.length > 0
            ? [...new Set([...serverRecent, ...localRecent])].slice(0, 12)
            : serverRecent.length > 0
              ? serverRecent
              : localRecent;

        if (cancelled) return;

        setBarIdsState(mergedBar);
        setFavoriteIds(mergedFavorites);
        setRecentIds(mergedRecent);
        localStorage.setItem(BAR_KEY, JSON.stringify(mergedBar));
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(mergedFavorites));
        localStorage.setItem(RECENT_KEY, JSON.stringify(mergedRecent));

        if (mergedBar.length > 0 && serverBar.length === 0 && localBar.length > 0) {
          await saveBarItems(supabase, user!.id, mergedBar);
        }

        const localOnlyFavorites = localFavorites.filter(
          (id) => !serverFavorites.includes(id)
        );
        if (localOnlyFavorites.length > 0) {
          await syncFavoritesToServer(supabase, user!.id, localOnlyFavorites);
        }

        hydratedForUser.current = user!.id;
      } catch {
        if (!cancelled) {
          setError("Could not load your saved bar. Showing what is on this device.");
          setBarIdsState(normalizeBarIds(localBar));
          setFavoriteIds(localFavorites);
          setRecentIds(localRecent);
        }
      } finally {
        if (!cancelled) {
          setSyncing(false);
          setLoaded(true);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [authReady, user, supabase]);

  const persistBar = useCallback(
    (ids: string[]) => {
      localStorage.setItem(BAR_KEY, JSON.stringify(ids));
      if (!user) return;

      if (saveBarTimer.current) clearTimeout(saveBarTimer.current);
      saveBarTimer.current = setTimeout(async () => {
        try {
          await saveBarItems(supabase, user.id, ids);
        } catch {
          setError("Could not save your bar. Changes are saved on this device for now.");
        }
      }, 400);
    },
    [supabase, user]
  );

  const setBarIds = useCallback(
    (ids: string[]) => {
      const next = normalizeBarIds(ids);
      setBarIdsState(next);
      persistBar(next);
    },
    [persistBar]
  );

  const toggleIngredient = useCallback(
    (id: string) => {
      if (isHouseStaple(id)) return;
      setBarIdsState((prev) => {
        const next = normalizeBarIds(
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        persistBar(next);
        return next;
      });
    },
    [persistBar]
  );

  const clearBar = useCallback(() => setBarIds([]), [setBarIds]);

  const addIngredients = useCallback(
    (ids: string[]) => {
      const filtered = ids.filter((id) => !isHouseStaple(id));
      if (filtered.length === 0) return;
      setBarIdsState((prev) => {
        const next = normalizeBarIds([...new Set([...prev, ...filtered])]);
        persistBar(next);
        return next;
      });
    },
    [persistBar]
  );

  const toggleFavorite = useCallback(
    async (cocktailId: string) => {
      const isFav = favoriteIds.includes(cocktailId);
      const next = isFav
        ? favoriteIds.filter((id) => id !== cocktailId)
        : [...favoriteIds, cocktailId];

      setFavoriteIds(next);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));

      if (!user) return;

      try {
        if (isFav) {
          await removeFavorite(supabase, user.id, cocktailId);
        } else {
          await addFavorite(supabase, user.id, cocktailId);
        }
      } catch {
        setFavoriteIds(favoriteIds);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
        setError("Could not update favorite.");
      }
    },
    [favoriteIds, supabase, user]
  );

  const isFavorite = useCallback(
    (cocktailId: string) => favoriteIds.includes(cocktailId),
    [favoriteIds]
  );

  const trackRecent = useCallback(
    (cocktailId: string) => {
      setRecentIds((prev) => {
        const next = [cocktailId, ...prev.filter((id) => id !== cocktailId)].slice(
          0,
          12
        );
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));

        if (user) {
          trackRecentCocktail(supabase, user.id, cocktailId).catch(() => {});
        }

        return next;
      });
    },
    [supabase, user]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    hydratedForUser.current = null;
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      barIds,
      favoriteIds,
      recentIds,
      loaded: authReady && loaded,
      syncing,
      error,
      isAuthenticated,
      toggleIngredient,
      clearBar,
      setBarIds,
      addIngredients,
      toggleFavorite,
      isFavorite,
      trackRecent,
      clearError: () => setError(null),
      signOut,
    }),
    [
      user,
      barIds,
      favoriteIds,
      recentIds,
      authReady,
      loaded,
      syncing,
      error,
      isAuthenticated,
      toggleIngredient,
      clearBar,
      setBarIds,
      addIngredients,
      toggleFavorite,
      isFavorite,
      trackRecent,
      signOut,
    ]
  );

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}

export function useMyBar() {
  const {
    barIds,
    toggleIngredient,
    clearBar,
    addIngredients,
    loaded,
    syncing,
    error,
    clearError,
    isAuthenticated,
    user,
  } = useUserData();
  return {
    barIds,
    toggleIngredient,
    clearBar,
    addIngredients,
    loaded,
    syncing,
    error,
    clearError,
    isAuthenticated,
    user,
  };
}

export function useFavorites() {
  const { favoriteIds, toggleFavorite, isFavorite, loaded } = useUserData();
  return { favoriteIds, toggleFavorite, isFavorite, loaded };
}

export function useRecentCocktails() {
  const { recentIds, trackRecent, loaded } = useUserData();
  return { recentIds, trackRecent, loaded };
}
