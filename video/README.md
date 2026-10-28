# Lesson 003 — Remotion project (draft)

1920×1080, 30 fps, **no music**. The composition `Lesson003` is built from `src/timeline.json`, which
`python3 scripts/lesson_script.py timeline` generates from `lessons/003/script/chapters/*.json`.
Beat timing is an **estimate** (words ÷ measured TTS pace) until real clips exist in
`lessons/003/audio/manifest.json`; then `timing: "audio"` and exact clip lengths are used.

Characters, board and stars are **placeholders** (simple SVG/text) to validate timing and layout;
final art replaces `src/components/*`. Allah is never depicted; prophets are not depicted.

```bash
cd video && npm ci
npm run typecheck                    # cheap, safe
npm run studio                       # interactive preview
npx remotion still src/index.ts Lesson003 out/still.png --frame=300 \
  --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome   # one PNG
ln -s ../../lessons/003/audio/clips public/audio   # after TTS clips exist
```

**Do not** render the full video or a final MP4 until `lessons/003/script/qa-blockers.md` is cleared and the
owner approves; `render:draft-scene` renders only the first 30 s at half scale for checks.
