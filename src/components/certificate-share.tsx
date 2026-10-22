"use client";

import { useState } from "react";
import { Check, Download, FileDown, Link2, MessageCircle, Plus } from "lucide-react";
import { buttonClass } from "./ui";

/** Add-to-profile, share and download actions for a certificate (shown to its owner). */
export function CertificateShare({
  verifyUrl,
  addToProfileUrl,
  linkedInShareUrl,
  whatsAppUrl,
  serial,
}: {
  verifyUrl: string;
  addToProfileUrl: string;
  linkedInShareUrl: string;
  whatsAppUrl: string;
  serial: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-bold text-fg">Add to your LinkedIn profile</h2>
        <p className="mt-1 text-sm text-muted">Opens LinkedIn&apos;s &ldquo;Add licence or certification&rdquo; form with everything filled in, including the verification link.</p>
        <a href={addToProfileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#0a66c2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004182]">
          <Plus className="h-4 w-4" aria-hidden /> Add to LinkedIn profile
        </a>
      </div>
      <div>
        <h2 className="text-sm font-bold text-fg">Share</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
            <LinkedInMark /> Post on LinkedIn
          </a>
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </a>
          <CopyLink url={verifyUrl} />
        </div>
      </div>
      <div>
        <h2 className="text-sm font-bold text-fg">Download</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`/verify/${serial}/pdf`} className={buttonClass("secondary")}>
            <FileDown className="h-4 w-4" aria-hidden /> PDF (A4)
          </a>
          <a href={`/verify/${serial}/image?download=1`} className={buttonClass("secondary")}>
            <Download className="h-4 w-4" aria-hidden /> Image (PNG)
          </a>
        </div>
      </div>
    </div>
  );
}

/** LinkedIn "in" mark (lucide no longer ships brand icons). */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#0a66c2" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function CopyLink({ url, label = "Copy verification link" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this link:", url);
        }
      }}
      className={buttonClass("secondary")}
    >
      {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}
