import React from "react";
import { Composition } from "remotion";
import { Lesson } from "./Lesson";
import { timeline } from "./timeline";

// `Lesson003` is the whole film; `Lesson003-chNN` renders one chapter (same frames, offset to 0) so chapters can be
// rendered separately and concatenated with ffmpeg without re-encoding.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Lesson003" component={Lesson} durationInFrames={timeline.durationInFrames} fps={timeline.fps}
      width={timeline.width} height={timeline.height} defaultProps={{}} />
    {timeline.chapters.map((c) => (
      <Composition key={c.id} id={`Lesson003-${c.id}`} component={Lesson} durationInFrames={c.frames} fps={timeline.fps}
        width={timeline.width} height={timeline.height} defaultProps={{ chapter: c.id }} />
    ))}
  </>
);
