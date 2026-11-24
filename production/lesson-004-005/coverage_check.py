#!/usr/bin/env python3
"""Coverage: every voiced line of lesson 003 is in exactly one of R04/R05, word for word unless listed in EDITS."""
import json, os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "production/lesson-004-005"))
from build_split import EDITS  # noqa: E402
CODE = "import json,sys; sys.path.insert(0,'scripts'); from script_lines import effective_lines; print(json.dumps([[l['key'], l['text'], l['beat'].get('source') or []] for l in effective_lines()]))"
def lines(lid):
    out = subprocess.run([sys.executable, "-c", CODE], cwd=ROOT, env={**os.environ, "LESSON": lid}, capture_output=True, text=True, check=True)
    return {k: (t, s) for k, t, s in json.loads(out.stdout)}
base, r4, r5 = lines("003"), lines("R04"), lines("R05")
edits = {(l, k): new for l, k, new, _ in EDITS}
missing, dup, changed, ustaz_ideas = [], [], [], set()
for k, (t, s) in base.items():
    where = [l for l, d in (("R04", r4), ("R05", r5)) if k in d]
    if not where: missing.append(k); continue
    if len(where) > 1: dup.append(k)
    l = where[0]; t2 = (r4 if l == "R04" else r5)[k][0]
    if t2 != t and edits.get((l, k)) != t2: changed.append(k)
    ustaz_ideas |= {x.split()[0] for x in s}
new = [k for d in (r4, r5) for k in d if k not in base]
ideas_new = {x.split()[0] for d in (r4, r5) for t, s in d.values() for x in s}
print(f"003 voiced lines: {len(base)} | in R04: {sum(k in r4 for k in base)} | in R05: {sum(k in r5 for k in base)}")
print(f"missing: {missing} | in both: {dup} | changed without EDITS entry: {changed}")
print(f"edited (EDITS): {len(EDITS)} | new lines (e04/o05): {len(new)}")
print(f"source ideas referenced in 003: {len(ustaz_ideas)}; still referenced in R04+R05: {len(ustaz_ideas & ideas_new)}; lost: {sorted(ustaz_ideas - ideas_new)}")
sys.exit(1 if missing or dup or changed or (ustaz_ideas - ideas_new) else 0)
