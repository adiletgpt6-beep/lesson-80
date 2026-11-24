# VID-004 (Issue #10) → уроки 008 / 009 — STATUS

Ветка: `vid-004-lessons-008-009`. Нумерация: VID-002 → 001–003, VID-001 → 004–005, VID-003 → 006–007, поэтому
**VID-004 (5-й урок устаза) → 008 (5А) и 009 (5Б)**, производственные ID R08 / R09.

**Состояние 2026-11-23: оба урока готовы и опубликованы** — релизы
[lesson-008-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-008-final) (31:12) и
[lesson-009-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-009-final) (28:24); страницы просмотра
[008](https://claude.ai/artifact/NSyrXTUnz6JBqLYarCMkEe), [009](https://claude.ai/artifact/UJxswNWtA2amUiB5AwdacP).

| Этап | Состояние | Доказательство |
|---|---|---|
| 1. Источник | ✓ Studio broker: 278 031 004 байт, SHA-256 `695a20a2…e85ad9` = Issue #10; 02:15:37.9 | `source/manifest.json` |
| 2. ASR | ✓ Scribe v2 `kir` ×2 прохода, 13 165 слов | `transcript/README.md` |
| 3. Анализ | ✓ 111 мыслей, 92 озвучены, 19 исключены | `analysis/meaning-map.csv`, `analysis/SOURCES.md` |
| 4. Сценарии | ✓ 008: 264 реплики; 009: 243 | `lessons/R08|R09/script/` |
| 5. Озвучка | ✓ ElevenLabs eleven_v4 ky; тест терминов; MMS-проверка всех клипов (0,950 / 0,959) | `lessons/R0N/audio/` |
| 6. Анимация и рендер | ✓ CI run 45281237660, все проверки OK | `production/lesson-008-009/REPORT.md` |
| 7. Публикация | ✓ релизы, обложки, названия, описания, главы, SRT, страницы-плееры | REPORT §1 |

Слито в main 2026-11-24 (PR #11; уроки 001–009 — в main, см. README «Реестр уроков курса»).

Открыто: квота ElevenLabs исчерпана (правки озвучки — после пополнения); устаз содержание не проверял (SOURCES.md §3).
