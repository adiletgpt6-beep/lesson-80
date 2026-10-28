#!/usr/bin/env python3
"""Resumable full transcription of the lesson source with ElevenLabs Scribe v2.

Progress lives in <out>/progress.json; each finished chunk is written to
<out>/chunks/ immediately, so a new session continues from the first pending
chunk without paying for finished ones again. Timecodes are absolute.

    python3 scripts/transcribe_full.py plan  SOURCE.mp4     # once: write chunk plan
    python3 scripts/transcribe_full.py next  SOURCE.mp4     # transcribe one pending chunk (exit 3 = all done)
    python3 scripts/transcribe_full.py merge                # stitch chunks -> full transcript + review flags

Committing/pushing after each `next` is done by the caller (see transcript/README.md).
"""
import argparse
import csv
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scribe_clip import tc, transcribe  # noqa: E402

OUT = Path("lessons/003/transcript")
MANIFEST = Path("lessons/003/source/manifest.json")
CHUNK = 300.0          # nominal chunk length, s
HALF_OVERLAP = 7.0     # each seam is covered by both neighbours for 2 * 7 = 14 s
LANG = "kir"
LOW_LOGPROB = -1.0

TAANUU = re.compile(r"^таа?н[уы]", re.I)
ISLAMIC = re.compile(
    r"^(алла|аллах|таала|кудай|пайгамбар|пайгамбар|расул|мухамм|мухамед|куран|аят|сүрө|хадис|намаз|ибадат|ыйман|"
    r"ислам|мусулман|сахаба|саллалла|алейхи|аляйхи|ассалам|бисмилла|иншаалла|субхан|алхамдулилла|аллаху|акбар|"
    r"шайтан|бейиш|жаннат|жаннат|тозок|жаханнам|акырет|кыямат|периште|жебирейил|жабраил|рамазан|орозо|зекет|"
    r"сүннөт|фарз|парз|сооп|күнөө|тобо|дуба|дуа|зикир|шарият|имам|азан|мечит|кааба|мекке|медина|ибрахим|муса|"
    r"иса|нух|лукман|сулайман|юсуф|жүсүп|ахлак|тафсир|фатиха|аллахумма|илах|рахман|рахим|амин|аалам)", re.I)
NON_CYRILLIC = re.compile(r"[؀-ۿA-Za-z]")


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def dump(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(4 << 20), b""):
            h.update(block)
    return h.hexdigest()


def verify_source(source):
    m = load(MANIFEST)
    size = Path(source).stat().st_size
    if size != m["size_bytes"] or sha256(source) != m["sha256"]:
        sys.exit("Source does not match manifest (size/SHA-256) - refusing to transcribe")
    return m


def duration(source):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", source],
                       check=True, capture_output=True, text=True)
    return float(r.stdout)


def cmd_plan(a):
    m = verify_source(a.source)
    if (OUT / "progress.json").exists():
        sys.exit("progress.json already exists; not overwriting the plan")
    dur = duration(a.source)
    chunks, i = [], 0
    while i * CHUNK < dur:
        start = max(0.0, i * CHUNK - HALF_OVERLAP)
        end = min(dur, (i + 1) * CHUNK + HALF_OVERLAP)
        chunks.append({"id": f"c{i:02d}", "start": round(start, 3), "end": round(end, 3), "status": "pending"})
        i += 1
    OUT.joinpath("chunks").mkdir(parents=True, exist_ok=True)
    dump(OUT / "progress.json", {
        "source": {"file": m.get("filename", "1000218169.mp4"), "size_bytes": m["size_bytes"], "sha256": m["sha256"],
                   "duration_s": dur},
        "api": {"model_id": "scribe_v2", "language_code": LANG, "timestamps_granularity": "word",
                "tag_audio_events": True, "diarize": False, "paid_addons": "none (no keyterms, no entity detection)"},
        "chunk_seconds": CHUNK, "overlap_seconds": 2 * HALF_OVERLAP,
        "planned_audio_seconds": round(sum(c["end"] - c["start"] for c in chunks), 3),
        "chunks": chunks,
    })
    print(f"{len(chunks)} chunks planned")


