# lesson-80

Курс из 80 анимационных уроков для детей 4–12 лет.

## Урок 003: подготовка для Claude Code

**Важно (28.10.2026):** исходник `1000218169.mp4` восстановлен из ChatGPT Library и побайтно проверен **локально**, но 10 бинарных частей **ещё не загружены в GitHub**. Истина о состоянии передачи — в [STATUS.md](lessons/003/STATUS.md). Не обозначайте исходник как доступный после `git clone`, пока все части не опубликованы и не пройдёт проверка в GitHub Actions.

- [Полное задание Claude Code](CLAUDE_CODE_TASK.md)
- [Правила для агента](CLAUDE.md)
- [Описание урока и ограничения](lessons/003/BRIEF.md)
- [Состояние передачи](lessons/003/STATUS.md)
- [Манифест исходника и SHA-256 частей](lessons/003/source/manifest.json)
- [Как загрузить части](lessons/003/source/UPLOAD.md)

После добавления всех десяти частей в `lessons/003/source/parts/`:

```bash
python3 scripts/assemble_source.py --lesson 003 --verify-only
python3 scripts/assemble_source.py --lesson 003
```

Ожидаемый SHA-256 собранного `lessons/003/source/1000218169.mp4`:
`e042aedccdda21bdd8f8eb927abd74d7c59466160983e08d3b9141350ef60876`.

Тема, язык и полная расшифровка записи пока **не установлены**. Нельзя подставлять содержание предыдущих уроков.
