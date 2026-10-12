"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CheckCircle, List, MagnifyingGlass, X } from "@phosphor-icons/react";
import { lessons } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { chapters, isRead, partHref, partKeys, partNumber, ruleNumber, ruleSlug, testHref } from "@/lib/rules/data";
import { ruleTexts } from "@/lib/rules/texts";
import { rulesUi } from "@/lib/rules/ui";
import { useActiveSection } from "@/lib/scrollspy";
import { useData } from "@/lib/storage";

type Item = { id: string; num: string; label: string; done: boolean };

function Panel({ onNavigate }: { onNavigate: () => void }) {
  const { t, lang } = useI18n();
  const ui = rulesUi[lang];
  const texts = ruleTexts[lang];
  const data = useData();
  const path = usePathname();
  const spy = useActiveSection();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const parts = partKeys.map((key) => {
    const items: Item[] =
      key === "lessons"
        ? lessons.map((l, i) => ({ id: `lesson-${l.slug}`, num: `1.${i + 1}`, label: t.lessons[l.slug].title, done: data.completed.includes(l.slug) || data.read.includes(`lesson:${l.slug}`) }))
        : chapters
            .find((c) => c.key === key)!
            .rules.map((id) => ({ id: `rule-${ruleSlug(id)}`, num: ruleNumber(id), label: texts[id][0], done: isRead(data.read, data.rules, id) }));
    return { key, name: ui.chapterNames[key], items };
  });

  const visible = parts
    .map((p) => ({
      ...p,
      shown: !needle || p.name.toLowerCase().includes(needle) ? p.items : p.items.filter((i) => i.label.toLowerCase().includes(needle)),
    }))
    .filter((p) => p.shown.length > 0);

  const row = (active: boolean) =>
    `flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
      active ? "bg-[#272727] font-semibold text-white" : "text-[#9B9B9B] hover:bg-[#1F1F1F] hover:text-white"
    }`;

  return (
    <div className="flex flex-col gap-3">
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

      <ul className="flex flex-col gap-1">
        {visible.map((p) => {
          const href = partHref(p.key);
          const here = path === href || path === testHref(p.key);
          const done = p.items.filter((i) => i.done).length;
          return (
            <li key={`${p.key}-${here}-${needle ? "s" : ""}`}>
              <details open={here || !!needle}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-white hover:bg-[#1F1F1F]">
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-[#FFB800]">{partNumber(p.key)}</span>
                    {p.name}
                  </span>
                  <span className="shrink-0 text-xs font-normal text-[#9B9B9B]">
                    {done}/{p.items.length}
                  </span>
                </summary>
                <ul className="ml-3 mt-1 flex flex-col gap-0.5 pl-2">
                  {p.shown.map((i) => {
                    const active = here && spy === i.id;
                    return (
                      <li key={i.id}>
                        <Link href={`${href}#${i.id}`} onClick={onNavigate} aria-current={active ? "location" : undefined} className={row(active)}>
                          <span className="w-8 shrink-0 font-mono text-xs text-[#FFB800]">{i.num}</span>
                          <span className="grow">{i.label}</span>
                          {i.done && <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-[#30a46c]" aria-hidden />}
                        </Link>
                      </li>
                    );
                  })}
                  {/* the chapter test always closes the list */}
                  <li>
                    <Link href={testHref(p.key)} onClick={onNavigate} aria-current={path === testHref(p.key) ? "page" : undefined} className={row(path === testHref(p.key))}>
                      <span className="w-8 shrink-0 font-mono text-xs text-[#FFB800]">?</span>
                      <span className="grow font-semibold">{ui.testLabel}</span>
                      {data.partTests[p.key] && <span className="shrink-0 text-xs text-[#30a46c]">{data.partTests[p.key].score}/{data.partTests[p.key].total}</span>}
                    </Link>
                  </li>
                </ul>
              </details>
            </li>
          );
        })}
      </ul>

      <Link href="/learn/rules/exam" onClick={onNavigate} className={row(path === "/learn/rules/exam")}>
        {ui.examTitle}
      </Link>
    </div>
  );
}

export function LearnSidebar() {
  const { lang } = useI18n();
  const ui = rulesUi[lang];
  const [open, setOpen] = useState(false);

  return (
    <>
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
