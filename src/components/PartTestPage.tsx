"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import { lessons, questions, questionText } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { buildQuiz, chapters, lessonHref, partHref, partKeys, partNumber, ruleNumber, ruleSlug } from "@/lib/rules/data";
import { ruleTexts } from "@/lib/rules/texts";
import { rulesUi } from "@/lib/rules/ui";
import { update } from "@/lib/storage";
import { LazyScene } from "@/components/LazyScene";
import { Reveal } from "@/components/Reveal";
import type { SceneSpec } from "@/lib/types";

type Item = {
  id: string;
  num: string;
  prompt: string;
  options: string[];
  answer: number;
  /** Shown only on the lessons test, where the cars wait for the answer. */
  scene?: SceneSpec;
  read: string;
  /** Rule id for the per-rule record, when the question comes from a rule. */
  rule?: string;
};

/** The test of one chapter, on its own page so the answers cannot be read in the lessons. */
export function PartTestPage({ partKey }: { partKey: string }) {
  const { t, lang } = useI18n();
  const ui = rulesUi[lang];
  const texts = ruleTexts[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const items = useMemo<Item[]>(() => {
    if (partKey === "lessons") {
      return questions
        .filter((q) => !q.sign)
        .map((q) => {
          const qt = questionText(q, t);
          const n = lessons.findIndex((l) => l.slug === q.lesson) + 1;
          return { id: q.id, num: `1.${n}`, prompt: qt.text, options: qt.options, answer: q.answer, scene: q.scene, read: lessonHref(q.lesson) };
        });
    }
    const c = chapters.find((x) => x.key === partKey);
    return (c?.rules ?? []).map((id) => {
      const quiz = buildQuiz(id, texts[id][3]);
      return { id, rule: id, num: ruleNumber(id), prompt: texts[id][2], options: quiz.options, answer: quiz.answer, read: `${partHref(partKey)}#rule-${ruleSlug(id)}` };
    });
  }, [partKey, t, texts]);

  const idx = partKeys.indexOf(partKey);
  if (idx < 0) return null;
  const nextKey = partKeys[idx + 1];

  const answered = items.filter((i) => answers[i.id] !== undefined).length;
  const score = items.filter((i) => answers[i.id] === i.answer).length;

  const pick = (item: Item, choice: number) => {
    if (answers[item.id] !== undefined) return;
    const next = { ...answers, [item.id]: choice };
    setAnswers(next);
    update((d) => {
      const rules = item.rule ? { ...d.rules, [item.rule]: choice === item.answer } : d.rules;
      if (Object.keys(next).length < items.length) return { ...d, rules };
      const s = items.filter((i) => next[i.id] === i.answer).length;
      const prev = d.partTests[partKey];
      const better = !prev || s / items.length >= prev.score / prev.total;
      return { ...d, rules, partTests: better ? { ...d.partTests, [partKey]: { score: s, total: items.length } } : d.partTests };
    });
  };

  return (
    <article className="min-w-0 max-w-3xl">
      <Link href={partHref(partKey)} className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
        <ArrowLeft size={16} aria-hidden />
        {ui.backToChapter}
      </Link>

      <header className="mt-6">
        <p className="font-mono text-sm text-[#FFB800]">{ui.partOf(partNumber(partKey), partKeys.length)}</p>
        <h1 className="mt-1 text-4xl font-semibold md:text-5xl">
          {ui.testTitle}: {ui.chapterNames[partKey]}
        </h1>
        <p className="mt-3 max-w-[680px] text-base text-[#9B9B9B]">{ui.testSub}</p>
        <div className="mt-4 h-2 max-w-sm rounded-full bg-[#272727]" role="progressbar" aria-valuenow={answered} aria-valuemax={items.length} aria-label={ui.testTitle}>
          <div className="h-2 rounded-full bg-[#FFB800] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ width: `${(answered / items.length) * 100}%` }} />
        </div>
      </header>

      <ol className="mt-8 flex flex-col gap-6">
        {items.map((q) => {
          const mine = answers[q.id];
          const done = mine !== undefined;
          return (
            <Reveal as="li" key={q.id}>
              <div className="rounded-2xl border border-white/10 bg-[#181818] p-5">
                <p className="font-mono text-xs text-[#FFB800]">{q.num}</p>
                <p className="mt-1 text-xl font-semibold">{q.prompt}</p>
                {q.scene && <LazyScene spec={q.scene} gated released={done} label={q.prompt} className="mt-3 h-[300px] w-full overflow-hidden rounded-xl bg-[#131209]" />}
                <ul className="mt-3 flex flex-col gap-2">
                  {q.options.map((o, i) => {
                    const right = i === q.answer;
                    const chosen = i === mine;
                    const state = !done
                      ? "border-white/10 bg-[#1F1F1F] hover:-translate-y-0.5 hover:bg-[#272727]"
                      : right
                        ? "border-[#30a46c] bg-[#272727]"
                        : chosen
                          ? "border-[#e5484d] bg-[#272727]"
                          : "border-white/10 bg-[#1F1F1F] opacity-60";
                    return (
                      <li key={o}>
                        <button
                          type="button"
                          disabled={done}
                          onClick={() => pick(q, i)}
                          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-base transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:cursor-default ${state}`}
                        >
                          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-black text-xs font-semibold">
                            {done && right ? (
                              <CheckCircle size={20} weight="fill" className="text-[#30a46c]" aria-label={ui.correct} />
                            ) : done && chosen ? (
                              <XCircle size={20} weight="fill" className="text-[#e5484d]" aria-label={ui.wrong} />
                            ) : (
                              String.fromCharCode(65 + i)
                            )}
                          </span>
                          <span>{o}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {done && (
                  <p className="mt-3 text-sm text-[#9B9B9B]" role="status">
                    {mine === q.answer ? ui.correct : ui.wrong}{" "}
                    <Link href={q.read} className="font-semibold text-[#FFB800] hover:underline">
                      {ui.readRule} {q.num}
                    </Link>
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </ol>

      {answered === items.length && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#181818] p-6" role="status">
          <p className="text-2xl font-semibold">{ui.testScore(score, items.length)}</p>
          <p className="mt-1 text-base text-[#9B9B9B]">{ui.testDone}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setAnswers({})}>
              {ui.again}
            </button>
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
          </div>
        </div>
      )}
    </article>
  );
}
