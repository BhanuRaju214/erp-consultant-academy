"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = { fontSize: 12, fill: "var(--muted)" };

export function SimpleBarChart({ data, xKey, yKey, label, height = 240, layout = "horizontal" }: { data: Record<string, string | number>[]; xKey: string; yKey: string; label: string; height?: number; layout?: "horizontal" | "vertical" }) {
  if (!data.length) return <p className="py-8 text-center text-sm text-muted">No data yet.</p>;
  const vertical = layout === "vertical";
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} margin={{ top: 8, right: 16, bottom: 8, left: vertical ? 8 : -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={!vertical} vertical={vertical} />
          {vertical ? (
            <>
              <XAxis type="number" tick={axis} allowDecimals={false} stroke="var(--border)" />
              <YAxis type="category" dataKey={xKey} tick={axis} width={170} stroke="var(--border)" />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={axis} stroke="var(--border)" />
              <YAxis tick={axis} allowDecimals={false} stroke="var(--border)" />
            </>
          )}
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 12 }}
          />
          <Bar dataKey={yKey} fill="var(--primary)" radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
