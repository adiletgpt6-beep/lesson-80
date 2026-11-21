#!/usr/bin/env python3
"""Lip-sync check: where each voice clip actually sounds in the film vs where the timeline puts it (cross-correlation).

    python3 shared/audio/sync_qa.py film.mp4 joins.json [--max-ms 40] [--every 1]
joins.json entries need "clip" (path to the clip audio) and "start" (s). Exit 1 if any |offset| > max-ms.
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parent))
import join_qa, clip_clean  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("film"); ap.add_argument("joins"); ap.add_argument("--max-ms", type=float, default=40); ap.add_argument("--every", type=int, default=10)
a = ap.parse_args()
SR = join_qa.SR
x = join_qa.load(a.film)
js = [j for j in json.load(open(a.joins)) if j.get("clip")][:: a.every]
worst, bad = 0.0, []
for j in js:
    c = clip_clean.load(j["clip"], SR)[: SR * 2]
    st = int(j["start"] * SR)
    seg = x[max(0, st - SR // 2): st + SR // 2 + len(c)]
    if len(seg) < len(c) or not np.any(c):
        continue
    cor = np.correlate(seg, c, "valid")
    off = (np.argmax(cor) - (st - max(0, st - SR // 2))) / SR * 1000
    worst = max(worst, abs(off))
    if abs(off) > a.max_ms:
        bad.append((j["key"], round(off)))
print(f"sync: {len(js)} clips checked, worst offset {worst:.0f} ms, over {a.max_ms:.0f} ms: {len(bad)} {bad[:8]}")
sys.exit(1 if bad else 0)
