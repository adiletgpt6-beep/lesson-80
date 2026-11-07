import React from "react";
import { theme } from "../theme";
import type { Row, Col, Tok } from "../art/boardTypes";
import { L as curLesson } from "../lessons/active";
import { Icon } from "../art/icons";
import { easeOut } from "../anim";
import { GLYPH_W } from "../art/glyphWidths";

export const BOARD = { x: 600, y: 70, w: 1150, h: 590 }; // outer frame on the 1920×1080 stage
const COLORS: Record<Col, string> = { b: theme.ink, g: theme.inkGreen, r: theme.inkRed, k: theme.inkBlack, y: theme.inkGold };

// The star strip: five goal stars drawn at the top of the board; lit ones are gold.
export const StarStrip: React.FC<{ chapter: string; sparkle: number; frame: number }> = ({ chapter, sparkle, frame }) => {
  const { starsLit, meta } = curLesson();
  const labels = meta.starLabels;
  const lit = starsLit[chapter] ?? 0;
  const step = labels.length >= 5 ? 190 : 760 / Math.max(1, labels.length - 1);
  return (
    <g transform={`translate(${BOARD.x + 120} ${BOARD.y + 58})`}>
      {labels.map((_, i) => {
        const isLit = i < lit;
        const isNew = isLit && i === lit - 1 && sparkle > 0;
        const s = isNew ? 1 + Math.sin(frame / 3) * 0.12 * sparkle : 1;
        return (
          <g key={i} transform={`translate(${i * step} 0)`}>
            {isNew ? <circle r={46} fill={theme.star} opacity={0.25 * sparkle} /> : null}
            <path d="M0 -26 L7.6 -8.4 L26 -7 L12 5.6 L16.4 24 L0 14 L-16.4 24 L-12 5.6 L-26 -7 L-7.6 -8.4 Z"
              fill={isLit ? theme.star : "#fff"} stroke={isLit ? "#c98f12" : theme.starOff} strokeWidth={3} transform={`scale(${s})`} />
            <text y={50} textAnchor="middle" fontSize={20} fontWeight={700} fill={isLit ? theme.inkGold : theme.starOff} fontFamily={theme.font}>{labels[i]}</text>
          </g>
        );
      })}
    </g>
  );
};

// Text width from the real Noto Sans Bold advance widths (+4% safety); arrows/symbols come from a fallback font.
const textW = (t: string, size: number) => {
  let w = 0;
  for (const ch of t) w += GLYPH_W[ch] ?? (/[←→↓↔✓✦]/.test(ch) ? 1.0 : 0.62);
  return w * size * 1.04;
};
const LABEL = 26;
const tokW = (tk: Tok) => {
  if ("t" in tk) return textW(tk.t, tk.s ?? 44) + 24;
  if ("i" in tk) return Math.max(tk.size ?? 100, tk.label ? textW(tk.label, LABEL) : 0) + 30;
  if ("a" in tk) return 70;
  return tk.sp;
};
const rowH = (row: Row) => Math.max(...row.map((tk) => ("t" in tk ? (tk.s ?? 44) * 1.35 : "i" in tk ? (tk.size ?? 100) + (tk.label ? 44 : 10) : 50)));

export type Head = { x: number; y: number } | null;

// Progressive "marker" reveal of one row (drawn around y=0, centred on x=0): tokens appear left to right; text
// wipes in, icons draw stroke by stroke. Reports where the marker tip is (for the drawing hand).
const RowView: React.FC<{ row: Row; p: number; h: number; id: string; onHead: (h: Head) => void }> = ({ row, p, h, id, onHead }) => {
  const widths = row.map(tokW);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = -total / 2;
  return (
    <g>
      {row.map((tk, i) => {
        const local = Math.max(0, Math.min(1, p * row.length - i)); // token i draws during its slice of p
        const left = x;
        x += widths[i];
        if (local <= 0) return null;
        if ("t" in tk) {
          const size = tk.s ?? 44;
          const w = widths[i] - 24;
          const base = size * 0.36;
          if (local < 1) onHead({ x: left + w * local, y: base - size * 0.2 });
          return (
            <g key={i}>
              <clipPath id={`clip-${id}-${i}`}><rect x={left - 6} y={base - size * 1.2} width={(w + 30) * local} height={size * 1.7} /></clipPath>
              <text x={left} y={base} fontSize={size} fontWeight={700} fill={COLORS[tk.c ?? "b"]} fontFamily={theme.font} clipPath={`url(#clip-${id}-${i})`}
                textDecoration={tk.u ? "underline" : undefined}>{tk.t}</text>
            </g>
          );
        }
        if ("i" in tk) {
          const size = tk.size ?? 100;
          const cx = left + widths[i] / 2;
          const top = -h / 2 + 4;
          if (local < 1) onHead({ x: cx - size / 2 + size * (0.2 + 0.6 * local), y: top + size * (0.3 + 0.4 * Math.abs(Math.sin(local * 9))) });
          return (
            <g key={i}>
              <g transform={`translate(${cx - size / 2} ${top})`}>
                <Icon id={tk.i} size={size} color={COLORS[tk.c ?? "b"]} progress={local} strokeWidth={5.5} />
              </g>
              {tk.label && local >= 1 ? <text x={cx} y={top + size + 32} textAnchor="middle" fontSize={LABEL} fontWeight={700} fill={theme.inkBlack} fontFamily={theme.font}>{tk.label}</text> : null}
            </g>
          );
        }
        if ("a" in tk) {
          return <text key={i} x={left + 35} y={16} textAnchor="middle" fontSize={48} fontWeight={700} fill={theme.inkBlack} fontFamily={theme.font} opacity={local}>{tk.a}</text>;
        }
        return null;
      })}
    </g>
  );
};

