export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PAID: "Оплачен",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

export function statusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

// Цвета «таблеток» со статусом
export const STATUS_CHIP: Record<string, string> = {
  NEW: "bg-accent-2/15 text-accent-2",
  CONFIRMED: "bg-sky-500/15 text-sky-400",
  PAID: "bg-ok/15 text-ok",
  SHIPPED: "bg-violet-500/15 text-violet-400",
  DELIVERED: "bg-ok/15 text-ok",
  CANCELLED: "bg-bad/15 text-bad",
};

export function statusChip(status: string) {
  return STATUS_CHIP[status] ?? "bg-surface-2 text-muted";
}

// Подпись про оплату заказа
export function paymentBadge(order: {
  paymentMethod: string;
  paidAt: Date | null;
  status: string;
}) {
  if (order.status === "CANCELLED") return { label: "Отменён", cls: "text-muted" };
  if (order.paidAt) return { label: "Оплачен", cls: "text-ok" };
  if (order.paymentMethod === "CARD") return { label: "Ждёт оплаты", cls: "text-accent-2" };
  return { label: "При получении", cls: "text-muted" };
}
