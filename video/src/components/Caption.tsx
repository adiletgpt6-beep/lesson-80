import React from "react";
import type { Beat } from "../timeline";
import { theme, SPEAKER_NAME, SPEAKER_COLOR } from "../theme";

const MAX_CHARS = 120; // two lines of ~60 chars at 40 px across 1480 px

// Split a long line into caption chunks at sentence/clause boundaries; each chunk is shown for a share of the
// beat proportional to its length (speech pace is roughly uniform per character).
export const chunks = (text: string): string[] => {
  if (text.length <= MAX_CHARS) return [text];
  const parts = text.split(/(?<=[.!?…:;])\s+|(?<=,)\s+(?=[^,]{30,})/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + " " + p).trim().length > MAX_CHARS && cur) {
      out.push(cur.trim());
      cur = p;
    } else cur = (cur + " " + p).trim();
  }
  if (cur) out.push(cur.trim());
  return out.length ? out : [text];
};

export const Caption: React.FC<{ beat: Beat; frame: number }> = ({ beat, frame }) => {
  const parts = chunks(beat.text);
  const speechFrames = Math.max(1, beat.frames - 18); // trailing LINE_GAP has no speech
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0, shown = parts[parts.length - 1];
  for (const p of parts) {
    const end = ((acc + p.length) / total) * speechFrames;
    if (frame < end) { shown = p; break; }
    acc += p.length;
  }
  const speaker = beat.speaker ?? "ustaz";
  const fade = Math.min(1, frame / 4, (beat.frames - frame) / 4);
  return (
    <div style={{ position: "absolute", left: 180, right: 180, bottom: 34, display: "flex", justifyContent: "center", opacity: Math.max(0, fade) }}>
      <div style={{ background: theme.caption, color: theme.captionText, borderRadius: 18, padding: "16px 34px", fontSize: 40, lineHeight: 1.3,
        fontFamily: theme.font, maxWidth: 1560, textAlign: "center", boxShadow: "0 4px 18px rgba(0,0,0,0.25)" }}>
        <span style={{ color: SPEAKER_COLOR[speaker], fontWeight: 700 }}>{SPEAKER_NAME[speaker]}: </span>
        <span>{shown}</span>
      </div>
    </div>
  );
};
