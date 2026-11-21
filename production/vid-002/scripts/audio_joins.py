#!/usr/bin/env python3
"""Adapter: absolute voice-clip spans of a lesson timeline → joins.json for shared/audio/join_qa.py.

    LESSON=R01 python3 production/vid-002/scripts/audio_joins.py out.json [--no-cover]
--no-cover: for films rendered before the opening cover existed (timeline shifted by coverFrames).
"""
import json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[3]
L = os.environ["LESSON"]
tl = json.loads((ROOT / f"video/src/lessons/l{L}/timeline.json").read_text(encoding="utf-8"))
man = json.loads((REPO / f"lessons/{L}/audio/manifest.json").read_text(encoding="utf-8"))["clips"]
shift = tl.get("coverFrames", 0) if "--no-cover" in sys.argv else 0
fps = tl["fps"]
out = []
for s in tl["scenes"]:
    for b in s["beats"]:
        if b["type"] == "line" and b.get("audio"):
            st = (s["from"] + b["from"] - shift) / fps
            out.append({"key": b["key"], "start": round(st, 4), "end": round(st + man[b["key"]]["seconds"], 4)})
# chapters are rendered separately and concatenated: check those seams too
for c in tl["chapters"][1:]:
    t = (c["from"] - shift) / fps
    out.append({"key": f"{c['id']}-seam", "start": round(t, 4), "end": round(t, 4)})
Path(sys.argv[1]).write_text(json.dumps(out))
print(f"{L}: {len(out)} joins")
