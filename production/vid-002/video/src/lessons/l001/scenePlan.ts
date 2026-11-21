import type { CutawayId } from "../../art/cutawayIds";

// Lesson 001 director's plan. Keys are timeline beat keys "chNN-sNN#index" (see timeline.json).
// Illustrations never show Allah, the Prophet (с.а.в.), prophets or angels; Quran quotations are not illustrated.

// `visual` beats that describe something outside the classroom (star-lighting beats stay on the board).
export const visualCutaways: Record<string, CutawayId> = {
  "ch05-s02#5": "shareApples",   // кырк алмадан бири себетке — бөлүшүү
  "ch06-s04#3": "winterSpring",  // Рамазан жыл бою айланат: кыш → жаз → жай → күз
  "ch07-s02#4": "pilgrimsWhite", // ар түстүү силуэттер ак кийимде, Кааба айланасында
  "ch07-s05#8": "growth",        // үрөн → чырпык → гүл (аракет бизден, натыйжа Аллахтан)
  "ch07-s06#0": "antsGalaxy",    // түнкү асман, галактикалар; кумурскалар дан сүйрөйт
  "ch08-s03#10": "guestLight",   // эшик ачылып, жылуу жарык чыгат (адам тартылбайт)
  "ch09-s02#12": "brightPath",   // беш жылдыздан бейиштин багына чейин жаркыраган жол
};

// Whole scenes told over an illustration: none — every scene of lesson 001 is set in the classroom.
export const sceneCutaways: Record<string, CutawayId> = {};

// Ustaz lines whose words are about something we can show (illustration under the voice and captions).
export const lineCutaways: Record<string, CutawayId> = {
  "ch00-s02#9": "pillarHouse",   // «Бул — Ислам үйү»
  "ch01-s05#1": "nature",        // жакшы нерсени көрсө, жүрөгү оңолот
  "ch02-s01#7": "pillarHouse",   // беш нерсе — Исламдын эң негизги түркүктөрү
  "ch03-s04#1": "space",         // бардык кудуреттин ээси — Аллах (жаратылыш, Аллах тартылбайт)
  "ch03-s05#4": "race",          // спортчулар өзүнө ишенип, жеңишке жетет
  "ch04-s01#9": "desertMosque",  // беш убак намаз: багымдат, бешим, аср, шам, куптан
  "ch04-s05#1": "winterBirds",   // кышында таң кеч атат, багымдат кечирээк
  "ch05-s03#2": "neighbor",      // кошуналарга жакшылык кылсаң
  "ch06-s02#7": "queueShop",     // кезекте тынч турсак — сабыр
  "ch07-s03#2": "desertMosque",  // мурун ажылыкка үч ай, алты ай жол жүрүшкөн
  "ch07-s04#1": "streetBread",   // көчөдө келгендерге тамак таратышат
  "ch07-s04#4": "villages",      // айылдан өткөн бейтааныш адамды үйгө чакырышчу
  "ch07-s06#3": "nature",        // миллиондогон жаныбарлар — ар биринин ырыскысы Аллахтан
  "ch08-s02#7": "shareApples",   // оюнда өз үлүшүңдөн кошуп бересиң — берешендик
  "ch08-s03#1": "pilgrimsWhite", // ажылыкта ар түрдүү адамдарды көрүп — биримдик
  "ch09-s01#9": "pillarHouse",   // ушулар — эң негизги түркүктөр
};
