import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { docResources } from "@/lib/db/schema";
import { Markdown } from "@/components/markdown";
import { PrintButton } from "@/components/print-button";
import { Badge, PageHeader } from "@/components/ui";

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser();
  const doc = await (await getDb()).query.docResources.findFirst({ where: eq(docResources.slug, slug) });
  if (!doc) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow={<Link href="/docs">Documentation Library</Link>} title={doc.title} description={doc.summary} actions={<PrintButton />} />
      <Badge className="mb-6">{doc.category}</Badge>
      <Markdown className="max-w-none">{doc.body}</Markdown>
    </div>
  );
}
