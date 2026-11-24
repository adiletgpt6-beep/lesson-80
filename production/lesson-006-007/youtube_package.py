#!/usr/bin/env python3
"""YouTube package of lessons 006 / 007 from the frame-accurate timeline (no service text, Kyrgyz only).

    LESSON=R06 python3 production/lesson-006-007/youtube_package.py --out DIR

Writes lesson-00N-youtube-title.txt, lesson-00N-youtube-description.txt (with chapter timecodes),
lesson-00N-chapters.txt and lesson-00N.ky.srt (same caption chunks as the burned-in captions, Caption.tsx).
"""
import argparse
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LESSON_ID = os.environ.get("LESSON", "R06")
SPEAKER = {"ustaz": "Устаз", "bektur": "Бектур", "aizada": "Айзада", "both_children": "Балдар"}
MAX_CHARS = 120  # video/src/components/Caption.tsx

INTRO = {
    "R06": """Бул сабакта балдар ыймандын алты шартын үйрөнүшөт: Аллахка, периштелерге, китептерге, пайгамбарларга, тагдырга жана акыретке ишенүү. Устаз доскада «ыймандын үйүн» алты тиреги менен курат, Бектур менен Айзада суроо берип, жооп издешет.

Сабакта:
• Ыйман деген эмне? Таухид — Аллах Бир, Ага окшош эч нерсе жок
• Периштелер нурдан жаратылган; көрбөсөк да, гайыпка ишенебиз
• Төрт ыйык китеп жана «эки китеп»: жаратылыш китеби жана Куран
• Пайгамбарлар: Ибрахим, Айюб, Закария, Юнус (алейхимуссалам) окуяларындагы сабактар; Меккедеги кечирим жана Таиф окуясы
• Тагдыр: бул дүйнө — сыноо, биз жакшылыкты тандайбыз
• Акырет: токтобой турган үч жакшылык, барзак, махшар, бирөөнүн акысы

Куран аяттары: Ыклас 1; Хадид 3; Шура 11; Бакара 3, 32, 97, 185, 285; Рахман 15; Хижр 9; Анбия 33; Ахзаб 40; Юсуф 111; Ниса 79; Ибрахим 34; Раад 11; Зилзала 7–8; Инфитар 10–12.
Хадистер: Муслим (периштелер нурдан; адам өлгөндөн кийинки үч жакшылык; акы), Бухари (акыркы пайгамбар бардык адамдарга), Бухари жана Муслим (Таиф окуясы).""",
    "R07": """Бул сабакта балдар жан дүйнөнүн кантип өсөөрүн үйрөнүшөт. Устаз доскага он бир тепкичтүү шаты тартат: илим, ойлонуу, таануу, кабыл алуу, ыйман, сүйүү, амал, адеп, ыклас, ихсан жана хикмат. Бектур менен Айзада ар бир тепкичти мисалдар менен түшүнүшөт.

Сабакта:
• Захир жана батын илим — эки илим тең керек (куштун эки канаты)
• Тафаккур: Аллахтын жаратканы жөнүндө ойлонуу
• Ыйман — батарейка сыяктуу: илим, намаз, зикир жана Куран менен кубаттайбыз
• Сүйгөн адамга амал жеңил; Пайгамбарыбыздын адеби; ыклас жана ихсан
• Талашпайбыз, биримдикте болобуз; таза жүрөк жана канаат

Куран аяттары: Алак 1; Таха 114; Али Имран 7, 103, 190–191; Маида 54; Калам 4; Хижр 39–40; Бакара 269; Лукман 12–17; Анфал 2; Аала 14–15.
Хадистер: Бухари жана Муслим (ихсан — Жабраил хадиси; жашыруун садака), Муслим (текеберлик; өзүңөрдөн төмөнкүлөргө карагыла), Ахмад (жакшы мүнөздү толуктоо), Тирмизи (кичүүлөргө мээрим, улууларга урмат), Бухари (чыныгы байлык).""",
}
OUTRO = "\n\n4–12 жаштагы балдар үчүн исламдык сабак. Фондук музыка жок.\n\n#ислам #балдарүчүн #ыйман #кыргызча #сабак"


def tc(sec, srt=False):
    ms = round(sec * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}" if srt else (f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}")


def chunks(text):
    """Same splitting as video/src/components/Caption.tsx."""
    if len(text) <= MAX_CHARS:
        return [text]
    parts = [p for p in re.split(r"(?<=[.!?…:;])\s+|(?<=,)\s+(?=[^,]{30,})", text) if p]
    out, cur = [], ""
    for p in parts:
        if len((cur + " " + p).strip()) > MAX_CHARS and cur:
            out.append(cur.strip())
            cur = p
        else:
            cur = (cur + " " + p).strip()
    if cur:
        out.append(cur.strip())
    return out or [text]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=".")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    t = json.loads((ROOT / f"video/src/timeline-{LESSON_ID}.json").read_text(encoding="utf-8"))
    meta = json.loads((ROOT / f"lessons/{LESSON_ID}/script/lesson.json").read_text(encoding="utf-8"))
    n = f"{meta['number']:03d}"
    fps = t["fps"]

    chapters = []
    for i, c in enumerate(t["chapters"]):
        start = 0 if i == 0 else c["from"] / fps
        chapters.append(f"{tc(start)} {'Ачылыш' if i == 0 else c['title']}")
    (out / f"lesson-{n}-chapters.txt").write_text("\n".join(chapters) + "\n", encoding="utf-8")

    title = meta["youtube_title"]
    assert len(title) <= 100, title
    (out / f"lesson-{n}-youtube-title.txt").write_text(title + "\n", encoding="utf-8")
    desc = INTRO[LESSON_ID] + "\n\nБөлүмдөр:\n" + "\n".join(chapters) + OUTRO
    assert len(desc) <= 5000
    (out / f"lesson-{n}-youtube-description.txt").write_text(desc + "\n", encoding="utf-8")

    srt, k = [], 0
    for sc in t["scenes"]:
        for b in sc["beats"]:
            if b["type"] != "line":
                continue
            start = (sc["from"] + b["from"]) / fps
            speech = max(1, b["frames"] - 18) / fps  # trailing gap has no speech (Caption.tsx)
            parts = chunks(b["text"])
            total = sum(len(p) for p in parts)
            acc = 0
            for p in parts:
                s0 = start + acc / total * speech
                acc += len(p)
                s1 = start + acc / total * speech
                k += 1
                srt.append(f"{k}\n{tc(s0, True)} --> {tc(s1, True)}\n{SPEAKER[b['speaker']]}: {p}\n")
    (out / f"lesson-{n}.ky.srt").write_text("\n".join(srt), encoding="utf-8")
    print(f"{LESSON_ID}: title {len(title)} chars, description {len(desc)} chars, {len(chapters)} chapters, {k} subtitles, "
          f"duration {tc(t['durationInFrames'] / fps)}")


if __name__ == "__main__":
    main()
