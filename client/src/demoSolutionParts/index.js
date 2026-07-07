import { SOLUTIONS_PART1 } from "./part1";
import { SOLUTIONS_PART2 } from "./part2";
import { SOLUTIONS_PART3 } from "./part3";
import { SOLUTIONS_PART4 } from "./part4";

/** @typedef {'python'|'java'|'cpp'|'c'} DemoLang */

const MERGED = {
  ...SOLUTIONS_PART1,
  ...SOLUTIONS_PART2,
  ...SOLUTIONS_PART3,
  ...SOLUTIONS_PART4,
};

/**
 * @param {string} questionTitle
 * @param {DemoLang} language
 * @returns {string|null}
 */
export function getDemoSolution(questionTitle, language) {
  const row = MERGED[questionTitle];
  if (!row) return null;
  const code = row[language];
  return typeof code === "string" ? code : null;
}
