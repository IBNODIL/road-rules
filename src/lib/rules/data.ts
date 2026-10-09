/* Structure of the rules docs. Source: Uzbekistan Road Traffic Rules,
   Cabinet of Ministers Decree No. 172 of 12 April 2022 (https://lex.uz/acts/-5953883).
   Signs are deliberately not included. Texts live in ./text.en.ts, ./text.ru.ts and ./text.uz.ts. */

export const SOURCE_URL = "https://lex.uz/acts/-5953883";

export type RuleTuple = [title: string, summary: string, question: string, options: [string, string, string]];

export const chapters: { key: string; rules: string[] }[] = [
  { key: "general", rules: ["2", "3", "4", "d-yield", "d-main", "d-stop", "d-vis"] },
  { key: "drivers", rules: ["7", "8", "9", "11", "12", "12p"] },
  { key: "accident", rules: ["13"] },
  { key: "pedestrians", rules: ["15", "16", "17", "18", "19", "20", "21", "22"] },
  { key: "passengers", rules: ["23", "24"] },
  { key: "special", rules: ["25", "26", "27", "28"] },
  { key: "signals", rules: ["31", "31r", "32", "34", "35", "37", "38", "39", "41", "42", "43"] },
  { key: "warning", rules: ["44", "45", "46", "47", "48", "50", "51"] },
  { key: "manoeuvres", rules: ["53", "54", "55", "56", "57", "59", "60", "62", "63"] },
  { key: "position", rules: ["64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "75"] },
  { key: "speed", rules: ["77", "78", "78b", "79", "80", "81"] },
  { key: "overtaking", rules: ["82", "83", "84", "85", "86", "87"] },
  { key: "parking", rules: ["88", "89", "91", "91b", "91c", "91d", "91e", "92", "93", "94", "95"] },
  { key: "junctions", rules: ["96", "97", "98", "99", "100", "101", "102", "103"] },
  { key: "unregulated", rules: ["104", "105", "106", "107", "108"] },
  { key: "crossings", rules: ["109", "110", "111", "112", "113", "114", "115", "1152"] },
  { key: "railway", rules: ["116", "117", "118", "119", "120"] },
  { key: "motorway", rules: ["121", "122"] },
  { key: "residential", rules: ["123", "124", "125", "126"] },
  { key: "slopes", rules: ["128", "129"] },
  { key: "routeveh", rules: ["131", "132", "133"] },
  { key: "lights", rules: ["134", "135", "136", "138", "140"] },
  { key: "towing", rules: ["142", "143", "144", "145"] },
  { key: "learner", rules: ["146", "147", "149", "150"] },
  { key: "carrying", rules: ["157", "158", "159"] },
  { key: "cargo", rules: ["161", "162", "163", "164"] },
  { key: "cyclists", rules: ["165", "166", "167", "168", "169", "pmd122", "pmd123"] },
  { key: "vehicles", rules: ["176"] },
  { key: "markings", rules: ["m1.1", "m1.3", "m1.4", "m1.5", "m1.9", "m1.10", "m1.11", "m1.12", "m1.14", "m-conflict"] },
  { key: "technical", rules: ["t-tyre", "t-kit", "t-glass"] },
];

export const allRuleIds = chapters.flatMap((c) => c.rules);

/** Label shown on the clause badge. */
export function clauseLabel(id: string): string {
  if (id.startsWith("d-")) return "§ 6";
  if (id.startsWith("m")) return id === "m-conflict" ? "Annex 2" : `Annex 2 · ${id.slice(1)}`;
  if (id.startsWith("t-")) return "Annex 3";
  if (id.startsWith("pmd")) return `${id.slice(3)}¹`;
  if (id === "1152") return "115²";
  return id.replace(/[a-z]$/, "");
}

/** Deterministic shuffle of the three options so the right answer is not always first. */
export function permutation(id: string): [number, number, number] {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const order: [number, number, number] = [0, 1, 2];
  for (let i = 2; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = (h >>> 8) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export type RuleQuiz = { options: string[]; answer: number };

export function buildQuiz(id: string, options: [string, string, string]): RuleQuiz {
  const order = permutation(id);
  return { options: order.map((i) => options[i]), answer: order.indexOf(0) };
}

/** URL safe slug for a rule id (dots are replaced). */
export const ruleSlug = (id: string) => id.split(".").join("-");
export const ruleIdFromSlug = (slug: string) => allRuleIds.find((id) => ruleSlug(id) === slug);
export const chapterOf = (id: string) => chapters.find((c) => c.rules.includes(id))!;
