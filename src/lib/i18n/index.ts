"use client";

import { useSyncExternalStore } from "react";
import { en, type Dict } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

export type Lang = "en" | "ru" | "uz";
export const LANGS: Lang[] = ["en", "ru", "uz"];
export const dicts: Record<Lang, Dict> = { en, ru, uz };

const KEY = "roadwise:lang";
const listeners = new Set<() => void>();

function detect(): Lang {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of list) {
    const c = (l ?? "").toLowerCase();
    if (c.startsWith("uz")) return "uz";
    if (c.startsWith("ru")) return "ru";
    if (c.startsWith("en")) return "en";
  }
  return "en";
}

/** "ru" when the user picked it, "ru?" when it was only detected from the device. */
function snapshot(): string {
  try {
    const s = window.localStorage.getItem(KEY);
    if (s === "en" || s === "ru" || s === "uz") return s;
  } catch {}
  return detect() + "?";
}

export function setLang(l: Lang) {
  try {
    window.localStorage.setItem(KEY, l);
  } catch {}
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const on = (e: StorageEvent) => (e.key === KEY || e.key === null) && cb();
  window.addEventListener("storage", on);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", on);
  };
}

export function useI18n() {
  const snap = useSyncExternalStore(subscribe, snapshot, () => "en");
  const lang = snap.slice(0, 2) as Lang;
  return { lang, t: dicts[lang], chosen: !snap.endsWith("?"), setLang };
}
