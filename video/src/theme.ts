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
};
// Chapters whose first scene lights a new star (sparkle animation).
export const newStarChapters = new Set(["ch03", "ch06", "ch07", "ch09", "ch13"]);

export const STAR_LABELS = ["ТААНУУ", "СҮЙҮҮ", "ИБАДАТ", "ЖАКШЫЛЫК", "КЫЙЫНЧЫЛЫК"];

export const SPEAKER_NAME: Record<string, string> = {
  ustaz: "Устаз", bektur: "Бектур", aizada: "Айзада", both_children: "Балдар",
};
export const SPEAKER_COLOR: Record<string, string> = {
  ustaz: theme.ustazColor, bektur: theme.bekturColor, aizada: theme.aizadaColor, both_children: theme.childrenColor,
};
