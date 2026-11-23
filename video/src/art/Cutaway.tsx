import React from "react";
import { easeInOut, easeOut, noise, smoothNoise } from "../anim";
import type { CutawayId } from "./scenePlan";

// Full-frame illustrated inserts (1920×1080). `t` is 0..1 progress through the insert, `frame` the absolute
// frame for ambient motion. Flat 2D shapes only — fast to render. People appear only as simple faceless figures
// or as Bektur/Aizada style figures; no depiction of Allah or prophets.
type P = { t: number; frame: number };

const SKY = "#bfe3f7", SKY_DEEP = "#8cc9ee", NIGHT = "#0f1b3d", GRASS = "#7fbf6a", GRASS_DARK = "#5e9e4c", MOUNT = "#7d8fa3", MOUNT_DARK = "#5f7085", SNOW = "#f7fbff", WATER = "#4f9fd8", TRUNK = "#7a4f2a", LEAF = "#4e9a46", WALL = "#f3e7d3", ROOF = "#b6563c";

const Sun: React.FC<{ x: number; y: number; r?: number; frame: number }> = ({ x, y, r = 70, frame }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.35} fill="#ffe08a" opacity={0.35 + Math.sin(frame / 20) * 0.05} />
    <circle cx={x} cy={y} r={r} fill="#ffd34d" />
  </g>
);
const Cloud: React.FC<{ x: number; y: number; s?: number; frame: number; speed?: number }> = ({ x, y, s = 1, frame, speed = 0.4 }) => (
  <g transform={`translate(${((x + frame * speed) % 2200) - 150} ${y}) scale(${s})`} fill="#ffffff" opacity={0.95}>
    <ellipse cx={0} cy={0} rx={90} ry={40} /><ellipse cx={-60} cy={10} rx={60} ry={32} /><ellipse cx={60} cy={10} rx={70} ry={34} /><ellipse cx={10} cy={-24} rx={55} ry={36} />
  </g>
);
const Mountains: React.FC<{ y?: number }> = ({ y = 560 }) => (
  <g>
    <path d={`M0 ${y + 160} L220 ${y - 120} L420 ${y + 40} L640 ${y - 200} L900 ${y + 60} L1120 ${y - 150} L1400 ${y + 80} L1620 ${y - 90} L1920 ${y + 120} L1920 ${y + 300} L0 ${y + 300} Z`} fill={MOUNT} />
    <path d={`M560 ${y - 120} L640 ${y - 200} L720 ${y - 110} L690 ${y - 100} L660 ${y - 130} L620 ${y - 100} L590 ${y - 120} Z`} fill={SNOW} />
    <path d={`M1050 ${y - 80} L1120 ${y - 150} L1190 ${y - 70} L1160 ${y - 70} L1130 ${y - 100} L1090 ${y - 60} Z`} fill={SNOW} />
    <path d={`M0 ${y + 200} L300 ${y + 40} L620 ${y + 180} L980 ${y + 20} L1300 ${y + 170} L1640 ${y + 40} L1920 ${y + 180} L1920 ${y + 300} L0 ${y + 300} Z`} fill={MOUNT_DARK} />
  </g>
);
const Hills: React.FC<{ y?: number; color?: string }> = ({ y = 760, color = GRASS }) => (
  <path d={`M0 ${y + 80} Q300 ${y - 80} 700 ${y + 20} T1300 ${y - 20} T1920 ${y + 60} L1920 1080 L0 1080 Z`} fill={color} />
);
const Tree: React.FC<{ x: number; y: number; s?: number; frame: number; leaf?: string; fruit?: string }> = ({ x, y, s = 1, frame, leaf = LEAF, fruit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-120} width={28} height={130} rx={10} fill={TRUNK} />
    <g transform={`rotate(${Math.sin(frame / 40 + x) * 1.5} 0 -140)`}>
      <circle cx={0} cy={-170} r={70} fill={leaf} /><circle cx={-55} cy={-130} r={55} fill={leaf} /><circle cx={55} cy={-130} r={55} fill={leaf} /><circle cx={0} cy={-110} r={60} fill={leaf} />
      {fruit ? [[-30, -150], [20, -175], [45, -120], [-50, -105], [10, -115]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={10} fill={fruit} />) : null}
    </g>
  </g>
);
const River: React.FC<{ frame: number; y?: number }> = ({ frame, y = 880 }) => (
  <g>
    <path d={`M0 ${y} C400 ${y - 60} 700 ${y + 90} 1100 ${y - 20} S1700 ${y + 60} 1920 ${y - 10} L1920 1080 L0 1080 Z`} fill={WATER} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M${((i * 380 + frame * 2.2) % 2100) - 100} ${y + 60 + (i % 3) * 40} q30 -10 60 0 q30 10 60 0`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.6} />
    ))}
  </g>
);
const Bird: React.FC<{ x: number; y: number; frame: number; s?: number }> = ({ x, y, frame, s = 1 }) => {
  const flap = Math.sin(frame / 4) * 12;
  return <path d={`M${x} ${y} q-20 ${-flap} -40 ${-flap / 2} M${x} ${y} q20 ${-flap} 40 ${-flap / 2}`} stroke="#2b3a4a" strokeWidth={4 * s} fill="none" strokeLinecap="round" />;
};
// Simple faceless figure (adult/child): used for background people only.
const Figure: React.FC<{ x: number; y: number; h?: number; color?: string; skin?: string; headwear?: "none" | "scarf" | "cap"; flip?: boolean; walk?: number }> =
  ({ x, y, h = 220, color = "#5b7fa6", skin = "#e9b98f", headwear = "none", flip, walk = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d={`M${-h * 0.09} ${-h * 0.42} l${-h * 0.05} ${h * 0.42} h${h * 0.08} l${h * 0.03} ${-h * 0.3} l${h * 0.03} ${h * 0.3} h${h * 0.08} l${-h * 0.05} ${-h * 0.42} z`} fill="#3b4a5c" transform={`skewX(${walk * 6})`} />
      <path d={`M${-h * 0.14} ${-h * 0.75} q${h * 0.14} ${-h * 0.08} ${h * 0.28} 0 l${h * 0.04} ${h * 0.35} h${-h * 0.36} z`} fill={color} />
      <circle cx={0} cy={-h * 0.85} r={h * 0.11} fill={skin} />
      {headwear === "scarf" ? <path d={`M${-h * 0.13} ${-h * 0.86} q${h * 0.13} ${-h * 0.2} ${h * 0.26} 0 q0 ${h * 0.14} ${-h * 0.05} ${h * 0.24} h${-h * 0.16} q${-h * 0.05} ${-h * 0.1} ${-h * 0.05} ${-h * 0.24} z`} fill="#f7efe0" /> : null}
      {headwear === "cap" ? <path d={`M${-h * 0.11} ${-h * 0.9} q${h * 0.11} ${-h * 0.1} ${h * 0.22} 0 z`} fill="#fff" /> : null}
    </g>
  );
const Kaz = (t: number, a: number, b: number) => a + (b - a) * easeInOut(t); // tween

const Window: React.FC<P> = ({ frame }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={1560} y={190} frame={frame} />
    <Cloud x={200} y={170} frame={frame} /><Cloud x={900} y={120} s={0.8} frame={frame} speed={0.3} /><Cloud x={1400} y={260} s={0.6} frame={frame} speed={0.5} />
    <Mountains />
    <Hills y={780} />
    {[200, 480, 760, 1500, 1750].map((x, i) => <Tree key={i} x={x} y={900 + (i % 2) * 40} s={0.9 + (i % 3) * 0.15} frame={frame} />)}
    <River frame={frame} y={960} />
    <Bird x={700} y={300} frame={frame} /><Bird x={820} y={340} frame={frame + 5} s={0.8} />
  </g>
);

const Nature: React.FC<P> = ({ frame, t }) => (
  <g>
    <Window t={t} frame={frame} />
    {/* deer grazing by the river */}
    <g transform={`translate(${1180 + Math.sin(frame / 60) * 4} 905) scale(1.1)`} fill="#8b5a2b">
      <rect x={-50} y={-60} width={100} height={46} rx={20} />
      <rect x={-44} y={-20} width={12} height={40} rx={5} /><rect x={-20} y={-20} width={12} height={40} rx={5} /><rect x={12} y={-20} width={12} height={40} rx={5} /><rect x={34} y={-20} width={12} height={40} rx={5} />
      <g transform={`rotate(${Math.sin(frame / 25) * 6} 50 -60)`}>
        <rect x={44} y={-110} width={22} height={60} rx={10} /><ellipse cx={62} cy={-110} rx={22} ry={14} />
        <path d="M58 -120 l-6 -30 l-12 -8 M58 -120 l10 -28 l14 -6" stroke="#6b421b" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  </g>
);

const Doors: React.FC<P> = ({ frame, t }) => {
  const inX = Kaz(Math.min(1, t * 1.6), 330, 560);
  const outX = Kaz(Math.max(0, (t - 0.3) * 1.5), 1360, 1600);
  return (
    <g>
      <rect width={1920} height={1080} fill="#efe6d4" />
      <rect y={780} width={1920} height={300} fill="#cfae84" />
      <rect x={420} y={240} width={300} height={560} rx={16} fill="#8a6240" /><rect x={450} y={270} width={240} height={530} rx={8} fill="#5c3b1e" />
      <rect x={1200} y={240} width={300} height={560} rx={16} fill="#8a6240" /><rect x={1230} y={270} width={240} height={530} rx={8} fill="#5c3b1e" />
      <text x={570} y={200} textAnchor="middle" fontSize={54} fontWeight={700} fill="#2a7f5a">КИРЕТ →</text>
      <text x={1350} y={200} textAnchor="middle" fontSize={54} fontWeight={700} fill="#1f3b57">← ЧЫГАТ</text>
      {/* a mother carrying a baby comes in */}
      <Figure x={inX} y={800} h={260} color="#c9516f" headwear="scarf" walk={Math.sin(frame / 6)} />
      <g transform={`translate(${inX + 40} 630)`}><circle r={26} fill="#f0c9a8" /><path d="M-26 0 q26 -34 52 0 z" fill="#fff" /><path d="M-10 8 q10 8 20 0" stroke="#8a3b3b" strokeWidth={3} fill="none" /></g>
      {/* a smiling grandfather with a cane goes out */}
      <Figure x={outX} y={800} h={250} color="#5b7fa6" headwear="cap" walk={Math.sin(frame / 6 + 2)} />
      <g transform={`translate(${outX} 587)`}><path d="M-22 10 q22 -34 44 0 z" fill="#e8e8e8" /><path d="M-10 18 q10 10 20 0" stroke="#8a3b3b" strokeWidth={3} fill="none" /><path d="M-26 -4 q0 22 26 26 q26 -4 26 -26 q-10 20 -26 18 q-16 2 -26 -18 z" fill="#dcdcdc" /></g>
      <line x1={outX + 44} y1={640} x2={outX + 54} y2={800} stroke="#7a4f2a" strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

const Space: React.FC<P & { back?: boolean }> = ({ frame, t, back }) => {
  const p = back ? 1 - easeInOut(t) : easeInOut(t);
  const rocketY = 880 - p * 760, rocketX = 420 + p * 1100;
  return (
    <g>
      <rect width={1920} height={1080} fill={NIGHT} />
      {Array.from({ length: 90 }).map((_, i) => <circle key={i} cx={noise(i) * 1920} cy={noise(i + 50) * 1080} r={1 + noise(i + 99) * 2.5} fill="#fff" opacity={0.5 + 0.5 * Math.sin(frame / 10 + i)} />)}
      {/* grey lifeless planets */}
      <circle cx={1500} cy={260} r={110} fill="#8d8d95" /><circle cx={1460} cy={230} r={22} fill="#73737c" /><circle cx={1540} cy={300} r={16} fill="#73737c" />
      <circle cx={300} cy={220} r={70} fill="#9a8f84" /><ellipse cx={300} cy={220} rx={120} ry={16} fill="none" stroke="#c9bdb0" strokeWidth={6} />
      <circle cx={1150} cy={760} r={56} fill="#b0a9a0" />
      {/* Earth, blue-green and alive */}
      <g transform="translate(260 900)">
        <circle r={260} fill="#3d8fd6" />
        <path d="M-200 -80 q80 -90 170 -40 q60 40 20 110 q-70 60 -150 20 q-70 -40 -40 -90 z" fill="#5fb55a" />
        <path d="M60 -200 q90 10 110 90 q10 70 -60 60 q-50 -30 -50 -150 z" fill="#5fb55a" />
        <circle r={260} fill="none" stroke="#bfe3f7" strokeWidth={10} opacity={0.5} />
      </g>
      {/* rocket */}
      <g transform={`translate(${rocketX} ${rocketY}) rotate(${back ? 135 : 35})`}>
        <path d="M0 -90 C40 -50 40 40 24 70 L-24 70 C-40 40 -40 -50 0 -90 Z" fill="#e8ecef" />
        <path d="M-24 40 L-56 80 L-26 70 M24 40 L56 80 L26 70" fill="#c8443a" />
        <circle cy={-10} r={14} fill="#4aa3df" />
        <path d={`M-16 72 L0 ${110 + Math.sin(frame) * 14} L16 72 Z`} fill="#ffb13b" />
      </g>
    </g>
  );
};

const Glacier: React.FC<P> = ({ frame, t }) => {
  const dropY = 330 + ((frame * 6) % 180);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY_DEEP} />
      <Sun x={300} y={160} frame={frame} />
      <path d="M0 700 L420 160 L760 560 L1040 240 L1400 620 L1700 300 L1920 640 L1920 1080 L0 1080 Z" fill={MOUNT} />
      <path d="M300 320 L420 160 L540 320 Q420 280 300 320 Z M940 360 L1040 240 L1140 360 Q1040 320 940 360 Z M1600 420 L1700 300 L1800 420 Q1700 380 1600 420 Z" fill={SNOW} />
      <path d="M600 500 Q700 420 820 520 L800 620 L620 600 Z" fill="#e6f4ff" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={700 + i * 40} cy={dropY + i * 50} rx={8} ry={12} fill={WATER} />)}
      <path d={`M760 ${680} q40 60 ${easeOut(t) * 600} ${easeOut(t) * 280}`} stroke={WATER} strokeWidth={30} fill="none" strokeLinecap="round" />
      <Hills y={860} color={GRASS_DARK} />
      <path d={`M1300 1080 C1360 960 1500 1000 1700 900 L1920 860 L1920 1080 Z`} fill={WATER} opacity={t > 0.6 ? 1 : 0} />
      <Tree x={1500} y={1000} frame={frame} s={0.8} /><Tree x={1750} y={1040} frame={frame} s={0.7} />
    </g>
  );
};

const House: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-70} width={100} height={70} fill={WALL} /><path d="M-60 -70 L0 -130 L60 -70 Z" fill={ROOF} /><rect x={-12} y={-40} width={24} height={40} fill="#6b4a2e" /><rect x={20} y={-56} width={18} height={18} fill="#9ad1f0" />
  </g>
);
const Villages: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={1620} y={170} frame={frame} />
    <Mountains y={480} />
    <Hills y={700} />
    <path d="M0 980 C400 900 700 1000 1100 920 S1700 960 1920 900 L1920 1080 L0 1080 Z" fill={WATER} />
    {Array.from({ length: 14 }).map((_, i) => {
      const appear = easeOut(t * 14 - i);
      const x = 120 + i * 130, y = 880 - (i % 3) * 20;
      return appear > 0 ? <g key={i} opacity={appear} transform={`translate(0 ${(1 - appear) * 40})`}><House x={x} y={y} s={i > 8 ? 1.3 : 1} /></g> : null;
    })}
    {t > 0.75 ? <g opacity={easeOut((t - 0.75) * 4)}><rect x={1500} y={620} width={90} height={240} fill="#d9d2c3" /><rect x={1610} y={560} width={110} height={300} fill="#cfc6b3" /><rect x={1740} y={660} width={80} height={200} fill="#d9d2c3" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1630} y={590 + i * 50} width={70} height={24} fill="#9ad1f0" />)}</g> : null}
    <text x={960} y={1050} textAnchor="middle" fontSize={40} fontWeight={700} fill="#fff">айыл → айыл → шаар</text>
  </g>
);

const Growth: React.FC<P> = ({ frame, t }) => {
  const stage = t * 5; // seed, sprout, tree, flower, apple
  const trunkH = Math.min(1, Math.max(0, stage - 1)) * 300;
  const crown = easeOut(stage - 2);
  const flowers = easeOut(stage - 3);
  const apples = easeOut(stage - 4);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Sun x={1600} y={180} frame={frame} />
      <Cloud x={300} y={160} frame={frame} />
      <Hills y={760} />
      <rect y={900} width={1920} height={180} fill="#8b5a2b" />
      <ellipse cx={960} cy={900} rx={60} ry={20} fill="#6b421b" />
      {stage < 1.2 ? <ellipse cx={960} cy={880} rx={16} ry={24} fill="#d9a21b" opacity={1 - Math.max(0, stage - 0.8) * 2.5} /> : null}
      <rect x={945} y={900 - trunkH} width={30} height={trunkH} rx={10} fill={TRUNK} />
      {stage > 1 && stage < 2.5 ? <path d={`M960 ${900 - trunkH * 0.6} q-60 -20 -70 -80 q60 10 70 80 M960 ${900 - trunkH * 0.8} q60 -20 70 -80 q-60 10 -70 80`} fill={LEAF} opacity={Math.min(1, stage - 1) * (1 - Math.max(0, stage - 2) * 2)} /> : null}
      <g transform={`translate(960 ${900 - trunkH}) scale(${crown})`}>
        <circle r={150} fill={LEAF} /><circle cx={-120} cy={60} r={100} fill={LEAF} /><circle cx={120} cy={60} r={100} fill={LEAF} /><circle cy={100} r={110} fill="#5aa652" />
        {[[-80, -60], [40, -100], [110, 20], [-130, 80], [0, 60], [150, 110], [-40, 140], [80, 150]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g opacity={flowers * (1 - apples)} transform={`scale(${flowers})`}>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos(a / 57.3) * 14} cy={Math.sin(a / 57.3) * 14} r={9} fill="#fff" />)}<circle r={7} fill="#ffd34d" /></g>
            <circle r={18 * apples} fill="#d9342b" /><path d={`M0 ${-18 * apples} q6 -10 12 -14`} stroke={TRUNK} strokeWidth={4 * apples} fill="none" />
          </g>
        ))}
      </g>
      {[["урук", 0], ["көчөт", 1], ["дарак", 2], ["гүл", 3], ["алма", 4]].map(([label, i]) => (
        <text key={label as string} x={300 + (i as number) * 330} y={1040} textAnchor="middle" fontSize={44} fontWeight={700} fill={stage >= (i as number) ? "#1f3b57" : "rgba(31,59,87,0.3)"}>{label as string}</text>
      ))}
    </g>
  );
};

const SnakeRopes: React.FC<P> = ({ frame, t }) => {
  const eat = Math.min(1, t * 1.6); // snake moves across ropes
  const back = easeOut((t - 0.7) * 3.3); // becomes a staff
  const sx = 400 + eat * 1000;
  return (
    <g>
      <rect width={1920} height={1080} fill="#f3e1b9" />
      <rect y={820} width={1920} height={260} fill="#d8b98a" />
      {/* pyramids far away, symbol of Egypt */}
      <path d="M100 820 L300 560 L500 820 Z M460 820 L640 640 L820 820 Z" fill="#c9a46a" />
      {/* ropes that only looked like snakes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 520 + i * 180;
        const eaten = sx > x + 60;
        return eaten ? null : <path key={i} d={`M${x} 860 q30 -40 60 0 q30 40 60 0`} stroke="#6b4a2e" strokeWidth={14} fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(frame / 6 + i) * 4} ${x + 60} 860)`} />;
      })}
      {back < 1 ? (
        <g opacity={1 - back} transform={`translate(${sx} 840)`}>
          <path d={`M-220 0 C-160 -60 -100 60 -40 0 C0 -40 40 -30 70 -20`} stroke="#3f9a52" strokeWidth={44} fill="none" strokeLinecap="round" />
          <ellipse cx={90} cy={-24} rx={56} ry={34} fill="#3f9a52" />
          <circle cx={110} cy={-34} r={7} fill="#fff" /><circle cx={112} cy={-34} r={3} fill="#111" />
          <path d={`M140 -16 q20 ${Math.sin(frame / 3) * 10} 36 0`} stroke="#c8443a" strokeWidth={5} fill="none" />
        </g>
      ) : null}
      {/* plain staff again */}
      <g opacity={back} transform={`translate(${sx} 840) rotate(-12)`}>
        <rect x={-180} y={-14} width={360} height={28} rx={14} fill="#8a6240" />
        <path d="M170 -14 q30 -30 10 -50" stroke="#8a6240" strokeWidth={22} fill="none" strokeLinecap="round" />
      </g>
      <text x={960} y={160} textAnchor="middle" fontSize={56} fontWeight={700} fill="#1f3b57">Чыныгы керемет — Аллахтан</text>
    </g>
  );
};

