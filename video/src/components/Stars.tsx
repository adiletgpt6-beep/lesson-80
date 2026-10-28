import { starsLit, theme } from "../theme";

export const Stars: React.FC<{ chapter: string }> = ({ chapter }) => {
  const lit = starsLit[chapter] ?? 0;
  return (
    <div style={{ position: "absolute", left: 610, top: 600, display: "flex", gap: 36 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={64} height={64} viewBox="0 0 24 24">
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill={n <= lit ? theme.star : theme.starOff} />
        </svg>
      ))}
    </div>
  );
};
