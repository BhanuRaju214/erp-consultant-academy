"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Circle } from "lucide-react";
import { toggleExerciseStep } from "@/app/actions/learning";
import { cn } from "./ui";

export function StepToggle({ stepId, done, path }: { stepId: string; done: boolean; path: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        aria-pressed={done}
        onClick={() =>
          start(async () => {
            const res = await toggleExerciseStep(stepId, !done, path);
            setError(res.ok ? undefined : res.error);
          })
        }
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
          done ? "border-success/40 bg-success-soft text-success" : "border-border bg-surface text-fg hover:border-primary",
        )}
      >
        {done ? <CircleCheck className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        {pending ? "Saving…" : done ? "Done" : "Mark done"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
