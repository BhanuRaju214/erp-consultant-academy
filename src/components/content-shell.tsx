"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isCoursePath } from "@/lib/nav";
import { cn } from "./ui";

/** Pages that draw their own full-width bands (hero banners) and handle their own width. */
const FULL_BLEED = ["/dashboard", "/catalog", "/admin", "/trainer"];

/**
 * Positions page content: next to the course sidebar inside a course, full width on
 * platform pages. Pages listed in FULL_BLEED manage their own containers.
 */
export function ContentShell({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const inCourse = isCoursePath(pathname);
  const fullBleed = FULL_BLEED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  return (
    <div className={cn("flex min-h-screen flex-col", inCourse && "transition-[padding] duration-200 ease-out motion-reduce:transition-none lg:pl-72 rail:lg:pl-[4.5rem]")}>
      {header}
      <main id="main" className={cn("flex-1", !fullBleed && "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10")}>
        {children}
      </main>
      {footer}
    </div>
  );
}
