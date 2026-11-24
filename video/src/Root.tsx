import React from "react";
import { Composition } from "remotion";
import { Lesson } from "./Lesson";
import { timeline, timelines } from "./timeline";
import { BoardSheet, BOARD_SCENES } from "./BoardSheet";
import { CoverStill } from "./CoverStill";

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
    {/* New lessons 004 / 005 (production ids R04 / R05), split from the one-hour lesson 003. */}
    {(["R04", "R05"] as const).map((L) => {
      const t = timelines[L];
      const n = String(t.lesson?.number ?? 0).padStart(3, "0");
      return (
        <React.Fragment key={L}>
          <Composition id={`Lesson${n}`} component={Lesson} durationInFrames={t.durationInFrames} fps={t.fps}
            width={t.width} height={t.height} defaultProps={{ lesson: L }} />
          {/* YouTube thumbnail: the same cover, 1280×720 still */}
          <Composition id={`Cover${n}`} component={CoverStill} durationInFrames={1} fps={t.fps} width={1280} height={720}
            defaultProps={{ lesson: L }} />
          {t.chapters.map((c) => (
            <Composition key={c.id} id={`Lesson${n}-${c.id}`} component={Lesson} durationInFrames={c.frames} fps={t.fps}
              width={t.width} height={t.height} defaultProps={{ chapter: c.id, lesson: L }} />
          ))}
        </React.Fragment>
      );
    })}
    <Composition id="QA-BoardSheet" component={BoardSheet} durationInFrames={BOARD_SCENES.length} fps={timeline.fps}
      width={timeline.width} height={timeline.height} defaultProps={{}} />
  </>
);
