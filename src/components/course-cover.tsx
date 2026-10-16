import { courseVisual } from "@/lib/visuals/course-visuals";
import { VisualIcon } from "./visuals/icons";
import { cn } from "./ui";

/**
 * Course thumbnail / banner: brand navy panel, subject icon and a subtle dot grid.
 * Purely presentational (aria-hidden) — the course title is always rendered next to it.
 */
export function CourseCover({ slug, section, size = "card", className }: { slug: string; section?: string; size?: "card" | "banner" | "mini"; className?: string }) {
  const v = courseVisual(slug, section);
  const pattern = `cover-dots-${slug}`;
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-sidebar text-white",
        size === "card" && "h-28 rounded-t-xl",
        size === "banner" && "h-full min-h-32 rounded-2xl",
        size === "mini" && "h-12 w-12 shrink-0 rounded-xl",
        className,
      )}
    >
      {size !== "mini" && (
        <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden>
          <defs>
            <pattern id={pattern} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${pattern})`} />
        </svg>
      )}
      <div className={cn("relative flex h-full items-center", size === "mini" ? "justify-center" : "justify-between px-5")}>
        {size !== "mini" && <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">{v.label}</span>}
        <span className={cn("flex items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15", size === "mini" ? "h-full w-full rounded-xl" : "h-16 w-16")}>
          <VisualIcon name={v.icon} className={cn("text-brand", size === "mini" ? "h-6 w-6" : "h-8 w-8")} />
        </span>
      </div>
    </div>
  );
}
