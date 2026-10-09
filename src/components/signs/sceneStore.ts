/** Shared between the 3D scene (writes) and the HTML overlay (reads). */
export const sceneStore = { hour: 7, night: 0 };

/** One in-game hour passes every 10 real seconds, so a full day takes 4 minutes. */
export const SECONDS_PER_HOUR = 10;
export const START_HOUR = 7;

export function formatHour(h: number): string {
  const total = Math.floor(h * 60) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
