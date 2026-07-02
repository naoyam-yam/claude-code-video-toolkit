import { originalSampleQuestions } from "../../data/seed/original-sample-questions";
import { filterPublishable } from "../rights/canPublishQuestion";
import type { Question } from "./schema";

export function getSeedQuestions(): Question[] {
  return originalSampleQuestions;
}

/** What the app is actually allowed to show — always routed through the rights gate. */
export function getPublishableSeedQuestions(): Question[] {
  return filterPublishable(originalSampleQuestions);
}
