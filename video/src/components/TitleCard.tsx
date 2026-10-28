import React from "react";
import { theme, starsLit } from "../theme";
import { easeOut } from "../anim";

// Chapter title card shown for 3 s at the start of ch01..ch16 over the dimmed classroom.
export const TitleCard: React.FC<{ chapter: string; title: string; frame: number; frames: number }> = ({ chapter, title, frame, frames }) => {
  const inP = easeOut(frame / 14);
  const out = frame > frames - 12 ? (frames - frame) / 12 : 1;
  const n = Number(chapter.slice(2));
  const lit = starsLit[chapter] ?? 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(31, 59, 87, ${0.78 * Math.min(inP, out)})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font }}>
      <div style={{ transform: `translateY(${(1 - inP) * 40}px)`, opacity: Math.min(inP, out), textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 44, letterSpacing: 6, opacity: 0.85 }}>{n}-БӨЛҮМ</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 14, maxWidth: 1500, lineHeight: 1.15 }}>{title}</div>
        <div style={{ marginTop: 36, display: "flex", gap: 22, justifyContent: "center" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width={56} height={56} viewBox="-30 -30 60 60">
              <path d="M0 -26 L7.6 -8.4 L26 -7 L12 5.6 L16.4 24 L0 14 L-16.4 24 L-12 5.6 L-26 -7 L-7.6 -8.4 Z" fill={i < lit ? theme.star : "rgba(255,255,255,0.15)"} stroke="#fff" strokeWidth={2} />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};

export const OpeningCard: React.FC<{ frame: number; frames: number }> = ({ frame, frames }) => {
  const p = easeOut(frame / 20);
  const out = frame > frames - 16 ? (frames - frame) / 16 : 1;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font, opacity: Math.min(1, out) }}>
      <div style={{ background: "rgba(31,59,87,0.82)", color: "#fff", borderRadius: 28, padding: "44px 80px", textAlign: "center", transform: `scale(${0.9 + p * 0.1})`, opacity: p }}>
        <div style={{ fontSize: 40, letterSpacing: 4, opacity: 0.85 }}>80 САБАК · 3-САБАК</div>
        <div style={{ fontSize: 86, fontWeight: 700, marginTop: 10 }}>Биз эмне үчүн жаралдык?</div>
        <div style={{ fontSize: 40, marginTop: 18 }}>Беш максат — беш жылдыз</div>
        <div style={{ fontSize: 26, marginTop: 30, opacity: 0.7 }}>Көрүү версиясы · preview v1 · устаздын текшерүүсүн күтөт</div>
      </div>
    </div>
  );
};
