"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { VisualData } from "@/lib/visuals/schemas";
import { cn } from "../ui";
import { VisualIcon } from "./icons";
import { InlineMd, VisualFrame, toneBg, type Tone } from "./static-blocks";
import { TimelineStage } from "./story-timeline";

type Story = VisualData<"story">;

/* Isometric projection of the 4×4 grid: one step in x goes right-down, one step in y goes left-down. */
const ISO_X = 62;
const ISO_Y = 36;
const iso = (x = 0, y = 0) => ({ sx: (x - y) * ISO_X, sy: (x + y) * ISO_Y });
const labelW = (label: string) => Math.max(116, label.length * 6.4 + 18);
/** Fit the drawing to the stations: room for labels at the sides, the parcel label above, names below. */
function viewFor(stations: Story["stations"]) {
  const pts = stations.map((st) => iso(st.x, st.y));
  const minX = Math.min(...pts.map((p) => p.sx)) - 110;
  const maxX = Math.max(...pts.map((p) => p.sx)) + 110;
  const minY = Math.min(...pts.map((p) => p.sy)) - 150;
  const maxY = Math.max(...pts.map((p) => p.sy)) + 100;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** An isometric block: top diamond plus two shaded side faces. */
function Block({ sx, sy, a, b, h, active, done, fill }: { sx: number; sy: number; a: number; b: number; h: number; active: boolean; done: boolean; fill?: string }) {
  const top = `${sx},${sy - h - b} ${sx + a},${sy - h} ${sx},${sy - h + b} ${sx - a},${sy - h}`;
  const left = `${sx - a},${sy - h} ${sx},${sy - h + b} ${sx},${sy + b} ${sx - a},${sy}`;
  const right = `${sx},${sy - h + b} ${sx + a},${sy - h} ${sx + a},${sy} ${sx},${sy + b}`;
  const base = fill ?? (active ? "var(--primary)" : done ? "var(--primary-soft)" : "var(--surface)");
  return (
    <g style={{ transition: "all 600ms ease" }}>
      <polygon points={left} fill={base} stroke="var(--border)" strokeWidth={0.8} />
      <polygon points={left} fill="#000" opacity={active ? 0.3 : 0.12} />
      <polygon points={right} fill={base} stroke="var(--border)" strokeWidth={0.8} />
      <polygon points={right} fill="#000" opacity={active ? 0.15 : 0.05} />
      <polygon points={top} fill={base} stroke={active ? "var(--primary)" : "var(--border)"} strokeWidth={0.8} />
    </g>
  );
}

/** Small isometric truck: cargo box, cab in the direction of travel, four wheels, dust while moving. */
function Truck({ dx, dy, moving, reduced }: { dx: number; dy: number; moving: boolean; reduced: boolean }) {
  const px = -dy;
  const py = dx;
  const wheels = [
    [dx * 11 + px * 7, dy * 11 + py * 7],
    [dx * 11 - px * 7, dy * 11 - py * 7],
    [-dx * 11 + px * 7, -dy * 11 + py * 7],
    [-dx * 11 - px * 7, -dy * 11 - py * 7],
  ];
  const cargo = <Block key="cargo" sx={-dx * 5} sy={-dy * 5} a={15} b={9} h={15} active done={false} />;
  const cab = <Block key="cab" sx={dx * 14} sy={dy * 14} a={8} b={5} h={10} active={false} done={false} fill="var(--accent)" />;
  return (
    <g>
      {moving && !reduced && (
        <g className="story-dust" aria-hidden>
          <circle cx={-dx * 26} cy={-dy * 26 + 2} r={5} fill="var(--muted)" opacity={0.25} />
          <circle cx={-dx * 34 + 4} cy={-dy * 34 - 2} r={3.5} fill="var(--muted)" opacity={0.18} />
        </g>
      )}
      <ellipse cx={0} cy={4} rx={26} ry={12} fill="#000" opacity={0.12} />
      {wheels.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y + 2} rx={4} ry={2.6} fill="#1f2937" />
      ))}
      {dy > 0 ? [cargo, cab] : [cab, cargo]}
    </g>
  );
}

