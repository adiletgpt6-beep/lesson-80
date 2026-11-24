import type { Row } from "../../art/boardTypes";
import { T, I, A } from "../../art/boardTypes";

// Boards of the scenes written new for the VID-002 rework (R01–R03). Short words, arrows and pictograms only;
// Allah, the Prophet (с.а.в.), prophets, angels and faces are never drawn.
const fiveStars = (labels: string[], size = 70): Row => labels.map((l) => I("star", "y", l, size));

export const newBoards: Record<string, Row[]> = {
  // R03 ch00 — Ихсанга жол
  "R03-ch00-s01": [
    [I("heart", "r", "ТАЗА ЖҮРӨК", 120), A(), T("ИХСАН", "g", 60)],
    [T("Аллахты көрүп тургандай…", "b", 36)],
    [T("Бүгүн: беш жылдыз", "k", 34), I("starOutline", "k", undefined, 50)],
  ],
  // R03 ch06 — Аллах үчүн, ыклас менен (lecture 01:53–01:59)
  "R03-ch06-s01": [
    [I("heart", "r", "АЛЛАХТЫ СҮЙӨБҮЗ", 110)],
    [I("person", "b", "адамдар", 70), I("bird", "b", "жаныбарлар", 70), I("flower", "g", "гүлдөр", 70), A("="), T("АЛЛАХТЫН ЖАРАТКАНДАРЫ", "g", 34)],
    [T("ЖАМАНДЫК ЖОК · ЖАКШЫЛЫК БАР", "b", 38)],
    [T("ЫКЛАС", "g", 48), A(), I("handsDua", "g", undefined, 70), T("АЛЛАХ ЖАРДАМ БЕРЕТ", "g", 40)],
  ],
  // R03 ch07 — Кайталайбыз!
  "R03-ch07-s01": [
    [T("КАЙТАЛАЙБЫЗ!", "r", 56)],
    fiveStars(["ЖҮРӨК", "ЫКЛАС", "АМАНАТ", "КУРАН", "ЫЙМАН"], 80),
    [T("ҮЙ ТАПШЫРМАСЫ: Аллах үчүн бир жакшылык", "b", 38)],
    [I("melon", "g", "коондун окуясы → үйгө", 80)],
  ],
};
