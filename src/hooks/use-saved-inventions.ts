"use client";

import { useCallback, useEffect, useState } from "react";
import { MixologistInvention } from "@/lib/mixologist/types";

const STORAGE_KEY = "craft-inventions";

export type SavedInvention = MixologistInvention & {
  id: string;
  savedAt: string;
};

function readInventions(): SavedInvention[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedInvention[]) : [];
  } catch {
    return [];
  }
}

function writeInventions(items: SavedInvention[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function inventionKey(invention: MixologistInvention): string {
  return [
    invention.name,
    invention.source,
    invention.ingredients.map((i) => `${i.ingredientId}:${i.amount}`).join("|"),
  ].join("::");
}

export function useSavedInventions() {
  const [inventions, setInventions] = useState<SavedInvention[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInventions(readInventions());
    setLoaded(true);
  }, []);

  const saveInvention = useCallback((invention: MixologistInvention) => {
    setInventions((prev) => {
      const key = inventionKey(invention);
      if (prev.some((item) => inventionKey(item) === key)) {
        return prev;
      }

      const next: SavedInvention[] = [
        {
          ...invention,
          id: crypto.randomUUID(),
          savedAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 24);

      writeInventions(next);
      return next;
    });
  }, []);

  const removeInvention = useCallback((id: string) => {
    setInventions((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeInventions(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (invention: MixologistInvention) => {
      const key = inventionKey(invention);
      return inventions.some((item) => inventionKey(item) === key);
    },
    [inventions]
  );

  return {
    inventions,
    loaded,
    saveInvention,
    removeInvention,
    isSaved,
  };
}
