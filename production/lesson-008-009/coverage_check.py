#!/usr/bin/env python3
"""Coverage of the ustaz's ideas (lessons/VID-004/analysis/meaning-map.csv) in lessons 008 / 009.

Every idea whose decision is `use…` must be voiced in its lesson by at least one line citing it; ideas marked
`omit…` must not be cited anywhere; every idea of the source is accounted for. Exit 1 on any gap.
    python3 production/lesson-008-009/coverage_check.py
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
    rows = list(csv.DictReader(open(ROOT / "lessons/VID-004/analysis/meaning-map.csv", encoding="utf-8")))
    c8, c9 = cited("R08"), cited("R09")
    errors, used, omitted = [], 0, 0
    for r in rows:
        i, lesson, dec = r["idea_id"], r["lesson"], r["decision"]
        where = {"008": c8, "009": c9}
        if dec.startswith("omit"):
            omitted += 1
            if i in c8 or i in c9:
                errors.append(f"{i}: marked omit but cited in {c8.get(i) or c9.get(i)}")
            continue
        used += 1
        lines = where.get(lesson, {}).get(i, [])
        if not lines:
            errors.append(f"{i} ({lesson}): not voiced")
        elif not any(not ped for _, ped in lines) and not dec.startswith("use (") and "ПЕД" not in dec:
            pass  # carried only by [ПЕД] lines that cite it — allowed, reported below
    only_ped = [r["idea_id"] for r in rows if not r["decision"].startswith("omit")
                and all(ped for _, ped in {"008": c8, "009": c9}.get(r["lesson"], {}).get(r["idea_id"], [("", True)]))]
    print(f"ideas: {len(rows)} (use {used}, omit {omitted}); lines citing ideas: 008 {sum(map(len, c8.values()))}, "
          f"009 {sum(map(len, c9.values()))}")
    print(f"ideas carried only by [ПЕД] retellings: {only_ped or 'none'}")
    for e in errors:
        print("ERROR", e)
    print("OK" if not errors else f"{len(errors)} gap(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
