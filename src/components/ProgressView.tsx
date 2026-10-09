"use client";

import Link from "next/link";
import { useState } from "react";
import { PASS_MARK, lessons } from "@/lib/content";
import { levelIds } from "@/lib/sim";
import { allRuleIds } from "@/lib/rules/data";
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

  const best = data.attempts.reduce((m, a) => Math.max(m, a.score / a.total), 0);
  const avg = data.attempts.length ? data.attempts.reduce((s, a) => s + a.score / a.total, 0) / data.attempts.length : 0;
  const stats = [
    { label: p.lessons, value: `${data.completed.length} / ${lessons.length}` },
    { label: p.tests, value: String(data.attempts.length) },
    { label: p.best, value: data.attempts.length ? `${Math.round(best * 100)}%` : p.none },
    { label: p.avg, value: data.attempts.length ? `${Math.round(avg * 100)}%` : p.none },
  ];

  return shell(
    <div className="flex flex-col gap-12">
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <dt className="text-sm text-[#9B9B9B]">{s.label}</dt>
            <dd className="mt-2 text-3xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

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
