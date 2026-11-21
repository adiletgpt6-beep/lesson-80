#!/usr/bin/env python3
"""Build lessons/R0N (VID-002 rework) from specs.py: chapter JSON, origin map, reused voice clips.

    python3 production/vid-002-rework/compose.py R01 [--estimate]

- Writes lessons/R0N/script/chapters/chNN.json in the standard schema (production/vid-002/script/SCHEMA.md), plus
  `origin` ("001:ch03-s04#9") on every reused beat and "new" on new beats.
- Reuses the approved ElevenLabs clip of every line whose text is unchanged (same voice/model/settings → same hash):
  the mp3 is copied to lessons/R0N/audio/clips under the new key, manifest entry gets `reused_from`, 0 credits.
  Changed/new lines are left for production/vid-002/scripts/tts_generate.py (paid, dry-run by default).
- Never writes to lessons/001, lessons/002 or lessons/003.
"""
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE))
import specs  # noqa: E402

WORD = re.compile(r"[^\s«»“”\"—–.,!?…:;()]+")
PACE = {"ustaz": 105.0, "child": 90.0}
GAP, QGAP, TITLE = 0.6, 1.2, 3.0


def load_src(lesson):
    chs = {}
    for p in sorted((REPO / f"lessons/{lesson}/script/chapters").glob("ch*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        for s in d["scenes"]:
            chs[s["id"]] = s
    man = json.loads((REPO / f"lessons/{lesson}/audio/manifest.json").read_text(encoding="utf-8"))["clips"]
    return chs, man


SRC = {L: load_src(L) for L in ("001", "002")}
CFG = json.loads((REPO / "lessons/001/audio/voices.json").read_text(encoding="utf-8"))


def clip_hash(speaker, text):
    v = [CFG["voices"]["bektur"]["voice_id"], CFG["voices"]["aizada"]["voice_id"]] if speaker == "both_children" \
        else [CFG["voices"][speaker]["voice_id"]]
    blob = json.dumps([text, v, CFG["model_id"], CFG["language_code"], CFG["voice_settings"]], ensure_ascii=False)
    return hashlib.sha256(blob.encode()).hexdigest()[:16]


def resolve(b):
    if "reuse" in b:
        L, rest = b["reuse"].split(":")
        sid, i = rest.split("#")
        return {**SRC[L][0][sid]["beats"][int(i)], "origin": b["reuse"]}
    return {**b, "origin": "new"}


def build(lid):
    spec = getattr(specs, lid)
    out_ch, origin_scenes = [], {}
    for ch in spec["chapters"]:
        scenes = []
        for n, (ref, op) in enumerate(ch["scenes"], 1):
            sid = f"{ch['id']}-s{n:02d}"
            if ref == "new":
                base = {k: op[k] for k in ("title_ky", "setting", "camera", "characters", "board", "animation")}
                beats = [resolve(b) for b in op["beats"]]
                origin_scenes[sid] = op.get("board_from", "new")
            else:
                L, osid = ref.split(":")
                src = SRC[L][0][osid]
                base = {k: src[k] for k in ("title_ky", "setting", "camera", "characters", "board", "animation")}
                base.update({k: op[k] for k in ("title_ky",) if k in op})
                origin_scenes[sid] = ref
                beats = []
                adds = op.get("add", {})
                beats += [resolve(b) for b in adds.get(-1, [])]
                for i, b in enumerate(src["beats"]):
                    if i not in op.get("drop", []):
                        b = dict(b)
                        b["origin"] = f"{ref}#{i}"
                        if b["type"] == "visual" and i in op.get("replace", {}):
                            b["description"] = op["replace"][i]
                        if b["type"] == "line" and i in op.get("replace", {}):
                            b["text"] = op["replace"][i]
                            b["revoiced"] = True
                        if b["type"] == "pause":
                            b["seconds"] = min(b["seconds"], op.get("pmax", spec.get("pmax", 99)))
                        if b["type"] == "visual":
                            b["seconds"] = min(b["seconds"], op.get("vmax", spec.get("vmax", 99)))
                        beats.append(b)
                    beats += [resolve(x) for x in adds.get(i, [])]
            for b in beats:
                b.pop("new", None)
            scenes.append({"id": sid, **base, "beats": beats})
        ideas = ch.get("ideas", [])
        out_ch.append({"id": ch["id"], "title_ky": ch["title"], "planned_seconds": ch.get("planned", 0),
                       "source_ideas": ideas, "scenes": scenes})
    return spec, out_ch, origin_scenes


def words(t):
    return len(WORD.findall(t))


def estimate(lid, chs, man_new):
    tot, rows = 0.0, []
    for ch in chs:
        t = TITLE if ch["id"] != "ch00" else 0.0
        for s in ch["scenes"]:
            for i, b in enumerate(s["beats"]):
                if b["type"] == "line":
                    key = f"{s['id']}#{i}"
                    sec = man_new[key]["seconds"] if key in man_new else words(b["text"]) / (PACE["ustaz"] if b["speaker"] == "ustaz" else PACE["child"]) * 60
                    t += sec + (QGAP if b["speaker"] == "ustaz" and b["text"].rstrip().endswith("?") else GAP)
                else:
                    t += float(b["seconds"])
        rows.append((ch["id"], ch["title_ky"], t))
        tot += t
    return tot, rows


def main():
    lid = sys.argv[1]
    spec, chs, origin_scenes = build(lid)
    L = REPO / "lessons" / lid
    chdir = L / "script/chapters"
    if chdir.exists():
        shutil.rmtree(chdir)
    chdir.mkdir(parents=True)
    for ch in chs:
        (chdir / f"{ch['id']}.json").write_text(json.dumps(ch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (L / "script/qa-blockers.md").write_text("# Блокеры\n\n| ID | Описание |\n|---|---|\n| R1 | Арабский текст — не озвучивается |\n", encoding="utf-8")
    (L / "script/origin.json").write_text(json.dumps({"scenes": origin_scenes}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    audio = L / "audio"
    clips = audio / "clips"
    clips.mkdir(parents=True, exist_ok=True)
    shutil.copy(REPO / "lessons/001/audio/voices.json", audio / "voices.json")
    mpath = audio / "manifest.json"
    man = json.loads(mpath.read_text(encoding="utf-8")) if mpath.exists() else {"clips": {}}
    man["settings"] = {k: CFG[k] for k in ("model_id", "language_code", "output_format", "voice_settings")}
    keep, reused, todo = {}, 0, []
    for ch in chs:
        for s in ch["scenes"]:
            for i, b in enumerate(s["beats"]):
                if b["type"] != "line":
                    continue
                key = f"{s['id']}#{i}"
                h = clip_hash(b["speaker"], b["text"])
                old = man["clips"].get(key)
                if old and old["hash"] == h and (clips / old["file"]).exists():
                    keep[key] = old
                    continue
                o = b.get("origin", "new")
                if o != "new" and not b.get("revoiced"):
                    Ls, okey = o.split(":")
                    oc = SRC[Ls][1][okey]
                    assert oc["hash"] == h, (key, o)
                    fname = f"{key.replace('#', '_')}_{h}.mp3"
                    shutil.copy(REPO / f"lessons/{Ls}/audio/clips/{oc['file']}", clips / fname)
                    keep[key] = {**oc, "file": fname, "credits": 0, "reused_from": f"{Ls}:{okey}"}
                    reused += 1
                else:
                    todo.append((key, b["speaker"], b["text"]))
    # drop clip files no longer referenced
    used = {v["file"] for v in keep.values()}
    for f in clips.glob("*.mp3"):
        if f.name not in used:
            f.unlink()
    man["clips"] = keep
    mpath.write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tot, rows = estimate(lid, chs, keep)
    for cid, title, t in rows:
        print(f"  {cid} {t / 60:5.1f} min  {title}")
    nl = sum(1 for ch in chs for s in ch["scenes"] for b in s["beats"] if b["type"] == "line")
    print(f"{lid}: {len(chs)} chapters, {sum(len(c['scenes']) for c in chs)} scenes, {nl} lines; reused clips {reused + len(keep) - reused}, "
          f"to voice {len(todo)} ({sum(len(t[2]) for t in todo)} chars ≈ {sum(len(t[2]) * (2 if t[1] == 'both_children' else 1) for t in todo) * 0.5:.0f} credits); "
          f"estimated length {tot / 60:.1f} min")
    for k, sp, t in todo:
        print(f"    TODO {k} [{sp}] {t}")


if __name__ == "__main__":
    main()
