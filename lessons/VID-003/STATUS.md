# VID-003 → уроки 006 (4А) и 007 (4Б) — STATUS

Обновлено: 2026-11-23. Ветка `ccr-b45178a7-jvim2c`. Подробности — [production/lesson-006-007/HANDOFF.md](../../production/lesson-006-007/HANDOFF.md),
итоговый отчёт — [production/lesson-006-007/REPORT.md](../../production/lesson-006-007/REPORT.md).

| Этап | Состояние | Доказательство |
|---|---|---|
| 1. Репозиторий, Issue #8 | ✓ | HANDOFF §1 |
| 2. Исходник из R2 через Studio broker | ✓ 734 307 895 байт, SHA-256 совпал | `source/manifest.json` |
| 2. Полная расшифровка (Scribe v2 ×2, MMS) | ✓ машинная; на слух человеком не сверена | `transcript/README.md` |
| 3. Смысловая карта, деление на 2 урока | ✓ 94 мысли; 85 в уроках, 9 исключены с причиной | `analysis/meaning-map.csv`, `coverage_check.py` → OK |
| 4. Два сценария | ✓ 006: 248 реплик; 007: 250 реплик | `lessons/R06|R07/script/chapters.ky.md` |
| 5. Проверка религиозных источников | ✓ реестр, 13 исправлений/исключений | `analysis/SOURCES.md` |
| 6. Озвучка ElevenLabs (утверждённые голоса проекта) | ✓ 498 реплик, 7 789 кредитов; тест произношения до массовой генерации | `lessons/R0N/audio/manifest.json`, `backcheck_new.json` |
| 6. Анимация (Remotion) | ✓ контрольные кадры и тест-рендер 20 с просмотрены | HANDOFF §4 |
| 7–8. Рендер и технические проверки | ✓ CI-прогон 45212962414 — все задачи success; 006 00:29:10.37, 007 00:28:35.40; 0 чёрных/тихих/застывших участков, аудио-QA OK | REPORT §2 |
| 9. Обложки и YouTube-пакет | ✓ релизы `lesson-006-final`, `lesson-007-final` (MP4, обложка 1280×720, название, описание, главы, SRT) | REPORT §1 |
| 9. Страницы просмотра | ✓ [006](https://claude.ai/artifact/4G9JRWh8isLbMFLE8PB2FF), [007](https://claude.ai/artifact/EQL2Wa7zTSFetig4qs2ynk) — плеер 960×540 (18 частей), главы, тексты YouTube; приватные до «Поделиться» | REPORT §4 |
| 10. Cloudflare R2 для готовых MP4 | **заблокировано**: в окружении нет ключей записи R2 (есть только `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, read-only `STUDIO_SOURCE_TOKEN`) — MP4 публикуются в релизах GitHub | — |
| 11. PR в main | PR #9 открыт, конфликтов нет; слияние ждёт подтверждения владельца (ветка включает также неслитые PR #2/#6 уроков 003–005) | [PR #9](https://github.com/adiletgpt6-beep/lesson-80/pull/9) |
| 12. Проверка устазом / носителем языка | не проведена | — |
