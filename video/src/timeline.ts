import data from "./timeline.json";

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

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  plannedFrames: number;
  chapters: Chapter[];
  scenes: Scene[];
};

export const timeline = data as unknown as Timeline;
