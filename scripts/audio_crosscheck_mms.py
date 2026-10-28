#!/usr/bin/env python3
"""Independent machine cross-check of disputed lesson-003 clips with Meta MMS-1B-all (Kyrgyz adapter `kir`).

MMS is a different model family from ElevenLabs Scribe, runs locally on CPU and costs nothing — but it is still
a machine reading, NOT human listening: it can support or contradict a hypothesis, never set audio_verified=true.

Needs the host `us.aws.cdn.hf.co` allowed (Hugging Face model files) and:
    python3 -m pip install torch transformers soundfile
Usage (from repo root):
    python3 scripts/audio_crosscheck_mms.py SOURCE.mp4 --probe          # 12-second probe on K06 first
    python3 scripts/audio_crosscheck_mms.py SOURCE.mp4 --clips K01,K05   # then only the needed intervals
Writes lessons/003/transcript/recheck/<clip>.mms_kir.json (text only; audio is never written to the repo).
"""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "lessons/003/transcript/recheck"
# Same intervals as the private listening page (script/qa-blockers.md, LISTENING-CHECKLIST.md).
CLIPS = {
    "K01": ("00:48:22", "00:48:41"), "K02": ("00:01:19", "00:01:46"), "K03": ("00:51:05", "00:51:33"),
    "K04": ("00:57:35", "00:58:13"), "K05": ("00:59:53", "01:00:12"), "K06": ("00:44:17", "00:44:30"),
    "K07": ("00:15:34", "00:15:55"), "K08": ("00:01:09", "00:01:29"), "K09": ("00:05:06", "00:05:32"),
    "K10": ("00:54:58", "00:55:13"), "K22": ("00:00:00", "00:00:35"), "K23": ("01:01:05", "01:01:57"),
}
PROBE = ("K06", ("00:44:16", "00:44:28"))  # 12 s


def load_audio(source, start, end):
    import soundfile as sf
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "c.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", start, "-to", end, "-i", source,
                        "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
        data, _ = sf.read(wav)
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--clips", default="")
    a = ap.parse_args()

    import torch
    from transformers import AutoProcessor, Wav2Vec2ForCTC
    proc = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="kir")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="kir", ignore_mismatched_sizes=True)
    model.eval()

    jobs = [PROBE] if a.probe else [(c, CLIPS[c]) for c in a.clips.split(",") if c]
    OUT.mkdir(parents=True, exist_ok=True)
    for cid, (start, end) in jobs:
        audio = load_audio(a.source, start, end)
        inputs = proc(audio, sampling_rate=16000, return_tensors="pt")
        with torch.no_grad():
            ids = torch.argmax(model(**inputs).logits, dim=-1)[0]
        text = proc.decode(ids)
        rec = {"clip": cid, "source_start": start, "source_end": end, "model": "facebook/mms-1b-all", "adapter": "kir",
               "text": text, "note": "machine cross-check, not human listening; audio_verified stays false"}
        (OUT / f"{cid}.mms_kir.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(cid, start, end, "|", text)


if __name__ == "__main__":
    main()
