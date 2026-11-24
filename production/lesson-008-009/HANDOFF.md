# Уроки 008 и 009 (Studio VID-004, «5-сабак устаза» → 5А / 5Б) — HANDOFF

Ветка: `vid-004-lessons-008-009` (создана от `ccr-b45178a7-jvim2c` @ `8ecf23b` — PR #9, там вся рабочая инфраструктура:
Remotion-проект, ElevenLabs-конвейер, Scribe, аудио-QA, общая обложка). Задание пользователя от 2026-11-23: из записи
VID-004 (Issue #10) сделать два самостоятельных урока ~30 мин; уроки 001–007 не трогать.

Нумерация курса: VID-002 → 001–003, VID-001 → 004–005, VID-003 → 006–007, поэтому VID-004 (пятый урок устаза) →
**008 (5А)** и **009 (5Б)**; производственные ID **R08** и **R09** (`lessons/R08`, `lessons/R09`). Номер меняется в одном
месте — `production/lesson-008-009/build_script.py` (`LESSONS`).

## 1. Источник

| | |
|---|---|
| Studio ID / Issue | VID-004 / [#10](https://github.com/adiletgpt6-beep/lesson-80/issues/10) |
| R2 object | `live/raw/e5d21eb0-eb75-43f1-bb62-709362c7d230/source.mp4` (приватный бакет) |
| Получение | `python3 scripts/studio_fetch.py adiletgpt6-beep/lesson-80 VID-004 DEST --expect-size 278031004 --expect-sha256 695a20a2…e85ad9` (токен `STUDIO_SOURCE_TOKEN`) |
| Проверка | 278 031 004 байт, SHA-256 `695a20a2210e476243739ab6aa6b8ff74c200aef23656e594e237d86b3e85ad9` — совпал с Issue #10 и брокером |
| Медиа | 02:15:37.9; H.264 640×360, AAC 44,1 кГц стерео |

## 2. Расшифровка и анализ

- Транскрипт: [`lessons/VID-004/transcript/README.md`](../../lessons/VID-004/transcript/README.md) (Scribe v2 ×2 прохода, язык `kir` p=1,0).
- Смысловая карта: [`lessons/VID-004/analysis/meaning-map.csv`](../../lessons/VID-004/analysis/meaning-map.csv) — 111 мыслей (92 озвучены, 19 исключены с причиной).
- Источники и спорные места: [`lessons/VID-004/analysis/SOURCES.md`](../../lessons/VID-004/analysis/SOURCES.md).

| Время источника | Тема | Урок |
|---|---|---|
| 00:00–00:33 | Таухид: рубубия, улухия, асма ва сыфат; доказательства Творца; сура Ихлас (Ахад, Самад, не родил/не рождён, нет равного); Билал; «Кун фа йакун», верблюдица Салиха; Бакара 163, Анбия 22, Хадид 3 | 008 |
| 00:33–00:53 | Сура Аср: клятва временем, человек в убытке, 4 условия; Имам Шафии; молодость и тень Трона | 009 |
| 00:53–02:15 | Вопросы-ответы: 99 имён, Абдусамат, звёзды и свет (→008); пророки и Ахмад (→008); Зальзаля, Муса и маги, тауба, иман дороже богатства, ширк и деньги, Кальман и нотариус, ният, рия/кибр/хасад, путь устаза, сахих/да‘иф, Бухари, дуа (→009) | 008 / 009 |

**Почему такое деление:** у устаза два самостоятельных блока — «Аллах один» (таухид, Ихлас) и «время и спасение»
(сура Аср); он сам переходит от «Ал-Аввал вал-Ахир — у Аллаха нет времени» к «Вал-аср — клятва временем» (00:33:10).
Ответы на вопросы распределены по смыслу; ни одна история или аят не разрезаны.

## 3. Производство

| Этап | Инструмент | Результат |
|---|---|---|
| Сценарий | `lessons/R0N/script/source.ky.txt` → `production/lesson-008-009/build_script.py` | 008: 13 глав, 38 сцен, 264 реплики; 009: 16 глав, 40 сцен, 243 реплики |
| Охват мыслей | `production/lesson-008-009/coverage_check.py` | 92/92 используемые мысли озвучены, 19 исключены, пробелов 0 |
| Озвучка | `LESSON=R0N python3 scripts/tts_generate.py --confirm --max-credits N` (ElevenLabs `eleven_v4`, `ky`, утверждённые голоса проекта; устаз — designed voice, не клон) | 502 новых клипа + 5 переиспользованных по хешу; ≈8 200 кредитов |
| Тест произношения | 46 реплик с терминами до массовой генерации, обратное распознавание Scribe | арабские формулы распознаны дословно (арабским/латинским шрифтом) |
| Обратная проверка всех клипов | `production/lesson-008-009/backcheck_mms.py` (Meta MMS-1B-all `kir`, локально) — Scribe/OpenAI недоступны: квота | `lessons/R0N/audio/backcheck_mms.json` |
| Таймлайн | `LESSON=R0N python3 scripts/lesson_script.py timeline`, `check_timeline.py` | 008 — 31:12, 009 — 28:24 (с обложкой 3 с) |
| Анимация | `video/` (Remotion): тот же устаз-риг, дети, класс; доски `art/boardPlans89.ts`; 21 новая анимированная иллюстрация в `art/Cutaway.tsx`; привязка `art/scenePlan89.ts` (`cutaways.py`); полосы «4 жылдыз» (008) и «4 ачкыч» (009); подряд идущие реплики одного эпизода играют одной непрерывной вставкой (`Scene.tsx`, только уроки ≥ 008) | композиции `Lesson008`, `Lesson009`, `Cover008`, `Cover009` |
| Рендер | `.github/workflows/lesson-008-009-render.yml` (коммит с `[render-89]`) | релизы `lesson-008-final`, `lesson-009-final` |

## 4. Ограничения на момент сдачи

- **ElevenLabs: квота аккаунта исчерпана** (осталось 7 кредитов из 23 736 после озвучки). Финальная сцена 008 собрана из уже
  озвученных проектом реплик с тем же текстом/голосом (кэш по хешу). Любая правка текста потребует пополнения квоты.
- OpenAI audio API: `credit_balance_exhausted`.

## 5. Как продолжить (правки после замечаний устаза)

1. Исправить `lessons/R0N/script/source.ky.txt` → `python3 production/lesson-008-009/build_script.py` →
   `python3 production/lesson-008-009/cutaways.py` → `python3 production/lesson-008-009/coverage_check.py`.
2. `LESSON=R0N python3 scripts/tts_generate.py --confirm --max-credits N` (платно только изменённое), затем
   `LESSON=R0N python3 scripts/lesson_script.py timeline && LESSON=R0N python3 scripts/check_timeline.py`.
3. Коммит с `[render-89]` → CI перерендерит и обновит релизы.

## 6. Выдача (2026-11-23)

Релизы [lesson-008-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-008-final) (00:31:12) и
[lesson-009-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-009-final) (00:28:24); страницы просмотра
[008](https://claude.ai/artifact/NSyrXTUnz6JBqLYarCMkEe) и [009](https://claude.ai/artifact/UJxswNWtA2amUiB5AwdacP) (приватные).
Страница-плеер собирается вне репозитория: финальный MP4 из релиза → 960×540 части по 100 с → Artifact. Проверки — REPORT.md.

## 7. Слияние в main (2026-11-24)

По разрешению владельца проверены и слиты все открытые PR (метод merge, история сохранена):
1. PR #11 (эта ветка) — включал по цепочке #2 (инфраструктура 003) → #6 (004–005) → #9 (006–007); #6 закрыт отдельным merge.
2. PR #7 → в ветку PR #5, затем PR #5 → main (общая обложка `shared/lesson-cover`, `shared/audio`).
3. PR #4 (001–003) — через интеграционную ветку `integrate-pr4-lessons-001-003` (PR #12): конфликты add/add в `shared/`
   разрешены (json обложек и `join_qa.py` — версия PR #4, `.gitignore` — объединение).

Проверено на main: validate + check_timeline R04–R09 OK; coverage 004–005 / 006–007 / 008–009 OK; `check_copies.py` OK
(обе копии LessonCover); `tsc` и `remotion bundle` обоих Remotion-проектов OK. Рабочие ветки других чатов не удалялись.
