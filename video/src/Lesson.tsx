import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { timeline } from "./timeline";
import { theme } from "./theme";
import { Board } from "./components/Board";
import { Characters } from "./components/Characters";
import { Caption } from "./components/Caption";
import { Stars } from "./components/Stars";

// One <Sequence> per scene, one nested <Sequence> per beat. No background music by design.
export const Lesson: React.FC = () => (
  <AbsoluteFill style={{ background: theme.wall, fontFamily: theme.font }}>
    <AbsoluteFill style={{ top: "78%", background: theme.floor }} />
    {timeline.scenes.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.frames} name={scene.id}>
        <Board scene={scene} />
        <Stars chapter={scene.chapter} />
        <Characters scene={scene} />
        {scene.beats.map((beat) => (
          <Sequence key={beat.key} from={beat.from} durationInFrames={beat.frames} name={beat.key}>
            {beat.type === "line" && beat.audio ? <Audio src={staticFile(`audio/${beat.audio}`)} /> : null}
            {beat.type === "line" ? <Caption beat={beat} /> : null}
          </Sequence>
        ))}
      </Sequence>
    ))}
  </AbsoluteFill>
);
