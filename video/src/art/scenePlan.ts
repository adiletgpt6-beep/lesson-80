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
  "ch03-s03#0": "space",
  "ch03-s04#1": "glacier",
  "ch03-s05#5": "villages",
  "ch03-s06#5": "growth",
  "ch05-s03#6": "snakeRopes",
  "ch05-s06#6": "seaCrown",
  "ch06-s02#0": "bekturRoom",
  "ch06-s05#2": "aizadaBed",
  "ch07-s03#5": "homeKitchen",
  "ch07-s04#4": "streetBread",
  "ch08-s02#2": "growth",
  "ch08-s05#2": "race",
  "ch09-s02#1": "spaceReturn",
  "ch09-s03#2": "dawnRoom",
  "ch09-s04#3": "neighbor",
  "ch10-s01#2": "electrician",
  "ch10-s05#3": "wheatField",
  "ch12-s02#4": "winterBirds",
  "ch13-s03#3": "garage",
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

// The visual beat key whose description says a star lights up (sparkle on the board star strip).
export const starBeats = new Set([
  "ch03-s01#0", "ch03-s08#2", "ch05-s07#2", "ch06-s01#0", "ch06-s06#6", "ch07-s01#0", "ch07-s04#6", "ch09-s01#3",
  "ch09-s05#7", "ch10-s06#2", "ch12-s04#1", "ch13-s01#0", "ch13-s04#3", "ch14-s02#12", "ch15-s01#0", "ch16-s01#0", "ch16-s01#11",
]);
