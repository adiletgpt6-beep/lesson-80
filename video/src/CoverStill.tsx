import React from "react";
import { AbsoluteFill } from "remotion";
import { Fonts } from "./components/Fonts";
import { timelines } from "./timeline";
import { LessonCover } from "../../shared/remotion/LessonCover";

// 1280×720 still of the course-wide lesson cover (YouTube thumbnail), identical design to the first 90 frames.
export const CoverStill: React.FC<{ lesson: string }> = ({ lesson }) => {
  const m = timelines[lesson].lesson!;
  return (
    <AbsoluteFill>
      <Fonts />
      <LessonCover number={m.number} title={m.title} subtitle={m.subtitle} width={1280} height={720} />
    </AbsoluteFill>
  );
};
