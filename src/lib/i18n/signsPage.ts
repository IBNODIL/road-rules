import type { UzCategory } from "../uzSigns";
import type { Lang } from "./index";

export type SignsPageText = {
  nav: string;
  sectionLabel: string;
  categoriesLabel: string;
  categories: Record<UzCategory, { name: string; sub?: string }>;
  prev: string;
  next: string;
  hint: string;
  announce: (i: number, n: number, name: string, meaning: string) => string;
  aboutTitle: string;
  about: (signs: number, groups: number) => string;
};

const en: SignsPageText = {
  nav: "Signs",
  sectionLabel: "Uzbekistan road signs",
  categoriesLabel: "Sign categories",
  categories: {
    warning: { name: "Warning", sub: "Ogohlantiruvchi belgilar" },
    priority: { name: "Priority", sub: "Imtiyoz belgilari" },
    prohibitory: { name: "Prohibitory", sub: "Taqiqlovchi belgilar" },
    mandatory: { name: "Mandatory", sub: "Buyuruvchi belgilar" },
    information: { name: "Information", sub: "Axborot-ishora belgilari" },
    service: { name: "Service", sub: "Servis belgilari" },
    additional: { name: "Plates", sub: "Qo'shimcha axborot belgilari" },
  },
  prev: "Previous sign",
  next: "Next sign",
  hint: "Scroll to drive · or use ← →",
  announce: (i, n, name, meaning) => `Sign ${i} of ${n}: ${name}. ${meaning}`,
  aboutTitle: "About this set",
  about: (s, g) =>
    `${s} signs in ${g} groups, with the official numbers. The images and names come from the UZAVTOYO'LBELGI road sign catalogue (uzavtoyolbelgi.uz). Short explanations are added for the most common signs. Check the national road rules for the exact wording.`,
};

const ru: SignsPageText = {
  nav: "Знаки",
  sectionLabel: "Дорожные знаки Узбекистана",
  categoriesLabel: "Группы знаков",
  categories: {
    warning: { name: "Предупреждающие" },
    priority: { name: "Приоритета" },
    prohibitory: { name: "Запрещающие" },
    mandatory: { name: "Предписывающие" },
    information: { name: "Информационные" },
    service: { name: "Сервиса" },
    additional: { name: "Таблички" },
  },
  prev: "Предыдущий знак",
  next: "Следующий знак",
  hint: "Прокручивайте, чтобы ехать · или клавиши ← →",
  announce: (i, n, name, meaning) => `Знак ${i} из ${n}: ${name}. ${meaning}`,
  aboutTitle: "Об этом наборе",
  about: (s, g) =>
    `${s} знаков в ${g} группах с официальными номерами. Изображения и названия взяты из каталога дорожных знаков UZAVTOYO'LBELGI (uzavtoyolbelgi.uz). Для самых частых знаков добавлены краткие пояснения. Точные формулировки смотрите в правилах дорожного движения.`,
};

const uz: SignsPageText = {
  nav: "Belgilar",
  sectionLabel: "O'zbekiston yo'l belgilari",
  categoriesLabel: "Belgilar guruhlari",
  categories: {
    warning: { name: "Ogohlantiruvchi" },
    priority: { name: "Imtiyozli" },
    prohibitory: { name: "Taqiqlovchi" },
    mandatory: { name: "Buyuruvchi" },
    information: { name: "Axborot-ishora" },
    service: { name: "Servis" },
    additional: { name: "Qo'shimcha" },
  },
  prev: "Oldingi belgi",
  next: "Keyingi belgi",
  hint: "Haydash uchun aylantiring · yoki ← → tugmalari",
  announce: (i, n, name, meaning) => `${n} tadan ${i}-belgi: ${name}. ${meaning}`,
  aboutTitle: "Ushbu to'plam haqida",
  about: (s, g) =>
    `${s} ta belgi ${g} guruhda, rasmiy raqamlari bilan. Rasmlar va nomlar UZAVTOYO'LBELGI yo'l belgilari katalogidan (uzavtoyolbelgi.uz) olingan. Eng ko'p uchraydigan belgilarga qisqa izohlar qo'shilgan. Aniq ta'rif uchun yo'l harakati qoidalariga qarang.`,
};

export const signsPageText: Record<Lang, SignsPageText> = { en, ru, uz };
