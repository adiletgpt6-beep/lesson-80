import React from "react";

/**
 * LESSON-80 — the ONE opening cover for all 80 lessons (OPENING_COVER_RULES.md on main).
 *
 * Rules: first frame of every MP4, exactly 3.00 s (90 frames @ 30 fps), then a smooth transition to the lesson.
 * Only the ordinal out of 80 («80 САБАКТЫН 4-САБАГЫ») and the real Kyrgyz topic. No project name. Only `number`, `title` and the
 * optional `subtitle` change between lessons — layout, colours, fonts and sizes are fixed here.
 *
 * Project-independent on purpose: imports only React, draws on a 1920×1080 stage (scaled for any frame size,
 * e.g. the 1280×720 YouTube thumbnail), needs the 'Noto Sans' 400/700 webfont the lesson projects already load.
 * The caller passes `opacity` (1 during the 90 cover frames, then fading for the transition).
 *
 * Usage (Remotion):
 *   <LessonCover number={4} title="Биз эмне үчүн жаралдык?" subtitle="1-бөлүк · Аллахты таануу жана сүйүү" />
 */
export const COVER_FRAMES = 90; // exactly 3 s at 30 fps
export const COVER_FADE_FRAMES = 15; // transition into the lesson AFTER the 3 s cover

export const COVER = {
  bg: "#16324a",
  bgInner: "#1f4566",
  gold: "#f2b32a",
  goldSoft: "rgba(242, 179, 42, 0.35)",
  text: "#ffffff",
  textSoft: "rgba(255, 255, 255, 0.86)",
  font: "'Noto Sans', 'DejaVu Sans', sans-serif",
};

// Eight-point star (two overlapping squares) — a neutral Islamic geometric ornament, no figures.
const Star8: React.FC<{ x: number; y: number; r: number; color: string; sw?: number }> = ({ x, y, r, color, sw = 3 }) => (
  <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth={sw}>
    <rect x={-r} y={-r} width={2 * r} height={2 * r} />
    <rect x={-r} y={-r} width={2 * r} height={2 * r} transform="rotate(45)" />
    <circle r={r * 0.42} />
  </g>
);

/** «80 САБАКТЫН 4-САБАГЫ» — "the 4th lesson of 80" (OPENING_COVER_RULES.md). */
export const coverNumberText = (n: number) => `80 САБАКТЫН ${n}-САБАГЫ`;

export type LessonCoverProps = {
  number: number; // lesson number in the course (1…80)
  title: string; // the real topic in Kyrgyz
  subtitle?: string; // optional second line of the topic (e.g. part of a two-part theme)
  opacity?: number;
  width?: number; // frame size of the composition (default 1920×1080)
  height?: number;
};

export const LessonCover: React.FC<LessonCoverProps> = ({ number, title, subtitle, opacity = 1, width = 1920, height = 1080 }) => {
  const k = Math.min(width / 1920, height / 1080);
  const titleSize = title.length > 34 ? 96 : 116;
  return (
    <div style={{ position: "absolute", inset: 0, opacity, overflow: "hidden", background: COVER.bg }}>
      <div style={{ position: "absolute", left: (width - 1920 * k) / 2, top: (height - 1080 * k) / 2, width: 1920, height: 1080,
        transform: `scale(${k})`, transformOrigin: "0 0", fontFamily: COVER.font }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="lc-glow" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor={COVER.bgInner} />
              <stop offset="100%" stopColor={COVER.bg} />
            </radialGradient>
          </defs>
          <rect width={1920} height={1080} fill="url(#lc-glow)" />
          <rect x={56} y={56} width={1808} height={968} rx={28} fill="none" stroke={COVER.gold} strokeWidth={5} />
          <rect x={80} y={80} width={1760} height={920} rx={20} fill="none" stroke={COVER.goldSoft} strokeWidth={2} />
          {[[150, 150], [1770, 150], [150, 930], [1770, 930]].map(([x, y], i) => <Star8 key={i} x={x} y={y} r={30} color={COVER.gold} />)}
          <line x1={660} y1={430} x2={900} y2={430} stroke={COVER.gold} strokeWidth={4} />
          <Star8 x={960} y={430} r={22} color={COVER.gold} sw={4} />
          <line x1={1020} y1={430} x2={1260} y2={430} stroke={COVER.gold} strokeWidth={4} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", color: COVER.gold,
          fontSize: 100, fontWeight: 700, letterSpacing: 4 }}>{coverNumberText(number)}</div>
        <div style={{ position: "absolute", left: 170, right: 170, top: 500, textAlign: "center", color: COVER.text,
          fontSize: titleSize, fontWeight: 700, lineHeight: 1.12 }}>{title}</div>
        {subtitle ? (
          <div style={{ position: "absolute", left: 170, right: 170, top: 500 + titleSize * 1.12 * (title.length > 34 ? 2 : 1) + 46,
            textAlign: "center", color: COVER.textSoft, fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
};