const SeaCrown: React.FC<P> = ({ frame, t }) => {
  const sink = easeInOut(t) * 360;
  return (
    <g>
      <rect width={1920} height={1080} fill="#a9d7f0" />
      <Sun x={1600} y={200} frame={frame} />
      <Cloud x={400} y={200} frame={frame} />
      <g transform={`translate(960 ${640 + sink}) rotate(${Math.sin(frame / 15) * 6})`}>
        <path d="M-110 60 L-120 -70 L-55 -10 L0 -90 L55 -10 L120 -70 L110 60 Z" fill="#e3b53a" /><rect x={-110} y={60} width={220} height={36} fill="#c9981f" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M-200 ${660 + i * 110} ${Array.from({ length: 12 }).map((_, k) => `q90 ${-50 + Math.sin(frame / 10 + k + i) * 14} 180 0`).join(" ")} L2200 1080 L-200 1080 Z`} fill={["#4f9fd8", "#3f8fc8", "#2f7fb8", "#1f6fa8"][i]} />
      ))}
    </g>
  );
};

const Room: React.FC<{ frame: number; night?: boolean; dawn?: number; children?: React.ReactNode }> = ({ frame, night, dawn = 0, children }) => (
  <g>
    <rect width={1920} height={1080} fill={night ? "#2a2f45" : "#f5ead7"} />
    <rect y={800} width={1920} height={280} fill={night ? "#3b3550" : "#c99c6e"} />
    {/* window */}
    <rect x={1240} y={160} width={460} height={420} rx={14} fill="#8a6240" />
    <rect x={1262} y={182} width={416} height={376} fill={night ? "#0f1b3d" : dawn ? `rgb(${255}, ${160 + dawn * 60}, ${90 + dawn * 120})` : SKY} />
    {night ? Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={1280 + noise(i) * 380} cy={200 + noise(i + 9) * 340} r={2} fill="#fff" />) : <circle cx={1360} cy={400 - dawn * 160} r={54} fill="#ffd34d" />}
    <rect x={1465} y={182} width={10} height={376} fill="#8a6240" /><rect x={1262} y={365} width={416} height={10} fill="#8a6240" />
    {/* shelf with books */}
    <rect x={200} y={240} width={520} height={22} fill="#8a6240" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={220 + i * 68} y={150 + (i % 2) * 10} width={54} height={90 - (i % 2) * 10} rx={4} fill={["#c8443a", "#2a7f5a", "#1f3b57", "#d9a21b", "#8a4fa3", "#2a7f5a", "#c8443a"][i]} />)}
    <rect x={120} y={700} width={1680} height={16} fill={night ? "#4a4463" : "#e0cfb5"} />
    {children}
  </g>
);
const KidFigure: React.FC<{ x: number; y: number; girl?: boolean; s?: number; frame: number; arm?: number; happy?: boolean; lying?: boolean }> = ({ x, y, girl, s = 1, frame, arm = 0, happy = true, lying }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) ${lying ? "rotate(-90)" : ""}`}>
    <path d="M-60 0 q60 -40 120 0 l10 130 h-140 z" fill={girl ? "#e46a8a" : "#3a7bd5"} />
    <g transform={`translate(-58 10) rotate(${arm})`}><rect x={-12} y={-6} width={24} height={100} rx={12} fill={girl ? "#e46a8a" : "#3a7bd5"} /><circle cy={98} r={13} fill="#f0c9a8" /></g>
    <g transform={`translate(58 10) rotate(${-arm})`}><rect x={-12} y={-6} width={24} height={100} rx={12} fill={girl ? "#e46a8a" : "#3a7bd5"} /><circle cy={98} r={13} fill="#f0c9a8" /></g>
    {girl ? <path d="M-60 -70 q60 -90 120 0 q10 80 -60 90 q-70 -10 -60 -90 z" fill="#fdf6e3" /> : <path d="M-52 -70 q52 -80 104 0 z" fill="#2b1d14" />}
    <ellipse cy={-60} rx={50} ry={56} fill={girl ? "#f0c9a8" : "#e4b48c"} />
    {girl ? <path d="M-48 -64 q48 -60 96 0 q-10 -28 -48 -30 q-38 2 -48 30 z" fill="#fdf6e3" /> : <path d="M-48 -72 q20 -46 56 -44 q34 2 44 36 q-20 -18 -52 -12 q-30 4 -48 20 z" fill="#2b1d14" />}
    <ellipse cx={-18} cy={-62} rx={8} ry={7 * (1 - (Math.floor(frame / 90) % 3 === 0 && frame % 90 < 5 ? 1 : 0))} fill="#fff" /><ellipse cx={18} cy={-62} rx={8} ry={7} fill="#fff" />
    <circle cx={-17} cy={-61} r={4} fill="#2b1d14" /><circle cx={19} cy={-61} r={4} fill="#2b1d14" />
    <path d={happy ? "M-14 -36 q14 14 28 0" : "M-14 -30 q14 -10 28 0"} stroke="#8a3b3b" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

const BekturRoom: React.FC<P> = ({ frame }) => (
  <Room frame={frame} night>
    <rect x={300} y={600} width={700} height={110} rx={12} fill="#6b4a2e" />
    <KidFigure x={600} y={580} frame={frame} arm={-70} happy={false} />
    <g transform={`translate(600 560) rotate(${Math.sin(frame / 20) * 2})`}><rect x={-40} y={-10} width={80} height={120} rx={10} fill="#222" /><rect x={-32} y={0} width={64} height={100} rx={6} fill="#6fd0ff" opacity={0.9} /></g>
    <rect x={800} y={560} width={120} height={40} rx={4} fill="#c8443a" /><rect x={810} y={520} width={110} height={40} rx={4} fill="#2a7f5a" />
    <text x={860} y={500} textAnchor="middle" fontSize={30} fontWeight={700} fill="#fff">китептер жабык</text>
  </Room>
);
const AizadaBed: React.FC<P> = ({ frame }) => (
  <Room frame={frame}>
    <rect x={260} y={560} width={1000} height={200} rx={24} fill="#fff" /><rect x={260} y={700} width={1000} height={90} rx={12} fill="#8a6240" />
    <rect x={320} y={520} width={880} height={160} rx={30} fill="#c6e0f5" />
    <KidFigure x={560} y={560} girl frame={frame} arm={-40} s={1.1} />
    {/* steaming cup */}
    <g transform="translate(900 560)"><path d="M-40 0 h80 l-10 70 h-60 z" fill="#f2f2f2" /><path d="M40 10 q40 0 30 40 q-10 20 -36 16" stroke="#f2f2f2" strokeWidth={10} fill="none" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-20 + i * 20} -10 q8 -20 0 -40`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6 + 0.4 * Math.sin(frame / 8 + i)} transform={`translate(0 ${-((frame * 1.5 + i * 20) % 40)})`} />)}</g>
    <Figure x={1420} y={800} h={320} color="#8a4fa3" headwear="scarf" />
    <text x={700} y={300} textAnchor="middle" fontSize={44} fontWeight={700} fill="#2a7f5a">«Алхамдулиллах»</text>
  </Room>
);
const HomeKitchen: React.FC<P> = ({ frame, t }) => {
  const x = 500 + easeInOut(Math.min(1, t * 1.3)) * 760;
  return (
    <Room frame={frame}>
      <rect x={120} y={560} width={700} height={240} fill="#d9c7a8" /><rect x={120} y={540} width={700} height={30} fill="#8a6240" />
      <rect x={200} y={420} width={160} height={120} rx={8} fill="#e8e8e8" /><rect x={400} y={440} width={240} height={100} rx={10} fill="#c9c9c9" />
      <KidFigure x={x} y={640} girl frame={frame} s={0.9} arm={-80 + Math.sin(frame / 5) * 8} />
      <g transform={`translate(${x} 560)`}><rect x={-26} y={-20} width={52} height={60} rx={6} fill="#bfe3f7" /><rect x={-26} y={-20} width={52} height={14} fill="#4f9fd8" /></g>
      <Figure x={1500} y={800} h={340} color="#7a5a9a" headwear="scarf" flip />
      <text x={960} y={200} textAnchor="middle" fontSize={48} fontWeight={700} fill="#1f3b57">Апага суу алып берүү — ибадат</text>
    </Room>
  );
};
const StreetBread: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={300} y={180} frame={frame} />
    <Cloud x={1100} y={150} frame={frame} />
    <rect y={760} width={1920} height={320} fill="#b9b2a4" />
    {[0, 1, 2, 3].map((i) => <House key={i} x={300 + i * 440} y={760} s={2.2} />)}
    <KidFigure x={760} y={840} frame={frame} s={1.1} arm={-60} />
    <Figure x={1120} y={1000} h={300} color="#7d7d7d" skin="#d8b08a" flip />
    {/* bread passes from Bektur to the man */}
    <g transform={`translate(${840 + easeInOut(t) * 200} ${830})`}><path d="M-50 0 q50 -50 100 0 l0 20 h-100 z" fill="#e2a85c" /></g>
    <g opacity={easeOut((t - 0.6) * 3)}><path d="M960 560 C920 500 860 520 880 580 C900 620 960 660 960 660 C960 660 1020 620 1040 580 C1060 520 1000 500 960 560 Z" fill="#e46a8a" /></g>
  </g>
);
const Orchard: React.FC<P> = ({ frame, t }) => {
  const season = t; // spring → autumn
  const leaf = season < 0.5 ? LEAF : `rgb(${80 + (season - 0.5) * 300}, ${154 - (season - 0.5) * 120}, 70)`;
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Sun x={1600} y={170} frame={frame} />
      <Cloud x={200} y={200} frame={frame} /><Cloud x={1000} y={120} frame={frame} s={0.7} speed={0.3} />
      <Hills y={720} color={season < 0.5 ? GRASS : "#b8b25a"} />
      {[["алмурут", "#d9c74d"], ["шабдаалы", "#f0a35c"], ["өрүк", "#f6b24a"], ["гилас", "#c8273a"], ["алма", "#d9342b"]].map(([name, fruit], i) => (
        <g key={name}>
          <Tree x={240 + i * 360} y={880} s={1.3} frame={frame} leaf={leaf} fruit={season > 0.4 ? fruit : undefined} />
          <text x={240 + i * 360} y={1000} textAnchor="middle" fontSize={40} fontWeight={700} fill="#1f3b57">{name}</text>
        </g>
      ))}
      <text x={960} y={120} textAnchor="middle" fontSize={50} fontWeight={700} fill="#1f3b57">{season < 0.5 ? "ЖАЗ" : "КҮЗ"}</text>
    </g>
  );
};
const Race: React.FC<P> = ({ frame, t }) => {
  const p = easeInOut(Math.min(1, t * 1.4));
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Sun x={1650} y={160} frame={frame} />
      <rect x={200} y={300} width={1500} height={340} rx={10} fill="#e8dcc6" /><path d="M200 300 L950 180 L1700 300 Z" fill={ROOF} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={300 + i * 290} y={380} width={120} height={120} fill="#9ad1f0" />)}
      <Hills y={760} />
      <rect y={880} width={1920} height={60} fill="#c47a4b" /><rect y={940} width={1920} height={10} fill="#fff" />
      <KidFigure x={300 + p * 1200} y={870} frame={frame} s={0.9} arm={Math.sin(frame / 3) * 40} />
      <Figure x={200 + p * 1000} y={960} h={240} color="#2a7f5a" walk={Math.sin(frame / 3)} />
      <Figure x={120 + p * 900} y={960} h={230} color="#d9a21b" walk={Math.sin(frame / 3 + 1)} />
      <g transform="translate(1660 800)"><rect x={-6} y={0} width={12} height={160} fill="#8a6240" /><path d="M6 0 L80 20 L6 40 Z" fill="#c8443a" /></g>
      {t > 0.75 ? <g transform={`translate(${1500} 700) scale(${easeOut((t - 0.75) * 4)})`}><circle r={46} fill="#f2b32a" /><path d="M-30 -40 L-18 -90 L18 -90 L30 -40" fill="#c8443a" /><text y={16} textAnchor="middle" fontSize={44} fontWeight={700} fill="#fff">1</text></g> : null}
    </g>
  );
};
const DawnRoom: React.FC<P> = ({ frame, t }) => (
  <Room frame={frame} dawn={easeInOut(t)}>
    <rect x={260} y={560} width={900} height={200} rx={24} fill="#fff" /><rect x={260} y={700} width={900} height={90} rx={12} fill="#8a6240" />
    <KidFigure x={620} y={560} frame={frame} arm={-150 + Math.sin(frame / 10) * 10} s={1.1} />
    <text x={960} y={140} textAnchor="middle" fontSize={46} fontWeight={700} fill="#1f3b57">«Бүгүн кандай жакшылык кылам?»</text>
  </Room>
);
const Neighbor: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={1600} y={160} frame={frame} />
    <Hills y={740} />
    <House x={1300} y={820} s={3.2} />
    <rect y={900} width={1920} height={180} fill="#c9b79a" />
    <KidFigure x={620} y={840} girl frame={frame} s={1.1} arm={-30} />
    <Figure x={1050} y={1000} h={320} color="#8a4fa3" headwear="scarf" flip />
    <g transform="translate(1050 700)"><path d="M-20 10 q20 16 40 0" stroke="#8a3b3b" strokeWidth={5} fill="none" strokeLinecap="round" /></g>
    {Array.from({ length: 6 }).map((_, i) => {
      const p = (t * 2 + i / 6) % 1;
      return <path key={i} d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z" fill="#f2b32a" transform={`translate(${660 + p * 330} ${760 - Math.sin(p * Math.PI) * 220}) scale(${1.4 - p})`} />;
    })}
  </g>
);
const Electrician: React.FC<P> = ({ frame, t }) => {
  const on = t > 0.7;
  return (
    <g>
      <rect width={1920} height={1080} fill={on ? "#fff4d6" : "#3a3f55"} />
      <rect y={820} width={1920} height={260} fill={on ? "#c99c6e" : "#2a2d3d"} />
      <rect x={300} y={120} width={360} height={300} rx={10} fill={on ? SKY : "#141a33"} />
      {/* ladder */}
      <path d="M1180 820 L1240 300 M1340 820 L1280 300 M1192 740 L1332 740 M1204 640 L1322 640 M1216 540 L1312 540 M1228 440 L1300 440" stroke="#8a6240" strokeWidth={14} strokeLinecap="round" />
      <Figure x={1260} y={560} h={300} color="#e7a33b" skin="#444" />
      <path d={`M1300 300 q60 -40 ${120 + Math.sin(frame / 7) * 10} 10`} stroke="#333" strokeWidth={8} fill="none" />
      <g transform="translate(960 180)">
        <path d="M0 -40 C-70 -40 -90 20 -60 60 C-40 90 -30 110 -28 140 L28 140 C30 110 40 90 60 60 C90 20 70 -40 0 -40 Z" fill={on ? "#ffd34d" : "#cfd3dd"} />
        <rect x={-26} y={140} width={52} height={40} fill="#999" />
        {on ? <circle r={140} fill="#ffd34d" opacity={0.25} /> : null}
      </g>
      <text x={960} y={1000} textAnchor="middle" fontSize={48} fontWeight={700} fill={on ? "#1f3b57" : "#fff"}>{on ? "Жарык жанды!" : "Жарык өчүп калды…"}</text>
    </g>
  );
};
const WheatField: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={300} y={170} frame={frame} />
    <Cloud x={1200} y={160} frame={frame} />
    <Hills y={700} color="#c9b24d" />
    {Array.from({ length: 7 }).map((_, i) => {
      const g = easeOut(t * 3 - i * 0.25);
      const x = 300 + i * 220;
      return (
        <g key={i} transform={`translate(${x} 980) rotate(${Math.sin(frame / 20 + i) * 3} 0 0)`}>
          <rect x={-6} y={-g * 420} width={12} height={g * 420} fill="#8a9a2a" />
          {[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx={(k % 2 ? 16 : -16)} cy={-g * 420 + k * 28} rx={14} ry={22} fill="#e2b93a" opacity={g} />)}
        </g>
      );
    })}
    <ellipse cx={960} cy={990} rx={26} ry={40} fill="#d9a21b" opacity={1 - t * 3} />
    <text x={960} y={140} textAnchor="middle" fontSize={50} fontWeight={700} fill="#1f3b57">бир дан → жети машак → жүз дан</text>
  </g>
);
const Kettle: React.FC<P> = ({ frame }) => (
  <Room frame={frame}>
    <rect x={200} y={560} width={1100} height={240} fill="#d9c7a8" /><rect x={200} y={540} width={1100} height={30} fill="#8a6240" />
    <rect x={700} y={420} width={300} height={120} rx={10} fill="#555" /><circle cx={760} cy={480} r={20} fill="#333" /><circle cx={940} cy={480} r={20} fill="#333" />
    <g transform="translate(850 420)">
      <path d="M-80 0 q0 -90 160 0 l-10 90 h-140 z" fill="#c8443a" /><path d="M80 10 q50 -30 40 40" stroke="#c8443a" strokeWidth={14} fill="none" /><rect x={-20} y={-100} width={40} height={16} fill="#333" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-30 + i * 30} -100 q10 -24 0 -48`} stroke="#eee" strokeWidth={6} fill="none" opacity={0.7} transform={`translate(0 ${-((frame * 2 + i * 15) % 45)})`} />)}
    </g>
    <text x={960} y={1000} textAnchor="middle" fontSize={52} fontWeight={700} fill="#c8443a">«Ысык чайнекке тийбе!»</text>
  </Room>
);
const WinterBirds: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#dfe9f3" />
    <Hills y={760} color="#f7fbff" />
    <House x={1400} y={760} s={3} />
    <Tree x={300} y={900} frame={frame} s={1.2} leaf="#eef4f8" />
    {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={noise(i) * 1920} cy={(noise(i + 3) * 1080 + frame * (1 + noise(i + 7))) % 1080} r={4} fill="#fff" />)}
    <KidFigure x={760} y={840} girl frame={frame} s={1.1} arm={-50} />
    {[0, 1, 2, 3, 4].map((i) => {
      const p = Math.min(1, t * 2 - i * 0.15);
      if (p <= 0) return null;
      const x = 1200 - easeInOut(p) * (300 + i * 40), y = 500 + easeInOut(p) * (420 - (i % 2) * 20) - Math.sin(p * Math.PI) * 120;
      return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={22} ry={16} fill="#7a5a3a" /><circle cx={16} cy={-10} r={10} fill="#7a5a3a" /><path d="M26 -10 l10 2 l-10 4z" fill="#e7a33b" /><path d={`M-10 -8 q-10 ${-10 + Math.sin(frame / 3 + i) * 10} -20 0`} stroke="#7a5a3a" strokeWidth={5} fill="none" /></g>;
    })}
    {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={820 + noise(i + 20) * 160} cy={950 + noise(i + 30) * 30} r={4} fill="#d9a21b" />)}
  </g>
);
const Garage: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#e9e4da" />
    <rect y={760} width={1920} height={320} fill="#9c9c9c" />
    <path d="M0 760 L0 200 L1920 200 L1920 760" fill="#cfc8ba" />
    {Array.from({ length: 12 }).map((_, i) => {
      const x = 200 + ((i * 200 + t * 400) % 2400) - 300, s = 1 - i * 0.02;
      return <g key={i} transform={`translate(${x} 700) scale(${s})`}><path d="M-100 0 L-90 -40 L-50 -70 L50 -70 L90 -40 L100 0 Z" fill={["#c8443a", "#1f3b57", "#2a7f5a", "#d9a21b"][i % 4]} /><circle cx={-55} cy={0} r={18} fill="#222" /><circle cx={55} cy={0} r={18} fill="#222" /></g>;
    })}
    <text x={960} y={140} textAnchor="middle" fontSize={54} fontWeight={700} fill="#1f3b57">Машиналардын аягы жок… «Бул меники!»</text>
  </g>
);
const BrightPath: React.FC<P> = ({ frame, t }) => {
  const p = easeInOut(t);
  return (
    <g>
      <rect width={1920} height={1080} fill="#fff6dc" />
      <Sun x={1500} y={240} r={90} frame={frame} />
      <path d="M0 720 Q400 540 800 700 T1920 620 L1920 1080 L0 1080 Z" fill="#9bcf8a" />
      <path d="M0 1080 C400 900 500 760 1000 720 S1500 640 1920 560 L1920 700 C1500 760 1300 820 1000 880 S500 1000 0 1080 Z" fill="#ffe9a8" />
      {[1500, 1650, 1800].map((x, i) => <Tree key={i} x={x} y={620 + i * 10} s={1} frame={frame} fruit="#d9342b" />)}
      <Figure x={200 + p * 1300} y={1020 - p * 420} h={260 - p * 80} color="#2a7f5a" headwear="cap" walk={Math.sin(frame / 5)} />
    </g>
  );
};
const Oven: React.FC<P> = ({ frame, t }) => {
  const inOven = t > 0.3 && t < 0.7;
  const baked = t >= 0.7;
  return (
    <Room frame={frame}>
      <rect x={560} y={360} width={800} height={440} rx={16} fill="#555" />
      <rect x={640} y={440} width={640} height={280} rx={10} fill={inOven ? "#ff9f3b" : "#222"} />
      {inOven ? [0, 1, 2, 3].map((i) => <path key={i} d={`M${700 + i * 150} 720 q30 -${60 + Math.sin(frame / 3 + i) * 30} 60 0 z`} fill="#ffcd3b" />) : null}
      <g transform={`translate(${t < 0.3 ? 400 + t * 1800 : baked ? 960 + (t - 0.7) * 1400 : 960} ${t < 0.3 || baked ? 760 : 620})`}>
        <path d="M-90 0 q90 -90 180 0 l0 30 h-180 z" fill={baked ? "#d9892f" : "#f6e9d2"} />
        {baked ? [0, 1, 2].map((i) => <path key={i} d={`M${-50 + i * 50} -40 q10 -20 0 -40`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6} transform={`translate(0 ${-((frame * 1.5 + i * 15) % 40)})`} />) : null}
      </g>
      <text x={960} y={200} textAnchor="middle" fontSize={50} fontWeight={700} fill="#1f3b57">{t < 0.3 ? "камыр" : baked ? "бышкан нан!" : "мештин ичинде…"}</text>
    </Room>
  );
};

