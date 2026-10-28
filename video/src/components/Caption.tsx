import type { Beat } from "../timeline";
import { theme } from "../theme";

const NAME: Record<string, string> = { ustaz: "Устаз", bektur: "Бектур", aizada: "Айзада", both_children: "Балдар" };

export const Caption: React.FC<{ beat: Beat }> = ({ beat }) => (
  <div style={{ position: "absolute", left: 160, right: 160, bottom: 40, background: theme.caption, color: "#fff",
    borderRadius: 14, padding: "16px 28px", fontSize: 38, lineHeight: 1.3 }}>
    <b style={{ color: theme.star }}>{NAME[beat.speaker ?? ""] ?? ""}: </b>
    {beat.text}
  </div>
);
