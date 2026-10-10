"use client";

import { useEffect } from "react";
import { Callout, buttonClass } from "@/components/ui";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="mx-auto max-w-xl py-12">
      <Callout tone="danger" title="Something went wrong">
        The page could not be loaded. Try again; if the problem persists, tell your trainer
        {error.digest ? ` and quote reference ${error.digest}` : ""}.
      </Callout>
      <button type="button" onClick={reset} className={buttonClass("primary", "mt-4")}>
        Try again
      </button>
    </div>
  );
}
