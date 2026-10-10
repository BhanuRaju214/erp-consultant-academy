"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { testCases } from "@/lib/db/schema";

const base = z.object({
  code: z.string().trim().min(1, "Test Case ID is required.").max(40),
  requirementId: z.string().trim().max(40).default(""),
  module: z.string().trim().min(1, "Module is required.").max(60),
  scenario: z.string().trim().min(3, "Describe the scenario.").max(500),
  preconditions: z.string().trim().max(2000).default(""),
  testData: z.string().trim().max(2000).default(""),
  steps: z.string().trim().min(3, "List the test steps.").max(4000),
  expected: z.string().trim().min(3, "State the expected result.").max(2000),
});

export type TestCaseState = { error?: string; ok?: boolean };

export async function createTestCase(_: TestCaseState, formData: FormData): Promise<TestCaseState> {
  const user = await requireUser();
  const parsed = base.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const db = await getDb();
  const dup = await db.query.testCases.findFirst({ where: and(eq(testCases.userId, user.id), eq(testCases.code, parsed.data.code)) });
  if (dup) return { error: `Test case ${parsed.data.code} already exists in your register.` };
  await db.insert(testCases).values({ ...parsed.data, userId: user.id });
  revalidatePath("/testing");
  return { ok: true };
}

const resultSchema = z.object({
  id: z.string().uuid(),
  actual: z.string().max(2000),
  status: z.enum(["not_run", "pass", "fail", "blocked"]),
  defectId: z.string().max(40),
  remarks: z.string().max(2000),
});

export async function recordTestResult(input: z.infer<typeof resultSchema>): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const parsed = resultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { id, ...rest } = parsed.data;
  if (rest.status === "fail" && !rest.defectId.trim()) return { ok: false, error: "A failed test needs a Defect ID." };
  await (await getDb())
    .update(testCases)
    .set(rest)
    .where(and(eq(testCases.id, id), eq(testCases.userId, user.id)));
  revalidatePath("/testing");
  return { ok: true };
}

export async function deleteTestCase(id: string) {
  const user = await requireUser();
  await (await getDb()).delete(testCases).where(and(eq(testCases.id, z.string().uuid().parse(id)), eq(testCases.userId, user.id)));
  revalidatePath("/testing");
}
