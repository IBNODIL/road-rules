"use client";

import { useEffect, useRef } from "react";
import { Globe } from "@phosphor-icons/react";
import { LANGS, dicts, setLang, useI18n, type Lang } from "@/lib/i18n";

/** Keeps <html lang> in sync and asks first time visitors to pick a language. */
export function LanguageGate() {
  const { lang, t, chosen } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!chosen && !d.open) d.showModal();
    if (chosen && d.open) d.close();
  }, [chosen]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="lang-title"
      onCancel={(e) => {
        e.preventDefault();
        setLang(lang);
      }}
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-2xl border border-white/10 bg-[#181818] p-0 text-white backdrop:bg-black/80 backdrop:backdrop-blur-xl"
    >
      <div className="flex flex-col gap-6 p-6">
        <Globe size={32} className="text-[#FFB800]" aria-hidden />
        <div>
          <h2 id="lang-title" className="text-2xl font-semibold">
            {t.lang.title}
          </h2>
          <p className="mt-2 text-sm text-[#9B9B9B]">{t.lang.sub}</p>
        </div>
        <ul className="flex flex-col gap-2">
          {LANGS.map((l: Lang) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => setLang(l)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-lg font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] ${
                  l === lang ? "border-[#FFB800] bg-[#272727]" : "border-white/10 bg-[#1F1F1F] hover:bg-[#272727]"
                }`}
              >
                {dicts[l].nativeName}
                {l === lang && <span className="text-xs font-normal text-[#9B9B9B]">{t.lang.detected}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
