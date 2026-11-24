import React from "react";
import { theme, starsLit, stripFor } from "../theme";
import { StripMark } from "./Board";
import type { LessonMeta } from "../timeline";
import { easeOut } from "../anim";

// Chapter title card shown for 3 s at the start of ch01..ch16 over the dimmed classroom.
export const TitleCard: React.FC<{ chapter: string; title: string; frame: number; frames: number; n?: number }> = ({ chapter, title, frame, frames, n: nIn }) => {
  const inP = easeOut(frame / 14);
  const out = frame > frames - 12 ? (frames - frame) / 12 : 1;
  const n = nIn ?? Number(chapter.slice(2));
  const lit = starsLit[chapter] ?? 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(31, 59, 87, ${0.78 * Math.min(inP, out)})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font }}>
      <div style={{ transform: `translateY(${(1 - inP) * 40}px)`, opacity: Math.min(inP, out), textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 44, letterSpacing: 6, opacity: 0.85 }}>{n}-БӨЛҮМ</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 14, maxWidth: 1500, lineHeight: 1.15 }}>{title}</div>
        <div style={{ marginTop: 36, display: "flex", gap: 22, justifyContent: "center" }}>
          {stripFor(chapter).labels.map((label, i) => (
            <svg key={i} width={56} height={56} viewBox="-30 -30 60 60">
              <StripMark kind={stripFor(chapter).kind} lit={i < lit} label={label} light />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};

export const OpeningCard: React.FC<{ frame: number; frames: number; meta?: LessonMeta }> = ({ frame, frames, meta }) => {
  const p = easeOut(frame / 20);
  const out = frame > frames - 16 ? (frames - frame) / 16 : 1;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font, opacity: Math.min(1, out) }}>
      <div style={{ background: "rgba(31,59,87,0.82)", color: "#fff", borderRadius: 28, padding: "44px 80px", textAlign: "center", transform: `scale(${0.9 + p * 0.1})`, opacity: p }}>
        <div style={{ fontSize: 40, letterSpacing: 4, opacity: 0.85 }}>80 САБАК · {meta ? meta.number : 3}-САБАК</div>
        <div style={{ fontSize: 86, fontWeight: 700, marginTop: 10 }}>{meta ? meta.title : "Биз эмне үчүн жаралдык?"}</div>
        <div style={{ fontSize: 40, marginTop: 18 }}>{meta ? meta.subtitle : "Беш максат — беш жылдыз"}</div>
        <div style={{ fontSize: 26, marginTop: 30, opacity: 0.7 }}>Көрүү версиясы · preview v1 · устаздын текшерүүсүн күтөт</div>
      </div>
    </div>
  );
};
