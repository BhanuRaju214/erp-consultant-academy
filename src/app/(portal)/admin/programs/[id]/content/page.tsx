import { redirect } from "next/navigation";

/** Old address of the Content tab. */
export default async function OldContentPage({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/admin/programs/${(await params).id}`);
}
