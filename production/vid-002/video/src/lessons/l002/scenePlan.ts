import type { CutawayId } from "../../art/cutawayIds";

// Lesson 002 director's plan. Keys are timeline beat keys "chNN-sNN#index" (see timeline.json).
// The guest is never drawn (a doorway of light only); Allah, the Prophet (с.а.в.), companions, prophets and angels
// are never shown. Quran quotations are never illustrated with people; star-lighting beats stay on the board.
// About one illustration every 2–3 minutes; no two illustrated beats are adjacent (each fades in and out).

// `visual` beats that describe something outside the classroom.
export const visualCutaways: Record<string, CutawayId> = {
  "ch02-s01#5": "desertMosque",  // таңкы тынч шаар, курма пальмалары, мечиттин сырты (адамдар жок)
};

// Whole scenes told over an illustration: none — every scene of lesson 002 keeps the board in view.
export const sceneCutaways: Record<string, CutawayId> = {};

// Ustaz lines whose words are about something we can show (illustration under the voice and captions).
export const lineCutaways: Record<string, CutawayId> = {
  "ch00-s02#5": "pillarHouse",   // 1-сабакты эстөө: үй беш түркүктүн үстүндө бекем турат
  "ch00-s03#2": "guestLight",    // сырдуу мейман: анын кийими аппак экен
  "ch01-s01#7": "nature",        // тоодогу булактан таза суу агып келет — үч булак
  "ch01-s05#0": "desertMosque",  // чөлдөгү курма пальмалары, таңкы жарык (сценарийдеги иллюстрация)
  "ch02-s02#0": "guestLight",    // «Ошол жерге бир киши келди. Кийими аппак…» — келиши, жарык гана
  "ch03-s01#5": "pillarHouse",   // «Бул — беш түркүктүү үй»
  "ch03-s02#8": "pilgrimsWhite", // ажылык — Меккеге барып ибадат кылуу
  "ch04-s02#4": "nature",        // Аллахтын жараткандарын көрүп, Ал бар экенин билебиз (Аллах тартылбайт)
  "ch04-s05#1": "space",         // пайгамбарлар — сценарийде түнкү асман, жылдыздар (адам жок)
  "ch04-s06#4": "shareApples",   // иниңе оюнчугуңду берсең… — кичинекей жакшылыктар
  "ch04-s07#5": "window",        // жамгырдан кийин — жаман деп ойлогондон жакшылык чыгат
  "ch05-s02#3": "winterSpring",  // кышта өсүмдүктөр өлгөндөй, жазда кайра көгөрөт (кайра тирилүү)
  "ch05-s05#12": "winterSpring", // кыштан кийин жаз келгендей, Аллах бизди кайра тирилтет
  "ch06-s02#4": "homeworkDesk",  // ихсан: мугалим бар болсо да, жок болсо да бирдей жакшы
  "ch06-s04#6": "neighbor",      // бир жакшы ишти эч кимге көрсөтпөй кылып көргүлө
  "ch07-s03#1": "race",          // «Мен баарынан тез чуркайм…» — кибрдин мисалы
  "ch07-s05#1": "desertMosque",  // бир бала мечитке барып, жалгыз тынч дуба кылды — ыклас
  "ch08-s02#1": "guestLight",    // мейман суроолорун берип, кетип калды — кетиши, жарык гана
  "ch09-s02#10": "shareApples",  // сурап аласың, «рахмат» айтып кайтарып бересиң
  "ch09-s03#1": "antsGalaxy",    // кичинекей кумурсканын жашоосун да Аллах билип турат
  "ch09-s03#4": "growth",        // жердин астындагы кичинекей урук — Аллах аны да билет
  "ch11-s01#4": "melonField",    // отуз жыл коон өстүргөн киши
  "ch11-s02#8": "fireGarden",    // от ысыгын жоготту (Ибрахим тартылбайт — жалын → салкын бак)
  "ch11-s03#3": "space",         // ааламды Аллах Өз буйругу менен жаратты: «Бол!»
  "ch11-s04#12": "nature",       // дарыялар, деңиздер — алар да сага кызмат кылат
  "ch12-s02#5": "brightPath",    // үч жылдыз бир жолду жарык кылат — Аллахтын ыраазылыгына жол
};
