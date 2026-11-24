"""Scribe v2: transcript of the raw ElevenLabs clip vs the cleaned clip, for every clip where clip_clean removed an
edge burst — proves no word was cut. LESSON=R01 python3 production/vid-002-rework/backcheck_clean.py"""
import json, os, sys, subprocess, tempfile, difflib
from pathlib import Path
REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "production/vid-002/scripts"))
import tts_backcheck as tb
L = os.environ["LESSON"]
A = REPO / f"lessons/{L}/audio"
man = json.loads((A / "manifest.json").read_text())["clips"]
out = {}
for k, v in man.items():
    if not [r for r in v.get("clean", {}).get("removed", []) if r[0] in ("head", "tail")]:
        continue
    got = {}
    for tag, f in (("raw", v["raw_file"]), ("clean", v["file"])):
        with tempfile.TemporaryDirectory() as t:
            w = Path(t) / "a.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(A / "clips" / f), "-ac", "1", "-ar", "16000", str(w)], check=True)
            raw = tb.transcribe(w, "kir", {})
        got[tag] = " ".join(x["text"] for x in raw.get("words", []) if x.get("type") == "word")
    sim_text = difflib.SequenceMatcher(None, tb.norm(v["text"]), tb.norm(got["clean"])).ratio()
    sim_raw = difflib.SequenceMatcher(None, tb.norm(v["text"]), tb.norm(got["raw"])).ratio()
    out[k] = {"script": v["text"], "raw": got["raw"], "clean": got["clean"], "sim_raw": round(sim_raw, 3), "sim_clean": round(sim_text, 3)}
    print(f"{k} raw {sim_raw:.3f} clean {sim_text:.3f}", flush=True)
(A / "backcheck_clean.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
