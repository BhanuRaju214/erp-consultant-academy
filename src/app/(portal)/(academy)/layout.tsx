import { requireUser } from "@/lib/auth";

/**
 * Everything in this route group is the content of the flagship program (the
 * original 14 academy sections). URLs are unchanged by the (academy) group.
 * Every page checks access itself: most need an enrolment (requireCourseUser),
 * while free beginner modules only need a sign-in (requireModuleUser).
 */
export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
