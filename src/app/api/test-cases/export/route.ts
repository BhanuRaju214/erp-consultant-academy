import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { testCases } from "@/lib/db/schema";
import { toCsv } from "@/lib/import/csv";

const COLUMNS: [string, keyof typeof testCases.$inferSelect][] = [
  ["Test Case ID", "code"],
  ["Requirement ID", "requirementId"],
  ["Module", "module"],
  ["Scenario", "scenario"],
  ["Preconditions", "preconditions"],
  ["Test Data", "testData"],
  ["Steps", "steps"],
  ["Expected Result", "expected"],
  ["Actual Result", "actual"],
  ["Status", "status"],
  ["Defect ID", "defectId"],
  ["Remarks", "remarks"],
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await (await getDb()).select().from(testCases).where(eq(testCases.userId, user.id)).orderBy(asc(testCases.code));
  const header = COLUMNS.map(([h]) => h);
  const records = rows.map((r) => Object.fromEntries(COLUMNS.map(([h, k]) => [h, String(r[k] ?? "")])));
  return new NextResponse("﻿" + toCsv(header, records), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="test_register.csv"' },
  });
}
