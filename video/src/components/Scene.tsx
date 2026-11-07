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
import { sceneCutaways, visualCutaways, starBeats, lineCutaways } from "../art/scenePlan";
import { boardPlans } from "../art/boardPlans";
import { clamp01, easeInOut, mouthOpen, noise } from "../anim";

type Cam = { s: number; cx: number; cy: number };
const CAMS: Record<string, Cam> = {
  wide: { s: 1, cx: 960, cy: 540 },
  medium: { s: 1.18, cx: 1000, cy: 500 },
  board: { s: 1.42, cx: 1175, cy: 375 },
  ustaz: { s: 1.5, cx: 560, cy: 520 },
  ustazClose: { s: 2.15, cx: 510, cy: 560 },
  kids: { s: 1.5, cx: 1460, cy: 700 },
  kidB: { s: 2.05, cx: 1310, cy: 720 },
  kidA: { s: 2.05, cx: 1640, cy: 720 },
  ustazKids: { s: 1.22, cx: 1100, cy: 640 },
};
const h01 = (k: string) => { let h = 7; for (const c of k) h = (h * 31 + c.charCodeAt(0)) % 100003; return (h % 1000) / 1000; };

// Director: the shot for a beat (and an optional second shot for the last part of a long line), so that the
// picture changes every few seconds — kids are shown when they speak, the board while it is being drawn,
// the ustaz's face for important sentences, children's reactions during long explanations.
type Shot = { a: string; b?: string; split?: number };
const shotFor = (scene: Scene, bi: number, drawing: (b: Beat) => boolean, hasBoard: boolean): Shot => {
  const beat = scene.beats[bi];
  if (!beat) return { a: "wide" };
  const r = h01(beat.key);
  if (beat.type === "title") return { a: "wide" };
  if (beat.type === "visual") return { a: hasBoard ? "board" : "wide" };
  if (beat.type === "pause") return { a: r < 0.5 ? "kids" : "ustazKids" };
  if (beat.speaker === "bektur") return { a: r < 0.6 ? "kidB" : "kids" };
  if (beat.speaker === "aizada") return { a: r < 0.6 ? "kidA" : "kids" };
  if (beat.speaker === "both_children") return { a: "kids" };
  // ustaz
  const prev = scene.beats[bi - 1];
  const long = beat.frames > 300;
  if (hasBoard && drawing(beat)) {
    const prevBoard = bi > 0 && scene.beats[bi - 1].type === "line" && drawing(scene.beats[bi - 1]) && h01(scene.beats[bi - 1].key) < 0.6;
    if (r < 0.6 && !prevBoard) return long ? { a: "board", b: r < 0.3 ? "ustazClose" : "kids", split: 0.6 } : { a: "board" };
    return long ? { a: "medium", b: "ustazClose", split: 0.6 } : { a: r < 0.8 ? "medium" : "ustaz" };
  }
  if (prev && prev.type === "line" && prev.speaker !== "ustaz") return { a: "ustaz", b: long ? "kids" : undefined, split: 0.7 };
  if (/\?/.test(beat.text)) return { a: "ustazKids" };
  const cycle = hasBoard ? ["medium", "ustazClose", "wide", "ustaz", "board", "medium", "ustazKids"] : ["medium", "ustazClose", "wide", "ustaz", "ustazKids"];
  const a = cycle[(bi + Math.floor(r * 3)) % cycle.length];
  if (long) return { a, b: a === "ustazClose" ? "kids" : r < 0.5 ? "ustazClose" : "kids", split: 0.55 + r * 0.15 };
  return { a };
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

  // board drawing: reveal across the speaking part of the scene (first ~60%), only during non-title beats
  const titleFrames = scene.beats[0]?.type === "title" ? scene.beats[0].frames : 0;
  const drawSpan = Math.max(90, (scene.frames - titleFrames) * 0.6);
  const drawProgress = clamp01((frame - titleFrames - 10) / drawSpan);
  const boardMoving = drawProgress > 0 && drawProgress < 1 && (frame % 60) < 30;
  // camera: per-beat shots, eased moves (18 frames) between them, slight handheld drift
  const hasBoard = (boardPlans[scene.id] ?? []).length > 0;
  const drawAt = (f: number) => clamp01((f - titleFrames - 10) / drawSpan);
  const drawing = (b: Beat) => { const p0 = drawAt(b.from), p1 = drawAt(b.from + b.frames); return p1 - p0 > 0.12 && p0 < 0.98; };
  const shotAt = (i: number, f: number): string => {
    if (i < 0) { const [first] = parseCamera(scene.camera); return first; }
    const sh = shotFor(scene, i, drawing, hasBoard);
    const b = scene.beats[i];
    return sh.b && f - b.from > b.frames * (sh.split ?? 0.6) ? sh.b : sh.a;
  };
  const curShot = shotAt(bi, frame);
  // when did the current shot start, and what was before it?
  const shotStart = (() => {
    const b = scene.beats[bi];
    if (!b) return 0;
    const sh = shotFor(scene, bi, drawing, hasBoard);
    if (sh.b && frame - b.from > b.frames * (sh.split ?? 0.6)) return b.from + Math.floor(b.frames * (sh.split ?? 0.6));
    return b.from;
  })();
  const prevShot = shotStart === (beat?.from ?? 0) ? (bi > 0 ? shotAt(bi - 1, shotStart - 1) : parseCamera(scene.camera)[0]) : shotFor(scene, bi, drawing, hasBoard).a;
  const moveT = easeInOut(clamp01((frame - shotStart) / 18));
  const A = CAMS[prevShot] ?? CAMS.medium, B = CAMS[curShot] ?? CAMS.medium;
  const drift = 1 + 0.012 * Math.sin(abs / 90);
  const s = (A.s + (B.s - A.s) * moveT) * drift;
  const cx = A.cx + (B.cx - A.cx) * moveT + Math.sin(abs / 70) * 6, cy = A.cy + (B.cy - A.cy) * moveT + Math.cos(abs / 83) * 4;
  const tx = 960 - cx * s, ty = 540 - cy * s;
  const txC = Math.min(0, Math.max(1920 - 1920 * s, tx)), tyC = Math.min(0, Math.max(1080 - 1080 * s, ty));
  const handOn = curShot === "board" && moveT > 0.6 && drawProgress > 0 && drawProgress < 1;

  const sparkle = beat && starBeats.has(beat.key) ? 1 : (sceneIndex === 0 && newStarChapters.has(scene.chapter) && frame < 90 ? 1 : 0);

  // cutaway (whole scene or during a visual beat)
  const sceneCut = sceneCutaways[scene.id];
  const beatCut = beat?.type === "visual" ? visualCutaways[beat.key] : beat ? lineCutaways[beat.key] : undefined;
  let cutId = sceneCut ?? beatCut, cutT = 0, cutAlpha = 0;
  if (sceneCut) {
    cutT = frame / scene.frames; cutAlpha = 1;
  } else if (beatCut && beat) {
    cutT = fib / beat.frames;
    cutAlpha = Math.min(1, fib / 10, (beat.frames - fib) / 10);
  }

  const u0 = ustazPoseFor(beat, bi, boardMoving);
  const kidTalks = beat?.type === "line" && beat.speaker !== "ustaz";
  const u = { ...u0, face: drawProgress > 0 && drawProgress < 1 && boardMoving ? -0.9 : kidTalks ? 1 : u0.face };
  const uPrev = ustazPoseFor(prevBeat, bi - 1, false);
  const speakingU = beat?.type === "line" && beat.speaker === "ustaz";
  const mouthU = speakingU ? mouthOpen(fib, beat.frames, 1) : 0;

  const kb0 = kidPoseFor("bektur", beat, fib, scene), ka0 = kidPoseFor("aizada", beat, fib, scene);
  // listening children react: look at the board while it is drawn, nod or think now and then
  const react = (k: { pose: KidPose; look: number; smile: number }, seed: number) => {
    if (k.pose !== "listen" || beat?.speaker !== "ustaz") return k;
    if (boardMoving) return { ...k, look: -1 };
    const slot = Math.floor((abs + seed * 37) / 110);
    const n = noise(slot * 3.1 + seed);
    if (n < 0.18) return { ...k, pose: "nod" as KidPose, smile: 0.8 };
    if (n > 0.9) return { ...k, pose: "think" as KidPose };
    return { ...k, look: -0.8 + (n - 0.5) * 0.5 };
  };
  const kb = react(kb0, 5), ka = react(ka0, 9);
  const kbPrev = kidPoseFor("bektur", prevBeat, 999, scene), kaPrev = kidPoseFor("aizada", prevBeat, 999, scene);
  const mouthB = beat?.type === "line" && (beat.speaker === "bektur" || beat.speaker === "both_children") ? mouthOpen(fib, beat.frames, 2) : 0;
  const mouthA = beat?.type === "line" && (beat.speaker === "aizada" || beat.speaker === "both_children") ? mouthOpen(fib, beat.frames, 3) : 0;

  const showKids = true; // the children stay in class even when a scene lists only the ustaz as active

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: theme.wall }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${txC}px, ${tyC}px) scale(${s})`, transformOrigin: "0 0" }}>
        <Classroom frame={abs} />
        <Board sceneId={scene.id} chapter={scene.chapter} drawProgress={drawProgress} sparkle={sparkle} frame={abs} hand={handOn} />
        <div style={{ position: "absolute", left: 300, top: 320 }}>
          <Ustaz frame={abs} pose={u.pose} prevPose={uPrev.pose} poseT={poseT} mouth={mouthU} face={u.face} smile={u.smile} browUp={u.browUp} nod={speakingU ? Math.max(Math.sin(clamp01((fib - 4) / 16) * Math.PI), 0) * 0.9 + Math.max(0, Math.sin(fib / 23) - 0.85) * 4 : 0} />
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
          3-сабак · көрүү версиясы (preview v1) · ElevenLabs үн · Remotion 2D · устаздын текшерүүсүнө чейин
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
