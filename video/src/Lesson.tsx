import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { timeline, type Scene } from "./timeline";
import { theme } from "./theme";
import { Fonts } from "./components/Fonts";
import { SceneView } from "./components/Scene";

// One <Sequence> per scene; audio clips are their own sequences so Remotion can mix them precisely.
// `chapter` renders only that chapter's scenes with frame 0 = chapter start (used for per-chapter renders).
export const Lesson: React.FC<{ chapter?: string }> = ({ chapter }) => {
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
    </AbsoluteFill>
  );
};
