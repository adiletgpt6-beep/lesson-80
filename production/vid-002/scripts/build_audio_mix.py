#!/usr/bin/env python3
"""Sample-accurate voice track for a lesson, built from the timeline (AUDIO_JOIN_QA_RULES.md: sync + clean joins).

    LESSON=R01 python3 production/vid-002/scripts/build_audio_mix.py mix.wav

Why: chapters are rendered separately and concatenated without re-encoding; every chapter's AAC stream carries encoder
priming/padding, so the concatenated audio drifts later by ~20–30 ms per chapter (measured +272 ms at the end of
lesson 1). Here every cleaned clip is placed at its exact frame (scene.from + beat.from) into one 48 kHz stereo PCM
track of exactly the video's length; the film is then muxed with video copied and this track encoded once.
Remotion's own mix is the same clips at volume 1 (no music, no effects), so nothing else is lost.
"""
import json, os, subprocess, sys
from pathlib import Path
import numpy as np
REPO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO / "shared/audio"))
import clip_clean  # noqa: E402

SR = 48000
L = os.environ["LESSON"]
tl = json.loads((REPO / f"production/vid-002/video/src/lessons/l{L}/timeline.json").read_text(encoding="utf-8"))
n = round(tl["durationInFrames"] / tl["fps"] * SR)
y = np.zeros(n, np.float32)
k = 0
for s in tl["scenes"]:
    for b in s["beats"]:
        if b["type"] == "line" and b.get("audio"):
            x = clip_clean.load(REPO / f"lessons/{L}/audio/clips/{b['audio']}", SR)
            st = round((s["from"] + b["from"]) / tl["fps"] * SR)
            x = x[: max(0, min(len(x), n - st))]
            y[st:st + len(x)] += x
            k += 1
peak = float(np.abs(y).max())
# one gain for the whole lesson: peak −3 dBFS (as the approved films) so AAC encoding never clips
TARGET = 10 ** (-3.0 / 20)
y *= TARGET / peak
peak = TARGET
st = np.repeat(y[:, None], 2, axis=1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le", sys.argv[1]],
               input=st.astype(np.float32).tobytes(), check=True)
print(f"{L}: {k} clips, {n / SR:.3f} s, peak {20 * np.log10(peak):.1f} dBFS -> {sys.argv[1]}")
