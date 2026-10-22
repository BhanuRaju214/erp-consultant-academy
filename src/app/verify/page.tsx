import { redirect } from "next/navigation";
import { SearchCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { normalizeSerial } from "@/lib/services/certificates";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Callout, Container, buttonClass, inputClass } from "@/components/ui";

export const metadata = {
  title: "Verify a certificate",
  description: "Check that a Nexsademy certificate is genuine by entering its certificate ID.",
};

/** Public lookup: anyone can check a certificate by its ID. */
export default async function VerifyLookupPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const serial = id ? normalizeSerial(id) : null;
  if (serial) redirect(`/verify/${serial}`);
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <PublicHeader signedIn={Boolean(user)} />
      <main className="flex-1">
        <Container className="max-w-xl py-16">
          <SearchCheck className="h-10 w-10 text-primary" aria-hidden />
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-fg">Verify a certificate</h1>
          <p className="mt-2 text-muted">
            Every Nexsademy certificate has a unique ID, printed on the certificate (for example <span className="font-semibold text-fg">NXS-2026-1A2B3C4D</span>). Enter it to see who it was issued to and for which course.
          </p>
          {id && !serial && (
            <div className="mt-5">
              <Callout tone="danger">&ldquo;{id.slice(0, 40)}&rdquo; isn&apos;t a valid certificate ID. Check it and try again.</Callout>
            </div>
          )}
          <form action="/verify" method="get" className="mt-6 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="cert-id" className="sr-only">
              Certificate ID
            </label>
            <input id="cert-id" name="id" required defaultValue={id ?? ""} placeholder="NXS-2026-1A2B3C4D" autoComplete="off" className={`${inputClass} uppercase`} />
            <button className={buttonClass("primary", "shrink-0")}>Verify</button>
          </form>
        </Container>
      </main>
      <SiteFooter signedIn={Boolean(user)} />
    </div>
  );
}
