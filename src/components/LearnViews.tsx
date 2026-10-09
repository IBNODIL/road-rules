"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Lightbulb } from "@phosphor-icons/react";
import { lessonBySlug, lessons } from "@/lib/content";
import { iconMap } from "@/lib/icons";
import { chapters, ruleSlug } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { useData } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import { RoadScene, SignGallery } from "@/components/three/lazy";
import { CompleteButton, DoneBadge, ProgressBar } from "@/components/LessonBits";
import { Reveal } from "@/components/Reveal";

export function LearnIndex() {
  const { t, lang } = useI18n();
  const ru = rulesUi[lang];
  const data = useData();
  return (
    <div className="min-w-0">
      <h1 className="max-w-[680px] text-5xl font-semibold">{t.learn.title}</h1>
      <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{t.learn.sub}</p>
      <div className="mt-6">
        <ProgressBar total={lessons.length} />
      </div>
      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {lessons.map((l, i) => {
          const Icon = iconMap[l.icon];
          const text = t.lessons[l.slug];
          return (
            <Reveal as="li" key={l.slug} delay={(i % 2) * 80}>
              <Link href={`/learn/${l.slug}`} className="card flex h-full flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Icon size={32} className="text-[#FFB800]" aria-hidden />
                  <DoneBadge slug={l.slug} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{text.title}</h2>
                  <p className="mt-2 text-base text-[#9B9B9B]">{text.summary}</p>
                </div>
                <p className="mt-auto flex items-center gap-1 text-sm text-[#9B9B9B]">
                  <Clock size={16} aria-hidden />
                  {t.learn.minutes(l.minutes)}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      <section className="mt-16" aria-labelledby="rules-h">
        <h2 id="rules-h" className="text-3xl font-semibold">
          {ru.title}
        </h2>
        <p className="mt-2 max-w-[680px] text-base text-[#9B9B9B]">{ru.sub}</p>
        <Link href="/learn/rules/exam" className="btn btn-primary mt-4">
          {ru.examCta}
        </Link>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chapters.map((c) => {
            const done = c.rules.filter((id) => data.rules[id]).length;
            return (
              <li key={c.key}>
                <Link href={`/learn/rules/${ruleSlug(c.rules[0])}`} className="card flex h-full flex-col gap-2">
                  <h3 className="text-lg font-semibold">{ru.chapterNames[c.key]}</h3>
                  <p className="mt-auto text-sm text-[#9B9B9B]">
                    {ru.inChapter(c.rules.length)} · {done}/{c.rules.length}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function LessonView({ slug }: { slug: string }) {
  const { t } = useI18n();
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();
  const index = lessons.findIndex((l) => l.slug === slug);
  const next = lessons[index + 1];
  const Icon = iconMap[lesson.icon];
  const text = t.lessons[lesson.slug];

  return (
    <article className="min-w-0">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
        <ArrowLeft size={16} aria-hidden />
        {t.learn.allLessons}
      </Link>
      <header className="mt-6 flex items-start gap-4">
        <Icon size={40} className="mt-1 shrink-0 text-[#FFB800]" aria-hidden />
        <div>
          <p className="text-sm text-[#9B9B9B]">{t.learn.header(index + 1, lessons.length, lesson.minutes)}</p>
          <h1 className="mt-1 max-w-[680px] text-4xl font-semibold md:text-5xl">{text.title}</h1>
          <p className="mt-3 max-w-[680px] text-lg text-[#9B9B9B]">{text.summary}</p>
        </div>
      </header>

      <div className="mt-12 rounded-2xl border border-white/10 bg-[#181818] p-2">
        {lesson.scene && (
          <RoadScene
            spec={lesson.scene}
            label={t.learn.sceneLabel(text.title)}
            className="h-[420px] w-full rounded-lg md:h-[520px]"
          />
        )}
        {lesson.signGallery && (
          <div className="rounded-lg bg-[#181818] p-2 md:p-4">
            <SignGallery />
          </div>
        )}
      </div>

      <ol className="mt-12 grid gap-4 md:grid-cols-2">
        {text.points.map((p, i) => (
          <Reveal as="li" key={p.heading} delay={(i % 2) * 80}>
            <div className="card h-full">
              <p className="font-mono text-sm text-[#FFB800]">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 text-xl font-semibold">{p.heading}</h2>
              <p className="mt-2 text-base text-[#9B9B9B]">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <aside className="mt-4 flex gap-4 rounded-2xl border border-white/10 bg-[#1F1F1F] p-6" aria-label={t.learn.keyFact}>
        <Lightbulb size={28} weight="fill" className="shrink-0 text-[#FFB800]" aria-hidden />
        <p className="max-w-[680px] text-lg">{text.keyFact}</p>
      </aside>

      <div className="mt-12">
        <CompleteButton
          slug={lesson.slug}
          next={next ? { slug: next.slug, title: t.lessons[next.slug].title } : undefined}
        />
      </div>
    </article>
  );
}
