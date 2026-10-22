import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { FLAGSHIP_PROGRAM, canAccessProgram } from "@/lib/services/programs";

/**
 * Everything in this route group is the content of the flagship program (the
 * original 14 academy sections). Learners need an active enrolment; trainers and
 * admins always have access. URLs are unchanged by the (academy) group.
 */
export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!(await canAccessProgram(await getDb(), user, FLAGSHIP_PROGRAM.slug))) {
    redirect(`/catalog/${FLAGSHIP_PROGRAM.slug}?locked=1`);
  }
  return children;
}
