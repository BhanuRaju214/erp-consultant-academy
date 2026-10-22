import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { PDFDocument } from "pdf-lib";
import { BRAND } from "@/lib/brand";
import { formatIssued, type CertificateView } from "@/lib/services/certificates";

/**
 * Certificate artwork, drawn with next/og so the downloadable PNG, the PDF and the
 * social preview always match. Landscape A4 proportions (1 : 1.414).
 */

const NAVY = "#0b1b3f";
const BLUE = "#1a56db";
const GOLD = "#b8912a";
const GOLD_SOFT = "#e9d9a6";
const INK = "#1f2937";
const MUTED = "#5b6474";
const PAPER = "#fdfbf6";

type Font = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700 | 800; style: "normal" | "italic" };
let fonts: Promise<Font[]> | null = null;

function loadFonts(): Promise<Font[]> {
  fonts ??= (async () => {
    const dir = path.join(process.cwd(), "src", "assets", "fonts");
    const file = async (f: string) => {
      const b = await readFile(path.join(dir, f));
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
    };
    return [
      { name: "Jakarta", data: await file("plus-jakarta-sans-latin-400-normal.woff"), weight: 400, style: "normal" },
      { name: "Jakarta", data: await file("plus-jakarta-sans-latin-600-normal.woff"), weight: 600, style: "normal" },
      { name: "Jakarta", data: await file("plus-jakarta-sans-latin-800-normal.woff"), weight: 800, style: "normal" },
      { name: "Playfair", data: await file("playfair-display-latin-700-normal.woff"), weight: 700, style: "normal" },
      { name: "Playfair", data: await file("playfair-display-latin-700-italic.woff"), weight: 700, style: "italic" },
    ];
  })();
  return fonts;
}

/** Faint guilloché-style background: overlapping ellipses, as on printed certificates. */
function patternDataUri(w: number, h: number) {
  const rings = Array.from({ length: 18 }, (_, i) => {
    const rx = w * 0.18 + i * w * 0.028;
    const ry = h * 0.1 + i * h * 0.022;
    return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${rx}" ry="${ry}" fill="none" stroke="${GOLD}" stroke-opacity="0.07" stroke-width="${w / 900}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rings}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Scalloped gold rosette behind the seal. */
function rosetteDataUri(size: number) {
  const c = size / 2;
  const points = Array.from({ length: 48 }, (_, i) => {
    const r = i % 2 ? c * 0.9 : c;
    const a = (Math.PI * 2 * i) / 48;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><polygon points="${points}" fill="${GOLD}"/><circle cx="${c}" cy="${c}" r="${c * 0.78}" fill="none" stroke="${GOLD_SOFT}" stroke-width="${size / 90}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function Monogram({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", width: size, height: size, borderRadius: size * 0.22, background: BLUE, alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 19V5l12 14V5" />
      </svg>
    </div>
  );
}

function Seal({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", position: "relative", width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={rosetteDataUri(size)} width={size} height={size} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "white" }}>
        <svg width={size * 0.22} height={size * 0.22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <div style={{ fontFamily: "Jakarta", fontWeight: 800, fontSize: size * 0.1, letterSpacing: size * 0.012, marginTop: size * 0.02 }}>VERIFIED</div>
      </div>
    </div>
  );
}

/** Shrinks long names and titles so they stay on one or two lines. */
function fit(text: string, base: number, steps: [number, number][]) {
  for (const [len, scale] of steps) if (text.length > len) return base * scale;
  return base;
}

function CertificateBody({ cert, verifyUrl, W }: { cert: CertificateView; verifyUrl: string; W: number }) {
  const H = Math.round(W / 1.4142);
  const u = (n: number) => (n * W) / 2000;
  const nameSize = fit(cert.name, u(118), [[34, 0.62], [26, 0.78]]);
  const titleSize = fit(cert.title, u(54), [[70, 0.68], [45, 0.82]]);
  const verifyText = verifyUrl.replace(/^https?:\/\//, "");
  const corner = (pos: Record<string, number>, rot: number) => (
    <div style={{ display: "flex", position: "absolute", width: u(70), height: u(70), borderTop: `${u(5)}px solid ${GOLD}`, borderLeft: `${u(5)}px solid ${GOLD}`, transform: `rotate(${rot}deg)`, ...pos }} />
  );

  return (
    <div style={{ display: "flex", width: W, height: H, background: PAPER, padding: u(48), fontFamily: "Jakarta" }}>
      <div style={{ display: "flex", flex: 1, border: `${u(10)}px solid ${NAVY}`, padding: u(14) }}>
        <div style={{ display: "flex", flex: 1, position: "relative", flexDirection: "column", border: `${u(2.5)}px solid ${GOLD}`, padding: `${u(64)}px ${u(110)}px ${u(46)}px` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={patternDataUri(W - u(150), H - u(150))} width={W - u(150)} height={H - u(150)} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
          {corner({ top: u(18), left: u(18) }, 0)}
          {corner({ top: u(18), right: u(18) }, 90)}
          {corner({ bottom: u(18), right: u(18) }, 180)}
          {corner({ bottom: u(18), left: u(18) }, 270)}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: u(18) }}>
              <Monogram size={u(64)} />
              <div style={{ fontWeight: 800, fontSize: u(46), color: NAVY, letterSpacing: -u(1.5) }}>{BRAND.productName.toLowerCase()}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: u(18), fontWeight: 600, letterSpacing: u(4), color: MUTED }}>CERTIFICATE ID</div>
              <div style={{ fontSize: u(28), fontWeight: 800, color: NAVY, marginTop: u(4) }}>{cert.serial}</div>
            </div>
          </div>

          <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontSize: u(30), fontWeight: 800, letterSpacing: u(12), color: GOLD }}>CERTIFICATE OF COMPLETION</div>
            <div style={{ fontSize: u(30), color: MUTED, marginTop: u(46) }}>This is to certify that</div>
            <div style={{ fontFamily: "Playfair", fontStyle: "italic", fontWeight: 700, fontSize: nameSize, color: NAVY, marginTop: u(14), lineHeight: 1.15, maxWidth: u(1500) }}>{cert.name}</div>
            <div style={{ display: "flex", width: u(560), height: u(3), background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, marginTop: u(22) }} />
            <div style={{ fontSize: u(30), color: MUTED, marginTop: u(30) }}>{cert.kind === "module" ? "has successfully completed the module" : "has successfully completed the course"}</div>
            <div style={{ fontSize: titleSize, fontWeight: 800, color: INK, marginTop: u(14), lineHeight: 1.2, maxWidth: u(1450), letterSpacing: -u(0.8) }}>{cert.title}</div>
            {cert.partOf && <div style={{ fontSize: u(28), color: MUTED, marginTop: u(12) }}>{`part of the ${cert.partOf}`}</div>}
            <div style={{ fontSize: u(25), color: MUTED, marginTop: u(22) }}>
              {cert.kind === "module" ? "including every lesson and the graded final assessment" : "including every lesson and all graded module assessments"}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", width: u(470) }}>
              <div style={{ fontSize: u(32), fontWeight: 600, color: INK, paddingBottom: u(10) }}>{formatIssued(cert.issuedAt)}</div>
              <div style={{ display: "flex", borderTop: `${u(2)}px solid ${GOLD_SOFT}`, paddingTop: u(10), fontSize: u(18), fontWeight: 600, letterSpacing: u(4), color: MUTED }}>DATE OF ISSUE</div>
            </div>
            <Seal size={u(200)} />
            <div style={{ display: "flex", flexDirection: "column", width: u(470), alignItems: "flex-end", textAlign: "right" }}>
              <div style={{ fontSize: u(32), fontWeight: 600, color: INK, paddingBottom: u(10) }}>{BRAND.legalName}</div>
              <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", borderTop: `${u(2)}px solid ${GOLD_SOFT}`, paddingTop: u(10), fontSize: u(18), fontWeight: 600, letterSpacing: u(4), color: MUTED }}>
                {`ISSUED BY ${BRAND.productName.toUpperCase()}`}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: u(26), fontSize: u(19), color: MUTED }}>{`Verify this certificate at ${verifyText}`}</div>
        </div>
      </div>
    </div>
  );
}

