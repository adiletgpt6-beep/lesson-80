#!/usr/bin/env python3
"""Split an authentic MP4 into pieces whose bytes/hashes match the committed manifest."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BLOCK = 1024 * 1024


def hash_file(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for data in iter(lambda: stream.read(BLOCK), b''):
            digest.update(data)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path, help='Path to original 1000218169.mp4')
    parser.add_argument('--lesson', default='003', choices=['003'])
    args = parser.parse_args()
    manifest_path = ROOT / 'lessons' / args.lesson / 'source' / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    inp = args.input.resolve()
    if inp.stat().st_size != manifest['size_bytes'] or hash_file(inp) != manifest['sha256']:
        raise ValueError('Original file does not match the trusted size and SHA-256; aborting')
    target = ROOT / manifest['parts_directory']
    target.mkdir(parents=True, exist_ok=True)
    with inp.open('rb') as stream:
        for i, part in enumerate(manifest['parts'], 1):
            filename = part['filename']
            if Path(filename).name != filename:
                raise ValueError('Unsafe filename in manifest')
            path = target / filename
            data = stream.read(part['size_bytes'])
            if len(data) != part['size_bytes'] or hashlib.sha256(data).hexdigest() != part['sha256']:
                raise ValueError(f'Piece {i} does not match the manifest')
            if path.exists():
                if path.stat().st_size != len(data) or hash_file(path) != part['sha256']:
                    raise ValueError(f'Existing piece is wrong: {path}')
            else:
                tmp = path.with_suffix('.partial')
                try:
                    tmp.write_bytes(data)
                    tmp.replace(path)
                finally:
                    tmp.unlink(missing_ok=True)
            print(f'[{i}/{len(manifest["parts"])}] ready {path}')
        if stream.read(1):
            raise ValueError('Unexpected bytes after final part')
    print('OK: all parts match the trusted manifest; upload parts/ to GitHub')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        sys.exit(1)
