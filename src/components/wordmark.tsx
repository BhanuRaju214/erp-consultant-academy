import { BRAND } from "@/lib/brand";
import { cn } from "./ui";

/** Nexsademy wordmark: flat monogram + name. `inverse` for dark backgrounds. */
export function Wordmark({ className, inverse = false, compact = false }: { className?: string; inverse?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", inverse ? "bg-white text-[#1a56db]" : "bg-[#1a56db] text-white")}>
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 19V5l12 14V5" />
        </svg>
      </span>
      {!compact && <span className={cn("text-[1.35rem] font-extrabold tracking-[-0.03em]", inverse ? "text-white" : "text-fg")}>{BRAND.productName.toLowerCase()}</span>}
    </span>
  );
}
