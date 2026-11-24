# Уроки 006 и 007 (Studio VID-003) — технический отчёт (не входит в видео)

Дата: 2026-11-23. Ветка `ccr-b45178a7-jvim2c`. Финальный рендер: GitHub Actions
[прогон 45212962414](https://github.com/adiletgpt6-beep/lesson-80/actions/runs/45212962414), коммит `86ff870` — все 27 задач `success`.
Производство — [HANDOFF.md](HANDOFF.md); источники — [../../lessons/VID-003/analysis/SOURCES.md](../../lessons/VID-003/analysis/SOURCES.md).

## 1. Выдача

| | Урок 006 (4А) | Урок 007 (4Б) |
|---|---|---|
| Название YouTube | `80 САБАКТЫН 6-САБАГЫ \| Ыйман жана анын алты шарты` (49 знаков) | `80 САБАКТЫН 7-САБАГЫ \| Жан дүйнө кантип өсөт? Ыймандын 11 тепкичи` (65 знаков) |
| Релиз | [lesson-006-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-006-final) | [lesson-007-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-007-final) |
| ⬇ MP4 | [lesson-006-final.mp4](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-006-final/lesson-006-final.mp4) | [lesson-007-final.mp4](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-007-final/lesson-007-final.mp4) |
| ⬇ Обложка 1280×720 | [lesson-006-thumbnail.jpg](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-006-final/lesson-006-thumbnail.jpg) | [lesson-007-thumbnail.jpg](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-007-final/lesson-007-thumbnail.jpg) |
| ⬇ Описание / главы / SRT | [описание](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-006-final/lesson-006-youtube-description.txt) · [главы](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-006-final/lesson-006-chapters.txt) · [SRT](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-006-final/lesson-006.ky.srt) | [описание](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-007-final/lesson-007-youtube-description.txt) · [главы](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-007-final/lesson-007-chapters.txt) · [SRT](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-007-final/lesson-007.ky.srt) |
| ▶ Смотреть | [страница-плеер 006](https://claude.ai/artifact/4G9JRWh8isLbMFLE8PB2FF) | [страница-плеер 007](https://claude.ai/artifact/EQL2Wa7zTSFetig4qs2ynk) |
| Длительность | 00:29:10.37 (вкл. обложку 3 с) | 00:28:35.40 |
| Размер MP4 | 296 882 446 байт | 286 183 311 байт |
| SHA-256 MP4 (GitHub digest) | `bb6055729638a716783ee5bed90f87e2d93336c6ff80a11e432867229411430e` | `cb91d06423806ad67450ff39488a4b5bc30bd2f8675cd7cefecdf45944fa38f2` |
| SHA-256 обложки | `258ad7a707c40f6ada48fe5bd0ba13766b15cb8af220b33fedf318587b10f2f2` | `24e119205c90072fde05eb9107d95b8834583456dda610a9c41549747fdfe2d3` |

## 2. Проверки итоговых MP4 (CI, `verify_mp4.py`, `audio_join_qa.py`, freezedetect)

| Проверка | 006 | 007 |
|---|---|---|
| Формат | 1920×1080, 30 fps, H.264 yuv420p; AAC 48 кГц стерео, faststart | то же |
| Длина картинки / звука | 1750.367 / 1750.366 с (1 мс) | 1715.400 / 1715.400 с (0 мс) |
| Громкость | средняя −22,1 dB, пик −4,0 dB | −22,1 / −4,0 dB |
| Чёрные кадры ≥0,5 с | 0 | 0 |
| Тишина ≥8 с | 0 | 0 |
| Застывшая картинка ≥8 с | 0 | 0 |
| Аудиосклейки (AUDIO_JOIN_QA_RULES.md, блокирующая) | OK | OK |
| Обложка: кадры 0–89 = 3,00 с, затем 15 кадров перехода | ✓ (`check_timeline.py`) | ✓ |
| Служебные надписи в кадре | нет (компонент выводит служебную подпись только для превью 003; у 006/007 `meta` задан) | нет |
| Название ≤100 знаков | 49 | 65 |
| Охват мыслей устаза | 85/85 используемых мыслей озвучены (`coverage_check.py`), 9 исключены с причиной | |
| Синхронизация реплик | каждый клип ≤ своего бита (`check_timeline.py`, `mix_audio.py` без ошибок наложения) | |
| Читаемость на телефоне | субтитры 40 px на кадре 1080p (как в 001–005), надписи доски 30–64 px с автомасштабом, крупные планы доски; 15 контрольных кадров и 20-с тест просмотрены | |

## 3. Произношение (ElevenLabs `eleven_v4`, `ky`, утверждённые голоса проекта)

- Тест до массовой генерации — 37 реплик с терминами: среднее сходство обратного распознавания 0,967 / 0,995;
  «таухид», «Матуриди», «муташабих», «ихсан», «алейхиссалам», «саллаллаху алейхи ва саллам» — дословно.
- Обратная проверка всех новых клипов Scribe v2: 006 — среднее 0,974, 007 — 0,968. Низкие оценки почти все из-за
  того, что Scribe пишет кыргызскую речь казахскими/латинскими буквами (смысл совпадает). Реально исправлено 4 места:
  повтор фразы в a02-s01 (реплика переписана), «Ыклас деген эмне?», «Бешинчи тепкич — ыйман!», прощание
  «Көрүшкөнчө» (оба детских голоса произносили неверно → «Кош болуңуз, устаз!»). После правки — 1,000.
- Оценка носителем языка не проводилась.

## 4. Ссылки для просмотра

Ассеты релизов GitHub отдаются с `Content-Disposition: attachment` (это ссылки на скачивание). Для просмотра в браузере —
страница-плеер (claude.ai Artifact) с той же анимацией и звуком в 960×540 (локальный рендер того же таймлайна и той же звуковой дорожки, 18 частей по 100 с, бесшовный переход между частями, переход по главам):

- 006: https://claude.ai/artifact/4G9JRWh8isLbMFLE8PB2FF
- 007: https://claude.ai/artifact/EQL2Wa7zTSFetig4qs2ynk

Страницы приватные: открываются владельцем аккаунта; другим людям — через меню «Поделиться» на странице.

## 5. Не выполнено / ограничения

- **Cloudflare R2 для готовых MP4**: в окружении нет ключей записи R2 (есть только `R2_ACCOUNT_ID`, `R2_BUCKET_NAME` и
  read-only `STUDIO_SOURCE_TOKEN` для исходников). MP4 опубликованы в релизах GitHub, как уроки 001–005.
- Повторное скачивание MP4 из релиза в этом контейнере невозможно: хранилище GitHub отвечает 401, хост артефактов
  Actions запрещён сетевой политикой (403). Целостность подтверждена в CI (SHA256SUMS.txt в релизе и digest GitHub).
- Религиозное содержание проверено по источникам (SOURCES.md), но устаз его ещё не видел; [ПЕД]-реплики — на его проверку.
