import official from "./uzSignsOfficial.json";
import type { Lang } from "./i18n";

export type UzCategory =
  | "warning"
  | "priority"
  | "prohibitory"
  | "mandatory"
  | "information"
  | "service"
  | "additional";

export const UZ_CATEGORIES: { id: UzCategory; uz: string; color: string }[] = [
  { id: "warning", uz: "Ogohlantiruvchi belgilar", color: "#FF8A3D" },
  { id: "priority", uz: "Imtiyoz belgilari", color: "#FFB800" },
  { id: "prohibitory", uz: "Taqiqlovchi belgilar", color: "#F0555A" },
  { id: "mandatory", uz: "Buyuruvchi belgilar", color: "#4C8DF6" },
  { id: "information", uz: "Axborot-ishora belgilari", color: "#38BDF8" },
  { id: "service", uz: "Servis belgilari", color: "#34D399" },
  { id: "additional", uz: "Qo'shimcha axborot belgilari", color: "#A78BFA" },
];

export type UzSign = {
  id: string;
  /** Official number, for example "3.24". Empty for the one unnumbered plate. */
  num: string;
  category: UzCategory;
  /** File in /public/signs. */
  file: string;
  names: Record<Lang, string>;
};

export const UZ_SIGNS: UzSign[] = official.map((s) => ({
  id: s.id,
  num: s.num,
  category: s.cat as UzCategory,
  file: s.file,
  names: { en: s.en, ru: s.ru, uz: s.uz },
}));
