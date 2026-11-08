// Director's plan: which illustrated cutaway plays on which `visual` beat, and which scenes are told entirely
// over an illustration (the ustaz keeps speaking, captions stay). Keys are beat keys "chNN-sNN#index".
export type CutawayId =
  | "nature" | "doors" | "window" | "space" | "spaceReturn" | "glacier" | "villages" | "growth" | "snakeRopes"
  | "seaCrown" | "bekturRoom" | "aizadaBed" | "homeKitchen" | "streetBread" | "orchard" | "race" | "dawnRoom"
  | "neighbor" | "electrician" | "wheatField" | "kettle" | "winterBirds" | "garage" | "brightPath" | "oven";

export const visualCutaways: Record<string, CutawayId> = {
  "ch01-s01#1": "nature",
  "ch01-s03#1": "doors",
  "ch03-s02#0": "window",
  "ch03-s03#1": "space",
  "ch03-s04#3": "glacier",
  "ch03-s05#5": "villages",
  "ch03-s06#5": "growth",
  "ch05-s03#6": "snakeRopes",
  "ch05-s06#6": "seaCrown",
  "ch06-s02#2": "bekturRoom",
  "ch06-s05#2": "aizadaBed",
  "ch07-s03#3": "homeKitchen",
  "ch07-s04#4": "streetBread",
  "ch08-s02#1": "growth",
  "ch08-s05#0": "race",
  "ch09-s02#1": "spaceReturn",
  "ch09-s03#0": "dawnRoom",
  "ch09-s04#3": "neighbor",
  "ch10-s01#2": "electrician",
  "ch10-s05#3": "wheatField",
  "ch12-s02#1": "winterBirds",
  "ch13-s03#4": "garage",
  "ch14-s01#6": "brightPath",
  "ch14-s02#3": "oven",
};

// Scenes whose whole body is shown over an illustration (setting is not the classroom).
export const sceneCutaways: Record<string, CutawayId> = {
  "ch03-s02": "window",
  "ch03-s03": "space",
  "ch08-s03": "orchard",
  "ch09-s02": "spaceReturn",
  "ch11-s04": "kettle",
  "ch12-s02": "winterBirds",
  "ch06-s02": "bekturRoom",
};

// Ustaz lines whose words are about something we can show: the illustration plays under the voice and captions
// (chosen by hand from keyword candidates; no Quran quotations are illustrated).
export const lineCutaways: Record<string, CutawayId> = {
  "ch02-s01#1": "nature",     // дарактар, суулар, жаныбарлар
  "ch03-s04#0": "nature",     // тоолор, зоолор
  "ch03-s05#1": "villages",   // шаарлар дарыянын боюнда
  "ch08-s02#7": "orchard",    // алманы дарак аркылуу өстүрдү
  "ch10-s03#0": "electrician",// баягы электрик бала
  "ch11-s02#1": "nature",     // тоодо жашаган бала
  "ch11-s02#2": "villages",   // шаардагы мектеп
  "ch15-s03#8": "nature",     // тоолор, суулар, бак-дарактар
};

// Visual beats whose description says a star lights up (sparkle on the board's star strip). Derived from the
// beat text so it cannot drift when beats are re-indexed.
import data from "../timeline.json";
type B = { key: string; type: string; text: string };
export const starBeats = new Set(
  (data as unknown as { scenes: { beats: B[] }[] }).scenes.flatMap((s) => s.beats)
    .filter((b) => b.type === "visual" && /жылдыз/i.test(b.text) && /жан|жаркыра|жылт/i.test(b.text)).map((b) => b.key),
);
