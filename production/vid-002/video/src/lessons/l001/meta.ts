import type { LessonMeta } from "../active";

export const meta: LessonMeta = {
  id: "001",
  kicker: "80 САБАК · 1-САБАК",
  title: "Ислам — беш түркүктүү үй",
  subtitle: "Беш түркүк — беш жакшы сапат",
  previewNote: "Көрүү версиясы · preview v1 · устаздын жана тил редакторунун текшерүүсүн күтөт",
  starLabels: ["ЫЙМАН", "НАМАЗ", "ЗЕКЕТ", "ОРОЗО", "АЖЫЛЫК"],
  lastScene: "ch10-s02",
  endNote: "1-сабак · көрүү версиясы (preview v1) · ElevenLabs үн · Remotion 2D · устаздын текшерүүсүнө чейин",
};
// Which pillar star each chapter has lit (filled in from the script, see script/chapters).
// Stars are lit by the script in ch03-s07 (ЫЙМАН), ch04-s06 (НАМАЗ), ch05-s06 (ЗЕКЕТ), ch06-s06 (ОРОЗО), ch07-s07 (АЖЫЛЫК);
// each of those visual beats says «… жылдызы жанат», so the sparkle comes from starBeats and newStarChapters stays empty.
export const starsLit: Record<string, number> = {
  ch00: 0, ch01: 0, ch02: 0, ch03: 1, ch04: 2, ch05: 3, ch06: 4, ch07: 5, ch08: 5, ch09: 5, ch10: 5,
};
export const newStarChapters = new Set<string>();
