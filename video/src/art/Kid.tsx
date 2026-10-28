import React from "react";
import { blink } from "../anim";

// Children seated at a desk, drawn in a 300×340 box (desk top at the bottom). Bektur: boy with short dark hair and
// a blue sweater. Aizada: girl with a light headscarf and a pink cardigan.
export type KidPose = "listen" | "speak" | "raise" | "think" | "clap" | "wave" | "nod" | "write";
export type KidProps = {
  who: "bektur" | "aizada";
  frame: number;
  pose: KidPose;
  prevPose: KidPose;
  poseT: number;
  mouth: number;
  smile: number;
  look: number; // -1 towards board/ustaz (left), +1 right
  seed: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ARMS: Record<KidPose, { l: number; r: number; lift: number }> = {
  listen: { l: 0, r: 0, lift: 0 }, speak: { l: 0, r: -20, lift: 0.2 }, raise: { l: 0, r: -160, lift: 0 },
  think: { l: 0, r: -110, lift: 0.4 }, clap: { l: -40, r: 40, lift: 0.5 }, wave: { l: 0, r: -150, lift: 0 },
  nod: { l: 0, r: 0, lift: 0 }, write: { l: 10, r: -30, lift: 0 },
};

export const Kid: React.FC<KidProps> = ({ who, frame, pose, prevPose, poseT, mouth, smile, look, seed }) => {
  const girl = who === "aizada";
  const skin = girl ? "#f0c9a8" : "#e4b48c";
  const top = girl ? "#e46a8a" : "#3a7bd5";
  const topDark = girl ? "#c9516f" : "#2d60a8";
  const hair = girl ? "#3b2a22" : "#2b1d14";
  const scarf = "#fdf6e3";
  const a = ARMS[prevPose], b = ARMS[pose];
  const clap = pose === "clap" ? Math.abs(Math.sin(frame / 3.5)) : 0;
  const waveA = pose === "wave" ? Math.sin(frame / 4) * 20 : 0;
  const rArm = lerp(a.r, b.r, poseT) + waveA - clap * 30;
  const lArm = lerp(a.l, b.l, poseT) + clap * 30;
  const lift = lerp(a.lift, b.lift, poseT);
  const bob = Math.sin(frame / 30 + seed) * 1.5 + (pose === "nod" ? Math.sin(frame / 5) * 4 : 0) + (pose === "speak" ? Math.sin(frame / 9) * 2 : 0);
  const bl = blink(frame, seed);
  const eyeH = 8 * (1 - bl * 0.92);
  const headTurn = look * 8;
  const mouthH = 2 + mouth * 12;
  const mouthW = 20 + smile * 6;
  const tilt = look * -2 + (pose === "think" ? 6 : 0);

  return (
    <svg width={300} height={340} viewBox="0 0 300 340" style={{ overflow: "visible" }}>
      <g transform={`translate(0 ${bob})`}>
        {/* torso */}
        <path d="M86 200 q64 -36 128 0 l10 120 h-148 z" fill={top} />
        <path d="M86 200 l64 22 l64 -22 l-4 10 l-60 22 l-60 -22 z" fill={topDark} />
        {/* left arm (viewer's left) */}
        <g transform={`translate(96 212) rotate(${lArm})`}>
          <rect x={-14} y={-8} width={28} height={110} rx={14} fill={top} />
          <circle cx={0} cy={108} r={14} fill={skin} />
        </g>
        {/* right arm */}
        <g transform={`translate(204 212) rotate(${rArm})`}>
          <rect x={-14} y={-8} width={28} height={110} rx={14} fill={top} />
          <circle cx={0} cy={108} r={14} fill={skin} />
        </g>
        {/* neck */}
        <rect x={136} y={160} width={28} height={50} rx={10} fill={skin} />
        {/* head */}
        <g transform={`translate(${150 + headTurn * 0.4} ${120 - lift * 6}) rotate(${tilt}) translate(-150 -120)`}>
          {girl ? (
            <>
              {/* headscarf back */}
              <path d="M90 120 q0 -90 60 -90 q60 0 60 90 q10 70 -60 80 q-70 -10 -60 -80 z" fill={scarf} />
            </>
          ) : (
            <path d="M94 120 q0 -80 56 -80 q56 0 56 80 z" fill={hair} />
          )}
          <ellipse cx={150} cy={120} rx={52} ry={58} fill={skin} />
          {girl ? (
            <>
              <path d="M98 116 q52 -66 104 0 q-10 -28 -52 -30 q-42 2 -52 30 z" fill={scarf} />
              <path d="M98 116 q52 -22 104 0 l-6 6 q-46 -18 -92 0 z" fill="#efe4c8" />
            </>
          ) : (
            <path d="M98 108 q20 -50 60 -48 q36 2 48 40 q-20 -20 -56 -14 q-32 4 -52 22 z" fill={hair} />
          )}
          {/* ears */}
          {!girl ? <><ellipse cx={100} cy={124} rx={8} ry={12} fill={skin} /><ellipse cx={200} cy={124} rx={8} ry={12} fill={skin} /></> : null}
          {/* eyes */}
          <ellipse cx={130 + headTurn} cy={118} rx={10} ry={eyeH} fill="#fff" />
          <ellipse cx={170 + headTurn} cy={118} rx={10} ry={eyeH} fill="#fff" />
          <circle cx={131 + headTurn * 1.5} cy={119} r={Math.min(5.5, eyeH)} fill="#2b1d14" />
          <circle cx={171 + headTurn * 1.5} cy={119} r={Math.min(5.5, eyeH)} fill="#2b1d14" />
          {/* brows */}
          <path d={`M${120 + headTurn} ${102 - lift * 4} q10 -6 20 -1`} stroke={hair} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M${160 + headTurn} ${101 - lift * 4} q10 -5 20 1`} stroke={hair} strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* cheeks */}
          <circle cx={118 + headTurn} cy={142} r={7} fill="#f3a3a3" opacity={0.5} />
          <circle cx={182 + headTurn} cy={142} r={7} fill="#f3a3a3" opacity={0.5} />
          {/* nose */}
          <path d={`M${150 + headTurn} 128 q-4 10 2 14`} stroke="#c9956a" strokeWidth={3} fill="none" strokeLinecap="round" />
          {/* mouth */}
          <path d={`M${150 + headTurn - mouthW / 2} 156 q${mouthW / 2} ${4 + smile * 5 + mouthH} ${mouthW} 0 q${-mouthW / 2} ${-2} ${-mouthW} 0 z`} fill="#8a3b3b" />
          {mouth > 0.4 ? <path d={`M${150 + headTurn - mouthW / 2 + 4} 157 q${mouthW / 2 - 4} ${mouthH * 0.4} ${mouthW - 8} 0 z`} fill="#fff" opacity={0.9} /> : null}
        </g>
      </g>
    </svg>
  );
};
