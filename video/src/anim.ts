import { interpolate } from "remotion";

// Deterministic pseudo-noise in [0,1) — cheap, frame-stable, no Math.random at render time.
export const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
// Smooth 1D noise (value noise with cosine interpolation) at position t with a given seed.
export const smoothNoise = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const u = (1 - Math.cos(f * Math.PI)) / 2;
  return noise(i + seed * 101) * (1 - u) + noise(i + 1 + seed * 101) * u;
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => { const c = clamp01(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

export const fadeInOut = (frame: number, total: number, fade = 12) =>
  interpolate(frame, [0, fade, Math.max(fade + 1, total - fade), total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

// Mouth openness for a speaking character: syllable-like oscillation with varying amplitude. Silent in the
// trailing gap of a line (LINE_GAP = 0.6 s = 18 frames) so lips close before the next speaker starts.
export const mouthOpen = (frameInBeat: number, beatFrames: number, seed: number) => {
  const tail = beatFrames - 18;
  if (frameInBeat >= tail || frameInBeat < 2) return 0;
  const syll = Math.abs(Math.sin(frameInBeat * 0.78 + seed));
  const amp = 0.45 + 0.55 * smoothNoise(frameInBeat / 9, seed);
  const pauses = smoothNoise(frameInBeat / 22, seed + 7) > 0.82 ? 0.15 : 1; // tiny breaths between words
  return clamp01(syll * amp * pauses);
};

// Eye blink: closed for ~4 frames roughly every 3–5 s.
export const blink = (frame: number, seed: number) => {
  const period = 95 + Math.floor(noise(seed) * 60);
  const phase = Math.floor(noise(seed + 3) * period);
  const k = (frame + phase) % period;
  if (k < 2) return k / 2;
  if (k < 5) return 1;
  if (k < 7) return (7 - k) / 2;
  return 0;
};

// Approach a target value with critically damped motion based on time since the pose change.
export const settle = (fromV: number, toV: number, framesSince: number, dur = 14) => fromV + (toV - fromV) * easeOut(framesSince / dur);
