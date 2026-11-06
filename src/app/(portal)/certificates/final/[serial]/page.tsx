import { redirect } from "next/navigation";

/** The consultant certificate now lives with the other certificates (share, PDF, public verification). */
export default async function FinalCertificatePage({ params }: { params: Promise<{ serial: string }> }) {
  redirect(`/certificates/${encodeURIComponent((await params).serial)}`);
}
