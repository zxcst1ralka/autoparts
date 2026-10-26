// Логотип: колесо с «ускорением». Цвета берутся из палитры сайта.
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <circle cx="20" cy="20" r="17" className="stroke-line" strokeWidth="3" />
      <path d="M20 3a17 17 0 0 1 14.7 8.5" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="20" r="6" className="fill-accent" />
      <path d="M20 14V8M26 20h6M20 26v6M14 20H8" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