def cmd_next(a):
    prog = load(OUT / "progress.json")
    pending = [c for c in prog["chunks"] if c["status"] != "done"]
    if not pending:
        print("all chunks done")
        sys.exit(3)
    c = pending[0]
    verify_source(a.source)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "clip.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(c["start"]), "-to", str(c["end"]),
                        "-i", a.source, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(wav)], check=True)
        headers = {}
        raw = transcribe(wav, LANG, headers)
    dump(OUT / "chunks" / f"{c['id']}.raw.json", raw)
    words = abs_words(raw, c["start"])
    (OUT / "chunks" / f"{c['id']}.kir.txt").write_text(
        f"# {c['id']}: {tc(c['start'])} – {tc(c['end'])} (absolute source time)\n"
        + "".join(f"[{tc(s['start'])} – {tc(s['end'])}] {s['text']}\n" for s in segment(words)), encoding="utf-8")
    c.update(status="done", audio_seconds=round(c["end"] - c["start"], 3), words=len(words),
             language_detected=raw.get("language_code"), language_probability=raw.get("language_probability"),
             response_headers=headers)
    dump(OUT / "progress.json", prog)
    print(f"{c['id']} done: {tc(c['start'])}–{tc(c['end'])}, {len(words)} words, lang={raw.get('language_code')}")


def abs_words(raw, offset):
    return [{"text": w["text"], "start": round(offset + w["start"], 3), "end": round(offset + w["end"], 3),
             "type": w["type"], "logprob": w.get("logprob")}
            for w in raw.get("words", []) if w.get("type") in ("word", "audio_event")]


def segment(words, max_len=25.0):
    """Sentence-level segments: split on . ? !, on pauses >= 2 s, or at a comma once a segment is long."""
    segs, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        t = w["text"].rstrip()
        if (nxt is None or t.endswith((".", "?", "!")) or nxt["start"] - w["end"] >= 2.0
                or (t.endswith(",") and w["end"] - cur[0]["start"] >= max_len)):
            segs.append({"start": cur[0]["start"], "end": cur[-1]["end"],
                         "text": " ".join(x["text"] for x in cur), "words": cur})
            cur = []
    return segs


def gap_at(words, t):
    """Length of the silence containing t (0 if t falls inside a word)."""
    prev_end, next_start = None, None
    for w in words:
        if w["start"] < t < w["end"]:
            return 0.0
        if w["end"] <= t:
            prev_end = w["end"] if prev_end is None else max(prev_end, w["end"])
        elif next_start is None or w["start"] < next_start:
            next_start = w["start"]
    if prev_end is None or next_start is None:
        return 0.0
    return next_start - prev_end


def find_cut(a_words, b_words, lo, hi, centre):
    """Pick a cut time inside [lo, hi] that lies in a pause in BOTH chunks."""
    cands = set()
    for ws in (a_words, b_words):
        for x, y in zip(ws, ws[1:]):
            mid = (x["end"] + y["start"]) / 2
            if lo <= mid <= hi:
                cands.add(round(mid, 3))
    best = None
    for t in cands:
        score = min(gap_at(a_words, t), gap_at(b_words, t))
        key = (score, -abs(t - centre))
        if best is None or key > best[0]:
            best = (key, t)
    return (best[1], best[0][0]) if best else (centre, 0.0)


def cmd_merge(a):
    prog = load(OUT / "progress.json")
    chunks = prog["chunks"]
    if any(c["status"] != "done" for c in chunks):
        sys.exit("not all chunks are done")
    per = [abs_words(load(OUT / "chunks" / f"{c['id']}.raw.json"), c["start"]) for c in chunks]
    merged, seams, lo_t = [], [], 0.0
    for i, c in enumerate(chunks):
        hi_t = float("inf")
        if i + 1 < len(chunks):
            nxt = chunks[i + 1]
            ov_lo, ov_hi = nxt["start"], c["end"]
            # stay 2 s away from both clip edges, where ASR is least reliable
            cut, score = find_cut(per[i], per[i + 1], ov_lo + 2, ov_hi - 2, (ov_lo + ov_hi) / 2)
            in_ov = lambda ws: " ".join(w["text"] for w in ws if ov_lo <= (w["start"] + w["end"]) / 2 <= ov_hi)
            seams.append({"after": c["id"], "before": nxt["id"], "overlap": [tc(ov_lo), tc(ov_hi)], "cut": tc(cut),
                          "cut_s": cut, "shared_pause_s": round(score, 3),
                          "prev_chunk_overlap_text": in_ov(per[i]), "next_chunk_overlap_text": in_ov(per[i + 1]),
                          "needs_listening": score < 0.15})
            hi_t = cut
        merged += [w for w in per[i] if lo_t <= (w["start"] + w["end"]) / 2 < hi_t]
        lo_t = hi_t

    segs = segment(merged)
    for n, s in enumerate(segs, 1):
        s["id"] = f"s{n:04d}"
    write_outputs(prog, segs, seams)


