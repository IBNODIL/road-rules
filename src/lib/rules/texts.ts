import type { RuleTuple } from "./data";
import { textEn } from "./text.en";
import { textRu } from "./text.ru";
import { textUz } from "./text.uz";

export const ruleTexts: Record<"en" | "ru" | "uz", Record<string, RuleTuple>> = { en: textEn, ru: textRu, uz: textUz };
