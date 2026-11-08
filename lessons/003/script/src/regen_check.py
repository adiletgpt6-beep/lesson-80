"""Prove that the chapter generators reproduce the committed chapters/*.json byte for byte.

Run from the repo root: python3 lessons/003/script/src/regen_check.py
The committed JSON is restored afterwards whatever the result, so a stale generator can never overwrite newer text.
Exit code 1 lists every chapter that differs: port the JSON edit into the generator before regenerating.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SRC = Path(__file__).resolve().parent
CH = SRC.parent / "chapters"
GENERATORS = ["ch00_03", "ch04_06", "ch07_09", "ch10_12", "ch13_16"]


def main():
    with tempfile.TemporaryDirectory() as tmp:
        saved = Path(tmp) / "committed"
        shutil.copytree(CH, saved)
        try:
            for g in GENERATORS + ["apply_blockers"]:
                subprocess.run([sys.executable, str(SRC / f"{g}.py")], check=True, capture_output=True)
            differ = sorted(p.name for p in saved.glob("ch*.json") if (CH / p.name).read_bytes() != p.read_bytes())
        finally:
            for p in saved.glob("ch*.json"):
                shutil.copy2(p, CH / p.name)
    if differ:
        print("generators are STALE for:", ", ".join(differ))
        sys.exit(1)
    print(f"OK: {len(list(CH.glob('ch*.json')))} chapters reproduced byte-for-byte")


if __name__ == "__main__":
    main()