def flags_for(segs, seams):
    rows = []
    for s in segs:
        for w in s["words"]:
            bare = w["text"].strip(".,?!:;«»\"'—-()").lower()
            kinds = []
            if w["type"] == "audio_event":
                kinds.append("audio_event")
            else:
                if TAANUU.match(bare):
                    kinds.append("taanuu_tanuu")
                if ISLAMIC.match(bare):
                    kinds.append("islamic_term")
                if NON_CYRILLIC.search(bare):
                    kinds.append("non_cyrillic")
                if w["logprob"] is not None and w["logprob"] < LOW_LOGPROB:
                    kinds.append("low_confidence")
            for k in kinds:
                rows.append({"segment": s["id"], "listen_from": tc(max(0, w["start"] - 1.5)),
                             "listen_to": tc(w["end"] + 1.5), "flag": k, "word": w["text"],
                             "logprob": "" if w["logprob"] is None else round(w["logprob"], 2),
                             "context": s["text"]})
    for sm in seams:
        if sm["needs_listening"]:
            rows.append({"segment": "", "listen_from": sm["overlap"][0], "listen_to": sm["overlap"][1],
                         "flag": "seam_no_shared_pause", "word": "", "logprob": "",
                         "context": f"prev: {sm['prev_chunk_overlap_text']} | next: {sm['next_chunk_overlap_text']}"})
    return sorted(rows, key=lambda r: r["listen_from"])


def write_outputs(prog, segs, seams):
    dump(OUT / "seams.json", seams)
    dump(OUT / "full.kir.segments.json", {
        "source_sha256": prog["source"]["sha256"], "model_id": "scribe_v2", "language_code": LANG,
        "note": "Raw ASR, not corrected. Absolute source timecodes. See review-flags.csv before using any quote.",
        "segments": [{"id": s["id"], "start": s["start"], "end": s["end"], "text": s["text"],
                      "low_confidence_words": [{"word": w["text"], "at": tc(w["start"]), "logprob": round(w["logprob"], 2)}
                                               for w in s["words"]
                                               if w["logprob"] is not None and w["logprob"] < LOW_LOGPROB]}
                     for s in segs]})
    (OUT / "full.kir.txt").write_text(
        "".join(f"[{tc(s['start'])} – {tc(s['end'])}] {s['text']}\n" for s in segs), encoding="utf-8")

    md = ["# VID-001 / урок 003 — полный транскрипт (кыргызский, Scribe v2, без правок)\n",
          "Абсолютные таймкоды источника `1000218169.mp4`. Текст — машинное распознавание; "
          "спорные места — в [`review-flags.csv`](review-flags.csv) и [`README.md`](README.md).\n"]
    minute_block = -1
    for s in segs:
        block = int(s["start"] // 300)
        if block != minute_block:
            minute_block = block
            md.append(f"\n## {tc(block * 300)[:8]} – {tc(min((block + 1) * 300, prog['source']['duration_s']))[:8]}\n")
        md.append(f"`{tc(s['start'])[:10]}` {s['text']}  ")
    (OUT / "full.kir.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    rows = flags_for(segs, seams)
    with open(OUT / "review-flags.csv", "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=["segment", "listen_from", "listen_to", "flag", "word", "logprob", "context"])
        wr.writeheader()
        wr.writerows(rows)
    counts = {}
    for r in rows:
        counts[r["flag"]] = counts.get(r["flag"], 0) + 1
    print(f"{len(segs)} segments, {sum(len(s['words']) for s in segs)} tokens; flags: {counts}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("plan", "next"):
        sp = sub.add_parser(name)
        sp.add_argument("source")
    sub.add_parser("merge")
    a = p.parse_args()
    {"plan": cmd_plan, "next": cmd_next, "merge": cmd_merge}[a.cmd](a)


if __name__ == "__main__":
    main()
