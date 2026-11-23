#!/usr/bin/env python3
"""Build lessons 006 / 007 (production ids R06 / R07, Studio VID-003) from their compact script sources.

    python3 production/lesson-006-007/build_script.py

Input:  lessons/R0N/script/source.ky.txt  (one line = one beat; see the header of lessons/R06/script/source.ky.txt)
        lessons/VID-003/analysis/meaning-map.csv  (idea id -> absolute source timecodes)
Output: lessons/R0N/script/chapters/<id>.json  (the standard chapter schema, lessons/003/script/SCHEMA.md)
        lessons/R0N/script/lesson.json, lessons/R0N/analysis/meaning-map-reviewed.csv (copy for the validator)
Then the usual tools apply with LESSON=R06 / R07: lesson_script.py validate|render|timeline, tts_generate.py,
check_timeline.py, mix_audio.py.
"""
import csv
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAP = ROOT / "lessons/VID-003/analysis/meaning-map.csv"
SPEAKER = {"U": "ustaz", "B": "bektur", "A": "aizada", "K": "both_children"}

LESSONS = {
    "R06": {"number": 6, "title": "Ыйман жана анын алты шарты", "subtitle": "Аллах · Периштелер · Китептер · Пайгамбарлар · Тагдыр · Акырет",
            "topic": "Ыйман жана анын алты шарты",
            "youtube_title": "80 САБАКТЫН 6-САБАГЫ | Ыйман жана анын алты шарты",
            "source_span": "VID-003 00:00:00–00:34:00 (I01–I39) + суроо-жооп I76–I78, I85–I89, I91–I92"},
    "R07": {"number": 7, "title": "Жан дүйнө кантип өсөт?", "subtitle": "Ыймандын 11 тепкичи: илимден хикматка чейин",
            "topic": "Жан дүйнө кантип өсөт? Ыймандын 11 тепкичи",
            "youtube_title": "80 САБАКТЫН 7-САБАГЫ | Жан дүйнө кантип өсөт? Ыймандын 11 тепкичи",
            "source_span": "VID-003 00:33:40–01:10:10 (I40–I71) + суроо-жооп I72, I73, I75, I80, I82, I84"},
}


def idea_times():
    out = {}
    for r in csv.DictReader(open(MAP, encoding="utf-8")):
        out[r["idea_id"]] = (r["start"], r["end"])
    return out


def sources(field, times, where):
    res = []
    for i in [x.strip() for x in field.split(",") if x.strip()]:
        if i not in times:
            sys.exit(f"{where}: unknown idea {i}")
        a, b = times[i]
        res.append(f"{i} {a}–{b}")
    return res


def parse(path, times):
    chapters, ch, sc = [], None, None
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        where = f"{path.name}:{n}"
        if not line or (line.startswith("#") and not line.startswith("# ") and not line.startswith("## ")):
            continue
        if line.startswith("## "):
            sid, title, setting, camera, chars = [x.strip() for x in line[3:].split("|")]
            sc = {"id": sid, "title_ky": title, "setting": setting, "camera": camera,
                  "characters": chars.split(","), "board": [], "animation": [], "beats": []}
            ch["scenes"].append(sc)
        elif line.startswith("# "):
            parts = [x.strip() for x in line[2:].split("|")]
            if len(parts) != 4 or not re.fullmatch(r"[ab]\d\d", parts[0]):
                continue  # free comment line
            cid, title, planned, ideas = parts
            ch = {"id": cid, "title_ky": title, "planned_seconds": int(planned),
                  "source_ideas": [x.strip() for x in ideas.split(",") if x.strip()], "scenes": []}
            chapters.append(ch)
        elif line.startswith("board:"):
            sc["board"] += [x.strip() for x in line[6:].split(";") if x.strip()]
        elif line.startswith("anim:"):
            sc["animation"] += [x.strip() for x in line[5:].split(";") if x.strip()]
        elif re.match(r"^[PV] \d", line):
            kind, rest = line[0], line[2:]
            secs, _, text = rest.partition("|")
            b = {"type": "pause", "seconds": float(secs), "reason": text.strip()} if kind == "P" else \
                {"type": "visual", "seconds": float(secs), "description": text.strip()}
            sc["beats"].append(b)
        else:
            m = re.match(r"^([UBAK])(\+?) \| (.+?)(?: \| ([I\d, ]+))?$", line)
            if not m:
                sys.exit(f"{where}: cannot parse: {line}")
            code, ped, text, ideas = m.groups()
            src = sources(ideas or "", times, where)
            if not ped and not src:
                sys.exit(f"{where}: ustaz line without idea id must be marked U+ ([ПЕД])")
            sc["beats"].append({"type": "line", "speaker": SPEAKER[code], "text": text.strip(), "source": src,
                                "ped": bool(ped), "blocked": None})
    return chapters


def main():
    times = idea_times()
    for lid, meta in LESSONS.items():
        base = ROOT / "lessons" / lid
        chapters = parse(base / "script/source.ky.txt", times)
        out = base / "script/chapters"
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)
        for ch in chapters:
            (out / f"{ch['id']}.json").write_text(json.dumps(ch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        lesson = {"id": lid, **{k: meta[k] for k in ("number", "title", "subtitle")},
                  "chapters": [c["id"] for c in chapters],
                  "opening_scene": chapters[0]["scenes"][0]["id"], "final_scene": chapters[-1]["scenes"][-1]["id"],
                  "cover": True, "planned_seconds": 1800, "minutes": [25, 35], "line_gap": 0.8,
                  "source": "Studio VID-003 (Issue #8), source.mp4, SHA-256 4d872052…68213d",
                  "source_span": meta["source_span"], "topic": meta["topic"], "youtube_title": meta["youtube_title"]}
        (base / "script/lesson.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        (base / "analysis").mkdir(exist_ok=True)
        shutil.copy(MAP, base / "analysis/meaning-map-reviewed.csv")
        (base / "youtube-title.txt").write_text(meta["youtube_title"] + "\n", encoding="utf-8")
        n_lines = sum(1 for c in chapters for s in c["scenes"] for b in s["beats"] if b["type"] == "line")
        n_ped = sum(1 for c in chapters for s in c["scenes"] for b in s["beats"] if b["type"] == "line" and b["ped"])
        print(f"{lid}: {len(chapters)} chapters, {sum(len(c['scenes']) for c in chapters)} scenes, {n_lines} lines ({n_ped} [ПЕД])")


if __name__ == "__main__":
    main()
