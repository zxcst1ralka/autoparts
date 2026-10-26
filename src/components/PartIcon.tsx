// Рисованные иконки категорий: показываются, пока у запчасти нет фото
export default function PartIcon({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const s = slug.toLowerCase();
  const common = {
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  if (/brake|tormoz/.test(s)) {
    return (
      <svg {...common}>
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="14" />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx="50" cy="22" r="3" transform={`rotate(${i * 45} 50 50)`} />
        ))}
      </svg>
    );
  }
  if (/filter|filtr/.test(s)) {
    return (
      <svg {...common}>
        <rect x="28" y="14" width="44" height="72" rx="8" />
        <path d="M28 30h44M28 70h44M40 38v24M50 38v24M60 38v24" />
      </svg>
    );
  }
  if (/suspens|podvesk|amort/.test(s)) {
    return (
      <svg {...common}>
        <path d="M50 8v12M50 80v12M30 24h40L30 36h40L30 48h40L30 60h40L30 72h40" />
      </svg>
    );
  }
  if (/ignit|zazhig|svech|plug/.test(s)) {
    return (
      <svg {...common}>
        <rect x="38" y="10" width="24" height="18" rx="4" />
        <path d="M42 28h16v28H42zM46 56v16l4 10 4-10V56" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="50" cy="50" r="30" strokeDasharray="8 6" />
      <circle cx="50" cy="50" r="18" />
      <circle cx="50" cy="50" r="5" />
    </svg>
  );
}
