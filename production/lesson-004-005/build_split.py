#!/usr/bin/env python3
"""Build lessons R04 (new lesson 004) and R05 (new lesson 005) from the approved one-hour lesson 003.

    python3 production/lesson-004-005/build_split.py

lessons/003 is only READ. Output: lessons/R04, lessons/R05 (script/chapters/*.json, ped-replacements.json,
ped-extra-beats.json, lesson.json, audio/voices.json) and production/lesson-004-005/EDITS.md.

Split (by topic, not by the clock): lesson 003 ch00–ch06 → R04, ch07–ch16 → R05. In the lecture the ustaz closes
the second goal (love of Allah, I22) at 00:20:30 and opens the third with his own recap at 00:20:32–00:20:42 (I23):
«Эми Аллахты тааныдык. Аллахты сүйдүк. Эми эмне кылабыз? … Үчүнчү максат — Аллах Таалага кулчулук кылуу».
In the film this is the end of ch06 «Экинчи жылдыз жанды» at 00:28:04 (59:04 film → ≈30 + ≈33 min).
R04 = the inner goals (knowing and loving Allah), R05 = the goals lived in deeds (worship, racing in good,
passing through hardship). The ustaz's later summary of the first three goals (00:27:46–00:27:58, ch08-s06) stays
inside R05 unchanged. The first candidate seam (after ch08, film 36:13) gave 38:14 + 24:34 min — outside 25–35
without cutting the ustaz's thoughts, so it was rejected.

Every existing beat is copied unchanged unless listed in EDITS (text replaced in place, so beat keys, board plans,
cutaways and approved voice clips stay attached). New chapters: R04 «e04» (closing) and R05 «o05» (opening).
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "lessons/003"
OUT = ROOT / "production/lesson-004-005"

LESSONS = {
    "R04": {
        "id": "R04", "number": 4, "title": "Биз эмне үчүн жаралдык?", "subtitle": "1-бөлүк · Аллахты таануу жана сүйүү",
        "chapters": ["ch00", "ch01", "ch02", "ch03", "ch04", "ch05", "ch06", "e04"],
        "opening_scene": "ch00-s01", "final_scene": "e04-s02", "cover": True,
        "planned_seconds": 1800, "minutes": [25, 35],
        "source_span": "лекция 00:00:00–00:20:30 (I01–I22) + I45 (беш максат); фильм 003 00:00:00–00:28:04",
    },
    "R05": {
        "id": "R05", "number": 5, "title": "Биз эмне үчүн жаралдык?", "subtitle": "2-бөлүк · Кулчулук · Жакшылыкта жарышуу · Кыйынчылыктан өтүү",
        "chapters": ["o05", "ch07", "ch08", "ch09", "ch10", "ch11", "ch12", "ch13", "ch14", "ch15", "ch16"],
        "opening_scene": "o05-s01", "final_scene": "ch16-s01", "cover": True,
        "planned_seconds": 1800, "minutes": [25, 35],
        "source_span": "лекция 00:20:30–01:07:15 (I23–I50); фильм 003 00:28:04–00:59:04",
    },
}

# (lesson, beat key, new text, why). The key is "scene#index" exactly as in scripts/script_lines.py.
# Lines voiced from ped-replacements.json are edited there; others in the chapter JSON.
EDITS = [
    ("R04", "ch00-s02#4",
     "Адамдын бул дүйнөгө келишинин беш негизги максаты бар. Ошол беш максатты эки сабакта үйрөнөбүз.",
     "Бөлүү: 1-сүйлөм — устаздын сөзү (I45), 2-сүйлөм [ПЕД] — беш максат эки сабакка бөлүндү (мурун «Бүгүн ошол беш максатты айтып берем»)."),
    ("R04", "ch00-s02#6",
     "Бүгүн алгачкы эки жылдызды жагабыз, калган үчөөсүн — кийинки сабакта. Даярсыңарбы?",
     "Бөлүү: 4-сабакта эки жылдыз гана жанат (мурун «Сабактын аягында бул беш жылдыздын баары жанат»)."),
    ("R04", "ch01-s04#7",
     "Жакшы суроо, туурабы? Жообун кийинки сабакта, бешинчи жылдызда табабыз.",
     "Бөлүү: «дароо бейишке эмес» суроосунун жообу (ch14) 5-сабакта (мурун «сабактын аягында»)."),
    ("R04", "ch02-s02#6",
     "Кулчулук — бул Аллахты таанып, Аны сүйүп, Ал буйруган жакшы иштерди кылуу. Биз муну беш максатка бөлүп үйрөнөбүз.",
     "Бөлүү: «Бүгүн» алынды — беш максат эки сабакта."),
    ("R04", "ch05-s02#0",
     "Аллах Таала Фараонго Муса алейхиссаламды пайгамбар кылып жиберди. Куранда Аллах ага тогуз ачык белги бергени айтылат.",
     "Почтительная формула: «Муса пайгамбарды … Мусага» → «Муса алейхиссаламды … ага» (17:101 — тогуз белги, маани өзгөргөн жок)."),
    ("R04", "ch05-s03#4",
     "Анан Муса алейхиссалам таягын таштаганда, ал чыныгы жыланга айланды. Бул көз алдоо эмес, чыныгы муъжиза болчу.",
     "Почтительная формула: «Муса» → «Муса алейхиссалам»."),
    ("R04", "ch05-s05#3",
     "Ал эми Фараон текеберлигинен кайтпады, Муса алейхиссаламга ишенбеди.",
     "Почтительная формула: «Мусага» → «Муса алейхиссаламга»."),
    ("R05", "ch09-s04#0",
     "Пайгамбарыбыз, саллаллаху алейхи ва саллам: «Бир тууганыңа жылмайып карашың — садака», — деген. Бул хадисти ат-Тирмизи жеткирген.",
     "Почтительная формула: «саллаллоху» → «саллаллаху» (серия боюнча бирдей жазылыш, R01–R03 менен бирдей). Хадис: ат-Тирмизи 1956."),
    ("R05", "ch12-s03#0",
     "Эми Пайгамбарыбыздын, саллаллаху алейхи ва саллам, бир хадисин угалы.",
     "Почтительная формула: «саллаллоху» → «саллаллаху»."),
    ("R05", "ch14-s01#1",
     "Эсиңерде барбы? Мурунку сабакта бир суроо бергем: Аллах эмне үчүн бизди дароо бейишке киргизбейт?",
     "Бөлүү: суроо 4-сабакта берилген (мурун «Сабактын башында»); 5-сабактын киришүүсүндө да эскертилет."),
]


def L(speaker, text, source=None, ped=True):
    return {"type": "line", "speaker": speaker, "text": text, "source": source or [], "ped": ped, "blocked": None}


def V(sec, desc):
    return {"type": "visual", "seconds": sec, "description": desc}


def P(sec, reason):
    return {"type": "pause", "seconds": sec, "reason": reason}


def scene(sid, title, setting, camera, board, animation, beats):
    return {"id": sid, "title_ky": title, "setting": setting, "camera": camera,
            "characters": ["ustaz", "bektur", "aizada"], "board": board, "animation": animation, "beats": beats}


# Shared recap wording (identical text → one voice clip, reused in both lessons).
RECAP_TAANUU = "Туура. Аллахты Анын жараткан кереметтери аркылуу тааныйбыз: тоолор, дарыялар, урук, алма."
RECAP_SUYUU = "Аллахты тааныган адамдын жүрөгүндө Ага болгон сүйүү жаралат."
RECAP_RETURN = "Аллах бизди жаратты, биз Ага кайтабыз!"
RECAP_MUSA = ("Муса алейхиссалам менен Фараонду да эстейли: Фараон ушунча белгини көрүп туруп, текеберлигинен "
              "ишенген жок. Биз текебер болбойбуз!")
SRC_TAANUU = ["I10 00:05:59–00:07:09", "I26 00:24:12–00:26:30"]
SRC_SUYUU = ["I14 00:09:14–00:09:35"]
SRC_MUSA = ["I19 00:13:02–00:14:35"]

NEW_CHAPTERS = {
    "e04": {
        "id": "e04", "title_ky": "Бүгүнкү сабактын жыйынтыгы", "planned_seconds": 100,
        "source_ideas": ["I01", "I05", "I10", "I13", "I14", "I19", "I21"],
        "scenes": [
            scene("e04-s01", "Эки жылдыз жанды", "класс, доска: эки жанган жылдыз", "доска ири план → жалпы план",
                  ["Эки жанган жылдыз: 1. ТААНУУ · 2. СҮЙҮҮ", "Үч бош жылдыз: 3 · 4 · 5"],
                  ["Устаз эки жанган жылдызды көрсөтөт", "Балдар кезек менен жооп берет"],
                  [
                      L("ustaz", "Балдар, бүгүнкү сабагыбыз аяктап калды. Келгиле, эмнелерди үйрөнгөнүбүздү эстейли."),
                      L("ustaz", "Сабактын башында үч суроо бердик: биз кайдан келдик? Эмнеге келдик? Кайда барабыз?", ["I01 00:02:44–00:03:20"]),
                      L("aizada", RECAP_RETURN, ["I13 00:08:26–00:09:14"]),
                      L("ustaz", "Туура, Айзада. Ал эми «эмнеге келдик?» деген суроого бүгүн эки жооп таптык. Биринчиси эмне эле?"),
                      L("bektur", "Аллахты таануу!"),
                      L("ustaz", RECAP_TAANUU, SRC_TAANUU),
                      L("ustaz", RECAP_MUSA, SRC_MUSA),
                      L("aizada", "Экинчиси — Аллахты сүйүү!"),
                      L("ustaz", RECAP_SUYUU, SRC_SUYUU),
                      L("ustaz", "Жүрөктүн эң жакшы орду — Аллахка болгон сүйүүгө. Акча, оюнчуктар — баары андан кийин.", ["I21 00:17:35–00:19:47"]),
                      V(3, "Эки жылдыз ирети менен кайра жаркырайт"),
                  ]),
            scene("e04-s02", "Кийинки сабакка чейин", "класс, доска: үч бош жылдыз жана суроо", "орто план → жалпы план",
                  ["Үч бош жылдыз: 3 ? · 4 ? · 5 ?", "«Эмне үчүн дароо бейишке эмес?»"],
                  ["Устаз бош жылдыздардын жанына суроо белгисин тартат", "Балдар кол булгалап коштошот"],
                  [
                      L("ustaz", "Доскада дагы үч жылдыз жана бир суроо калды. Эсиңерде барбы: Аллах эмне үчүн бизди дароо бейишке киргизбейт?", ["I05 00:01:48–00:02:44"]),
                      L("bektur", "Анын жообун кийинки сабакта билебизби, устаз?"),
                      L("ustaz", "Ооба, Бектур. Кийинки сабакта калган үч жылдызды жагабыз, ошол суроонун жообун да табабыз."),
                      L("ustaz", "Үй тапшырма: бүгүн Аллахтын бир кереметин байкап, үйдөгүлөргө айтып бергиле. Тамак жегенде «Алхамдулиллах» дегенди унутпагыла!"),
                      L("aizada", "Макул, устаз!"),
                      L("ustaz", "Көңүл бурганыңар үчүн Аллах ыраазы болсун!", ["I46 00:55:19–00:55:23"], ped=False),
                      L("both_children", "Рахмат, устаз! Көрүшкөнчө!"),
                      V(3, "Балдар кол булгалайт; эки жылдыз жаркырап, үч бош жылдыз кийинки сабакты күтөт"),
                  ]),
        ],
    },
    "o05": {
        "id": "o05", "title_ky": "Мурунку сабакты эстейбиз", "planned_seconds": 110,
        "source_ideas": ["I01", "I05", "I10", "I13", "I14", "I19", "I45"],
        "scenes": [
            scene("o05-s01", "Кайра класста", "жарык класс, чоң ак доска, терезе", "жалпы план → орто план",
                  ["Доска таза"],
                  ["Камера класстын эшигинен кирет", "Устаз балдарга жылмаят", "Бектур менен Айзада кол булгалайт"],
                  [
                      V(4, "Класстын жалпы көрүнүшү, терезеден күн нуру; музыка жок"),
                      L("ustaz", "Ассалому алейкум, балдар!"),
                      L("both_children", "Ваалейкум ассалам, устаз!"),
                      L("ustaz", "Кайра жолукканыбызга кубанычтамын! Бүгүн мурунку сабагыбызды улантабыз."),
                      L("bektur", "Салам, достор!"),
                      L("aizada", "Биз суроо берип, жооп издейбиз!"),
                  ]),
            scene("o05-s02", "Үч суроо жана эки жылдыз", "доска", "доска ири план",
                  ["КАЙДАН? · ЭМНЕГЕ? · КАЙДА?", "Эки жанган жылдыз: 1. ТААНУУ · 2. СҮЙҮҮ"],
                  ["Устаз үч суроону кайра жазат", "Эки жылдыз бирден жанат"],
                  [
                      L("ustaz", "Мурунку сабакта доскага үч суроо жазганбыз: биз кайдан келдик? Эмнеге келдик? Кайда барабыз?", ["I01 00:02:44–00:03:20"]),
                      L("aizada", RECAP_RETURN, ["I13 00:08:26–00:09:14"]),
                      L("ustaz", "Ооба. Ал эми «эмнеге келдик?» деген суроонун жообу — беш максат, беш жылдыз. Алгачкы экөөнү эстейличи.", ["I45 00:54:45–00:55:15"]),
                      L("bektur", "Аллахты таануу!"),
                      L("ustaz", RECAP_TAANUU, SRC_TAANUU),
                      L("ustaz", RECAP_MUSA, SRC_MUSA),
                      L("aizada", "Экинчиси — Аллахты сүйүү!"),
                      L("ustaz", RECAP_SUYUU, SRC_SUYUU),
                      V(3, "Эки жылдыз ирети менен жаркырайт"),
                  ]),
            scene("o05-s03", "Бүгүн — үч жылдыз", "доска: үч бош жылдыз жана суроо", "доска ири план → орто план",
                  ["Үч бош жылдыз: 3 ? · 4 ? · 5 ?", "«Эмне үчүн дароо бейишке эмес?»"],
                  ["Устаз үч бош жылдызды көрсөтөт", "Суроо белгиси термелет"],
                  [
                      L("ustaz", "Бүгүн калган үч жылдызды жагабыз. Анан мурунку сабакта берген бир суроонун жообун табабыз: Аллах эмне үчүн бизди дароо бейишке киргизбейт?", ["I05 00:01:48–00:02:44"]),
                      L("bektur", "Мен ал суроону унутпай жүрдүм!"),
                      L("ustaz", "Силер да, экрандын алдындагы балдар, биз менен кошо ойлонгула. Суроо берсем, үйдөн жооп бергиле, макулбу?"),
                      L("ustaz", "Анда «Бисмиллахир рахманир рахим» деп баштайлы."),
                      P(2, "тынч башталыш"),
                  ]),
        ],
    },
}


def load(p):
    return json.loads(p.read_text(encoding="utf-8"))


def dump(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def line_index(scene_beats, idx):
    """Beat index in the chapter JSON for key index `idx` (keys count only non-extra beats = JSON order)."""
    return idx


def main():
    repl_all = load(SRC / "script/ped-replacements.json")
    extra_all = load(SRC / "script/ped-extra-beats.json")
    report = ["# Уроки 004/005 — реестр правок относительно урока 003", "",
              "Сгенерировано `production/lesson-004-005/build_split.py`. Всё, что здесь не указано, скопировано из "
              "`lessons/003` без изменений (текст, источники, пометки [ПЕД], блокеры, замены).", "",
              "| Урок | Ключ | Было | Стало | Причина |", "|---|---|---|---|---|"]
    for lid, meta in LESSONS.items():
        dst = ROOT / "lessons" / lid
        if dst.exists():
            shutil.rmtree(dst / "script", ignore_errors=True)
        chapters = {}
        for cid in meta["chapters"]:
            chapters[cid] = NEW_CHAPTERS[cid] if cid in NEW_CHAPTERS else load(SRC / f"script/chapters/{cid}.json")
        repl = json.loads(json.dumps(repl_all))
        scene_ids = {s["id"] for c in chapters.values() for s in c["scenes"]}
        repl["replacements"] = {k: v for k, v in repl["replacements"].items() if k.split("#")[0] in scene_ids}
        extra = json.loads(json.dumps(extra_all))
        extra["extra"] = {k: v for k, v in extra["extra"].items() if k in scene_ids}
        for l2, key, new, why in EDITS:
            if l2 != lid:
                continue
            sid, idx = key.split("#")
            idx = int(idx)
            if key in repl["replacements"]:
                old = repl["replacements"][key]["text"]
                repl["replacements"][key] = {**repl["replacements"][key], "text": new,
                                             "basis": repl["replacements"][key].get("basis", "") + f" | {lid}: {why}"}
            else:
                ch = chapters[sid.split("-")[0]]
                sc = next(s for s in ch["scenes"] if s["id"] == sid)
                b = sc["beats"][line_index(sc["beats"], idx)]
                assert b["type"] == "line" and not b["blocked"], key
                old = b["text"]
                b["text"] = new
                b["edited"] = {"lesson": lid, "was": old, "why": why}
            report.append(f"| {lid} | `{key}` | {old} | {new} | {why} |")
        for cid, ch in chapters.items():
            dump(dst / f"script/chapters/{cid}.json", ch)
        dump(dst / "script/ped-replacements.json", repl)
        dump(dst / "script/ped-extra-beats.json", extra)
        dump(dst / "script/lesson.json", meta)
        (dst / "audio").mkdir(parents=True, exist_ok=True)
        shutil.copy(SRC / "audio/voices.json", dst / "audio/voices.json")
    report += ["", "## Новые главы", ""]
    for cid, ch in NEW_CHAPTERS.items():
        lid = "R04" if cid == "e04" else "R05"
        report.append(f"### {lid} · {cid} · {ch['title_ky']}\n")
        for s in ch["scenes"]:
            report.append(f"**{s['id']} · {s['title_ky']}**  ")
            for b in s["beats"]:
                if b["type"] == "line":
                    tag = " [ПЕД]" if b["ped"] else ""
                    src = f" <sub>{'; '.join(b['source'])}</sub>" if b["source"] else ""
                    report.append(f"- {b['speaker']}: {b['text']}{tag}{src}")
            report.append("")
    (OUT / "EDITS.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("built R04, R05; edits:", sum(1 for e in EDITS), "; report:", OUT / "EDITS.md")


if __name__ == "__main__":
    main()
