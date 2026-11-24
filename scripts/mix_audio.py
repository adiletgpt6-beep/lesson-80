#!/usr/bin/env python3
"""Whole-lesson soundtrack in one piece, sample-accurate from the timeline (shared audio pipeline).

    LESSON=R04 python3 scripts/mix_audio.py OUT.wav [--report OUT.json]

Every voiced line's clip is cleaned by scripts/audio_prep.py and placed at exactly frame × 1600 samples
(48 kHz / 30 fps) — the same position Remotion uses. Result: one continuous 48 kHz track for the whole lesson,
so there are no chapter joins in the audio at all (rendering chapters separately and `concat -c copy` of their
AAC streams left ~2048 priming samples at every chapter seam: +0.475 s of junk/drift in the 59-min film 003).
The video is rendered by Remotion with --muted and muxed with this track (AAC 192 kb/s, 48 kHz, stereo).
Lines never overlap (the timeline puts ≥ 0.6 s between lines); an overlap would be reported as an error.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audio_prep import SR, decode, prepare, write_wav  # noqa: E402
from lesson_paths import LESSON_ID, TIMELINE, clip_path  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--report")
    ap.add_argument("--timeline", help="timeline JSON (default: this LESSON's, see lesson_paths.py)")
    ap.add_argument("--clips", nargs="*", help="clip directories (default: this LESSON's)")
    a = ap.parse_args()
    t = json.loads(Path(a.timeline or TIMELINE).read_text(encoding="utf-8"))
    find = clip_path
    if a.clips:
        dirs = [Path(d) for d in a.clips]
        find = lambda n: next((d / n for d in dirs if (d / n).exists()), dirs[0] / n)  # noqa: E731
    spf = SR // t["fps"]
    total = t["durationInFrames"] * spf
    mix = np.zeros(total)
    busy = np.zeros(total, dtype=bool)
    cache, report, errors = {}, {}, []
    for sc in t["scenes"]:
        for b in sc["beats"]:
            if b["type"] != "line" or not b.get("audio"):
                continue
            if b["audio"] not in cache:
                cache[b["audio"]] = prepare(decode(find(b["audio"])))
            y, info = cache[b["audio"]]
            s = (sc["from"] + b["from"]) * spf
            e = s + len(y)
            if e > (sc["from"] + b["from"] + b["frames"]) * spf:
                errors.append(f"{b['key']}: clip longer than its beat")
            if busy[s:e].any():
                errors.append(f"{b['key']}: overlaps another line")
            mix[s:e] += y
            busy[s:e] = True
            report[b["key"]] = {"file": b["audio"], "at_s": round(s / SR, 3), **info}
    write_wav(a.out, mix)
    trims = {k: v for k, v in report.items() if "tail_artefact_ms" in v or "head_artefact_ms" in v}
    to_end = [k for k, v in report.items() if v.get("speech_to_end")]
    summary = {"lesson": LESSON_ID, "samples": total, "seconds": total / SR, "lines": len(report),
               "tail_artefacts_removed": sum("tail_artefact_ms" in v for v in report.values()),
               "head_artefacts_removed": sum("head_artefact_ms" in v for v in report.values()),
               "pause_ticks_removed": sum(len(v.get("ticks_removed_at_s", [])) for v in report.values()),
               "peak_limited": sum("peak_gain_db" in v for v in report.values()),
               "speech_to_end": to_end, "peak_dbfs": round(20 * np.log10(np.abs(mix).max() + 1e-12), 2), "errors": errors}
    if a.report:
        Path(a.report).write_text(json.dumps({"summary": summary, "trimmed": trims, "lines": report},
                                             ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
