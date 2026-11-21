#!/usr/bin/env python3
"""LESSON-80 blocking audio QA of a rendered lesson (AUDIO_JOIN_QA_RULES.md, main). numpy + ffmpeg only.

    python3 shared/audio/join_qa.py film.mp4 joins.json [--report out.json] [--clips-dir DIR]

joins.json: [{"key": "ch01-s02#3", "start": 12.345, "end": 17.890}, ...] — absolute seconds of every voice clip in the
film (project adapters write it from their timeline; see production/vid-002/scripts/audio_joins.py).

Checks (exit 1 on any failure — the film must not be published):
  * isolated burst / click near every clip boundary: a 5 ms frame ≥ BURST_DB louder than the quiet context (both
    sides quiet for ≥ 100 ms) within [end-200 ms, end+40 ms] and [start-40 ms, start+200 ms];
  * step discontinuity: |x[n]-x[n-1]| ≥ STEP with near-silence on both sides near a boundary (a click in silence);
  * clipping (|x| ≥ 0.999) anywhere; DC offset; loudness jumps between consecutive clips (> JUMP_DB in RMS);
  * truncated word: speech energy in the last 20 ms of a clip window (clip ends while still loud).
It lists every suspicious timestamp so a person can LISTEN to it in the MP4 — the automatic check does not replace
listening (the rule requires both).
"""
import argparse
import json
import subprocess
import sys

import numpy as np

SR = 48000
FR = int(SR * 0.005)
BURST_DB = 20.0
QUIET_DBFS = -50.0
STEP = 0.08
JUMP_DB = 9.0
MAX_ISLAND_MS = 160
STEP_CTX_DBFS = -45.0


def load(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32)


def db(v):
    return 20 * np.log10(np.maximum(v, 1e-9))


def frames_rms(x, a, b):
    a, b = max(0, a), min(len(x), b)
    n = (b - a) // FR
    if n <= 0:
        return np.array([]), a
    seg = x[a:a + n * FR].reshape(n, FR)
    return np.sqrt(np.mean(seg ** 2, axis=1)), a


def isolated_events(x, a, b):
    """Short sound islands (≤ MAX_ISLAND_MS) in [a,b) louder than QUIET+BURST_DB with ≥ 100 ms of quiet on both sides:
    a click, or a stray TTS fragment glued to a clip edge (real speech never sits isolated like that at a clip edge)."""
    pad = int(SR * 0.45)
    rms, base = frames_rms(x, a - pad, b + pad)
    out = []
    if len(rms) == 0:
        return out
    L = db(rms)
    loud = L > QUIET_DBFS
    ctx = int(SR * 0.18) // FR  # same 180 ms separation that clip_clean uses to tell an artifact from a short word
    i = 0
    while i < len(L):
        if loud[i]:
            j = i
            while j < len(L) and loud[j]:
                j += 1
            t0 = base + i * FR
            short = (j - i) * FR <= SR * MAX_ISLAND_MS / 1000
            q_before = i >= ctx and not loud[i - ctx:i].any()
            q_after = j + ctx <= len(L) and not loud[j:j + ctx].any()
            if a <= t0 < b and short and q_before and q_after and L[i:j].max() > QUIET_DBFS + BURST_DB:
                out.append((t0 / SR, float(L[i:j].max())))
            i = j
        else:
            i += 1
    return out


def steps(x, a, b):
    """Sample-to-sample jump ≥ STEP where the 20 ms on BOTH sides is near-silent (< STEP_CTX_DBFS): a click in silence.
    (Jumps inside speech — consonant transients — are normal and are not reported.)"""
    a, b = max(1, a), min(len(x) - 1, b)
    d = np.abs(np.diff(x[a - 1:b]))
    w = int(SR * 0.02)
    out = []
    for i in np.where(d >= STEP)[0]:
        t = a + i
        pre = x[max(0, t - w):t - 2]
        post = x[t + 2:t + w]
        if len(pre) and len(post) and db(np.sqrt(np.mean(pre ** 2))) < STEP_CTX_DBFS and db(np.sqrt(np.mean(post ** 2))) < STEP_CTX_DBFS:
            out.append((t / SR, float(d[i])))
            if len(out) >= 3:
                break
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("film"); ap.add_argument("joins"); ap.add_argument("--report")
    a = ap.parse_args()
    x = load(a.film)
    joins = sorted(json.load(open(a.joins)), key=lambda j: j["start"])
    problems = []
    clipped = int(np.sum(np.abs(x) >= 0.999))
    if clipped:
        problems.append({"type": "clipping", "samples": clipped})
    dc = float(np.mean(x))
    if abs(dc) > 0.002:
        problems.append({"type": "dc_offset", "value": dc})
    prev_rms = None
    for j in joins:
        s, e = int(j["start"] * SR), int(j["end"] * SR)
        for zone, (za, zb) in (("end", (e - int(SR * 0.25), e + int(SR * 0.25))), ("start", (s - int(SR * 0.25), s + int(SR * 0.25)))):
            for t, lv in isolated_events(x, za, zb):
                problems.append({"type": "burst", "key": j["key"], "at": round(t, 3), "zone": zone, "dbfs": round(lv, 1)})
            for t, d in steps(x, za, zb):
                problems.append({"type": "step", "key": j["key"], "at": round(t, 3), "zone": zone, "jump": round(d, 3)})
        tail, _ = frames_rms(x, e - 4 * FR, e)
        if len(tail) and db(tail).max() > -30:
            problems.append({"type": "loud_clip_end", "key": j["key"], "at": round(e / SR, 3), "dbfs": round(float(db(tail).max()), 1)})
        seg = x[s:e]
        if len(seg):
            r = db(np.sqrt(np.mean(seg ** 2)))
            if prev_rms is not None and abs(r - prev_rms) > JUMP_DB:
                problems.append({"type": "loudness_jump", "key": j["key"], "at": round(s / SR, 3), "delta_db": round(float(r - prev_rms), 1)})
            prev_rms = r
    rep = {"film": a.film, "joins": len(joins), "clipped_samples": clipped, "dc": round(dc, 5), "problems": problems,
           "verdict": "PASS" if not problems else "FAIL"}
    if a.report:
        json.dump(rep, open(a.report, "w"), ensure_ascii=False, indent=1)
    print(f"{rep['verdict']}: {len(joins)} clip joins, {len(problems)} problem(s), clipped samples {clipped}, dc {dc:+.5f}")
    for p in problems[:60]:
        at = p.get("at")
        print("  ", p["type"], p.get("key", ""), f"{int(at // 60):02d}:{at % 60:06.3f}" if at is not None else "", {k: v for k, v in p.items() if k not in ("type", "key", "at")})
    sys.exit(0 if not problems else 1)


if __name__ == "__main__":
    main()
