# Урок 003 — реестр рендера и готовности глав (preview v1)

Собрано GitHub Actions (`.github/workflows/lesson-003-render.yml`), прогон [40777013338](https://github.com/adiletgpt6-beep/lesson-80/actions/runs/40777013338), коммит `1da4551`. Все главы отрендерены Remotion 4.0.539 (композиции `Lesson003-chNN`, 1920×1080, 30 fps, H.264 CRF 20, AAC), склеены `ffmpeg -f concat -c copy`.
Релиз: **https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-003-preview-v1** (pre-release).

## Итоговый файл

| | |
|---|---|
| Файл | `lesson-80-003-full-ky-preview-v1.mp4` — [скачать](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-003-preview-v1/lesson-80-003-full-ky-preview-v1.mp4) |
| Длительность | **00:59:03.38** (3 543,38 с; 106 300 кадров) |
| Видео | 1920×1080, 30 fps, H.264; чёрных кадров ≥0,5 с: 0 (`blackdetect`) |
| Звук | AAC; mean −22,2 dB, max −3,0 dB; без музыки; тишина ≥8 с — 5 мест (стыки глав: титр 3 с + визуальный бит) |
| Размер | 402,7 МБ |
| SHA-256 | `5ade7a6114ea7e186df4d1d6d293a4f2cbaf89d9d542dc4288aab1845fc5b6f2` (проверено повторной загрузкой в сессии) |
| Облегчённая версия | `lesson-80-003-full-ky-preview-v1-preview-960x540.mp4`, 100,8 МБ, `f5dce3a7…dbbe075` |
| Голоса | `lesson-003-audio-clips-v1.zip` (509 MP3 + manifest + voices), 44,7 МБ |
| Страница просмотра | см. STATUS.md (Claude Artifact) |

Проверка: `python3 scripts/verify_mp4.py lesson-80-003-full-ky-preview-v1.mp4 --expect-min-seconds 3300 --expect-max-seconds 3900` → hard checks OK.

## Главы

| Глава | Начало | Длительность | Файл релиза | SHA-256 |
|---|---|---|---|---|
| ch00 | 00:00:00 | 01:24 | ch00.mp4 (9,9 МБ) | `780061ef…ddf297bc` |
| ch01 | 00:01:24 | 03:46 | ch01.mp4 (26,2 МБ) | `c9771e01…4a4c44c0` |
| ch02 | 00:05:10 | 02:34 | ch02.mp4 (18,3 МБ) | `68065171…4f77734e` |
| ch03 | 00:07:44 | 06:48 | ch03.mp4 (42,9 МБ) | `8680bb7a…75c77a7f` |
| ch04 | 00:14:32 | 02:19 | ch04.mp4 (17,1 МБ) | `682ce0b3…b3a841dd` |
| ch05 | 00:16:51 | 06:21 | ch05.mp4 (44,6 МБ) | `da914fdc…e9b4032a` |
| ch06 | 00:23:12 | 04:52 | ch06.mp4 (28,1 МБ) | `e7c280f2…0b992d25` |
| ch07 | 00:28:05 | 04:15 | ch07.mp4 (29,8 МБ) | `631b9e5f…a9b14547` |
| ch08 | 00:32:19 | 03:51 | ch08.mp4 (25,5 МБ) | `bec79bea…b1259ea9` |
| ch09 | 00:36:10 | 03:42 | ch09.mp4 (25,6 МБ) | `3114f2f1…64bf51f2` |
| ch10 | 00:39:53 | 04:38 | ch10.mp4 (34,2 МБ) | `0069c7a8…dcc48a80` |
| ch11 | 00:44:31 | 03:26 | ch11.mp4 (22,9 МБ) | `dce04295…f79b43a0` |
| ch12 | 00:47:57 | 02:19 | ch12.mp4 (16,3 МБ) | `8680c6fb…ff4702d6` |
| ch13 | 00:50:16 | 03:17 | ch13.mp4 (23,8 МБ) | `079f8196…070ea8d4` |
| ch14 | 00:53:33 | 02:10 | ch14.mp4 (14,2 МБ) | `1015ba7d…f7bcbd66` |
| ch15 | 00:55:43 | 02:32 | ch15.mp4 (17,2 МБ) | `f73d017d…f28ae90b` |
| ch16 | 00:58:16 | 00:48 | ch16.mp4 (6,0 МБ) | `b26ffad4…c23e94ae` |

Полные суммы — в `SHA256SUMS.txt` релиза. Главы и их границы — из `video/src/timeline.json` (`chapters`).

## Как перерендерить
1. Изменить сценарий/графику → `python3 scripts/lesson_script.py timeline` → push в ветку `claude/lesson-003-animation-production-*` (workflow запускается сам) или `workflow_dispatch`.
2. Новые реплики озвучить `python3 scripts/tts_generate.py --confirm --max-credits N` (кэш: оплачиваются только изменённые) и закоммитить клипы.
3. Релиз перезаписывается (`--clobber`) тем же тегом; для утверждённой версии создать новый тег (например `lesson-003-v1`).
