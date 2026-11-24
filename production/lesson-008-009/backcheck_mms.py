#!/usr/bin/env python3
"""Back-check every voiced clip of lessons 008 / 009 with Meta MMS-1B-all (Kyrgyz adapter `kir`), locally on CPU.

Used because ElevenLabs Scribe and OpenAI transcription quotas were exhausted on 2026-11-23. MMS writes lowercase
Kyrgyz without punctuation; similarity = character ratio after normalisation. A machine check, not human listening.
    LESSON=R08 python3 production/lesson-008-009/backcheck_mms.py
Writes lessons/R0N/audio/backcheck_mms.json.
"""
import difflib, json, os, re, subprocess, sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from lesson_paths import LESSON, clip_path  # noqa: E402


def norm(t):
    t = t.lower().replace("ё", "е")
    return re.sub(r"[^а-яөүң ]+", " ", re.sub(r"\s+", " ", t)).strip()


def main():
    import soundfile as sf, torch
    from transformers import AutoProcessor, Wav2Vec2ForCTC
    torch.set_num_threads(4)
    proc = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="kir")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="kir", ignore_mismatched_sizes=True).eval()
    clips = json.loads((LESSON / "audio/manifest.json").read_text())["clips"]
    out_p = LESSON / "audio/backcheck_mms.json"
    res = json.loads(out_p.read_text()) if out_p.exists() else {}
    for k, c in clips.items():
        if k in res:
            continue
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "c.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(clip_path(c["file"])), "-ac", "1", "-ar", "16000", str(wav)], check=True)
            audio, _ = sf.read(wav)
        with torch.no_grad():
            ids = torch.argmax(model(**proc(audio, sampling_rate=16000, return_tensors="pt")).logits, dim=-1)[0]
        heard = proc.decode(ids)
        sim = difflib.SequenceMatcher(None, norm(c["text"]), norm(heard)).ratio()
        res[k] = {"file": c["file"], "text": c["text"], "mms": heard, "similarity": round(sim, 3)}
        out_p.write_text(json.dumps(res, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(k, round(sim, 3), flush=True)
    s = [v["similarity"] for v in res.values()]
    print(f"{LESSON.name}: {len(s)} clips, mean {sum(s) / len(s):.3f}, <0.75: {sum(x < 0.75 for x in s)}")


if __name__ == "__main__":
    main()
