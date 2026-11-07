import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Cutaway } from "./art/Cutaway";
import type { CutawayId } from "./art/cutawayIds";

// QA only: frame N shows illustration N at t = 0.8.
export const CUTAWAY_QA: CutawayId[] = ["pillarHouse", "desertMosque", "guestLight", "pilgrimsWhite", "winterSpring", "melonField",
  "queueShop", "shareApples", "homeworkDesk", "fireGarden", "antsGalaxy"];
export const CutawaySheet: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill><Cutaway id={CUTAWAY_QA[f % CUTAWAY_QA.length]} t={0.8} frame={f * 7} /></AbsoluteFill>;
};