// ---- lessons 006 / 007 (Studio VID-003) -------------------------------------------------------------------------
// Hot summer road: the air above the asphalt shimmers (the ustaz's image for things our eyes cannot catch).
const Mirage: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#ffe7b0" />
    <Sun x={1600} y={170} r={95} frame={frame} />
    <Hills y={560} color="#c9b46a" />
    <path d="M760 560 L1160 560 L1920 1080 L0 1080 Z" fill="#5d5f66" />
    {[0, 1, 2, 3, 4].map((i) => { const y = 600 + ((i * 110 + frame * 3) % 520); const w = 8 + (y - 560) * 0.05; return <rect key={i} x={960 - w / 2} y={y} width={w} height={36 + (y - 560) * 0.08} fill="#f2f2f2" />; })}
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M${700 - i * 40} ${600 + i * 14} q 60 ${-10 - 8 * Math.sin(frame / 6 + i)} 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}
        stroke="#dff3ff" strokeWidth={6} fill="none" opacity={0.25 + 0.25 * Math.sin(frame / 7 + i)} />
    ))}
    <rect x={720} y={590} width={480} height={60} fill="#bfe3f7" opacity={0.25 + 0.15 * Math.sin(frame / 9)} />
    <text x={960} y={110} textAnchor="middle" fontSize={50} fontWeight={700} fill="#8a6240" opacity={easeOut(t * 3)}>көзгө илинбеген нерселер да бар</text>
  </g>
);
// Small class of 15 vs a hall of 1500 — every head raises a question mark.
const Hall: React.FC<P> = ({ frame, t }) => {
  const big = easeInOut(Math.max(0, Math.min(1, (t - 0.35) * 2.5)));
  const n = big > 0 ? 300 : 15;
  return (
    <g>
      <rect width={1920} height={1080} fill={big > 0 ? "#e9dcc2" : "#f5ead7"} />
      <rect x={160} y={80} width={1600} height={170} rx={14} fill="#8a6240" opacity={0.25} />
      <text x={960} y={190} textAnchor="middle" fontSize={64} fontWeight={700} fill="#1f3b57">{big > 0 ? "1500 адам → көп суроо" : "15 адам → 10 суроо"}</text>
      {Array.from({ length: n }).map((_, i) => {
        const cols = big > 0 ? 30 : 5, sx = big > 0 ? 58 : 230, sy = big > 0 ? 70 : 170;
        const x = 960 - ((cols - 1) * sx) / 2 + (i % cols) * sx, y = (big > 0 ? 330 : 420) + Math.floor(i / cols) * sy;
        const s = big > 0 ? 0.32 : 1;
        const q = (Math.sin(frame / 10 + i * 1.7) + 1) / 2;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={big > 0 ? big : 1 - Math.min(1, (t - 0.3) * 6)}>
            <circle cy={-40} r={34} fill={["#e4b48c", "#f0c9a8", "#d8a57c"][i % 3]} /><path d="M-50 40 q50 -60 100 0 v40 h-100 z" fill={["#3a7bd5", "#e46a8a", "#2a7f5a", "#d9a21b"][i % 4]} />
            <text y={-90 - q * 14} textAnchor="middle" fontSize={56} fontWeight={700} fill="#c8443a" opacity={0.4 + q * 0.6}>?</text>
          </g>
        );
      })}
    </g>
  );
};
// Sun, moon and planets, each swimming in its own orbit (Анбия, 33).
const Orbits: React.FC<P> = ({ frame }) => (
  <g>
    <rect width={1920} height={1080} fill={NIGHT} />
    {Array.from({ length: 90 }).map((_, i) => <circle key={i} cx={noise(i) * 1920} cy={noise(i + 50) * 1080} r={1 + noise(i + 7) * 2} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(frame / 30 + i))} />)}
    <g transform="translate(960 520)">
      {[170, 260, 360, 470].map((r, i) => <ellipse key={r} rx={r} ry={r * 0.42} fill="none" stroke="#5f7fb8" strokeWidth={2} strokeDasharray="6 10" />)}
      <circle r={78} fill="#ffd34d" /><circle r={110} fill="#ffe08a" opacity={0.25} />
      {[170, 260, 360, 470].map((r, i) => { const a = frame / (40 + i * 25) + i * 1.3; return <circle key={r} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.42} r={[16, 22, 26, 34][i]} fill={["#c97b4a", "#e3b26c", "#4f9fd8", "#d9a25b"][i]} />; })}
      {(() => { const a = frame / 40 + 1.3, ex = Math.cos(a) * 360, ey = Math.sin(a) * 360 * 0.42, b = frame / 9; return <circle cx={ex + Math.cos(b) * 52} cy={ey + Math.sin(b) * 22} r={9} fill="#eeeeee" />; })()}
    </g>
    <text x={960} y={90} textAnchor="middle" fontSize={48} fontWeight={700} fill="#ffe08a">«Ай да, күн да өз орбитасында сүзүп жүрөт»</text>
  </g>
);
// Taif: a small town between two mountains; a soft light in the sky (no angel is depicted).
const Taif: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#f6d9a8" />
    <circle cx={960} cy={220} r={160 + 20 * Math.sin(frame / 25)} fill="#fff7de" opacity={0.6 * easeOut(t * 2)} />
    <path d="M0 1080 L0 420 L520 140 L860 700 L860 1080 Z" fill="#a9876a" /><path d="M1920 1080 L1920 420 L1400 140 L1060 700 L1060 1080 Z" fill="#a9876a" />
    <path d="M0 1080 L0 560 L420 300 L780 760 L780 1080 Z" fill="#8f6f55" /><path d="M1920 1080 L1920 560 L1500 300 L1140 760 L1140 1080 Z" fill="#8f6f55" />
    {[0, 1, 2, 3, 4, 5].map((i) => <g key={i} transform={`translate(${820 + (i % 3) * 120} ${840 + Math.floor(i / 3) * 90})`}><rect x={-45} y={-60} width={90} height={60} fill="#efe0c4" /><rect x={-12} y={-34} width={24} height={34} fill="#8a6240" /></g>)}
    {[0, 1, 2].map((i) => <path key={i} d={`M${860 + i * 90} 760 q10 -40 0 -80`} stroke="#5f8f4a" strokeWidth={10} fill="none" />)}
    <path d="M760 1080 C820 980 900 960 960 940" stroke="#d9c7a8" strokeWidth={30} fill="none" />
    <text x={960} y={120} textAnchor="middle" fontSize={50} fontWeight={700} fill="#1f3b57">Таиф</text>
  </g>
);
// Mecca: a town in the valley, then a big heart — forgiveness (no people).
const Mecca: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#fbe8c8" />
    <Sun x={1650} y={180} frame={frame} />
    <path d="M0 760 L300 420 L640 760 L980 380 L1360 760 L1700 460 L1920 700 L1920 1080 L0 1080 Z" fill="#b98f6a" />
    <rect y={820} width={1920} height={260} fill="#e9d3ad" />
    {Array.from({ length: 12 }).map((_, i) => <g key={i} transform={`translate(${180 + i * 140} ${860 + (i % 2) * 30})`}><rect x={-50} y={-70} width={100} height={70} fill="#f6ead2" /><rect x={-14} y={-40} width={28} height={40} fill="#8a6240" /></g>)}
    <g transform={`translate(960 ${520 - easeOut(t * 2) * 60}) scale(${easeOut((t - 0.25) * 2.5) * (1 + 0.04 * Math.sin(frame / 8))})`}>
      <path d="M0 60 C-110 -20 -150 -110 -80 -150 C-40 -170 -10 -150 0 -120 C10 -150 40 -170 80 -150 C150 -110 110 -20 0 60 Z" fill="#e46a8a" />
    </g>
    <text x={960} y={760} textAnchor="middle" fontSize={56} fontWeight={700} fill="#1f3b57" opacity={easeOut((t - 0.35) * 3)}>КЕЧИРИМ</text>
  </g>
);
// Sadaqa jariya: a school, a mosque, a bridge and a tree appear; little figures use them.
const Sadaqa: React.FC<P> = ({ frame, t }) => {
  const a = (i: number) => easeOut(t * 5 - i * 0.9);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Sun x={1700} y={150} frame={frame} /><Cloud x={400} y={140} frame={frame} />
      <Hills y={700} />
      <path d="M0 960 C500 900 1200 1000 1920 930 L1920 1080 L0 1080 Z" fill={WATER} />
      <g opacity={a(0)} transform={`translate(330 ${760 + (1 - a(0)) * 40})`}><rect x={-160} y={-170} width={320} height={170} fill="#f3e7d3" /><path d="M-180 -170 L0 -260 L180 -170 Z" fill={ROOF} />{[-100, 0, 100].map((x) => <rect key={x} x={x - 25} y={-130} width={50} height={50} fill="#9ad1f0" />)}<text y={-200} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fff">мектеп</text></g>
      <g opacity={a(1)} transform={`translate(780 ${760 + (1 - a(1)) * 40})`}><rect x={-120} y={-160} width={240} height={160} fill="#fdfaf2" /><path d="M-90 -160 Q0 -290 90 -160 Z" fill="#2a7f5a" /><rect x={140} y={-300} width={34} height={300} fill="#fdfaf2" /><path d="M140 -300 L157 -340 L174 -300 Z" fill="#2a7f5a" /><path d="M-24 0 v-70 q24 -30 48 0 v70 z" fill="#8a6240" /></g>
      <g opacity={a(2)}><path d="M1050 940 Q1290 820 1530 940" stroke="#8a6240" strokeWidth={26} fill="none" />{[1110, 1200, 1290, 1380, 1470].map((x) => <rect key={x} x={x - 6} y={870 - Math.abs(x - 1290) * 0.35} width={12} height={70} fill="#8a6240" />)}</g>
      <g opacity={a(3)}><Tree x={1700} y={820} s={1.4} frame={frame} fruit="#d9342b" /></g>
      {t > 0.7 ? [0, 1, 2].map((i) => <Figure key={i} x={((frame * 2 + i * 300) % 1700) + 100} y={1000} h={150} color={["#3a7bd5", "#e46a8a", "#2a7f5a"][i]} walk={Math.sin(frame / 5 + i)} />) : null}
      <text x={960} y={120} textAnchor="middle" fontSize={56} fontWeight={700} fill="#1f3b57">САДАКА ЖАРИЯ — сообу токтобойт</text>
    </g>
  );
};
// Phone battery draining to 5 %, then the charger plugs in and it fills to 100 %.
const Battery: React.FC<P> = ({ frame, t }) => {
  const charge = t < 0.45 ? 1 - easeInOut(t / 0.45) * 0.95 : 0.05 + easeInOut((t - 0.55) / 0.45) * 0.95;
  const plugged = t >= 0.5;
  const col = charge < 0.2 ? "#c8443a" : charge < 0.5 ? "#d9a21b" : "#2a7f5a";
  return (
    <g>
      <rect width={1920} height={1080} fill="#eef4f8" />
      <rect x={760} y={170} width={400} height={740} rx={60} fill="#222" /><rect x={790} y={220} width={340} height={640} rx={26} fill="#0f1b3d" />
      <rect x={860} y={330} width={200} height={400} rx={18} fill="none" stroke="#fff" strokeWidth={10} /><rect x={920} y={300} width={80} height={30} rx={6} fill="#fff" />
      <rect x={872} y={342 + 376 * (1 - charge)} width={176} height={376 * charge} rx={10} fill={col} />
      <text x={960} y={810} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff">{Math.round(charge * 100)}%</text>
      {plugged ? <g opacity={easeOut((t - 0.5) * 6)}><path d={`M960 1080 L960 ${930 + 10 * Math.sin(frame / 6)}`} stroke="#555" strokeWidth={18} /><rect x={930} y={900} width={60} height={50} rx={8} fill="#777" />
        <path d="M990 480 L940 560 L975 560 L930 640 L1010 540 L970 540 Z" fill="#ffd34d" opacity={0.6 + 0.4 * Math.sin(frame / 4)} /></g> : null}
      <text x={420} y={540} textAnchor="middle" fontSize={50} fontWeight={700} fill="#1f3b57">ЫЙМАН</text>
      {plugged ? ["илим", "намаз", "зикир", "Куран"].map((w, i) => <text key={w} x={1480} y={380 + i * 110} textAnchor="middle" fontSize={50} fontWeight={700} fill="#2a7f5a" opacity={easeOut((t - 0.55) * 8 - i)}>{w} ⚡</text>) : null}
    </g>
  );
};
// A chess board whose pieces move by themselves — grandmasters see many moves ahead.
const Chess: React.FC<P> = ({ frame, t }) => {
  const sq = 96, ox = 576, oy = 150;
  const knight = { x: 1 + Math.min(2, Math.floor(t * 6)) , y: 7 - Math.min(2, Math.floor(t * 6)) * 2 };
  return (
    <g>
      <rect width={1920} height={1080} fill="#3c2f26" />
      {Array.from({ length: 64 }).map((_, i) => <rect key={i} x={ox + (i % 8) * sq} y={oy + Math.floor(i / 8) * sq} width={sq} height={sq} fill={(i + Math.floor(i / 8)) % 2 ? "#a57a52" : "#f0d9b5"} />)}
      {[[0, 0], [7, 0], [3, 0], [4, 0]].map(([x, y], i) => <circle key={i} cx={ox + x * sq + 50} cy={oy + y * sq + 50} r={32} fill="#222" />)}
      {[[0, 7], [7, 7], [4, 7]].map(([x, y], i) => <circle key={i} cx={ox + x * sq + 50} cy={oy + y * sq + 50} r={32} fill="#fafafa" stroke="#999" strokeWidth={3} />)}
      <g transform={`translate(${ox + knight.x * sq + 50} ${oy + knight.y * sq + 50})`}><path d="M-26 34 h52 v-12 h-8 c4 -30 -6 -54 -30 -60 l-14 10 l4 10 l-14 12 l8 10 l14 -8 c-4 10 -10 20 -12 28 h-8 z" fill="#fafafa" stroke="#555" strokeWidth={3} /></g>
      {[0, 1, 2].map((i) => <path key={i} d={`M${ox + 150 + i * 200} ${oy + 650 - i * 200} q 80 -60 ${120} -${160}`} stroke="#ffd34d" strokeWidth={5} strokeDasharray="10 10" fill="none" opacity={0.5 + 0.5 * Math.sin(frame / 6 + i)} />)}
      <text x={960} y={95} textAnchor="middle" fontSize={46} fontWeight={700} fill="#ffe08a">гроссмейстер көп жүрүштү алдын ала көрөт</text>
    </g>
  );
};
// A baby on a rug examines a toy by tasting it — learning starts from the first days.
const Baby: React.FC<P> = ({ frame }) => (
  <Room frame={frame}>
    <ellipse cx={760} cy={840} rx={420} ry={90} fill="#c8443a" opacity={0.85} /><ellipse cx={760} cy={840} rx={360} ry={70} fill="none" stroke="#f2b32a" strokeWidth={8} />
    <g transform="translate(760 720)">
      <ellipse cy={80} rx={110} ry={80} fill="#fdf6e3" />
      <circle cy={-40} r={78} fill="#f0c9a8" /><path d="M-60 -80 q60 -50 120 0" fill="#7a4f2a" />
      <circle cx={-26} cy={-46} r={7} fill="#2b1d14" /><circle cx={26} cy={-46} r={7} fill="#2b1d14" />
      <g transform={`translate(0 ${-10 + Math.sin(frame / 6) * 6})`}><rect x={-36} y={-20} width={72} height={40} rx={20} fill="#3a7bd5" /><circle cx={-36} r={22} fill="#d9a21b" /><circle cx={36} r={22} fill="#2a7f5a" /></g>
      <path d="M-90 40 q-40 -40 -30 -80" stroke="#f0c9a8" strokeWidth={30} fill="none" strokeLinecap="round" /><path d="M90 40 q40 -40 30 -80" stroke="#f0c9a8" strokeWidth={30} fill="none" strokeLinecap="round" />
    </g>
    <text x={760} y={480} textAnchor="middle" fontSize={64} fontWeight={700} fill="#c8443a">«Бул эмне экен?»</text>
  </Room>
);
// Four holy books on a shelf light up one by one (no people).
const Books: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#f5ead7" />
    <rect x={260} y={700} width={1400} height={34} fill="#8a6240" /><rect x={260} y={734} width={1400} height={20} fill="#6b4a2e" />
    {["Тоорат", "Забур", "Инжил", "Куран"].map((name, i) => {
      const on = easeOut(t * 5 - i);
      return (
        <g key={name} transform={`translate(${420 + i * 360} 700)`}>
          <circle cy={-200} r={170} fill="#ffe08a" opacity={0.35 * on * (0.8 + 0.2 * Math.sin(frame / 9 + i))} />
          <rect x={-90} y={-380} width={180} height={380} rx={14} fill={["#8a4fa3", "#1f3b57", "#c8443a", "#2a7f5a"][i]} />
          <rect x={-70} y={-340} width={140} height={10} fill="#f2b32a" /><rect x={-70} y={-40} width={140} height={10} fill="#f2b32a" />
          <text y={70} textAnchor="middle" fontSize={50} fontWeight={700} fill="#1f3b57" opacity={0.3 + 0.7 * on}>{name}</text>
        </g>
      );
    })}
    <text x={960} y={180} textAnchor="middle" fontSize={56} fontWeight={700} fill="#1f3b57">Төрт ыйык китеп</text>
  </g>
);
// Bektur pats his old bicycle and smiles — contentment (канаат).
const Bike: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={1650} y={170} frame={frame} /><Cloud x={300} y={150} frame={frame} />
    <rect y={760} width={1920} height={320} fill={GRASS} />
    <g transform="translate(1060 780)">
      {[-170, 170].map((x) => <g key={x} transform={`translate(${x} 0) rotate(${frame * 0.5})`}><circle r={110} fill="none" stroke="#333" strokeWidth={14} />{[0, 60, 120].map((a) => <line key={a} x1={-100} x2={100} transform={`rotate(${a})`} stroke="#999" strokeWidth={4} />)}</g>)}
      <path d="M-170 0 L-40 -150 L130 -150 L170 0 M-40 -150 L20 0 L130 -150 M120 -180 L150 -230 M-60 -170 h60" stroke="#2a7f5a" strokeWidth={14} fill="none" strokeLinecap="round" />
    </g>
    <KidFigure x={700} y={700} frame={frame} arm={-60 + Math.sin(frame / 8) * 15} />
    <text x={960} y={260} textAnchor="middle" fontSize={60} fontWeight={700} fill="#2a7f5a" opacity={easeOut(t * 3)}>«Меники да жакшы! Алхамдулиллах!»</text>
  </g>
);
// Birds beat both wings and climb into the sky — two kinds of knowledge (захир + батын).
const Wings: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY_DEEP} />
    <Sun x={1600} y={180} frame={frame} /><Cloud x={500} y={260} frame={frame} speed={0.8} /><Cloud x={1300} y={420} s={0.8} frame={frame} speed={0.6} />
    <Mountains y={760} />
    {[0, 1, 2].map((i) => {
      const x = 300 + i * 420 + t * 500, y = 760 - t * 420 - i * 60, w = Math.sin(frame / 4 + i) * 40;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${1.6 - i * 0.3})`}>
          <path d={`M0 0 C-40 ${-30 - w} -90 ${-20 - w} -120 ${10 - w * 0.6} C-80 0 -40 10 0 10 Z`} fill="#fff" />
          <path d={`M0 0 C40 ${-30 - w} 90 ${-20 - w} 120 ${10 - w * 0.6} C80 0 40 10 0 10 Z`} fill="#fff" />
          <ellipse cx={0} cy={6} rx={22} ry={14} fill="#f2f2f2" /><path d="M20 4 l14 4 l-14 4 z" fill="#f2b32a" />
        </g>
      );
    })}
    <text x={480} y={110} textAnchor="middle" fontSize={54} fontWeight={700} fill="#fff">захир илим</text>
    <text x={1440} y={110} textAnchor="middle" fontSize={54} fontWeight={700} fill="#fff">батын илим</text>
  </g>
);
// A child reflects on a hill under the open sky (тафаккур).
const HillThink: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={t < 0.5 ? SKY : "#253a6b"} />
    {t >= 0.5 ? Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={noise(i) * 1920} cy={noise(i + 30) * 620} r={1.5 + noise(i + 3) * 2} fill="#fff" opacity={easeOut((t - 0.5) * 4) * (0.5 + 0.5 * Math.sin(frame / 20 + i))} />) : <Sun x={1500} y={200} frame={frame} />}
    <Mountains y={600} />
    <path d="M0 1080 L0 860 Q600 700 1200 860 T1920 900 L1920 1080 Z" fill={t < 0.5 ? GRASS : "#2f5a3a"} />
    <KidFigure x={760} y={790} frame={frame} s={0.9} />
    <text x={760} y={600} textAnchor="middle" fontSize={64} fontWeight={700} fill={t < 0.5 ? "#1f3b57" : "#ffe08a"}>{t < 0.5 ? "ойлонуу…" : "Субханаллах!"}</text>
  </g>
);

// ---- lessons 008 / 009 (Studio VID-004) ----
const Stars: React.FC<{ frame: number; n?: number; h?: number }> = ({ frame, n = 90, h = 1080 }) => (
  <g>{Array.from({ length: n }).map((_, i) => <circle key={i} cx={noise(i + 11) * 1920} cy={noise(i + 61) * h} r={1 + noise(i + 7) * 2.4} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(frame / 25 + i))} />)}</g>
);
const Caption89: React.FC<{ y?: number; text: string; color?: string; o?: number; size?: number }> = ({ y = 130, text, color = "#1f3b57", o = 1, size = 58 }) => (
  <text x={960} y={y} textAnchor="middle" fontSize={size} fontWeight={700} fill={color} opacity={o} stroke="rgba(255,255,255,0.55)" strokeWidth={color === "#fff" || color === "#ffe08a" ? 0 : 6} paintOrder="stroke">{text}</text>
);
// A junkyard in a storm: scrap flies up and falls back as scrap — no aeroplane appears by itself.
const JunkStorm: React.FC<P> = ({ frame, t }) => {
  const storm = Math.sin(Math.min(1, t * 1.25) * Math.PI);
  return (
    <g>
      <rect width={1920} height={1080} fill={Kaz(storm, 0, 1) > 0.5 ? "#8e9aa8" : SKY} />
      <rect width={1920} height={1080} fill="#5d6b7a" opacity={storm * 0.6} />
      <Cloud x={300} y={160} frame={frame} speed={1 + storm * 6} /><Cloud x={1300} y={240} s={1.2} frame={frame} speed={1 + storm * 5} />
      <path d="M0 860 Q500 800 960 840 T1920 830 L1920 1080 L0 1080 Z" fill="#a08f78" />
      <path d="M520 860 Q760 700 1000 760 Q1240 690 1420 860 Z" fill="#7c6f60" />
      {Array.from({ length: 26 }).map((_, i) => {
        const a = frame / (12 + (i % 5)) + i;
        const lift = storm * (120 + noise(i + 3) * 360);
        const x = 560 + noise(i) * 820 + Math.cos(a) * storm * 160, y = 800 - lift + Math.sin(a) * storm * 60;
        const kind = i % 4;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${a * 40 * storm + i * 30})`}>
            {kind === 0 ? <rect x={-30} y={-10} width={60} height={20} fill="#6b6f75" /> : kind === 1 ? <circle r={22} fill="none" stroke="#5a4b3a" strokeWidth={8} />
              : kind === 2 ? <path d="M-40 0 q20 -30 40 0 t40 0" stroke="#b46a2e" strokeWidth={6} fill="none" /> : <rect x={-18} y={-26} width={36} height={52} rx={6} fill="#9aa3ad" />}
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${((frame * 18 + i * 500) % 2400) - 300} ${300 + i * 120} q120 -40 240 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={storm * 0.7} />)}
      <Caption89 text={t < 0.75 ? "бороон…" : "самолет пайда болдубу? ЖОК!"} o={t < 0.75 ? storm : easeOut((t - 0.75) * 6)} color={t < 0.75 ? "#fff" : "#c8443a"} />
    </g>
  );
};
// The heart keeps beating while the child sleeps; cells glow.
const HeartBody: React.FC<P> = ({ frame, t }) => {
  const beat = 1 + 0.08 * Math.max(0, Math.sin(frame / 4.5)) ** 8 * 4;
  return (
    <g>
      <rect width={1920} height={1080} fill="#1f2d4d" />
      <Stars frame={frame} n={40} h={500} />
      <rect x={260} y={640} width={720} height={70} rx={20} fill="#8a6240" /><rect x={260} y={600} width={700} height={60} rx={24} fill="#e9eef6" />
      <ellipse cx={330} cy={590} rx={80} ry={40} fill="#fff" />
      <g transform="translate(520 560)"><path d="M-160 20 q160 -60 420 0 l0 40 h-420 z" fill="#3a7bd5" /><ellipse cx={-200} cy={10} rx={58} ry={52} fill="#e4b48c" /><path d="M-250 -10 q50 -60 100 0 z" fill="#2b1d14" /><text x={-130} y={-80} fontSize={44} fill="#cfe0ff">z z z</text></g>
      <g transform={`translate(1380 520) scale(${beat * 2.2})`}><path d="M0 60 C-110 -20 -150 -110 -80 -150 C-40 -170 -10 -150 0 -120 C10 -150 40 -170 80 -150 C150 -110 110 -20 0 60 Z" fill="#e0475b" /></g>
      <path d={`M1080 860 h120 l30 -60 l40 120 l30 -60 h${Math.min(1, t * 2) * 300}`} stroke="#6fe08a" strokeWidth={8} fill="none" />
      {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={1180 + noise(i) * 400} cy={280 + noise(i + 5) * 480} r={14 + noise(i + 9) * 12} fill="#ffb3c1" opacity={0.35 + 0.3 * Math.sin(frame / 9 + i)} />)}
      <Caption89 y={120} text="жүрөк — тыным албайт" color="#ffe08a" />
    </g>
  );
};
// A phone whose programs appear one by one.
const PhoneApps: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#eef4f8" />
    <rect x={720} y={110} width={480} height={880} rx={60} fill="#222" /><rect x={750} y={170} width={420} height={760} rx={24} fill="#0f1b3d" />
    {Array.from({ length: 16 }).map((_, i) => {
      const a = easeOut(t * 5 - i * 0.22);
      const cols = ["#e46a8a", "#3a7bd5", "#2a7f5a", "#d9a21b", "#8a4fa3", "#c8443a", "#4aa3df", "#f08a3c"];
      return <rect key={i} x={785 + (i % 4) * 98} y={220 + Math.floor(i / 4) * 140} width={74} height={74} rx={18} fill={cols[i % 8]} opacity={a} transform={`translate(0 ${(1 - a) * 30})`} />;
    })}
    <text x={360} y={470} textAnchor="middle" fontSize={54} fontWeight={700} fill="#1f3b57">программалар</text>
    <text x={360} y={550} textAnchor="middle" fontSize={44} fill="#1f3b57">ким жазган?</text>
    <text x={1560} y={500} textAnchor="middle" fontSize={64} fontWeight={700} fill="#2a7f5a" opacity={easeOut((t - 0.6) * 4)}>уста бар!</text>
  </g>
);
// Earth near the Sun burns, far away freezes, in its place — life.
const EarthSun: React.FC<P> = ({ frame, t }) => {
  const d = t < 0.3 ? Kaz(t / 0.3, 0, -1) : t < 0.6 ? Kaz((t - 0.3) / 0.3, -1, 1) : Kaz((t - 0.6) / 0.25, 1, 0);
  const x = 1100 + d * 380;
  const hot = Math.max(0, -d), cold = Math.max(0, d);
  return (
    <g>
      <rect width={1920} height={1080} fill={NIGHT} />
      <Stars frame={frame} />
      <circle cx={180} cy={540} r={330} fill="#ffb13b" opacity={0.3} /><circle cx={180} cy={540} r={270} fill="#ffd34d" />
      <ellipse cx={180} cy={540} rx={1300} ry={300} fill="none" stroke="#5f7fb8" strokeWidth={2} strokeDasharray="8 12" />
      <g transform={`translate(${x} 540)`}>
        <circle r={120} fill="#3d8fd6" />
        <path d="M-90 -30 q40 -50 90 -20 q30 30 0 70 q-50 30 -90 -10 z" fill="#5fb55a" /><path d="M30 -100 q50 10 60 50 q-20 30 -50 10 z" fill="#5fb55a" />
        <circle r={120} fill="#e0472b" opacity={hot * 0.75} /><circle r={120} fill="#eaf6ff" opacity={cold * 0.85} />
      </g>
      <Caption89 y={150} color="#fff" text={hot > 0.5 ? "жакын — күйүп кетет" : cold > 0.5 ? "алыс — тоңуп калат" : "дал ушул жерде — жашоо бар ✓"} />
    </g>
  );
};
// Mecca at night: the Kaaba under the stars (no idols, no people's faces).
const KaabaNight: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#14234a" />
    <Stars frame={frame} n={110} h={620} />
    <circle cx={1580} cy={180} r={60} fill="#fff6d0" /><circle cx={1605} cy={165} r={56} fill="#14234a" />
    <path d="M0 720 L260 460 L520 720 L860 420 L1200 720 L1520 480 L1920 700 L1920 1080 L0 1080 Z" fill="#2b3557" />
    <rect y={800} width={1920} height={280} fill="#3a3f5a" />
    <ellipse cx={960} cy={900} rx={700} ry={110} fill="#c9c3b5" />
    <g transform={`translate(960 ${880 - easeOut(t * 3) * 10})`}>
      <path d="M-170 0 L-170 -300 L150 -320 L210 -290 L210 20 L150 30 Z" fill="#111" />
      <path d="M150 -320 L210 -290 L210 20 L150 30 Z" fill="#000" />
      <path d="M-170 -230 L150 -248 L210 -222 L210 -200 L150 -226 L-170 -208 Z" fill="#d4a93a" />
      <rect x={-40} y={-120} width={70} height={110} fill="#c9981f" />
    </g>
    {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={260 + i * 200} cy={760} r={6} fill="#ffe08a" opacity={0.5 + 0.5 * Math.sin(frame / 12 + i)} />)}
    <Caption89 y={130} color="#ffe08a" text="Мекке · Кааба" o={easeOut(t * 4)} />
  </g>
);
// Hot desert, a heavy stone on the sand; the words «Ахад! Ахад!» rise (Bilal himself is not drawn).
const DesertStone: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#ffe2a8" />
    <circle cx={1500} cy={200} r={170} fill="#ffcf4d" opacity={0.5 + 0.1 * Math.sin(frame / 6)} /><circle cx={1500} cy={200} r={120} fill="#ffb92e" />
    {[0, 1, 2].map((i) => <path key={i} d={`M0 ${560 + i * 30} ${Array.from({ length: 12 }).map((_, k) => `q80 ${Math.sin(frame / 8 + k + i) * 8} 160 0`).join(" ")}`} stroke="#fff3d6" strokeWidth={4} fill="none" opacity={0.6} />)}
    <path d="M0 700 Q480 620 960 690 T1920 670 L1920 1080 L0 1080 Z" fill="#e8b96a" />
    <path d="M0 820 Q600 760 1200 830 T1920 800 L1920 1080 L0 1080 Z" fill="#d9a554" />
    <g transform="translate(860 860)"><path d="M-230 30 Q-260 -110 -120 -170 Q40 -220 170 -150 Q260 -80 220 30 Z" fill="#8c8478" /><path d="M-150 -120 q60 -40 140 -20" stroke="#a89f92" strokeWidth={12} fill="none" /><ellipse cy={36} rx={260} ry={26} fill="#b98a46" /></g>
    {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={((noise(i) * 2200 + frame * (4 + noise(i + 2) * 5)) % 2100) - 100} cy={760 + noise(i + 4) * 280} r={3} fill="#f6d79a" />)}
    {["АХАД!", "АХАД!"].map((w, i) => <text key={i} x={760 + i * 300} y={480 - easeOut((t - 0.68) * 4 - i * 0.6) * 120} textAnchor="middle" fontSize={92} fontWeight={800} fill="#2a7f5a" opacity={easeOut((t - 0.68) * 6 - i * 0.6)}>{w}</text>)}
    <Caption89 y={130} text="ыйман — таштан да бекем" o={easeOut((t - 0.85) * 7)} />
  </g>
);
// The rock mountain splits and a big grey she-camel comes out; faceless people watch.
const CamelRock: React.FC<P> = ({ frame, t }) => {
  const crack = easeOut((t - 0.42) * 5), out = easeInOut((t - 0.52) * 2.4);
  return (
    <g>
      <rect width={1920} height={1080} fill="#cfe6f5" />
      <Sun x={300} y={160} frame={frame} r={60} />
      <rect y={860} width={1920} height={220} fill="#d9b98a" />
      <g transform={`translate(${-crack * 60} 0)`}><path d="M560 860 L760 360 L960 300 L960 860 Z" fill="#8a7a6a" /></g>
      <g transform={`translate(${crack * 60} 0)`}><path d="M960 300 L1160 380 L1380 860 L960 860 Z" fill="#7a6a5a" /></g>
      {crack > 0 ? <path d={`M960 300 l-20 140 l30 120 l-25 160 l15 140`} stroke="#fff4c2" strokeWidth={10 * crack} fill="none" opacity={1 - out * 0.7} /> : null}
      {crack > 0 ? <circle cx={960} cy={620} r={200 * crack} fill="#fff4c2" opacity={0.35 * (1 - out)} /> : null}
      <g transform={`translate(${960 + out * 140} ${850 + Math.sin(frame / 6) * 2 * out}) scale(${0.45 + out * 0.75})`} opacity={out}>
        {/* she-camel, side view facing right: legs, body with one hump, long neck, head */}
        {[-150, -95, 70, 125].map((x, i) => <path key={i} d={`M${x} -150 L${x + 6} -20 L${x - 4} 0 h22 l-6 -20 L${x + 22} -150 Z`} fill="#cfc6b3" transform={`rotate(${Math.sin(frame / 7 + i) * 4 * out} ${x + 10} -150)`} />)}
        <path d="M-190 -170 Q-200 -250 -120 -265 Q-70 -350 0 -280 Q60 -250 150 -250 Q200 -240 190 -160 Q150 -120 -150 -130 Q-195 -135 -190 -170 Z" fill="#e2dccd" />
        <path d="M150 -240 Q200 -300 205 -380 Q210 -430 250 -440 L300 -430 Q320 -415 300 -395 L260 -392 Q250 -330 200 -200 Z" fill="#e2dccd" />
        <circle cx={268} cy={-424} r={5} fill="#333" /><path d="M240 -446 l-6 -18 l14 8 z" fill="#cfc6b3" />
        <path d="M-188 -175 q-30 30 -20 80" stroke="#cfc6b3" strokeWidth={10} fill="none" strokeLinecap="round" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => <Figure key={i} x={180 + i * 90} y={1000} h={190} color={["#7a5c8a", "#5b7fa6", "#8a6240", "#2a7f5a", "#a65b5b"][i]} headwear={i % 2 ? "cap" : "none"} />)}
      {[0, 1, 2, 3].map((i) => <Figure key={`r${i}`} x={1500 + i * 100} y={1000} h={190} color={["#5b7fa6", "#8a6240", "#7a5c8a", "#2a7f5a"][i]} flip />)}
      <Caption89 y={120} text={out > 0.5 ? "Аллахтын белгиси — боз төө" : "«Таштан төө чыгарсаң…»"} />
    </g>
  );
};
// One boat, two rudders pulling two ways -> spins; one rudder -> sails straight.
const BoatRudders: React.FC<P> = ({ frame, t }) => {
  const two = t < 0.55;
  const spin = two ? Math.sin(frame / 10) * 35 : 0;
  const x = two ? 960 : 600 + easeInOut((t - 0.55) / 0.45) * 800;
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Sun x={1650} y={170} frame={frame} /><Cloud x={500} y={200} frame={frame} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M-200 ${600 + i * 120} ${Array.from({ length: 12 }).map((_, k) => `q90 ${-30 + Math.sin(frame / 10 + k + i) * 10} 180 0`).join(" ")} L2200 1080 L-200 1080 Z`} fill={["#5aa9e0", "#4a99d0", "#3a89c0", "#2a79b0"][i]} />)}
      <g transform={`translate(${x} 640) rotate(${spin})`}>
        <path d="M-200 0 L200 0 L150 80 L-150 80 Z" fill="#a0522d" /><rect x={-8} y={-260} width={16} height={260} fill="#6b4a2e" />
        <path d="M8 -250 L170 -40 L8 -40 Z" fill="#fff" />
        <g transform={`rotate(${two ? 35 : 0} -190 50)`}><rect x={-260} y={40} width={80} height={14} fill="#6b4a2e" /></g>
        {two ? <g transform="rotate(-35 190 50)"><rect x={180} y={40} width={80} height={14} fill="#6b4a2e" /></g> : null}
      </g>
      <Caption89 y={130} text={two ? "эки руль — кайык айланып калды ✗" : "бир руль — түз жол ✓"} color={two ? "#c8443a" : "#2a7f5a"} />
    </g>
  );
};
// Light races towards the nearest star; the fastest rocket stays far behind.
const LightSpeed: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={NIGHT} />
    <Stars frame={frame} n={140} />
    <circle cx={1720} cy={520} r={70} fill="#fff1b0" opacity={0.4} /><circle cx={1720} cy={520} r={38} fill="#fff8d8" />
    <circle cx={180} cy={540} r={60} fill="#3d8fd6" /><path d="M140 520 q30 -30 60 -10 q20 30 -10 50 z" fill="#5fb55a" />
    <line x1={240} y1={540} x2={240 + easeInOut(t) * 1420} y2={540} stroke="#fff6b0" strokeWidth={10} strokeLinecap="round" />
    <circle cx={240 + easeInOut(t) * 1420} cy={540} r={18} fill="#fff" />
    <g transform={`translate(${260 + t * 60} 700) rotate(90)`}><path d="M0 -40 C18 -22 18 18 10 30 L-10 30 C-18 18 -18 -22 0 -40 Z" fill="#e8ecef" /><path d={`M-7 31 L0 ${48 + Math.sin(frame) * 6} L7 31 Z`} fill="#ffb13b" /></g>
    <text x={960} y={460} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff6b0">жарык: 300 000 км / секунд</text>
    <text x={960} y={800} textAnchor="middle" fontSize={44} fill="#cfe0ff">эң жакын жылдызга — 4 жылдан ашык</text>
    <text x={400} y={780} textAnchor="middle" fontSize={34} fill="#ffb13b">ракета — жай</text>
  </g>
);
// World map: dots light one by one (prophets sent to every nation), Mecca glows gold.
const WorldMap: React.FC<P> = ({ frame, t }) => {
  const dots = [[300, 360], [420, 300], [520, 560], [700, 720], [880, 300], [950, 380], [1020, 470], [1080, 540], [1180, 320], [1300, 400], [1420, 330], [1500, 520], [1600, 640], [1000, 650], [1150, 760], [380, 460]];
  return (
    <g>
      <rect width={1920} height={1080} fill="#bfe3f7" />
      <path d="M180 260 q150 -80 330 -10 q60 120 -40 220 q-70 70 -40 150 q-80 30 -120 -60 q-120 -60 -130 -300 z" fill="#8cc07a" />
      <path d="M460 560 q90 10 120 120 q-10 160 -90 240 q-60 -100 -70 -220 z" fill="#8cc07a" />
      <path d="M820 240 q200 -60 420 -10 q300 -20 480 120 q40 150 -120 200 q-120 -20 -170 90 q-150 30 -240 -60 q-80 40 -100 180 q-110 40 -150 -100 q-60 -110 -120 -160 q-90 -60 0 -260 z" fill="#8cc07a" />
      <path d="M1560 760 q110 -20 160 60 q-40 70 -150 40 z" fill="#8cc07a" />
      {dots.map(([x, y], i) => { const a = easeOut(t * 3 - i * 0.12); return <g key={i} opacity={a}><circle cx={x} cy={y} r={22 * a} fill="#ffd34d" opacity={0.4} /><circle cx={x} cy={y} r={10} fill="#e8a21b" /></g>; })}
      <g transform="translate(1080 540)" opacity={easeOut((t - 0.5) * 4)}><circle r={46 + 6 * Math.sin(frame / 6)} fill="#ffd34d" opacity={0.5} /><rect x={-18} y={-18} width={36} height={36} fill="#111" /><rect x={-18} y={-10} width={36} height={6} fill="#d4a93a" />
        <text y={-60} textAnchor="middle" fontSize={40} fontWeight={700} fill="#1f3b57">Мекке</text></g>
      <Caption89 y={110} text="ар бир элге — пайгамбар" />
    </g>
  );
};
// Mountain with rag-tied tree fades; a family raises their hands in dua under the open sky.
const MountainAsk: React.FC<P> = ({ frame, t }) => {
  const b = easeInOut((t - 0.4) * 2.5);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <rect width={1920} height={1080} fill="#ffe7b0" opacity={b * 0.6} />
      <Sun x={1600} y={180} frame={frame} />
      <Mountains y={620} />
      <Hills y={820} />
      <g opacity={1 - b}>
        <Tree x={600} y={880} frame={frame} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={540 + i * 26} y={760 + (i % 2) * 30} width={14} height={40 + Math.sin(frame / 8 + i) * 6} fill={["#c8443a", "#fff", "#3a7bd5", "#d9a21b", "#2a7f5a"][i]} />)}
        <text x={600} y={620} textAnchor="middle" fontSize={120} fontWeight={800} fill="#c8443a">✗</text>
      </g>
      <g opacity={b}>
        {[[1180, "#5b7fa6", "cap"], [1320, "#e46a8a", "scarf"], [1450, "#3a7bd5", "none"]].map(([x, c, h], i) => (
          <g key={i}><Figure x={x as number} y={980} h={i === 2 ? 170 : 240} color={c as string} headwear={h as "cap"} />
            <path d={`M${(x as number) - 30} ${980 - (i === 2 ? 130 : 180)} l-20 -50 M${(x as number) + 30} ${980 - (i === 2 ? 130 : 180)} l20 -50`} stroke={c as string} strokeWidth={14} strokeLinecap="round" /></g>
        ))}
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={1320 + Math.cos(i) * 200} cy={500 - ((frame * 1.5 + i * 40) % 240)} r={6} fill="#fff" opacity={0.7} />)}
      </g>
      <Caption89 y={120} text={b > 0.5 ? "Сураганыбызды Аллахтан сурайбыз" : "тоо, таш жардам бере албайт"} />
    </g>
  );
};
// A balance: a mountain of gold vs a small glowing heart — the heart is heavier.
const ScaleHeart: React.FC<P> = ({ frame, t }) => {
  const tilt = easeInOut((t - 0.2) * 1.6) * 14;
  return (
    <g>
      <rect width={1920} height={1080} fill="#f6efe2" />
      <rect x={940} y={300} width={40} height={600} fill="#8a6240" /><rect x={760} y={880} width={400} height={50} rx={12} fill="#6b4a2e" />
      <g transform={`rotate(${tilt} 960 300)`}>
        <rect x={420} y={290} width={1080} height={20} rx={10} fill="#8a6240" />
        <g transform={`rotate(${-tilt} 480 300)`}><path d="M480 300 L340 560 M480 300 L620 560" stroke="#555" strokeWidth={4} /><path d="M310 560 h340 q-20 60 -170 60 q-150 0 -170 -60 z" fill="#c9981f" />
          {Array.from({ length: 12 }).map((_, i) => <ellipse key={i} cx={360 + (i % 6) * 48} cy={540 - Math.floor(i / 6) * 26} rx={26} ry={12} fill="#f2c84b" stroke="#c9981f" />)}</g>
        <g transform={`rotate(${-tilt} 1440 300)`}><path d="M1440 300 L1300 560 M1440 300 L1580 560" stroke="#555" strokeWidth={4} /><path d="M1270 560 h340 q-20 60 -170 60 q-150 0 -170 -60 z" fill="#c9981f" />
          <g transform={`translate(1440 520) scale(${0.5 + 0.03 * Math.sin(frame / 6)})`}><circle r={120} fill="#fff6b0" opacity={0.5} /><path d="M0 60 C-110 -20 -150 -110 -80 -150 C-40 -170 -10 -150 0 -120 C10 -150 40 -170 80 -150 C150 -110 110 -20 0 60 Z" fill="#e0475b" /></g></g>
      </g>
      <text x={480} y={760} textAnchor="middle" fontSize={48} fontWeight={700} fill="#8a6240">дүйнөнүн байлыгы × 2</text>
      <text x={1440} y={780} textAnchor="middle" fontSize={56} fontWeight={800} fill="#c8443a">ЫЙМАН</text>
    </g>
  );
};
// Days pass: the sun sets, the moon rises, the clock hands spin.
const DayCycle: React.FC<P> = ({ frame, t }) => {
  const ph = (t * 3) % 1, night = Math.sin(ph * Math.PI);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} /><rect width={1920} height={1080} fill={NIGHT} opacity={night * 0.9} />
      <g opacity={night}><Stars frame={frame} n={60} h={600} /></g>
      <circle cx={200 + ph * 1520} cy={700 - Math.sin(ph * Math.PI) * 520} r={70} fill={night > 0.5 ? "#fff6d0" : "#ffd34d"} />
      <rect y={760} width={1920} height={320} fill="#9aa8b8" /><rect y={760} width={1920} height={320} fill="#1b2440" opacity={night * 0.6} />
      {[0, 1, 2, 3, 4, 5].map((i) => <g key={i}><rect x={120 + i * 300} y={560 - (i % 3) * 60} width={200} height={260 + (i % 3) * 60} fill="#cdd6e0" />{[0, 1, 2].map((k) => <rect key={k} x={150 + i * 300 + k * 50} y={600 - (i % 3) * 60} width={30} height={40} fill={night > 0.5 ? "#ffe08a" : "#9ad1f0"} />)}</g>)}
      <g transform="translate(960 380)"><circle r={150} fill="#fff" stroke="#1f3b57" strokeWidth={12} />
        <line y2={-110} stroke="#1f3b57" strokeWidth={10} strokeLinecap="round" transform={`rotate(${t * 1080})`} />
        <line y2={-70} stroke="#c8443a" strokeWidth={14} strokeLinecap="round" transform={`rotate(${t * 90})`} /></g>
      <Caption89 y={110} text={["кечээ", "бүгүн", "эртең"][Math.min(2, Math.floor(t * 3))]} color={night > 0.5 ? "#fff" : "#1f3b57"} />
    </g>
  );
};
// A sand castle on the shore is washed away by a wave.
const SandCastle: React.FC<P> = ({ frame, t }) => {
  const wave = easeInOut((t - 0.35) * 2), gone = easeOut((t - 0.55) * 2.5);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} /><Sun x={1600} y={170} frame={frame} /><Cloud x={400} y={180} frame={frame} />
      <rect y={480} width={1920} height={200} fill="#3a89c0" />
      <rect y={660} width={1920} height={420} fill="#f0d9a0" />
      <g transform="translate(960 900)" opacity={1 - gone}>
        <g transform={`scale(1 ${1 - gone * 0.8})`}>
          <rect x={-220} y={-160} width={440} height={160} fill="#e2c07a" /><rect x={-260} y={-260} width={110} height={260} fill="#d9b66a" /><rect x={150} y={-260} width={110} height={260} fill="#d9b66a" />
          <rect x={-70} y={-300} width={140} height={140} fill="#d9b66a" />{[-260, -205, 150, 205, -70, -15, 40].map((x, i) => <rect key={i} x={x} y={i < 4 ? -290 : -330} width={40} height={32} fill="#d9b66a" />)}
          <rect x={-35} y={-90} width={70} height={90} rx={30} fill="#b9954f" /><path d="M0 -300 v-80 l60 20 l-60 20" stroke="#8a6240" strokeWidth={6} fill="#c8443a" />
        </g>
      </g>
      <path d={`M${-400 + wave * 2600} 680 q-200 -60 -400 0 q-300 120 -1400 120 L${-2200 + wave * 2600} 1080 L${-400 + wave * 2600} 1080 Z`} fill="#5aa9e0" opacity={0.92 * (1 - easeOut((t - 0.85) * 6))} />
      <Caption89 y={130} text={gone > 0.5 ? "бекер өткөн күн — жоголду" : "кумдан сепил…"} color={gone > 0.5 ? "#c8443a" : "#1f3b57"} />
    </g>
  );
};
// A family car drives through the mountains to a lake.
const FamilyCar: React.FC<P> = ({ frame, t }) => {
  const x = -300 + easeInOut(t) * 2400;
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} /><Sun x={1650} y={160} frame={frame} /><Cloud x={300} y={160} frame={frame} />
      <Mountains y={600} />
      <ellipse cx={1400} cy={790} rx={420} ry={60} fill={WATER} />
      <rect y={860} width={1920} height={220} fill={GRASS} /><rect y={900} width={1920} height={70} fill="#5d6670" />
      {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={((i * 220 - frame * 3) % 2200 + 2200) % 2200 - 100} y={930} width={100} height={10} fill="#fff" />)}
      <g transform={`translate(${x} 900)`}>
        <path d="M-160 -20 L-150 -80 Q-120 -140 -40 -140 L70 -140 Q120 -140 150 -80 L190 -70 Q210 -60 210 -20 Z" fill="#c8443a" />
        <path d="M-120 -82 Q-100 -124 -40 -124 L-10 -124 L-10 -82 Z M10 -124 L60 -124 Q100 -124 125 -82 L10 -82 Z" fill="#bfe3f7" />
        <circle cx={-60 + 0} cy={-104} r={14} fill="#e9b98f" /><circle cx={40} cy={-104} r={14} fill="#f0c9a8" /><circle cx={90} cy={-98} r={10} fill="#e4b48c" />
        {[-90, 120].map((cx) => <g key={cx} transform={`translate(${cx} -12) rotate(${frame * 12})`}><circle r={34} fill="#222" /><rect x={-4} y={-26} width={8} height={52} fill="#888" /></g>)}
      </g>
      <Caption89 y={120} text="жакшы ниет менен — ар бир иш сооп" />
    </g>
  );
};
// Evening room: the grandfather tells his grandson his most important words; the boy listens closely.
const GrandpaWill: React.FC<P & { chest?: boolean }> = ({ frame, t, chest }) => (
  <g>
    <rect width={1920} height={1080} fill="#3b3550" />
    <rect x={1300} y={160} width={380} height={300} fill="#1c2540" stroke="#8a6240" strokeWidth={16} /><Stars frame={frame} n={14} h={0} />
    <circle cx={1560} cy={240} r={36} fill="#fff6d0" />
    <rect y={820} width={1920} height={260} fill="#6b4f3a" />
    <circle cx={1700} cy={620} r={160} fill="#ffcf7a" opacity={0.18 + 0.04 * Math.sin(frame / 5)} /><rect x={1680} y={640} width={40} height={180} fill="#8a6240" /><path d="M1640 560 h120 l-30 80 h-60 z" fill="#ffe2a0" />
    <rect x={200} y={640} width={820} height={70} rx={20} fill="#8a6240" /><rect x={200} y={590} width={820} height={70} rx={24} fill="#e9eef6" />
    <ellipse cx={290} cy={580} rx={90} ry={44} fill="#fff" />
    <g transform="translate(330 560)"><ellipse rx={58} ry={52} fill="#e4b48c" /><path d="M-40 20 q40 50 80 0 q-10 40 -40 46 q-30 -6 -40 -46 z" fill="#f2f2f2" /><path d="M-56 -20 q56 -60 112 0 z" fill="#fff" /></g>
    <path d="M400 560 q300 -40 600 20 l0 40 h-600 z" fill="#5b7fa6" />
    <g transform={`translate(1080 ${640 + Math.sin(frame / 20) * 3})`}><KidFigure x={0} y={0} s={1.1} frame={frame} /></g>
    {[0, 1, 2].map((i) => <path key={i} d={`M${460 + i * 40} 480 q30 -20 60 0`} stroke="#ffe08a" strokeWidth={5} fill="none" opacity={0.3 + 0.7 * Math.abs(Math.sin(frame / 10 + i))} />)}
    <g opacity={chest ? easeOut((t - 0.5) * 5) : 0} transform="translate(700 300)"><path d="M-90 40 q-10 -90 90 -100 q100 10 90 100 z" fill="#8c8478" /><rect x={-60} y={10} width={120} height={70} rx={8} fill="#a0522d" /><rect x={-60} y={10} width={120} height={20} fill="#d4a93a" /><circle r={20} cy={50} fill="#ffd34d" /></g>
    <Caption89 y={120} color="#ffe08a" text="«Балам, кулак сал…»" />
  </g>
);
// A girl prepares her lesson late, is tired but finishes; next day — «5».
const StudyNight: React.FC<P> = ({ frame, t }) => {
  const day = t > 0.62;
  return (
    <g>
      <rect width={1920} height={1080} fill={day ? "#fdf3df" : "#2f3555"} />
      <rect x={1300} y={150} width={420} height={320} fill={day ? "#bfe3f7" : "#1c2540"} stroke="#8a6240" strokeWidth={16} />
      {day ? <Sun x={1510} y={300} frame={frame} r={60} /> : <circle cx={1510} cy={280} r={40} fill="#fff6d0" />}
      <rect x={300} y={720} width={900} height={40} fill="#a57a52" /><rect x={340} y={760} width={30} height={320} fill="#8a6240" /><rect x={1130} y={760} width={30} height={320} fill="#8a6240" />
      {!day ? <g><path d="M980 560 l60 -100 l40 20 l-50 90 z" fill="#555" /><path d="M950 560 h140 l-20 60 h-100 z" fill="#ffe08a" /><circle cx={1020} cy={620} r={160} fill="#ffe08a" opacity={0.15} /></g> : null}
      <rect x={520} y={660} width={260} height={60} fill="#fff" /><path d="M650 660 v60" stroke="#ccc" strokeWidth={3} />
      <g transform={`translate(640 ${600 + (!day && Math.sin(frame / 30) > 0.6 ? 20 : 0)})`}><KidFigure x={0} y={0} girl s={1} frame={frame} happy={day || t > 0.45} /></g>
      {!day && t > 0.2 && t < 0.45 ? <text x={820} y={420} fontSize={56} fill="#cfe0ff">z z…</text> : null}
      {day ? <g transform={`translate(1500 720) scale(${easeOut((t - 0.62) * 5)})`}><rect x={-160} y={-120} width={320} height={240} rx={16} fill="#fff" stroke="#3a7bd5" strokeWidth={6} /><text y={60} textAnchor="middle" fontSize={180} fontWeight={800} fill="#c8443a">5</text>
        <path d={STAR_PATH} fill="#ffd34d" transform="translate(130 -110) scale(1.6)" /></g> : null}
      <Caption89 y={110} color={day ? "#2a7f5a" : "#fff"} text={day ? "сабыр → ийгилик!" : t > 0.45 ? "чыдап, бүтүрдү ✓" : "уйку келди…"} />
    </g>
  );
};
const STAR_PATH = "M0 -26 L7.6 -8.4 L26 -7 L12 5.6 L16.4 24 L0 14 L-16.4 24 L-12 5.6 L-26 -7 L-7.6 -8.4 Z";
// An old French house; calendar pages fly for thirty years (1965 → 1995 → 1997).
const OldHouse: React.FC<P> = ({ frame, t }) => {
  const year = Math.round(1965 + easeInOut(Math.max(0, Math.min(1, (t - 0.3) / 0.6))) * 32);
  return (
    <g>
      <rect width={1920} height={1080} fill="#cfe6f5" /><Cloud x={300} y={150} frame={frame} />
      <rect y={860} width={1920} height={220} fill="#c9c3b5" />
      <g transform="translate(560 860)"><rect x={-300} y={-460} width={600} height={460} fill="#efe2c8" /><path d="M-340 -460 L0 -620 L340 -460 Z" fill="#6a7d94" />
        {[-200, 0, 200].map((x) => [-380, -230].map((y) => <g key={`${x}${y}`}><rect x={x - 45} y={y} width={90} height={110} fill="#9ad1f0" stroke="#fff" strokeWidth={8} /><rect x={x - 55} y={y + 110} width={110} height={18} fill="#a65b5b" />{[0, 1, 2].map((k) => <circle key={k} cx={x - 30 + k * 30} cy={y + 106 - Math.abs(Math.sin(frame / 12 + k)) * 6} r={10} fill="#e46a8a" />)}</g>))}
        <rect x={-50} y={-120} width={100} height={120} fill="#7a4f2a" /></g>
      <g transform="translate(1400 480)"><rect x={-180} y={-200} width={360} height={400} rx={20} fill="#fff" stroke="#1f3b57" strokeWidth={6} /><rect x={-180} y={-200} width={360} height={90} rx={20} fill="#c8443a" />
        <text y={60} textAnchor="middle" fontSize={120} fontWeight={800} fill="#1f3b57">{year}</text></g>
      {Array.from({ length: 6 }).map((_, i) => { const p = ((frame / 40 + i / 6) % 1); return <rect key={i} x={1400 + p * 500} y={300 - p * 260 + i * 10} width={120} height={140} fill="#fff" stroke="#ccc" opacity={1 - p} transform={`rotate(${p * 90} ${1400 + p * 500} ${300 - p * 260})`} />; })}
      <Caption89 y={110} text={year < 1995 ? "нотариус күтөт… күтөт…" : "үйдү ала алган жок"} color={year < 1995 ? "#1f3b57" : "#c8443a"} />
    </g>
  );
};
// A car on a long road; two faceless people talk inside.
const TaxiRoad: React.FC<P> = ({ frame }) => (
  <g>
    <rect width={1920} height={1080} fill="#f7d9a8" /><Sun x={1600} y={300} frame={frame} r={90} />
    <path d="M0 640 L400 520 L760 600 L1200 500 L1920 620 L1920 1080 L0 1080 Z" fill="#b6a07a" />
    <path d="M760 640 L1160 640 L1920 1080 L0 1080 Z" fill="#5d6670" />
    {Array.from({ length: 6 }).map((_, i) => { const p = ((frame / 50 + i / 6) % 1); return <rect key={i} x={960 - 6 - p * 10} y={640 + p * p * 440} width={12 + p * 20} height={20 + p * 60} fill="#fff" />; })}
    <g transform={`translate(960 ${860 + Math.sin(frame / 4) * 3})`}>
      <path d="M-260 0 L-250 -120 Q-220 -200 -100 -200 L100 -200 Q220 -200 250 -120 L260 0 Z" fill="#e8c23a" />
      <path d="M-210 -120 Q-190 -180 -100 -180 L100 -180 Q190 -180 210 -120 Z" fill="#9ad1f0" />
      <circle cx={-80} cy={-140} r={32} fill="#3b4a5c" /><circle cx={80} cy={-140} r={32} fill="#7a5c8a" />
      <rect x={-260} y={-20} width={520} height={40} rx={10} fill="#333" /><rect x={-240} y={-60} width={70} height={30} rx={6} fill="#fff6b0" /><rect x={170} y={-60} width={70} height={30} rx={6} fill="#fff6b0" />
    </g>
    <g opacity={0.5 + 0.5 * Math.sin(frame / 15)}><path d="M1080 600 q60 -60 140 -40 q60 30 20 80 h-120 l-30 30 z" fill="#fff" /><text x={1160} y={630} textAnchor="middle" fontSize={44} fill="#1f3b57">?</text></g>
    <Caption89 y={120} text="сылык суроо — жакшы чакыруу" />
  </g>
);
// A man lures a runaway horse with an EMPTY nosebag (faceless figure).
const HorseBag: React.FC<P> = ({ frame, t }) => {
  const hx = 1700 - easeInOut(Math.min(1, t * 1.6)) * 600;
  return (
    <g>
      <rect width={1920} height={1080} fill="#fbe8c8" /><Sun x={300} y={180} frame={frame} />
      <path d="M0 700 Q600 640 1200 700 T1920 690 L1920 1080 L0 1080 Z" fill="#e9cf9a" />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${200 + i * 230} 700)`}><rect x={-80} y={-120} width={160} height={120} fill="#f3e7d3" /><rect x={-20} y={-70} width={40} height={70} fill="#8a6240" /></g>)}
      <Figure x={760} y={900} h={260} color="#5b7fa6" headwear="cap" />
      <g transform={`translate(800 ${720 + Math.sin(frame / 6) * 10})`}><path d="M0 0 q-40 0 -50 60 q50 30 100 0 q-10 -60 -50 -60 z" fill="#c9a46a" /><path d="M-30 0 q30 -60 60 0" stroke="#8a6240" strokeWidth={6} fill="none" />
        <text x={0} y={46} textAnchor="middle" fontSize={26} fill="#6b4a2e" opacity={easeOut((t - 0.6) * 5)}>бош!</text></g>
      <g transform={`translate(${hx} 860) scale(-1 1)`}>
        <ellipse cx={0} cy={-120} rx={150} ry={70} fill="#8a5a3a" />
        {[-100, -60, 60, 100].map((x, i) => <rect key={x} x={x - 12} y={-80} width={24} height={150} fill="#7a4f2a" transform={`rotate(${Math.sin(frame / 3 + i) * 14 * (t < 0.62 ? 1 : 0)} ${x} -80)`} />)}
        <path d="M120 -150 l80 -110 q30 -20 50 10 l-20 40 l-60 80 z" fill="#8a5a3a" /><path d="M150 -220 q-40 30 -50 70" stroke="#3b2a1a" strokeWidth={14} fill="none" />
        <path d="M-150 -130 q-60 20 -60 90" stroke="#3b2a1a" strokeWidth={16} fill="none" />
      </g>
      <Caption89 y={120} text={t > 0.6 ? "торбо бош экен — алдады ✗" : "жылкыны чакырып жатат…"} color={t > 0.6 ? "#c8443a" : "#1f3b57"} />
    </g>
  );
};

