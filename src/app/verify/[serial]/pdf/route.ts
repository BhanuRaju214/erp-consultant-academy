import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appUrl } from "@/lib/auth/cookie";
import { certificatePdf } from "@/lib/certificate-art";
import { getCertificate, verifyPath } from "@/lib/services/certificates";

export const runtime = "nodejs";

/** The certificate as a one-page A4 landscape PDF. */
export async function GET(_: Request, { params }: { params: Promise<{ serial: string }> }) {
  const cert = await getCertificate(await getDb(), (await params).serial);
  if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  const pdf = await certificatePdf(cert, `${await appUrl()}${verifyPath(cert.serial)}`);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Nexsademy-certificate-${cert.serial}.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
