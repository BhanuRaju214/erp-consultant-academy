import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { readUpload } from "@/lib/storage";

/** Streams a submission attachment to its owner or to trainers/admins only. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const sub = await (await getDb()).query.submissions.findFirst({ where: eq(submissions.id, id) });
  if (!sub?.filePath || (sub.userId !== user.id && !can(user.role, "trainer:review"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const buf = await readUpload(sub.filePath);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${(sub.fileName ?? "attachment").replace(/["\\\r\n]/g, "_")}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing from storage" }, { status: 404 });
  }
}
