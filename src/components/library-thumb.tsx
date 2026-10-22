import type { ItemType } from "@/lib/services/library";
import { cn } from "./ui";

/** Brand colour per content type: [main, light]. */
export const TYPE_COLORS: Record<ItemType | "program", [string, string]> = {
  program: ["#1a56db", "#9cc0ff"],
  course: ["#1a56db", "#8fb4ff"],
  process: ["#0e9f6e", "#84e1bc"],
  lab: ["#f59e0b", "#fcd34d"],
  project: ["#e8590c", "#ffa94d"],
  assessment: ["#7e3af2", "#cabffd"],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Branded course artwork (Celigo U style): dark panel, layered rounded shapes in the
 * type colour, a category label and the title printed on the image. The shape layout
 * varies per title so neighbouring cards don't look identical.
 */
export function LibraryThumb({
  type,
  title,
  category,
  className,
  size = "card",
  fill = false,
}: {
  type: ItemType | "program";
  title: string;
  category: string;
  className?: string;
  size?: "card" | "hero";
  /** Fill the parent (e.g. one half of a split card) instead of keeping a fixed aspect ratio. */
  fill?: boolean;
}) {
  const [main, light] = TYPE_COLORS[type];
  const h = hash(title);
  const flip = h % 2 === 0;
  const a = 20 + (h % 30);
  const b = 10 + ((h >> 5) % 25);
  return (
    <div
      className={cn("relative overflow-hidden bg-[#0b1b3f] text-white", fill && "h-full min-h-48 w-full", className)}
      style={fill ? undefined : { aspectRatio: size === "hero" ? "16 / 7" : "16 / 9" }}
    >
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform={flip ? "translate(320 0) scale(-1 1)" : undefined}>
          <rect x={-60} y={40 + b} width={170} height={170} rx={34} fill={main} opacity={0.95} transform={`rotate(${a} 25 125)`} />
          <rect x={-20} y={90} width={140} height={140} rx={30} fill={light} opacity={0.85} transform={`rotate(${a + 25} 50 160)`} />
          <rect x={262} y={-78} width={96} height={96} rx={22} fill={light} opacity={0.9} transform={`rotate(${45 - b} 310 -30)`} />
          <rect x={282} y={-52} width={70} height={70} rx={16} fill={main} opacity={0.9} transform={`rotate(${30 + a} 317 -17)`} />
        </g>
      </svg>
      <div className="absolute left-3 top-3 flex items-center gap-1.5 text-[0.6875rem] font-semibold text-white/90">
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-white text-[#0b1b3f]">
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 19V5l12 14V5" />
          </svg>
        </span>
        <span className="h-3 w-px bg-white/40" aria-hidden />
        <span className="truncate">{category}</span>
      </div>
      <div className={cn("absolute inset-y-0 flex items-center", flip ? "left-4 right-[38%]" : "left-[38%] right-4")}>
        <span className={cn("font-extrabold leading-tight tracking-[-0.01em] [overflow-wrap:anywhere] line-clamp-3 [text-shadow:0_1px_10px_rgb(11_27_63/0.6)]", size === "hero" ? "text-3xl" : "text-[1.0625rem]")}>{title}</span>
      </div>
    </div>
  );
}
