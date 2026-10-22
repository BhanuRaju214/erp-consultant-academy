"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Trash2, Upload } from "lucide-react";
import { Badge, Callout, Field, buttonClass, inputClass } from "@/components/ui";

export interface MediaRow {
  id: string;
  kind: string;
  status: string;
  visibility: string;
  name: string;
  size: string;
  storage: string;
  snippet: string;
  error: string | null;
}

/** PUT with progress (fetch has no upload progress events). */
function putWithProgress(url: string, file: File, headers: Record<string, string>, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection (and the R2 bucket CORS rules)."));
    xhr.send(file);
  });
}

export function MediaUploader({ accept, muxEnabled }: { accept: string; muxEnabled: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("enrolled");
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<{ tone: "danger" | "success"; text: string } | null>(null);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setMessage({ tone: "danger", text: "Choose a file first." });
    setMessage(null);
    setProgress(0);
    try {
      const start = await fetch("/api/media/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, size: file.size, title, visibility }),
      });
      const plan = (await start.json()) as { id?: string; target?: string; uploadUrl?: string; headers?: Record<string, string>; error?: string };
      if (!start.ok || !plan.id || !plan.uploadUrl) throw new Error(plan.error ?? "Could not start the upload.");
      await putWithProgress(plan.uploadUrl, file, plan.headers ?? {}, setProgress);
      const done = await fetch(`/api/media/${plan.id}`, { method: "POST" });
      const result = (await done.json()) as { error?: string };
      if (!done.ok) throw new Error(result.error ?? "Upload could not be confirmed.");
      setMessage({
        tone: "success",
        text: plan.target === "mux" ? "Uploaded. Mux is processing the video; it becomes playable in a minute or two." : "Uploaded.",
      });
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setMessage({ tone: "danger", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setProgress(null);
    }
  }

  return (
    <form onSubmit={upload} className="space-y-4">
      {message && <Callout tone={message.tone}>{message.text}</Callout>}
      {!muxEnabled && (
        <Callout tone="warning">Mux is not configured, so videos are stored as plain files without adaptive streaming. Set the MUX_* variables to enable it.</Callout>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="File" htmlFor="media-file" hint="Images, PDFs, Office files, CSV, ZIP or video.">
          <input id="media-file" ref={fileRef} type="file" accept={accept} required className={inputClass} />
        </Field>
        <Field label="Title (optional)" htmlFor="media-title">
          <input id="media-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={inputClass} />
        </Field>
        <Field label="Who can view it" htmlFor="media-visibility">
          <select id="media-visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputClass}>
            <option value="enrolled">Enrolled learners (course content)</option>
            <option value="authenticated">Any signed-in user (e.g. course covers)</option>
            <option value="public">Anyone (public)</option>
            <option value="private">Trainers and admins only</option>
          </select>
        </Field>
      </div>
      <button type="submit" disabled={progress !== null} className={buttonClass("primary")}>
        <Upload className="h-4 w-4" aria-hidden />
        {progress !== null ? `Uploading… ${progress}%` : "Upload"}
      </button>
    </form>
  );
}

export function MediaTable({ rows }: { rows: MediaRow[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function copy(row: MediaRow) {
    await navigator.clipboard.writeText(row.snippet);
    setCopied(row.id);
    setTimeout(() => setCopied(null), 1500);
  }

  async function remove(row: MediaRow) {
    if (!confirm(`Delete "${row.name}"? Lessons that embed it will show it as unavailable.`)) return;
    setBusy(row.id);
    const res = await fetch(`/api/media/${row.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) alert(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Delete failed.");
    router.refresh();
  }

  if (rows.length === 0) return <p className="text-sm text-muted">No media uploaded yet.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold">Access</th>
            <th className="px-3 py-2 font-semibold">Size</th>
            <th className="px-3 py-2 font-semibold">Stored in</th>
            <th className="px-3 py-2 font-semibold">Embed in a lesson</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border align-top">
              <td className="px-3 py-2 text-fg [overflow-wrap:anywhere]">
                {r.status === "ready" && r.kind !== "video" ? (
                  <a href={`/media/${r.id}`} target="_blank" rel="noopener" className="text-primary hover:underline">
                    {r.name}
                  </a>
                ) : (
                  r.name
                )}
                {r.error && <div className="mt-1 text-xs text-danger">{r.error}</div>}
              </td>
              <td className="px-3 py-2 capitalize text-muted">{r.kind}</td>
              <td className="px-3 py-2">
                <Badge tone={r.status === "ready" ? "success" : r.status === "errored" ? "danger" : "warning"}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2 text-muted">{r.visibility}</td>
              <td className="px-3 py-2 whitespace-nowrap text-muted">{r.size}</td>
              <td className="px-3 py-2 text-muted">{r.storage}</td>
              <td className="px-3 py-2">
                <button type="button" onClick={() => copy(r)} className={buttonClass("secondary", "px-2 py-1 text-xs")}>
                  {copied === r.id ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied === r.id ? "Copied" : "Copy markdown"}
                </button>
              </td>
              <td className="px-3 py-2">
                <button type="button" onClick={() => remove(r)} disabled={busy === r.id} className={buttonClass("ghost", "px-2 py-1")} aria-label={`Delete ${r.name}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
