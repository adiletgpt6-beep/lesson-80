# Уроки 006 и 007 (Studio VID-003, «4-сабак устаза» → 4А / 4Б) — HANDOFF

Ветка: `ccr-b45178a7-jvim2c` (создана от `claude/lesson-004-005-split` @ `708a60b` — там вся рабочая инфраструктура:
Remotion-проект, ElevenLabs-конвейер, Scribe, аудио-QA, общая обложка). Задание пользователя от 2026-11-23:
из записи VID-003 (Issue #8) сделать два самостоятельных урока ~30 мин; уроки 001–005 не трогать.

Нумерация курса: VID-002 → уроки 001–003, VID-001 → 004–005, поэтому VID-003 (четвёртый урок устаза) → **006 (4А)**
и **007 (4Б)**; производственные ID **R06** и **R07** (`lessons/R06`, `lessons/R07`). Если владелец решит иначе,
номер меняется в одном месте — `production/lesson-006-007/build_script.py` (`LESSONS`).

**Выдача (2026-11-23):** релизы [lesson-006-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-006-final) (00:29:10) и
[lesson-007-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-007-final) (00:28:35); страницы просмотра
[006](https://claude.ai/artifact/4G9JRWh8isLbMFLE8PB2FF) и [007](https://claude.ai/artifact/EQL2Wa7zTSFetig4qs2ynk) (приватные); проверки — REPORT.md.
Страница-плеер собирается вне репозитория: локальный рендер 960×540 → части по 100 с → Artifact (по ≤5 частей за публикацию).

## 1. Источник

| | |
|---|---|
| Studio ID / Issue | VID-003 / [#8](https://github.com/adiletgpt6-beep/lesson-80/issues/8) |
| R2 object | `live/raw/428150b5-da0a-4b61-a4e5-9380521c089f/source.mp4` (приватный бакет) |
| Получение | `python3 scripts/studio_fetch.py adiletgpt6-beep/lesson-80 VID-003 DEST --expect-size 734307895 --expect-sha256 4d872052…68213d` (токен `STUDIO_SOURCE_TOKEN` в окружении) |
| Проверка | 734 307 895 байт, SHA-256 `4d8720528fe90a8c6fd4279983bb8afeaa4d813d6c7cef8873efafbda368213d` — совпал с Issue #8 и брокером |
| Медиа | 02:03:20.9; AV1 1080×1920 (снято боком), AAC 44,1 кГц стерео |
| Манифест | [`lessons/VID-003/source/manifest.json`](../../lessons/VID-003/source/manifest.json) |

## 2. Расшифровка и анализ

- Транскрипт и метод: [`lessons/VID-003/transcript/README.md`](../../lessons/VID-003/transcript/README.md) (Scribe v2 ×2 прохода, MMS `kir`).
- Основной язык — **кыргызский** (казахская орфография Scribe — артефакт; подтверждено MMS и стыком 00:04:53).
- Смысловая карта: [`lessons/VID-003/analysis/meaning-map.csv`](../../lessons/VID-003/analysis/meaning-map.csv) — 94 мысли.
- Проверка источников, исправленные и исключённые места: [`lessons/VID-003/analysis/SOURCES.md`](../../lessons/VID-003/analysis/SOURCES.md).

### Содержание записи

| Время | Тема | Урок |
|---|---|---|
| 00:00–00:34 | Хадис Джибриля; иман и его 6 столпов (Аллах, ангелы, книги, пророки, предопределение, ахират) | 006 |
| 00:34–01:10 | Как растёт душа: 11 ступеней (илим → ойлонуу → таануу → кабыл алуу → ыйман → сүйүү → амал → адеп → ыклас → ихсан → хикмат); иман-«батарейка»; без споров об акыде; чистое сердце | 007 |
| 01:10–01:22 | Вопросы: обе книги от Аллаха, ресурсы земли, барзах и воскрешение | 007 / 006 |
| 01:22–01:34 | Эмиграция, президент, экономика (исключено), канаат и шукур, правила спора | 007 |
| 01:34–01:52 | Книги для чтения; биография Пророка ﷺ; истории пророков как уроки; печать пророков; прощение в Мекке, Таиф; долги и права людей | 007 / 006 |
| 01:52–02:03 | Справедливость воскрешения (006); власть, выборы, экономика (исключено) | 006 / — |

**Почему такое деление:** у устаза два самостоятельных блока — «во что верим» (6 столпов) и «как вера растёт»
(11 ступеней); сам он переходит между ними фразой «Эми биз ушуларга иман келтирдик… кандай этаптардан өтөбүз?»
(00:33:45). Ответы на вопросы распределены по смыслу, ни одна история/аят не разрезана.

## 3. Структура уроков (точный таймлайн, 30 fps)

См. `lessons/R06/script/chapters.ky.md`, `lessons/R07/script/chapters.ky.md` (генерируются `lesson_script.py render`) и
файлы глав YouTube в релизах.

## 4. Производство

| Этап | Инструмент | Результат |
|---|---|---|
| Сценарий | `lessons/R0N/script/source.ky.txt` → `production/lesson-006-007/build_script.py` → `script/chapters/*.json` | 006: 8 глав, 32 сцены, 248 реплик; 007: 14 глав, 29 сцен, 250 реплик |
| Охват мыслей | `production/lesson-006-007/coverage_check.py` | 85 используемых мыслей озвучены, 9 исключены с причиной, пробелов 0 |
| Озвучка | `LESSON=R06 python3 scripts/tts_generate.py --confirm --max-credits N` (ElevenLabs `eleven_v4`, `ky`, утверждённые голоса проекта: устаз — designed voice, не клон) | 498 реплик; новых клипов 470, кредиты: тест 639 + 6834 + 255 = 7728 |
| Тест произношения | Scribe-обратная проверка 37 реплик с терминами до массовой генерации | среднее 0,967 / 0,995; одна реплика переписана и переозвучена |
| Обратная проверка всех клипов | `LESSON=R0N python3 production/lesson-004-005/backcheck.py` | `lessons/R0N/audio/backcheck_new.json` |
| Таймлайн | `LESSON=R0N python3 scripts/lesson_script.py timeline`, `check_timeline.py` | 006 — 29:11, 007 — 28:34 (с обложкой 3 с) |
| Анимация | `video/` (Remotion): тот же устаз-риг, дети, класс, доска; новые доски `art/boardPlans67.ts`, 13 новых иллюстраций `art/Cutaway.tsx`, привязка `art/scenePlan67.ts` (`cutaways.py`), полоса «6 тиреков»/«11 тепкич» | композиции `Lesson006`, `Lesson007`, `Cover006`, `Cover007` |
| Рендер | `.github/workflows/lesson-006-007-render.yml` (коммит с `[render-67]`) | релизы `lesson-006-final`, `lesson-007-final` |

## 5. Как продолжить (правки после замечаний устаза)

1. Исправить текст в `lessons/R0N/script/source.ky.txt` → `python3 production/lesson-006-007/build_script.py`
   → `python3 production/lesson-006-007/cutaways.py` → `python3 production/lesson-006-007/coverage_check.py`.
2. `LESSON=R0N python3 scripts/tts_generate.py --confirm --max-credits N` (платно только изменённое), затем
   `LESSON=R0N python3 scripts/lesson_script.py timeline && LESSON=R0N python3 scripts/check_timeline.py`.
3. Коммит с `[render-67]` → CI перерендерит и обновит релизы.
