import React from "react";
import { theme } from "../theme";

// Classroom background (1920×1080): wall, floor, window with a view, plant, bookshelf, two desks.
export const Classroom: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
    <rect width={1920} height={1080} fill={theme.wall} />
    <rect y={680} width={1920} height={30} fill={theme.wallDark} />
    <rect y={710} width={1920} height={370} fill={theme.floor} />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <line key={i} x1={0} y1={760 + i * 36} x2={1920} y2={760 + i * 36} stroke={theme.floorLine} strokeWidth={2} opacity={0.5} />)}
    {/* window with sunny view */}
    <rect x={70} y={110} width={380} height={400} rx={14} fill="#8a6240" />
    <rect x={90} y={130} width={340} height={360} fill="#bfe3f7" />
    <circle cx={330} cy={210} r={40} fill="#ffd34d" />
    <path d="M90 400 L170 300 L240 380 L300 320 L430 420 L430 490 L90 490 Z" fill="#7d8fa3" />
    <path d="M90 440 Q200 400 300 440 T430 430 L430 490 L90 490 Z" fill="#7fbf6a" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={((140 + i * 110 + frame * 0.25) % 340) + 90} cy={170 + i * 30} rx={36} ry={14} fill="#fff" opacity={0.9} />)}
    <rect x={255} y={130} width={10} height={360} fill="#8a6240" /><rect x={90} y={305} width={340} height={10} fill="#8a6240" />
    <rect x={60} y={510} width={400} height={18} rx={4} fill="#6b4a2e" />
    {/* plant */}
    <g transform="translate(300 710)">
      <path d="M-40 0 L-30 -90 L30 -90 L40 0 Z" fill="#c47a4b" />
      {[-40, -10, 20, 50].map((a, i) => <path key={i} d={`M0 -90 q${a} -90 ${a * 1.6} -150`} stroke="#4e9a46" strokeWidth={16} fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(frame / 40 + i) * 2} 0 -90)`} />)}
    </g>
    {/* bookshelf right */}
    <rect x={1800} y={120} width={100} height={560} fill="#8a6240" />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={1808} y={140 + r * 135} width={84} height={10} fill="#6b4a2e" />
        {[0, 1, 2, 3].map((b) => <rect key={b} x={1812 + b * 20} y={150 + r * 135 + (b % 2) * 8} width={16} height={100 - (b % 2) * 8} rx={3} fill={["#c8443a", "#2a7f5a", "#1f3b57", "#d9a21b"][(b + r) % 4]} />)}
      </g>
    ))}
    {/* two desks for the children */}
    {[1190, 1500].map((x, i) => (
      <g key={i}>
        <rect x={x} y={840} width={260} height={28} rx={6} fill="#a57a52" />
        <rect x={x + 16} y={868} width={18} height={150} fill="#8a6240" /><rect x={x + 226} y={868} width={18} height={150} fill="#8a6240" />
        <rect x={x + 60} y={800} width={120} height={14} rx={4} fill="#f5f1e6" opacity={0} />
      </g>
    ))}
    {/* small poster: five stars (lesson theme) */}
    <rect x={1620} y={150} width={150} height={100} rx={8} fill="#fff" stroke="#d9d3bf" strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d="M0 -12 L3.5 -3.5 L12 -3 L5.5 3 L7.5 12 L0 7 L-7.5 12 L-5.5 3 L-12 -3 L-3.5 -3.5 Z" fill={theme.star} transform={`translate(${1650 + i * 23} 200) scale(0.9)`} />)}
  </svg>
);
