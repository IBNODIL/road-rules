"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { SOURCE_URL, allRuleIds, buildQuiz, chapterOf, clauseLabel, ruleIdFromSlug, ruleSlug } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { ruleTexts } from "@/lib/rules/texts";
import { update, useData } from "@/lib/storage";

function Quiz({ id }: { id: string }) {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const [, , question, options] = ruleTexts[lang][id];
  const quiz = useMemo(() => buildQuiz(id, options), [id, options]);
  const [picked, setPicked] = useState<number | null>(null);

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    update((d) => ({ ...d, rules: { ...d.rules, [id]: i === quiz.answer } }));
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#181818] p-6" aria-labelledby="quiz-h">
      <h2 id="quiz-h" className="text-sm font-semibold text-[#9B9B9B]">
        {ui.check}
      </h2>
      <p className="mt-2 text-2xl font-semibold">{question}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {quiz.options.map((o, i) => {
          const right = i === quiz.answer;
          const chosen = i === picked;
          const state =
            picked === null
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
                disabled={picked !== null}
                onClick={() => pick(i)}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-base transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:cursor-default ${state}`}
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-black text-xs font-semibold">
                  {picked !== null && right ? (
                    <CheckCircle size={20} weight="fill" className="text-[#30a46c]" aria-label={ui.correct} />
                  ) : picked !== null && chosen ? (
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
      {picked !== null && (
        <p className="mt-4 text-base text-[#9B9B9B]" role="status">
          {picked === quiz.answer ? ui.correct : ui.wrong}
        </p>
      )}
    </section>
  );
}

export function RulePage({ slug }: { slug: string }) {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const data = useData();
  const id = ruleIdFromSlug(slug);
  if (!id) return null;
  const t = ruleTexts[lang][id];
  const ch = chapterOf(id);
  const i = allRuleIds.indexOf(id);
  const prev = allRuleIds[i - 1];
  const next = allRuleIds[i + 1];
  const done = data.rules[id];

  return (
    <article className="min-w-0 max-w-3xl">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
        <ArrowLeft size={16} aria-hidden />
        {ui.chapterNames[ch.key]}
      </Link>
      <header className="mt-6">
        <p className="font-mono text-sm text-[#FFB800]">
          {ui.clause} {clauseLabel(id)}
        </p>
        <h1 className="mt-1 flex items-start gap-3 text-4xl font-semibold md:text-5xl">
          {t[0]}
          {done && <CheckCircle size={32} weight="fill" className="mt-1 shrink-0 text-[#30a46c]" aria-label={ui.answered} />}
        </h1>
      </header>
      <p className="mt-6 max-w-[680px] text-lg">{t[1]}</p>
      <p className="mt-3 text-sm text-[#9B9B9B]">
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#FFB800] hover:underline">
          {ui.sourceLink}
        </a>
      </p>

      <div className="mt-8">
        <Quiz key={`${lang}-${id}`} id={id} />
      </div>

      <nav aria-label={ui.chapters} className="mt-8 flex flex-wrap justify-between gap-2">
        {prev ? (
          <Link href={`/learn/rules/${ruleSlug(prev)}`} className="btn btn-ghost">
            <ArrowLeft size={18} aria-hidden />
            {ui.prev}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/rules/${ruleSlug(next)}`} className="btn btn-primary">
            {ui.nextRule}
            <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        ) : (
          <Link href="/learn/rules/exam" className="btn btn-primary">
            {ui.examCta}
            <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        )}
      </nav>
    </article>
  );
}
