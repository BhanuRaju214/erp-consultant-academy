"use client";

import { useTransition } from "react";
import { updateProjectTask } from "@/app/actions/learning";
import { cn } from "./ui";

const OPTIONS = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
] as const;

export function TaskStatus({ taskId, status, path }: { taskId: string; status: "todo" | "in_progress" | "done"; path: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" aria-label="Task status">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={status === o.value}
          disabled={pending}
          onClick={() => start(() => updateProjectTask(taskId, o.value, path))}
          className={cn(
            "px-2.5 py-1.5 transition",
            status === o.value
              ? o.value === "done"
                ? "bg-success text-white"
                : o.value === "in_progress"
                  ? "bg-primary text-primary-fg"
                  : "bg-surface-2 text-fg"
              : "bg-surface text-muted hover:bg-surface-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
