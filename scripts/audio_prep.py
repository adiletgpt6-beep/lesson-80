#!/usr/bin/env python3
"""Click-free voice clips (AUDIO_JOIN_QA_RULES.md) — shared audio pipeline step for every lesson.

    python3 scripts/audio_prep.py CLIP.mp3 OUT.wav       # one clip, prints what was done

Why: ElevenLabs clips of this course were measured (2026-11-21, 537 clips): 68 end with a 10–120 ms non-speech
burst that starts 110–720 ms AFTER the last word and is cut at the last sample (up to -12 dBFS), and 35 start at
full level on sample 0. Played back, both are a hard step in the waveform — the audible "трык" when the ustaz
stops talking. The approved text/voice is not changed; only the edges are cleaned:

1. decode to 48 kHz mono float (one sample rate / layout for the whole lesson);
2. remove DC offset with a first-order DC blocker (8 Hz high-pass; digital silence stays exactly 0);
3. trailing artefact: if the clip ends with a burst ≤ 150 ms that is separated from the speech by ≥ 100 ms of
   silence (< -60 dBFS), the burst is removed and up to 300 ms of the natural pause is kept — word endings are
   always before that pause, so nothing spoken is cut. A clip whose speech runs to the last sample is NOT trimmed
   (reported as `speech_to_end` → listen / regenerate that line);
4. the same rule for a leading burst before the first word;
5. isolated ticks inside pauses (a ≤ 4 ms event > -60 dBFS with true silence < -62 dBFS 2–12 ms on BOTH sides
   and ≥ 12 dB above it — lip/mouth clicks of the TTS voice) are faded out with a 6 ms raised-cosine dip;
   anything touching speech is left alone;
6. raised-cosine fade-in 5 ms and fade-out 10 ms, ending exactly on 0 (the edges are silence after step 3; on a
   clip that starts with speech the 5 ms fade only removes the step, not the syllable);
7. peak above -1 dBFS → plain gain down to -1 dBFS (no compression, no gate, no noise reduction).
"""
import json
import subprocess
import sys

import numpy as np

SR = 48000
WIN = 480  # 10 ms
SILENCE_DB = -60.0
MIN_GAP_S = 0.100
MAX_BURST_S = 0.150
KEEP_PAUSE_S = 0.300
FADE_IN_S = 0.005
FADE_OUT_S = 0.010
PEAK_MAX = 10 ** (-1 / 20)


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def frame_db(x):
    n = len(x) // WIN
    if n == 0:
        return np.array([-120.0])
    r = np.sqrt((x[: n * WIN].reshape(n, WIN) ** 2).mean(axis=1))
    return 20 * np.log10(r + 1e-9)


def edge_artefact(d):
    """Frames of a burst at the end of `d` (frame dB array) that is separated from earlier sound by a silent gap.
    Returns (burst_frames, gap_frames) or (0, 0)."""
    k = len(d) - 1
    while k >= 0 and d[k] > SILENCE_DB:
        k -= 1
    burst = len(d) - 1 - k
    if burst == 0:
        return 0, 0
    g = k
    while g >= 0 and d[g] <= SILENCE_DB:
        g -= 1
    gap = k - g
    if g < 0:  # nothing before the gap: the "burst" is the whole sound
        return 0, 0
    if burst * WIN <= MAX_BURST_S * SR and gap * WIN >= MIN_GAP_S * SR:
        return burst, gap
    return 0, 0


def declick_pauses(x):
    """Remove isolated ticks in silence (see 5.). Returns (x, list of positions in seconds)."""
    ms = SR // 1000
    n = len(x) // ms
    if n < 30:
        return x, []
    lv = 20 * np.log10(np.sqrt((x[: n * ms].reshape(n, ms) ** 2).mean(axis=1)) + 1e-12)
    done, out = [], x.copy()
    i = 12
    while i < n - 16:
        if lv[i] > -60:
            j = i
            while j < n and lv[j] > -60 and j - i < 5:
                j += 1
            if j - i <= 4:
                left, right = lv[i - 12:i - 2], lv[j + 2:j + 12]
                quiet = max(left.max(), right.max())
                if quiet < -62 and lv[i:j].max() - quiet >= 12:
                    a, b = (i - 3) * ms, (j + 3) * ms
                    w = np.ones(b - a)
                    k = 3 * ms
                    w[:k] = fade(k)[::-1]
                    w[-k:] = fade(k)
                    w[k:-k] = 0.0
                    out[a:b] *= w
                    done.append(round(i / 1000, 3))
            i = j + 1
        else:
            i += 1
    return out, done


def fade(n):
    return 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))


def dc_block(x):
    """First-order high-pass at 8 Hz (ffmpeg) — removes DC/sub-sonic offset; digital silence stays 0."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-af", "highpass=f=8:poles=1", "-f", "f32le", "-"],
                         input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def prepare(x):
    info = {"in_s": round(len(x) / SR, 3)}
    x = dc_block(x)
    d = frame_db(x)
    info["head_db"], info["tail_db"] = round(float(d[0]), 1), round(float(d[-1]), 1)
    burst, gap = edge_artefact(d)
    if burst:
        keep = min(gap, int(KEEP_PAUSE_S * SR / WIN))
        cut = (len(d) - burst - gap + keep) * WIN
        info["tail_artefact_ms"] = burst * 10
        info["tail_gap_ms"] = gap * 10
        x = x[:cut]
    elif d[-1] > SILENCE_DB:
        info["speech_to_end"] = True
    d = frame_db(x)
    b2, g2 = edge_artefact(d[::-1])
    if b2:
        keep = min(g2, int(KEEP_PAUSE_S * SR / WIN))
        start = (b2 + g2 - keep) * WIN
        info["head_artefact_ms"] = b2 * 10
        x = x[start:]
    x, ticks = declick_pauses(x)
    if ticks:
        info["ticks_removed_at_s"] = ticks
    nin, nout = int(FADE_IN_S * SR), int(FADE_OUT_S * SR)
    x = x.copy()
    x[:nin] *= fade(nin)
    x[-nout:] *= fade(nout)[::-1]
    x[0] = x[-1] = 0.0
    peak = float(np.abs(x).max())
    if peak > PEAK_MAX:
        x *= PEAK_MAX / peak
        info["peak_gain_db"] = round(20 * np.log10(PEAK_MAX / peak), 2)
    info["out_s"] = round(len(x) / SR, 3)
    return x, info


def write_wav(path, x):
    pcm = np.clip(np.round(x * 32767), -32768, 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", str(path)],
                   input=pcm, check=True)


if __name__ == "__main__":
    y, inf = prepare(decode(sys.argv[1]))
    write_wav(sys.argv[2], y)
    print(json.dumps(inf, ensure_ascii=False))
