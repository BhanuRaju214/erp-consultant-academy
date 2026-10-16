"use client";

import { useEffect, useRef } from "react";
import type { VisualData } from "@/lib/visuals/schemas";

type Story = VisualData<"story">;

/* World units: departments are lanes along z (nearest first), steps are gates along x. */
const LANE = 1.75;
const STEP = 3.4;
const MOVE_SECONDS = 2;

type Pt = { x: number; z: number };
type Proj = { X: number; Y: number; s: number; d: number };

const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: number[]) => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Blend two #rrggbb colours; falls back to the first colour for anything else. */
function mix(a: string, b: string, t: number) {
  const hex = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : null);
  const x = hex(a);
  const y = hex(b);
  if (!x || !y) return a;
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
}

function pathFor(data: Story, laneZ: (id: string) => number, i: number): Pt[] {
  const s = data.scenes[i];
  const prevTo = i ? data.scenes[i - 1].to : (s.from ?? s.to);
  const start = { x: i ? (i - 1) * STEP : -STEP * 0.8, z: laneZ(prevTo) };
  const mid = { x: i * STEP, z: laneZ(s.from ?? prevTo) };
  return [start, mid, { x: i * STEP, z: laneZ(s.to) }];
}

function along(pts: Pt[], u: number): Pt {
  const segs: number[] = [];
  let total = 0;
  for (let k = 1; k < pts.length; k++) {
    const d = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].z - pts[k - 1].z);
    segs.push(d);
    total += d;
  }
  if (total === 0) return pts[pts.length - 1];
  let t = u * total;
  for (let k = 0; k < segs.length; k++) {
    if (t <= segs[k] || k === segs.length - 1) {
      const r = segs[k] ? Math.min(1, t / segs[k]) : 1;
      return { x: pts[k].x + (pts[k + 1].x - pts[k].x) * r, z: pts[k].z + (pts[k + 1].z - pts[k].z) * r };
    }
    t -= segs[k];
  }
  return pts[pts.length - 1];
}

/**
 * Concept B stage: a 3D process timeline drawn on canvas. Lanes are departments, numbered gates are the
 * steps in time order, and the document box drives through the gates, crossing lanes at each handover.
 */
