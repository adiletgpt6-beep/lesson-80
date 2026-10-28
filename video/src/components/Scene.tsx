import React from "react";
import { Audio, staticFile, useCurrentFrame } from "remotion";
import type { Beat, Scene } from "../timeline";
import { theme, newStarChapters } from "../theme";
import { Classroom } from "./Classroom";
import { Board } from "./Board";
import { Caption } from "./Caption";
import { TitleCard, OpeningCard } from "./TitleCard";
import { Ustaz, type UstazPose } from "../art/Ustaz";
import { Kid, type KidPose } from "../art/Kid";
import { Cutaway } from "../art/Cutaway";
import { sceneCutaways, visualCutaways, starBeats } from "../art/scenePlan";
import { clamp01, easeInOut, mouthOpen, noise } from "../anim";

type Cam = { s: number; cx: number; cy: number };
const CAMS: Record<string, Cam> = {
  wide: { s: 1, cx: 960, cy: 540 },
  medium: { s: 1.18, cx: 1000, cy: 500 },
  board: { s: 1.32, cx: 1110, cy: 400 },
  ustaz: { s: 1.5, cx: 560, cy: 470 },
  kids: { s: 1.45, cx: 1450, cy: 690 },
};
const camMode = (s: string): string => {
  if (/доска ири/.test(s)) return "board";
  if (/устаз ири/.test(s)) return "ustaz";
  if (/балдарга|Бектур, телефон|Айзада төшөктө/.test(s)) return "kids";
  if (/жалпы|кең|панорама|толук экран/.test(s)) return "wide";
  return "medium";
};
const parseCamera = (camera: string): [string, string] => {
  const parts = camera.split(/→|,|;/).map((p) => p.trim()).filter(Boolean);
  const a = camMode(parts[0] ?? "");
  const b = camMode(parts[1] ?? parts[0] ?? "");
  return [a, b];
};

const ustazPoseFor = (beat: Beat | undefined, idx: number, boardMoving: boolean): { pose: UstazPose; face: number; browUp: number; smile: number } => {
  if (!beat) return { pose: "idle", face: 0.3, browUp: 0, smile: 0.3 };
  if (beat.type === "title") return { pose: "idle", face: 0, browUp: 0, smile: 0.3 };
  if (beat.type === "visual") return { pose: "point", face: 0.9, browUp: 0.3, smile: 0.3 };
  if (beat.type === "pause") return { pose: idx % 2 ? "think" : "open", face: 0.8, browUp: 0.5, smile: 0.4 };
  if (beat.speaker !== "ustaz") return { pose: "listen", face: 1, browUp: 0.3, smile: 0.6 };
  const t = beat.text;
  if (/\?\s*$/.test(t) || /\?/.test(t) && t.length < 60) return { pose: "open", face: 0.9, browUp: 0.7, smile: 0.4 };
  if (/Азамат|Туура|Мына|Ооба/.test(t.slice(0, 12))) return { pose: "chest", face: 1, browUp: 0.2, smile: 0.9 };
  if (/Ассалому|Көрүшкөнчө|коштош/.test(t)) return { pose: "wave", face: 0.2, browUp: 0.3, smile: 0.9 };
  if (boardMoving) return { pose: "point", face: 0.9, browUp: 0.2, smile: 0.3 };
  const cycle: UstazPose[] = ["explain", "open", "explain", "chest", "explain", "point"];
  return { pose: cycle[idx % cycle.length], face: 0.5 + 0.3 * (idx % 2), browUp: 0.1, smile: 0.35 };
};

