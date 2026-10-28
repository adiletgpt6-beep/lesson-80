# Генераторы глав

`chapters/chNN.json` собираются из этих файлов. Порядок пересборки (из корня репозитория):

```bash
for f in ch00_03 ch04_06 ch07_09 ch10_12 ch13_16; do python3 lessons/003/script/src/$f.py; done
python3 lessons/003/script/src/apply_blockers.py      # блокеры из qa-blockers.md (обязательно после пересборки)
python3 scripts/lesson_script.py validate
python3 scripts/lesson_script.py render                # chapters.ky.md, storyboard.md, durations.md, assets.md
python3 scripts/lesson_script.py timeline              # video/src/timeline.json
```
Проверено: пересборка + блокеры дают байт-в-байт те же JSON, что в репозитории.
