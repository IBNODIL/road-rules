"use client";

import { useI18n } from "@/lib/i18n";

export function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useI18n();
  const d = t[kind];
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32">
      <h1 className="text-5xl font-semibold">{d.title}</h1>
      <div className="mt-8 flex max-w-[680px] flex-col gap-4 text-base text-[#9B9B9B]">
        {d.paras.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
