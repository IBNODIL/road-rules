"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Trophy, XCircle } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { allRuleIds, buildQuiz, clauseRef, ruleHref, ruleNumber } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { ruleTexts } from "@/lib/rules/texts";
import { update, useData, useReady, type Attempt } from "@/lib/storage";

const EXAM_LENGTH = 20;

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Run = { ids: string[]; answers: (number | null)[]; idx: number; startedAt: number };

export function RulesExam() {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const texts = ruleTexts[lang];
  const data = useData();
  const ready = useReady();
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<Attempt | null>(null);

  const start = () => {
    setResult(null);
    const ids = shuffle(allRuleIds).slice(0, EXAM_LENGTH);
    setRun({ ids, answers: ids.map(() => null), idx: 0, startedAt: Date.now() });
  };

  const answer = (choice: number) => {
    if (!run || run.answers[run.idx] !== null) return;
    const id = run.ids[run.idx];
    const ok = buildQuiz(id, texts[id][3]).answer === choice;
    update((d) => ({ ...d, rules: { ...d.rules, [id]: ok } }));
    setRun({ ...run, answers: run.answers.map((a, i) => (i === run.idx ? choice : a)) });
  };

  const finish = () => {
    if (!run) return;
    const wrong: string[] = [];
    let score = 0;
    run.ids.forEach((id, i) => {
      if (buildQuiz(id, texts[id][3]).answer === run.answers[i]) score++;
      else wrong.push(id);
    });
    const attempt: Attempt = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      score,
      total: run.ids.length,
      seconds: Math.round((Date.now() - run.startedAt) / 1000),
      wrong,
    };
    update((d) => ({ ...d, ruleExams: [attempt, ...d.ruleExams].slice(0, 30) }));
    setResult(attempt);
    setRun(null);
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-w-0 max-w-3xl">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
        <ArrowLeft size={16} aria-hidden />
        {ui.back}
      </Link>
      <h1 className="mt-4 text-5xl font-semibold">{ui.examTitle}</h1>
      <p className="mb-8 mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{ui.examSub}</p>
      {children}
    </div>
  );

  if (!ready) return shell(<div className="skeleton h-64 w-full rounded-2xl" aria-hidden />);

  if (result) {
    return shell(
      <div className="flex flex-col gap-8">
        <div className="card flex flex-col items-start gap-4">
          <Trophy size={40} weight="fill" className="text-[#FFB800]" aria-hidden />
          <h2 className="text-4xl font-semibold" role="status">
            {ui.score(result.score, result.total)}
          </h2>
          <button type="button" className="btn btn-primary" onClick={start}>
            {ui.again}
          </button>
        </div>
        {result.wrong.length > 0 && (
          <section aria-labelledby="rv">
            <h3 id="rv" className="text-2xl font-semibold">
              {ui.review}
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {result.wrong.map((id) => (
                <li key={id} className="rounded-lg border border-white/10 bg-[#181818] p-4">
                  <p className="font-mono text-xs text-[#FFB800]">
                    {ruleNumber(id)} · {ui.tag(clauseRef(id).kind, clauseRef(id).n)}
                  </p>
                  <p className="mt-1 text-base font-semibold">{texts[id][0]}</p>
                  <p className="mt-1 text-sm text-[#9B9B9B]">{texts[id][1]}</p>
                  <Link href={ruleHref(id)} className="mt-2 inline-block text-sm font-semibold text-[#FFB800] hover:underline">
                    {ui.readRule}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>,
    );
  }

  if (run) {
    const id = run.ids[run.idx];
    const t = texts[id];
    const quiz = buildQuiz(id, t[3]);
    const chosen = run.answers[run.idx];
    const answered = chosen !== null;
    const last = run.idx === run.ids.length - 1;
    return shell(
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-[#9B9B9B]" aria-live="polite">
          {ui.examQ(run.idx + 1, run.ids.length)}
        </p>
        <div className="h-2 rounded-full bg-[#272727]" role="progressbar" aria-valuenow={run.idx + (answered ? 1 : 0)} aria-valuemax={run.ids.length}>
          <div
            className="h-2 rounded-full bg-[#FFB800] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${((run.idx + (answered ? 1 : 0)) / run.ids.length) * 100}%` }}
          />
        </div>
        <h2 className="text-2xl font-semibold">{t[2]}</h2>
        <ul className="flex flex-col gap-2">
          {quiz.options.map((o, i) => {
            const right = i === quiz.answer;
            const mine = i === chosen;
            const state = !answered
              ? "border-white/10 bg-[#1F1F1F] hover:-translate-y-0.5 hover:bg-[#272727]"
              : right
                ? "border-[#30a46c] bg-[#272727]"
                : mine
                  ? "border-[#e5484d] bg-[#272727]"
                  : "border-white/10 bg-[#1F1F1F] opacity-60";
            return (
              <li key={o}>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => answer(i)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-base transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:cursor-default ${state}`}
                >
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-black text-xs font-semibold">
                    {answered && right ? (
                      <CheckCircle size={20} weight="fill" className="text-[#30a46c]" aria-label={ui.correct} />
                    ) : answered && mine ? (
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
        {answered && (
          <div className="rounded-lg border border-white/10 bg-[#1F1F1F] p-4" role="status">
            <p className="font-mono text-xs text-[#FFB800]">
              {ruleNumber(id)} · {ui.tag(clauseRef(id).kind, clauseRef(id).n)} · {t[0]}
            </p>
            <p className="mt-1 text-sm text-[#9B9B9B]">{t[1]}</p>
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary self-start"
          disabled={!answered}
          onClick={last ? finish : () => setRun({ ...run, idx: run.idx + 1 })}
        >
          {last ? ui.finish : ui.next}
          <ArrowRight size={18} weight="bold" aria-hidden />
        </button>
      </div>,
    );
  }

  return shell(
    <div className="flex flex-col gap-8">
      <button type="button" className="btn btn-primary self-start" onClick={start}>
        {ui.examStart}
        <ArrowRight size={18} weight="bold" aria-hidden />
      </button>
      <section aria-labelledby="hist">
        <h2 id="hist" className="text-2xl font-semibold">
          {ui.history}
        </h2>
        {data.ruleExams.length === 0 ? (
          <p className="mt-2 text-base text-[#9B9B9B]">{ui.noHistory}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {data.ruleExams.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#181818] px-4 py-3 text-base">
                <span>{new Date(a.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="font-semibold">{ui.score(a.score, a.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>,
  );
}
