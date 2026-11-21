import React from "react";
import { Composition } from "remotion";
import { Lesson } from "./Lesson";
import { BoardSheet, boardScenes } from "./BoardSheet";
import { LESSONS } from "./lessons/active";
import { CutawaySheet, CUTAWAY_QA } from "./CutawaySheet";
import { LessonCover, type LessonCoverProps } from "./components/LessonCover";
import { Fonts } from "./components/Fonts";

const ThumbCover: React.FC<LessonCoverProps> = (p) => (<><Fonts /><LessonCover {...p} /></>);

// For each lesson NNN: `LessonNNN` is the whole film, `LessonNNN-chMM` renders one chapter (frame 0 = chapter
// start) so chapters can be rendered in parallel and concatenated with ffmpeg without re-encoding.
export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(LESSONS).map(([id, d]) => (
      <React.Fragment key={id}>
        <Composition id={`Lesson${id}`} component={Lesson} durationInFrames={Math.max(1, d.timeline.durationInFrames)} fps={d.timeline.fps}
          width={d.timeline.width} height={d.timeline.height} defaultProps={{ lesson: id }} />
        {d.timeline.chapters.map((c) => (
          <Composition key={c.id} id={`Lesson${id}-${c.id}`} component={Lesson} durationInFrames={Math.max(1, c.frames)} fps={d.timeline.fps}
            width={d.timeline.width} height={d.timeline.height} defaultProps={{ lesson: id, chapter: c.id }} />
        ))}
        <Composition id={`QA-BoardSheet-${id}`} component={BoardSheet} durationInFrames={Math.max(1, boardScenes(id).length)} fps={d.timeline.fps}
          width={d.timeline.width} height={d.timeline.height} defaultProps={{ lesson: id }} />
      </React.Fragment>
    ))}
    {Object.entries(LESSONS).filter(([, d]) => d.meta.cover).map(([id, d]) => (
      // YouTube thumbnail: the same cover design at 1280×720 (OPENING_COVER_RULES.md)
      <Composition key={`Thumb${id}`} id={`Thumb${id}`} component={ThumbCover} durationInFrames={1} fps={30} width={1280} height={720}
        defaultProps={{ number: d.meta.cover!.number, topic: d.meta.cover!.topic, fontFamily: "'Noto Sans', sans-serif" }} />
    ))}
    <Composition id="QA-Cutaways" component={CutawaySheet} durationInFrames={CUTAWAY_QA.length} fps={30} width={1920} height={1080} defaultProps={{}} />
  </>
);
