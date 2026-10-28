#!/usr/bin/env python3
"""ElevenLabs voice-over for the lesson script — DRY RUN BY DEFAULT.

    python3 scripts/tts_generate.py                       # dry run: what would be generated, chars, credit estimate
    python3 scripts/tts_generate.py --scenes ch03-s01     # limit to scenes (comma list or prefix ch03-)
    python3 scripts/tts_generate.py --scenes ch03- --confirm --max-credits 500   # actually call the API

Safety:
- Lines with `blocked` set (see script/qa-blockers.md) are never voiced as written. Only the [ПЕД] replacement from
  script/ped-replacements.json (if any) is voiced — see scripts/script_lines.py. There is no --allow-blocked.
- Without --confirm nothing is sent. --max-credits caps the estimated spend of one run (default 0 = refuse).
- Clips are cached by hash(text, voice, model, settings); unchanged lines are not paid for twice.
- `both_children` lines are generated with BOTH child voices and mixed with ffmpeg into one clip.
- Audio goes to lessons/003/audio/clips/ (git-ignored). manifest.json (durations, hashes, credits) is committed and
  feeds `python3 scripts/lesson_script.py timeline`.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from script_lines import effective_lines  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
LESSON = ROOT / "lessons/003"
AUDIO = LESSON / "audio"
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format={fmt}"


def clip_hash(cfg, voice_ids, text):
    blob = json.dumps([text, voice_ids, cfg["model_id"], cfg["language_code"], cfg["voice_settings"]], ensure_ascii=False)
    return hashlib.sha256(blob.encode()).hexdigest()[:16]


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout)


def voices_for(cfg, speaker):
    if speaker == "both_children":
        return [cfg["voices"]["bektur"]["voice_id"], cfg["voices"]["aizada"]["voice_id"]]
    return [cfg["voices"][speaker]["voice_id"]]


def call_tts(cfg, key, voice, text, prev, nxt):
    body = {"text": text, "model_id": cfg["model_id"], "language_code": cfg["language_code"],
            "voice_settings": cfg["voice_settings"], "previous_text": prev, "next_text": nxt}
    req = urllib.request.Request(API.format(voice=voice, fmt=cfg["output_format"]), method="POST",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read(), int(r.headers.get("character-cost", 0) or 0)
        except urllib.error.HTTPError as e:
            msg = e.read()[:300]
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(3 * (attempt + 1))
                continue
            raise SystemExit(f"HTTP {e.code} {msg!r} — stopping; manifest keeps finished clips")
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
                continue
            raise SystemExit(f"network error {e} — stopping; manifest keeps finished clips")


def mix(parts, out):
    """Two children saying the same line: slight offset of the second voice, equal loudness, mono-compatible."""
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(parts[0]), "-i", str(parts[1]), "-filter_complex",
           "[1:a]adelay=60|60[d];[0:a][d]amix=inputs=2:duration=longest:normalize=0,volume=0.9", "-c:a", "libmp3lame", "-b:a", "128k", str(out)]
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", default="", help="comma list of scene ids; a trailing '-' means prefix (ch03-)")
    ap.add_argument("--confirm", action="store_true", help="actually call ElevenLabs")
    ap.add_argument("--max-credits", type=float, default=0, help="refuse a run whose estimate exceeds this")
    a = ap.parse_args()

    cfg = json.loads((AUDIO / "voices.json").read_text(encoding="utf-8"))
    manifest_path = AUDIO / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {"clips": {}}
    manifest.setdefault("settings", {k: cfg[k] for k in ("model_id", "language_code", "output_format", "voice_settings")})
    clips_dir = AUDIO / "clips"

    todo, cached = [], 0
    for item in effective_lines([f for f in a.scenes.split(",") if f]):
        b = item["beat"]
        voices = voices_for(cfg, b["speaker"])
        h = clip_hash(cfg, voices, item["text"])
        old = manifest["clips"].get(item["key"])
        if old and old.get("hash") == h and (clips_dir / old["file"]).exists():
            cached += 1
            continue
        todo.append({**item, "voices": voices, "hash": h})

    chars = sum(len(t["text"]) * len(t["voices"]) for t in todo)
    est = chars * cfg["credits_per_char_observed"]
    print(f"to generate: {len(todo)} lines, {chars} chars (both_children counted twice), ≈{est:.0f} credits | cached {cached}")
    if not a.confirm:
        print("dry run (add --confirm and --max-credits to call the API)")
        return
    if est > a.max_credits:
        sys.exit(f"refusing: estimate {est:.0f} credits > --max-credits {a.max_credits:.0f}")
    key = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("ELEVENLABS_API_KEY is not set")

    clips_dir.mkdir(parents=True, exist_ok=True)
    spent = 0
    for t in todo:
        b = t["beat"]
        fname = f"{t['key'].replace('#', '_')}_{t['hash']}.mp3"
        parts, cost = [], 0
        for n, voice in enumerate(t["voices"]):
            audio, c = call_tts(cfg, key, voice, t["text"], t["prev"], t["next"])
            cost += c
            p = clips_dir / (fname if len(t["voices"]) == 1 else fname.replace(".mp3", f".v{n}.mp3"))
            p.write_bytes(audio)
            parts.append(p)
        if len(parts) > 1:
            mix(parts, clips_dir / fname)
        spent += cost
        manifest["clips"][t["key"]] = {"file": fname, "hash": t["hash"], "seconds": round(duration(clips_dir / fname), 3),
                                       "speaker": b["speaker"], "credits": cost, "chars": len(t["text"]),
                                       "ped": bool(b.get("ped")), "replaced_from": b.get("replaced_from"), "text": t["text"]}
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")  # save after each clip
        print(f"{t['key']}: {manifest['clips'][t['key']]['seconds']} s, {cost} credits", flush=True)
    print(f"done: {len(todo)} clips, {spent} credits")


if __name__ == "__main__":
    main()
