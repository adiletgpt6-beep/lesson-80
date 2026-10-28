#!/usr/bin/env python3
"""Effective (voiceable) beats of the lesson script — shared by tts_generate.py and lesson_script.py timeline.

Rules (preview version):
- a `blocked` line is never voiced as written;
- if script/ped-replacements.json has a replacement for its key, the replacement text is voiced instead,
  marked ped=True, replaced_from=<blocker>; a `null` replacement drops the line (Arabic recitation → board only);
- a blocked line without an entry is dropped;
- a scene left without any line is dropped entirely (no silent scenes), its visual-only beats included.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSON = ROOT / "lessons/003"
CH_DIR = LESSON / "script/chapters"
REPL_PATH = LESSON / "script/ped-replacements.json"
EXTRA_PATH = LESSON / "script/ped-extra-beats.json"


def chapters():
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(CH_DIR.glob("ch*.json"))]


def replacements():
    if not REPL_PATH.exists():
        return {}
    return json.loads(REPL_PATH.read_text(encoding="utf-8"))["replacements"]


def extra_beats():
    if not EXTRA_PATH.exists():
        return {}
    return json.loads(EXTRA_PATH.read_text(encoding="utf-8"))["extra"]


def with_extra(scene, extra):
    """Append [ПЕД] extra beats (script/ped-extra-beats.json) after the last line of the scene, before trailing visuals."""
    e = extra.get(scene["id"])
    if not e:
        return scene["beats"], 0
    beats = list(scene["beats"])
    last_line = max(i for i, b in enumerate(beats) if b["type"] == "line")
    new = []
    for n, b in enumerate(e["beats"]):
        nb = {**b, "extra": True, "basis": e.get("basis", "")}
        if b["type"] == "line":
            nb.update({"source": [], "ped": True, "blocked": None})
        new.append(nb)
    return beats[:last_line + 1] + new + beats[last_line + 1:], len(new)


def effective_scene(scene, repl, extra=None):
    """Return (beats, stats). Each beat gets `key`, `index` and — for lines — `voiced_text`, `replaced_from`, `dropped`."""
    out, stats = [], {"lines": 0, "blocked": 0, "replaced": 0, "dropped": 0, "extra": 0}
    beats, n_extra = with_extra(scene, extra or {})
    stats["extra"] = sum(1 for b in beats if b.get("extra") and b["type"] == "line")
    x = 0
    for i, b in enumerate(beats):
        if b.get("extra"):
            key = f"{scene['id']}#x{x}"
            x += 1
        else:
            key = f"{scene['id']}#{i - x}"
        if b["type"] != "line":
            out.append({**b, "key": key, "index": i})
            continue
        stats["lines"] += 1
        if not b["blocked"]:
            out.append({**b, "key": key, "index": i, "voiced_text": b["text"], "replaced_from": None})
            continue
        stats["blocked"] += 1
        r = repl.get(key, "MISSING")
        if r == "MISSING" or r is None:
            stats["dropped"] += 1
            continue
        stats["replaced"] += 1
        out.append({**b, "key": key, "index": i, "voiced_text": r["text"], "ped": True, "replaced_from": b["blocked"],
                    "basis": r.get("basis", "")})
    if not any(x["type"] == "line" for x in out):
        return [], {**stats, "scene_dropped": True}
    return out, {**stats, "scene_dropped": False}


def effective_chapters():
    """[(chapter, [(scene, beats, stats), ...]), ...] with empty scenes removed."""
    repl, extra = replacements(), extra_beats()
    result = []
    for ch in chapters():
        scenes = []
        for s in ch["scenes"]:
            beats, stats = effective_scene(s, repl, extra)
            if beats:
                scenes.append((s, beats, stats))
        result.append((ch, scenes))
    return result


def effective_lines(scene_filter=()):
    """Flat list of voiceable lines with prev/next context (for TTS)."""
    out = []
    for ch, scenes in effective_chapters():
        for s, beats, _ in scenes:
            if scene_filter and not any(s["id"] == f or (f.endswith("-") and s["id"].startswith(f)) for f in scene_filter):
                continue
            lines = [b for b in beats if b["type"] == "line"]
            for n, b in enumerate(lines):
                out.append({"key": b["key"], "beat": b, "text": b["voiced_text"],
                            "prev": lines[n - 1]["voiced_text"] if n else "",
                            "next": lines[n + 1]["voiced_text"] if n + 1 < len(lines) else ""})
    return out


if __name__ == "__main__":
    tot = {"lines": 0, "blocked": 0, "replaced": 0, "dropped": 0, "extra": 0}
    for ch, scenes in effective_chapters():
        for s, beats, st in scenes:
            for k in tot:
                tot[k] += st[k]
    unknown = set(replacements()) - {f"{s['id']}#{i}" for ch in chapters() for s in ch["scenes"] for i, b in enumerate(s["beats"]) if b["type"] == "line" and b["blocked"]}
    print(tot, "unknown replacement keys:", sorted(unknown))
