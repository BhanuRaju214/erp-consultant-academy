import Link from "next/link";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { googleEnabled } from "@/lib/auth/google";
import { GoogleButton } from "../google-button";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const db = await getDb();
  const paths = await db.select().from(learningPaths).orderBy(asc(learningPaths.position));
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-fg">Start learning today</h1>
      <p className="mt-2 text-[0.9375rem] text-muted">Create your free Nexsademy account. You can change your learning path later.</p>
      {googleEnabled() && <GoogleButton label="Sign up with Google" />}
      <RegisterForm paths={paths.map((p) => ({ slug: p.slug, title: p.title, level: p.level, description: p.description }))} />
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