export function TimelineStage({ data, scene, finished, started, reduced, label }: { data: Story; scene: number; finished: boolean; started: boolean; reduced: boolean; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef<{ scene: number; finished: boolean; started: boolean; reduced: boolean; moveT: number; camX: number; truckAng?: number }>({ scene, finished, started, reduced, moveT: 1, camX: 0 });

  // A new step starts the box moving from where the previous step ended.
  useEffect(() => {
    const l = live.current;
    if (l.scene !== scene) l.moveT = reduced || !started ? 1 : 0;
    Object.assign(l, { scene, finished, started, reduced });
  }, [scene, finished, started, reduced]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const lanes = data.stations;
    const laneIx = Object.fromEntries(lanes.map((l, i) => [l.id, i]));
    const laneZ = (id: string) => (laneIx[id] ?? 0) * LANE;
    const N = data.scenes.length;
    const zEnd = (lanes.length - 1) * LANE;
    let W = 0;
    let H = 0;
    let DPR = 1;
    let colors: Record<string, string> = {};
    const readColors = () => {
      const cs = getComputedStyle(cv);
      const get = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
      colors = {
        surface: get("--surface", "#ffffff"),
        surface2: get("--surface-2", "#eef1f6"),
        line: get("--border", "#e2e5ee"),
        fg: get("--text", "#141a2b"),
        muted: get("--muted", "#5d667c"),
        primary: get("--primary", "#0a6d84"),
        primaryFg: get("--primary-fg", "#ffffff"),
        brand: get("--accent", "#0e7490"),
        outside: get("--warning-soft", "#fdf3e2"),
        sidebar: get("--sidebar", "#0b1120"),
        brandLight: get("--brand", "#17c0e2"),
      };
    };
    const resize = () => {
      const r = cv.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    readColors();
    live.current.camX = along(pathFor(data, laneZ, live.current.scene), 1).x + 3;

    let raf = 0;
    let last = performance.now();
    let tick = 0;
    const frame = (now: number) => {
      const l = live.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (++tick % 30 === 1) readColors();
      if (l.started && l.moveT < 1) l.moveT = Math.min(1, l.moveT + dt / MOVE_SECONDS);
      const u = l.finished ? 1 : l.moveT;
      const narrow = W < 560;
      const box = along(pathFor(data, laneZ, l.scene), u);
      const target = box.x + (narrow ? 1.2 : 3);
      l.camX = l.reduced ? target : l.camX + (target - l.camX) * Math.min(1, dt * 2.2);

      // Camera looks straight down the road, so lanes are horizontal bands and steps run left to right.
      const lanesMid = zEnd / 2;
      const C = [l.camX, narrow ? 7.2 : 8.2, narrow ? -6.2 : -7.6];
      const T = [l.camX, 0, lanesMid - (narrow ? 0.9 : 0.5)];
      const F = norm(sub(T, C));
      const R = norm(cross([0, 1, 0], F));
      const U = cross(F, R);
      const focal = narrow ? W * 1.25 : Math.min(W * 1.1, H * 1.7) * 0.95;
      const P = (x: number, y: number, z: number): Proj => {
        const v = sub([x, y, z], C);
        const zc = dot(v, F);
        return { X: W / 2 + (focal * dot(v, R)) / zc, Y: H * (narrow ? 0.4 : 0.5) - (focal * dot(v, U)) / zc, s: focal / zc, d: zc };
      };
      const poly = (pts: Proj[], fill?: string, stroke?: string, lw = 1) => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.X, p.Y) : ctx.moveTo(p.X, p.Y)));
        ctx.closePath();
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = lw;
          ctx.stroke();
        }
      };

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const xa = l.camX - 16;
      const xb = l.camX + 16;
      const cur = data.scenes[l.scene];
      const active = new Set([cur.to, cur.from ?? cur.to]);

      // Lanes, far first. Lanes outside the company (marked "outside") get a warm tint.
      for (let i = lanes.length - 1; i >= 0; i--) {
        const z = i * LANE;
        const ln = lanes[i];
        const base = ln.outside ? colors.outside : i % 2 ? colors.surface2 : colors.surface;
        const fill = active.has(ln.id) ? mix(base, colors.primary, 0.14) : base;
        poly([P(xa, 0, z - LANE / 2 + 0.06), P(xb, 0, z - LANE / 2 + 0.06), P(xb, 0, z + LANE / 2 - 0.06), P(xa, 0, z + LANE / 2 - 0.06)], fill, colors.line);
      }

      // Gates: a line across the lanes and a numbered post behind the farthest lane, with the date.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < N; i++) {
        const x = i * STEP;
        if (x < xa - 2 || x > xb) continue;
        const isCur = i === l.scene;
        const done = i < l.scene || l.finished;
        const a = P(x, 0.01, -LANE / 2);
        const b = P(x, 0.01, zEnd + LANE / 2);
        ctx.setLineDash(isCur ? [] : [4, 5]);
        ctx.strokeStyle = isCur ? colors.primary : colors.line;
        ctx.lineWidth = isCur ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.moveTo(a.X, a.Y);
        ctx.lineTo(b.X, b.Y);
        ctx.stroke();
        ctx.setLineDash([]);
        const foot = P(x, 0, zEnd + LANE / 2 + 0.2);
        const head = P(x, 1.25, zEnd + LANE / 2 + 0.2);
        ctx.strokeStyle = done || isCur ? colors.primary : colors.muted;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(foot.X, foot.Y);
        ctx.lineTo(head.X, head.Y);
        ctx.stroke();
        const r = Math.max(9, Math.min(16, head.s * 0.34));
        ctx.beginPath();
        ctx.arc(head.X, head.Y, isCur ? r * 1.2 : r, 0, Math.PI * 2);
        ctx.fillStyle = done || isCur ? colors.primary : colors.surface;
        ctx.fill();
        ctx.strokeStyle = isCur ? colors.brand : colors.primary;
        ctx.lineWidth = isCur ? 3 : 1.5;
        ctx.stroke();
        ctx.fillStyle = done || isCur ? colors.primaryFg : colors.primary;
        ctx.font = `700 ${Math.round(r * (isCur ? 1.15 : 0.95))}px ui-monospace, Consolas, monospace`;
        ctx.fillText(String(i + 1), head.X, head.Y + 1);
        ctx.font = `600 ${isCur ? 12 : 10.5}px system-ui, sans-serif`;
        ctx.fillStyle = isCur ? colors.fg : colors.muted;
        ctx.fillText(data.scenes[i].at, head.X, head.Y - r * 1.2 - 9);
      }

      // The road travelled so far: earlier steps lighter, the current step up to the box.
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const upto = l.finished ? N : l.scene;
      for (let i = 0; i <= Math.min(upto, N - 1); i++) {
        const pts = pathFor(data, laneZ, i);
        const uu = i < upto ? 1 : u;
        ctx.strokeStyle = i < upto ? mix(colors.primary, colors.surface, 0.35) : colors.primary;
        ctx.lineWidth = i < upto ? 3 : 4.5;
        ctx.setLineDash(i < upto ? [] : [9, 6]);
        ctx.beginPath();
        for (let k = 0; k <= 24; k++) {
          const p = along(pts, (k / 24) * uu);
          const q = P(p.x, 0.02, p.z);
          if (k) ctx.lineTo(q.X, q.Y);
          else ctx.moveTo(q.X, q.Y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Lane names, pinned to the left edge of the view.
      ctx.textAlign = "left";
      for (let i = 0; i < lanes.length; i++) {
        const z = i * LANE;
        let lo = xa;
        let hi = xb;
        for (let k = 0; k < 22; k++) {
          const m = (lo + hi) / 2;
          if (P(m, 0, z).X < 14) lo = m;
          else hi = m;
        }
        const p = P(hi, 0, z);
        const isAct = active.has(lanes[i].id);
        const fs = Math.max(11, Math.min(15, p.s * 0.28));
        ctx.font = `${isAct ? 700 : 600} ${fs}px system-ui, sans-serif`;
        const text = lanes[i].label.toUpperCase();
        const w = ctx.measureText(text).width;
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = colors.surface;
        ctx.fillRect(p.X - 4, p.Y - fs * 0.8, w + 8, fs * 1.6);
        ctx.globalAlpha = 1;
        ctx.fillStyle = isAct ? colors.primary : colors.muted;
        ctx.fillText(text, p.X, p.Y);
      }

      // Oriented cuboid: local x runs along the heading, local z across it. Faces sorted far to near.
      const cuboid = (cx: number, cz: number, ang: number, x0: number, x1: number, w: number, y0: number, y1: number, color: string) => {
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const at = (lx: number, y: number, lz: number) => P(cx + lx * ca - lz * sa, y, cz + lx * sa + lz * ca);
        const faces = [
          { pts: [at(x0, y1, -w), at(x1, y1, -w), at(x1, y1, w), at(x0, y1, w)], shade: 0 },
          { pts: [at(x0, y0, -w), at(x1, y0, -w), at(x1, y1, -w), at(x0, y1, -w)], shade: 0.18 },
          { pts: [at(x0, y0, w), at(x1, y0, w), at(x1, y1, w), at(x0, y1, w)], shade: 0.18 },
          { pts: [at(x0, y0, -w), at(x0, y0, w), at(x0, y1, w), at(x0, y1, -w)], shade: 0.32 },
          { pts: [at(x1, y0, -w), at(x1, y0, w), at(x1, y1, w), at(x1, y1, -w)], shade: 0.32 },
        ];
        faces.sort((m, n) => n.pts.reduce((t, p) => t + p.d, 0) - m.pts.reduce((t, p) => t + p.d, 0));
        for (const fc of faces) poly(fc.pts, mix(color, "#000000", fc.shade), colors.brand);
      };
      const kind = cur.token ?? data.token ?? "box";
      const moving = !l.finished && u < 1;
      let ang = 0;
      if (kind === "truck") {
        const ahead = along(pathFor(data, laneZ, l.scene), Math.min(1, u + 0.03));
        const behind = along(pathFor(data, laneZ, l.scene), Math.max(0, u - 0.03));
        if (Math.hypot(ahead.x - behind.x, ahead.z - behind.z) > 0.001) ang = Math.atan2(ahead.z - behind.z, ahead.x - behind.x);
        l.truckAng = moving ? ang : (l.truckAng ?? 0);
        ang = l.truckAng;
      }
      const shadowR = kind === "truck" ? 0.75 : 0.42;
      ctx.globalAlpha = 0.18;
      poly([P(box.x - shadowR, 0.01, box.z - shadowR * 0.6), P(box.x + shadowR, 0.01, box.z - shadowR * 0.6), P(box.x + shadowR, 0.01, box.z + shadowR * 0.6), P(box.x - shadowR, 0.01, box.z + shadowR * 0.6)], colors.fg);
      ctx.globalAlpha = 1;
      let y1 = 0;
      if (kind === "truck") {
        // Wheels, cargo box and cab; a little dust behind while driving.
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        if (moving && !l.reduced) {
          for (let k = 1; k <= 3; k++) {
            const back = P(box.x - ca * (0.6 + k * 0.22), 0.08 + k * 0.05, box.z - sa * (0.6 + k * 0.22));
            ctx.globalAlpha = 0.22 - k * 0.05;
            ctx.beginPath();
            ctx.arc(back.X, back.Y, Math.max(2, back.s * (0.05 + k * 0.025)), 0, Math.PI * 2);
            ctx.fillStyle = colors.muted;
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        for (const [lx, lz] of [[0.32, 0.3], [0.32, -0.3], [-0.32, 0.3], [-0.32, -0.3]]) {
          const w = P(box.x + lx * ca - lz * sa, 0.09, box.z + lx * sa + lz * ca);
          ctx.beginPath();
          ctx.ellipse(w.X, w.Y, Math.max(2.5, w.s * 0.09), Math.max(1.6, w.s * 0.055), 0, 0, Math.PI * 2);
          ctx.fillStyle = "#1f2937";
          ctx.fill();
        }
        cuboid(box.x, box.z, ang, -0.55, 0.22, 0.3, 0.12, 0.62, colors.primary);
        cuboid(box.x, box.z, ang, 0.24, 0.55, 0.27, 0.12, 0.45, colors.brand);
        y1 = 0.62;
      } else {
        const bob = l.reduced ? 0 : Math.sin(now / 320) * 0.06;
        cuboid(box.x, box.z, 0, -0.32, 0.32, 0.32, 0.05 + bob, 0.55 + bob, colors.primary);
        y1 = 0.55 + bob;
      }

      // On-the-spot activity once the token has arrived.
      if (cur.action && !moving) {
        const spot = P(box.x, 0, box.z);
        ctx.font = "600 12px system-ui, sans-serif";
        const aw = ctx.measureText(cur.action).width + 40;
        const ax = Math.max(8, Math.min(W - aw - 8, spot.X + 26));
        const ay = Math.min(H - 64, spot.Y + 6);
        ctx.fillStyle = colors.sidebar;
        ctx.beginPath();
        ctx.roundRect(ax, ay, aw, 26, 13);
        ctx.fill();
        const spin = l.reduced ? 0 : (now / 900) * Math.PI * 2;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(255,255,255,.25)";
        ctx.beginPath();
        ctx.arc(ax + 15, ay + 13, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = colors.brandLight;
        ctx.beginPath();
        ctx.arc(ax + 15, ay + 13, 6, spin, spin + Math.PI * 0.7);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(cur.action, ax + 28, ay + 13.5);
      }

      // Label above the box: step number and what is being carried.
      const top = P(box.x, y1 + 0.6, box.z);
      const text = `${l.scene + 1}  ${cur.carry ?? cur.title}`;
      ctx.font = "700 12.5px system-ui, sans-serif";
      const tw = ctx.measureText(text).width;
      const bx = Math.max(8, Math.min(W - tw - 26, top.X - tw / 2 - 9));
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.roundRect(bx, top.Y - 24, tw + 18, 24, 12);
      ctx.fill();
      ctx.fillStyle = colors.primaryFg;
      ctx.textBaseline = "middle";
      ctx.fillText(text, bx + 9, top.Y - 11.5);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [data]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label={label} />;
}
