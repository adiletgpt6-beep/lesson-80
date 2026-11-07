import React from "react";
import { easeInOut, easeOut, noise, smoothNoise } from "../anim";
import type { CutawayId } from "./cutawayIds";

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


// ---------------- VID-002 (lessons 001/002) illustrations ----------------
// Allah is never depicted; the Prophet ﷺ, prophets and angels are never drawn (light, words, places only).
const SAND = "#e9c98b", SAND_DARK = "#d6ae68";

// A big house on five columns; columns light up one by one (t), each with its word.
const PillarHouse: React.FC<P> = ({ frame, t }) => {
  const words = ["ЫЙМАН", "НАМАЗ", "ЗЕКЕТ", "ОРОЗО", "АЖЫЛЫК"];
  const lit = Math.floor(t * 6.2);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Sun x={1650} y={170} frame={frame} />
      <Cloud x={300} y={150} frame={frame} /><Cloud x={1100} y={110} s={0.7} frame={frame} speed={0.3} />
      <Hills y={860} />
      <path d="M460 360 L960 150 L1460 360 Z" fill={ROOF} />
      <rect x={480} y={360} width={960} height={40} fill="#8a6240" />
      {words.map((w, i) => {
        const x = 560 + i * 200, on = i < lit;
        return (
          <g key={i}>
            {on ? <rect x={x - 40} y={390} width={80} height={460} fill="#ffe08a" opacity={0.35 + Math.sin(frame / 10 + i) * 0.08} /> : null}
            <rect x={x - 28} y={400} width={56} height={440} rx={6} fill={on ? "#f2b32a" : "#efe6d4"} stroke="#8a6240" strokeWidth={6} />
            <rect x={x - 40} y={830} width={80} height={24} fill="#8a6240" />
            <text x={x} y={900} textAnchor="middle" fontSize={34} fontWeight={700} fill={on ? "#1f3b57" : "#7d8fa3"}>{w}</text>
          </g>
        );
      })}
      <text x={960} y={300} textAnchor="middle" fontSize={56} fontWeight={700} fill="#fff">ИСЛАМ</text>
    </g>
  );
};

// Mosque in the desert town at dawn, palms; no people.
const DesertMosque: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill={`rgb(${250 - t * 40}, ${214 - t * 20}, ${160 + t * 60})`} />
    <Sun x={1500} y={260 - t * 60} r={80} frame={frame} />
    <path d="M0 760 Q480 700 960 750 T1920 740 L1920 1080 L0 1080 Z" fill={SAND} />
    <path d="M0 880 Q600 820 1200 880 T1920 860 L1920 1080 L0 1080 Z" fill={SAND_DARK} />
    <g transform="translate(960 760)">
      <rect x={-260} y={-220} width={520} height={220} fill="#f4ecdc" />
      <path d="M-150 -220 C-150 -380 150 -380 150 -220 Z" fill="#7fb7a4" />
      <rect x={-5} y={-420} width={10} height={60} fill="#d9a21b" /><circle cx={0} cy={-430} r={12} fill="#d9a21b" />
      {[-360, 360].map((x, i) => <g key={i}><rect x={x - 22} y={-420} width={44} height={420} fill="#f4ecdc" /><path d={`M${x - 30} -420 L${x} -480 L${x + 30} -420 Z`} fill="#7fb7a4" /></g>)}
      <path d="M-50 0 L-50 -110 C-50 -150 50 -150 50 -110 L50 0 Z" fill="#8a6240" />
      {[-190, -120, 120, 190].map((x, i) => <path key={i} d={`M${x - 22} -110 L${x - 22} -160 C${x - 22} -186 ${x + 22} -186 ${x + 22} -160 L${x + 22} -110 Z`} fill="#9ad1f0" />)}
    </g>
    {[220, 380, 1560, 1730].map((x, i) => (
      <g key={i} transform={`translate(${x} ${830 + (i % 2) * 30}) rotate(${Math.sin(frame / 40 + i) * 2})`}>
        <path d="M0 0 C-6 -120 -2 -220 6 -300" stroke="#7a4f2a" strokeWidth={22} fill="none" strokeLinecap="round" />
        {[-150, -110, -60, -20, 30, 70].map((a, j) => <path key={j} d={`M6 -300 q${Math.cos(a / 57) * 90} ${Math.sin(a / 57) * 60 - 40} ${Math.cos(a / 57) * 170} ${Math.sin(a / 57) * 90}`} stroke={LEAF} strokeWidth={22} fill="none" strokeLinecap="round" />)}
      </g>
    ))}
  </g>
);

