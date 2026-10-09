"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, Moon, Sun } from "@phosphor-icons/react";
import { UZ_CATEGORIES, UZ_SIGNS, type UzSign } from "@/lib/uzSigns";
import { describeSign } from "@/lib/uzSignDescriptions";
import { useI18n } from "@/lib/i18n";
import { signsPageText } from "@/lib/i18n/signsPage";
import { formatHour, sceneStore } from "./sceneStore";

const DesertScene = dynamic(() => import("./DesertScene"), { ssr: false });

/** Scroll distance (in dvh) needed to move from one sign to the next. */
const STEP = 30;
const TAIL = 30;
const N = UZ_SIGNS.length;

const catOf = (id: string) => UZ_CATEGORIES.find((c) => c.id === id)!;

function Clock() {
  const [now, setNow] = useState({ text: "07:00", night: false });
  useEffect(() => {
    const id = window.setInterval(() => {
      const h = sceneStore.hour;
      setNow({ text: formatHour(h), night: h < 6 || h >= 18 });
    }, 250);
    return () => window.clearInterval(id);
  }, []);
  const Icon = now.night ? Moon : Sun;
  return (
    <p className="flex items-center gap-1.5 font-mono text-sm tabular-nums text-[#C9C9C9]" title="10 s = 1 hour">
      <Icon size={16} weight="fill" className={now.night ? "text-[#9fb4ff]" : "text-[#FFB800]"} aria-hidden />
      {now.text}
    </p>
  );
}

export function SignJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);
  const { lang } = useI18n();
  const tx = signsPageText[lang];
  const nameOf = (s: UzSign) => s.names[lang];
  const meaningOf = (s: UzSign) => describeSign(s.id, lang);

  const stepPx = () => (window.innerHeight * STEP) / 100;

  // Scroll position -> current sign.
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const i = Math.round(-el.getBoundingClientRect().top / stepPx());
      setIndex(Math.max(0, Math.min(N - 1, i)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Stop rendering the 3D scene when the section is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(N - 1, i));
    const top = window.scrollY + el.getBoundingClientRect().top + clamped * stepPx();
    window.scrollTo({ top, behavior: "instant" });
  }, []);

  // Arrow keys while the stage is on screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const r = sectionRef.current?.getBoundingClientRect();
      if (!r || r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return;
      e.preventDefault();
      goTo(index + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  // Keep the active thumbnail centred in the strip.
  useEffect(() => {
    const strip = stripRef.current;
    const t = thumbRefs.current[index];
    if (!strip || !t) return;
    strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  const current = UZ_SIGNS[index];
  const cat = catOf(current.category);

  return (
    <section
      ref={sectionRef}
      aria-label={tx.sectionLabel}
      style={{ height: `calc(100dvh + ${(N - 1) * STEP + TAIL}dvh)` }}
      className="relative"
    >
      <div
        className="sticky top-0 h-dvh overflow-hidden bg-[#0a0d14]"
        style={{ "--nav-h": "148px" } as React.CSSProperties}
      >
        <h1 className="sr-only">{tx.sectionLabel}</h1>
        <p className="sr-only" aria-live="polite">
          {tx.announce(index + 1, N, `${current.num} ${nameOf(current)}`.trim(), meaningOf(current))}
        </p>

        {/* 3D desert road, sky and sign */}
        <div className="absolute inset-x-0 top-0" style={{ bottom: "var(--nav-h)" }}>
          <DesertScene index={index} active={active} />
        </div>

        {/* Header: category, clock and counter */}
        <div className="absolute inset-x-0 top-20 z-20 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 md:top-24">
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold drop-shadow">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: cat.color }} aria-hidden />
            <span className="truncate">{tx.categories[cat.id].name}</span>
            {tx.categories[cat.id].sub && (
              <span className="hidden truncate text-[#C9C9C9] sm:inline">· {tx.categories[cat.id].sub}</span>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-4 drop-shadow">
            <Clock />
            <p className="font-mono text-sm tabular-nums text-[#C9C9C9]">
              <span className="text-white">{String(index + 1).padStart(2, "0")}</span> / {N}
            </p>
          </div>
        </div>

        {/* Captions slide with the signs: the old one leaves left, the next arrives from the right */}
        <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: 0, bottom: "var(--nav-h)" }}>
          {UZ_SIGNS.map((s, i) => {
            const rel = i - index;
            if (Math.abs(rel) > 1) return null;
            const c = catOf(s.category);
            return (
              <div
                key={s.id}
                aria-hidden={rel !== 0}
                className="absolute inset-x-0 top-0 flex justify-center px-4 pt-28 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:justify-start md:px-0 md:pt-36 md:pl-[max(2rem,calc((100vw-72rem)/2+1rem))]"
                style={{ transform: `translate3d(${rel * 110}vw,0,0)`, opacity: rel === 0 ? 1 : 0 }}
              >
                <div className="max-w-md rounded-2xl bg-black/55 p-4 text-center backdrop-blur-md md:max-w-sm md:bg-black/45 md:p-5 md:text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.color }}>
                    {s.num && <span className="mr-2 font-mono">{s.num}</span>}
                    {tx.categories[c.id].name}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold md:text-3xl">{nameOf(s)}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-[#D4D4D4] md:line-clamp-none md:text-base">{meaningOf(s)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigator */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/85 backdrop-blur-xl"
          style={{ height: "var(--nav-h)" }}
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <div
                role="tablist"
                aria-label={tx.categoriesLabel}
                className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none]"
              >
                {UZ_CATEGORIES.map((c) => {
                  const first = UZ_SIGNS.findIndex((s) => s.category === c.id);
                  const activeCat = c.id === current.category;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={activeCat}
                      onClick={() => goTo(first)}
                      className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        activeCat ? "bg-white/10 text-white" : "text-[#9B9B9B] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                      {tx.categories[c.id].name}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="btn btn-ghost !p-2" aria-label={tx.prev} disabled={index === 0} onClick={() => goTo(index - 1)}>
                <CaretLeft size={18} aria-hidden />
              </button>
              <button type="button" className="btn btn-ghost !p-2" aria-label={tx.next} disabled={index === N - 1} onClick={() => goTo(index + 1)}>
                <CaretRight size={18} aria-hidden />
              </button>
            </div>

            <div ref={stripRef} className="relative flex gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:none]">
              {UZ_SIGNS.map((s, i) => {
                const on = i === index;
                return (
                  <button
                    key={s.id}
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    type="button"
                    aria-label={`${s.num} ${nameOf(s)}`.trim()}
                    aria-current={on}
                    onClick={() => goTo(i)}
                    className={`shrink-0 rounded-lg p-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      on ? "scale-110 bg-white/15 ring-2 ring-[#FFB800]" : "opacity-55 hover:bg-white/10 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/signs/${s.file}`}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="size-10 rounded-md bg-white object-contain p-0.5 md:size-12"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {index === 0 && (
          <p
            className="pointer-events-none absolute inset-x-0 z-20 text-center text-sm text-white/80 drop-shadow"
            style={{ bottom: "calc(var(--nav-h) + 12px)" }}
          >
            {tx.hint}
          </p>
        )}
      </div>
    </section>
  );
}
