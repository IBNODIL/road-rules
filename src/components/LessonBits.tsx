"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Circle } from "@phosphor-icons/react";
import { update, useData, useReady } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

export function CompleteButton({ slug, next }: { slug: string; next?: { slug: string; title: string } }) {
  const { t } = useI18n();
  const data = useData();
  const ready = useReady();
  const done = data.completed.includes(slug);

  const toggle = () =>
    update((d) => ({
      ...d,
      completed: d.completed.includes(slug)
        ? d.completed.filter((s) => s !== slug)
        : [...d.completed, slug],
    }));

  if (!ready) return <div className="skeleton h-10 w-48 rounded-lg" aria-hidden />;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={toggle} className={`btn ${done ? "btn-ghost" : "btn-primary"}`} aria-pressed={done}>
        {done ? <CheckCircle size={18} weight="fill" className="text-[#30a46c]" aria-hidden /> : <Circle size={18} aria-hidden />}
        {done ? t.learn.completed : t.learn.markComplete}
      </button>
      {next ? (
        <Link href={`/learn/${next.slug}`} className="btn btn-ghost">
          {t.learn.next(next.title)}
          <ArrowRight size={18} aria-hidden />
        </Link>
      ) : (
        <Link href="/test" className="btn btn-ghost">
          {t.learn.takeTest}
          <ArrowRight size={18} aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function DoneBadge({ slug }: { slug: string }) {
  const { t } = useI18n();
  const data = useData();
  if (!data.completed.includes(slug)) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#272727] px-2 py-0.5 text-xs font-semibold text-[#30a46c]">
      <CheckCircle size={14} weight="fill" aria-hidden />
      {t.learn.done}
    </span>
  );
}

export function ProgressBar({ total }: { total: number }) {
  const { t } = useI18n();
  const data = useData();
  const ready = useReady();
  const n = data.completed.length;
  if (!ready) return <div className="skeleton h-12 w-full max-w-sm rounded-lg" aria-hidden />;
  return (
    <div className="w-full max-w-sm">
      <p className="text-sm text-[#9B9B9B]">
        {n === 0 ? t.learn.progressNone : t.learn.progressN(n, total)}
      </p>
      <div className="mt-2 h-2 rounded-full bg-[#272727]" role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={total}>
        <div
          className="h-2 rounded-full bg-[#FFB800] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ width: `${(n / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
