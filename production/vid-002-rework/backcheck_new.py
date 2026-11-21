"""Scribe back-check of NEW (non-reused) clips of a rework lesson only. Usage: LESSON=R02 python3 check_new.py [keys...]"""
import json, os, sys, subprocess, tempfile, difflib
from pathlib import Path
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "vid-002/scripts"))
import tts_backcheck as tb
L = os.environ["LESSON"]
A = Path(__file__).resolve().parents[2] / f"lessons/{L}/audio"
man = json.loads((A / "manifest.json").read_text())["clips"]
keys = sys.argv[1:] or [k for k, v in man.items() if not v.get("reused_from")]
out = {}
for k in keys:
    with tempfile.TemporaryDirectory() as t:
        w = Path(t) / "a.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(A / "clips" / man[k]["file"]), "-ac", "1", "-ar", "16000", str(w)], check=True)
        raw = tb.transcribe(w, "kir", {})
    got = " ".join(x["text"] for x in raw.get("words", []) if x.get("type") == "word")
    sim = difflib.SequenceMatcher(None, tb.norm(man[k]["text"]), tb.norm(got)).ratio()
    out[k] = {"sim": round(sim, 3), "want": man[k]["text"], "heard": got}
    print(f"{k} {sim:.3f}\n  want: {man[k]['text']}\n  got : {got}", flush=True)
p = A / "backcheck_new.json"
old = json.loads(p.read_text()) if p.exists() else {}
old.update(out)
p.write_text(json.dumps(old, ensure_ascii=False, indent=1) + "\n")
