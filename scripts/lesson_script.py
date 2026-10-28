#!/usr/bin/env python3
"""Tools for the structured lesson script (lessons/003/script/chapters/chNN.json).

    python3 scripts/lesson_script.py validate            # schema + content rules
    python3 scripts/lesson_script.py estimate            # per-scene duration estimate (words / pace)
    python3 scripts/lesson_script.py render              # chapters.ky.md, storyboard.md, durations.md, assets.md
    python3 scripts/lesson_script.py timeline            # video/src/timeline.json for Remotion (estimated or real audio)

Durations are ESTIMATES until real TTS audio exists (scripts/tts_generate.py writes audio/manifest.json).
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSON = ROOT / "lessons/003"
CH_DIR = LESSON / "script/chapters"
FPS = 30
PLANNED_TOTAL = 3600

# Pace calibration: measured on the 40 s ElevenLabs eleven_v4 trial (script/tts-trial/trial-ky-40s.json):
# ustaz 110.6 and 100.2 wpm (mean ~105), child 89.2 wpm. "slow" = children's delivery at speed 0.9.
PACE = {"tts": {"ustaz": 105.0, "child": 90.0}, "slow": {"ustaz": 94.5, "child": 81.0}}
LINE_GAP = 0.6  # silence between consecutive lines, s
SPEAKERS = {"ustaz", "bektur", "aizada", "both_children"}
WORD = re.compile(r"[^\s«»“”\"—–.,!?…:;()]+")
ARABIC_HINTS = re.compile(r"(халак|лияъбуд|инна лиллахи|илайхи|ражиун|раббук|юдоиф|ля илаха|ла илаха|шухха|муфлихун|лакад|кабад|бисмиллах|субхана|рахман|рахим|халифа|фастабику|ассалому|алейкум|салам|алхамдулиллах|машаллах|иншаллах)", re.I)
TIME = re.compile(r"^I\d{2} \d{2}:\d{2}:\d{2}–\d{2}:\d{2}:\d{2}$")


def chapters():
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(CH_DIR.glob("ch*.json"))]


def words(text):
    return len(WORD.findall(text))


def line_seconds(b, pace):
    rate = pace["ustaz"] if b["speaker"] == "ustaz" else pace["child"]
    return words(b["text"]) / rate * 60 + LINE_GAP


def beat_seconds(b, pace):
    return line_seconds(b, pace) if b["type"] == "line" else float(b["seconds"])


def blockers():
    text = (LESSON / "script/qa-blockers.md").read_text(encoding="utf-8")
    return set(re.findall(r"^\| ([A-Z]\d+[a-z]?) \|", text, re.M))


def cmd_validate(_):
    errs, ids = [], set()
    known_blockers = blockers()
    ideas = {r["idea_id"] for r in csv.DictReader(open(LESSON / "analysis/meaning-map-reviewed.csv", encoding="utf-8"))}
    chs = chapters()
    for ch in chs:
        for k in ("id", "title_ky", "planned_seconds", "source_ideas", "scenes"):
            if k not in ch:
                errs.append(f"{ch.get('id')}: missing {k}")
        for i in ch.get("source_ideas", []):
            if i not in ideas:
                errs.append(f"{ch['id']}: unknown idea {i}")
        for s in ch["scenes"]:
            if s["id"] in ids:
                errs.append(f"duplicate scene id {s['id']}")
            ids.add(s["id"])
            for k in ("title_ky", "setting", "camera", "characters", "board", "animation", "beats"):
                if k not in s:
                    errs.append(f"{s['id']}: missing {k}")
            for n, b in enumerate(s["beats"]):
                where = f"{s['id']}#{n}"
                if b["type"] == "line":
                    if b["speaker"] not in SPEAKERS:
                        errs.append(f"{where}: bad speaker {b['speaker']}")
                    if not b["text"].strip():
                        errs.append(f"{where}: empty text")
                    for src in b["source"]:
                        if not TIME.match(src):
                            errs.append(f"{where}: bad source '{src}' (want 'I12 00:01:02–00:03:04')")
                    if not b["source"] and not b["ped"]:
                        errs.append(f"{where}: line without source must be ped=true")
                    if b["blocked"] and b["blocked"] not in known_blockers:
                        errs.append(f"{where}: unknown blocker {b['blocked']}")
                    if re.search(r"[құіәғһ]", b["text"], re.I):
                        errs.append(f"{where}: Kazakh letters in text")
                    if "⟦" in b["text"] or "⟪" in b["text"]:
                        errs.append(f"{where}: editorial brackets in spoken text")
                elif b["type"] in ("pause", "visual"):
                    if not (0 < float(b["seconds"]) <= 30):
                        errs.append(f"{where}: seconds out of range")
                else:
                    errs.append(f"{where}: bad beat type")
    print(f"{len(chs)} chapters, {len(ids)} scenes, {len(errs)} problems")
    for e in errs:
        print("  -", e)
    return 1 if errs else 0


def estimate(chs):
    rows = []
    for ch in chs:
        for s in ch["scenes"]:
            lines = [b for b in s["beats"] if b["type"] == "line"]
            r = {"chapter": ch["id"], "scene": s["id"], "title": s["title_ky"],
                 "lines": len(lines), "words": sum(words(b["text"]) for b in lines),
                 "words_ustaz": sum(words(b["text"]) for b in lines if b["speaker"] == "ustaz"),
                 "words_children": sum(words(b["text"]) for b in lines if b["speaker"] != "ustaz"),
                 "words_ws": sum(len(b["text"].split()) for b in lines),  # whitespace split, for comparison only
                 "pause_visual_s": sum(float(b["seconds"]) for b in s["beats"] if b["type"] != "line"),
                 "pause_s": sum(float(b["seconds"]) for b in s["beats"] if b["type"] == "pause"),
                 "visual_s": sum(float(b["seconds"]) for b in s["beats"] if b["type"] == "visual"),
                 "gaps_s": len(lines) * LINE_GAP,
                 "blocked_lines": sum(1 for b in lines if b["blocked"]),
                 "blocked_words": sum(words(b["text"]) for b in lines if b["blocked"]),
                 "ped_lines": sum(1 for b in lines if b["ped"])}
            for k, pace in PACE.items():
                r[f"est_{k}_s"] = round(sum(beat_seconds(b, pace) for b in s["beats"]), 1)
                r[f"speech_{k}_s"] = round(sum(line_seconds(b, pace) - LINE_GAP for b in lines), 1)
                r[f"blocked_{k}_s"] = round(sum(line_seconds(b, pace) for b in lines if b["blocked"]), 1)
            rows.append(r)
    return rows


def cmd_estimate(_):
    chs = chapters()
    rows = estimate(chs)
    tot = {k: 0.0 for k in ("words", "est_tts_s", "est_slow_s")}
    for ch in chs:
        rr = [r for r in rows if r["chapter"] == ch["id"]]
        w = sum(r["words"] for r in rr)
        a, b = sum(r["est_tts_s"] for r in rr), sum(r["est_slow_s"] for r in rr)
        tot["words"] += w; tot["est_tts_s"] += a; tot["est_slow_s"] += b
        print(f"{ch['id']} plan {ch['planned_seconds']:>4}s  words {w:>4}  est {a:6.0f}–{b:6.0f}s")
    print(f"TOTAL plan {sum(c['planned_seconds'] for c in chs)}s  words {tot['words']:.0f}  est {tot['est_tts_s']:.0f}–{tot['est_slow_s']:.0f}s")


def fmt(sec):
    sec = int(round(sec))
    return f"{sec // 3600:02d}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


NAMES = {"ustaz": "УСТАЗ", "bektur": "БЕКТУР", "aizada": "АЙЗАДА", "both_children": "БАЛДАР"}


def cmd_render(_):
    chs = chapters()
    rows = {r["scene"]: r for r in estimate(chs)}
    out = LESSON / "script"
    # chapters.ky.md - readable full script
    md = ["# 3-сабак (VID-001) — толук сценарий (ДОЛБООР)\n",
          "> Автоматтык түрдө `chapters/chNN.json` файлдарынан түзүлдү (`python3 scripts/lesson_script.py render`). Кол менен оңдобоңуз.  ",
          "> **[ПЕД]** — авторлук педагогикалык кошумча (устаздын сөзү эмес). **⛔ Rx/Bx** — текшерүү күтүп жаткан реплика ([qa-blockers.md](qa-blockers.md)); үнгө жазылбайт.  ",
          "> Булак: `I.. чч:мм:сс–чч:мм:сс` — оригиналдык лекциянын убактысы ([meaning-map-reviewed.csv](../analysis/meaning-map-reviewed.csv)).  ",
          "> Убакыт — **болжолдуу баа** (сөз саны / темп), чыныгы узундук TTS'тен кийин гана белгилүү болот.\n"]
    for ch in chs:
        cr = [rows[s["id"]] for s in ch["scenes"]]
        md.append(f"\n## {ch['id'].upper()} · {ch['title_ky']}\n")
        md.append(f"План: {ch['planned_seconds']} сек · болжол: {sum(r['est_tts_s'] for r in cr):.0f}–{sum(r['est_slow_s'] for r in cr):.0f} сек · "
                  f"сөз: {sum(r['words'] for r in cr)} · булак: {', '.join(ch['source_ideas']) or '—'}\n")
        for s in ch["scenes"]:
            r = rows[s["id"]]
            md.append(f"\n### {s['id']} · {s['title_ky']}  \n*{s['setting']} · {s['camera']} · ≈{r['est_tts_s']:.0f}–{r['est_slow_s']:.0f} сек*\n")
            for b in s["beats"]:
                if b["type"] == "line":
                    tags = []
                    if b["ped"]:
                        tags.append("[ПЕД]")
                    if b["blocked"]:
                        tags.append(f"⛔ {b['blocked']}")
                    src = f" <sub>{'; '.join(b['source'])}</sub>" if b["source"] else ""
                    md.append(f"**{NAMES[b['speaker']]}:** {b['text']} {' '.join(tags)}{src}  ")
                elif b["type"] == "pause":
                    md.append(f"*⏸ тыным {b['seconds']} сек — {b['reason']}*  ")
                else:
                    md.append(f"*🎬 {b['seconds']} сек — {b['description']}*  ")
    (out / "chapters.ky.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    # storyboard.md
    sb = ["# 3-сабак — раскадровка (storyboard)\n",
          "Ар бир сахна: локация, камера, каармандар, доскадагы сүрөттөр жана анимациялар. Булак: `chapters/chNN.json`.\n",
          "| Сахна | Аталышы | Локация / камера | Каармандар | Доска | Анимация жана кыймыл | Болжол, сек |",
          "|---|---|---|---|---|---|---|"]
    for ch in chs:
        for s in ch["scenes"]:
            r = rows[s["id"]]
            esc = lambda xs: "<br>".join(x.replace("|", "/") for x in xs)
            sb.append(f"| {s['id']} | {s['title_ky']} | {s['setting']}<br>*{s['camera']}* | {', '.join(s['characters'])} | "
                      f"{esc(s['board'])} | {esc(s['animation'])} | {r['est_tts_s']:.0f}–{r['est_slow_s']:.0f} |")
    (out / "storyboard.md").write_text("\n".join(sb) + "\n", encoding="utf-8")

    # durations.md
    t_a = t_b = 0.0
    du = ["# 3-сабак — узундуктун болжолдуу баасы\n",
          "**Бул өлчөнгөн узундук эмес.** Формула: сөз саны / темп × 60 + ар бир репликадан кийин 0,6 сек + белгиленген тыным/визуалдык бөлүктөр.",
          f"Темп ElevenLabs eleven_v4 сыноосунан өлчөнгөн (40 сек, `tts-trial/trial-ky-40s.json`): устаз ≈ {PACE['tts']['ustaz']:.0f} сөз/мүн, бала ≈ {PACE['tts']['child']:.0f}. "
          f"«Жай» вариант — балдар үчүн 0,9 ылдамдык (устаз ≈ {PACE['slow']['ustaz']:.0f}, бала ≈ {PACE['slow']['child']:.0f}).",
          f"План: {PLANNED_TOTAL} сек = {PLANNED_TOTAL * FPS} кадр @ {FPS} fps — **максат, ырасталган узундук эмес**.\n",
          "| Глава | Сахна | Реплика | Сөз (устаз / балдар) | Тыным+визуал, сек | Болжол TTS темпи | Болжол жай темп | ⛔ | [ПЕД] |",
          "|---|---|---|---|---|---|---|---|---|"]
    for ch in chs:
        for s in ch["scenes"]:
            r = rows[s["id"]]
            du.append(f"| {ch['id']} | {s['id']} {s['title_ky']} | {r['lines']} | {r['words']} ({r['words_ustaz']} / {r['words_children']}) | "
                      f"{r['pause_visual_s']:.0f} | {fmt(r['est_tts_s'])} | {fmt(r['est_slow_s'])} | {r['blocked_lines']} | {r['ped_lines']} |")
    du.append("\n## Главалар боюнча\n\n| Глава | Аталышы | План | Болжол (TTS – жай) | Айырма (жай темп − план) | Сөз |\n|---|---|---|---|---|---|")
    for ch in chs:
        cr = [rows[s["id"]] for s in ch["scenes"]]
        a, b = sum(r["est_tts_s"] for r in cr), sum(r["est_slow_s"] for r in cr)
        t_a += a; t_b += b
        du.append(f"| {ch['id']} | {ch['title_ky']} | {fmt(ch['planned_seconds'])} | {fmt(a)} – {fmt(b)} | {b - ch['planned_seconds']:+.0f} сек | {sum(r['words'] for r in cr)} |")
    allr = list(rows.values())
    du.append(f"| **Бардыгы** | | **{fmt(sum(c['planned_seconds'] for c in chs))}** | **{fmt(t_a)} – {fmt(t_b)}** | {t_b - PLANNED_TOTAL:+.0f} сек | {sum(r['words'] for r in allr)} |")
    du.append(f"\nРеплика: {sum(r['lines'] for r in allr)} · сөз: {sum(r['words'] for r in allr)} (устаз {sum(r['words_ustaz'] for r in allr)}, балдар {sum(r['words_children'] for r in allr)}) · "
              f"⛔ бөгөттөлгөн реплика: {sum(r['blocked_lines'] for r in allr)} · [ПЕД] реплика: {sum(r['ped_lines'] for r in allr)}")
    du.append(f"\nСөз саноо: бул файлда — тыныш белгилерсиз сөздөр (`WORD` regex): **{sum(r['words'] for r in allr)}**; "
              f"боштук менен бөлүү (ChatGPT аудитиндеги ыкма): **{sum(r['words_ws'] for r in allr)}**. Айырма — «—», «–» сыяктуу өзүнчө турган белгилерде.")

    # components: what the film time is made of
    du.append("\n## Убакыттын курамы (жай темп)\n\n| Глава | Речь | Реплика арасы | Тыным | Сүрөт/анимация | Бардыгы | ⛔ реплика (сөз / сек) | ⛔'сыз болжол |\n|---|---|---|---|---|---|---|---|")
    keys = ("speech_slow_s", "gaps_s", "pause_s", "visual_s", "est_slow_s", "blocked_slow_s")
    tot = dict.fromkeys(keys, 0.0); tb_l = tb_w = 0
    for ch in chs:
        cr = [rows[s["id"]] for s in ch["scenes"]]
        v = {k: sum(r[k] for r in cr) for k in keys}
        bl, bw = sum(r["blocked_lines"] for r in cr), sum(r["blocked_words"] for r in cr)
        for k in keys:
            tot[k] += v[k]
        tb_l += bl; tb_w += bw
        du.append(f"| {ch['id']} | {fmt(v['speech_slow_s'])} | {v['gaps_s']:.0f} сек | {v['pause_s']:.0f} сек | {v['visual_s']:.0f} сек | {fmt(v['est_slow_s'])} | "
                  f"{bl} ({bw} / {v['blocked_slow_s']:.0f} сек) | {fmt(v['est_slow_s'] - v['blocked_slow_s'])} |")
    du.append(f"| **Бардыгы** | **{fmt(tot['speech_slow_s'])}** | {tot['gaps_s']:.0f} сек | {tot['pause_s']:.0f} сек | {tot['visual_s']:.0f} сек | **{fmt(tot['est_slow_s'])}** | "
              f"{tb_l} ({tb_w} / {tot['blocked_slow_s']:.0f} сек) | **{fmt(tot['est_slow_s'] - tot['blocked_slow_s'])}** |")
    du.append("\n⛔'сыз болжол — бөгөттөлгөн реплика азыркы түрүндө алынып салынса калган узундук (алар оңдолуп же алмаштырылып кайтарылышы мүмкүн).")
    (out / "durations.md").write_text("\n".join(du) + "\n", encoding="utf-8")

    # assets.md - drawings and animations list
    asset = ["# 3-сабак — доскадагы сүрөттөр жана анимациялар тизмеси\n",
             "Remotion үчүн өндүрүш тизмеси. Ар бир пункт сахнанын id'си менен.\n", "## Доска\n"]
    for ch in chs:
        for s in ch["scenes"]:
            for x in s["board"]:
                asset.append(f"- `{s['id']}` {x}")
    asset.append("\n## Анимациялар жана кыймылдар\n")
    for ch in chs:
        for s in ch["scenes"]:
            for x in s["animation"]:
                asset.append(f"- `{s['id']}` {x}")
            for b in s["beats"]:
                if b["type"] == "visual":
                    asset.append(f"- `{s['id']}` 🎬 {b['seconds']} сек: {b['description']}")
    (out / "assets.md").write_text("\n".join(asset) + "\n", encoding="utf-8")
    print("rendered chapters.ky.md, storyboard.md, durations.md, assets.md")


def cmd_timeline(_):
    """Frame-accurate timeline for Remotion. Uses real clip durations from audio/manifest.json when present."""
    manifest_path = LESSON / "audio/manifest.json"
    real = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    frame, scenes = 0, []
    for ch in chapters():
        for s in ch["scenes"]:
            beats, start = [], frame
            for i, b in enumerate(s["beats"]):
                key = f"{s['id']}#{i}"
                if b["type"] == "line" and key in real.get("clips", {}):
                    sec, src = real["clips"][key]["seconds"] + LINE_GAP, "audio"
                else:
                    sec, src = beat_seconds(b, PACE["tts"]), "estimate"
                n = max(1, round(sec * FPS))
                beats.append({"key": key, "type": b["type"], "speaker": b.get("speaker"), "text": b.get("text") or b.get("description") or b.get("reason"),
                              "from": frame - start, "frames": n, "timing": src,
                              "audio": real.get("clips", {}).get(key, {}).get("file") if src == "audio" else None})
                frame += n
            scenes.append({"id": s["id"], "chapter": ch["id"], "title": s["title_ky"], "from": start, "frames": frame - start,
                           "board": s["board"], "characters": s["characters"], "beats": beats})
    out = ROOT / "video/src/timeline.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"fps": FPS, "width": 1920, "height": 1080, "durationInFrames": frame,
                               "plannedFrames": PLANNED_TOTAL * FPS, "timing_note": "estimate unless beat.timing == 'audio'",
                               "scenes": scenes}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"timeline: {len(scenes)} scenes, {frame} frames ({fmt(frame / FPS)}); planned {PLANNED_TOTAL * FPS}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["validate", "estimate", "render", "timeline"])
    a = p.parse_args()
    sys.exit({"validate": cmd_validate, "estimate": cmd_estimate, "render": cmd_render, "timeline": cmd_timeline}[a.cmd](a) or 0)


if __name__ == "__main__":
    main()
