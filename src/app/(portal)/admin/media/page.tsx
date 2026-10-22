import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { MUX_STATUS_API, muxEnabled } from "@/lib/mux";
import { storageDriver } from "@/lib/storage";
import { ACCEPTED_EXTENSIONS, embedSnippet, listMediaAssets, syncPendingMuxAsset } from "@/lib/services/media";
import { MediaTable, MediaUploader, type MediaRow } from "@/components/media-library";
import { Callout, Card, CardTitle, PageHeader } from "@/components/ui";

export const metadata = { title: "Media library" };
export const dynamic = "force-dynamic";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default async function MediaLibraryPage() {
  await requirePermission("media:manage");
  const db = await getDb();
  let assets = await listMediaAssets(db);
  // Without a reachable webhook (e.g. local development), refresh processing videos from Mux.
  if (muxEnabled() && assets.some((a) => a.storage === "mux" && a.status === "pending")) {
    assets = await Promise.all(assets.map((a) => syncPendingMuxAsset(db, a, MUX_STATUS_API).catch(() => a)));
  }
  const rows: MediaRow[] = assets.map((a) => ({
    id: a.id,
    kind: a.kind,
    status: a.status,
    visibility: a.visibility,
    name: a.title || a.fileName,
    size: a.durationSeconds ? `${Math.floor(a.durationSeconds / 60)}:${String(a.durationSeconds % 60).padStart(2, "0")} min` : formatSize(a.sizeBytes),
    storage: a.storage === "r2" ? "Cloudflare R2" : a.storage === "mux" ? "Mux" : "Local disk",
    snippet: embedSnippet(a),
    error: a.error,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        compact
        title="Media library"
        description="Upload images, documents and videos once, then embed them in any lesson by pasting the copied markdown into the lesson editor."
      />
      {storageDriver() === "local" && (
        <Callout tone="warning" title="Development storage">
          R2 is not configured, so files are saved to the local disk. Set the R2_* variables before going live.
        </Callout>
      )}
      <Card>
        <CardTitle>Upload</CardTitle>
        <div className="mt-3">
          <MediaUploader accept={ACCEPTED_EXTENSIONS.join(",")} muxEnabled={muxEnabled()} />
        </div>
      </Card>
      <Card>
        <CardTitle>All media</CardTitle>
        <div className="mt-3">
          <MediaTable rows={rows} />
        </div>
      </Card>
    </div>
  );
}
