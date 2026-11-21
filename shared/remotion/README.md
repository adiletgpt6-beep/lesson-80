# shared/remotion — course-wide Remotion components (LESSON-80)

`LessonCover.tsx` — the single opening cover for all 80 lessons (rule: `OPENING_COVER_RULES.md` on main).
Frames 0–89 (exactly 3.00 s @ 30 fps) show the cover; afterwards the caller fades it out over
`COVER_FADE_FRAMES` (15) into the lesson. Only `number`, `title` and optional `subtitle` change.

- Depends only on React and the 'Noto Sans' 400/700 webfont that every lesson project already loads.
- 1920×1080 stage, scaled to any composition size — the YouTube thumbnail is the same component at 1280×720.
- Using it from a Remotion project outside this folder: import `../../shared/remotion/LessonCover` (path relative
  to the project's `src/`) and let webpack resolve `react` from the project's node_modules:
  `Config.overrideWebpackConfig((c) => ({ ...c, resolve: { ...c.resolve, modules: [path.resolve(process.cwd(), "node_modules"), "node_modules"] } }))`
  (see `video/remotion.config.ts`); for `tsc` add the folder to `include` and map `react` in `paths`
  (see `video/tsconfig.json`).
- First used by lessons 004/005 (`video/`, branch `claude/lesson-004-005-split`). Lessons 001–003 (other
  production stream) can import the same file; please change the design only here, so all covers stay identical.
