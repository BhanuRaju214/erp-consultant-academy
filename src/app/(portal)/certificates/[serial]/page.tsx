import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/auth/cookie";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { formatIssued, getCertificate, linkedInAddToProfileUrl, linkedInShareUrl, verifyPath, whatsAppShareUrl } from "@/lib/services/certificates";
import { CertificateShare } from "@/components/certificate-share";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Certificate" };

/** The learner's own certificate, with LinkedIn, sharing and download options. */
export default async function CertificatePage({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const viewer = await requireUser();
  const cert = await getCertificate(await getDb(), serial);
  if (!cert || (cert.userId !== viewer.id && !can(viewer.role, "trainer:dashboard"))) notFound();
  const verifyUrl = `${await appUrl()}${verifyPath(cert.serial)}`;
  const own = cert.userId === viewer.id;

  return (
    <div className="space-y-6">
      <PageHeader
        compact
        eyebrow="Certificate"
        title={cert.title}
        description={`${own ? "Congratulations! " : `Issued to ${cert.name}. `}Issued ${formatIssued(cert.issuedAt)} · ${cert.kind === "module" ? "Final assessment" : "Overall assessment"} score ${cert.score}% · ID ${cert.serial}`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${verifyPath(cert.serial)}/image`}
            width={2000}
            height={1414}
            alt={`Certificate of completion: ${cert.name}, ${cert.title}, issued ${formatIssued(cert.issuedAt)}, ID ${cert.serial}`}
            className="h-auto w-full rounded-lg border border-border bg-white shadow-lg"
          />
          <p className="text-sm text-muted">
            Anyone can check this certificate at{" "}
            <Link href={verifyPath(cert.serial)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              {verifyUrl.replace(/^https?:\/\//, "")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
            . It shows your name, the course and the issue date, never your email or scores.
          </p>
        </div>
        <Card>
          <CertificateShare
            serial={cert.serial}
            verifyUrl={verifyUrl}
            addToProfileUrl={linkedInAddToProfileUrl(cert, verifyUrl)}
            linkedInShareUrl={linkedInShareUrl(verifyUrl)}
            whatsAppUrl={whatsAppShareUrl(cert, verifyUrl)}
          />
        </Card>
      </div>
    </div>
  );
}
