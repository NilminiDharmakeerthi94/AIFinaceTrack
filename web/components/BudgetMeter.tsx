"use client";

export function BudgetMeter({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const color =
    p >= 100 ? "bg-rose-500" : p >= 85 ? "bg-amber-500" : p >= 60 ? "bg-yellow-400" : "bg-emerald-500";
  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}
