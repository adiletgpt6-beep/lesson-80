#!/usr/bin/env python3
"""Fail if any project copy of LessonCover.tsx differs from the canonical shared/lesson-cover/LessonCover.tsx."""
import hashlib, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
canon = (ROOT / "shared/lesson-cover/LessonCover.tsx").read_bytes()
copies = [p for p in ROOT.rglob("LessonCover.tsx") if "node_modules" not in p.parts and p.parent != ROOT / "shared/lesson-cover"]
bad = [p for p in copies if p.read_bytes() != canon]
print(f"canonical sha256 {hashlib.sha256(canon).hexdigest()[:16]}; copies: {[str(p.relative_to(ROOT)) for p in copies]}")
for p in bad:
    print("DIFFERS:", p.relative_to(ROOT))
sys.exit(1 if bad else 0)
