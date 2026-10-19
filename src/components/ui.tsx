import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function cn(...args: Parameters<typeof clsx>) {
  return clsx(...args);
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
        {description && <div className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className, as: Tag = "div", id }: { children: ReactNode; className?: string; as?: "div" | "section" | "article"; id?: string }) {
  return (
    <Tag id={id} className={cn("rounded-xl border border-border bg-surface p-5 shadow-sm", id && "scroll-mt-20", className)}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-base font-semibold text-fg", className)}>{children}</h2>;
}

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "primary";
const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  info: "bg-primary-soft text-accent border-transparent",
  primary: "bg-primary-soft text-primary border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium [overflow-wrap:anywhere]", toneClass[tone], className)}>
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
        <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
const buttonVariant = {
  primary: "bg-primary text-primary-fg hover:opacity-90",
  secondary: "border border-border bg-surface text-fg hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white hover:opacity-90",
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

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-fg">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <div className="font-medium text-fg">{title}</div>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warning" | "success" | "danger"; title?: string; children: ReactNode }) {
  const styles = {
    info: "border-primary/30 bg-primary-soft",
    warning: "border-warning/40 bg-warning-soft",
    success: "border-success/40 bg-success-soft",
    danger: "border-danger/40 bg-danger-soft",
  }[tone];
  return (
    <div className={cn("rounded-lg border p-4 text-sm text-fg", styles)} role={tone === "danger" ? "alert" : undefined}>
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export const levelTone = { beginner: "success", intermediate: "info", advanced: "warning" } as const;

export function LevelBadge({ level }: { level: string }) {
  return <Badge tone={levelTone[level as keyof typeof levelTone] ?? "neutral"}>{level[0].toUpperCase() + level.slice(1)}</Badge>;
}

export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
