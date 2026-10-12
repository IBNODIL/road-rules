import type { Dict, QuestionText } from "./i18n/en";
import type { Lang } from "./i18n";
import { questionById, questionText } from "./content";
import { allRuleIds, buildQuiz } from "./rules/data";
import { ruleScenes } from "./rules/scenes";
import { textEn } from "./rules/text.en";
import { ruleTexts } from "./rules/texts";
import type { Question, SceneSpec } from "./types";

/* One test question for every rule of the course. Questions that have an animated scene play it after the answer. */
export const RULE_PREFIX = "rule-";

/** The lesson scene without its captions, which would give the answer away. */
const bare = (s: SceneSpec): SceneSpec => ({
  ...s,
  props: s.props?.filter((p) => p.kind !== "label" && p.kind !== "dim").map((p) => ({ ...p, text: undefined })),
});

export const ruleQuestions: Question[] = allRuleIds.map((id) => ({
  id: RULE_PREFIX + id,
  lesson: "",
  rule: id,
  scene: bare(ruleScenes[id]),
  answer: buildQuiz(id, textEn[id][3]).answer,
}));

const byId = new Map(ruleQuestions.map((q) => [q.id, q]));

export const findQuestion = (id: string): Question | undefined => (id.startsWith(RULE_PREFIX) ? byId.get(id) : questionById(id));

export function findQuestionText(q: Question, d: Dict, lang: Lang): QuestionText {
  if (q.rule) {
    const t = ruleTexts[lang][q.rule];
    return { text: t[2], options: buildQuiz(q.rule, t[3]).options, explanation: t[1] };
  }
  return questionText(q, d);
}