const kidPoseFor = (who: "bektur" | "aizada", beat: Beat | undefined, frameInBeat: number, scene: Scene): { pose: KidPose; look: number; smile: number } => {
  const speaking = beat?.type === "line" && (beat.speaker === who || beat.speaker === "both_children");
  if (speaking) {
    const asks = /\?/.test(beat!.text) && beat!.speaker === who;
    if (asks && frameInBeat < Math.min(30, beat!.frames * 0.3)) return { pose: "raise", look: -0.8, smile: 0.4 };
    return { pose: "speak", look: -0.7, smile: 0.5 };
  }
  if (beat?.type === "line" && beat.speaker !== "ustaz") return { pose: "listen", look: who === "bektur" ? 0.8 : -0.8, smile: 0.5 }; // looks at the other child
  if (beat?.type === "pause") return { pose: "think", look: -0.3, smile: 0.3 };
  if (beat?.type === "visual") {
    if (/кол чаб|кол булга/.test(beat.text) || /кол чабышат/.test(scene.animation.join(" ")) && /жылдыз/.test(beat.text)) return { pose: /булга/.test(beat.text) ? "wave" : "clap", look: 0, smile: 1 };
    return { pose: "listen", look: -0.9, smile: 0.4 };
  }
  if (beat?.type === "line" && /Азамат|Туура/.test(beat.text.slice(0, 10))) return { pose: "nod", look: -0.8, smile: 1 };
  return { pose: "listen", look: -0.8, smile: 0.4 };
};

const Desks: React.FC = () => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
    {[1150, 1480].map((x, i) => (
      <g key={i}>
        <rect x={x} y={840} width={300} height={30} rx={6} fill="#a57a52" />
        <rect x={x + 8} y={870} width={284} height={14} fill="#8a6240" />
        <rect x={x + 20} y={884} width={20} height={150} fill="#8a6240" /><rect x={x + 260} y={884} width={20} height={150} fill="#8a6240" />
        <rect x={x + 70} y={826} width={150} height={16} rx={4} fill="#fff" /><rect x={x + 80} y={818} width={130} height={10} rx={3} fill="#e8f3ff" />
      </g>
    ))}
  </svg>
);

