"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Lightbulb } from "@phosphor-icons/react";
import { lessons } from "@/lib/content";
import { iconMap } from "@/lib/icons";
import { useI18n } from "@/lib/i18n";
import {
  SOURCE_URL,
  chapters,
  clauseRef,
  partHref,
  partKeys,
  testHref,
  partNumber,
  ruleNumber,
  ruleSlug,
} from "@/lib/rules/data";
import { details, intros } from "@/lib/rules/details";
import { lessonScenes, ruleScenes } from "@/lib/rules/scenes";
import { ruleTexts } from "@/lib/rules/texts";
import { rulesUi } from "@/lib/rules/ui";
import { setActiveSection } from "@/lib/scrollspy";
import { update, useData } from "@/lib/storage";
import { LazyScene } from "@/components/LazyScene";
import { Reveal } from "@/components/Reveal";
import { SignGallery } from "@/components/three/lazy";

/* ---------- small animation helpers ---------- */

/** Fraction of the list that has scrolled past the reading line. Throttled through requestAnimationFrame. */
function useScrollFill(ref: React.RefObject<HTMLElement | null>) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setFill(Math.max(0, Math.min(1, (window.innerHeight * 0.55 - r.top) / r.height)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    raf = requestAnimationFrame(calc);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [ref]);
  return fill;
}

/** Counts up to a target once it is on screen. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 900);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{v}</span>;
}

/** Publishes the section that is crossing the middle of the screen to the side panel. */
function useSpy(ids: string[]) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveSection(e.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    /* a lesson counts as read once it reaches the upper part of the screen */
    const seen = new IntersectionObserver(
      (entries) => {
        const keys = entries.filter((e) => e.isIntersecting).map((e) => (e.target as HTMLElement).dataset.read!);
        if (keys.length) update((d) => (keys.every((k) => d.read.includes(k)) ? d : { ...d, read: [...new Set([...d.read, ...keys])] }));
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        io.observe(el);
        if (el.dataset.read) seen.observe(el);
      }
    });
    return () => {
      io.disconnect();
      seen.disconnect();
      setActiveSection("");
    };
  }, [ids]);
}

/* ---------- one lesson inside a chapter ---------- */

function NumberBadge({ n, active }: { n: string; active?: boolean }) {
  return (
    <span
      className={`grid h-8 min-w-12 place-items-center rounded-full border px-2 font-mono text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        active ? "border-[#FFB800] bg-[#FFB800] text-black" : "border-white/10 bg-[#272727] text-[#FFB800]"
      }`}
    >
      {n}
    </span>
  );
}

