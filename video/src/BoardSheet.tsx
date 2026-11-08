import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Board } from "./components/Board";
import { Fonts } from "./components/Fonts";
import { boardPlans } from "./art/boardPlans";
import { theme } from "./theme";

// QA only: frame N shows the fully drawn board of the N-th scene that has a board plan (checks clipping/overlap).
export const BOARD_SCENES = Object.keys(boardPlans).filter((k) => boardPlans[k].length > 0);
export const BoardSheet: React.FC = () => {
  const f = useCurrentFrame();
  const id = BOARD_SCENES[f] ?? BOARD_SCENES[0];
  return (
    <AbsoluteFill style={{ background: theme.wall, fontFamily: theme.font }}>
      <Fonts />
      <Board sceneId={id} chapter={id.slice(0, 4)} drawProgress={1} sparkle={0} frame={0} />
      <div style={{ position: "absolute", left: 20, top: 1000, fontSize: 40, color: "#c00" }}>{id}</div>
      <div style={{ position: "absolute", left: 0, top: 580, width: 1920, height: 4, background: "rgba(200,0,0,0.5)" }} />
    </AbsoluteFill>
  );
};
