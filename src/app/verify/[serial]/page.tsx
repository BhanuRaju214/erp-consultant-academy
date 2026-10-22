import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CircleX, FileDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { appUrl } from "@/lib/auth/cookie";
import { getDb } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { formatIssued, getCertificate, verifyPath } from "@/lib/services/certificates";
import { CopyLink } from "@/components/certificate-share";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { ButtonLink, Container, buttonClass } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const cert = await getCertificate(await getDb(), (await params).serial);
  if (!cert) return { title: "Certificate not found", robots: { index: false } };
  const base = await appUrl();
  const title = `${cert.name}: ${cert.title}`;
  const description = `Verified ${BRAND.productName} certificate of completion issued to ${cert.name} on ${formatIssued(cert.issuedAt)}. Certificate ID ${cert.serial}.`;
  const image = `${base}${verifyPath(cert.serial)}/card`;
  return {
    title,
    description,
    // Learners' names shouldn't show up in search engines; shared links still preview.
    robots: { index: false, follow: false },
    openGraph: { title: `${cert.name} earned a ${BRAND.productName} certificate`, description, url: `${base}${verifyPath(cert.serial)}`, siteName: BRAND.productName, type: "website", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/** Public certificate verification: anyone with the link or ID can check a certificate. */
export default async function VerifyCertificatePage({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const [cert, viewer] = await Promise.all([getCertificate(await getDb(), serial), getCurrentUser()]);
  const verifyUrl = cert ? `${await appUrl()}${verifyPath(cert.serial)}` : "";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <PublicHeader signedIn={Boolean(viewer)} />
      <main className="flex-1">
        <Container className="py-10">
          {!cert ? (
            <div className="mx-auto max-w-xl py-10 text-center">
              <CircleX className="mx-auto h-12 w-12 text-danger" aria-hidden />
              <h1 className="mt-4 text-2xl font-extrabold text-fg">No certificate found</h1>
              <p className="mt-2 text-muted">
                We couldn&apos;t find a {BRAND.productName} certificate with the ID <span className="font-semibold text-fg">{decodeURIComponent(serial).slice(0, 40)}</span>. Check the ID and try again.
              </p>
              <Link href="/verify" className={buttonClass("primary", "mt-6")}>
                Verify another certificate
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${verifyPath(cert.serial)}/image`}
                  width={2000}
                  height={1414}
                  alt={`Certificate of completion: ${cert.name}, ${cert.title}, issued ${formatIssued(cert.issuedAt)}, ID ${cert.serial}`}
                  className="h-auto w-full rounded-lg border border-border bg-white shadow-lg"
                />
              </div>
              <aside className="space-y-5">
                <div className="rounded-lg border border-success/40 bg-success-soft p-5">
                  <div className="flex items-center gap-2 font-bold text-success">
                    <BadgeCheck className="h-5 w-5" aria-hidden /> Verified certificate
                  </div>
                  <p className="mt-1.5 text-sm text-fg">
                    This certificate is genuine. It was issued by {BRAND.productName} ({BRAND.legalName}) to the learner named below.
                  </p>
                </div>
                <dl className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
                  {[
                    ["Awarded to", cert.name],
                    [cert.kind === "module" ? "Module" : "Course", cert.title],
                    ...(cert.partOf ? [["Part of", cert.partOf]] : []),
                    ["Level", cert.level.charAt(0).toUpperCase() + cert.level.slice(1)],
                    ["Issued on", formatIssued(cert.issuedAt)],
                    ["Certificate ID", cert.serial],
                    ["Issued by", `${BRAND.productName} · ${BRAND.legalName}`],
                  ].map(([k, v]) => (
                    <div key={k} className="px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
                      <dd className="mt-0.5 font-semibold text-fg">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-2">
                  <a href={`${verifyPath(cert.serial)}/pdf`} className={buttonClass("secondary")}>
                    <FileDown className="h-4 w-4" aria-hidden /> Download PDF
                  </a>
                  <CopyLink url={verifyUrl} label="Copy link" />
                </div>
                {viewer?.id === cert.userId && (
                  <ButtonLink href={`/certificates/${cert.serial}`} className="w-full justify-center">
                    Share or add to LinkedIn
                  </ButtonLink>
                )}
                {!viewer && (
                  <p className="text-sm text-muted">
                    Want to learn too?{" "}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                      Join {BRAND.productName}
                    </Link>
                  </p>
                )}
              </aside>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter signedIn={Boolean(viewer)} />
    </div>
  );
}
