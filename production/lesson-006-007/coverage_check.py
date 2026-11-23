#!/usr/bin/env python3
"""Coverage of the ustaz's ideas (lessons/VID-003/analysis/meaning-map.csv) in lessons 006 / 007.

Every idea whose decision is `use…` must be voiced in its lesson by at least one line citing it; ideas marked
`omit…` must not be cited anywhere; every idea of the source is accounted for. Exit 1 on any gap.
    python3 production/lesson-006-007/coverage_check.py
"""
import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))


def cited(lid):
    meta = json.loads((ROOT / f"lessons/{lid}/script/lesson.json").read_text(encoding="utf-8"))
    res = defaultdict(list)
    for c in meta["chapters"]:
        ch = json.loads((ROOT / f"lessons/{lid}/script/chapters/{c}.json").read_text(encoding="utf-8"))
        for s in ch["scenes"]:
            for i, b in enumerate(s["beats"]):
                if b["type"] == "line":
                    for src in b["source"]:
                        res[src.split()[0]].append((f"{s['id']}#{i}", b["ped"]))
    return res


def main():
    rows = list(csv.DictReader(open(ROOT / "lessons/VID-003/analysis/meaning-map.csv", encoding="utf-8")))
    c6, c7 = cited("R06"), cited("R07")
    errors, used, omitted = [], 0, 0
    for r in rows:
        i, lesson, dec = r["idea_id"], r["lesson"], r["decision"]
        where = {"006": c6, "007": c7}
        if dec.startswith("omit"):
            omitted += 1
            if i in c6 or i in c7:
                errors.append(f"{i}: marked omit but cited in {c6.get(i) or c7.get(i)}")
            continue
        used += 1
        lines = where.get(lesson, {}).get(i, [])
        if not lines:
            errors.append(f"{i} ({lesson}): not voiced")
        elif not any(not ped for _, ped in lines) and not dec.startswith("use (") and "ПЕД" not in dec:
            pass  # carried only by [ПЕД] lines that cite it — allowed, reported below
    only_ped = [r["idea_id"] for r in rows if not r["decision"].startswith("omit")
                and all(ped for _, ped in {"006": c6, "007": c7}.get(r["lesson"], {}).get(r["idea_id"], [("", True)]))]
    print(f"ideas: {len(rows)} (use {used}, omit {omitted}); lines citing ideas: 006 {sum(map(len, c6.values()))}, "
          f"007 {sum(map(len, c7.values()))}")
    print(f"ideas carried only by [ПЕД] retellings: {only_ped or 'none'}")
    for e in errors:
        print("ERROR", e)
    print("OK" if not errors else f"{len(errors)} gap(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
