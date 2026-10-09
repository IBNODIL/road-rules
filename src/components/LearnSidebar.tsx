"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CheckCircle, List, MagnifyingGlass, X } from "@phosphor-icons/react";
import { lessons } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { chapters, clauseLabel, ruleSlug } from "@/lib/rules/data";
import { rulesUi } from "@/lib/rules/ui";
import { ruleTexts } from "@/lib/rules/texts";
import { useData } from "@/lib/storage";

function Panel({ onNavigate }: { onNavigate: () => void }) {
  const { t, lang } = useI18n();
  const ui = rulesUi[lang];
  const texts = ruleTexts[lang];
  const data = useData();
  const path = usePathname();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const link = (href: string, active: boolean) =>
    `flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
      active ? "bg-[#272727] font-semibold text-white" : "text-[#9B9B9B] hover:bg-[#1F1F1F] hover:text-white"
    }`;

  const visibleLessons = lessons.filter((l) => !needle || t.lessons[l.slug].title.toLowerCase().includes(needle));
  const visibleChapters = chapters
    .map((c) => ({
      ...c,
      rules: c.rules.filter(
        (id) =>
          !needle ||
          texts[id][0].toLowerCase().includes(needle) ||
          clauseLabel(id).toLowerCase().includes(needle) ||
          ui.chapterNames[c.key].toLowerCase().includes(needle),
      ),
    }))
    .filter((c) => c.rules.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <MagnifyingGlass size={16} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#9B9B9B]" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ui.search}
          aria-label={ui.search}
          className="w-full rounded-lg border border-white/10 bg-[#181818] py-2 pl-8 pr-2 text-sm text-white placeholder:text-[#9B9B9B]"
        />
      </div>

      {visibleLessons.length > 0 && (
        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[#FFB800]">{ui.lessonsHeading}</p>
          <ul className="mt-1">
            {visibleLessons.map((l) => {
              const href = `/learn/${l.slug}`;
              const active = path === href;
              return (
                <li key={l.slug}>
                  <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={link(href, active)}>
                    <span>{t.lessons[l.slug].title}</span>
                    {data.completed.includes(l.slug) && <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-[#30a46c]" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {visibleChapters.length > 0 && (
        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[#FFB800]">{ui.rulesHeading}</p>
          <ul className="mt-1 flex flex-col gap-1">
            {visibleChapters.map((c) => {
              const hasActive = c.rules.some((id) => path === `/learn/rules/${ruleSlug(id)}`);
              const done = c.rules.filter((id) => data.rules[id]).length;
              return (
                <li key={`${c.key}-${hasActive}-${needle ? "s" : ""}`}>
                  <details open={hasActive || !!needle} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-white hover:bg-[#1F1F1F]">
                      <span>{ui.chapterNames[c.key]}</span>
                      <span className="shrink-0 text-xs font-normal text-[#9B9B9B]">
                        {done}/{c.rules.length}
                      </span>
                    </summary>
                    <ul className="ml-2 mt-1 border-l border-white/10 pl-2">
                      {c.rules.map((id) => {
                        const href = `/learn/rules/${ruleSlug(id)}`;
                        const active = path === href;
                        return (
                          <li key={id}>
                            <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={link(href, active)}>
                              <span>
                                <span className="mr-1 font-mono text-xs text-[#FFB800]">{clauseLabel(id).replace("Annex 2 · ", "").replace("Annex ", "A")}</span>
                                {texts[id][0]}
                              </span>
                              {data.rules[id] && <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-[#30a46c]" aria-hidden />}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
          <Link href="/learn/rules/exam" onClick={onNavigate} className={`mt-2 ${link("/learn/rules/exam", path === "/learn/rules/exam")}`}>
            {ui.examTitle}
          </Link>
        </div>
      )}
    </div>
  );
}

export function LearnSidebar() {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* phones: slide down contents */}
      <div className="lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn btn-ghost w-full justify-between">
          <span className="flex items-center gap-2">
            <List size={18} aria-hidden />
            {ui.contents}
          </span>
          {open && <X size={18} aria-hidden />}
        </button>
        {open && (
          <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#181818] p-3">
            <Panel onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>
      <aside aria-label={ui.contents} className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#181818] p-3">
          <Panel onNavigate={() => {}} />
        </div>
      </aside>
    </>
  );
}
