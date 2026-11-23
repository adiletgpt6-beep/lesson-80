# Уроки 008 и 009 (Studio VID-004) — технический отчёт (не входит в видео)

Дата: 2026-11-23. Ветка `vid-004-lessons-008-009`. Финальный рендер: GitHub Actions
[прогон 45281237660](https://github.com/adiletgpt6-beep/lesson-80/actions/runs/45281237660), коммит `9257b88` — все задачи `success`.
Производство — [HANDOFF.md](HANDOFF.md); источники — [../../lessons/VID-004/analysis/SOURCES.md](../../lessons/VID-004/analysis/SOURCES.md).

## 1. Выдача

| | Урок 008 (5А) | Урок 009 (5Б) |
|---|---|---|
| Название YouTube | `80 САБАКТЫН 8-САБАГЫ \| Аллах — Жалгыз: таухид жана Ыклас сүрөсү` (63 знака) | `80 САБАКТЫН 9-САБАГЫ \| Убакыт жана ийгиликтин төрт ачкычы: Аср сүрөсү` (69 знаков) |
| Релиз | [lesson-008-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-008-final) | [lesson-009-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-009-final) |
| ⬇ MP4 | [lesson-008-final.mp4](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-008-final/lesson-008-final.mp4) | [lesson-009-final.mp4](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-009-final/lesson-009-final.mp4) |
| ⬇ Обложка 1280×720 | [lesson-008-thumbnail.jpg](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-008-final/lesson-008-thumbnail.jpg) | [lesson-009-thumbnail.jpg](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-009-final/lesson-009-thumbnail.jpg) |
| ⬇ Описание / главы / SRT | [описание](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-008-final/lesson-008-youtube-description.txt) · [главы](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-008-final/lesson-008-chapters.txt) · [SRT](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-008-final/lesson-008.ky.srt) | [описание](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-009-final/lesson-009-youtube-description.txt) · [главы](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-009-final/lesson-009-chapters.txt) · [SRT](https://github.com/adiletgpt6-beep/lesson-80/releases/download/lesson-009-final/lesson-009.ky.srt) |
| ▶ Смотреть | [страница-плеер 008](https://claude.ai/artifact/NSyrXTUnz6JBqLYarCMkEe) | [страница-плеер 009](https://claude.ai/artifact/UJxswNWtA2amUiB5AwdacP) |
| Длительность | 00:31:12.07 (вкл. обложку 3 с) | 00:28:23.77 |
| Размер MP4 | 305 874 410 байт | 272 236 578 байт |
| SHA-256 MP4 | `a646d14a045d86ff8e071765af1fae06c4d947553f60f9a3bdadd2040560f79b` | `56726ae9462c1d31a26b949f2c7bf7f9e6525dd299cbbe8f06f4978b4ec02a51` |

SHA-256 MP4 проверены дважды: digest GitHub и `sha256sum` после повторного скачивания релиза в контейнер Claude.

## 2. Проверки итоговых MP4

| Проверка | 008 | 009 |
|---|---|---|
| Формат (ffprobe после скачивания) | 1920×1080, 30 fps, H.264; AAC 48 кГц | то же |
| Длина картинки / звука | 1872.067 / 1872.066 с (1 мс) | 1703.767 / 1703.766 с (1 мс) |
| Громкость | −22,1 dB средн., пик −4,0 dB | −22,2 / −4,0 dB |
| Чёрные кадры ≥0,5 с / тишина ≥8 с / застывшая картинка ≥8 с | 0 / 0 / 0 | 0 / 0 / 0 |
| Аудиосклейки (AUDIO_JOIN_QA_RULES.md, блокирующая) | OK | OK |
| Обложка 0–89 кадров = 3,00 с | ✓ | ✓ |
| Служебные надписи в кадре | нет (16 кадров каждые 2 мин просмотрены) | нет |
| Охват мыслей устаза | 92/92 используемых озвучены, 19 исключены с причиной (`coverage_check.py`) | |
| Синхронизация реплик | каждый клип ≤ своего бита (`check_timeline.py`) | |
| Плеер-страница | 19 частей, переход по главам проверен в Chromium | 18 частей, проверен |

## 3. Произношение (ElevenLabs `eleven_v4`, `ky`, утверждённые голоса проекта)

- Тест до массовой генерации — 46 реплик с терминами (Рубубия, Улухия, «Ла илаха иллаллах», Ахад, Ас-Самад, «Кун фа
  йакун», «Вал-аср», «Раббана атина…»): Scribe v2 распознал арабские формулы дословно (арабским/латинским шрифтом).
- Обратная проверка **всех** клипов: Scribe/OpenAI недоступны (квоты исчерпаны), поэтому Meta MMS-1B-all `kir` локально:
  008 — 265 клипов, среднее 0,950; 009 — 243 клипа, среднее 0,959 (`lessons/R0N/audio/backcheck_mms.json`).
  Все 14 клипов ниже 0,75 — двухголосые детские реплики («Ваалейкум ассалам…»), однословные («Жок!», «Ооба!») и арабские
  формулы (MMS их не знает). Ошибок произношения кыргызских слов не найдено. Носителем языка не прослушано.

## 4. Не выполнено / ограничения

- **Квота ElevenLabs исчерпана** (7 кредитов осталось): финальная сцена 008 собрана из уже озвученных проектом реплик
  (кэш по хешу) — анонс «ысымдарды кийинки сабактарда…» опущен (J36). Для любых правок озвучки нужно пополнение.
- **Cloudflare R2 для готовых MP4**: в окружении только read-only доступ к исходникам; MP4 опубликованы в релизах GitHub,
  как уроки 001–007.
- Религиозное содержание проверено по источникам (SOURCES.md), устаз ещё не видел; спорные места — SOURCES.md §3.
