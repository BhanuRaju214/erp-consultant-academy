"use client";

import { Eye, PencilLine } from "lucide-react";
import { cn } from "./ui";

export type EditView = "edit" | "preview";

/** "Write | Preview" switch used by the course and lesson editors. */
export function EditPreviewTabs({ view, onChange, label = "Preview" }: { view: EditView; onChange: (v: EditView) => void; label?: string }) {
  const tab = (v: EditView, icon: React.ReactNode, text: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === v}
      onClick={() => onChange(v)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition",
        view === v ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
      )}
    >
      {icon}
      {text}
    </button>
  );
  return (
    <div role="tablist" className="inline-flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
      {tab("edit", <PencilLine className="h-4 w-4" aria-hidden />, "Write")}
      {tab("preview", <Eye className="h-4 w-4" aria-hidden />, label)}
    </div>
  );
}

/** Banner above a preview so nobody mistakes it for the saved version. */
export function PreviewNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-muted">
      <Eye className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      {children}
    </p>
  );
}
