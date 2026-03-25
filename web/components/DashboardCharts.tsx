"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#f472b6", "#a78bfa", "#94a3b8"];

export function CategoryPie({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  if (!data.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
        No expense data for this period yet.
      </p>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
            contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBar({ data }: { data: { month: string; expenses: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month,
  }));
  if (!chartData.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
        Add expenses to see monthly trends.
      </p>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Expenses"]}
            contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          />
          <Bar dataKey="expenses" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLine({ data }: { data: { month: string; expenses: number }[] }) {
  if (data.length < 2) {
    return null;
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Expenses"]}
            contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          />
          <Line type="monotone" dataKey="expenses" stroke="#38bdf8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
