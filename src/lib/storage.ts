"use client";

import { useSyncExternalStore } from "react";

const KEY = "roadwise:v1";

export type Attempt = {
  id: string;
  date: string;
  score: number;
  total: number;
  seconds: number;
  wrong: string[];
};

export type ActiveTest = {
  ids: string[];
  answers: (number | null)[];
  idx: number;
  startedAt: number;
};

export type SimScore = { score: number; stars: number; seconds: number };

export type Data = {
  completed: string[];
  sim: Record<string, SimScore>;
  /** Rule id -> answered correctly the last time. */
  rules: Record<string, boolean>;
  ruleExams: Attempt[];
  attempts: Attempt[];
  active: ActiveTest | null;
};

const EMPTY: Data = { completed: [], sim: {}, rules: {}, ruleExams: [], attempts: [], active: null };

let cache: { raw: string | null; data: Data } = { raw: null, data: EMPTY };
const listeners = new Set<() => void>();

function read(): Data {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.data;
    const parsed = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    cache = { raw, data: parsed };
    return parsed;
  } catch {
    return cache.data;
  }
}

function notify() {
  listeners.forEach((l) => l());
}

export function update(fn: (d: Data) => Data) {
  const next = fn(read());
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, data: next };
  } catch {
    cache = { raw: cache.raw, data: next };
  }
  notify();
}

export function resetAll() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  cache = { raw: null, data: EMPTY };
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useData(): Data {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** True once the component has hydrated and local data is readable. */
export function useReady(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
