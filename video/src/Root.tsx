import { Composition } from "remotion";
import { Lesson } from "./Lesson";
import { timeline } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Lesson003"
    component={Lesson}
    durationInFrames={timeline.durationInFrames}
    fps={timeline.fps}
    width={timeline.width}
    height={timeline.height}
  />
);
