"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "craft_commerce_postal_code";

export function useCommerceZip() {
  const [postalCode, setPostalCodeState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setPostalCodeState(saved);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setPostalCode = useCallback((value: string) => {
    const trimmed = value.trim();
    setPostalCodeState(trimmed);
    try {
      if (trimmed) window.localStorage.setItem(STORAGE_KEY, trimmed);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { postalCode, setPostalCode, loaded };
}
