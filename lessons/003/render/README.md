# Урок 003 — реестр рендера и готовности глав

## Актуальная версия: preview v1, ревизия 2 (07.11.2026)

Собрано GitHub Actions (`.github/workflows/lesson-003-render.yml`), прогон [42369416955](https://github.com/adiletgpt6-beep/lesson-80/actions/runs/42369416955), коммит `aa12c4f`, ветка `claude/lesson-003-kyrgyz-speech-gmsuzh`. Remotion 4.0.539, композиции `Lesson003-chNN`, 1920×1080, 30 fps, H.264 CRF 20, AAC; склейка `ffmpeg -f concat -c copy`.
Релиз (pre-release): **https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-003-preview-v1-r2**. Текст описания релиза устарел (остался от прогона 42367319633: «e4ad0ee, 607.1 MB») — файлы перезаписаны прогоном 42369416955; верные данные — здесь и в `SHA256SUMS.txt` релиза.

| | |
|---|---|
| Файл | `lesson-80-003-full-ky-preview-v1.mp4` — [скачать](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-003-preview-v1-r2/lesson-80-003-full-ky-preview-v1.mp4) |
| Длительность | **00:59:04.21** (3 544,21 с; 106 325 кадров) |
| Видео | 1920×1080, 30 fps, H.264 High; чёрных кадров ≥0,5 с: 0; застывшей картинки ≥8 с (`freezedetect n=0.001`): 0 |
| Звук | AAC LC 48 кГц стерео; mean −22,2 dB, max −3,0 dB; без музыки; тишина ≥8 с — 5 мест (стыки глав: титр 3 с + визуальный бит) |
| Размер | 618.7 МБ |
| SHA-256 | `8f631e55bc02b8969c439a45a30d32a1ee16c19ecfdf54239e778ab9e9d63c8b` (проверено повторной загрузкой в сессии) |
| Облегчённая версия | `lesson-80-003-full-ky-preview-v1-preview-960x540.mp4`, 171.3 МБ, `dbc1507d…f7066258` |
| Страница просмотра | https://claude.ai/artifact/LptQWP8TCQi4yR1iBQBZGb (Claude Artifact, приватная; плеер 854×480 по главам + ссылки на релиз) |

Проверки: `python3 scripts/check_timeline.py` → OK; `python3 scripts/verify_mp4.py … --expect-min-seconds 3300 --expect-max-seconds 3900` → hard checks OK; контрольные кадры начала/середины/конца каждой главы просмотрены.

### Главы (ревизия 2)

| Глава | Начало | Длительность | Файл релиза | SHA-256 |
|---|---|---|---|---|
| ch00 | 00:00:00 | 01:24 | ch00.mp4 (14.2 МБ) | `2c681340…a8604e5a` |
| ch01 | 00:01:24 | 03:46 | ch01.mp4 (38.8 МБ) | `a28eba17…1c64ad45` |
| ch02 | 00:05:10 | 02:33 | ch02.mp4 (27.2 МБ) | `2b9b6bee…f8e06feb` |
| ch03 | 00:07:43 | 06:48 | ch03.mp4 (63.2 МБ) | `2ad590d3…a71b402a` |
| ch04 | 00:14:32 | 02:18 | ch04.mp4 (25.3 МБ) | `5333eb7a…70117147` |
| ch05 | 00:16:50 | 06:21 | ch05.mp4 (70.2 МБ) | `aa7fc8de…01c9a173` |
| ch06 | 00:23:12 | 04:52 | ch06.mp4 (43.8 МБ) | `1b0658aa…fc09d466` |
| ch07 | 00:28:04 | 04:17 | ch07.mp4 (48.3 МБ) | `1427f812…a6a9c115` |
| ch08 | 00:32:21 | 03:51 | ch08.mp4 (36.4 МБ) | `c1d4d86a…980d6fab` |
| ch09 | 00:36:13 | 03:43 | ch09.mp4 (38.7 МБ) | `00743e26…91a0acf4` |
| ch10 | 00:39:56 | 04:39 | ch10.mp4 (53.8 МБ) | `0aeff1b9…2ab7b5eb` |
| ch11 | 00:44:36 | 03:25 | ch11.mp4 (35.4 МБ) | `91dc9b42…088bb27a` |
| ch12 | 00:48:01 | 02:18 | ch12.mp4 (23.6 МБ) | `526451da…f1297700` |
| ch13 | 00:50:20 | 03:17 | ch13.mp4 (38.1 МБ) | `fd1fd99f…a219cd2d` |
| ch14 | 00:53:37 | 02:10 | ch14.mp4 (23.9 МБ) | `8c7c89fc…e0550cde` |
| ch15 | 00:55:47 | 02:28 | ch15.mp4 (27.7 МБ) | `9cf998fd…c38ccdcb` |
| ch16 | 00:58:16 | 00:47 | ch16.mp4 (10.1 МБ) | `1f91d757…13c66b24` |

Полные суммы — в `SHA256SUMS.txt` релиза.

## Как перерендерить
1. Изменить сценарий/графику → `python3 scripts/lesson_script.py timeline` → `python3 scripts/check_timeline.py`.
2. Новые реплики: `python3 scripts/tts_generate.py --scenes … --confirm --max-credits N` (кэш: оплачиваются только изменённые), закоммитить клипы.
3. Коммит с `[render]` в сообщении в ветку `claude/lesson-003-kyrgyz-speech-gmsuzh` (или `claude/lesson-003-animation-production-*`) запускает рендер; тег релиза по умолчанию `lesson-003-preview-v1-r2` (перезаписывается `--clobber`). Если создание нового релиза отклонено (HTTP 403), файлы с суффиксом `-r2` прикрепляются к `lesson-003-preview-v1`. Полный фильм всегда сохраняется и как Actions-артефакт `lesson-003-full` (30 дней).
4. Загрузка в приватный R2 — шаг в CI, выполняется только при наличии GitHub-секретов `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (сейчас их нет — шаг пропускается).
5. Ширины глифов доски (`video/src/art/glyphWidths.ts`) пересчитать при новых символах: fontTools по `node_modules/@fontsource/noto-sans/files/noto-sans-{latin,cyrillic,cyrillic-ext}-700-normal.woff` (см. коммит ревизии 2).

## Предыдущая версия: preview v1 (28.10.2026)
Релиз https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-003-preview-v1 — 00:59:03.38, 402,7 МБ, SHA-256 `5ade7a6114ea7e186df4d1d6d293a4f2cbaf89d9d542dc4288aab1845fc5b6f2`, прогон 40777013338. Сохранён без изменений.
