#!/usr/bin/env python3
"""Clean every voice clip of a lesson with shared/audio/clip_clean.py (AUDIO_JOIN_QA_RULES.md). Idempotent.

    LESSON=R01 python3 production/vid-002/scripts/audio_clean_lesson.py

The ElevenLabs original stays untouched (`raw_file`); the cleaned clip `<stem>.c1.mp3` becomes `file` in the manifest,
with the cleaning report in `clean`. Clip length is unchanged, so the timeline stays valid. tts_generate.py calls this
after new clips; check_timeline.py refuses a timeline with any uncleaned clip.
"""
import json, os, sys
from pathlib import Path
REPO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO / "shared/audio"))
import clip_clean  # noqa: E402

CLEAN_VERSION = "c1"


def main():
    L = os.environ["LESSON"]
    A = REPO / f"lessons/{L}/audio"
    mp = A / "manifest.json"
    man = json.loads(mp.read_text(encoding="utf-8"))
    n = fixed = 0
    for k, v in man["clips"].items():
        if v.get("clean", {}).get("version") == CLEAN_VERSION and (A / "clips" / v["file"]).exists():
            continue
        raw = v.get("raw_file") or v["file"]
        dst = raw.replace(".mp3", f".{CLEAN_VERSION}.mp3")
        rep = clip_clean.clean_file(A / "clips" / raw, A / "clips" / dst)
        v.update({"raw_file": raw, "file": dst, "clean": {"version": CLEAN_VERSION, **rep}})
        n += 1
        fixed += bool([r for r in rep["removed"] if r[0] in ("head", "tail")])
        mp.write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{L}: cleaned {n} clips ({fixed} with an edge burst removed)")


if __name__ == "__main__":
    main()
