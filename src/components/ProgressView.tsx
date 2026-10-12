"use client";

import Link from "next/link";
import { useState } from "react";
import { PASS_MARK, lessons } from "@/lib/content";
import { levelIds } from "@/lib/sim";
import { allRuleIds, chapters, isRead, partHref, partKeys, partNumber } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { resetAll, useData, useReady } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

export function ProgressView() {
  const { t, lang } = useI18n();
  const p = t.progress;
  const data = useData();
  const ready = useReady();
  const [confirm, setConfirm] = useState(false);

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <h1 className="max-w-[680px] text-5xl font-semibold">{p.title}</h1>
      <p className="mb-12 mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{p.sub}</p>
      {children}
    </div>
  );

  if (!ready) return shell(<div className="skeleton h-64 w-full rounded-2xl" aria-hidden />);

  const lessonDone = (slug: string) => data.completed.includes(slug) || data.read.includes(`lesson:${slug}`);
  const best = data.attempts.reduce((m, a) => Math.max(m, a.score / a.total), 0);
  const avg = data.attempts.length ? data.attempts.reduce((s, a) => s + a.score / a.total, 0) / data.attempts.length : 0;
  /* the figures below are computed after the per-chapter numbers, see statsList */
  const stats: { label: string; value: string }[] = [];

  const perPart = partKeys.map((key) => {
    const c = chapters.find((x) => x.key === key);
    const total = c ? c.rules.length : lessons.length;
    const done = c ? c.rules.filter((id) => isRead(data.read, data.rules, id)).length : lessons.filter((l) => lessonDone(l.slug)).length;
    return { key, total, done, test: data.partTests[key] };
  });
  const totalAll = perPart.reduce((n, x) => n + x.total, 0);
  const doneAll = perPart.reduce((n, x) => n + x.done, 0);
  const ru = rulesUi[lang];
  stats.push(
    { label: ru.readStat, value: `${Math.round((doneAll / totalAll) * 100)}%` },
    { label: ru.chapterTests, value: `${perPart.filter((x) => x.test).length} / ${partKeys.length}` },
    { label: p.tests, value: String(data.attempts.length) },
    { label: p.best, value: data.attempts.length ? `${Math.round(best * 100)}%` : p.none },
    { label: p.avg, value: data.attempts.length ? `${Math.round(avg * 100)}%` : p.none },
  );

  return shell(
    <div className="flex flex-col gap-12">
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card first:col-span-2 md:first:col-span-1">
            <dt className="text-sm text-[#9B9B9B]">{s.label}</dt>
            <dd className="mt-2 text-3xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="overall">
        <h2 id="overall" className="text-2xl font-semibold">
          {ru.overall}
        </h2>
        <div className="mt-3 h-2 max-w-xl rounded-full bg-[#272727]" role="progressbar" aria-valuenow={doneAll} aria-valuemax={totalAll} aria-label={ru.overall}>
          <div className="h-2 rounded-full bg-[#FFB800] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ width: `${(doneAll / totalAll) * 100}%` }} />
        </div>
        <p className="mt-2 text-base text-[#9B9B9B]">{ru.readOf(doneAll, totalAll)}</p>
        <h3 className="mt-8 text-xl font-semibold">{ru.chaptersHeading}</h3>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {perPart.map((x) => (
            <li key={x.key}>
              <Link href={partHref(x.key)} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#181818] px-4 py-3 hover:bg-[#1F1F1F]">
                <span className="min-w-0">
                  <span className="font-mono text-xs text-[#FFB800]">{partNumber(x.key)}</span>{" "}
                  <span className="text-base">{ru.chapterNames[x.key]}</span>
                  <span className="mt-1 block h-1.5 w-40 max-w-full rounded-full bg-[#272727]">
                    <span className="block h-1.5 rounded-full bg-[#FFB800]" style={{ width: `${(x.done / x.total) * 100}%` }} />
                  </span>
                </span>
                <span className="shrink-0 text-right text-sm text-[#9B9B9B]">
                  {x.done}/{x.total}
                  <span className={`block ${x.test ? "font-semibold text-[#30a46c]" : ""}`}>{x.test ? ru.chapterTestScore(x.test.score, x.test.total) : ru.notTaken}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules-progress">
        <h2 id="rules-progress" className="text-2xl font-semibold">
          {rulesUi[lang].title}
        </h2>
        <p className="mt-2 text-base text-[#9B9B9B]">
          {rulesUi[lang].progress(allRuleIds.filter((id) => data.rules[id]).length, allRuleIds.length)}
        </p>
        <Link href="/learn" className="btn btn-ghost mt-4">
          {rulesUi[lang].rulesHeading}
        </Link>
      </section>

      <section aria-labelledby="hist">
        <h2 id="hist" className="text-2xl font-semibold">{p.history}</h2>
        {data.attempts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#181818] p-6">
            <p className="text-base text-[#9B9B9B]">{p.empty}</p>
            <Link href="/test" className="btn btn-primary mt-4">{p.take}</Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {data.attempts.map((a) => {
              const pass = a.score / a.total >= PASS_MARK;
              return (
                <li key={a.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#181818] px-4 py-3">
                  <span className="text-base">
                    {new Date(a.date).toLocaleDateString(t.locale, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-sm text-[#9B9B9B]">
                    {Math.floor(a.seconds / 60)} {p.min} {a.seconds % 60} {p.sec}
                  </span>
                  <span className={`text-base font-semibold ${pass ? "text-[#30a46c]" : "text-[#e5484d]"}`}>
                    {a.score}/{a.total} {pass ? p.passed : p.failed}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="sim" key={lang}>
        <h2 id="sim" className="text-2xl font-semibold">{p.simBest}</h2>
        <ul className="mt-4 grid gap-2 md:grid-cols-3">
          {levelIds.map((id) => {
            const s = data.sim[id];
            return (
              <li key={id} className="rounded-lg border border-white/10 bg-[#181818] p-4">
                <p className="text-sm text-[#9B9B9B]">{t.sim.levels[id].name}</p>
                <p className="mt-1 text-xl font-semibold">
                  {s && s.score <= 10 ? `${s.score} / 10 · ${"★".repeat(s.stars)}${"☆".repeat(3 - s.stars)}` : p.simNone}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="data">
        <h2 id="data" className="text-2xl font-semibold">{p.dataTitle}</h2>
        <p className="mt-2 max-w-[680px] text-base text-[#9B9B9B]">{p.dataBody}</p>
        {confirm ? (
          <div className="mt-4 flex flex-wrap items-center gap-2" role="alertdialog" aria-label={p.confirm}>
            <span className="text-base">{p.confirm}</span>
            <button
              type="button"
              className="btn bg-[#e5484d] text-white hover:brightness-110"
              onClick={() => {
                resetAll();
                setConfirm(false);
              }}
            >
              {p.yes}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>
              {p.cancel}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost mt-4" onClick={() => setConfirm(true)}>
            {p.reset}
          </button>
        )}
      </section>
    </div>,
  );
}
