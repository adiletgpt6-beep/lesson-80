# lesson-80

Курс из 80 анимационных уроков для детей 4–12 лет.

## Уроки 008 и 009 — Studio VID-004 (Issue #10)

Пятый урок устаза (запись 2:15:38) → два самостоятельных урока: **008 «Аллах — Жалгыз: таухид жана Ыклас сүрөсү»** (31:12) и
**009 «Убакыт жана ийгиликтин төрт ачкычы: Аср сүрөсү»** (28:24). Статус — [lessons/VID-004/STATUS.md](lessons/VID-004/STATUS.md),
производство — [production/lesson-008-009/HANDOFF.md](production/lesson-008-009/HANDOFF.md), отчёт — [production/lesson-008-009/REPORT.md](production/lesson-008-009/REPORT.md).

## Реестр уроков курса (main, 2026-11-24)

Все PR #2, #4, #5, #6, #7, #9, #11, #12 слиты в main; ветки других чатов сохранены. Готовые файлы — в релизах GitHub.

| Урок | Тема | Studio / исходник | Длит. | Релиз | Производство |
|---|---|---|---|---|---|
| 001 | Ислам — беш түркүктүү үй | VID-002 (Issue #3) | 33:47 | [lesson-001-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-001-final) | `lessons/R01`, `production/vid-002*` |
| 002 | Ак кийимчен мейман: Ислам, Ыйман, Ихсан | VID-002 | 31:13 | [lesson-002-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-002-final) | `lessons/R02` |
| 003 | Таза жүрөк — ыймандын даамы | VID-002 | 26:54 | [lesson-003-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-003-final) | `lessons/R03` |
| 004 | Эмне үчүн жаралдык? Аллахты таануу жана сүйүү | VID-001 (Issue #1) | 30:07 | [lesson-004-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-004-final) | `lessons/R04`, `production/lesson-004-005` |
| 005 | Эмне үчүн жаралдык? Кулчулук, жакшылык, сабыр | VID-001 | 32:45 | [lesson-005-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-005-final) | `lessons/R05` |
| 006 | Ыйман жана анын алты шарты | VID-003 (Issue #8) | 29:10 | [lesson-006-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-006-final) | `lessons/R06`, `production/lesson-006-007` |
| 007 | Жан дүйнө кантип өсөт? Ыймандын 11 тепкичи | VID-003 | 28:35 | [lesson-007-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-007-final) | `lessons/R07` |
| 008 | Аллах — Жалгыз: таухид жана Ыклас сүрөсү | VID-004 (Issue #10) | 31:12 | [lesson-008-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-008-final) | `lessons/R08`, `production/lesson-008-009` |
| 009 | Убакыт жана ийгиликтин төрт ачкычы: Аср сүрөсү | VID-004 | 28:24 | [lesson-009-final](https://github.com/adiletgpt6-beep/lesson-80/releases/tag/lesson-009-final) | `lessons/R09` |

Темы обложек — `shared/lesson-cover/lessons/001–009.json` (один шаблон для всех 80 уроков).
**О «003»:** опубликованный урок 003 — «Таза жүрөк» из VID-002 (`lessons/R03`). Папка `lessons/003` — внутренний
производственный проект старого часового урока VID-001, разделённого на 004–005; его озвучка переиспользуется R04/R05 по
хешу, поэтому папка сохраняется. Следующий исходник Studio → уроки **010+**.

## Уроки 006 и 007 — Studio VID-003 (Issue #8)

Четвёртый урок устаза (запись 2:03:21) → два самостоятельных урока: **006 «Ыйман жана анын алты шарты»** (29:10) и
**007 «Жан дүйнө кантип өсөт? Ыймандын 11 тепкичи»** (28:35). Статус — [lessons/VID-003/STATUS.md](lessons/VID-003/STATUS.md),
производство — [production/lesson-006-007/HANDOFF.md](production/lesson-006-007/HANDOFF.md).

## Урок 003 — Studio VID-001

**Состояние на 28.10.2026:** пользователь загрузил видео через BalaGo Video Studio, создана [карточка VID-001 (Issue #1)](https://github.com/adiletgpt6-beep/lesson-80/issues/1) в **нужном репозитории**. Студия сообщает о сохранении исходного MP4 в **приватном Cloudflare R2**. **Независимая загрузка из R2 и сравнение SHA-256 пока не выполнялись.** Десять бинарных частей в GitHub не загружены; теперь они только резервный вариант.

Цель новой 2D-анимации — **ровно 60 минут (01:00:00)**, при сохранении существенных мыслей устаза из полной записи (исходник ~67 минут).

- [Полное задание Claude Code](CLAUDE_CODE_TASK.md)
- [Правила для агента](CLAUDE.md)
- [Описание урока и ограничения](lessons/003/BRIEF.md)
- [Текущий статус](lessons/003/STATUS.md)
- [Карточка загрузки Studio VID-001](https://github.com/adiletgpt6-beep/lesson-80/issues/1)
- [Манифест исходника и SHA-256](lessons/003/source/manifest.json)
- [Резервная инструкция по бинарным частям](lessons/003/source/UPLOAD.md)

### Временная ссылка на один объект (не нужны ключи в Claude Code)

Пользователь может дать Claude Code краткоживущую подписанную GET-ссылку на VID-001, созданную локально с read-only R2-учётными данными. Такая ссылка действует ограниченное время. Claude Code скачивает MP4 напрямую по HTTPS и **обязательно** сверяет 138938301 байт и SHA-256 из манифеста, не публикуя саму ссылку в GitHub или логах. URL ещё не предоставлен и не проверен.

### Основной путь: загрузить из Cloudflare R2

В окружении Claude Code должны быть доступны **read-only** секреты `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID` (или `R2_ENDPOINT_URL`). Не записывать их в репозиторий и комментарии. Object key хранится в манифесте, копировать видео в обычный Git не нужно.

```bash
python3 -m pip install boto3
python3 scripts/download_source_r2.py
python3 scripts/download_source_r2.py --verify-only
```

Ожидаемое значение SHA-256 для `lessons/003/source/1000218169.mp4`:
`e042aedccdda21bdd8f8eb927abd74d7c59466160983e08d3b9141350ef60876`.
Размер: `138938301` байт. Если нет доступа к секретам или хеш не совпадает — не начинать расшифровку.

### Запасной путь: части в GitHub

Если R2 недоступен и десять частей действительно загружены в `lessons/003/source/parts/`, можно восстановить побайтно:

```bash
python3 scripts/assemble_source.py --lesson 003 --verify-only
python3 scripts/assemble_source.py --lesson 003
```

Тема, язык и полная расшифровка записи пока **не установлены**. Нельзя подставлять содержание предыдущих уроков.
