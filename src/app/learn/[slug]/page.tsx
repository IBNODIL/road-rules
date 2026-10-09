import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lessonBySlug, lessons } from "@/lib/content";
import { en } from "@/lib/i18n/en";
import { LessonView } from "@/components/LearnViews";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = en.lessons[slug];
  return t ? { title: t.title, description: t.summary } : {};
}

export default async function LessonPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  if (!lessonBySlug(slug)) notFound();
  return <LessonView slug={slug} />;
}
