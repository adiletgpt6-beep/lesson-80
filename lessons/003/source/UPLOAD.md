# Загрузка исходника урока 003 в main

Оригинал восстановлен и проверен **локально**. В GitHub ожидаются **ровно 10** файлов, перечисленных в [manifest.json](manifest.json). Содержимое файлов — сырые последовательные байты оригинала, **не** отдельные видеофрагменты и **не** MP4-перекодирование.

## Способ А: части уже подготовлены в ChatGPT

1. Скачать все десять `1000218169.mp4.part-000.bin` … `part-009.bin`, прикреплённые как файлы текущего чата.
2. В открытом существующем репозитории `https://github.com/adiletgpt6-beep/lesson-80` перейти в `lessons/003/source/parts/`. Выбрать `Add file → Upload files`, загрузить **все 10 файлов** и коммитить в `main`.
3. Проверить GitHub Actions `Verify lesson 003 source`. Если действия отключены — проверить после клонирования вручную.

## Способ Б: есть исходный MP4 на компьютере

Из корня свежего клона:

```bash
python3 scripts/split_source.py --input "/path/to/1000218169.mp4" --lesson 003
python3 scripts/assemble_source.py --lesson 003 --verify-only
git add lessons/003/source/parts/*.bin
git commit -m "Upload lesson 003 original video as verified binary parts"
git push origin main
```

Скрипт разделения сначала сверит исходник с доверенным размером и SHA-256. Он никогда не исправляет/перекодирует оригинал. Если Git не позволяет push, отправляйте через интерфейс GitHub с тем же путём.

## Проверка клона

```bash
git clone https://github.com/adiletgpt6-beep/lesson-80.git
cd lesson-80
python3 scripts/assemble_source.py --lesson 003 --verify-only
python3 scripts/assemble_source.py --lesson 003
sha256sum lessons/003/source/1000218169.mp4
```

Ожидается: `e042aedccdda21bdd8f8eb927abd74d7c59466160983e08d3b9141350ef60876` при размере 138 938 301 байт.

Если хотя бы одна часть отсутствует или хеш не совпадает, сборщик прервётся. Нельзя передавать Claude Code «готовый источник», пока удалённая проверка не пройдена. **Собранный MP4 исключён из Git через .gitignore**.
