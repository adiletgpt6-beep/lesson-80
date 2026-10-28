import { interpolate, useCurrentFrame } from "remotion";
import type { Scene } from "../timeline";
import { theme } from "../theme";

// Board items appear one by one across the first half of the scene (placeholder for hand-drawn assets).
export const Board: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const step = Math.max(15, Math.floor(scene.frames / 2 / Math.max(1, scene.board.length)));
  return (
    <div style={{ position: "absolute", left: 560, top: 70, width: 1240, height: 640, background: theme.board,
      border: `18px solid ${theme.boardFrame}`, borderRadius: 12, padding: 40, boxSizing: "border-box" }}>
      <div style={{ fontSize: 30, color: theme.accent, marginBottom: 24 }}>{scene.title}</div>
      {scene.board.map((item, i) => (
        <div key={i} style={{ fontSize: 40, color: theme.ink, marginBottom: 18,
          opacity: interpolate(frame, [i * step, i * step + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {item}
        </div>
      ))}
    </div>
  );
};