// A doorway filled with soft white light (the mysterious guest is never drawn).
const GuestLight: React.FC<P> = ({ frame, t }) => {
  const g = 0.5 + 0.5 * easeOut(t * 2);
  return (
    <g>
      <rect width={1920} height={1080} fill="#efe2c8" />
      <rect y={820} width={1920} height={260} fill="#d8bf95" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={160 + i * 420} y={180} width={60} height={640} fill="#e2d1b0" />)}
      <rect x={760} y={220} width={400} height={600} rx={200} fill="#8a6240" />
      <rect x={790} y={250} width={340} height={570} rx={170} fill="#fffdf5" opacity={g} />
      <ellipse cx={960} cy={560} rx={260 + Math.sin(frame / 12) * 12} ry={340} fill="#ffffff" opacity={0.35 * g} />
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i} cx={960 + Math.cos(i + frame / 50) * (180 + noise(i) * 160)} cy={540 + Math.sin(i * 1.7 + frame / 60) * 260} r={4 + noise(i + 3) * 5} fill="#fff6c8" opacity={0.6 * g} />
      ))}
      <text x={960} y={150} textAnchor="middle" fontSize={52} fontWeight={700} fill="#1f3b57" opacity={easeOut(t * 3)}>ак кийимчен мейман</text>
    </g>
  );
};

// Pilgrims in white around the Kaaba seen from far away (faceless, simple).
const PilgrimsWhite: React.FC<P> = ({ frame }) => (
  <g>
    <rect width={1920} height={1080} fill="#f7e9cf" />
    <ellipse cx={960} cy={760} rx={900} ry={260} fill="#efe4d2" />
    <rect x={880} y={520} width={160} height={190} fill="#1d1d1d" /><rect x={880} y={570} width={160} height={16} fill="#d9a21b" />
    {Array.from({ length: 70 }).map((_, i) => {
      const ring = 1 + (i % 4), a = (i / 70) * Math.PI * 2 + frame / (300 + ring * 80) * (ring % 2 ? 1 : 1);
      const x = 960 + Math.cos(a) * (160 + ring * 150), y = 640 + Math.sin(a) * (50 + ring * 48);
      return <g key={i} transform={`translate(${x} ${y}) scale(${0.6 + ring * 0.12})`}><path d="M-12 0 l4 -50 h16 l4 50 z" fill="#ffffff" stroke="#d9d0c0" strokeWidth={2} /><circle cy={-58} r={9} fill="#e4b48c" /></g>;
    })}
  </g>
);

// Winter → spring: bare trees, snow melts, everything turns green and blooms (resurrection image, Rum 30:19).
const WinterSpring: React.FC<P> = ({ frame, t }) => {
  const k = easeInOut(Math.max(0, Math.min(1, (t - 0.25) / 0.5)));
  const mix = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
  return (
    <g>
      <rect width={1920} height={1080} fill={mix([205, 218, 230], [191, 227, 247])} />
      <Sun x={1600} y={180} r={60 + 20 * k} frame={frame} />
      <Mountains />
      <path d="M0 780 Q500 700 960 760 T1920 740 L1920 1080 L0 1080 Z" fill={mix([240, 244, 248], [127, 191, 106])} />
      {[260, 620, 980, 1340, 1700].map((x, i) => (
        <g key={i} transform={`translate(${x} ${900 + (i % 2) * 40})`}>
          <rect x={-12} y={-150} width={24} height={160} rx={8} fill={TRUNK} />
          <path d="M0 -120 L-60 -200 M0 -140 L50 -220 M0 -100 L70 -150" stroke={TRUNK} strokeWidth={10} strokeLinecap="round" />
          <g opacity={k}><circle cx={0} cy={-200} r={80 * k} fill={LEAF} /><circle cx={-50} cy={-160} r={55 * k} fill={LEAF} /><circle cx={50} cy={-165} r={60 * k} fill={LEAF} />
            {[[-30, -210], [25, -230], [55, -170], [-60, -150]].map(([fx, fy], j) => <circle key={j} cx={fx} cy={fy} r={10 * k} fill="#ffb3d1" />)}</g>
        </g>
      ))}
      {k < 1 ? Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(noise(i) * 1920 + frame * 0.6) % 1920} cy={(noise(i + 50) * 1080 + frame * 2.5) % 1080} r={4} fill="#fff" opacity={1 - k} />) : null}
      {Array.from({ length: 12 }).map((_, i) => <g key={i} opacity={k} transform={`translate(${120 + i * 150} ${980 + (i % 3) * 20}) scale(${k})`}><path d="M0 0 L0 -40" stroke={GRASS_DARK} strokeWidth={5} /><circle cy={-46} r={10} fill={["#ffd34d", "#ff8fb1", "#fff"][i % 3]} /></g>)}
    </g>
  );
};

