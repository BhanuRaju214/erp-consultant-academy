import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { certificateShareCard } from "@/lib/certificate-art";
import { getCertificate } from "@/lib/services/certificates";

export const runtime = "nodejs";

/** Link preview image (Open Graph) for shared verification links. */
export async function GET(_: Request, { params }: { params: Promise<{ serial: string }> }) {
  const cert = await getCertificate(await getDb(), (await params).serial);
  if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  return certificateShareCard(cert);
}
