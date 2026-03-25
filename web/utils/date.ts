export function startOfMonth(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function endOfMonth(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
}

export function monthKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export function labelMonth(ts: number): string {
  return new Date(ts).toLocaleString(undefined, { month: "long", year: "numeric" });
}
