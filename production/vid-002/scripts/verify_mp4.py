#!/usr/bin/env python3
"""Quality gate for a rendered lesson MP4: container facts, duration window, black frames, long silences, loudness.

    python3 scripts/verify_mp4.py out.mp4 --expect-min-seconds 3300 --expect-max-seconds 3900

Prints a Markdown summary; exits 1 when a hard check fails (resolution, fps, codecs, duration window, black frames).
"""
import argparse
import json
import re
import subprocess
import sys


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stdout + subprocess.run(cmd, capture_output=True, text=True).stderr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--expect-min-seconds", type=float, default=0)
    ap.add_argument("--expect-max-seconds", type=float, default=1e9)
    a = ap.parse_args()
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", a.path],
                                      capture_output=True, text=True, check=True).stdout)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    au = [s for s in probe["streams"] if s["codec_type"] == "audio"]
    dur = float(probe["format"]["duration"])
    size = int(probe["format"]["size"])
    fps = eval(v["r_frame_rate"])  # e.g. 30/1
    problems = []
    if (v["width"], v["height"]) != (1920, 1080):
        problems.append(f"resolution {v['width']}×{v['height']}")
    if abs(fps - 30) > 0.01:
        problems.append(f"fps {fps}")
    if v["codec_name"] != "h264":
        problems.append(f"video codec {v['codec_name']}")
    if not au or au[0]["codec_name"] != "aac":
        problems.append("no AAC audio")
    if not (a.expect_min_seconds <= dur <= a.expect_max_seconds):
        problems.append(f"duration {dur:.1f}s outside [{a.expect_min_seconds}, {a.expect_max_seconds}]")
    # black frames (whole-frame black for >= 0.5 s)
    bl = subprocess.run(["ffmpeg", "-v", "info", "-i", a.path, "-an", "-vf", "blackdetect=d=0.5:pix_th=0.10", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    blacks = re.findall(r"black_start:(\S+) black_end:(\S+)", bl)
    if blacks:
        problems.append(f"black segments: {blacks[:5]}")
    # silences longer than 8 s (title cards are 3 s + a visual beat; anything longer is suspicious)
    sl = subprocess.run(["ffmpeg", "-v", "info", "-i", a.path, "-vn", "-af", "silencedetect=n=-45dB:d=8", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    silences = re.findall(r"silence_start: (\S+)", sl)
    vol = subprocess.run(["ffmpeg", "-v", "info", "-i", a.path, "-vn", "-af", "volumedetect", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    mean = re.search(r"mean_volume: (\S+) dB", vol)
    mx = re.search(r"max_volume: (\S+) dB", vol)
    h, m, s = int(dur // 3600), int(dur % 3600 // 60), dur % 60
    print(f"**{a.path}** — {h:02d}:{m:02d}:{s:05.2f} ({dur:.2f} s), {v['width']}×{v['height']}, {fps:g} fps, "
          f"{v['codec_name']}/{au[0]['codec_name'] if au else '—'}, {size / 1e6:.1f} MB, "
          f"audio mean {mean.group(1) if mean else '?'} dB / max {mx.group(1) if mx else '?'} dB")
    print(f"- black frames ≥0.5 s: {len(blacks)}; silences ≥8 s: {len(silences)}" + (f" (at {', '.join(silences[:8])} s)" if silences else ""))
    print("- hard checks: " + ("OK" if not problems else "FAILED — " + "; ".join(problems)))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
