"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { lessons } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { chapters, isRead, partHref, partKeys, partNumber } from "@/lib/rules/data";
import { intros } from "@/lib/rules/details";
import { rulesUi } from "@/lib/rules/ui";
import { useData } from "@/lib/storage";
import { Reveal } from "@/components/Reveal";

export function LearnIndex() {
  const { t, lang } = useI18n();
  const ui = rulesUi[lang];
  const data = useData();

  const stats = (key: string) => {
    if (key === "lessons") {
      const done = lessons.filter((l) => data.completed.includes(l.slug) || data.read.includes(`lesson:${l.slug}`)).length;
      return { total: lessons.length, done, unit: ui.unitLessons };
    }
    const c = chapters.find((x) => x.key === key)!;
    return { total: c.rules.length, done: c.rules.filter((id) => isRead(data.read, data.rules, id)).length, unit: ui.unitRules };
  };

  return (
    <div className="min-w-0">
      <h1 className="max-w-[680px] text-5xl font-semibold">{t.learn.title}</h1>
      <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{ui.sub}</p>
      <Link href="/learn/rules/exam" className="btn btn-primary mt-6">
        {ui.examCta}
        <ArrowRight size={18} weight="bold" aria-hidden />
      </Link>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {partKeys.map((key, i) => {
          const s = stats(key);
          return (
            <Reveal as="li" key={key} delay={(i % 3) * 70}>
              <Link href={partHref(key)} className="card flex h-full flex-col gap-3">
                <p className="font-mono text-sm text-[#FFB800]">{partNumber(key)}</p>
                <h2 className="text-xl font-semibold">{ui.chapterNames[key]}</h2>
                <p className="text-sm text-[#9B9B9B]">{intros[lang][key]}</p>
                <div className="mt-auto">
                  <div className="h-1.5 rounded-full bg-[#272727]">
                    <div
                      className="h-1.5 rounded-full bg-[#FFB800] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      style={{ width: `${(s.done / s.total) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#9B9B9B]">
                    {s.total} {s.unit} · {ui.readOf(s.done, s.total)}
                  </p>
                  <p className={`mt-1 text-sm ${data.partTests[key] ? "font-semibold text-[#30a46c]" : "text-[#9B9B9B]"}`}>
                    {data.partTests[key] ? ui.chapterTestScore(data.partTests[key].score, data.partTests[key].total) : ui.notTaken}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
