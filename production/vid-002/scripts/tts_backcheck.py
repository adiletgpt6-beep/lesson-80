#!/usr/bin/env python3
"""Pronunciation back-check of generated voice clips with ElevenLabs Scribe v2 (approved QA spend, ~$0.22/h audio).

For each chapter, all clips are joined with 1.2 s of silence into one 16 kHz mono WAV and sent to Scribe (`kir`).
Recognised words are assigned back to clips by time, and each clip's recognised text is compared with the script
text (character similarity after normalisation). Results: lessons/NNN/audio/backcheck.json + backcheck.md
(clips below the threshold are listed for listening / regeneration). Cached per chapter by clip hashes.

    LESSON=001 python3 production/vid-002/scripts/tts_backcheck.py [--chapters ch00,ch01] [--confirm]
"""
import argparse
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scribe_clip import transcribe  # noqa: E402

REPO = Path(__file__).resolve().parents[3]
LESSON_ID = os.environ.get("LESSON", "")
if LESSON_ID not in ("001", "002"):
    sys.exit("set LESSON=001 or LESSON=002")
AUDIO = REPO / "lessons" / LESSON_ID / "audio"
GAP = 1.2
THRESH = 0.80


def norm(t):
    t = t.lower().replace("ё", "е")
    t = re.sub(r"[^\w\s]", " ", t)
    return " ".join(t.split())


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True, check=True).stdout)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapters", default="")
    ap.add_argument("--confirm", action="store_true")
    a = ap.parse_args()
    man = json.loads((AUDIO / "manifest.json").read_text(encoding="utf-8"))["clips"]
    out_path = AUDIO / "backcheck.json"
    res = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {"chapters": {}, "cost_usd": 0.0}
    chapters = sorted({k.split("-")[0] for k in man})
    if a.chapters:
        chapters = [c for c in chapters if c in a.chapters.split(",")]
    total_s = 0.0
    todo = []
    for ch in chapters:
        keys = sorted([k for k in man if k.startswith(ch + "-")],
                      key=lambda k: (k.split("#")[0], int(re.sub(r"\D", "", k.split("#")[1]) or 0) + (1000 if "x" in k.split("#")[1] else 0)))
        sig = hashlib.sha256(json.dumps([man[k]["hash"] for k in keys]).encode()).hexdigest()[:16]
        if res["chapters"].get(ch, {}).get("sig") == sig:
            continue
        secs = sum(man[k]["seconds"] + GAP for k in keys)
        total_s += secs
        todo.append((ch, keys, sig))
    print(f"to check: {len(todo)} chapters, {total_s / 60:.1f} min audio ≈ ${total_s / 3600 * 0.22:.2f}")
    if not a.confirm:
        return
    for ch, keys, sig in todo:
        with tempfile.TemporaryDirectory() as tmp:
            sil = Path(tmp) / "sil.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=16000:cl=mono", "-t", str(GAP), str(sil)], check=True)
            lst, spans, t = [], [], 0.0
            for k in keys:
                w = Path(tmp) / (k.replace("#", "_") + ".wav")
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(AUDIO / "clips" / man[k]["file"]), "-ac", "1", "-ar", "16000", str(w)], check=True)
                d = dur(w)
                spans.append((k, t, t + d))
                t += d + GAP
                lst += [f"file '{w}'", f"file '{sil}'"]
            (Path(tmp) / "l.txt").write_text("\n".join(lst))
            allw = Path(tmp) / "all.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(Path(tmp) / "l.txt"), "-c", "copy", str(allw)], check=True)
            h = {}
            raw = transcribe(allw, "kir", h)
        words = [w for w in raw.get("words", []) if w.get("type") == "word"]
        clips = {}
        for k, s, e in spans:
            got = " ".join(w["text"] for w in words if s - 0.3 <= (w["start"] + w["end"]) / 2 <= e + 0.3)
            want = man[k]["text"]
            sim = difflib.SequenceMatcher(None, norm(want), norm(got)).ratio()
            clips[k] = {"sim": round(sim, 3), "heard": got}
        cost = float(h.get("fiat-cost-before-overages", 0) or 0)
        res["cost_usd"] = round(res.get("cost_usd", 0) + cost, 5)
        res["chapters"][ch] = {"sig": sig, "clips": clips, "cost_usd": cost}
        out_path.write_text(json.dumps(res, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        low = [k for k, v in clips.items() if v["sim"] < THRESH]
        print(f"{ch}: {len(clips)} clips, mean sim {sum(v['sim'] for v in clips.values()) / len(clips):.3f}, below {THRESH}: {len(low)}, ${cost}", flush=True)
    # report
    md = [f"# Урок {LESSON_ID} — обратная проверка произношения (Scribe v2)\n",
          f"Сходство текста сценария и распознанного (0–1, после нормализации). Порог {THRESH}. Стоимость: ${res['cost_usd']:.3f}.\n",
          "| Реплика | Сходство | Сценарий | Распознано |", "|---|---|---|---|"]
    allc = [(k, v) for c in sorted(res["chapters"]) for k, v in res["chapters"][c]["clips"].items()]
    for k, v in sorted(allc, key=lambda kv: kv[1]["sim"])[:80]:
        if v["sim"] >= THRESH:
            break
        md.append(f"| {k} | {v['sim']:.2f} | {man.get(k, {}).get('text', '')} | {v['heard']} |")
    sims = [v["sim"] for _, v in allc]
    if sims:
        md.insert(2, f"Реплик: {len(sims)}; среднее сходство {sum(sims) / len(sims):.3f}; ниже порога: {sum(s < THRESH for s in sims)}.\n")
    (AUDIO / "backcheck.md").write_text("\n".join(md) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