/** The certificate as a PNG (default 2000 px wide; A4 landscape at ~170 dpi). */
export async function certificateImage(cert: CertificateView, verifyUrl: string, width = 2000, headers?: Record<string, string>) {
  return new ImageResponse(<CertificateBody cert={cert} verifyUrl={verifyUrl} W={width} />, {
    width,
    height: Math.round(width / 1.4142),
    fonts: await loadFonts(),
    headers,
  });
}

/** Single-page A4 landscape PDF with the certificate artwork. */
export async function certificatePdf(cert: CertificateView, verifyUrl: string): Promise<Uint8Array> {
  const png = new Uint8Array(await (await certificateImage(cert, verifyUrl, 2800)).arrayBuffer());
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${BRAND.productName} certificate ${cert.serial}: ${cert.title}`);
  pdf.setAuthor(BRAND.legalName);
  pdf.setSubject(`Certificate of completion for ${cert.name}. Verify at ${verifyUrl}`);
  pdf.setCreator(BRAND.productName);
  const image = await pdf.embedPng(png);
  const page = pdf.addPage([841.89, 595.28]);
  page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  return pdf.save();
}

/** 1200×630 link preview for LinkedIn, WhatsApp and others. */
export async function certificateShareCard(cert: CertificateView) {
  const nameSize = fit(cert.name, 76, [[30, 0.66], [22, 0.82]]);
  const titleSize = fit(cert.title, 40, [[60, 0.7], [40, 0.85]]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: 1200, height: 630, background: NAVY, fontFamily: "Jakarta", padding: 28 }}>
        <div style={{ display: "flex", flex: 1, border: `2px solid ${GOLD}`, padding: "56px 64px", alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Monogram size={46} />
              <div style={{ fontWeight: 800, fontSize: 34, color: "white", letterSpacing: -1 }}>{BRAND.productName.toLowerCase()}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 6, color: GOLD_SOFT, marginTop: 44 }}>CERTIFICATE OF COMPLETION</div>
            <div style={{ fontFamily: "Playfair", fontStyle: "italic", fontWeight: 700, fontSize: nameSize, color: "white", marginTop: 14, lineHeight: 1.1 }}>{cert.name}</div>
            <div style={{ fontSize: titleSize, fontWeight: 800, color: "#c9d8ff", marginTop: 18, lineHeight: 1.2 }}>{cert.title}</div>
            <div style={{ fontSize: 22, color: "#9fb0d0", marginTop: 26 }}>
              {`Issued ${formatIssued(cert.issuedAt)} · ID ${cert.serial}`}
            </div>
          </div>
          <Seal size={230} />
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await loadFonts(), headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
