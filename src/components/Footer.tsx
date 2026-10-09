"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { signsPageText } from "@/lib/i18n/signsPage";

export function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-base font-semibold">Roadwise</p>
          <p className="mt-2 text-sm text-[#9B9B9B]">
            {t.footer.blurb}
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-[#9B9B9B]">
          <Link className="hover:text-white" href="/learn">{t.nav.lessons}</Link>
          <Link className="hover:text-white" href="/privacy">{t.footer.privacy}</Link>
          <Link className="hover:text-white" href="/test">{t.nav.test}</Link>
          <Link className="hover:text-white" href="/terms">{t.footer.terms}</Link>
          <Link className="hover:text-white" href="/simulator">{t.nav.simulator}</Link>
          <Link className="hover:text-white" href="/progress">{t.nav.progress}</Link>
          <Link className="hover:text-white" href="/signs">{signsPageText[lang].nav}</Link>
        </nav>
      </div>
    </footer>
  );
}
