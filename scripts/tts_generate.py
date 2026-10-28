#!/usr/bin/env python3
"""ElevenLabs voice-over for the lesson script — DRY RUN BY DEFAULT.

    python3 scripts/tts_generate.py                       # dry run: what would be generated, chars, credit estimate
    python3 scripts/tts_generate.py --scenes ch03-s01     # limit to scenes (comma list or prefix ch03-)
    python3 scripts/tts_generate.py --scenes ch03-s01 --confirm --max-credits 500   # actually call the API

Safety:
- Lines with `blocked` set (see script/qa-blockers.md) are never voiced unless --allow-blocked.
- Without --confirm nothing is sent. --max-credits caps the estimated spend of one run (default 0 = refuse).
- Clips are cached by hash(text, voice, model, settings); unchanged lines are not paid for twice.
- Audio goes to lessons/003/audio/clips/ (git-ignored). manifest.json (durations, hashes) is committed and feeds
  `python3 scripts/lesson_script.py timeline`.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSON = ROOT / "lessons/003"
AUDIO = LESSON / "audio"
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format={fmt}"


def load_lines(scene_filter):
    out = []
    for p in sorted((LESSON / "script/chapters").glob("ch*.json")):
        ch = json.loads(p.read_text(encoding="utf-8"))
        for s in ch["scenes"]:
            if scene_filter and not any(s["id"] == f or (f.endswith("-") and s["id"].startswith(f)) for f in scene_filter):
                continue
            lines = [(i, b) for i, b in enumerate(s["beats"]) if b["type"] == "line"]
            for n, (i, b) in enumerate(lines):
                prev_t = lines[n - 1][1]["text"] if n else ""
                next_t = lines[n + 1][1]["text"] if n + 1 < len(lines) else ""
                out.append({"key": f"{s['id']}#{i}", "beat": b, "prev": prev_t, "next": next_t})
    return out


def clip_hash(cfg, voice_id, text):
    blob = json.dumps([text, voice_id, cfg["model_id"], cfg["language_code"], cfg["voice_settings"]], ensure_ascii=False)
    return hashlib.sha256(blob.encode()).hexdigest()[:16]


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", default="", help="comma list of scene ids; a trailing '-' means prefix (ch03-)")
    ap.add_argument("--confirm", action="store_true", help="actually call ElevenLabs")
    ap.add_argument("--max-credits", type=float, default=0, help="refuse a run whose estimate exceeds this")
    ap.add_argument("--allow-blocked", action="store_true", help="voice lines still waiting for QA (never for final audio)")
    a = ap.parse_args()

    cfg = json.loads((AUDIO / "voices.json").read_text(encoding="utf-8"))
    manifest_path = AUDIO / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {"clips": {}}
    clips_dir = AUDIO / "clips"

    todo, skipped_blocked, cached = [], 0, 0
    for item in load_lines([f for f in a.scenes.split(",") if f]):
        b = item["beat"]
        if b["blocked"] and not a.allow_blocked:
            skipped_blocked += 1
            continue
        voice = cfg["voices"][b["speaker"]]["voice_id"]
        h = clip_hash(cfg, voice, b["text"])
        old = manifest["clips"].get(item["key"])
        if old and old.get("hash") == h and (clips_dir / old["file"]).exists():
            cached += 1
            continue
        todo.append({**item, "voice": voice, "hash": h})

    chars = sum(len(t["beat"]["text"]) for t in todo)
    est = chars * cfg["credits_per_char_observed"]
    print(f"to generate: {len(todo)} lines, {chars} chars, ≈{est:.0f} credits | cached {cached} | blocked skipped {skipped_blocked}")
    if not a.confirm:
        print("dry run (add --confirm and --max-credits to call the API)")
        return
    if est > a.max_credits:
        sys.exit(f"refusing: estimate {est:.0f} credits > --max-credits {a.max_credits:.0f}")
    key = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("ELEVENLABS_API_KEY is not set")

    clips_dir.mkdir(parents=True, exist_ok=True)
    spent = 0
    for t in todo:
        body = {"text": t["beat"]["text"], "model_id": cfg["model_id"], "language_code": cfg["language_code"],
                "voice_settings": cfg["voice_settings"], "previous_text": t["prev"], "next_text": t["next"]}
        req = urllib.request.Request(API.format(voice=t["voice"], fmt=cfg["output_format"]), method="POST",
                                     data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                audio, cost = r.read(), int(r.headers.get("character-cost", 0) or 0)
        except urllib.error.HTTPError as e:
            sys.exit(f"{t['key']}: HTTP {e.code} {e.read()[:200]!r} — stopping; manifest keeps finished clips")
        fname = f"{t['key'].replace('#', '_')}_{t['hash']}.mp3"
        (clips_dir / fname).write_bytes(audio)
        spent += cost
        manifest["clips"][t["key"]] = {"file": fname, "hash": t["hash"], "seconds": round(duration(clips_dir / fname), 3),
                                       "speaker": t["beat"]["speaker"], "credits": cost}
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")  # save after each clip
        print(f"{t['key']}: {manifest['clips'][t['key']]['seconds']} s, {cost} credits")
    print(f"done: {len(todo)} clips, {spent} credits")


if __name__ == "__main__":
    main()
