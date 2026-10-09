"use client";

import { useI18n } from "@/lib/i18n";
import { signsPageText } from "@/lib/i18n/signsPage";
import { UZ_CATEGORIES, UZ_SIGNS } from "@/lib/uzSigns";

export function SignsAbout() {
  const { lang } = useI18n();
  const tx = signsPageText[lang];
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-semibold">{tx.aboutTitle}</h2>
      <p className="mt-4 max-w-[680px] text-base text-[#9B9B9B]">{tx.about(UZ_SIGNS.length, UZ_CATEGORIES.length)}</p>
      <ul className="sr-only">
        {UZ_SIGNS.map((s) => (
          <li key={s.id}>
            {s.num} {s.names[lang]}
          </li>
        ))}
      </ul>
    </div>
  );
}
