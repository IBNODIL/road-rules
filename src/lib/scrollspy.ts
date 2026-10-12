"use client";

import { useSyncExternalStore } from "react";

/** Id of the section that is currently in the middle of the screen, shared with the side panel. */
let active = "";
const listeners = new Set<() => void>();

export function setActiveSection(id: string) {
  if (id === active) return;
  active = id;
  listeners.forEach((l) => l());
}

export function useActiveSection() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => active,
    () => "",
  );
}
