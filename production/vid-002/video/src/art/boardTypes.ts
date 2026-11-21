import type { IconId } from "./icons";

// Board plan tokens: what the ustaz draws in a scene, as rows of tokens. A real teacher can repeat every element
// with a marker: short words, arrows, simple pictograms. No people with faces; Allah is never depicted; the
// Prophet ﷺ and other prophets/angels are never drawn — only words and symbols.
export type Tok =
  | { t: string; c?: Col; s?: number; u?: boolean }      // text (u = underline)
  | { i: IconId; c?: Col; label?: string; size?: number } // pictogram with optional caption
  | { a: "→" | "↓" | "↔" | "=" | "·" | "+" | "×" }          // connector
  | { sp: number };                                        // horizontal spacer
export type Col = "b" | "g" | "r" | "k" | "y";
export type Row = Tok[];

export const T = (t: string, c?: Col, s?: number): Tok => ({ t, c, s });
export const I = (i: IconId, c?: Col, label?: string, size?: number): Tok => ({ i, c, label, size });
export const A = (a: "→" | "↓" | "↔" | "=" | "·" | "+" | "×" = "→"): Tok => ({ a });
export const SP = (sp: number): Tok => ({ sp });
