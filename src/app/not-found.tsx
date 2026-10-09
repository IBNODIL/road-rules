"use client";

import Link from "next/link";
import { Signpost } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 pb-24 pt-40">
      <Signpost size={48} className="text-[#FFB800]" aria-hidden />
      <h1 className="text-5xl font-semibold">{t.notFound.title}</h1>
      <p className="max-w-[680px] text-lg text-[#9B9B9B]">{t.notFound.body}</p>
      <Link href="/learn" className="btn btn-primary">{t.notFound.cta}</Link>
    </div>
  );
}
