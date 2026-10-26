// «1 товар», «2 товара», «5 товаров»
export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export const money = (n: number | string | { toString(): string }) =>
  `${Number(n).toLocaleString("ru-RU")} ₽`;
