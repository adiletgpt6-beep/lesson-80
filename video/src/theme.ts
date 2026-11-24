// Unified 2D style for the 80-lesson course. Warm classroom, marker colours on a white board, no gradients that
// are expensive to render. Allah and the prophets are never depicted (see CLAUDE.md).
export const theme = {
  wall: "#f6efe1",
  wallDark: "#e8dcc6",
  floor: "#cfae84",
  floorLine: "#b8966c",
  board: "#fcfcf8",
  boardFrame: "#8a6240",
  boardFrameDark: "#6b4a2e",
  boardTray: "#a57a52",
  ink: "#1f3b57", // blue marker
  inkGreen: "#2a7f5a",
  inkRed: "#c8443a",
  inkGold: "#d9a21b",
  inkBlack: "#2b2b2b",
  star: "#f2b32a",
  starOff: "#d7d9d4",
  caption: "rgba(16, 28, 36, 0.86)",
  captionText: "#ffffff",
  ustazColor: "#f2c879",
  bekturColor: "#8fd3ff",
  aizadaColor: "#ffb3d1",
  childrenColor: "#c9f0a4",
  font: "'Noto Sans', 'DejaVu Sans', sans-serif",
};

// Which goal star each chapter lights (1-based; 0 = none). Mirrors script/chapters.ky.md.
export const starsLit: Record<string, number> = {
  ch00: 0, ch01: 0, ch02: 0, ch03: 1, ch04: 1, ch05: 1, ch06: 2, ch07: 3, ch08: 3,
  ch09: 4, ch10: 4, ch11: 4, ch12: 4, ch13: 5, ch14: 5, ch15: 5, ch16: 5,
  e04: 2, // lesson 004 closing chapter (two stars lit)
  o05: 2, // lesson 005 opening chapter (recap of the two stars of lesson 004)
  // lesson 006: the six pillars of iman (a01 = 1st pillar … a06 = 6th)
  a00: 0, a01: 1, a02: 2, a03: 3, a04: 4, a05: 5, a06: 6, a07: 6,
  // lesson 007: the eleven steps (b03 covers steps 3–4)
  // lesson 008: four sides of tawhid/Ikhlas; lesson 009: four keys of surah al-Asr
  c00: 0, c01: 0, c02: 1, c03: 1, c04: 2, c05: 3, c06: 3, c07: 3, c08: 4, c09: 4, c10: 4, c11: 4, c12: 4,
  d00: 0, d01: 0, d02: 0, d03: 1, d04: 2, d05: 3, d06: 4, d07: 4, d08: 4, d09: 4, d10: 4, d11: 4, d12: 4, d13: 4, d14: 4, d15: 4,
  b00: 0, b01: 1, b02: 2, b03: 4, b04: 5, b05: 6, b06: 7, b07: 8, b08: 9, b09: 10, b10: 11, b11: 11, b12: 11, b13: 11,
};
// Chapters whose first scene lights a new star (sparkle animation).
export const newStarChapters = new Set(["ch03", "ch06", "ch07", "ch09", "ch13", "a01", "a02", "a03", "a04", "a05", "a06",
  "b01", "b02", "b03", "b04", "b05", "b06", "b07", "b08", "b09", "b10",
  "c02", "c04", "c05", "c08", "d03", "d04", "d05", "d06"]);

export const STAR_LABELS = ["ТААНУУ", "СҮЙҮҮ", "ИБАДАТ", "ЖАКШЫЛЫК", "КЫЙЫНЧЫЛЫК"];

// The strip at the top of the board: lessons 003–005 — five goal stars; 006 — six pillars of iman; 007 — eleven steps.
export type Strip = { kind: "star" | "pillar" | "step" | "key"; labels: string[] };
export const stripFor = (chapter: string): Strip => {
  if (/^a\d\d$/.test(chapter)) return { kind: "pillar", labels: ["АЛЛАХ", "ПЕРИШТЕ", "КИТЕП", "ПАЙГАМБАР", "ТАГДЫР", "АКЫРЕТ"] };
  if (/^c\d\d$/.test(chapter)) return { kind: "star", labels: ["ЖАРАТУУЧУ", "ИБАДАТ", "ЫСЫМДАР", "ЫКЛАС"] };
  if (/^d\d\d$/.test(chapter)) return { kind: "key", labels: ["ЫЙМАН", "АМАЛ", "АКЫЙКАТ", "САБЫР"] };
  if (/^b\d\d$/.test(chapter)) return { kind: "step", labels: Array.from({ length: 11 }, (_, i) => String(i + 1)) };
  return { kind: "star", labels: STAR_LABELS };
};

export const SPEAKER_NAME: Record<string, string> = {
  ustaz: "Устаз", bektur: "Бектур", aizada: "Айзада", both_children: "Балдар",
};
export const SPEAKER_COLOR: Record<string, string> = {
  ustaz: theme.ustazColor, bektur: theme.bekturColor, aizada: theme.aizadaColor, both_children: theme.childrenColor,
};
