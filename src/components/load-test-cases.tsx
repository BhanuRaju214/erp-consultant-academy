"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loadProjectTestCases } from "@/app/actions/learning";
import { buttonClass } from "./ui";

export function LoadTestCasesButton({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>();
  return (
    <div className="flex items-center gap-3">
      {msg && (
        <span className="text-sm text-muted">
          {msg}{" "}
          <Link href="/testing#register" className="text-primary hover:underline">
            Open test register
          </Link>
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        className={buttonClass("secondary")}
        onClick={() =>
          start(async () => {
            const n = await loadProjectTestCases(projectId);
            setMsg(n ? `${n} test cases added.` : "Already in your register.");
          })
        }
      >
        {pending ? "Adding…" : "Copy to my test register"}
      </button>
    </div>
  );
}
