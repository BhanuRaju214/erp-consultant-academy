"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Mic, MonitorUp, Square, Upload, Video } from "lucide-react";
import { MAX_ANSWER_SECONDS, MAX_PRESENTATION_SECONDS, MIN_PRESENTATION_SECONDS, formatDuration } from "@/lib/evaluation/rubric";
import { Callout, buttonClass, cn } from "./ui";

export interface StudioEvaluation {
  id: string;
  status: "recording" | "questions" | "awaiting_trainer" | "approved" | "needs_revision";
  slidesName: string | null;
  hasRecording: boolean;
  questions: { question: string; answered: boolean; transcript: string | null }[];
}

const pick = (types: string[]) => types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
const extOf = (mime: string) => (mime.includes("mp4") ? ".mp4" : mime.includes("ogg") ? ".ogg" : ".webm");

/** PUTs a blob to the streaming upload route, reporting progress. */
function upload(params: Record<string, string>, blob: Blob, onProgress: (pct: number) => void): Promise<{ ok?: boolean; transcript?: string; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/api/evaluation/upload?${new URLSearchParams(params)}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch {
        resolve({ error: `Upload failed (HTTP ${xhr.status}).` });
      }
    };
    xhr.onerror = () => resolve({ error: "Network error during upload. Check your connection and try again." });
    xhr.send(blob);
  });
}

async function postAction(action: "start" | "process" | "submit", extra: object = {}) {
  const res = await fetch("/api/evaluation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  return res.ok ? { ok: true as const } : { ok: false as const, error: json.error ?? `Request failed (HTTP ${res.status}).` };
}

function useBeforeUnload(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [active]);
}

export function StartEvaluationButton({ label = "Start the final evaluation" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-2">
      {error && <Callout tone="danger">{error}</Callout>}
      <button
        className={buttonClass("primary")}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const r = await postAction("start");
          setBusy(false);
          if (r.ok) router.refresh();
          else setError(r.error);
        }}
      >
        {busy ? "Starting…" : label}
      </button>
    </div>
  );
}

export function EvaluationStudio({ evaluation }: { evaluation: StudioEvaluation }) {
  if (evaluation.status === "recording") return <PresentationStep evaluation={evaluation} />;
  if (evaluation.status === "questions") return <QuestionsStep evaluation={evaluation} />;
  return null;
}

/* ------------------------------------------------------------------ */
/* Step 1–2: slides + recorded presentation                            */
/* ------------------------------------------------------------------ */

type Recording = { video: Blob; audio: Blob; camera: Blob | null; seconds: number; url: string };

