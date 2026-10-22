import Link from "next/link";
import { copyrightLine } from "@/lib/brand";
import { Wordmark } from "./wordmark";

/** Footer for signed-in pages and the public home page. */
export function SiteFooter({ signedIn = true }: { signedIn?: boolean }) {
  const learn = signedIn
    ? [
        { href: "/catalog", label: "Library" },
        { href: "/dashboard", label: "Home" },
        { href: "/verify", label: "Verify a certificate" },
      ]
    : [
        { href: "/login", label: "Sign in" },
        { href: "/register", label: "Create an account" },
        { href: "/verify", label: "Verify a certificate" },
      ];
  return (
    <footer className="mt-16 border-t border-border bg-surface no-print">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Practical, job-ready courses. Learn by doing, with hands-on labs, real projects, assessments and certificates.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-fg">Learn</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {learn.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-fg">Contact</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href="mailto:info@nexsademy.com" className="text-muted transition hover:text-primary">
                info@nexsademy.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          <span>{copyrightLine()}</span>
        </div>
      </div>
    </footer>
  );
}
