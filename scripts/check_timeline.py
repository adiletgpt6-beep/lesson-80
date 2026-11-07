#!/usr/bin/env python3
"""QA gate for video/src/timeline.json before a render (lesson 003).

Fails (exit 1) when:
- a voiced line has the exact text of a `blocked` line in script/chapters/*.json (unverified wording);
- a line has no audio clip, the clip file is missing, or the clip is longer than its beat (audio/video desync);
- a scene has no voiced line (empty scene);
- a cutaway key in video/src/art/scenePlan.ts points to a missing beat or to a beat of the wrong type
  (visualCutaways → visual beats, lineCutaways → ustaz lines);
- the film is outside 55–65 minutes.
Reports the longest stretches without speech (titles + visual beats + pauses).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CH = ROOT / "lessons/003/script/chapters"
CLIPS = ROOT / "lessons/003/audio/clips"
MANIFEST = ROOT / "lessons/003/audio/manifest.json"
TL = ROOT / "video/src/timeline.json"
PLAN = ROOT / "video/src/art/scenePlan.ts"


def main() -> int:
    t = json.loads(TL.read_text(encoding="utf-8"))
    fps = t["fps"]
    errors = []
    blocked = set()
    for p in sorted(CH.glob("ch*.json")):
        for sc in json.loads(p.read_text(encoding="utf-8"))["scenes"]:
            for b in sc["beats"]:
                if b["type"] == "line" and b.get("blocked"):
                    blocked.add(b["text"].strip())
    clips = json.loads(MANIFEST.read_text(encoding="utf-8"))["clips"]
    beats = {}
    for sc in t["scenes"]:
        lines = [b for b in sc["beats"] if b["type"] == "line"]
        if not lines:
            errors.append(f"{sc['id']}: scene without voiced lines")
        for b in sc["beats"]:
            beats[b["key"]] = b
            if b["type"] != "line":
                continue
            if b["text"].strip() in blocked:
                errors.append(f"{b['key']}: voices the text of a blocked line")
            if not b.get("audio"):
                errors.append(f"{b['key']}: no audio")
                continue
            if not (CLIPS / b["audio"]).exists():
                errors.append(f"{b['key']}: missing clip {b['audio']}")
            c = clips.get(b["key"])
            if not c or c["file"] != b["audio"]:
                errors.append(f"{b['key']}: clip not in audio manifest")
            elif c["seconds"] * fps > b["frames"] + 1:
                errors.append(f"{b['key']}: clip {c['seconds']:.2f}s longer than beat {b['frames'] / fps:.2f}s")
    src = PLAN.read_text(encoding="utf-8")
    sections = re.split(r"export const (\w+)", src)
    for name, body in zip(sections[1::2], sections[2::2]):
        if name not in ("visualCutaways", "lineCutaways"):
            continue
        for key in re.findall(r'"(ch\d\d-s\d\d#\w+)"\s*:', body):
            b = beats.get(key)
            if not b:
                errors.append(f"{name}: {key} not in timeline")
            elif name == "visualCutaways" and b["type"] != "visual":
                errors.append(f"{name}: {key} is a {b['type']} beat, not visual")
            elif name == "lineCutaways" and not (b["type"] == "line" and b["speaker"] == "ustaz"):
                errors.append(f"{name}: {key} is not an ustaz line")
    # silence report: absolute stretches without a line beat
    spans = sorted((sc["from"] + b["from"], sc["from"] + b["from"] + b["frames"]) for sc in t["scenes"] for b in sc["beats"] if b["type"] == "line")
    gaps, cur = [], 0
    for a, e in spans:
        if a > cur:
            gaps.append((a - cur, cur))
        cur = max(cur, e)
    gaps.sort(reverse=True)
    minutes = t["durationInFrames"] / fps / 60
    if not 55 <= minutes <= 65:
        errors.append(f"duration {minutes:.2f} min outside 55–65")
    n_lines = sum(1 for b in beats.values() if b["type"] == "line")
    print(f"timeline: {len(t['scenes'])} scenes, {n_lines} voiced lines, {t['durationInFrames']} frames = {minutes:.2f} min")
    print("longest stretches without speech: " + ", ".join(f"{g / fps:.1f}s @ {s // fps // 60:02d}:{s // fps % 60:02d}" for g, s in gaps[:6]))
    print(f"blocked lines in chapters: {len(blocked)}, voiced as written: 0" if not any("blocked" in e for e in errors) else "")
    for e in errors:
        print("ERROR", e)
    print("OK" if not errors else f"{len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
