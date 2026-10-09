"use client";

import { LANGS, setLang, useI18n } from "@/lib/i18n";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  return (
    <div role="group" aria-label={t.nav.language} className={`flex items-center rounded-full bg-white/5 p-0.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={l === lang}
          className={`rounded-full px-2 py-1 text-xs font-semibold uppercase transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            l === lang ? "bg-[#FFB800] text-black" : "text-[#9B9B9B] hover:text-white"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
