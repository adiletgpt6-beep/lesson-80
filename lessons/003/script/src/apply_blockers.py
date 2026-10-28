"""Mark script lines that depend on unconfirmed audio or on wording that needs a scholar.

Idempotent: run after (re)generating chapters/*.json. Never clears an existing `blocked` value.
Interval blockers block every line whose `source` overlaps the interval; key blockers block listed beats.
Definitions mirror script/qa-blockers.md.
"""
import json
import re
from pathlib import Path

CH = Path(__file__).resolve().parents[1] / "chapters"

INTERVALS = {  # id: (start, end) in source time
    "B1": ("00:48:22", "00:48:41"), "B2": ("00:01:19", "00:01:46"), "B5": ("00:59:53", "01:00:12"),
    "B6": ("00:51:05", "00:51:33"), "B7": ("00:15:34", "00:15:55"),
    "B8": ("00:48:14", "00:48:21"), "B9": ("00:52:09", "00:52:21"), "B10": ("00:56:36", "00:57:37"),
    "B11": ("00:53:20", "00:53:27"), "B12": ("00:21:44", "00:21:50"), "B13": ("00:30:38", "00:31:50"),
    "B14": ("00:20:09", "00:20:13"), "B15": ("00:10:09", "00:10:50"), "B16": ("00:05:01", "00:05:10"),
    "B17": ("00:02:27", "00:02:34"), "B18": ("00:06:45", "00:06:48"), "B19": ("00:32:36", "00:32:46"),
    "B20": ("00:39:42", "00:39:56"), "B21": ("00:40:16", "00:40:25"), "B22": ("00:59:23", "00:59:49"),
    "B23": ("00:11:43", "00:11:46"),
    "R13": ("00:42:48", "00:42:56"), "R14": ("00:34:22", "00:34:29"),
}
KEYS = {  # beat-level: Allah's speech / Quran narrative in paraphrase — wording needs a scholar (R12)
    "R12": ["ch05-s03#3", "ch05-s03#4", "ch05-s04#7", "ch05-s05#2", "ch05-s05#3", "ch05-s06#7"],
}
SRC = re.compile(r"(\d{2}:\d{2}:\d{2})–(\d{2}:\d{2}:\d{2})")


def sec(t):
    h, m, s = map(int, t.split(":"))
    return h * 3600 + m * 60 + s


def main():
    changed = {}
    for p in sorted(CH.glob("ch*.json")):
        ch = json.loads(p.read_text(encoding="utf-8"))
        dirty = False
        for s in ch["scenes"]:
            for i, b in enumerate(s["beats"]):
                if b["type"] != "line" or b["blocked"]:
                    continue
                key = f"{s['id']}#{i}"
                hit = next((bid for bid, keys in KEYS.items() if key in keys), None)
                if not hit:
                    for src in b["source"]:
                        m = SRC.search(src)
                        a, z = sec(m.group(1)), sec(m.group(2))
                        hit = next((bid for bid, (x, y) in INTERVALS.items() if a < sec(y) and z > sec(x)), None)
                        if hit:
                            break
                if hit:
                    b["blocked"] = hit
                    changed[hit] = changed.get(hit, 0) + 1
                    dirty = True
        if dirty:
            p.write_text(json.dumps(ch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("newly blocked:", dict(sorted(changed.items())))


if __name__ == "__main__":
    main()
