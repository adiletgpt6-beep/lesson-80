#!/usr/bin/env python3
"""Fetch lesson 003 original from Studio R2; verify size and SHA-256 before use.

No credentials are stored in this repository. Requires boto3 and read-only R2
credentials in R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID,
R2_SECRET_ACCESS_KEY. Optionally R2_ENDPOINT_URL can replace R2_ACCOUNT_ID.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "lessons/003/source/manifest.json"

def checked(path: Path, expected_size: int, expected_sha: str) -> bool:
    if not path.is_file() or path.stat().st_size != expected_size:
        return False
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest() == expected_sha

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-only", action="store_true",
                        help="Verify a previously retrieved MP4 without R2 access")
    args = parser.parse_args()

    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    dest = ROOT / "lessons/003/source" / m["original_filename"]
    expected_size = int(m["size_bytes"])
    expected_sha = m["sha256"]
    if checked(dest, expected_size, expected_sha):
        print(f"VERIFIED: {dest} ({expected_size} bytes; sha256={expected_sha})")
        return 0
    if args.verify_only:
        print("NOT VERIFIED: original missing or its size/hash is incorrect", file=sys.stderr)
        return 1

    required = ["R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]
    missing = [name for name in required if not os.environ.get(name)]
    endpoint = os.environ.get("R2_ENDPOINT_URL")
    if not endpoint:
        account = os.environ.get("R2_ACCOUNT_ID")
        if not account:
            missing.append("R2_ACCOUNT_ID (or R2_ENDPOINT_URL)")
        else:
            endpoint = f"https://{account}.r2.cloudflarestorage.com"
    if missing:
        print("Missing R2 environment variables: " + ", ".join(missing), file=sys.stderr)
        return 2

    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        print("Install dependency: python3 -m pip install boto3", file=sys.stderr)
        return 2

    r2 = boto3.client("s3", endpoint_url=endpoint, region_name="auto",
                      aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
                      aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
                      config=Config(signature_version="s3v4"))
    key = m["primary_source"]["key"]
    bucket = os.environ["R2_BUCKET_NAME"]
    temp_path = None
    try:
        meta = r2.head_object(Bucket=bucket, Key=key)
        if int(meta["ContentLength"]) != expected_size:
            raise ValueError("R2 object size differs from the trusted manifest")
        dest.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=dest.parent, prefix=".r2_source_",
                                         suffix=".partial", delete=False) as tmp:
            temp_path = Path(tmp.name)
        with temp_path.open("wb") as target:
            r2.download_fileobj(bucket, key, target)
        if not checked(temp_path, expected_size, expected_sha):
            raise ValueError("R2 bytes do not match manifest SHA-256; refusing source")
        temp_path.replace(dest)
        print(f"VERIFIED: {dest} ({expected_size} bytes; sha256={expected_sha})")
        return 0
    except Exception as err:
        print(f"R2 download or validation failed: {type(err).__name__}: {err}",
              file=sys.stderr)
        return 1
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

if __name__ == "__main__":
    raise SystemExit(main())