export const SceneView: React.FC<{ scene: Scene; sceneIndex: number }> = ({ scene, sceneIndex }) => {
  const frame = useCurrentFrame();
  const abs = scene.from + frame;
  const bi = scene.beats.findIndex((b) => frame >= b.from && frame < b.from + b.frames);
  const beat = bi >= 0 ? scene.beats[bi] : scene.beats[scene.beats.length - 1];
  const prevBeat = bi > 0 ? scene.beats[bi - 1] : undefined;
  const fib = frame - (beat?.from ?? 0);
  const poseT = clamp01(fib / 14);

  // camera
  const [camA, camB] = parseCamera(scene.camera);
  const camT = easeInOut(clamp01((frame - 20) / 50));
  const A = CAMS[camA], B = CAMS[camB];
  const drift = 1 + 0.025 * clamp01(frame / Math.max(60, scene.frames));
  const s = (A.s + (B.s - A.s) * camT) * drift;
  const cx = A.cx + (B.cx - A.cx) * camT, cy = A.cy + (B.cy - A.cy) * camT;
  // keep the stage inside the frame
  const tx = 960 - cx * s, ty = 540 - cy * s;
  const txC = Math.min(0, Math.max(1920 - 1920 * s, tx)), tyC = Math.min(0, Math.max(1080 - 1080 * s, ty));

  // board drawing: reveal across the speaking part of the scene (first ~60%), only during non-title beats
  const titleFrames = scene.beats[0]?.type === "title" ? scene.beats[0].frames : 0;
  const drawSpan = Math.max(90, (scene.frames - titleFrames) * 0.6);
  const drawProgress = clamp01((frame - titleFrames - 10) / drawSpan);
  const boardMoving = drawProgress > 0 && drawProgress < 1 && (frame % 60) < 30;
  const sparkle = beat && starBeats.has(beat.key) ? 1 : (sceneIndex === 0 && newStarChapters.has(scene.chapter) && frame < 90 ? 1 : 0);

  // cutaway (whole scene or during a visual beat)
  const sceneCut = sceneCutaways[scene.id];
  const beatCut = beat?.type === "visual" ? visualCutaways[beat.key] : undefined;
  let cutId = sceneCut ?? beatCut, cutT = 0, cutAlpha = 0;
  if (sceneCut) {
    cutT = frame / scene.frames; cutAlpha = 1;
  } else if (beatCut && beat) {
    cutT = fib / beat.frames;
    cutAlpha = Math.min(1, fib / 10, (beat.frames - fib) / 10);
  }

  const u = ustazPoseFor(beat, bi, boardMoving);
  const uPrev = ustazPoseFor(prevBeat, bi - 1, false);
  const speakingU = beat?.type === "line" && beat.speaker === "ustaz";
  const mouthU = speakingU ? mouthOpen(fib, beat.frames, 1) : 0;

  const kb = kidPoseFor("bektur", beat, fib, scene), ka = kidPoseFor("aizada", beat, fib, scene);
  const kbPrev = kidPoseFor("bektur", prevBeat, 999, scene), kaPrev = kidPoseFor("aizada", prevBeat, 999, scene);
  const mouthB = beat?.type === "line" && (beat.speaker === "bektur" || beat.speaker === "both_children") ? mouthOpen(fib, beat.frames, 2) : 0;
  const mouthA = beat?.type === "line" && (beat.speaker === "aizada" || beat.speaker === "both_children") ? mouthOpen(fib, beat.frames, 3) : 0;

  const showKids = true; // the children stay in class even when a scene lists only the ustaz as active

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: theme.wall }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${txC}px, ${tyC}px) scale(${s})`, transformOrigin: "0 0" }}>
        <Classroom frame={abs} />
        <Board sceneId={scene.id} chapter={scene.chapter} drawProgress={drawProgress} sparkle={sparkle} frame={abs} />
        <div style={{ position: "absolute", left: 300, top: 320 }}>
          <Ustaz frame={abs} pose={u.pose} prevPose={uPrev.pose} poseT={poseT} mouth={mouthU} face={u.face} smile={u.smile} browUp={u.browUp} />
        </div>
        {showKids ? (
          <>
            <div style={{ position: "absolute", left: 1150, top: 540 }}>
              <Kid who="bektur" frame={abs} pose={kb.pose} prevPose={kbPrev.pose} poseT={poseT} mouth={mouthB} smile={kb.smile} look={kb.look} seed={5} />
            </div>
            <div style={{ position: "absolute", left: 1480, top: 540 }}>
              <Kid who="aizada" frame={abs} pose={ka.pose} prevPose={kaPrev.pose} poseT={poseT} mouth={mouthA} smile={ka.smile} look={ka.look} seed={9} />
            </div>
            <Desks />
          </>
        ) : null}
      </div>
      {cutId && cutAlpha > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: cutAlpha }}>
          <Cutaway id={cutId} t={cutT} frame={abs} />
        </div>
      ) : null}
      {scene.beats.map((b) =>
        b.type === "line" && b.audio && frame >= b.from && frame < b.from + b.frames ? null : null,
      )}
      {beat?.type === "line" ? <Caption beat={beat} frame={fib} /> : null}
      {beat?.type === "title" ? <TitleCard chapter={scene.chapter} title={beat.text} frame={fib} frames={beat.frames} /> : null}
      {scene.id === "ch00-s01" && beat?.type === "visual" ? <OpeningCard frame={fib} frames={beat.frames} /> : null}
      {scene.id === "ch16-s01" && bi === scene.beats.length - 1 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontFamily: theme.font, fontSize: 30, color: "rgba(31,59,87,0.8)", opacity: clamp01(fib / 15) }}>
          3-сабак · көрүү версиясы (preview v1) · ElevenLabs үн · Remotion 2D
        </div>
      ) : null}
    </div>
  );
};

// Audio of every voiced line in the scene (separate from visuals so the Sequence tree stays shallow).
export const SceneAudio: React.FC<{ scene: Scene }> = ({ scene }) => (
  <>
    {scene.beats.filter((b) => b.type === "line" && b.audio).map((b) => (
      <AudioClip key={b.key} beat={b} />
    ))}
  </>
);
const AudioClip: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  if (frame < beat.from || frame >= beat.from + beat.frames) return null;
  return <Audio src={staticFile(`audio/${beat.audio}`)} startFrom={0} volume={1} />;
};
export const _noise = noise;
