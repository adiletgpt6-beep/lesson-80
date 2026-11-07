import type { LessonMeta } from "../active";

export const meta: LessonMeta = {
  id: "001",
  kicker: "80 САБАК · 1-САБАК",
  title: "Ислам — беш түркүктүү үй",
  subtitle: "Беш түркүк — беш жакшы сапат",
  previewNote: "Көрүү версиясы · preview v1 · устаздын жана тил редакторунун текшерүүсүн күтөт",
  starLabels: ["ЫЙМАН", "НАМАЗ", "ЗЕКЕТ", "ОРОЗО", "АЖЫЛЫК"],
  lastScene: "",
  endNote: "1-сабак · көрүү версиясы (preview v1) · ElevenLabs үн · Remotion 2D · устаздын текшерүүсүнө чейин",
};
// Which pillar star each chapter has lit (filled in from the script, see script/chapters).
export const starsLit: Record<string, number> = {};
export const newStarChapters = new Set<string>();
