#!/usr/bin/env python3
"""Drop manifest entries / clip files of R04, R05 that no voiced line uses any more (after script edits)."""
import json, os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
used_files = set()
for lid in ("R04", "R05"):
    out = subprocess.run([sys.executable, "-c", "import json,sys; sys.path.insert(0,'scripts'); from script_lines import effective_lines; print(json.dumps([[l['key'], l['text']] for l in effective_lines()]))"],
                         cwd=ROOT, env={**os.environ, "LESSON": lid}, capture_output=True, text=True, check=True)
    live = dict(json.loads(out.stdout))
    mp = ROOT / f"lessons/{lid}/audio/manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    stale = [k for k, c in m["clips"].items() if live.get(k) != c["text"]]
    for k in stale:
        del m["clips"][k]
    mp.write_text(json.dumps(m, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    used_files |= {c["file"] for c in m["clips"].values()}
    bp = ROOT / f"lessons/{lid}/audio/backcheck_new.json"
    if bp.exists():
        b = json.loads(bp.read_text(encoding="utf-8"))
        b = {k: v for k, v in b.items() if k in m["clips"] and m["clips"][k]["file"] == v["file"]}
        bp.write_text(json.dumps(b, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(lid, "stale manifest entries removed:", stale)
for lid in ("R04", "R05"):
    for f in (ROOT / f"lessons/{lid}/audio/clips").glob("*.mp3"):
        if f.name not in used_files:
            print("delete orphan clip", f.relative_to(ROOT)); f.unlink()
