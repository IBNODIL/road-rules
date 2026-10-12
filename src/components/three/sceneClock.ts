/** Seconds after Play before cars are released, so they reach the stop line first. */
export const RELEASE_DELAY = 3.2;

export class Clock {
  t0: number | null = null;
  rel: number | null = null;
  gated = false;
  /** gated: hold the cars at the stop line until release() is called. */
  start(gated: boolean) {
    const now = performance.now() / 1000;
    this.t0 = now;
    this.gated = gated;
    this.rel = gated ? null : now + RELEASE_DELAY;
  }
  release() {
    if (this.t0 != null && this.rel == null) this.rel = performance.now() / 1000;
  }
  reset() {
    this.t0 = null;
    this.rel = null;
  }
}

/** t: seconds since start. tr: seconds since release (negative while held). tf: clock for free movers. */
export function sceneTime(clock: Clock, loop: boolean, period: number) {
  const now = performance.now() / 1000;
  if (loop) {
    const t = now % period;
    return { t, tr: t - RELEASE_DELAY, tf: t };
  }
  if (clock.t0 == null) return { t: 0, tr: -1, tf: 0 };
  const t = now - clock.t0;
  const tr = clock.rel == null ? -1 : now - clock.rel;
  return { t, tr, tf: clock.gated ? tr : t };
}
