export const theme = {
  wall: "#f4efe3",
  floor: "#d9c9a8",
  board: "#fbfbf7",
  boardFrame: "#7a5a3a",
  ink: "#23412f",
  accent: "#2f7d5b",
  star: "#e8b931",
  starOff: "#cfd6cf",
  caption: "rgba(20, 32, 26, 0.82)",
  font: "'Golos Text', 'Noto Sans', sans-serif",
};

// Which goal star each chapter lights (1-based; 0 = none). Mirrors script/chapters.ky.md.
export const starsLit: Record<string, number> = {
  ch00: 0, ch01: 0, ch02: 0, ch03: 1, ch04: 1, ch05: 1, ch06: 2, ch07: 3, ch08: 3,
  ch09: 4, ch10: 4, ch11: 4, ch12: 4, ch13: 5, ch14: 5, ch15: 5, ch16: 5,
};
