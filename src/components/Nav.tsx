"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrafficSignal } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { signsPageText } from "@/lib/i18n/signsPage";
import { LangSwitch } from "./LangSwitch";


export function Nav() {
  const path = usePathname();
  const { t, lang } = useI18n();
  const links = [
    { href: "/learn", label: t.nav.lessons },
    { href: "/signs", label: signsPageText[lang].nav },
    { href: "/test", label: t.nav.test },
    { href: "/simulator", label: t.nav.simulator },
    { href: "/progress", label: t.nav.progress },
  ];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <nav
        aria-label="Main"
        className="pointer-events-auto relative z-50 mt-6 flex w-max items-center gap-2 rounded-full border border-white/10 bg-black/60 py-1 pl-4 pr-1 backdrop-blur-xl lg:pr-3"
      >
        <Link href="/" className="flex items-center gap-2 pr-2 text-base font-semibold" onClick={() => setOpen(false)}>
          <TrafficSignal size={22} weight="fill" className="text-[#FFB800]" aria-hidden />
          Roadwise
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current(l.href) ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 ${
                  current(l.href) ? "bg-white/10 text-white" : "text-[#9B9B9B] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <LangSwitch className="hidden lg:flex" />
        <button
          type="button"
          className="relative size-10 rounded-full lg:hidden"
          aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "rotate-45" : "-translate-y-1"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "-rotate-45" : "translate-y-1"
            }`}
          />
        </button>
      </nav>

      <div
        className={`pointer-events-auto fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/80 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            aria-current={current(l.href) ? "page" : undefined}
            style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
            className={`text-4xl font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            } ${current(l.href) ? "text-[#FFB800]" : "text-white"}`}
          >
            {l.label}
          </Link>
        ))}
        <LangSwitch className="mt-4 scale-125" />
      </div>
    </header>
  );
}
