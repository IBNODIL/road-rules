"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle, XCircle, Trophy, ArrowCounterClockwise, X } from "@phosphor-icons/react";
import { PASS_MARK, lessonBySlug, questions } from "@/lib/content";
import { findQuestion, findQuestionText, ruleQuestions } from "@/lib/ruleQuestions";
import { chapterOf, clauseRef, lessonHref, partKeys, ruleHref, ruleNumber } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { update, useData, useReady, type Attempt } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import { RoadScene, SignStage } from "@/components/three/lazy";

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const passFor = (total: number) => Math.round(PASS_MARK * total);
const pickOne = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function Header() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="max-w-[680px] text-5xl font-semibold">{t.test.title}</h1>
      <p className="mb-12 mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{t.test.sub}</p>
    </>
  );
}

export function TestRunner() {
  const { t, lang } = useI18n();
  const ru = rulesUi[lang];
  const data = useData();
  const ready = useReady();
  const [result, setResult] = useState<Attempt | null>(null);
  const active = data.active;

  const start = () => {
    setResult(null);
    /* one question from every chapter, the lessons chapter included */
    const ids = shuffle(
      partKeys.map((key) => (key === "lessons" ? pickOne(questions) : pickOne(ruleQuestions.filter((q) => chapterOf(q.rule!).key === key)))),
    ).map((q) => q.id);
    update((d) => ({
      ...d,
      active: { ids, answers: ids.map(() => null), idx: 0, startedAt: Date.now() },
    }));
  };

  const abandon = () => update((d) => ({ ...d, active: null }));

  const answer = (choice: number) =>
    update((d) => {
      if (!d.active || d.active.answers[d.active.idx] !== null) return d;
      const answers = [...d.active.answers];
      answers[d.active.idx] = choice;
      return { ...d, active: { ...d.active, answers } };
    });

  const next = () => update((d) => (d.active ? { ...d, active: { ...d.active, idx: d.active.idx + 1 } } : d));

  const finish = () => {
    if (!active) return;
    const wrong: string[] = [];
    let score = 0;
    active.ids.forEach((id, i) => {
      if (findQuestion(id)?.answer === active.answers[i]) score++;
      else wrong.push(id);
    });
    const attempt: Attempt = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      score,
      total: active.ids.length,
      seconds: Math.round((Date.now() - active.startedAt) / 1000),
      wrong,
    };
    update((d) => ({ ...d, attempts: [attempt, ...d.attempts].slice(0, 30), active: null }));
    setResult(attempt);
  };

  const wrap = (children: React.ReactNode) => (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <Header />
      {children}
    </div>
  );

  if (!ready) return wrap(<div className="skeleton h-96 w-full rounded-2xl" aria-hidden />);

  /* ----- result ----- */
  if (result) {
    const passed = result.score / result.total >= PASS_MARK;
    return wrap(
      <div className="flex flex-col gap-8">
        <div className="card flex flex-col items-start gap-4">
          <Trophy size={40} weight="fill" className={passed ? "text-[#FFB800]" : "text-[#9B9B9B]"} aria-hidden />
          <h2 className="text-4xl font-semibold">{t.test.scoreTitle(result.score, result.total)}</h2>
          <p className="max-w-[680px] text-lg text-[#9B9B9B]" role="status">
            {passed ? t.test.passed(fmtTime(result.seconds), passFor(result.total)) : t.test.failed(passFor(result.total))}
          </p>
          <button type="button" className="btn btn-primary" onClick={start}>
            <ArrowCounterClockwise size={18} aria-hidden />
            {t.test.another}
          </button>
        </div>
        {result.wrong.length > 0 && (
          <section aria-labelledby="review">
            <h3 id="review" className="text-2xl font-semibold">
              {t.test.reviewTitle}
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {result.wrong.map((id) => {
                const q = findQuestion(id)!;
                const qt = findQuestionText(q, t, lang);
                const l = q.rule ? undefined : lessonBySlug(q.lesson);
                return (
                  <li key={id} className="rounded-lg border border-white/10 bg-[#181818] p-4">
                    <p className="text-base font-semibold">{qt.text}</p>
                    <p className="mt-1 text-sm text-[#9B9B9B]">
                      {t.test.correctAnswer}: {qt.options[q.answer]}
                    </p>
                    <p className="mt-1 text-sm text-[#9B9B9B]">{qt.explanation}</p>
                    {q.rule && (
                      <Link href={ruleHref(q.rule)} className="mt-2 inline-block text-sm font-semibold text-[#FFB800] hover:underline">
                        {ru.readRule} {ruleNumber(q.rule)}
                      </Link>
                    )}
                    {l && (
                      <Link href={lessonHref(l.slug)} className="mt-2 inline-block text-sm font-semibold text-[#FFB800] hover:underline">
                        {t.test.openLesson(t.lessons[l.slug].title)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>,
    );
  }

  /* ----- running ----- */
  if (active) {
    const q = findQuestion(active.ids[active.idx]);
    if (!q) {
      abandon();
      return null;
    }
    const qt = findQuestionText(q, t, lang);
    const chosen = active.answers[active.idx];
    const answered = chosen !== null;
    const last = active.idx === active.ids.length - 1;
    return wrap(
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#9B9B9B]" aria-live="polite">
            {t.test.qOf(active.idx + 1, active.ids.length)}
          </p>
          <button type="button" onClick={abandon} className="inline-flex items-center gap-1 text-sm text-[#9B9B9B] hover:text-white">
            <X size={16} aria-hidden />
            {t.test.abandon}
          </button>
        </div>
        <div
          className="h-2 rounded-full bg-[#272727]"
          role="progressbar"
          aria-valuenow={active.idx + (answered ? 1 : 0)}
          aria-valuemax={active.ids.length}
          aria-label={t.test.progressLabel}
        >
          <div
            className="h-2 rounded-full bg-[#FFB800] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${((active.idx + (answered ? 1 : 0)) / active.ids.length) * 100}%` }}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#181818] p-2">
            {q.scene ? (
              <RoadScene
                key={q.id + active.idx}
                spec={q.scene}
                gated
                released={answered}
                label={t.test.sceneLabel(qt.text)}
                className="h-[360px] w-full rounded-lg md:h-[460px]"
              />
            ) : q.sign ? (
              <SignStage key={q.id} type={q.sign} className="h-[360px] w-full overflow-hidden rounded-lg md:h-[460px]" />
            ) : (
              <div className="grid h-[360px] place-items-center rounded-lg bg-[#131209] p-6 text-center md:h-[460px]">
                <div>
                  <p className="font-mono text-sm text-[#FFB800]">
                    {ruleNumber(q.rule!)} · {ru.tag(clauseRef(q.rule!).kind, clauseRef(q.rule!).n)}
                  </p>
                  <p className="mt-3 text-3xl font-semibold">{ru.chapterNames[chapterOf(q.rule!).key]}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">{qt.text}</h2>
            <ul className="flex flex-col gap-2">
              {qt.options.map((o, i) => {
                const isRight = i === q.answer;
                const isChosen = i === chosen;
                const state = !answered
                  ? "border-white/10 bg-[#1F1F1F] hover:-translate-y-0.5 hover:bg-[#272727]"
                  : isRight
                    ? "border-[#30a46c] bg-[#272727]"
                    : isChosen
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
                        {answered && isRight ? (
                          <CheckCircle size={20} weight="fill" className="text-[#30a46c]" aria-label={t.test.correct} />
                        ) : answered && isChosen ? (
                          <XCircle size={20} weight="fill" className="text-[#e5484d]" aria-label={t.test.wrongMark} />
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

            {q.scene && !answered && <p className="text-sm text-[#9B9B9B]">{t.scene.waiting}</p>}

            {answered && (
              <div className="rounded-lg border border-white/10 bg-[#1F1F1F] p-4" role="status">
                <p className="text-base font-semibold">{chosen === q.answer ? t.test.correct : t.test.notQuite}</p>
                <p className="mt-1 text-sm text-[#9B9B9B]">{qt.explanation}</p>
              </div>
            )}

            <button type="button" className="btn btn-primary self-start" disabled={!answered} onClick={last ? finish : next}>
              {last ? t.test.finish : t.test.next}
              <ArrowRight size={18} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
      </div>,
    );
  }

  /* ----- start ----- */
  const best = data.attempts.reduce((m, a) => Math.max(m, a.score / a.total), 0);
  return wrap(
    <div className="card flex flex-col items-start gap-6">
      <h2 className="max-w-[680px] text-3xl font-semibold">{t.test.introTitle}</h2>
      <p className="max-w-[680px] text-lg text-[#9B9B9B]">{t.test.introBody(questions.length + ruleQuestions.length, passFor(partKeys.length))}</p>
      <p className="text-sm text-[#9B9B9B]">
        {data.attempts.length === 0 ? t.test.noAttempts : t.test.attemptsBest(data.attempts.length, Math.round(best * 100))}
      </p>
      <button type="button" className="btn btn-primary" onClick={start}>
        {t.test.start}
        <ArrowRight size={18} weight="bold" aria-hidden />
      </button>
    </div>,
  );
}