const REGISTRY: Record<CutawayId, React.FC<P>> = {
  junkStorm: JunkStorm, heartBody: HeartBody, phoneApps: PhoneApps, earthSun: EarthSun, kaabaNight: KaabaNight, desertStone: DesertStone,
  camelRock: CamelRock, boatRudders: BoatRudders, lightSpeed: LightSpeed, worldMap: WorldMap, mountainAsk: MountainAsk, scaleHeart: ScaleHeart,
  dayCycle: DayCycle, sandCastle: SandCastle, familyCar: FamilyCar, grandpaWill: GrandpaWill, grandpaChest: (p) => <GrandpaWill {...p} chest />, studyNight: StudyNight, oldHouse: OldHouse,
  taxiRoad: TaxiRoad, horseBag: HorseBag,
  mirage: Mirage, hall: Hall, orbits: Orbits, taif: Taif, mecca: Mecca, sadaqa: Sadaqa, battery: Battery, chess: Chess,
  baby: Baby, books: Books, bike: Bike, wings: Wings, hillThink: HillThink,
  nature: Nature, doors: Doors, window: Window, space: (p) => <Space {...p} />, spaceReturn: (p) => <Space {...p} back />,
  glacier: Glacier, villages: Villages, growth: Growth, snakeRopes: SnakeRopes, seaCrown: SeaCrown, bekturRoom: BekturRoom,
  aizadaBed: AizadaBed, homeKitchen: HomeKitchen, streetBread: StreetBread, orchard: Orchard, race: Race, dawnRoom: DawnRoom,
  neighbor: Neighbor, electrician: Electrician, wheatField: WheatField, kettle: Kettle, winterBirds: WinterBirds, garage: Garage,
  brightPath: BrightPath, oven: Oven,
};

export const Cutaway: React.FC<{ id: CutawayId; t: number; frame: number }> = ({ id, t, frame }) => {
  const C = REGISTRY[id];
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0, fontFamily: "'Noto Sans', sans-serif" }}>
      <C t={Math.max(0, Math.min(1, t))} frame={frame} />
    </svg>
  );
};
export const smooth = smoothNoise;
