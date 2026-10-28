#!/usr/bin/env python3
"""Cut a clip from the verified lesson source and transcribe it with ElevenLabs Scribe v2.

Timecodes in the outputs are absolute (relative to the start of the source file).
Needs ffmpeg and ELEVENLABS_API_KEY in the environment; the key is never printed.

Example:
    python3 scripts/scribe_clip.py SOURCE.mp4 --start 300 --duration 45 \
        --out lessons/003/asr-trial/scribe-v2-kir-000500-000545
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import uuid
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io/v1/speech-to-text"
LOW_CONFIDENCE_LOGPROB = -1.0


def tc(seconds):
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def transcribe(wav, language, headers_out=None):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set")
    boundary = uuid.uuid4().hex
    fields = {"model_id": "scribe_v2", "language_code": language,
              "timestamps_granularity": "word", "tag_audio_events": "true", "diarize": "false"}
    body = b""
    for name, value in fields.items():
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
    body += (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="clip.wav"\r\n'
             "Content-Type: audio/wav\r\n\r\n").encode() + Path(wav).read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(API, data=body, method="POST", headers={
        "xi-api-key": key, "Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req, timeout=900) as res:
        if headers_out is not None:
            # Keep only non-secret billing/trace headers for the cost report.
            headers_out.update({k.lower(): v for k, v in res.headers.items()
                                if any(s in k.lower() for s in ("cost", "character", "credit", "request-id"))})
        return json.load(res)


def segments(words, offset):
    """Group words into sentence-level segments with absolute timecodes."""
    out, cur = [], []
    for w in words:
        if w.get("type") != "word":
            continue
        cur.append(w)
        if w["text"].rstrip().endswith((".", "?", "!")):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return [{
        "start": round(offset + seg[0]["start"], 3),
        "end": round(offset + seg[-1]["end"], 3),
        "text": " ".join(w["text"] for w in seg),
        "low_confidence_words": [
            {"word": w["text"], "at": tc(offset + w["start"]), "logprob": round(w["logprob"], 2)}
            for w in seg if w.get("logprob") is not None and w["logprob"] < LOW_CONFIDENCE_LOGPROB],
    } for seg in out]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("source")
    p.add_argument("--start", type=float, required=True, help="seconds from source start")
    p.add_argument("--duration", type=float, required=True)
    p.add_argument("--language", default="kir")
    p.add_argument("--out", required=True, help="output path prefix (no extension)")
    a = p.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "clip.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(a.start), "-t", str(a.duration),
                        "-i", a.source, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(wav)], check=True)
        raw = transcribe(wav, a.language)

    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.with_suffix(".raw.json").write_text(json.dumps(raw, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    segs = segments(raw.get("words", []), a.start)
    out.with_suffix(".segments.json").write_text(json.dumps({
        "model_id": "scribe_v2", "language_requested": a.language,
        "language_detected": raw.get("language_code"), "language_probability": raw.get("language_probability"),
        "source_start": tc(a.start), "source_end": tc(a.start + a.duration), "segments": segs,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    out.with_suffix(".txt").write_text(
        "".join(f"[{tc(s['start'])} – {tc(s['end'])}] {s['text']}\n" for s in segs), encoding="utf-8")
    print(out.with_suffix(".txt").read_text(encoding="utf-8"), end="")


if __name__ == "__main__":
    main()
