#!/usr/bin/env python3
"""Audio join QA for a rendered lesson MP4 (AUDIO_JOIN_QA_RULES.md) — blocking check before publishing.

    python3 scripts/audio_join_qa.py FILM.mp4 --timeline video/src/timeline-R04.json [--out report.json] [--clips DIR]

What it checks (on the REAL exported audio, decoded to 48 kHz mono float):
- every voice-clip boundary (start and end of each line's clip) and every chapter seam: a click is an isolated
  jump within ±3 ms of the join that is ≥ 4× sharper than the neighbouring speech itself (99th percentile of
  |second difference| over 100 ms) and ≥ -50 dBFS (see edge_click);
- the same impulse test over every stretch of near-silence in the whole film (clicks not at a predicted boundary);
- clipping (|sample| ≥ 0.999), DC offset, loudness jumps between consecutive lines (> 9 dB short-term RMS);
- with --clips: every source clip — level of the first/last 5 ms (a clip that starts/ends mid-waveform clicks when
  it is cut), DC offset, peak.
Exit code 1 when anything suspicious is found; the listed timecodes must then be listened to in the MP4.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000


def decode(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def tc(sec):
    m, s = divmod(sec, 60)
    h, m = divmod(int(m), 60)
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def db(x):
    return 20 * np.log10(max(x, 1e-9))


def edge_click(x, i, side):
    """Click test at an exact join sample i: the largest |second difference| within ±3 ms of i, compared with the
    "own sharpness" of the neighbouring audio (99th percentile of |second difference| over the 100 ms on the
    sound side of the join, ±3 ms excluded). Natural speech onsets/offsets stay at ratio ≈ 1–2; a hard cut or an
    inserted transient is an isolated outlier. Returns (ratio, abs_jump, position)."""
    e = int(0.003 * SR)
    a, b = max(2, i - e), min(len(x) - 2, i + e)
    if b - a < 3:
        return 0.0, 0.0, i
    d2 = np.abs(np.diff(x[a - 1:b + 1], 2))
    k = int(np.argmax(d2))
    if side == "after":
        ref = np.abs(np.diff(x[b:min(len(x), b + int(0.1 * SR))], 2))
    else:
        ref = np.abs(np.diff(x[max(0, a - int(0.1 * SR)):a], 2))
    ref_level = (np.percentile(ref, 99) if len(ref) > 10 else 0.0) + 10 ** (-70 / 20)
    return float(d2[k] / ref_level), float(d2[k]), a + k


def boundaries(timeline):
    t = json.loads(Path(timeline).read_text(encoding="utf-8"))
    fps = t["fps"]
    out = []
    for sc in t["scenes"]:
        for b in sc["beats"]:
            if b["type"] == "line" and b.get("audio"):
                s = (sc["from"] + b["from"]) / fps
                out.append({"key": b["key"], "kind": "clip_start", "t": s, "audio": b["audio"]})
                out.append({"key": b["key"], "kind": "clip_end", "t": None, "audio": b["audio"], "start": s})
    for c in t["chapters"][1:]:
        out.append({"key": c["id"], "kind": "chapter_seam", "t": c["from"] / fps})
    return t, out


def clip_len(path):
    """Decoded length (what the player actually plays), not the container duration: MP3 encoder delay/padding
    make ffprobe's duration differ by ~25 ms, which would miss a join by more than the ±3 ms test window."""
    return len(decode(path)) / SR


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mp4")
    ap.add_argument("--timeline", required=True)
    ap.add_argument("--clips", nargs="*", default=[], help="clip directories (for clip-end times and clip checks)")
    ap.add_argument("--out")
    ap.add_argument("--mix-report", help="mix_audio.py report: exact spans of the cleaned clips (their real joins)")
    ap.add_argument("--score", type=float, default=4.0, help="edge-click ratio threshold")
    ap.add_argument("--abs-db", type=float, default=-50.0, help="minimum absolute jump (dBFS)")
    ap.add_argument("--chapter", help="the MP4 is this single chapter of the timeline (times relative to it)")
    a = ap.parse_args()

    x = decode(a.mp4)
    t, bnds = boundaries(a.timeline)
    if a.chapter:
        ch = next(c for c in t["chapters"] if c["id"] == a.chapter)
        c0, c1 = ch["from"] / t["fps"], (ch["from"] + ch["frames"]) / t["fps"]
        bnds = [dict(b, t=b["t"] - c0 if b["t"] is not None else None, start=b.get("start", 0) - c0) for b in bnds
                if c0 <= (b["t"] if b["t"] is not None else b["start"]) < c1 and b["kind"] != "chapter_seam"]
    dirs = [Path(d) for d in a.clips]
    find = lambda n: next((d / n for d in dirs if (d / n).exists()), None)  # noqa: E731
    durs = {}
    issues, checked = [], 0

    for bd in bnds:
        if bd["kind"] == "clip_end":
            f = find(bd["audio"])
            if not f:
                continue
            durs.setdefault(bd["audio"], clip_len(f))
            bd["t"] = bd["start"] + durs[bd["audio"]]
        i = int(bd["t"] * SR)
        if i >= len(x) - 10:
            continue
        checked += 1
        score, jump, pos = edge_click(x, i, "after" if bd["kind"] == "clip_start" else "before")
        if score >= a.score and db(jump) >= a.abs_db:
            issues.append({"type": "click", "at": tc(pos / SR), "sec": round(pos / SR, 3), "boundary": bd["kind"], "key": bd["key"],
                           "score": round(score, 1), "jump_dbfs": float(round(db(jump), 1))})

    # every real sound edge in the signal (silence → sound and sound → silence, 1 ms frames, -70 dBFS), wherever it
    # is — independent of clip metadata, so trimmed/faded clip edges and anything unexpected are tested too
    review, joins, spans = [], [], []
    if a.mix_report:
        for k, v in json.loads(Path(a.mix_report).read_text(encoding="utf-8"))["lines"].items():
            joins += [v["at_s"], v["at_s"] + v["out_s"]]
            spans.append((v["at_s"], v["at_s"] + v["out_s"], k))
    ms = SR // 1000
    lv = 20 * np.log10(np.sqrt((x[: len(x) // ms * ms].reshape(-1, ms) ** 2).mean(axis=1)) + 1e-12)
    on = lv > -70
    edges = np.flatnonzero(on[1:] != on[:-1]) + 1
    n_edges = 0
    for e in edges:
        i = int(e) * ms
        side = "after" if on[e] else "before"
        n_edges += 1
        score, jump, pos = edge_click(x, i, side)
        if score >= a.score and db(jump) >= a.abs_db and round(pos / SR, 1) not in {round(v["sec"], 1) for v in issues}:
            sec = pos / SR
            near = [j for j in joins if abs(j - sec) <= 0.020]
            item = {"at": tc(sec), "sec": round(sec, 3), "edge": side, "score": round(score, 1), "jump_dbfs": float(round(db(jump), 1))}
            if near or not joins:
                issues.append({"type": "click_at_join", **item})
            else:
                inside = max((v for v in spans if v[0] <= sec), default=None, key=lambda v: v[0])
                review.append({**item, "line": inside[2] if inside else None,
                               "offset_in_clip_s": round(sec - inside[0], 3) if inside else None})

    # whole-film scan: impulses inside near-silence (anything audible as a tick between words)
    hop = int(0.010 * SR)
    frames = x[: len(x) // hop * hop].reshape(-1, hop)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    quiet = np.where(rms < 10 ** (-50 / 20))[0]
    d2 = np.abs(np.diff(x, 2))
    floor = np.median(d2[: len(d2) // hop * hop].reshape(-1, hop).max(axis=1)) + 1e-7
    known = {round(i["sec"], 1) for i in issues}
    for q in quiet:
        s = q * hop
        seg = d2[s:s + hop]
        if not len(seg):
            continue
        m = seg.max()
        if db(m) >= -45 and m / floor >= 30:
            sec = (s + int(np.argmax(seg)) + 1) / SR
            if round(sec, 1) not in known:
                known.add(round(sec, 1))
                issues.append({"type": "click_in_silence", "at": tc(sec), "sec": round(sec, 3), "jump_dbfs": float(round(db(m), 1))})

    peak = float(np.abs(x).max())
    nclip = int((np.abs(x) >= 0.999).sum())
    if nclip:
        issues.append({"type": "clipping", "samples": nclip, "peak": round(peak, 4)})
    dc = float(x.mean())
    if abs(dc) > 0.002:
        issues.append({"type": "dc_offset", "value": round(dc, 5)})

    # loudness jumps between consecutive voiced lines (median RMS of each clip region)
    lines = [b for b in bnds if b["kind"] == "clip_start"]
    lv = []
    for b in lines:
        f = find(b["audio"])
        L = durs.get(b["audio"]) or (clip_len(f) if f else 2.0)
        seg = x[int(b["t"] * SR): int((b["t"] + L) * SR)]
        if len(seg) > SR // 4:
            w = seg[: len(seg) // 2400 * 2400].reshape(-1, 2400)
            r = np.sqrt((w ** 2).mean(axis=1))
            r = r[r > 10 ** (-45 / 20)]
            if len(r):
                lv.append((b, db(float(np.median(r)))))
    for (b0, l0), (b1, l1) in zip(lv, lv[1:]):
        if abs(l1 - l0) > 9:
            issues.append({"type": "loudness_jump", "at": tc(b1["t"]), "from": b0["key"], "to": b1["key"], "db": round(l1 - l0, 1)})

    clip_report = []
    seen = set()
    for b in lines:
        f = find(b["audio"])
        if not f or b["audio"] in seen:
            continue
        seen.add(b["audio"])
        c = decode(f)
        n = int(0.005 * SR)
        head, tail = float(np.sqrt((c[:n] ** 2).mean())), float(np.sqrt((c[-n:] ** 2).mean()))
        clip_report.append({"file": b["audio"], "head_dbfs": round(db(head), 1), "tail_dbfs": round(db(tail), 1),
                            "dc": round(float(c.mean()), 5), "peak": round(float(np.abs(c).max()), 3)})
    hot_edges = [c for c in clip_report if c["head_dbfs"] > -45 or c["tail_dbfs"] > -45]

    rep = {"file": str(a.mp4), "duration_s": round(len(x) / SR, 3), "boundaries_checked": checked, "sound_edges_checked": n_edges,
           "peak_dbfs": round(db(peak), 2), "dc_offset": round(dc, 6), "issues": issues,
           "clips_checked": len(clip_report), "clips_with_hot_edges": hot_edges,
           "listen_review_inside_voice": review}
    if a.out:
        Path(a.out).write_text(json.dumps(rep, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{a.mp4}: {rep['duration_s']} s, boundaries {checked}, peak {rep['peak_dbfs']} dBFS, DC {rep['dc_offset']}")
    print(f"sound edges checked {n_edges}; source clips checked {len(clip_report)}, of them with non-silent first/last 5 ms "
          f"(cleaned by audio_prep.py before mixing): {len(hot_edges)}")
    for i in issues[:60]:
        print("  ", i)
    if review:
        print(f"sharp edges INSIDE the TTS voice (not joins; non-blocking, listen): {len(review)}")
        for r in review:
            print("   listen:", r)
    print("AUDIO JOIN QA:", "OK" if not issues else f"{len(issues)} issue(s) — listen to these timecodes")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
