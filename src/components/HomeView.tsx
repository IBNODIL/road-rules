"use client";

import Link from "next/link";
import { ArrowRight, Cube, CheckCircle, Car, Path, Exam } from "@phosphor-icons/react";
import { RoadScene, SignGallery } from "@/components/three/lazy";
import { Reveal } from "@/components/Reveal";
import { WordReveal } from "@/components/WordReveal";
import { heroScene, lessons, questions } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const icons = [Cube, Path, Exam, Car];

export function HomeView() {
  const { t } = useI18n();
  const h = t.home;
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-32 lg:grid-cols-2 lg:pt-40">
        <div>
          <Reveal>
            <h1 className="hero-title max-w-[680px] text-5xl font-semibold tracking-tight md:text-6xl">
              {h.heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 max-w-[680px] text-lg text-[#9B9B9B]">{h.heroSub}</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/learn/part/lessons" className="btn btn-primary">
                {h.cta}
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <p className="flex items-center gap-2 text-sm text-[#9B9B9B]">
                <CheckCircle size={18} weight="fill" className="text-[#30a46c]" aria-hidden />
                {h.proof(lessons.length, questions.length)}
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={150}>
          <div className="rounded-2xl border border-white/10 bg-[#181818] p-2">
            <RoadScene
              spec={heroScene}
              loop
              autoRotate
              controls={false}
              label={t.scene.heroLabel}
              className="aspect-square w-full rounded-lg md:aspect-[4/3]"
            />
          </div>
        </Reveal>
      </section>

      {/* Tagline reveal */}
      <section aria-label="Tagline" className="bg-black px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <WordReveal key={t.code} text={h.tagline} className="max-w-[680px] text-4xl font-semibold md:text-5xl" />
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-24" aria-labelledby="benefits">
        <Reveal>
          <h2 id="benefits" className="max-w-[680px] text-4xl font-semibold md:text-5xl">
            {h.benefitsTitle}
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {h.benefits.map((b, i) => {
            const Icon = icons[i];
            return (
              <Reveal as="li" key={b.title} delay={i * 80}>
                <div className="card h-full">
                  <Icon size={32} className="text-[#FFB800]" aria-hidden />
                  <h3 className="mt-6 text-2xl font-semibold">{b.title}</h3>
                  <p className="mt-2 text-base text-[#9B9B9B]">{b.body}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* Signs in 3D */}
      <section className="mx-auto max-w-6xl px-4 py-24" aria-labelledby="signs">
        <Reveal>
          <h2 id="signs" className="max-w-[680px] text-4xl font-semibold md:text-5xl">
            {h.signsTitle}
          </h2>
          <p className="mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{h.signsSub}</p>
        </Reveal>
        <Reveal delay={100} className="mt-12">
          <div className="rounded-2xl border border-white/10 bg-[#181818] p-2">
            <div className="rounded-lg bg-[#181818] p-2 md:p-4">
              <SignGallery />
            </div>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-24" aria-labelledby="how">
        <Reveal>
          <h2 id="how" className="max-w-[680px] text-4xl font-semibold md:text-5xl">
            {h.howTitle}
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {h.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80}>
              <div className="card h-full">
                <p className="font-mono text-sm text-[#FFB800]">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-base text-[#9B9B9B]">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-24" aria-labelledby="faq">
        <Reveal>
          <h2 id="faq" className="text-4xl font-semibold md:text-5xl">
            {h.faqTitle}
          </h2>
        </Reveal>
        <div className="mt-12 flex flex-col gap-2">
          {h.faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <details className="group rounded-lg border border-white/10 bg-[#181818] px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {f.q}
                  <span
                    aria-hidden
                    className="text-2xl text-[#FFB800] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-base text-[#9B9B9B]">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-12">
        <Reveal>
          <div className="rounded-2xl border border-white/10 bg-[#181818] px-6 py-16 text-center">
            <h2 className="mx-auto max-w-[680px] text-4xl font-semibold md:text-5xl">{h.finalTitle}</h2>
            <p className="mx-auto mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{h.finalSub}</p>
            <Link href="/learn/part/lessons" className="btn btn-primary mt-8">
              {h.cta}
              <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
