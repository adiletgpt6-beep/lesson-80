#!/usr/bin/env python3
"""Download a private Studio source through the BalaGo Studio broker.

Same protocol as https://balago-studio.vercel.app/studio-fetch.mjs, kept in-repo
so the code that runs is reviewed. Token is read from STUDIO_SOURCE_TOKEN; the
signed URL is never printed or saved.

  python3 scripts/studio_fetch.py adiletgpt6-beep/lesson-80 VID-002 /path/source.mp4 \
      [--expect-size N] [--expect-sha256 HEX]
"""
import argparse, hashlib, json, os, re, sys, time, urllib.request, urllib.error
from urllib.parse import urlparse, parse_qs

BASE = os.environ.get("STUDIO_SOURCE_URL", "https://balago-studio.vercel.app")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        raise urllib.error.HTTPError(a[0].full_url, a[2], "redirect refused", a[4], None)


OPENER = urllib.request.build_opener(NoRedirect)


def resolve(token, repo, vid):
    req = urllib.request.Request(
        BASE + "/api/source/resolve", method="POST",
        data=json.dumps({"repository": repo, "videoId": vid}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with OPENER.open(req, timeout=60) as r:
        d = json.load(r)
    u = urlparse(d.get("downloadUrl", ""))
    if u.scheme != "https" or not u.hostname.endswith(".r2.cloudflarestorage.com") \
            or "X-Amz-Signature" not in parse_qs(u.query):
        raise SystemExit("Unexpected download URL from broker")
    if not isinstance(d.get("size"), int) or d["size"] < 1:
        raise SystemExit("Invalid source metadata")
    return d


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(4 << 20), b""):
            h.update(b)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo"); ap.add_argument("video_id"); ap.add_argument("dest")
    ap.add_argument("--expect-size", type=int); ap.add_argument("--expect-sha256")
    a = ap.parse_args()
    if not re.fullmatch(r"(VID|LIVE|BW)-\d{3,4}", a.video_id):
        raise SystemExit("bad video id")
    token = os.environ.get("STUDIO_SOURCE_TOKEN")
    if not token:
        raise SystemExit("STUDIO_SOURCE_TOKEN missing")
    part = a.dest + ".part"
    os.makedirs(os.path.dirname(os.path.abspath(a.dest)), exist_ok=True)
    for attempt in range(1, 7):
        try:
            info = resolve(token, a.repo, a.video_id)
        except urllib.error.HTTPError as e:
            raise SystemExit(f"Source broker rejected request (HTTP {e.code})")
        size = info["size"]
        off = os.path.getsize(part) if os.path.exists(part) else 0
        if off > size:
            os.unlink(part); off = 0
        if off < size:
            hdr = {"Range": f"bytes={off}-"} if off else {}
            try:
                with OPENER.open(urllib.request.Request(info["downloadUrl"], headers=hdr), timeout=120) as r:
                    if off and r.status == 200:
                        os.unlink(part); continue
                    if r.status != (206 if off else 200):
                        raise RuntimeError(f"R2 GET HTTP {r.status}")
                    with open(part, "ab" if off else "wb") as f:
                        while True:
                            b = r.read(1 << 20)
                            if not b:
                                break
                            f.write(b)
            except Exception as e:  # never print URLs
                print(f"interrupted (attempt {attempt}/6): {type(e).__name__}", file=sys.stderr)
                time.sleep(2 ** attempt); continue
        if os.path.getsize(part) != size:
            continue
        digest = sha256(part)
        exp = info.get("sha256") or a.expect_sha256
        if exp and digest != exp:
            raise SystemExit("SHA-256 mismatch: partial file kept for investigation")
        if a.expect_sha256 and digest != a.expect_sha256:
            raise SystemExit("SHA-256 differs from expected value")
        if a.expect_size and size != a.expect_size:
            raise SystemExit("size differs from expected value")
        os.replace(part, a.dest)
        print(f"{a.video_id} source ready: {a.dest}")
        print(f"Size: {size} bytes; SHA-256: {digest}; broker sha256 present: {bool(info.get('sha256'))}")
        return
    raise SystemExit("download failed after 6 attempts")


if __name__ == "__main__":
    main()
