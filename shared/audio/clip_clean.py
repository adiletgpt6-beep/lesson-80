#!/usr/bin/env python3
"""LESSON-80 shared audio pipeline step: click-free TTS clips (AUDIO_JOIN_QA_RULES.md, main).

Diagnosis (2026-11-21, lesson 1 = R01): ElevenLabs clips generated with previous_text/next_text sometimes END with a
short burst of the NEXT utterance's onset (20–120 ms, up to 54 % of the clip peak) after ~0.3–0.5 s of silence, and
sometimes START with the tail of the previous one. Playback stops/starts mid-waveform → audible click ("трык").

What clean() does, per clip — never touching speech:
  1. removes DC offset;
  2. finds an "edge burst": a sound island that TOUCHES the clip edge (within EDGE_MS), is short (≤ MAX_BURST_MS) and is
     separated from the speech by a silence gap ≥ MIN_GAP_MS — replaces it with silence (clip length is kept, so the
     timeline and lip-sync do not move);
  3. applies a short fade-in/fade-out (default 8 ms / 15 ms) that ends exactly at the clip edges, where the signal is
     now silence, so word endings, Arabic names and honorific formulas are not shortened;
  4. lowers the clip only if its peak exceeds −1.4 dBFS (headroom for AAC; never raises it);
  5. checks for clipping and reports peak/DC/edge levels.
No noise gate, no compression, no change of voice. Usable from any project: numpy + ffmpeg only.

    python3 shared/audio/clip_clean.py in.mp3 out.mp3        # one clip
    from clip_clean import analyse, clean_file               # library
"""
import json
import subprocess
import sys

import numpy as np

SR = 44100
WIN_MS = 10
SIL_DB = -42.0          # silence threshold relative to clip peak (10 ms RMS)
EDGE_MS = 40            # an artifact island must start/end this close to the clip edge
MAX_BURST_MS = 160      # longest island treated as an artifact
MIN_GAP_MS = 180        # silence that must separate it from the speech
FADE_IN_MS, FADE_OUT_MS = 8, 15
PEAK_MAX = 0.85         # −1.4 dBFS: headroom so AAC encoding of the mix never clips


def load(path, sr=SR):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).copy()


def save(x, path, sr=SR):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "192k", str(path)], input=x.astype(np.float32).tobytes(), check=True)


def islands(x, sr=SR):
    w = int(sr * WIN_MS / 1000)
    n = len(x) // w
    if n == 0:
        return [], w
    rms = np.sqrt(np.mean(x[: n * w].reshape(n, w) ** 2, axis=1))
    thr = (np.abs(x).max() + 1e-9) * 10 ** (SIL_DB / 20)
    on = rms > thr
    out, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            out.append((i * w, j * w))
            i = j
        else:
            i += 1
    return out, w


def analyse(x, sr=SR):
    pk = float(np.abs(x).max() + 1e-9)
    e = int(sr * 0.005)
    return {"peak": round(pk, 4), "dc": round(float(np.mean(x)), 5),
            "head5ms": round(float(np.abs(x[:e]).max()) / pk, 3), "tail5ms": round(float(np.abs(x[-e:]).max()) / pk, 3),
            "clipped": int(np.sum(np.abs(x) >= 0.999))}


def clean(x, sr=SR):
    x = x - np.mean(x)
    isl, w = islands(x, sr)
    removed = []
    edge, mx, gap = sr * EDGE_MS // 1000, sr * MAX_BURST_MS // 1000, sr * MIN_GAP_MS // 1000
    if len(isl) >= 2:
        a, b = isl[-1]
        pa, pb = isl[-2]
        if len(x) - b <= edge + w and b - a <= mx and a - pb >= gap:
            x[a:] = 0.0
            removed.append(("tail", round(a / sr, 3), round((len(x) - a) / sr, 3)))
            isl = isl[:-1]
    if len(isl) >= 2:
        a, b = isl[0]
        na, nb = isl[1]
        if a <= edge and b - a <= mx and na - b >= gap:
            x[:b] = 0.0
            removed.append(("head", 0.0, round(b / sr, 3)))
    pk = float(np.abs(x).max())
    if pk > PEAK_MAX:
        x *= PEAK_MAX / pk
        removed.append(("gain_db", round(20 * np.log10(PEAK_MAX / pk), 2), 0))
    fi, fo = int(sr * FADE_IN_MS / 1000), int(sr * FADE_OUT_MS / 1000)
    x[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)
    x[-fo:] *= np.linspace(1, 0, fo, dtype=np.float32)
    return x, removed


def clean_file(src, dst):
    x = load(src)
    before = analyse(x)
    y, removed = clean(x)
    save(y, dst)
    after = analyse(load(dst))
    return {"before": before, "after": after, "removed": removed}


if __name__ == "__main__":
    print(json.dumps(clean_file(sys.argv[1], sys.argv[2]), ensure_ascii=False))
