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
import { MadeHistoryEntry } from "@/lib/made-history/types";
import { fetchMadeHistory, insertMadeEvent } from "@/lib/supabase/made-history-sync";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/hooks/use-my-bar";

const STORAGE_KEY = "craft-made-history";
const MAX_LOCAL = 50;

type MadeHistoryContextValue = {
  entries: MadeHistoryEntry[];
  loaded: boolean;
  recordMade: (cocktailId: string, rating?: number) => void;
};

const MadeHistoryContext = createContext<MadeHistoryContextValue | null>(null);

function readLocal(): MadeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MadeHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: MadeHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_LOCAL)));
}

export function MadeHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserData();
  const supabase = useMemo(() => createClient(), []);
  const [entries, setEntries] = useState<MadeHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    setEntries(readLocal());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) {
      syncedUser.current = null;
      return;
    }
    if (syncedUser.current === user.id) return;

    let cancelled = false;
    void fetchMadeHistory(supabase, user.id)
      .then((server) => {
        if (cancelled) return;
        const local = readLocal();
        const merged = mergeMadeHistory(local, server);
        setEntries(merged);
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

  const recordMade = useCallback(
    (cocktailId: string, rating?: number) => {
      const madeAt = new Date().toISOString();
      const localEntry: MadeHistoryEntry = {
        id: `local-${madeAt}-${cocktailId}`,
        cocktailId,
        madeAt,
        rating,
      };

      setEntries((prev) => {
        const next = [localEntry, ...prev].slice(0, MAX_LOCAL);
        writeLocal(next);
        return next;
      });

      trackProductEvent("cocktail_made", { cocktailId });
      if (rating !== undefined) {
        trackProductEvent("cocktail_rated", { cocktailId, rating });
      }

      if (user) {
        void insertMadeEvent(supabase, user.id, {
          cocktailId,
          madeAt,
          rating,
        }).catch(() => undefined);
      }
    },
    [supabase, user]
  );

  const value = useMemo(() => ({ entries, loaded, recordMade }), [entries, loaded, recordMade]);

  return <MadeHistoryContext.Provider value={value}>{children}</MadeHistoryContext.Provider>;
}

function mergeMadeHistory(local: MadeHistoryEntry[], server: MadeHistoryEntry[]): MadeHistoryEntry[] {
  const all = [...server, ...local].sort((a, b) => b.madeAt.localeCompare(a.madeAt));
  const seen = new Set<string>();
  const out: MadeHistoryEntry[] = [];
  for (const row of all) {
    const key = `${row.cocktailId}|${row.madeAt.slice(0, 16)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
    if (out.length >= MAX_LOCAL) break;
  }
  return out;
}

export function useMadeHistory(): MadeHistoryContextValue {
  const ctx = useContext(MadeHistoryContext);
  if (!ctx) throw new Error("useMadeHistory must be used within MadeHistoryProvider");
  return ctx;
}