// Layout of a board plan: one uniform scale for all rows so the drawing fills the board (bigger pictures for
// children) but never overflows it. Exported for the layout test.
export const boardLayout = (rows: Row[]) => {
  const areaW = BOARD.w - 140, top = BOARD.y + 135, areaH = 572 - top; // bottom stays above the children's heads (y≈580)
  const gaps = 26 * Math.max(0, rows.length - 1);
  const natW = Math.max(1, ...rows.map((r) => r.map(tokW).reduce((a, b) => a + b, 0)));
  const hs = rows.map(rowH);
  const natH = hs.reduce((a, b) => a + b, 0);
  const scale = Math.min(1.7, areaW / natW, (areaH - gaps) / Math.max(1, natH));
  const used = natH * scale + gaps;
  let y = top + (areaH - used) / 2;
  const ys = hs.map((h) => { const c = y + (h * scale) / 2; y += h * scale + 26; return c; });
  return { scale, ys, hs, natW, cx: BOARD.x + BOARD.w / 2, areaW, areaH };
};

export const BoardContent: React.FC<{ sceneId: string; progress: number; onHead?: (h: Head) => void }> = ({ sceneId, progress, onHead }) => {
  const rows = curLesson().boardPlans[sceneId] ?? [];
  if (!rows.length) return null;
  const L = boardLayout(rows);
  return (
    <g>
      {rows.map((row, r) => {
        const p = easeOut(Math.max(0, Math.min(1, progress * rows.length - r)));
        if (p <= 0) return null;
        const report = (h: Head) => { if (h && onHead) onHead({ x: L.cx + h.x * L.scale, y: L.ys[r] + h.y * L.scale }); };
        return (
          <g key={r} transform={`translate(${L.cx} ${L.ys[r]}) scale(${L.scale})`}>
            <RowView row={row} p={p} h={L.hs[r]} id={`${sceneId}-${r}`} onHead={report} />
          </g>
        );
      })}
    </g>
  );
};

// Teacher's hand holding a marker (seen in board close-ups while drawing). Tip at (0,0).
export const MarkerHand: React.FC<{ x: number; y: number; frame: number; color?: string }> = ({ x, y, frame, color = theme.ink }) => {
  const wob = Math.sin(frame / 2.3) * 2;
  return (
    <g transform={`translate(${x} ${y + wob}) rotate(-28)`}>
      <rect x={-7} y={0} width={14} height={18} rx={3} fill={color} />
      <rect x={-11} y={16} width={22} height={86} rx={6} fill="#f4f4f0" stroke="#c9c9c0" strokeWidth={2} />
      <rect x={-11} y={40} width={22} height={18} fill={color} />
      <path d="M-34 70 q-6 40 20 70 l90 40 q30 6 40 -26 l-30 -70 q-20 -22 -50 -20 l-30 -4 q-20 -6 -40 10 z" fill="#e9b98f" />
      <path d="M-30 74 q14 -12 34 -6" fill="none" stroke="#c9956a" strokeWidth={4} strokeLinecap="round" />
      <path d="M8 150 l70 36 l40 -10 l-20 60 l-110 -40 z" fill="#2f6b4f" />
    </g>
  );
};

// Board frame, tray, marker; `drawProgress` 0..1 reveals the plan; `wipe` 0..1 fades out the previous content.
export const Board: React.FC<{ sceneId: string; chapter: string; drawProgress: number; sparkle: number; frame: number; hand?: boolean }> =
  ({ sceneId, chapter, drawProgress, sparkle, frame, hand }) => {
    let head: Head = null;
    const content = <BoardContent sceneId={sceneId} progress={drawProgress} onHead={(h) => { head = h; }} />;
    return (
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
      {content}
      {/* tray with markers */}
      <rect x={BOARD.x + 80} y={BOARD.y + BOARD.h + 24} width={BOARD.w - 160} height={22} rx={6} fill={theme.boardTray} />
      {[theme.ink, theme.inkGreen, theme.inkRed].map((c, i) => <rect key={i} x={BOARD.x + 140 + i * 70} y={BOARD.y + BOARD.h + 14} width={56} height={14} rx={6} fill={c} />)}
      {hand ? <HandAtHead get={() => head} frame={frame} /> : null}
    </svg>
  );
  };
// Rendered after the content so `head` is already known (children render in order within one render pass).
const HandAtHead: React.FC<{ get: () => Head; frame: number }> = ({ get, frame }) => {
  const h = get();
  return h ? <MarkerHand x={h.x} y={h.y} frame={frame} /> : null;
};