function RuleSection({ id }: { id: string }) {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const [title, summary] = ruleTexts[lang][id];
  const [points, practice] = details[lang][id];
  const ref = clauseRef(id);
  const scene = ruleScenes[id];
  const slug = ruleSlug(id);

  return (
    <section id={`rule-${slug}`} data-read={id} className="relative scroll-mt-32 pb-16 pl-14 md:pl-20">
      <div className="absolute left-0 top-0">
        <NumberBadge n={ruleNumber(id)} />
      </div>
      <Reveal>
        <p className="font-mono text-xs text-[#9B9B9B]">{ui.tag(ref.kind, ref.n)}</p>
        <h2 className="mt-1 text-3xl font-semibold md:text-4xl">{title}</h2>
        <p className="mt-4 max-w-[680px] text-lg">{summary}</p>
      </Reveal>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#FFB800]">{ui.keyPoints}</p>
        <ul className="mt-3 flex flex-col gap-3">
          {points.map((p, i) => (
            <Reveal as="li" key={p} delay={i * 90}>
              <div className="flex gap-3 rounded-lg border border-white/10 bg-[#181818] p-4">
                <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-[#30a46c]" aria-hidden />
                <p className="text-base">{p}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      {scene && (
        <Reveal delay={80} className="mt-6">
          <LazyScene spec={scene} label={title} className="h-[320px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-2 md:h-[380px]" />
        </Reveal>
      )}

      <Reveal delay={120} className="mt-6">
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#1F1F1F] p-5">
          <Lightbulb size={26} weight="fill" className="mt-0.5 shrink-0 text-[#FFB800]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[#9B9B9B]">{ui.practice}</p>
            <p className="mt-1 text-base">{practice}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function LessonSection({ index }: { index: number }) {
  const { t, lang } = useI18n();
  const ui = rulesUi[lang];
  const lesson = lessons[index];
  const text = t.lessons[lesson.slug];
  const Icon = iconMap[lesson.icon];
  const data = useData();
  const done = data.completed.includes(lesson.slug);

  const toggle = () =>
    update((d) => ({
      ...d,
      completed: d.completed.includes(lesson.slug) ? d.completed.filter((s) => s !== lesson.slug) : [...d.completed, lesson.slug],
    }));

  return (
    <section id={`lesson-${lesson.slug}`} data-read={`lesson:${lesson.slug}`} className="relative scroll-mt-32 pb-16 pl-14 md:pl-20">
      <div className="absolute left-0 top-0">
        <NumberBadge n={`1.${index + 1}`} />
      </div>
      <Reveal>
        <div className="flex items-center gap-3">
          <Icon size={32} className="text-[#FFB800]" aria-hidden />
          <p className="text-sm text-[#9B9B9B]">{t.learn.minutes(lesson.minutes)}</p>
        </div>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">{text.title}</h2>
        <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{text.summary}</p>
      </Reveal>

      <Reveal delay={80} className="mt-6">
        {(lessonScenes[lesson.slug] ?? lesson.scene) && (
          <LazyScene spec={(lessonScenes[lesson.slug] ?? lesson.scene)!} label={t.learn.sceneLabel(text.title)} className="h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-2 md:h-[460px]" />
        )}
        {lesson.signGallery && (
          <div className="rounded-2xl border border-white/10 bg-[#181818] p-2 md:p-4">
            <SignGallery />
          </div>
        )}
      </Reveal>

      <ol className="mt-6 grid gap-3 md:grid-cols-2">
        {text.points.map((p, i) => (
          <Reveal as="li" key={p.heading} delay={(i % 2) * 90}>
            <div className="card h-full">
              <p className="font-mono text-sm text-[#FFB800]">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-xl font-semibold">{p.heading}</h3>
              <p className="mt-2 text-base text-[#9B9B9B]">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={100} className="mt-4">
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#1F1F1F] p-5">
          <Lightbulb size={26} weight="fill" className="mt-0.5 shrink-0 text-[#FFB800]" aria-hidden />
          <p className="text-base">{text.keyFact}</p>
        </div>
      </Reveal>

      <div className="mt-4">
        <button type="button" onClick={toggle} aria-pressed={done} className={`btn ${done ? "btn-ghost" : "btn-primary"}`}>
          {done ? <CheckCircle size={18} weight="fill" className="text-[#30a46c]" aria-hidden /> : <Circle size={18} aria-hidden />}
          {done ? ui.completed : ui.markComplete}
        </button>
      </div>
    </section>
  );
}

/* ---------- the test lives on its own page ---------- */

function TestLink({ partKey }: { partKey: string }) {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const data = useData();
  const best = data.partTests[partKey];
  return (
    <section id="test" className="relative scroll-mt-32 pl-14 md:pl-20">
      <div className="absolute left-0 top-0">
        <NumberBadge n="?" />
      </div>
      <Reveal>
        <h2 className="text-3xl font-semibold md:text-4xl">{ui.testTitle}</h2>
        <p className="mt-3 max-w-[680px] text-base text-[#9B9B9B]">{ui.testOpenBody}</p>
        {best && <p className="mt-2 text-sm font-semibold text-[#30a46c]">{ui.chapterTestScore(best.score, best.total)}</p>}
        <Link href={testHref(partKey)} className="btn btn-primary mt-4">
          {ui.testOpen}
          <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
      </Reveal>
    </section>
  );
}

/* ---------- the page ---------- */

export function PartPage({ partKey }: { partKey: string }) {
  const { lang, t } = useI18n();
  const ui = rulesUi[lang];
  const listRef = useRef<HTMLDivElement>(null);
  const fill = useScrollFill(listRef);

  const idx = partKeys.indexOf(partKey);
  const isLessons = partKey === "lessons";
  const chapter = chapters.find((c) => c.key === partKey);
  const ids = useMemo(() => (chapter ? chapter.rules : []), [chapter]);
  const sectionIds = useMemo(
    () => [...(isLessons ? lessons.map((l) => `lesson-${l.slug}`) : ids.map((id) => `rule-${ruleSlug(id)}`)), "test"],
    [isLessons, ids],
  );
  useSpy(sectionIds);

  if (idx < 0) return null;
  const prevKey = partKeys[idx - 1];
  const nextKey = partKeys[idx + 1];
  const count = isLessons ? lessons.length : ids.length;

  return (
    <article className="min-w-0 max-w-3xl">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
        <ArrowLeft size={16} aria-hidden />
        {ui.parts}
      </Link>

      <header className="mt-6">
        <p className="font-mono text-sm text-[#FFB800]">{ui.partOf(partNumber(partKey), partKeys.length)}</p>
        <h1 className="mt-1 text-5xl font-semibold">{ui.chapterNames[partKey]}</h1>
        <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{intros[lang][partKey]}</p>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="text-5xl font-semibold text-[#FFB800]">
            <CountUp key={`${partKey}-${count}`} to={count} />
          </span>
          <span className="text-base text-[#9B9B9B]">{isLessons ? ui.unitLessons : ui.unitRules}</span>
        </p>
        {!isLessons && (
          <p className="mt-2 text-sm text-[#9B9B9B]">
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#FFB800] hover:underline">
              {ui.sourceLink}
            </a>
          </p>
        )}
      </header>

      <div ref={listRef} className="relative mt-12">
        {/* the rail fills while you scroll, so you always see how far into the chapter you are */}
        <div className="pointer-events-none absolute bottom-0 left-4 top-0 w-0.5 rounded-full bg-white/10" aria-hidden>
          <div className="w-full rounded-full bg-[#FFB800] transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ height: `${fill * 100}%` }} />
        </div>

        {isLessons
          ? lessons.map((l, i) => <LessonSection key={l.slug} index={i} />)
          : ids.map((id) => <RuleSection key={`${lang}-${id}`} id={id} />)}

        <TestLink partKey={partKey} />
      </div>

      <p className="mt-10 text-center text-sm text-[#9B9B9B]">{ui.scrollHint}</p>

      <nav aria-label={ui.parts} className="mt-4 flex flex-wrap justify-between gap-2">
        {prevKey ? (
          <Link href={partHref(prevKey)} className="btn btn-ghost">
            <ArrowLeft size={18} aria-hidden />
            {ui.prevPart}: {ui.chapterNames[prevKey]}
          </Link>
        ) : (
          <span />
        )}
        {nextKey ? (
          <Link href={partHref(nextKey)} className="btn btn-primary">
            {ui.nextPart}: {ui.chapterNames[nextKey]}
            <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        ) : (
          <Link href="/learn/rules/exam" className="btn btn-primary">
            {ui.examCta}
            <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        )}
      </nav>
      <span className="sr-only">{t.learn.title}</span>
    </article>
  );
}
