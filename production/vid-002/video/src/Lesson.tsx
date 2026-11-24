import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { Scene } from "./timeline";
import { setLesson } from "./lessons/active";
import { theme } from "./theme";
import { Fonts } from "./components/Fonts";
import { SceneView } from "./components/Scene";
import { LessonCover, COVER_FADE_FRAMES } from "./components/LessonCover";
import { AbsoluteFill as Fill, interpolate, useCurrentFrame } from "remotion";

// Opening cover (shared component): fully visible frames 0..coverFrames-1, then fades out over the first scene.
const CoverLayer: React.FC<{ frames: number; number: number; topic: string }> = ({ frames, number, topic }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [frames, frames + COVER_FADE_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Fill style={{ opacity: o }}><LessonCover number={number} topic={topic} fontFamily={theme.font} /></Fill>;
};

// One <Sequence> per scene; audio clips are their own sequences so Remotion can mix them precisely.
// `chapter` renders only that chapter's scenes with frame 0 = chapter start (used for per-chapter renders).
export const Lesson: React.FC<{ lesson: string; chapter?: string }> = ({ lesson, chapter }) => {
  const data = setLesson(lesson);
  const timeline = data.timeline;
  const cover = data.meta.cover;
  const coverFrames = timeline.coverFrames ?? 0;
  const scenes: Scene[] = chapter ? timeline.scenes.filter((s) => s.chapter === chapter) : timeline.scenes;
  const offset = chapter ? (timeline.chapters.find((c) => c.id === chapter)?.from ?? 0) : 0;
  return (
    <AbsoluteFill style={{ background: theme.wall, fontFamily: theme.font }}>
      <Fonts />
      {scenes.map((scene, i) => (
        <Sequence key={scene.id} from={scene.from - offset} durationInFrames={scene.frames} name={scene.id}>
          <SceneView scene={scene} sceneIndex={i} />
          {scene.beats.filter((b) => b.type === "line" && b.audio).map((b) => (
            <Sequence key={b.key} from={b.from} durationInFrames={b.frames} name={`${b.key} audio`}>
              <Audio src={staticFile(`audio/${b.audio}`)} />
            </Sequence>
          ))}
        </Sequence>
      ))}
      {cover && coverFrames > 0 && (!chapter || chapter === "ch00") ? (
        <Sequence from={0} durationInFrames={coverFrames + COVER_FADE_FRAMES} name="cover">
          <CoverLayer frames={coverFrames} number={cover.number} topic={cover.topic} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
