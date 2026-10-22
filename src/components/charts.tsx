"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = { fontSize: 12, fill: "var(--muted)" };

/** Long category names (e.g. module titles) are shortened on the axis; the tooltip shows them in full. */
function shorten(value: string, max = 28) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function SimpleBarChart({
  data,
  xKey,
  yKey,
  label,
  height = 240,
  layout = "horizontal",
  empty = "No data yet.",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  label: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  /** Message shown when there is nothing to plot. */
  empty?: string;
}) {
  if (!data.length || data.every((d) => !Number(d[yKey]))) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted" style={{ height }}>
        {empty}
      </div>
    );
  }
  const vertical = layout === "vertical";
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} margin={{ top: 8, right: 16, bottom: 8, left: vertical ? 8 : -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={!vertical} vertical={vertical} />
          {vertical ? (
            <>
              <XAxis type="number" tick={axis} allowDecimals={false} stroke="var(--border)" />
              <YAxis type="category" dataKey={xKey} tick={axis} width={190} stroke="var(--border)" tickFormatter={(v: string) => shorten(String(v))} interval={0} />
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
