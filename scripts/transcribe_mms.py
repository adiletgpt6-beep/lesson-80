#!/usr/bin/env python3
"""Free local full-length machine transcription with Meta MMS-1B-all (Kyrgyz adapter `kir`).

Draft quality: lowercase, no punctuation, CTC letters. Suitable for a thematic map with
source timecodes; NOT for quoting the ustaz, Quran verses or hadith without listening.

  python3 scripts/transcribe_mms.py SOURCE.16k.wav OUT_DIR [--max-chunk 28]

SOURCE must be mono 16 kHz WAV (ffmpeg -ac 1 -ar 16000). Chunks are cut in pauses found by
ffmpeg silencedetect; each chunk's result is appended to OUT_DIR/segments.jsonl so the run is
resumable. Absolute word times come from CTC frame offsets (20 ms per frame).
"""
import argparse, json, re, subprocess, sys, time
from pathlib import Path


def silences(wav, noise="-35dB", dur=0.35):
    p = subprocess.run(["ffmpeg", "-nostdin", "-i", wav, "-af", f"silencedetect=n={noise}:d={dur}",
                        "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", p.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    return list(zip(starts, ends))


def plan(total, sil, max_chunk):
    mids = [(s + e) / 2 for s, e in sil]
    cuts, pos = [0.0], 0.0
    while total - pos > max_chunk:
        cands = [m for m in mids if pos + 6 < m <= pos + max_chunk]
        nxt = max(cands) if cands else pos + max_chunk
        cuts.append(nxt); pos = nxt
    cuts.append(total)
    return list(zip(cuts[:-1], cuts[1:]))


def hms(t):
    return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{t % 60:06.3f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav"); ap.add_argument("out")
    ap.add_argument("--max-chunk", type=float, default=28.0)
    ap.add_argument("--model", default="facebook/mms-1b-all")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    import soundfile as sf, torch
    from transformers import AutoProcessor, Wav2Vec2ForCTC
    audio, sr = sf.read(a.wav, dtype="float32")
    assert sr == 16000 and audio.ndim == 1, "need mono 16 kHz"
    total = len(audio) / sr
    plan_f = out / "chunks.json"
    if plan_f.exists():
        chunks = json.loads(plan_f.read_text())
    else:
        chunks = plan(total, silences(a.wav), a.max_chunk)
        plan_f.write_text(json.dumps(chunks))
    seg_f = out / "segments.jsonl"
    done = set()
    if seg_f.exists():
        done = {json.loads(l)["id"] for l in seg_f.read_text().splitlines() if l.strip()}
    proc = AutoProcessor.from_pretrained(a.model, target_lang="kir")
    model = Wav2Vec2ForCTC.from_pretrained(a.model, target_lang="kir", ignore_mismatched_sizes=True).eval()
    t0 = time.time()
    with seg_f.open("a", encoding="utf-8") as f:
        for i, (s, e) in enumerate(chunks):
            if i in done:
                continue
            x = audio[int(s * sr):int(e * sr)]
            inp = proc(x, sampling_rate=sr, return_tensors="pt")
            with torch.no_grad():
                logits = model(**inp).logits
            ids = torch.argmax(logits, dim=-1)[0]
            dec = proc.tokenizer.decode(ids, output_word_offsets=True)
            ratio = 0.02  # wav2vec2: 320 samples / 16 kHz per frame
            words = [{"w": w["word"], "t": round(s + w["start_offset"] * ratio, 2)} for w in dec.word_offsets]
            rec = {"id": i, "start": round(s, 2), "end": round(e, 2), "text": dec.text, "words": words}
            f.write(json.dumps(rec, ensure_ascii=False) + "\n"); f.flush()
            el = time.time() - t0
            print(f"{i + 1}/{len(chunks)} {hms(s)} rtf={el / max(e, 1):.2f} | {dec.text[:70]}", flush=True)
    recs = sorted((json.loads(l) for l in seg_f.read_text().splitlines() if l.strip()), key=lambda r: r["id"])
    (out / "full.mms_kir.txt").write_text(
        "".join(f"[{hms(r['start'])} – {hms(r['end'])}] {r['text']}\n" for r in recs), encoding="utf-8")
    print("DONE", len(recs), "chunks")


if __name__ == "__main__":
    main()
