export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function clampAmount(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function parseAmountInput(raw: string): number {
  const n = parseFloat(raw.replace(/[^0-9.-]/g, ""));
  return clampAmount(Number.isFinite(n) ? n : 0);
}
