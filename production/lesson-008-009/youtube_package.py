#!/usr/bin/env python3
"""YouTube package of lessons 008 / 009 from the frame-accurate timeline (no service text, Kyrgyz only).

    LESSON=R08 python3 production/lesson-008-009/youtube_package.py --out DIR

Writes lesson-00N-youtube-title.txt, lesson-00N-youtube-description.txt (with chapter timecodes),
lesson-00N-chapters.txt and lesson-00N.ky.srt (same caption chunks as the burned-in captions, Caption.tsx).
"""
import argparse
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LESSON_ID = os.environ.get("LESSON", "R08")
SPEAKER = {"ustaz": "Устаз", "bektur": "Бектур", "aizada": "Айзада", "both_children": "Балдар"}
MAX_CHARS = 120  # video/src/components/Caption.tsx

INTRO = {
    "R08": """Аллах — Жалгыз! Бул сабакта балдар таухидди — Аллахтын жалгыздыгын үйрөнүшөт. Устаз доскада таухиддин үч жагын түшүндүрөт: Аллах — жалгыз Жаратуучу, ибадат — бир гана Аллахка, Анын ысымдары жана сыпаттары эч кимге окшобойт.

Анан Ыклас сүрөсүнүн төрт аятын бирден ачабыз: Ахад, Ас-Самад, төрөбөгөн жана төрөлбөгөн, эч ким Ага тең эмес. Билалдын «Ахад! Ахад!» деген бекем ыйманы, Салих пайгамбардын элине таштан чыккан төө, «Бол!» десе — болот деген Аллахтын кудурети, ааламдагы тартип жана жылдыздарга чейинки чоң аралык жөнүндө билебиз.

Бектур менен Айзада суроо берип, жооп издешет. Сен да үйдөн жооп бергин!""",
    "R09": """Убакыт — Аллахтын эң баалуу белектеринин бири. Бул сабакта балдар Аср сүрөсүн үйрөнүшөт: Аллах убакыт менен ант ичип, ар бир адам зыянда экенин, бирок төрт нерсеге ээ болгондор утулбай турганын айтат.

Ийгиликтин төрт ачкычы: ыйман, жакшы амал, акыйкатты бири-бирибизге айтуу жана сабыр. Атанын эң маанилүү осуяты, экзаменге сабыр менен даярдануу, бир дандан өскөн жети машак, Муса пайгамбар жана сыйкырчылар, жүрөктү байлыкка байлабоо жана ыйманга тоскоол болгон үч нерсе — текеберлик, көрө албастык, рия — жөнүндө мисалдар менен сүйлөшөбүз.

Сабактын аягында дуба кылабыз: «Раббана атина фид-дунья хасана, ва фил-ахирати хасана, ва кина азабан-нар».""",
}
OUTRO = "\n\n4–12 жаштагы балдар үчүн исламдык сабак. Фондук музыка жок.\n\n#ислам #балдарүчүн #ыйман #таухид #кыргызча #сабак"


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
