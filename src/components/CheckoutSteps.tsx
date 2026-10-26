const STEPS = ["Корзина", "Оформление", "Оплата"];

// Полоска шагов: current = 1, 2 или 3
export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm sm:gap-4">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                done
                  ? "bg-accent text-on-accent"
                  : active
                    ? "bg-accent text-on-accent ring-4 ring-accent/30"
                    : "bg-surface-2 text-muted"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={active ? "font-semibold" : "text-muted"}>{label}</span>
            {n < STEPS.length && <span className="h-px w-6 bg-line sm:w-12" />}
          </li>
        );
      })}
    </ol>
  );
}
