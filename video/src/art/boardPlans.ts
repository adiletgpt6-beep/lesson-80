import type { IconId } from "./icons";

// What the ustaz draws on the board in each scene, as rows of tokens. Derived from script/chapters/*.json `board`.
// A real teacher can repeat every element with a marker: short words, arrows, simple pictograms. No people with
// faces, no depiction of Allah or prophets — stories use symbols (crown, staff, waves).
export type Tok =
  | { t: string; c?: Col; s?: number; u?: boolean }      // text (u = underline)
  | { i: IconId; c?: Col; label?: string; size?: number } // pictogram with optional caption
  | { a: "→" | "↓" | "↔" | "=" | "·" | "+" | "×" }          // connector
  | { sp: number };                                        // horizontal spacer
export type Col = "b" | "g" | "r" | "k" | "y";
export type Row = Tok[];

const T = (t: string, c?: Col, s?: number): Tok => ({ t, c, s });
const I = (i: IconId, c?: Col, label?: string, size?: number): Tok => ({ i, c, label, size });
const A = (a: "→" | "↓" | "↔" | "=" | "·" | "+" | "×" = "→"): Tok => ({ a });

export const boardPlans: Record<string, Row[]> = {
  "ch00-s01": [],
  "ch00-s02": [[T("КАЙДАН?", "b", 72)], [T("ЭМНЕГЕ?", "b", 72)], [T("КАЙДА?", "b", 72)]],
  "ch01-s01": [[T("КАЙДАН?", "g", 64)], [I("mountain", "b"), I("river", "b"), I("bird", "b"), I("deer", "b")], [T("Кимден?  Кантип?", "k", 40)]],
  "ch01-s02": [[T("ЭМНЕГЕ?", "g", 64)], [I("bag", "b", "мектеп сумкасы"), A(), T("максат", "k", 48)]],
  "ch01-s03": [[T("КАЙДА?", "g", 64)], [I("door", "b", "КИРЕТ →"), { sp: 60 }, I("door", "b", "← ЧЫГАТ")], [I("crown", "y", "падышалар да")]],
  "ch01-s04": [[T("«Бол!»", "r", 56), A(), I("star", "y")], [I("starOutline", "b", "5-жылдыз"), T("?", "r", 72)]],
  "ch01-s05": [[T("КАЙДАН?", "g", 56), A("·"), T("ЭМНЕГЕ?", "g", 56), A("·"), T("КАЙДА?", "g", 56)]],
  "ch02-s01": [[I("tree", "g"), I("waves", "b"), I("apple", "r"), I("bird", "b")], [A("↓"), I("person", "k", "адам"), A("↓")], [I("bread", "y", "нан"), I("milk", "b", "сүт"), I("apple", "r", "алма")]],
  "ch02-s02": [[T("Зарият сүрөсү, 56-аят", "k", 40)], [T("ТААНУУ", "g", 40), A("·"), T("ТААНУУ", "g", 52), A("·"), T("ТААНУУ", "g", 66)]],
  "ch02-s03": [[T("Аллах — эч нерсеге муктаж эмес", "b", 44)], [T("Таануу — БИЗГЕ керек", "g", 48)]],
  "ch03-s01": [[I("star", "y", undefined, 110), T("1. ТААНУУ", "g", 64)]],
  "ch03-s02": [],
  "ch03-s03": [],
  "ch03-s04": [[I("mountain", "b"), A(), I("snow", "b", "кар, мөңгү")], [I("drop", "b"), A(), I("river", "b", "булак → дарыя")], [T("жаз · жай · күз", "g", 40)]],
  "ch03-s05": [[I("river", "b"), T("Бишкек · Ош · Жалал-Абад · Нарын · Талас", "k", 32)], [I("house", "b"), I("house", "b"), I("house", "b"), A(), I("city", "b", "шаар")]],
  "ch03-s06": [[I("seed", "y"), A(), I("sprout", "g"), A(), I("tree", "g"), A(), I("flower", "r"), A(), I("apple", "r")], [T("КЕРЕМЕТ = таң калтырган нерсе", "g", 40)], [I("egg", "y"), A(), I("chick", "y")]],
  "ch03-s07": [[I("bookClosed", "b", "китеп")], [T("Аллахты тааныйм → КАЙДАН? ЭМНЕГЕ? — билем", "k", 36)]],
  "ch03-s08": [[I("star", "y", undefined, 110), T("1. ТААНУУ", "g", 60)], [T("жаратылыш · пайгамбарлар · китептер", "k", 38)]],
  "ch04-s01": [[T("Инна лиллахи ва инна илайхи ражиун", "b", 44)], [T("Аллахтыкыбыз", "k", 44), A(), T("Ага КАЙТАБЫЗ", "g", 52, )]],
  "ch04-s02": [[T("КАЙДАН?", "g", 44), A(), T("АЛЛАХТАН", "b", 44)], [T("ЭМНЕГЕ?", "g", 44), A(), T("АЛЛАХТЫ ТААНУУ ҮЧҮН", "b", 44)], [T("КАЙДА?", "g", 44), A(), T("АЛЛАХКА КАЙТАБЫЗ", "b", 44)]],
  "ch04-s03": [[T("ТААНУУ", "g", 52), A(), I("heart", "r", "СҮЙҮҮ", 120)], [I("sun", "y"), I("drop", "b"), I("apple", "r"), I("house", "b")]],
  "ch05-s01": [[I("book", "b", "Муса алейхиссалам жана Фараон")], [I("crown", "y", "Фараон"), T("«өзүн кудай деди»", "k", 36), I("cross", "r")]],
  "ch05-s02": [[T("9 ачык белги", "g", 48)], [I("drop", "r", "суу"), I("locust", "k", "чегиртке"), I("crackedEarth", "y", "кургакчылык")], [T("«Тобо кыл!»", "b", 40), A("·"), T("укпады", "r", 40), I("cross", "r", undefined, 60)]],
  "ch05-s03": [[I("staff", "k", "таяк"), A(), I("snake", "g", "жылан")], [I("rope", "k", "жиптер"), T("«көзгө гана ушинтип көрүндү»", "k", 32)]],
  "ch05-s04": [[T("«Бул сыйкыр эмес!»", "r", 48)], [I("personBow", "k"), I("personBow", "k"), I("personBow", "k")], [T("«Ыйман келтирдик!»", "g", 48)]],
  "ch05-s05": [[I("crown", "y"), I("darkCloud", "k", "ачуу")], [I("heart", "r"), T("ТОБО", "g", 48), A(), T("КЕЧИРИМГЕ ҮМҮТ", "g", 44)], [I("crown", "y"), T("ишенген жок", "r", 36)]],
  "ch05-s06": [[T("Фараон ким?", "k", 44), A(), T("Биз кимбиз?", "b", 44)], [I("thermometer", "r", "ооруганда: биз алсызбыз")], [I("crown", "y"), A(), I("waves", "b", "деңиз")]],
  "ch05-s07": [[I("circle", "g", "бүгүнкү күн", 70), I("circle", "g", "ден соолук", 70), I("circle", "g", "ата-эне", 70), I("circle", "g", "сабак", 70)], [T("Аллах мээримдүү, көп мүмкүнчүлүк берет.", "b", 36)], [T("Текебер болбо!", "r", 44)]],
  "ch06-s01": [[I("star", "y", undefined, 110), T("2. СҮЙҮҮ", "r", 64), I("heart", "r", undefined, 70)]],
  "ch06-s02": [],
  "ch06-s03": [[I("heart", "r", "АЛЛАХКА СҮЙҮҮ", 170)], [I("phone", "k", undefined, 60), I("ball", "k", undefined, 60), I("toy", "k", undefined, 60), I("book", "k", undefined, 60)], [T("Оюнчук — четинде ✓ · Ортосу — Аллахка", "g", 34)]],
  "ch06-s04": [[I("coin", "y"), I("chain", "k", "акчага кул болуу")], [I("coin", "y"), A(), I("hammer", "k", "курал гана")], [T("Чыныгы сүйүүнүн ээси — Аллах", "r", 40)]],
  "ch06-s05": [[I("waves", "b"), I("fish", "b", "бактылуу", 110)]],
  "ch06-s06": [[T("ТААНУУ", "g", 52), A(), T("СҮЙҮҮ", "r", 52)], [I("heart", "r", "АЛЛАХКА", 130)]],
  "ch07-s01": [[I("star", "y", undefined, 110), T("3. КУЛЧУЛУК (ибадат)", "b", 52)], [T("Жиндер + адамдар", "k", 40), A(), T("Аллахка кулчулук үчүн", "g", 40)]],
  "ch07-s02": [[I("rug", "b", "намаз"), I("crescent", "y", "орозо"), I("wallet", "g", "зекет"), I("kaaba", "k", "ажылык")], [I("smile", "g", undefined, 60), I("smile", "g", undefined, 60), I("smile", "g", undefined, 60), I("smile", "g", undefined, 60)]],
  "ch07-s03": [[T("СҮЙСӨҢ", "r", 48), A(), T("ЖЕҢИЛ", "g", 48), I("smile", "g", undefined, 70)], [T("СҮЙБӨСӨҢ", "k", 48), A(), T("ООР", "b", 48), I("frown", "b", undefined, 70)]],
  "ch07-s04": [[I("heart", "r", "Аллахка сүйүү", 150)], [T("ибадат", "b", 44), A(), T("кубаныч", "g", 44)]],
  "ch08-s01": [[I("question", "b", undefined, 110), I("plate", "k", undefined, 110)]],
  "ch08-s02": [[I("seed", "y"), A(), I("tree", "g"), A(), I("flower", "r"), A(), I("apple", "r"), A(), I("plate", "k")]],
  "ch08-s03": [[I("tree", "g", "алмурут"), I("tree", "g", "шабдаалы"), I("tree", "g", "өрүк"), I("tree", "g", "гилас"), I("tree", "g", "алма")]],
  "ch08-s04": [[I("heart", "r"), I("wall", "k", "МЕН-МЕН"), I("star", "y")], [T("ТЕКЕБЕРЛИК = тоскоол", "r", 44)]],
  "ch08-s05": [[T("МЕН-МЕН", "k", 44), A(), T("АЛХАМДУЛИЛЛАХ", "g", 52)], [I("medal", "y", undefined, 90)]],
  "ch08-s06": [[I("star", "y", "1. ТААНУУ", 100), I("star", "y", "2. СҮЙҮҮ", 100), I("star", "y", "3. КУЛЧУЛУК", 100)]],
  "ch09-s01": [[I("star", "y", undefined, 110), T("4. ЖАКШЫЛЫКТА ЖАРЫШ", "g", 50)], [I("flag", "g", "старт"), A(), I("heart", "r"), I("smile", "g"), I("gift", "y"), A(), I("flag", "r", "мара")]],
  "ch09-s02": [[I("earth", "b", undefined, 150), I("house", "g", undefined, 80)], [T("ЖЕР — биздин үй", "g", 48)]],
  "ch09-s03": [[I("sun", "y", undefined, 130)], [T("Бүгүн кандай жакшылык кылам?", "g", 42)]],
  "ch09-s04": [[I("smile", "g", undefined, 130), A("="), T("САДАКА", "r", 64)]],
  "ch09-s05": [[T("ден соолук", "k", 40), I("heart", "r", undefined, 60), A(), T("Аллахтан", "g", 40)], [T("Ырыскы", "k", 40), A(), T("Аллахтан", "g", 40)], [T("Биз: окуйбуз, иштейбиз = СЕБЕП", "b", 40)]],
  "ch10-s01": [[I("star", "y", undefined, 90), T("4. ЖАКШЫЛЫКТА ЖАРЫШУУ", "g", 44)], [I("lamp", "y", undefined, 120), I("ladder", "k", undefined, 120)]],
  "ch10-s02": [[I("horse", "k"), I("camel", "k"), I("donkey", "k"), A(), I("car", "b"), I("train", "b"), I("plane", "b"), I("bus", "b")], [T("Нахл сүрөсү, 8-аят", "k", 36)]],
  "ch10-s03": [[I("wallet", "b", "БУЛ ДҮЙНӨ", 130), { sp: 80 }, I("wallet", "g", "АХИРЕТ", 130)], [I("banknote", "k", "2 000 сом", 110)]],
  "ch10-s04": [[I("wallet", "g", "АХИРЕТ", 110), T("ЭСЕП", "b", 48)], [T("ЫЙМАН", "r", 44), A(), T("ЭСЕП АЧЫЛДЫ", "g", 44), I("check", "g", undefined, 60)], [T("АЛЛАХ ҮЧҮН", "r", 40), A(), T("ЭСЕП", "b", 40)]],
  "ch10-s05": [[I("grain", "y", "бир дан", 80), A(), I("wheat", "y", "жети машак", 100), A(), T("×100 дан", "k", 40)], [T("2 000 × 700 = 1 400 000", "b", 48)], [T("Бакара, 261", "k", 32), A("·"), T("Аллах — Карим (берешен)", "g", 36)]],
  "ch10-s06": [[I("wallet", "b", "БУЛ ДҮЙНӨ", 120), I("wallet", "y", "АХИРЕТ ✦", 140)], [I("star", "y", undefined, 100)]],
  "ch11-s01": [[I("timeline", "k", undefined, 110), T("1000-жыл … 1900-жыл … бүгүн", "k", 36)], [I("lever", "b", undefined, 110), T("акыл ошол эле", "g", 40)]],
  "ch11-s02": [[I("mountain", "b"), I("sheep", "k"), I("river", "b"), I("tree", "g"), { sp: 40 }, I("city", "b"), I("school", "b"), I("computer", "k")], [T("ЭКӨӨ ТЕҢ ҮЙРӨНӨ АЛАТ", "g", 44)]],
  "ch11-s03": [[T("АКЫЛ — БААРЫНА", "g", 52)], [I("person", "k", undefined, 70), I("person", "k", undefined, 70), I("person", "k", undefined, 70), I("person", "k", undefined, 70), I("person", "k", undefined, 70)], [I("scale", "b", undefined, 100)]],
  "ch11-s04": [[T("Аллах эч кимге зулум кылбайт", "b", 44)], [I("teapot", "r", undefined, 120), I("exclaim", "r", undefined, 90)]],
  "ch11-s05": [[T("Аллах — кемчиликсиз", "b", 44)], [T("Ката кетирдиң", "k", 40), A(), T("тобо кыл", "g", 44)], [T("Бакара, 222", "k", 32)]],
  "ch12-s01": [[T("ЖАКШЫЛЫКТА ЖАРЫШУУ = СООПТО ЖАРЫШУУ", "g", 36)], [I("heart", "r", undefined, 90), A(), T("Аллах үчүн", "r", 44)], [T("Хашр, 9", "k", 32)]],
  "ch12-s02": [[I("person", "k"), I("cat", "k"), I("sparrow", "k"), A(), I("heart", "r")]],
  "ch12-s03": [[T("ЖУМШАК • ЖЕҢИЛ • ЖАКЫН", "g", 40)], [T("ЖАРДАМ БЕРЕТ", "g", 44)], [T("(ат-Тирмизи)", "k", 32)]],
  "ch12-s04": [[T("БӨЛҮШ", "g", 44), I("scale", "b", undefined, 100), T("ҮЙ-БҮЛӨ", "r", 44)], [I("star", "y", undefined, 100)]],
  "ch13-s01": [[I("star", "y", undefined, 110), T("5. КЫЙЫНЧЫЛЫК", "b", 56)], [I("staff", "k"), I("waves", "b")]],
  "ch13-s02": [[I("person", "k", "1-бала"), { sp: 120 }, I("person", "k", "2-бала")], [T("«Мен эмне кылдым?»", "b", 36), { sp: 40 }, T("«Бейиш меники!»", "r", 36), I("crown", "y", undefined, 50)]],
  "ch13-s03": [[I("person", "k"), T("200 000 000 000 $", "g", 40)], [I("plane", "k"), I("house", "k"), I("garage", "k")], [T("«Бул меники!»", "r", 40)]],
  "ch13-s04": [[I("person", "k", "миллиардердин баласы"), A(), I("person", "k", "2-бала")], [I("starOutline", "b", undefined, 90), T("?", "r", 72)]],
  "ch14-s01": [[T("Эмне үчүн дароо бейишке эмес?", "b", 40)], [I("mountain", "k"), A(), I("bridge", "y"), A(), I("garden", "g")]],
  "ch14-s02": [[T("«Бул менин максатым! Мен мындан өтөм!»", "g", 36)], [I("oven", "k", undefined, 110), A(), I("bread", "y", undefined, 110)], [I("star", "y", undefined, 90), T("5. КЫЙЫНЧЫЛЫКТАН ӨТҮҮ", "b", 44)]],
  "ch15-s01": [[I("star", "y", undefined, 70), T("1. ТААНУУ — акыйда", "k", 36)], [I("star", "y", undefined, 70), T("2. СҮЙҮҮ — тасаввуф", "k", 36)], [I("star", "y", undefined, 70), T("3. ИБАДАТ — фикх", "k", 36)], [I("star", "y", undefined, 70), T("4. ЖАКШЫЛЫКТА ЖАРЫШУУ — адеп", "k", 36)], [I("star", "y", undefined, 70), T("5. КЫЙЫНЧЫЛЫКТАН ӨТҮҮ", "k", 36)]],
  "ch15-s02": [[I("needle", "k"), A("↔"), I("laptop", "b")], [T("бири-бирибизге керекпиз", "g", 44)]],
  "ch15-s03": [[T("Менин жөндөмүм?", "b", 40)], [T("Эмне үчүн кыйынчылык?", "b", 40)], [T("Кантип тааныйбыз?", "b", 40)]],
  "ch16-s01": [[I("star", "y", undefined, 100), I("star", "y", undefined, 100), I("star", "y", undefined, 100), I("star", "y", undefined, 100), I("star", "y", undefined, 100)], [T("Бул беш максат менен жашасак —", "g", 38)], [T("бекер келбейбиз", "g", 48)]],
};
