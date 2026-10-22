import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appUrl } from "@/lib/auth/cookie";
import { certificateImage } from "@/lib/certificate-art";
import { getCertificate, verifyPath } from "@/lib/services/certificates";

export const runtime = "nodejs";

/** The certificate as a PNG. Public, like the verification page. ?download=1 saves it as a file. */
export async function GET(req: Request, { params }: { params: Promise<{ serial: string }> }) {
  const cert = await getCertificate(await getDb(), (await params).serial);
  if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  const download = new URL(req.url).searchParams.get("download") === "1";
  return certificateImage(cert, `${await appUrl()}${verifyPath(cert.serial)}`, 2000, {
    "Cache-Control": "public, max-age=3600",
    ...(download ? { "Content-Disposition": `attachment; filename="Nexsademy-certificate-${cert.serial}.png"` } : {}),
  });
}
