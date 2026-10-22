import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function cn(...args: Parameters<typeof clsx>) {
  return clsx(...args);
}

/** Centred page-width wrapper for full-bleed pages (dashboard, catalogue, course pages). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  compact = false,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  /** Smaller heading for working areas such as admin pages. */
  compact?: boolean;
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", compact ? "mb-6" : "mb-8")}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary [&_a:hover]:underline">{eyebrow}</div>}
        {compact ? (
          <h2 className="text-xl font-bold tracking-[-0.015em] text-fg">{title}</h2>
        ) : (
          <h1 className="font-display text-3xl font-semibold leading-tight text-fg sm:text-4xl">{title}</h1>
        )}
        {description && <div className={cn("max-w-3xl leading-relaxed text-muted", compact ? "mt-1 text-sm" : "mt-3 text-[0.9375rem]")}>{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className, as: Tag = "div", id }: { children: ReactNode; className?: string; as?: "div" | "section" | "article"; id?: string }) {
  return (
    // min-w-0: inside grids, let wide content (tables, code) scroll within the card instead of widening the page.
    <Tag id={id} className={cn("min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-soft", id && "scroll-mt-20", className)}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold tracking-tight text-fg", className)}>{children}</h2>;
}

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "primary" | "gold";
const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  info: "bg-primary-soft text-accent border-transparent",
  primary: "bg-primary-soft text-primary border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  gold: "bg-gold-soft text-gold border-transparent",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", toneClass[tone], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, label, className }: { value: number; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("w-full", className)}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-success" : "bg-gradient-to-r from-primary to-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none";
const buttonVariant = {
  primary: "bg-primary text-primary-fg shadow-sm shadow-primary/25 hover:brightness-110",
  secondary: "border border-border bg-surface text-fg shadow-sm hover:border-primary/40 hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white hover:brightness-110",
  /** White button for dark hero bands. */
  inverse: "bg-white text-ink shadow-sm hover:bg-white/90",
  /** Outline button for dark hero bands. */
  "inverse-outline": "border border-white/30 text-white hover:bg-white/10",
};
export type ButtonVariant = keyof typeof buttonVariant;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(buttonBase, buttonVariant[variant], className);
}

export function ButtonLink({ href, children, variant = "primary", className }: { href: string; children: ReactNode; variant?: ButtonVariant; className?: string }) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</div>
        {icon && <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:h-4.5 [&_svg]:w-4.5">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold text-fg">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <div className="font-display text-lg font-semibold text-fg">{title}</div>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warning" | "success" | "danger"; title?: string; children: ReactNode }) {
  const styles = {
    info: "border-primary/25 bg-primary-soft",
    warning: "border-warning/35 bg-warning-soft",
    success: "border-success/35 bg-success-soft",
    danger: "border-danger/35 bg-danger-soft",
  }[tone];
  const bar = { info: "bg-primary", warning: "bg-warning", success: "bg-success", danger: "bg-danger" }[tone];
  return (
    <div className={cn("relative overflow-hidden rounded-xl border p-4 pl-5 text-sm text-fg", styles)} role={tone === "danger" ? "alert" : undefined}>
      <span className={cn("absolute inset-y-0 left-0 w-1", bar)} aria-hidden />
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export const levelTone = { beginner: "success", intermediate: "info", advanced: "warning" } as const;

export function LevelBadge({ level }: { level: string }) {
  return <Badge tone={levelTone[level as keyof typeof levelTone] ?? "neutral"}>{level[0].toUpperCase() + level.slice(1)}</Badge>;
}

/** Compact input for table rows and inline forms (no full width). */
export const inputSmClass =
  "rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg transition hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm transition placeholder:text-muted/70 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-fg">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
