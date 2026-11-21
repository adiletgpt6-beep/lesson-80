#!/usr/bin/env python3
"""Pronunciation back-check of NEW voice clips of R04/R05 with ElevenLabs Scribe v2 (kir).

    LESSON=R04 python3 production/lesson-004-005/backcheck.py [--keys k1,k2]

Only clips generated for this lesson (manifest entries without `reused_from`) are checked; clips reused from the
approved lesson 003 were already back-checked there. Result: lessons/<LESSON>/audio/backcheck_new.json with the
recognised text, a normalised similarity to the script text and the words Scribe was unsure about.
"""
import argparse
import difflib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from lesson_paths import LESSON, LESSON_ID  # noqa: E402
from scribe_clip import transcribe  # noqa: E402


def norm(t):
    t = t.lower().replace("ё", "е")
    return " ".join(re.findall(r"[a-zа-яөүң]+", t))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keys", default="")
    a = ap.parse_args()
    man = json.loads((LESSON / "audio/manifest.json").read_text(encoding="utf-8"))["clips"]
    out_p = LESSON / "audio/backcheck_new.json"
    res = json.loads(out_p.read_text(encoding="utf-8")) if out_p.exists() else {}
    keys = [k for k in a.keys.split(",") if k] or [k for k, c in man.items() if not c.get("reused_from")]
    for k in keys:
        c = man[k]
        if res.get(k, {}).get("file") == c["file"]:
            continue
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "c.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(LESSON / "audio/clips" / c["file"]), "-ac", "1", "-ar", "16000", str(wav)], check=True)
            r = transcribe(wav, "kir")
        heard = r.get("text", "").strip()
        unsure = [w["text"] for w in r.get("words", []) if w.get("type") == "word" and w.get("logprob") is not None and w["logprob"] < -1.0]
        sim = difflib.SequenceMatcher(None, norm(c["text"]), norm(heard)).ratio()
        res[k] = {"file": c["file"], "text": c["text"], "scribe": heard, "similarity": round(sim, 3), "low_confidence": unsure}
        out_p.write_text(json.dumps(res, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"{k}: {sim:.3f} | {heard}" + (f" | unsure: {unsure}" if unsure else ""), flush=True)
    sims = [v["similarity"] for v in res.values()]
    print(f"[{LESSON_ID}] {len(res)} clips, mean similarity {sum(sims) / max(1, len(sims)):.3f}, min {min(sims, default=0):.3f}")


if __name__ == "__main__":
    main()
