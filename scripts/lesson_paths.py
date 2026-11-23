#!/usr/bin/env python3
"""Which lesson the production scripts work on: LESSON env var (default "003").

- 003  — the original one-hour film (lessons/003, video/src/timeline.json). Behaviour unchanged.
- R04 / R05 — new ~30-minute lessons 004 / 005 split from 003 (lessons/R04, lessons/R05,
  video/src/timeline-R04.json …). Their voice clips are reused from lessons/003/audio/clips by hash
  (same text + voice + model + settings) and only new/changed lines live in lessons/R0N/audio/clips.
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSON_ID = os.environ.get("LESSON", "003")
LESSON = ROOT / "lessons" / LESSON_ID
CH_DIR = LESSON / "script/chapters"
META_PATH = LESSON / "script/lesson.json"
META = json.loads(META_PATH.read_text(encoding="utf-8")) if META_PATH.exists() else None
TIMELINE = ROOT / "video/src" / ("timeline.json" if LESSON_ID == "003" else f"timeline-{LESSON_ID}.json")
BASE_AUDIO = ROOT / "lessons/003/audio"  # approved clips of the one-hour film (reused by hash)
CLIP_DIRS = [LESSON / "audio/clips"] + ([BASE_AUDIO / "clips"] + sorted(p for p in (ROOT / "lessons").glob("R0[4-9]/audio/clips")
                                                                 if p != LESSON / "audio/clips") if LESSON_ID != "003" else [])
MINUTES = tuple(META["minutes"]) if META else (55, 65)


def chapter_files():
    if META:
        return [CH_DIR / f"{c}.json" for c in META["chapters"]]
    return sorted(CH_DIR.glob("ch*.json"))


def clip_path(name):
    for d in CLIP_DIRS:
        if (d / name).exists():
            return d / name
    return CLIP_DIRS[0] / name
