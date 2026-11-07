import type { Row } from "../art/boardTypes";
import type { CutawayId } from "../art/cutawayIds";
import type { Timeline } from "../timeline";
import { lesson001 } from "./l001";
import { lesson002 } from "./l002";

export type LessonMeta = {
  id: string;            // "001"
  kicker: string;        // opening card line above the title
  title: string;
  subtitle: string;
  previewNote: string;
  starLabels: string[];  // goal strip on the board (3–5 items)
  lastScene: string;     // scene that shows the end note
  endNote: string;
};
export type LessonData = {
  meta: LessonMeta;
  timeline: Timeline;
  boardPlans: Record<string, Row[]>;
  visualCutaways: Record<string, CutawayId>;
  sceneCutaways: Record<string, CutawayId>;
  lineCutaways: Record<string, CutawayId>;
  starsLit: Record<string, number>;
  newStarChapters: Set<string>;
  starBeats: Set<string>;
};

export const LESSONS: Record<string, LessonData> = { "001": lesson001, "002": lesson002 };

// The lesson being rendered. Set synchronously by the top-level composition component before its children
// render (one composition = one lesson per render process), read by every component through L().
let active: LessonData = lesson001;
export const setLesson = (id: string): LessonData => {
  active = LESSONS[id] ?? lesson001;
  return active;
};
export const L = (): LessonData => active;

// Visual beats whose description says a star lights up (sparkle on the board's star strip).
export const starBeatsOf = (t: Timeline): Set<string> =>
  new Set(t.scenes.flatMap((s) => s.beats)
    .filter((b) => b.type === "visual" && /жылдыз/i.test(b.text) && /жан|жаркыра|жылт/i.test(b.text)).map((b) => b.key));
