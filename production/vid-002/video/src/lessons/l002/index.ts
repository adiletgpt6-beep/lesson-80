import data from "./timeline.json";
import type { Timeline } from "../../timeline";
import type { LessonData } from "../active";
import { boardPlans } from "./boardPlans";
import { visualCutaways, sceneCutaways, lineCutaways } from "./scenePlan";
import { meta, starsLit, newStarChapters } from "./meta";

const timeline = data as unknown as Timeline;
const starBeats = new Set(timeline.scenes.flatMap((s) => s.beats)
  .filter((b) => b.type === "visual" && /жылдыз/i.test(b.text) && /жан|жаркыра|жылт/i.test(b.text)).map((b) => b.key));

export const lesson002: LessonData = { meta, timeline, boardPlans, visualCutaways, sceneCutaways, lineCutaways, starsLit, newStarChapters, starBeats };
