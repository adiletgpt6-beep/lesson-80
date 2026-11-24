#!/usr/bin/env python3
"""Drop manifest entries / clip files of R06, R07 that no voiced line uses any more (after script edits).

    python3 production/lesson-006-007/prune_audio.py [R06 R07]
Clip files are shared by hash between lessons, so a file is deleted only when no manifest of R04–R07 uses it.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
lessons = sys.argv[1:] or ["R06", "R07"]
for lid in lessons:
    out = subprocess.run([sys.executable, "-c", "import json,sys; sys.path.insert(0,'scripts'); from script_lines import effective_lines; "
                          "print(json.dumps([[l['key'], l['text']] for l in effective_lines()]))"],
                         cwd=ROOT, env={**os.environ, "LESSON": lid}, capture_output=True, text=True, check=True)
    live = dict(json.loads(out.stdout))
    mp = ROOT / f"lessons/{lid}/audio/manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    stale = [k for k, c in m["clips"].items() if live.get(k) != c["text"]]
    for k in stale:
        del m["clips"][k]
    mp.write_text(json.dumps(m, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    bp = ROOT / f"lessons/{lid}/audio/backcheck_new.json"
    if bp.exists():
        b = json.loads(bp.read_text(encoding="utf-8"))
        b = {k: v for k, v in b.items() if k in m["clips"] and m["clips"][k]["file"] == v["file"]}
        bp.write_text(json.dumps(b, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(lid, "stale manifest entries removed:", stale)
used = set()
for lid in ("R04", "R05", "R06", "R07"):
    mp = ROOT / f"lessons/{lid}/audio/manifest.json"
    if mp.exists():
        used |= {c["file"] for c in json.loads(mp.read_text(encoding="utf-8"))["clips"].values()}
for lid in lessons:
    gone = [f.name for f in (ROOT / f"lessons/{lid}/audio/clips").glob("*.mp3") if f.name not in used]
    for n in gone:
        (ROOT / f"lessons/{lid}/audio/clips" / n).unlink()
    print(lid, "unused clip files deleted:", len(gone))