export function StoryPlayer({ data }: { data: Story }) {
  const reduced = usePrefersReducedMotion();
  const pace = data.pace ?? 7;
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [tokenAt, setTokenAt] = useState<{ x: number; y: number; moving: boolean; dx: number; dy: number }>({ x: 0, y: 0, moving: false, dx: 0.86, dy: 0.5 });
  const [arrived, setArrived] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const byId = Object.fromEntries(data.stations.map((s) => [s.id, s]));
  const current = data.scenes[scene];
  const target = byId[current.to];
  const tokenKind = current.token ?? data.token ?? "box";
  const travelSeconds = Math.min(2.2, pace * 0.35);
  const visited = new Set(data.scenes.slice(0, scene + 1).flatMap((s) => [s.to, s.from ?? s.to]));

  // Move the token: jump to the origin, then glide to the destination on the next frame.
  // Trucks stop at the building's door instead of driving into it.
  useEffect(() => {
    const to = iso(byId[current.to].x, byId[current.to].y);
    const fromSt = current.from && current.from !== current.to ? byId[current.from] : undefined;
    const from = fromSt ? iso(fromSt.x, fromSt.y) : { sx: to.sx - 60, sy: to.sy + 35 };
    const len = Math.hypot(to.sx - from.sx, to.sy - from.sy) || 1;
    const dx = (to.sx - from.sx) / len;
    const dy = (to.sy - from.sy) / len;
    const truck = tokenKind === "truck";
    const end = truck ? { x: to.sx - dx * 74, y: to.sy - dy * 74 } : { x: to.sx, y: to.sy };
    if (!fromSt || reduced) {
      setTokenAt({ ...end, moving: false, dx, dy });
      setArrived(true);
      return;
    }
    setArrived(false);
    setTokenAt({ x: from.sx + (truck ? dx * 74 : 0), y: from.sy + (truck ? dy * 74 : 0), moving: false, dx, dy });
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setTokenAt({ ...end, moving: true, dx, dy })));
    const done = window.setTimeout(() => setArrived(true), travelSeconds * 1000 + 150);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, reduced]);

  const go = useCallback(
    (i: number) => {
      setScene(Math.max(0, Math.min(data.scenes.length - 1, i)));
      setElapsed(0);
      setSpeechEnd(null);
      setFinished(false);
      setStarted(true);
    },
    [data.scenes.length],
  );

  // Narration uses the browser's built-in speech synthesis: no external service, nothing leaves the device.
  const [speechOk, setSpeechOk] = useState(false);
  const [narrate, setNarrate] = useState(true);
  const [speechEnd, setSpeechEnd] = useState<number | null>(null);
  const [sentence, setSentence] = useState(0);
  const [spokenParts, setSpokenParts] = useState<string[]>([]);
  const elapsedRef = useRef(0);
  const introDone = useRef(false);
  elapsedRef.current = elapsed;
  useEffect(() => {
    setSpeechOk(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    try {
      if (localStorage.getItem("story-narration") === "off") setNarrate(false);
    } catch {
      /* storage unavailable: keep the default */
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  const narrating = speechOk && narrate;
  const spoken = (i: number) => {
    const s = data.scenes[i];
    const body = s.say ?? `${s.title}. ${s.text.replace(/\*\*|\*|`/g, "")}`;
    return body;
  };
  const sentences = (t: string) => t.match(/[^.!?]+[.!?]*/g)?.map((p) => p.trim()).filter(Boolean) ?? [t];
  const subtitle = scene === 0 && data.intro && !introDone.current ? `${data.intro} ${spoken(0)}` : spoken(scene);

  useEffect(() => {
    if (!narrating || !playing) {
      if (speechOk) window.speechSynthesis.cancel();
      return;
    }
    let alive = true;
    const synth = window.speechSynthesis;
    synth.cancel();
    const text = scene === 0 && data.intro && !introDone.current ? `${data.intro} ${spoken(0)}` : spoken(scene);
    if (scene === 0) introDone.current = true;
    // Speak sentence by sentence: some engines stop long utterances after about 15 seconds.
    const voices = synth.getVoices();
    const voice = voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang === "en-GB") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
    const parts = sentences(text);
    setSpeechEnd(null);
    setSentence(0);
    setSpokenParts(parts);
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.voice = voice;
      u.rate = 1;
      u.onstart = () => alive && setSentence(i);
      if (i === parts.length - 1) {
        u.onend = () => alive && setSpeechEnd(elapsedRef.current);
        u.onerror = () => alive && setSpeechEnd(elapsedRef.current);
      }
      synth.speak(u);
    });
    return () => {
      alive = false;
      synth.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, playing, narrating]);

  // Playback clock. With narration on, a step ends shortly after its explanation finishes.
  const estimate = narrating ? Math.max(4, subtitle.split(/\s+/).length / 2.6 + 1) : pace;
  useEffect(() => {
    if (!playing) return;
    // Twice a second is enough for the clock; the progress bar animates smoothly in between with CSS.
    const t = setInterval(() => setElapsed((e) => e + 0.5), 500);
    return () => clearInterval(t);
  }, [playing]);
  useEffect(() => {
    if (!playing) return;
    // Fallback: if the speech engine never reports the end, move on after a generous estimate.
    const ready = narrating ? (speechEnd !== null && elapsed >= Math.max(speechEnd + 0.9, 3)) || elapsed >= estimate * 1.8 + 2 : elapsed >= pace;
    if (!ready) return;
    if (scene >= data.scenes.length - 1) {
      setPlaying(false);
      setFinished(true);
    } else {
      setScene(scene + 1);
      setElapsed(0);
      setSpeechEnd(null);
    }
  }, [elapsed, speechEnd, playing, narrating, pace, scene, data.scenes.length]);

  const toggleNarration = () => {
    setNarrate((n) => {
      try {
        localStorage.setItem("story-narration", n ? "off" : "on");
      } catch {
        /* ignore */
      }
      return !n;
    });
    setElapsed(0);
  };

  useEffect(() => {
    const on = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const toggle = () => {
    if (finished) {
      go(0);
      setPlaying(true);
      return;
    }
    setStarted(true);
    setPlaying((p) => !p);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageRef.current?.requestFullscreen?.();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLButtonElement && e.key === " ") return;
    if (e.key === "ArrowRight") go(scene + 1);
    else if (e.key === "ArrowLeft") go(scene - 1);
    else if (e.key === " " || e.key === "k") {
      e.preventDefault();
      toggle();
    } else return;
  };

  // Camera: tilt the board and pan gently towards the active station.
  const timeline = data.layout === "timeline";
  const VIEW = viewFor(data.stations);
  const grid = Math.max(4, ...data.stations.map((st) => Math.max(st.x ?? 0, st.y ?? 0) + 1));
  const t = iso(target.x, target.y);
  const camX = reduced ? 0 : (-(t.sx - (VIEW.x + VIEW.w / 2)) / VIEW.w) * 10;
  const camY = reduced ? 0 : (-(t.sy - (VIEW.y + VIEW.h / 2)) / VIEW.h) * 8;
  const camera = `rotateX(${reduced ? 0 : 14}deg) scale(${started && !reduced ? 1.03 : 1}) translate(${camX}%, ${camY}%)`;

  // Roads: every distinct pair of stations a scene travels between.
  // The highlighted road stays on the last handover while a step happens inside one department.
  const lastMove = data.scenes.slice(0, scene + 1).reverse().find((s) => s.from && s.from !== s.to);
  const liveKey = lastMove ? [lastMove.from!, lastMove.to].sort().join("|") : "";
  const roads = [...new Set(data.scenes.filter((s) => s.from && s.from !== s.to).map((s) => [s.from!, s.to].sort().join("|")))].map((k) => k.split("|"));
  const stepFill = finished ? 1 : narrating && speechEnd !== null ? 1 : Math.min(narrating ? 0.97 : 1, elapsed / estimate);
  const progress = (scene + stepFill) / data.scenes.length;

  const dr = current.entries.filter((e) => e.debit);
  const cr = current.entries.filter((e) => e.credit);

  return (
    <VisualFrame kind="Scenario video" title={data.title} bodyClassName="p-0 sm:p-0">
      <div ref={stageRef} className={cn("bg-surface outline-none", fullscreen && "flex h-full flex-col overflow-auto")} onKeyDown={onKey}>
        {/* Stage */}
        <div className={cn("relative grid lg:grid-cols-[1.15fr_1fr]", fullscreen ? "min-h-0 flex-1" : "lg:aspect-[16/9]")}>
          <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-primary-soft/70 to-surface sm:aspect-[4/3] lg:aspect-auto">
          {timeline ? (
            <TimelineStage data={data} scene={scene} finished={finished} started={started} reduced={reduced} label={`${data.title}: step ${scene + 1} of ${data.scenes.length}, ${current.title}`} />
          ) : (
          <div className="absolute inset-0" style={{ perspective: "1100px" }}>
            <div className="h-full w-full" style={{ transform: camera, transformOrigin: "50% 60%", transition: reduced ? undefined : "transform 1.4s cubic-bezier(.4,0,.2,1)" }}>
              <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="h-full w-full" role="img" aria-label={`${data.title}: animated scene ${scene + 1} of ${data.scenes.length}, ${current.title}`}>
                {/* Ground tiles */}
                {Array.from({ length: grid * grid }, (_, i) => {
                  const { sx, sy } = iso(i % grid, Math.floor(i / grid));
                  return (
                    <polygon
                      key={i}
                      points={`${sx},${sy - ISO_Y} ${sx + ISO_X},${sy} ${sx},${sy + ISO_Y} ${sx - ISO_X},${sy}`}
                      fill="var(--surface)"
                      stroke="var(--border)"
                      strokeWidth={1}
                      opacity={0.75}
                    />
                  );
                })}
                {/* Roads */}
                {roads.map(([a, b]) => {
                  const p = iso(byId[a].x, byId[a].y);
                  const q = iso(byId[b].x, byId[b].y);
                  const live = liveKey === [a, b].join("|");
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={p.sx}
                      y1={p.sy}
                      x2={q.sx}
                      y2={q.sy}
                      stroke={live ? "var(--accent)" : "var(--border)"}
                      strokeWidth={live ? 4 : 3}
                      strokeDasharray={live ? "10 6" : "2 7"}
                      strokeLinecap="round"
                      className={live && !reduced ? "story-road" : undefined}
                    />
                  );
                })}
                {/* Stations, back to front so nearer blocks overlap farther ones */}
                {[...data.stations]
                  .sort((m, n) => (m.x ?? 0) + (m.y ?? 0) - ((n.x ?? 0) + (n.y ?? 0)))
                  .map((s) => {
                    const { sx, sy } = iso(s.x, s.y);
                    const active = s.id === current.to;
                    const h = active ? 46 : 26;
                    return (
                      <g key={s.id}>
                        {active && !reduced && <ellipse cx={sx} cy={sy + 4} rx={52} ry={30} fill="var(--primary)" opacity={0.18} className="story-pulse" />}
                        <Block sx={sx} sy={sy} a={40} b={23} h={h} active={active} done={visited.has(s.id)} />
                        <VisualIcon
                          name={s.icon ?? "building"}
                          className={cn("transition-colors", active ? "text-white" : "text-primary")}
                          box={{ x: sx - 11, y: sy - h - 11, size: 22 }}
                        />
                      </g>
                    );
                  })}
                {/* Labels on top so nearer blocks never hide them */}
                {data.stations.map((s) => {
                  const { sx, sy } = iso(s.x, s.y);
                  const active = s.id === current.to;
                  return (
                    <g key={s.id} style={{ pointerEvents: "none" }}>
                  <g transform={`translate(${sx}, ${sy + 38})`}>
                    <rect x={-labelW(s.label) / 2} y={-12} width={labelW(s.label)} height={s.app ? 32 : 20} rx={6} fill="var(--surface)" stroke={active ? "var(--primary)" : "var(--border)"} opacity={0.95} />
                    <text y={2} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text)">
                      {s.label}
                    </text>
                    {s.app && (
                      <text y={15} textAnchor="middle" fontSize={9} fill="var(--accent)" fontWeight={600}>
                        {s.app}
                      </text>
                    )}
                  </g>
                    </g>
                  );
                })}
                {/* What happens on the spot, once the token has arrived */}
                {current.action && arrived && (() => {
                  const { sx, sy } = iso(target.x, target.y);
                  const w = current.action.length * 6.3 + 40;
                  return (
                    <g transform={`translate(${sx}, ${sy + 78})`} style={{ pointerEvents: "none" }}>
                      <g className={reduced ? undefined : "story-fade"}>
                        <rect x={-w / 2} y={-12} width={w} height={24} rx={12} fill="var(--sidebar)" />
                        <g transform={`translate(${-w / 2 + 15}, 0)`}>
                          <circle r={6} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={2.5} />
                          <circle r={6} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeDasharray="12 26" strokeLinecap="round" className={reduced ? undefined : "story-spin"} />
                        </g>
                        <text x={-w / 2 + 28} y={4} fontSize={11} fontWeight={600} fill="#fff">
                          {current.action}
                        </text>
                      </g>
                    </g>
                  );
                })()}
                {/* Moving token: a parcel or a truck */}
                <g
                  style={{
                    transform: `translate(${tokenAt.x}px, ${tokenAt.y + (tokenKind === "truck" ? 6 : -8)}px)`,
                    transition: tokenAt.moving ? `transform ${travelSeconds}s cubic-bezier(.4,0,.2,1)` : "none",
                  }}
                >
                  <g className={reduced || tokenKind === "truck" ? undefined : "story-bob"}>
                    {tokenKind === "truck" ? (
                      <g transform="scale(1.4)"><Truck dx={tokenAt.dx} dy={tokenAt.dy} moving={!arrived} reduced={reduced} /></g>
                    ) : (
                      <Block sx={0} sy={-62} a={13} b={8} h={13} active done={false} />
                    )}
                    <g transform={tokenKind === "truck" ? "translate(0,-58)" : "translate(0,-98)"}>
                      {current.carry && (
                        <>
                          <rect x={-current.carry.length * 3.4 - 10} y={-12} width={current.carry.length * 6.8 + 34} height={22} rx={11} fill="var(--accent)" />
                          <text x={12} y={3} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                            {current.carry}
                          </text>
                        </>
                      )}
                      <g transform={`translate(${current.carry ? -current.carry.length * 3.4 - 6 : 0}, -1)`}>
                        <circle r={13} fill="var(--primary)" stroke="#fff" strokeWidth={2.5} />
                        <text y={4.5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">
                          {scene + 1}
                        </text>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>
          )}

          {/* Date stamp */}
          <div className="absolute left-3 top-3 rounded-lg bg-sidebar/85 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Step {scene + 1} of {data.scenes.length} · {current.at}
          </div>
          {narrating && playing ? (
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-sidebar/90 px-3 py-2 text-center text-xs leading-relaxed text-white shadow sm:text-sm" aria-hidden>
              {spokenParts[sentence] ?? sentences(subtitle)[0]}
            </div>
          ) : (
            data.legend && <div className="absolute inset-x-3 bottom-3 rounded-lg bg-surface/90 px-3 py-1.5 text-[0.6875rem] leading-snug text-muted shadow-sm">{data.legend}</div>
          )}
          {data.company && <div className="absolute right-3 top-3 hidden rounded-lg bg-surface/90 px-2.5 py-1 text-xs text-muted shadow-sm sm:block">{data.company}</div>}

          </div>

          {/* Side panel: caption, journal and running figures */}
          <div className="space-y-3 border-t border-border p-4 sm:p-5 lg:overflow-y-auto lg:border-l lg:border-t-0" aria-live="polite">
            <div key={scene} className={reduced ? undefined : "story-fade"}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-bold text-primary-fg">Step {scene + 1} of {data.scenes.length}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{current.at}</span>
                {target.app && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.625rem] font-semibold text-accent">{target.app}</span>}
                {current.document && <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[0.6875rem] text-fg">{current.document}</span>}
              </div>
              <div className={cn("mt-1 text-lg font-semibold leading-snug", current.tone ? toneBg[current.tone as Tone].split(" ")[1] : "text-fg")}>{current.title}</div>
              <InlineMd className="mt-1 block text-sm leading-relaxed text-fg">{current.text}</InlineMd>
            </div>
            {current.entries.length > 0 && (
              <div key={`j${scene}`} className={cn("rounded-xl border border-border bg-surface p-3", !reduced && "story-fade")}>
                <div className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">Journal entry</div>
                <ul className="space-y-1 text-sm">
                  {[...dr, ...cr].map((e, i) => (
                    <li key={i} className={cn("flex justify-between gap-3", e.credit && "pl-4")}>
                      <span className="text-fg">
                        <span className="mr-1 text-xs font-semibold text-muted">{e.debit ? "Dr" : "Cr"}</span>
                        {e.account}
                      </span>
                      <span className="font-mono tabular-nums text-fg">{e.debit ?? e.credit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.counters.length > 0 && (
              <dl className="grid grid-cols-2 gap-2">
                {data.counters.map((c) => {
                  const changed = scene > 0 && c.values[scene] !== c.values[scene - 1];
                  return (
                    <div key={c.label} className={cn("rounded-xl border p-2.5 transition-colors", changed ? "border-primary/50 bg-primary-soft/60" : "border-border")}>
                      <dt className="text-[0.6875rem] text-muted">{c.label}</dt>
                      <dd className="text-base font-semibold tabular-nums text-fg">{c.values[scene]}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>

          {/* Start / end overlays */}
          {!started && (
            <button
              type="button"
              onClick={toggle}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sidebar/45 text-white backdrop-blur-[1px] transition hover:bg-sidebar/35"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-fg shadow-xl ring-8 ring-white/20">
                <Play className="ml-1 h-7 w-7" aria-hidden />
              </span>
              <span className="text-base font-semibold drop-shadow">Play the story{speechOk ? " with narration" : ""}</span>
              <span className="text-xs text-white/85">
                {data.scenes.length} steps · about {Math.max(2, Math.round((data.scenes.length * pace) / 60))} min · or step through with ← →
              </span>
            </button>
          )}
          {finished && data.results.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-sidebar/95 p-4 text-white">
              <div className="w-full max-w-xl">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand">Outcome</div>
                <div className="mt-1 text-lg font-semibold">{data.title}</div>
                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {data.results.map((r) => (
                    <div key={r.label} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                      <dt className="text-[0.6875rem] text-white/75">{r.label}</dt>
                      <dd className="mt-0.5 text-base font-semibold">{r.value}</dd>
                    </div>
                  ))}
                </dl>
                <button type="button" onClick={toggle} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg">
                  <RotateCcw className="h-4 w-4" aria-hidden /> Replay
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 border-y border-border bg-surface-2/60 px-3 py-2">
          <button type="button" onClick={() => go(scene - 1)} disabled={scene === 0} className="rounded-md p-1.5 text-fg hover:bg-surface disabled:opacity-40" aria-label="Previous step">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={toggle} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-fg" aria-label={playing ? "Pause" : finished ? "Replay" : "Play"}>
            {playing ? <Pause className="h-4 w-4" aria-hidden /> : finished ? <RotateCcw className="h-4 w-4" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" aria-hidden />}
          </button>
          <button type="button" onClick={() => go(scene + 1)} disabled={scene === data.scenes.length - 1} className="rounded-md p-1.5 text-fg hover:bg-surface disabled:opacity-40" aria-label="Next step">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          {/* Chapter scrubber: one segment per scene */}
          <div className="relative mx-1 flex h-6 flex-1 items-center gap-0.5" role="group" aria-label="Steps">
            {data.scenes.map((s, i) => {
              const fill = i < scene || finished ? 1 : i === scene ? stepFill : 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  title={`${s.at} — ${s.title}`}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  aria-current={i === scene ? "step" : undefined}
                  className="group relative h-6 flex-1"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-border group-hover:h-2.5">
                    <span className="block h-full bg-primary" style={{ width: `${fill * 100}%`, transition: fill === 0 ? "none" : "width 500ms linear" }} />
                  </span>
                </button>
              );
            })}
          </div>
          <span className="hidden w-10 text-right text-xs tabular-nums text-muted sm:block">{Math.round(progress * 100)}%</span>
          {speechOk && (
            <button
              type="button"
              onClick={toggleNarration}
              aria-pressed={narrate}
              className={cn("flex items-center gap-1 rounded-md px-1.5 py-1 text-xs hover:bg-surface", narrate ? "text-primary" : "text-muted")}
              title={narrate ? "Turn off the spoken explanation" : "Turn on the spoken explanation"}
            >
              {narrate ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
              <span className="hidden sm:inline">Narration</span>
            </button>
          )}
          <button type="button" onClick={toggleFullscreen} className="rounded-md p-1.5 text-fg hover:bg-surface" aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
            {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
          </button>
        </div>

        {/* The whole sequence as numbered steps */}
        <details open className="group border-t border-border">
          <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-fg sm:px-5">
            The {data.scenes.length} steps in order <span className="font-normal text-muted">· who passes what to whom</span>
          </summary>
          <ol className="grid gap-1.5 px-4 pb-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-3">
            {data.scenes.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === scene ? "step" : undefined}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition",
                    i === scene ? "border-primary bg-primary-soft" : i < scene ? "border-border bg-surface-2/50" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold", i <= scene ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted")}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-fg">{s.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1 text-muted">
                      {s.at} ·{" "}
                      {s.from && s.from !== s.to ? (
                        <>
                          {byId[s.from].label} <ArrowRight className="h-3 w-3" aria-hidden /><span className="sr-only">to</span> {byId[s.to].label}
                        </>
                      ) : (
                        <>within {byId[s.to].label}</>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </VisualFrame>
  );
}
