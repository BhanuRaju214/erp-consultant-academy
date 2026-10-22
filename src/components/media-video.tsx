"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Clapperboard } from "lucide-react";

type Info =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "pending" | "errored"; title: string; error?: string | null }
  | { status: "ready"; title: string; player: "mux"; playbackId: string; tokens: { playback: string; thumbnail: string; storyboard: string } }
  | { status: "ready"; title: string; player: "file"; src: string };

/** Lesson video embedded with a ```media-video fence. Signed tokens are fetched per view. */
export function MediaVideo({ id }: { id: string }) {
  const [info, setInfo] = useState<Info>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { cache: "no-store" }).catch(() => null);
      if (cancelled) return;
      if (!res?.ok) return setInfo({ status: "missing" });
      const data = (await res.json()) as Info;
      setInfo(data);
      // Keep checking while Mux is still encoding.
      if (data.status === "pending") timer = setTimeout(load, 5000);
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  const frame = "not-prose my-6 overflow-hidden rounded-xl border border-border bg-black";
  if (info.status === "ready" && info.player === "mux") {
    return (
      <figure className={frame}>
        <MuxPlayer
          playbackId={info.playbackId}
          tokens={info.tokens}
          metadata={{ video_id: id, video_title: info.title }}
          accentColor="var(--primary)"
          style={{ aspectRatio: "16 / 9", width: "100%" }}
        />
      </figure>
    );
  }
  if (info.status === "ready" && info.player === "file") {
    return (
      <figure className={frame}>
        <video src={info.src} controls preload="metadata" className="aspect-video w-full" aria-label={info.title} />
      </figure>
    );
  }
  const message =
    info.status === "loading"
      ? "Loading video…"
      : info.status === "pending"
        ? "This video is still processing. It will appear here automatically."
        : info.status === "errored"
          ? `This video could not be processed${info.error ? `: ${info.error}` : "."}`
          : "Video unavailable.";
  return (
    <div className="not-prose my-6 flex aspect-video items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-sm text-muted">
      <Clapperboard className="h-5 w-5" aria-hidden /> {message}
    </div>
  );
}
