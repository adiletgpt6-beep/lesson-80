import data from "./timeline.json";
import dataR04 from "./timeline-R04.json";
import dataR05 from "./timeline-R05.json";

export type BeatType = "line" | "pause" | "visual" | "title";
export type Speaker = "ustaz" | "bektur" | "aizada" | "both_children";

export type Beat = {
  key: string;
  type: BeatType;
  speaker: Speaker | null;
  text: string;
  from: number; // relative to scene start
  frames: number;
  timing: "audio" | "estimate" | "fixed";
  audio: string | null;
  ped?: boolean;
  replaced_from?: string | null;
  n?: number; // title beats of R04/R05: chapter number inside the lesson
};

export type Scene = {
  id: string;
  chapter: string;
  chapterTitle: string;
  title: string;
  setting: string;
  camera: string;
  characters: string[];
  board: string[];
  animation: string[];
  from: number; // absolute
  frames: number;
  beats: Beat[];
};

export type Chapter = { id: string; title: string; from: number; frames: number; planned_seconds: number };

// R04/R05 (new lessons 004/005 split from 003): number/title for the opening card and the end credit.
export type LessonMeta = { id: string; number: number; title: string; subtitle: string; opening_scene: string; final_scene: string };

export type Timeline = {
  lesson?: LessonMeta;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  plannedFrames: number;
  chapters: Chapter[];
  scenes: Scene[];
};

export const timeline = data as unknown as Timeline;
// "003" = the one-hour film (unchanged); "R04"/"R05" = lessons 004/005.
export const timelines: Record<string, Timeline> = {
  "003": timeline,
  R04: dataR04 as unknown as Timeline,
  R05: dataR05 as unknown as Timeline,
};
