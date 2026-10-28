import data from "./timeline.json";

export type Beat = {
  key: string;
  type: "line" | "pause" | "visual";
  speaker: "ustaz" | "bektur" | "aizada" | "both_children" | null;
  text: string;
  from: number;
  frames: number;
  timing: "audio" | "estimate";
  audio: string | null;
};

export type Scene = {
  id: string;
  chapter: string;
  title: string;
  from: number;
  frames: number;
  board: string[];
  characters: string[];
  beats: Beat[];
};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  plannedFrames: number;
  scenes: Scene[];
};

export const timeline = data as Timeline;
