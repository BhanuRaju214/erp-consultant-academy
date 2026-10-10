import Link from "next/link";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const db = await getDb();
  const paths = await db.select().from(learningPaths).orderBy(asc(learningPaths.position));
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg">Create your trainee account</h1>
      <p className="mt-1 text-sm text-muted">Pick a learning path — you can change it later from your dashboard.</p>
      <RegisterForm paths={paths.map((p) => ({ slug: p.slug, title: p.title, level: p.level, description: p.description }))} />
      <p className="mt-6 text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
