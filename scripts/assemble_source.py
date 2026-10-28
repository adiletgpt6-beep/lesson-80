#!/usr/bin/env python3
"""Byte-exact reconstruction of the lesson MP4 from Git-tracked binary parts."""
import argparse
from contextlib import nullcontext
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BLOCK = 1024 * 1024


def sha256_file(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(BLOCK), b''):
            h.update(chunk)
    return h.hexdigest()


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lesson', default='003', choices=['003'])
    parser.add_argument('--verify-only', action='store_true', help='Verify all parts and concatenated bytes without writing MP4')
    parser.add_argument('--output', type=Path, help='Optional reconstructed MP4 path (default: lessons/003/source/1000218169.mp4)')
    args = parser.parse_args()
    base = ROOT / 'lessons' / args.lesson / 'source'
    manifest = json.loads((base / 'manifest.json').read_text(encoding='utf-8'))
    if manifest['lesson'] != args.lesson or manifest['original_filename'] != '1000218169.mp4':
        raise ValueError('Wrong lesson or filename in manifest')
    parts_dir = ROOT / manifest['parts_directory']
    out = args.output or base / manifest['original_filename']
    out = out.resolve()
    total = 0
    joined = hashlib.sha256()
    if not args.verify_only:
        out.parent.mkdir(parents=True, exist_ok=True)
        temp = out.with_suffix(out.suffix + '.partial')
        if temp.exists():
            temp.unlink()
    else:
        temp = None
    try:
        with (temp.open('wb') if temp else nullcontext()) as dest:
            for index, part in enumerate(manifest['parts']):
                filename = part['filename']
                if Path(filename).name != filename:
                    raise ValueError(f'Unsafe part name: {filename!r}')
                src = parts_dir / filename
                if not src.is_file():
                    raise FileNotFoundError(f'Missing part {index+1}/{len(manifest["parts"])}: {src}')
                if src.stat().st_size != part['size_bytes']:
                    raise ValueError(f'Wrong size: {src}')
                part_hash = hashlib.sha256()
                with src.open('rb') as inp:
                    for block in iter(lambda: inp.read(BLOCK), b''):
                        part_hash.update(block)
                        joined.update(block)
                        total += len(block)
                        if temp:
                            dest.write(block)
                if part_hash.hexdigest() != part['sha256']:
                    raise ValueError(f'SHA-256 mismatch: {src}')
                print(f'[{index+1}/{len(manifest["parts"])}] verified {filename}', flush=True)
        if total != manifest['size_bytes'] or joined.hexdigest() != manifest['sha256']:
            raise ValueError(f'Assembled file mismatch: size={total}, sha256={joined.hexdigest()}')
        if temp:
            temp.replace(out)
            if sha256_file(out) != manifest['sha256']:
                raise ValueError('Post-write SHA-256 mismatch')
            print(f'RESTORED {out}')
        print(f'OK: {total} bytes, SHA-256={joined.hexdigest()}')
    except BaseException:
        if temp:
            temp.unlink(missing_ok=True)
        raise


if __name__ == '__main__':
    try:
        run()
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        sys.exit(1)
