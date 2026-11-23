#!/usr/bin/env python3
"""Second ASR pass for VID-003: re-transcribe the intervals Scribe v2 (kir) wrote in Kazakh orthography, with
shorter, shifted requests, until each piece comes back in Kyrgyz orthography; then build the full transcript in
Kyrgyz orthography (lessons/VID-003/transcript/full.ky.md + .txt). Machine text — not a human-checked transcript.

    python3 production/lesson-006-007/kyrgyz_pass.py SOURCE.mp4
Resumable: finished pieces live in lessons/VID-003/transcript/kyrgyz-pass/*.json.
"""
import json
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from scribe_clip import tc, transcribe  # noqa: E402
from transcribe_full import orthography, segment  # noqa: E402

TR = ROOT / "lessons/VID-003/transcript"
OUT = TR / "kyrgyz-pass"


def kk_intervals():
    segs = json.loads((TR / "full.kir.segments.json").read_text(encoding="utf-8"))["segments"]
    runs, cur = [], None
    for s in segs:
        if s["asr_orthography"] == "kk":
            if cur and s["start"] - cur[1] < 5:
                cur[1] = s["end"]
            else:
                cur = [s["start"], s["end"]]
                runs.append(cur)
    return runs, segs


def piece(src, a, b, tries=(150, 75, 40)):
    """Transcribe [a, b) in pieces; shrink the piece when the answer is still in Kazakh orthography."""
    words = []
    t = a
    while t < b - 0.5:
        for L in tries:
            e = min(b, t + L)
            key = OUT / f"{int(t * 1000):09d}-{int(e * 1000):09d}.json"
            if key.exists():
                raw = json.loads(key.read_text(encoding="utf-8"))
            else:
                with tempfile.TemporaryDirectory() as td:
                    wav = Path(td) / "c.wav"
                    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(t), "-to", str(e), "-i", src,
                                    "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(wav)], check=True)
                    raw = transcribe(wav, "kir")
                key.write_text(json.dumps(raw, ensure_ascii=False) + "\n", encoding="utf-8")
            ws = [{"text": w["text"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3), "type": w["type"],
                   "logprob": w.get("logprob")} for w in raw.get("words", []) if w.get("type") in ("word", "audio_event")]
            orth = orthography(" ".join(w["text"] for w in ws))
            if orth != "kk" or L == tries[-1]:
                words += [dict(w, orth=orth) for w in ws]
                break
        t = e
    return words


def main():
    src = sys.argv[1]
    OUT.mkdir(parents=True, exist_ok=True)
    runs, segs = kk_intervals()
    print("Kazakh-orthography intervals:", [(tc(a), tc(b)) for a, b in runs])
    with ThreadPoolExecutor(6) as ex:
        redone = list(ex.map(lambda r: piece(src, r[0] - 1.0, r[1] + 1.0), runs))
    # merge: original Kyrgyz-orthography segments outside the runs + new words inside the runs
    words = []
    for s in segs:
        mid = (s["start"] + s["end"]) / 2
        if not any(a - 1.0 <= mid <= b + 1.0 for a, b in runs):
            words.append({"text": s["text"], "start": s["start"], "end": s["end"], "type": "word", "logprob": None, "orth": s["asr_orthography"], "seg": True})
    for (a, b), ws in zip(runs, redone):
        words += [w for w in ws if a - 1.0 <= (w["start"] + w["end"]) / 2 <= b + 1.0]
    words.sort(key=lambda w: w["start"])
    lines, buf = [], []
    for w in words:
        if w.get("seg"):
            if buf:
                lines += [(x["start"], x["end"], x["text"], "") for x in segment(buf)]
                buf = []
            lines.append((w["start"], w["end"], w["text"], "kk" if w["orth"] == "kk" else ""))
        else:
            buf.append(w)
    if buf:
        lines += [(x["start"], x["end"], x["text"], "") for x in segment(buf)]
    still_kk = sum(1 for w in words if not w.get("seg") and w["orth"] == "kk")
    (TR / "full.ky.txt").write_text("".join(f"[{tc(a)} – {tc(b)}] {t}\n" for a, b, t, _ in lines), encoding="utf-8")
    md = ["# VID-003 — полный транскрипт в кыргызской орфографии (Scribe v2, два прохода; машинный текст)\n",
          "Интервалы, которые первый проход записал казахской орфографией, перераспознаны короткими сдвинутыми запросами "
          "(`production/lesson-006-007/kyrgyz_pass.py`). Абсолютные таймкоды `source.mp4`. Слова не нормализовались вручную; "
          "смысловая редактура — в [`../analysis/meaning-map.csv`](../analysis/meaning-map.csv).\n"]
    block = -1
    for a, b, t, flag in lines:
        if int(a // 300) != block:
            block = int(a // 300)
            md.append(f"\n## {tc(block * 300)[:8]}\n")
        md.append(f"`{tc(a)[:8]}`{' ⟨kk⟩' if flag else ''} {t}  ")
    (TR / "full.ky.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"{len(lines)} lines; words still in Kazakh orthography after the second pass: {still_kk}")


if __name__ == "__main__":
    main()
