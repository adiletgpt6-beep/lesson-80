import React from "react";
import { theme, starsLit, STAR_LABELS } from "../theme";
import { boardPlans, type Row, type Col } from "../art/boardPlans";
import { Icon } from "../art/icons";
import { easeOut } from "../anim";

export const BOARD = { x: 600, y: 70, w: 1150, h: 590 }; // outer frame on the 1920×1080 stage
const COLORS: Record<Col, string> = { b: theme.ink, g: theme.inkGreen, r: theme.inkRed, k: theme.inkBlack, y: theme.inkGold };

// The star strip: five goal stars drawn at the top of the board; lit ones are gold.
export const StarStrip: React.FC<{ chapter: string; sparkle: number; frame: number }> = ({ chapter, sparkle, frame }) => {
  const lit = starsLit[chapter] ?? 0;
  return (
    <g transform={`translate(${BOARD.x + 120} ${BOARD.y + 58})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const isLit = i < lit;
        const isNew = isLit && i === lit - 1 && sparkle > 0;
        const s = isNew ? 1 + Math.sin(frame / 3) * 0.12 * sparkle : 1;
        return (
          <g key={i} transform={`translate(${i * 190} 0)`}>
            {isNew ? <circle r={46} fill={theme.star} opacity={0.25 * sparkle} /> : null}
            <path d="M0 -26 L7.6 -8.4 L26 -7 L12 5.6 L16.4 24 L0 14 L-16.4 24 L-12 5.6 L-26 -7 L-7.6 -8.4 Z"
              fill={isLit ? theme.star : "#fff"} stroke={isLit ? "#c98f12" : theme.starOff} strokeWidth={3} transform={`scale(${s})`} />
            <text y={50} textAnchor="middle" fontSize={20} fontWeight={700} fill={isLit ? theme.inkGold : theme.starOff} fontFamily={theme.font}>{STAR_LABELS[i]}</text>
          </g>
        );
      })}
    </g>
  );
};

// Progressive "marker" reveal of one row: tokens appear left to right; text wipes in, icons draw stroke by stroke.
const RowView: React.FC<{ row: Row; p: number; y: number; cx: number }> = ({ row, p, y, cx }) => {
  const widths = row.map((tk) => {
    if ("t" in tk) return tk.t.length * (tk.s ?? 44) * 0.66 + 20;
    if ("i" in tk) return (tk.size ?? 90) + 24;
    if ("a" in tk) return 70;
    return tk.sp;
  });
  const total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  return (
    <g>
      {row.map((tk, i) => {
        const local = Math.max(0, Math.min(1, p * row.length - i)); // token i draws during its slice of p
        const left = x;
        x += widths[i];
        if (local <= 0) return null;
        if ("t" in tk) {
          const size = tk.s ?? 44;
          const w = widths[i] - 20;
          return (
            <g key={i}>
              <clipPath id={`clip-${y}-${i}-${cx}`}><rect x={left - 4} y={y - size * 1.1} width={(w + 40) * local} height={size * 1.6} /></clipPath>
              <text x={left} y={y} fontSize={size} fontWeight={700} fill={COLORS[tk.c ?? "b"]} fontFamily={theme.font} clipPath={`url(#clip-${y}-${i}-${cx})`}
                textDecoration={tk.u ? "underline" : undefined}>{tk.t}</text>
            </g>
          );
        }
        if ("i" in tk) {
          const size = tk.size ?? 90;
          return (
            <g key={i} transform={`translate(${left + 12} ${y - size * 0.82})`}>
              <Icon id={tk.i} size={size} color={COLORS[tk.c ?? "b"]} progress={local} strokeWidth={5.5} />
              {tk.label && local >= 1 ? <text x={size / 2} y={size + 28} textAnchor="middle" fontSize={24} fontWeight={700} fill={theme.inkBlack} fontFamily={theme.font}>{tk.label}</text> : null}
            </g>
          );
        }
        if ("a" in tk) {
          return <text key={i} x={left + 35} y={y} textAnchor="middle" fontSize={44} fontWeight={700} fill={theme.inkBlack} fontFamily={theme.font} opacity={local}>{tk.a}</text>;
        }
        return null;
      })}
    </g>
  );
};

export const BoardContent: React.FC<{ sceneId: string; progress: number }> = ({ sceneId, progress }) => {
  const rows = boardPlans[sceneId] ?? [];
  if (!rows.length) return null;
  const top = BOARD.y + 150, bottom = BOARD.y + BOARD.h - 50;
  const rowH = Math.min(150, (bottom - top) / rows.length);
  const cx = BOARD.x + BOARD.w / 2;
  return (
    <g>
      {rows.map((row, r) => {
        const p = easeOut(Math.max(0, Math.min(1, progress * rows.length - r)));
        const hasIcon = row.some((tk) => "i" in tk);
        const y = top + rowH * r + (hasIcon ? rowH * 0.62 : rowH * 0.6);
        return p > 0 ? <RowView key={r} row={row} p={p} y={y} cx={cx} /> : null;
      })}
    </g>
  );
};

// Board frame, tray, marker; `drawProgress` 0..1 reveals the plan; `wipe` 0..1 fades out the previous content.
export const Board: React.FC<{ sceneId: string; chapter: string; drawProgress: number; sparkle: number; frame: number }> =
  ({ sceneId, chapter, drawProgress, sparkle, frame }) => (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x={BOARD.x - 22} y={BOARD.y - 22} width={BOARD.w + 44} height={BOARD.h + 44} rx={16} fill={theme.boardFrame} />
      <rect x={BOARD.x - 10} y={BOARD.y - 10} width={BOARD.w + 20} height={BOARD.h + 20} rx={10} fill={theme.boardFrameDark} />
      <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={6} fill={theme.board} />
      <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={6} fill="url(#sheen)" opacity={0.5} />
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.6" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <line x1={BOARD.x + 40} y1={BOARD.y + 118} x2={BOARD.x + BOARD.w - 40} y2={BOARD.y + 118} stroke="#e1e4dc" strokeWidth={3} />
      <StarStrip chapter={chapter} sparkle={sparkle} frame={frame} />
      <BoardContent sceneId={sceneId} progress={drawProgress} />
      {/* tray with markers */}
      <rect x={BOARD.x + 80} y={BOARD.y + BOARD.h + 24} width={BOARD.w - 160} height={22} rx={6} fill={theme.boardTray} />
      {[theme.ink, theme.inkGreen, theme.inkRed].map((c, i) => <rect key={i} x={BOARD.x + 140 + i * 70} y={BOARD.y + BOARD.h + 14} width={56} height={14} rx={6} fill={c} />)}
    </svg>
  );
