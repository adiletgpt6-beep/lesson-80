# lesson-80

Курс из 80 анимационных уроков для детей 4–12 лет.

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
