import { useCurrentFrame } from "remotion";
import type { Scene } from "../timeline";
import { theme } from "../theme";

type Who = "ustaz" | "bektur" | "aizada";
const PLACE: Record<Who, { x: number; h: number; color: string; cap?: string }> = {
  ustaz: { x: 300, h: 560, color: "#3f6e8c", cap: "#ffffff" },
  bektur: { x: 1420, h: 340, color: "#c76b3a" },
  aizada: { x: 1640, h: 300, color: "#8a4fa3" },
};

// Placeholder figures: the active speaker's mouth moves. Replace with rigged character art later.
export const Characters: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const beat = scene.beats.find((b) => frame >= b.from && frame < b.from + b.frames);
  const speaking = (who: Who) =>
    beat?.type === "line" && (beat.speaker === who || (beat.speaker === "both_children" && who !== "ustaz"));
  return (
    <>
      {(Object.keys(PLACE) as Who[]).filter((w) => scene.characters.includes(w) || scene.characters.includes("both_children") && w !== "ustaz").map((who) => {
        const p = PLACE[who];
        const mouth = speaking(who) ? 6 + 6 * Math.abs(Math.sin(frame / 3)) : 3;
        return (
          <svg key={who} style={{ position: "absolute", left: p.x - 120, top: 1080 - p.h - 40 }} width={240} height={p.h}>
            <rect x={60} y={p.h * 0.38} width={120} height={p.h * 0.62} rx={40} fill={p.color} />
            <circle cx={120} cy={p.h * 0.22} r={p.h * 0.16} fill="#f1c9a5" />
            {p.cap ? <rect x={120 - p.h * 0.13} y={p.h * 0.03} width={p.h * 0.26} height={p.h * 0.07} rx={8} fill={p.cap} /> : null}
            <ellipse cx={120} cy={p.h * 0.28} rx={14} ry={mouth} fill={theme.ink} />
          </svg>
        );
      })}
    </>
  );
};
