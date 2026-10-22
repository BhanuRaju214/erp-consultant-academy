import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { FLAGSHIP_PROGRAM, getProgramBySlug } from "@/lib/services/programs";

/** Old "Modules & lessons" tab: the Odoo course's modules now live in that course's Content tab. */
export default async function OldModulesPage() {
  await requirePermission("admin:content");
  const program = await getProgramBySlug(await getDb(), FLAGSHIP_PROGRAM.slug);
  if (!program) notFound();
  redirect(`/admin/programs/${program.id}`);
}
