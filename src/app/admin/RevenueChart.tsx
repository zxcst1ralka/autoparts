import { money } from "@/lib/format";

// Столбчатая диаграмма выручки по дням, нарисованная кодом (без библиотек)
export default function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 700;
  const H = 240;
  const padX = 8;
  const padTop = 20;
  const padBottom = 28;
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = (W - padX * 2) / data.length;
  const barW = slot * 0.6;
  const innerH = H - padTop - padBottom;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-accent)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-accent-2)" }} stopOpacity=".6" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={W - padX}
          y1={padTop + innerH * (1 - t)}
          y2={padTop + innerH * (1 - t)}
          className="stroke-line"
          strokeDasharray="4 4"
        />
      ))}
      {data.map((d, i) => {
        const h = innerH * (d.value / max);
        const x = padX + i * slot + (slot - barW) / 2;
        const has = d.value > 0;
        return (
          <g key={i}>
            <rect
              x={x}
              y={has ? H - padBottom - h : H - padBottom - 3}
              width={barW}
              height={has ? h : 3}
              rx="4"
              fill={has ? "url(#bar)" : undefined}
              className={has ? undefined : "fill-line"}
            >
              <title>{`${d.label}: ${money(d.value)}`}</title>
            </rect>
            {i % 2 === 0 && (
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" className="fill-muted">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
