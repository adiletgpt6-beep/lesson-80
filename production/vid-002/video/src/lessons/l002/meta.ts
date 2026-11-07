import type { LessonMeta } from "../active";

export const meta: LessonMeta = {
  id: "002",
  kicker: "80 САБАК · 2-САБАК",
  title: "Ак кийимчен мейман: Ислам, Ыйман, Ихсан",
  subtitle: "Үч сөз — үч жылдыз",
  previewNote: "Көрүү версиясы · preview v1 · устаздын жана тил редакторунун текшерүүсүн күтөт",
  starLabels: ["ИСЛАМ", "ЫЙМАН", "ИХСАН"],
  lastScene: "ch12-s02",
  endNote: "2-сабак · көрүү версиясы (preview v1) · ElevenLabs үн · Remotion 2D · устаздын текшерүүсүнө чейин",
};
// Stars are lit by the script in ch03-s04#4 (ИСЛАМ), ch04-s08#7 (ЫЙМАН), ch06-s04#8 (ИХСАН) — the only visual beats
// whose text says «… жылдызы жанат»; the sparkle comes from starBeats, so newStarChapters stays empty.
export const starsLit: Record<string, number> = {
  ch00: 0, ch01: 0, ch02: 0, ch03: 1, ch04: 2, ch05: 2, ch06: 3, ch07: 3, ch08: 3, ch09: 3, ch10: 3, ch11: 3, ch12: 3,
};
export const newStarChapters = new Set<string>();