function PresentationStep({ evaluation }: { evaluation: StudioEvaluation }) {
  const router = useRouter();
  const [slidesPct, setSlidesPct] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [withCamera, setWithCamera] = useState(true);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<Recording | null>(null);
  const [stage, setStage] = useState<"" | "uploading" | "processing">("");
  const [pct, setPct] = useState(0);
  const screenPreview = useRef<HTMLVideoElement>(null);
  const camPreview = useRef<HTMLVideoElement>(null);
  const session = useRef<{ recorders: MediaRecorder[]; streams: MediaStream[]; started: number; timer: number } | null>(null);
  useBeforeUnload(recording || stage !== "");

  useEffect(() => () => stopAll(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopAll() {
    const s = session.current;
    if (!s) return;
    window.clearInterval(s.timer);
    for (const r of s.recorders) if (r.state !== "inactive") r.stop();
    for (const st of s.streams) st.getTracks().forEach((t) => t.stop());
    session.current = null;
    setRecording(false);
  }

  async function uploadSlides(file: File) {
    setError("");
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    setSlidesPct(0);
    const r = await upload({ kind: "slides", ext, name: file.name }, file, setSlidesPct);
    setSlidesPct(null);
    if (r.error) setError(r.error);
    else router.refresh();
  }

  async function start() {
    setError("");
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    let screen: MediaStream, mic: MediaStream;
    try {
      screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false });
    } catch {
      setError("Screen sharing was cancelled. Share the window or screen that shows your slides.");
      return;
    }
    try {
      mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: withCamera ? { width: 320, height: 240, frameRate: 15 } : false,
      });
    } catch {
      screen.getTracks().forEach((t) => t.stop());
      setError("Allow access to your microphone" + (withCamera ? " and camera" : "") + " to record the presentation.");
      return;
    }
    const micTrack = mic.getAudioTracks()[0]!;
    const camTrack = mic.getVideoTracks()[0];
    if (screenPreview.current) screenPreview.current.srcObject = screen;
    if (camPreview.current) camPreview.current.srcObject = camTrack ? new MediaStream([camTrack]) : null;

    const chunks = { video: [] as Blob[], audio: [] as Blob[], camera: [] as Blob[] };
    const videoMime = pick(["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]);
    const audioMime = pick(["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]);
    const camMime = pick(["video/webm;codecs=vp8", "video/webm", "video/mp4"]);
    const main = new MediaRecorder(new MediaStream([screen.getVideoTracks()[0]!, micTrack]), { mimeType: videoMime, videoBitsPerSecond: 1_000_000, audioBitsPerSecond: 64_000 });
    const voiceStream = new MediaStream([micTrack.clone()]);
    const voice = new MediaRecorder(voiceStream, { mimeType: audioMime, audioBitsPerSecond: 32_000 });
    const cam = camTrack ? new MediaRecorder(new MediaStream([camTrack]), { mimeType: camMime, videoBitsPerSecond: 250_000 }) : null;
    main.ondataavailable = (e) => e.data.size && chunks.video.push(e.data);
    voice.ondataavailable = (e) => e.data.size && chunks.audio.push(e.data);
    if (cam) cam.ondataavailable = (e) => e.data.size && chunks.camera.push(e.data);

    const started = performance.now();
    main.onstop = () => {
      const seconds = (performance.now() - started) / 1000;
      // The other recorders flush their last chunk on the same tick; wait one macrotask before assembling.
      window.setTimeout(() => {
        const video = new Blob(chunks.video, { type: main.mimeType || videoMime });
        setResult({
          video,
          audio: new Blob(chunks.audio, { type: voice.mimeType || audioMime }),
          camera: cam ? new Blob(chunks.camera, { type: cam.mimeType || camMime }) : null,
          seconds,
          url: URL.createObjectURL(video),
        });
      }, 300);
    };
    screen.getVideoTracks()[0]!.onended = () => stopAll();
    const recorders = [main, voice, ...(cam ? [cam] : [])];
    recorders.forEach((r) => r.start(1000));
    const timer = window.setInterval(() => {
      const s = (performance.now() - started) / 1000;
      setElapsed(s);
      if (s >= MAX_PRESENTATION_SECONDS) stopAll();
    }, 500);
    session.current = { recorders, streams: [screen, mic, voiceStream], started, timer };
    setElapsed(0);
    setRecording(true);
  }

  async function submitRecording() {
    if (!result) return;
    setError("");
    setStage("uploading");
    const parts: [string, Blob][] = [["audio", result.audio], ["video", result.video], ...(result.camera ? ([["camera", result.camera]] as [string, Blob][]) : [])];
    for (const [i, [kind, blob]] of parts.entries()) {
      const r = await upload({ kind, ext: extOf(blob.type) }, blob, (p) => setPct(Math.round(((i + p / 100) / parts.length) * 100)));
      if (r.error) {
        setStage("");
        setError(r.error);
        return;
      }
    }
    setStage("processing");
    const r = await postAction("process", { clientDurationSec: Math.round(result.seconds) });
    setStage("");
    if (!r.ok) setError(r.error);
    else router.refresh();
  }

  const tooShort = result !== null && result.seconds < MIN_PRESENTATION_SECONDS;
  const remaining = Math.max(0, MIN_PRESENTATION_SECONDS - elapsed);

  return (
    <div className="space-y-6">
      {error && <Callout tone="danger">{error}</Callout>}

      <section className="rounded-xl border border-border p-4">
        <h3 className="flex items-center gap-2 font-semibold text-fg">
          {evaluation.slidesName ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted" />} Step 1 · Upload your slides
        </h3>
        <p className="mt-1 text-sm text-muted">PowerPoint (.pptx) or PDF, up to 50 MB. Cover every real-time project: the client, requirements, your Odoo solution, data migration, testing and go-live, and what you learnt.</p>
        {evaluation.slidesName && (
          <p className="mt-2 text-sm">
            Uploaded: <a className="font-medium text-primary hover:underline" href={`/api/evaluation/${evaluation.id}/media?kind=slides`}>{evaluation.slidesName}</a>
          </p>
        )}
        <label className={cn(buttonClass("secondary"), "mt-3 cursor-pointer")}>
          <Upload className="h-4 w-4" /> {slidesPct !== null ? `Uploading… ${slidesPct}%` : evaluation.slidesName ? "Replace slides" : "Choose slides"}
          <input type="file" accept=".pptx,.ppt,.pdf" className="sr-only" disabled={slidesPct !== null} onChange={(e) => e.target.files?.[0] && uploadSlides(e.target.files[0])} />
        </label>
      </section>

      <section className={cn("rounded-xl border border-border p-4", !evaluation.slidesName && "opacity-60")}>
        <h3 className="flex items-center gap-2 font-semibold text-fg">
          <Circle className="h-4 w-4 text-muted" /> Step 2 · Record your presentation (at least {formatDuration(MIN_PRESENTATION_SECONDS)})
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Open your slides in slideshow mode, click <strong>Start recording</strong> and share that window or your whole screen.</li>
          <li>Talk us through every project for at least 10 minutes (maximum {MAX_PRESENTATION_SECONDS / 60}). Your microphone{withCamera ? " and webcam are" : " is"} recorded.</li>
          <li>Use a quiet room and fictional project data only. Stop sharing or click <strong>Stop</strong> when you finish.</li>
        </ul>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={withCamera} disabled={recording} onChange={(e) => setWithCamera(e.target.checked)} /> Include my webcam
        </label>

        <div className={cn("mt-3 grid gap-3 sm:grid-cols-[1fr_12rem]", !recording && "hidden")}>
          <video ref={screenPreview} autoPlay muted playsInline className="aspect-video w-full rounded-lg bg-black" />
          <video ref={camPreview} autoPlay muted playsInline className={cn("aspect-[4/3] w-full rounded-lg bg-black", !withCamera && "hidden")} />
        </div>

        {recording ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-danger-soft px-3 py-1 text-sm font-semibold text-danger">
              <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> REC {formatDuration(elapsed)}
            </span>
            <span className="text-sm text-muted">{remaining > 0 ? `${formatDuration(remaining)} to go before the 10-minute minimum` : "Minimum reached. Finish when you are ready."}</span>
            <button className={buttonClass("secondary")} onClick={stopAll}>
              <Square className="h-4 w-4" /> Stop
            </button>
          </div>
        ) : (
          <button className={cn(buttonClass("primary"), "mt-3")} disabled={!evaluation.slidesName || stage !== ""} onClick={start}>
            <MonitorUp className="h-4 w-4" /> {result ? "Record again" : "Start recording"}
          </button>
        )}

        {result && !recording && (
          <div className="mt-4 space-y-3">
            <video src={result.url} controls className="aspect-video w-full rounded-lg bg-black" />
            <p className="text-sm">
              Length: <strong>{formatDuration(result.seconds)}</strong> · {(result.video.size / 1024 / 1024).toFixed(0)} MB
            </p>
            {tooShort ? (
              <Callout tone="warning">This recording is shorter than {formatDuration(MIN_PRESENTATION_SECONDS)}. Record the presentation again; it must be at least 10 minutes.</Callout>
            ) : (
              <button className={buttonClass("primary")} disabled={stage !== ""} onClick={submitRecording}>
                <Upload className="h-4 w-4" />
                {stage === "uploading" ? `Uploading… ${pct}%` : stage === "processing" ? "The AI examiner is listening to your presentation…" : "Upload and continue to the questions"}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3: AI follow-up questions answered by voice                    */
/* ------------------------------------------------------------------ */

function QuestionsStep({ evaluation }: { evaluation: StudioEvaluation }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useBeforeUnload(submitting);
  const nextOpen = evaluation.questions.findIndex((q) => !q.answered);
  const allAnswered = nextOpen === -1;

  return (
    <div className="space-y-4">
      {error && <Callout tone="danger">{error}</Callout>}
      <Callout tone="info" title="Step 3 · Answer the examiner's questions">
        The AI examiner listened to your presentation and has {evaluation.questions.length} questions. Each one appears after you answer the previous one. Answer aloud like in a client
        interview: up to {MAX_ANSWER_SECONDS / 60} minutes each. You can re-record an answer before you submit.
      </Callout>
      <ol className="space-y-3">
        {evaluation.questions.map((q, i) =>
          i > nextOpen && !allAnswered ? null : (
            <li key={i} className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Question {i + 1} of {evaluation.questions.length}</p>
              <p className="mt-1 font-medium text-fg">{q.question}</p>
              {q.answered && (
                <div className="mt-3 space-y-2">
                  <audio controls preload="none" src={`/api/evaluation/${evaluation.id}/media?kind=answer&q=${i}`} className="w-full" />
                  {q.transcript && <p className="rounded-lg bg-surface-2 p-3 text-sm text-muted">“{q.transcript}”</p>}
                </div>
              )}
              <AnswerRecorder index={i} answered={q.answered} onDone={() => router.refresh()} onError={setError} />
            </li>
          ),
        )}
      </ol>
      {allAnswered && (
        <button
          className={buttonClass("primary")}
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setError("");
            const r = await postAction("submit");
            setSubmitting(false);
            if (r.ok) router.refresh();
            else setError(r.error);
          }}
        >
          {submitting ? "The AI examiner is scoring your evaluation…" : "Submit for evaluation"}
        </button>
      )}
    </div>
  );
}

function AnswerRecorder({ index, answered, onDone, onError }: { index: number; answered: boolean; onDone: () => void; onError: (e: string) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "uploading">("idle");
  const [elapsed, setElapsed] = useState(0);
  const rec = useRef<{ recorder: MediaRecorder; stream: MediaStream; timer: number } | null>(null);
  useBeforeUnload(state !== "idle");
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function stop() {
    const r = rec.current;
    if (!r) return;
    window.clearInterval(r.timer);
    if (r.recorder.state !== "inactive") r.recorder.stop();
    r.stream.getTracks().forEach((t) => t.stop());
    rec.current = null;
  }

  async function start() {
    onError("");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      onError("Allow access to your microphone to answer.");
      return;
    }
    const mime = pick(["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]);
    const recorder = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32_000 });
    const chunks: Blob[] = [];
    const started = performance.now();
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      const seconds = (performance.now() - started) / 1000;
      if (seconds < 5) {
        setState("idle");
        onError("That answer was too short. Record it again.");
        return;
      }
      setState("uploading");
      const blob = new Blob(chunks, { type: recorder.mimeType || mime });
      const r = await upload({ kind: "answer", ext: extOf(blob.type), q: String(index) }, blob, () => {});
      setState("idle");
      if (r.error) onError(r.error);
      else onDone();
    };
    recorder.start(1000);
    const timer = window.setInterval(() => {
      const s = (performance.now() - started) / 1000;
      setElapsed(s);
      if (s >= MAX_ANSWER_SECONDS) stop();
    }, 500);
    rec.current = { recorder, stream, timer };
    setElapsed(0);
    setState("recording");
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {state === "recording" ? (
        <>
          <span className="inline-flex items-center gap-2 rounded-full bg-danger-soft px-3 py-1 text-sm font-semibold text-danger">
            <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> {formatDuration(elapsed)} / {formatDuration(MAX_ANSWER_SECONDS)}
          </span>
          <button className={buttonClass("secondary")} onClick={stop}>
            <Square className="h-4 w-4" /> Finish answer
          </button>
        </>
      ) : (
        <button className={buttonClass(answered ? "secondary" : "primary")} disabled={state === "uploading"} onClick={start}>
          {answered ? <Video className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {state === "uploading" ? "Saving and transcribing…" : answered ? "Re-record answer" : "Record answer"}
        </button>
      )}
    </div>
  );
}
