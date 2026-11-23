#!/usr/bin/env python3
"""Generate video/src/art/scenePlan89.ts: which illustrated cutaway plays on which beat of lessons 008/009.

Beats are found by a text fragment (so re-indexing after script edits cannot drift); the key is the same
"<scene>#<beat index>" key that scripts/script_lines.py gives. visual -> `visual` beats, line -> ustaz lines.
    python3 production/lesson-008-009/cutaways.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = {
    "R08": [
        ("line", "Ал жерге эски темирлерди", "junkStorm"),
        ("line", "Анан бир күнү катуу бороон соккон", "junkStorm"),
        ("line", "Бороон басылганда", "junkStorm"),
        ("visual", "Бороон таштандыны аралаштырат", "junkStorm"),
        ("line", "Сен өзүң миллиарддаган клеткалардан", "heartBody"),
        ("line", "Ар бир органың өз милдетин", "heartBody"),
        ("line", "Жүрөгүң сен уктап жатканда да согот", "heartBody"),
        ("line", "Телефонду карагылачы", "phoneApps"),
        ("line", "Бул телефон шамалдан", "phoneApps"),
        ("line", "Жер Күндүн айланасында айланат", "earthSun"),
        ("line", "Ысык да эмес, суук да эмес. Жашоого", "earthSun"),
        ("visual", "Жер Күнгө жакындаса", "earthSun"),
        ("line", "Эгер Жер Күнгө жакыныраак", "earthSun"),
        ("line", "Ушундай так жерде турган Жер", "earthSun"),
        ("line", "Бүгүнкү күндө да ушундай болот", "mountainAsk"),
        ("line", "кээ бирөөлөрдүн баласы болбой калса", "mountainAsk"),
        ("line", "Тоо жардам берип коё тургандай", "mountainAsk"),
        ("line", "Ошол нерсени жүрөктөн эмне кылыш керек", "mountainAsk"),
        ("line", "Илах катары бир гана Аллах бар.", "mountainAsk"),
        ("line", "Тоо да, таш да, дарак да", "mountainAsk"),
        ("line", "Меккедеги мушриктер да", "kaabaNight"),
        ("line", "«Биздин кудайларыбыз Каабанын", "kaabaNight"),
        ("line", "Ошол убакта Каабанын айланасында", "kaabaNight"),
        ("line", "Ыйман келтиргени үчүн аны ысык чөлгө", "desertStone"),
        ("line", "Колдорун, буттарын байлап", "desertStone"),
        ("visual", "Ысык чөл, күн аптап", "desertStone"),
        ("line", "Алар Билалдан", "desertStone"),
        ("line", "Ал эми Билал радыяллаху", "desertStone"),
        ("line", "Ал таш тоо болчу", "camelRock"),
        ("line", "Алар «муну кыла албайт» деп ойлошту", "camelRock"),
        ("line", "Салих алейхиссалам колун жайып", "camelRock"),
        ("line", "Тафсир китептеринде айтылгандай", "camelRock"),
        ("visual", "Таш тоо жарылып", "camelRock"),
        ("line", "Бир кайыкты эки адам", "boatRudders"),
        ("visual", "Кайыкты эки руль", "boatRudders"),
        ("line", "Ар бир жылдыз — өзүнчө бир күн", "lightSpeed"),
        ("line", "Бизге эң жакын жылдызга чейинки", "lightSpeed"),
        ("line", "Жарык бир секундада", "lightSpeed"),
        ("visual", "Жарык нуру жылдыздарды", "lightSpeed"),
        ("line", "Карагыла, бул — Жер.", "worldMap"),
        ("line", "Жер жүзүнүн ар бир чекитинде", "worldMap"),
        ("visual", "Дүйнө картасында чекиттер", "worldMap"),
        ("line", "Аллах бардык пайгамбарлардан убада алган", "worldMap"),
        ("line", "Баары бир ооздон", "worldMap"),
    ],
    "R09": [
        ("line", "Убакыт — өтүп кетүүчү нерсе.", "dayCycle"),
        ("line", "Карагылачы: кечээги жума өттү", "dayCycle"),
        ("visual", "Саат жебелери айланат", "dayCycle"),
        ("line", "Хуср — кыйроо. Мисалы, сел", "sandCastle"),
        ("line", "Же деңиздин жээгинде кумдан сепил", "sandCastle"),
        ("visual", "Кумдан курулган сепилди", "sandCastle"),
        ("line", "Ар бир адамдын күнү да ушинтип", "sandCastle"),
        ("line", "Бүгүн өттү. Сен эч нерсе кылган жоксуң", "sandCastle"),
        ("line", "Мисалы, «машина алам» дейсиң", "familyCar"),
        ("visual", "Үй-бүлө машинада", "familyCar"),
        ("line", "Ошондо машина да сооп алып келет", "familyCar"),
        ("line", "Кантип осуят кылабыз? Мисал айтайын", "grandpaWill"),
        ("line", "Атаң карып, абдан алсырап", "grandpaWill"),
        ("line", "Ошондо сен «ата, кийин»", "grandpaWill"),
        ("line", "Туура. Бүт ишиңди токтотуп", "grandpaChest"),
        ("visual", "Кечки бөлмө: чоң ата", "grandpaChest"),
        ("line", "Ата да эң кыска сөз менен", "grandpaChest"),
        ("line", "Мисалы: «Балам, тиги таштын астына", "grandpaChest"),
        ("line", "Бул баласы үчүн абдан маанилүү", "grandpaChest"),
        ("line", "Мисалы, бир ишти жасап жатасың", "studyNight"),
        ("line", "Бирок ал ишти эртеге бүтүрүшүң керек", "studyNight"),
        ("line", "Сабыр кылып бүтүрүп койсоң", "studyNight"),
        ("line", "Сабагыңды даярдап жатып", "studyNight"),
        ("visual", "Кечки бөлмөдө кыз", "studyNight"),
        ("line", "Эмне болдуң? Ийгиликке жеттиң", "studyNight"),
        ("line", "Канча көп жакшылык кылсаң", "wheatField"),
        ("line", "Бир жакшылыкка Аллах он эсе", "wheatField"),
        ("visual", "Бир дан жерге түшөт", "wheatField"),
        ("line", "Таякты жерге таштаса", "snakeRopes"),
        ("line", "Сыйкырчылар келип «биз да кылабыз»", "snakeRopes"),
        ("line", "Мусанын таягы жыланга айланып", "snakeRopes"),
        ("visual", "Жерде сыйкырчылардын жиптери", "snakeRopes"),
        ("line", "Ал эми Фараон эмне кылды?", "seaCrown"),
        ("line", "Деңизге чөгүп баратып", "seaCrown"),
        ("line", "Бирок ыйман сатылбайт", "scaleHeart"),
        ("visual", "Таразанын бир жагында", "scaleHeart"),
        ("line", "Демек, бүт жер бетиндеги байлыктын", "scaleHeart"),
        ("line", "Францияда токсон жаштагы", "oldHouse"),
        ("line", "Нотариус кемпирге ай сайын", "oldHouse"),
        ("line", "Нотариус «токсонго чыгып калыптыр", "oldHouse"),
        ("visual", "Эски кооз үй", "oldHouse"),
        ("line", "Бирок кемпир дагы жашай берди", "oldHouse"),
        ("line", "Нотариус жетимиш жети жашында", "oldHouse"),
        ("line", "Ал кемпир жүз жыйырма эки", "oldHouse"),
        ("line", "Бир жолу жолдо Англиядан", "taxiRoad"),
        ("line", "Жолдо сылык сурадым", "taxiRoad"),
        ("line", "Мен англис тилин толук билбегендиктен", "taxiRoad"),
        ("line", "Ал бир хадисти угуш үчүн", "horseBag"),
        ("line", "Барса, ал киши качып кеткен", "horseBag"),
        ("visual", "Бир адам куру торбаны", "horseBag"),
        ("line", "Имам Бухари «жаныбарды алдаган", "horseBag"),
    ],
}


def beats(lid):
    meta = json.loads((ROOT / f"lessons/{lid}/script/lesson.json").read_text(encoding="utf-8"))
    for c in meta["chapters"]:
        ch = json.loads((ROOT / f"lessons/{lid}/script/chapters/{c}.json").read_text(encoding="utf-8"))
        for s in ch["scenes"]:
            for i, b in enumerate(s["beats"]):
                yield f"{s['id']}#{i}", b


def main():
    out = {"visual": {}, "line": {}}
    for lid, spec in SPEC.items():
        allb = list(beats(lid))
        for kind, frag, cid in spec:
            hits = [k for k, b in allb if (b["type"] == "visual" and kind == "visual" and frag in b["description"])
                    or (b["type"] == "line" and kind == "line" and b["speaker"] == "ustaz" and frag in b["text"])]
            if len(hits) != 1:
                sys.exit(f"{lid}: '{frag}' matched {hits}")
            out[kind][hits[0]] = cid
    ts = ["// GENERATED by production/lesson-008-009/cutaways.py — do not edit by hand.",
          'import type { CutawayId } from "./scenePlan";', ""]
    ts.append("export const visual89: Record<string, CutawayId> = {")
    ts += [f'  "{k}": "{v}",' for k, v in out["visual"].items()] + ["};", ""]
    ts.append("export const scene89: Record<string, CutawayId> = {};\n")
    ts.append("export const line89: Record<string, CutawayId> = {")
    ts += [f'  "{k}": "{v}",' for k, v in out["line"].items()] + ["};", ""]
    (ROOT / "video/src/art/scenePlan89.ts").write_text("\n".join(ts), encoding="utf-8")
    print(f"scenePlan89.ts: {len(out['visual'])} visual, {len(out['line'])} line cutaways")


if __name__ == "__main__":
    main()
