import React from "react";
import { blink } from "../anim";

// Animated ustaz: a neat, kind teacher in a takiya cap and a green vest. Standing, drawn in a 400×700 box with
// the feet at the bottom centre. All motion is parametric: `pose` picks arm positions, `mouth` 0..1 opens the
// lips, `face` -1..1 turns the head (−1 = towards board on his left, +1 = towards the children on his right).
export type UstazPose = "idle" | "point" | "open" | "chest" | "wave" | "think" | "explain" | "listen";

export type UstazProps = {
  frame: number;
  pose: UstazPose;
  poseT: number; // 0..1 blend from previous pose
  prevPose: UstazPose;
  mouth: number;
  face: number;
  smile: number; // 0..1
  browUp: number; // 0..1
  pointTarget?: { x: number; y: number }; // in the ustaz's local 400×700 coords, where the right hand points
};

const SKIN = "#e9b98f", SKIN_DARK = "#c9956a", BEARD = "#4a3225", VEST = "#2f6b4f", SHIRT = "#f5f1e6", TROUSERS = "#3b4a5c", CAP = "#fdfdf8", SHOE = "#2a2622";

type Arms = { lShoulder: number; lElbow: number; rShoulder: number; rElbow: number; lHand: "open" | "fist" | "point"; rHand: "open" | "fist" | "point" };
// angles in degrees: shoulder rotation from hanging down (0 = arm down along body, positive = raised forward/outward)
const POSES: Record<UstazPose, Arms> = {
  idle: { lShoulder: 6, lElbow: 12, rShoulder: -6, rElbow: -12, lHand: "open", rHand: "open" },
  point: { lShoulder: 8, lElbow: 20, rShoulder: -120, rElbow: -20, lHand: "open", rHand: "point" },
  open: { lShoulder: 50, lElbow: 80, rShoulder: -50, rElbow: -80, lHand: "open", rHand: "open" },
  chest: { lShoulder: 10, lElbow: 14, rShoulder: -60, rElbow: -110, lHand: "open", rHand: "open" },
  wave: { lShoulder: 8, lElbow: 14, rShoulder: -150, rElbow: -30, lHand: "open", rHand: "open" },
  think: { lShoulder: 10, lElbow: 14, rShoulder: -70, rElbow: -120, lHand: "open", rHand: "fist" },
  explain: { lShoulder: 30, lElbow: 70, rShoulder: -40, rElbow: -90, lHand: "open", rHand: "open" },
  listen: { lShoulder: 14, lElbow: 24, rShoulder: -12, rElbow: -20, lHand: "open", rHand: "open" },
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Hand: React.FC<{ kind: "open" | "fist" | "point"; flip?: boolean }> = ({ kind, flip }) => (
  <g transform={flip ? "scale(-1,1)" : undefined}>
    {kind === "point" ? (
      <>
        <ellipse cx={0} cy={10} rx={15} ry={17} fill={SKIN} />
        <rect x={-5} y={-30} width={10} height={36} rx={5} fill={SKIN} />
      </>
    ) : kind === "fist" ? (
      <ellipse cx={0} cy={6} rx={16} ry={16} fill={SKIN} />
    ) : (
      <>
        <ellipse cx={0} cy={12} rx={15} ry={20} fill={SKIN} />
        <rect x={-14} y={-10} width={7} height={26} rx={3.5} fill={SKIN} />
        <rect x={-5} y={-14} width={7} height={30} rx={3.5} fill={SKIN} />
        <rect x={4} y={-12} width={7} height={28} rx={3.5} fill={SKIN} />
        <rect x={12} y={-4} width={6} height={22} rx={3} fill={SKIN} />
      </>
    )}
  </g>
);

const Arm: React.FC<{ x: number; y: number; shoulder: number; elbow: number; hand: "open" | "fist" | "point"; sleeve: string; flip?: boolean }> =
  ({ x, y, shoulder, elbow, hand, sleeve, flip }) => (
    <g transform={`translate(${x} ${y}) rotate(${shoulder})`}>
      <rect x={-19} y={-12} width={38} height={150} rx={19} fill={sleeve} />
      <g transform={`translate(0 136) rotate(${elbow})`}>
        <rect x={-16} y={-10} width={32} height={130} rx={16} fill={sleeve} />
        <rect x={-17} y={100} width={34} height={22} rx={8} fill={SHIRT} />
        <g transform="translate(0 124)">
          <Hand kind={hand} flip={flip} />
        </g>
      </g>
    </g>
  );

export const Ustaz: React.FC<UstazProps> = ({ frame, pose, poseT, prevPose, mouth, face, smile, browUp }) => {
  const a = POSES[prevPose], b = POSES[pose];
  const t = poseT;
  const sway = Math.sin(frame / 38) * 1.2; // gentle weight shift
  const breathe = Math.sin(frame / 26) * 2;
  const gesture = pose === "explain" || pose === "open" ? Math.sin(frame / 7) * 5 : pose === "wave" ? Math.sin(frame / 4) * 22 : 0;
  const rS = lerp(a.rShoulder, b.rShoulder, t) + gesture * 0.4, rE = lerp(a.rElbow, b.rElbow, t) + gesture;
  const lS = lerp(a.lShoulder, b.lShoulder, t) + gesture * 0.3, lE = lerp(a.lElbow, b.lElbow, t) + gesture * 0.6;
  const headTurn = face * 10; // px shift of facial features
  const headTilt = face * -3 + Math.sin(frame / 50) * 1;
  const bl = blink(frame, 11);
  const eyeH = 9 * (1 - bl * 0.92);
  const mouthH = 3 + mouth * 16;
  const mouthW = 26 - mouth * 4 + smile * 8;
  const cornerUp = 4 + smile * 6;
  const hands = { l: t < 0.5 ? a.lHand : b.lHand, r: t < 0.5 ? a.rHand : b.rHand };

  return (
    <svg width={400} height={700} viewBox="0 0 400 700" style={{ overflow: "visible" }}>
      <g transform={`translate(${sway} 0)`}>
        {/* shadow */}
        <ellipse cx={200} cy={690} rx={120} ry={12} fill="rgba(0,0,0,0.12)" />
        {/* legs */}
        <rect x={150} y={470} width={44} height={190} rx={16} fill={TROUSERS} />
        <rect x={206} y={470} width={44} height={190} rx={16} fill={TROUSERS} />
        <path d="M138 652 h66 v22 q0 12 -12 12 h-64 q-12 0 -10 -12 z" fill={SHOE} />
        <path d="M196 652 h66 v22 q0 12 -12 12 h-64 q-12 0 -10 -12 z" fill={SHOE} />
        {/* left arm (viewer's left = his right side, towards the board) */}
        <Arm x={128} y={262 + breathe * 0.3} shoulder={lS} elbow={lE} hand={hands.l} sleeve={VEST} />
        {/* torso */}
        <g transform={`translate(0 ${breathe * 0.5})`}>
          <path d="M120 250 q80 -40 160 0 l22 240 q-102 30 -204 0 z" fill={SHIRT} />
          <path d="M126 250 q74 -36 148 0 l-14 236 h-120 z" fill={VEST} />
          <path d="M126 250 l60 20 l14 220 l-8 2 l-22 -220 z" fill={SHIRT} opacity={0.9} />
          <path d="M274 250 l-60 20 l-14 220 l8 2 l22 -220 z" fill={SHIRT} opacity={0.9} />
          <circle cx={200} cy={330} r={5} fill="#1f3b2f" />
          <circle cx={200} cy={380} r={5} fill="#1f3b2f" />
          <circle cx={200} cy={430} r={5} fill="#1f3b2f" />
          {/* collar */}
          <path d="M172 252 l28 30 l28 -30 q-28 -12 -56 0 z" fill="#ffffff" />
        </g>
        {/* right arm (viewer's right, towards the children) */}
        <Arm x={272} y={262 + breathe * 0.3} shoulder={rS} elbow={rE} hand={hands.r} sleeve={VEST} flip />
        {/* neck */}
        <rect x={180} y={200} width={40} height={60} rx={14} fill={SKIN_DARK} />
        {/* head */}
        <g transform={`translate(${200 + headTurn * 0.4} 150) rotate(${headTilt}) translate(-200 -150)`}>
          {/* beard */}
          <path d="M136 150 q-6 90 64 104 q70 -14 64 -104 q-30 40 -64 36 q-34 4 -64 -36 z" fill={BEARD} />
          {/* face */}
          <ellipse cx={200} cy={140} rx={62} ry={72} fill={SKIN} />
          {/* ears */}
          <ellipse cx={138 + headTurn * 0.3} cy={148} rx={10} ry={15} fill={SKIN_DARK} />
          <ellipse cx={262 + headTurn * 0.3} cy={148} rx={10} ry={15} fill={SKIN_DARK} />
          {/* beard front (short, tidy) */}
          <path d="M146 168 q54 70 108 0 q-6 54 -54 58 q-48 -4 -54 -58 z" fill={BEARD} />
          {/* moustache */}
          <path d={`M${178 + headTurn} 180 q22 -10 44 0 q-10 8 -22 7 q-12 1 -22 -7 z`} fill={BEARD} />
          {/* mouth */}
          <path d={`M${200 + headTurn - mouthW / 2} ${192 - cornerUp * 0.3} q${mouthW / 2} ${cornerUp + mouthH} ${mouthW} 0 q${-mouthW / 2} ${-cornerUp * 0.2} ${-mouthW} 0 z`} fill="#5a2a2a" />
          {mouth > 0.35 ? <path d={`M${200 + headTurn - mouthW / 2 + 4} ${195} q${mouthW / 2 - 4} ${mouthH * 0.35} ${mouthW - 8} 0 z`} fill="#fff" opacity={0.9} /> : null}
          {/* nose */}
          <path d={`M${200 + headTurn} 140 q-10 24 4 30 q10 -2 6 -10`} fill="none" stroke={SKIN_DARK} strokeWidth={4} strokeLinecap="round" />
          {/* eyes */}
          <g>
            <ellipse cx={174 + headTurn} cy={130} rx={12} ry={eyeH} fill="#fff" />
            <ellipse cx={226 + headTurn} cy={130} rx={12} ry={eyeH} fill="#fff" />
            <circle cx={175 + headTurn * 1.4} cy={131} r={Math.min(6, eyeH)} fill="#2b1d14" />
            <circle cx={227 + headTurn * 1.4} cy={131} r={Math.min(6, eyeH)} fill="#2b1d14" />
            <ellipse cx={174 + headTurn} cy={130} rx={13} ry={eyeH * 0.5} fill={SKIN} transform={`translate(0 ${-eyeH * 0.9})`} opacity={bl > 0 ? 1 : 0} />
          </g>
          {/* brows */}
          <path d={`M${160 + headTurn} ${112 - browUp * 7} q14 -10 28 -2`} stroke={BEARD} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M${212 + headTurn} ${110 - browUp * 7} q14 -8 28 2`} stroke={BEARD} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* cap (takiya) */}
          <path d="M136 108 q64 -72 128 0 q-64 -22 -128 0 z" fill={CAP} />
          <path d="M136 108 q64 -22 128 0 l-4 10 q-60 -18 -120 0 z" fill="#e8e3d2" />
          <path d="M150 90 q50 -40 100 0" fill="none" stroke="#d9d3bf" strokeWidth={3} />
        </g>
      </g>
    </svg>
  );
};
