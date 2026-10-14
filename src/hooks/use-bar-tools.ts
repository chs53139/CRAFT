"use client";
import { useSyncExternalStore } from "react";
import { normalizeToolIds, type BarToolId } from "@/lib/bar-tools";
const KEY = "craft-bar-tools";
const EVENT = "craft-bar-tools-changed";
function snapshot() { try { return localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; } }
function subscribe(notify: () => void) {
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", notify);
  return () => { window.removeEventListener(EVENT, notify); window.removeEventListener("storage", notify); };
}
export function useBarTools() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  let parsed: unknown = [];
  try { parsed = JSON.parse(raw); } catch { /* invalid cache */ }
  const toolIds = normalizeToolIds(parsed);
  function toggleTool(id: BarToolId) {
    let current: unknown = [];
    try { current = JSON.parse(snapshot()); } catch { /* invalid cache */ }
    const ids = normalizeToolIds(current);
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event(EVENT)); } catch { /* unavailable storage */ }
  }
  return { toolIds, toggleTool };
}
