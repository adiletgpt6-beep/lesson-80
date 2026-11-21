// LESSON-80 — the ONE opening cover for all 80 lessons (OPENING_COVER_RULES.md on main).
// Canonical copy: shared/lesson-cover/LessonCover.tsx. Remotion projects keep a byte-identical copy
// (verify with `python3 shared/lesson-cover/check_copies.py`); change the design ONLY here, via its own branch/PR.
// Shows «80 САБАКТЫН N-САБАГЫ» (lesson N of 80) and the lesson's verified Kyrgyz topic. Only `number` and `topic` vary. No project name. Depends on react + remotion only.
// Designed on a 1920×1080 canvas and scaled to the composition size (1280×720 thumbnails use the same layout).
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

export const COVER_FRAMES = 90; // exactly 3.00 s at 30 fps, from frame 0
export const COVER_FADE_FRAMES = 15; // cross-fade into the lesson after the 3 s
export const TOTAL_LESSONS = 80;
export const coverOrdinal = (n: number) => `${TOTAL_LESSONS} САБАКТЫН ${n}-САБАГЫ`;

const C = { bg: "#1f4d3b", bg2: "#173b2d", gold: "#e8b443", white: "#ffffff", line: "rgba(232,180,67,0.22)" };

// 8-point star tile (girih-style), drawn as a faint repeating pattern — no figures, no text.
const Pattern: React.FC = () => (
  <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="lc-star" width="160" height="160" patternUnits="userSpaceOnUse">
        <g transform="translate(80 80)" fill="none" stroke={C.line} strokeWidth="2">
          <rect x="-34" y="-34" width="68" height="68" />
          <rect x="-34" y="-34" width="68" height="68" transform="rotate(45)" />
          <circle r="12" />
        </g>
      </pattern>
      <radialGradient id="lc-glow" cx="50%" cy="46%" r="65%">
        <stop offset="0%" stopColor={C.bg} />
        <stop offset="100%" stopColor={C.bg2} />
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#lc-glow)" />
    <rect width="1920" height="1080" fill="url(#lc-star)" />
    <rect x="60" y="60" width="1800" height="960" rx="36" fill="none" stroke={C.gold} strokeWidth="6" opacity="0.85" />
  </svg>
);

export type LessonCoverProps = {
  number: number; // course number 1..80 → «80 САБАКТЫН 1-САБАГЫ»
  topic: string; // the lesson's verified Kyrgyz topic
  fontFamily?: string; // the project's loaded Cyrillic face (bold 700 needed)
};

export const LessonCover: React.FC<LessonCoverProps> = ({ number, topic, fontFamily = "'Noto Sans', 'Rubik', sans-serif" }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width / 1920, height / 1080);
  // Long topics shrink in steps so they stay ≤ 3 lines inside the frame.
  const len = topic.length;
  const size = len <= 22 ? 150 : len <= 34 ? 128 : len <= 48 ? 110 : 92;
  return (
    <AbsoluteFill style={{ background: C.bg2, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        <Pattern />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, padding: "0 170px", fontFamily, textAlign: "center" }}>
          <div style={{ background: C.gold, color: C.bg2, fontWeight: 700, fontSize: 72, letterSpacing: 4, padding: "16px 60px", borderRadius: 999, lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {coverOrdinal(number)}
          </div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: size, lineHeight: 1.12, textWrap: "balance" as React.CSSProperties["textWrap"], textShadow: "0 6px 24px rgba(0,0,0,0.35)" }}>
            {topic}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
