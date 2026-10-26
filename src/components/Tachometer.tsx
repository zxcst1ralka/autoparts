// Кольцо тахометра вокруг колеса: шкала, красная зона и стрелка, которая «газует»
export default function Tachometer() {
  const TICKS = 41;
  return (
    <svg viewBox="0 0 500 500" className="h-full w-full">
      {Array.from({ length: TICKS }).map((_, i) => {
        const angle = -135 + i * (270 / (TICKS - 1));
        const major = i % 5 === 0;
        const red = i >= 33;
        return (
          <line
            key={i}
            x1="250"
            y1={major ? 22 : 30}
            x2="250"
            y2="40"
            strokeWidth={major ? 4 : 2}
            strokeLinecap="round"
            className={red ? "stroke-accent" : "stroke-muted"}
            opacity={red ? 1 : major ? 0.9 : 0.45}
            transform={`rotate(${angle} 250 250)`}
          />
        );
      })}
      <circle cx="250" cy="250" r="226" fill="none" className="stroke-line" strokeWidth="1" strokeDasharray="2 6" />
      {/* Стрелка */}
      <g className="animate-needle" style={{ transformOrigin: "250px 250px" }}>
        <line x1="250" y1="250" x2="250" y2="52" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
        <circle cx="250" cy="250" r="9" className="fill-accent" />
      </g>
    </svg>
  );
}