// Melon field with a market stall (the parable of the melon seller).
const MelonField: React.FC<P> = ({ frame }) => (
  <g>
    <rect width={1920} height={1080} fill={SKY} />
    <Sun x={300} y={180} frame={frame} />
    <Cloud x={900} y={140} frame={frame} />
    <rect y={600} width={1920} height={480} fill="#b9d98a" />
    {Array.from({ length: 22 }).map((_, i) => {
      const x = 120 + (i % 8) * 220 + (Math.floor(i / 8) % 2) * 100, y = 700 + Math.floor(i / 8) * 130;
      return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={70} ry={45} fill="#e8d36a" stroke="#c9a93a" strokeWidth={4} /><path d="M-40 -30 q40 20 80 0 M-50 0 q50 15 100 0" stroke="#c9a93a" strokeWidth={3} fill="none" /><path d="M60 -30 q30 -30 60 -10" stroke={GRASS_DARK} strokeWidth={6} fill="none" /></g>;
    })}
    <rect x={1460} y={420} width={360} height={200} fill="#c8443a" /><path d="M1440 420 L1640 340 L1840 420 Z" fill="#f2b32a" />
    <text x={1640} y={540} textAnchor="middle" fontSize={44} fontWeight={700} fill="#fff">КООН</text>
  </g>
);

// Children standing calmly in a queue at a small shop (patience).
const QueueShop: React.FC<P> = ({ frame, t }) => (
  <g>
    <rect width={1920} height={1080} fill="#cfe8f5" />
    <rect y={820} width={1920} height={260} fill="#c9c2b4" />
    <rect x={1300} y={300} width={520} height={520} fill="#f3e7d3" /><rect x={1300} y={240} width={520} height={80} fill="#2a7f5a" />
    <text x={1560} y={295} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff">ДҮКӨН</text>
    <rect x={1400} y={500} width={160} height={320} fill="#6b4a2e" /><rect x={1600} y={420} width={160} height={140} fill="#9ad1f0" />
    {[0, 1, 2, 3, 4].map((i) => <KidFigure key={i} x={1180 - i * 210 + easeOut(t) * 40} y={700} s={0.8} frame={frame + i * 13} girl={i % 2 === 1} />)}
  </g>
);

// Sharing apples: a basket and children handing apples to each other.
const ShareApples: React.FC<P> = ({ frame, t }) => {
  const fly = easeInOut((t * 2) % 1);
  return (
    <g>
      <rect width={1920} height={1080} fill={SKY} />
      <Hills y={760} />
      <Tree x={300} y={900} s={1.3} frame={frame} fruit="#c8443a" />
      <KidFigure x={760} y={720} frame={frame} arm={-30} />
      <KidFigure x={1260} y={720} girl frame={frame + 7} arm={-30 * fly} />
      <g transform="translate(700 860)"><path d="M-80 0 L80 0 L64 90 L-64 90 Z" fill="#c99c6e" /><path d="M-60 0 C-60 -70 60 -70 60 0" stroke="#8a6240" strokeWidth={8} fill="none" />
        {[-40, 0, 40, -20, 20].map((x, i) => <circle key={i} cx={x} cy={-10 - (i > 2 ? 20 : 0)} r={22} fill="#c8443a" />)}</g>
      <circle cx={820 + fly * 380} cy={700 - Math.sin(fly * Math.PI) * 160} r={24} fill="#c8443a" />
    </g>
  );
};

// A child doing homework at a desk carefully — the teacher's chair is empty (ihsan: same effort when nobody watches).
const HomeworkDesk: React.FC<P> = ({ frame }) => (
  <Room frame={frame}>
    <rect x={500} y={600} width={600} height={30} fill="#8a6240" /><rect x={520} y={630} width={24} height={170} fill="#8a6240" /><rect x={1056} y={630} width={24} height={170} fill="#8a6240" />
    <rect x={640} y={570} width={220} height={34} rx={4} fill="#fff" /><path d={`M700 590 L${760 + Math.sin(frame / 5) * 30} 590`} stroke="#1f3b57" strokeWidth={4} />
    <KidFigure x={760} y={520} frame={frame} arm={-60} />
    <rect x={1300} y={560} width={160} height={30} fill="#a57a52" /><rect x={1300} y={420} width={24} height={150} fill="#a57a52" /><rect x={1310} y={590} width={20} height={210} fill="#a57a52" /><rect x={1430} y={590} width={20} height={210} fill="#a57a52" />
    <text x={1380} y={880} textAnchor="middle" fontSize={40} fontWeight={700} fill="#6b4a2e">мугалимдин орду бош…</text>
  </Room>
);

