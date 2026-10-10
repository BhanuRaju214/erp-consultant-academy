import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge, inputClass } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND, copyrightLine } from "@/lib/brand";
import { getDb } from "@/lib/db";
import { buildNavTree } from "@/lib/services/nav-tree";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const navTree = await buildNavTree(await getDb(), user);
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <Sidebar role={user.role} tree={navTree} />
      <div className="transition-[padding] duration-200 ease-out motion-reduce:transition-none lg:pl-72 rail:lg:pl-[4.5rem]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 pl-16 backdrop-blur lg:pl-6 no-print">
          <form action="/search" className="relative max-w-md flex-1" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" type="search" placeholder="Search lessons, processes, docs…" aria-label="Search" className={`${inputClass} pl-9`} />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight text-fg">{user.name}</div>
              <div className="text-xs leading-tight text-muted">{user.email}</div>
            </div>
            <Badge tone={user.role === "student" ? "primary" : "warning"} className="capitalize">
              {user.role}
            </Badge>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Sign out" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
        <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-border px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 no-print">
          <div className="flex items-center gap-3">
            <a href={BRAND.website} target="_blank" rel="noopener noreferrer" aria-label={`${BRAND.company} website`}>
              <BrandLogo height={18} />
            </a>
            <span>{copyrightLine()}</span>
          </div>
          <p className="max-w-xl sm:text-right">
            Fictional companies and synthetic data · simulated exercises never modify a real ERP. Odoo is a trademark of Odoo S.A.{" "}
            <Link href="/docs" className="underline">
              Documentation
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
