const LABELS: Record<string, string> = {
  NEW: "Оформлен",
  PAID: "Оплачен",
  CONFIRMED: "Подтверждён",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
};

// Для оплаты картой есть шаг «Оплачен», для оплаты при получении его нет
const FLOW_CARD = ["NEW", "PAID", "CONFIRMED", "SHIPPED", "DELIVERED"];
const FLOW_CASH = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED"];

// Дорожка статусов заказа, как в службах доставки
export default function OrderTracker({
  status,
  paymentMethod,
}: {
  status: string;
  paymentMethod: string;
}) {
  if (status === "CANCELLED") {
    return (
      <p className="rounded-xl border border-bad/50 bg-bad/10 p-4 text-bad">
        Заказ отменён
      </p>
    );
  }

  const flow = paymentMethod === "CARD" ? FLOW_CARD : FLOW_CASH;
  let idx = flow.indexOf(status);
  if (idx === -1) idx = flow.indexOf("CONFIRMED");

  return (
    <ol className="flex items-start">
      {flow.map((s, i) => (
        <li key={s} className="relative flex-1 text-center">
          {i > 0 && (
            <span
              className={`absolute top-4 left-[-50%] h-0.5 w-full ${
                i <= idx ? "bg-accent" : "bg-line"
              }`}
            />
          )}
          <span
            className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              i < idx
                ? "bg-accent text-on-accent"
                : i === idx
                  ? "bg-accent text-on-accent ring-4 ring-accent/30"
                  : "bg-surface-2 text-muted"
            }`}
          >
            {i <= idx ? "✓" : i + 1}
          </span>
          <span className={`mt-2 block text-xs ${i <= idx ? "text-ink" : "text-muted"}`}>
            {LABELS[s]}
          </span>
        </li>
      ))}
    </ol>
  );
}
