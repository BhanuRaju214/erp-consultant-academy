import { redirect } from "next/navigation";

/** Old "AI builder" tab: AI courses are now started from Courses → New course → Build with AI. */
export default function OldAiBuilderPage() {
  redirect("/admin/programs/new/ai");
}