// Flames that turn into a cool green garden (Anbiya 21:69) — no person is drawn.
const FireGarden: React.FC<P> = ({ frame, t }) => {
  const k = easeInOut(Math.max(0, Math.min(1, (t - 0.3) / 0.45)));
  return (
    <g>
      <rect width={1920} height={1080} fill={`rgb(${Math.round(60 + 131 * k)}, ${Math.round(30 + 197 * k)}, ${Math.round(30 + 217 * k)})`} />
      <rect y={820} width={1920} height={260} fill={k > 0.5 ? GRASS : "#5a3a2a"} />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 200 + i * 190, h = 260 + noise(i) * 160 + Math.sin(frame / 4 + i) * 20;
        return (
          <g key={i} transform={`translate(${x} 830)`}>
            <path d={`M-70 0 C-80 ${-h * 0.5} -20 ${-h * 0.7} 0 ${-h} C20 ${-h * 0.7} 80 ${-h * 0.5} 70 0 Z`} fill="#ff8a2a" opacity={1 - k} />
            <path d={`M-35 0 C-40 ${-h * 0.35} -10 ${-h * 0.5} 0 ${-h * 0.7} C10 ${-h * 0.5} 40 ${-h * 0.35} 35 0 Z`} fill="#ffd34d" opacity={1 - k} />
            <g opacity={k}><path d="M0 0 L0 -120" stroke={GRASS_DARK} strokeWidth={10} /><circle cy={-140} r={46 * k} fill={["#ff8fb1", "#ffd34d", "#ffffff"][i % 3]} /><circle cy={-140} r={14} fill="#f2b32a" /></g>
          </g>
        );
      })}
      <text x={960} y={160} textAnchor="middle" fontSize={56} fontWeight={700} fill="#fff" opacity={k}>«…салкын жана тынч бол!»</text>
    </g>
  );
};

// Night sky full of galaxies above, a line of ants carrying grains below (provision for every creature, Hud 11:6).
const AntsGalaxy: React.FC<P> = ({ frame }) => (
  <g>
    <rect width={1920} height={1080} fill={NIGHT} />
    {Array.from({ length: 120 }).map((_, i) => <circle key={i} cx={noise(i) * 1920} cy={noise(i + 300) * 640} r={1 + noise(i + 7) * 2.5} fill="#fff" opacity={0.5 + 0.5 * Math.sin(frame / 15 + i)} />)}
    {[[500, 260, 0.9], [1400, 200, 0.7]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${frame / 8 + i * 40}) scale(${s})`}>
        {[0, 1, 2].map((j) => <ellipse key={j} rx={200 - j * 50} ry={60 - j * 15} fill="#b9a7ff" opacity={0.18 + j * 0.12} />)}<circle r={18} fill="#fff6c8" />
      </g>
    ))}
    <rect y={760} width={1920} height={320} fill="#5a4a3a" />
    {Array.from({ length: 14 }).map((_, i) => {
      const x = ((i * 140 + frame * 1.6) % 2100) - 100;
      return <g key={i} transform={`translate(${x} ${900 + Math.sin(i) * 20})`} fill="#1d1d1d"><ellipse cx={-22} rx={9} ry={7} /><ellipse rx={11} ry={8} /><ellipse cx={26} rx={14} ry={10} /><circle cx={-34} cy={-14} r={8} fill="#f2e2a0" /></g>;
    })}
  </g>
);

const REGISTRY: Record<CutawayId, React.FC<P>> = {
  nature: Nature, doors: Doors, window: Window, space: (p) => <Space {...p} />, spaceReturn: (p) => <Space {...p} back />,
  glacier: Glacier, villages: Villages, growth: Growth, snakeRopes: SnakeRopes, seaCrown: SeaCrown, bekturRoom: BekturRoom,
  aizadaBed: AizadaBed, homeKitchen: HomeKitchen, streetBread: StreetBread, orchard: Orchard, race: Race, dawnRoom: DawnRoom,
  neighbor: Neighbor, electrician: Electrician, wheatField: WheatField, kettle: Kettle, winterBirds: WinterBirds, garage: Garage,
  brightPath: BrightPath, oven: Oven,
  pillarHouse: PillarHouse, desertMosque: DesertMosque, guestLight: GuestLight, pilgrimsWhite: PilgrimsWhite,
  winterSpring: WinterSpring, melonField: MelonField, queueShop: QueueShop, shareApples: ShareApples,
  homeworkDesk: HomeworkDesk, fireGarden: FireGarden, antsGalaxy: AntsGalaxy,
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
