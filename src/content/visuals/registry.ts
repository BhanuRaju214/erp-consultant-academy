/**
 * Registry of file-based visual assets (Napkin AI exports, approved illustrations,
 * real Odoo screenshots). Files live under /public/visuals/<course-slug>/<lesson-slug>/.
 *
 * Every `visual-figure` block must point to a registered asset — `npm run visuals:check`
 * enforces this, verifies the file exists, and checks size and alt text.
 *
 * In-portal visual blocks (visual-flow, visual-mockup, …) are code, not files; they are
 * listed automatically in docs/visual-learning/asset-register.md by the same script.
 */

export type AssetSource = "napkin-ai" | "odoo-screenshot" | "illustration" | "photo";

export interface VisualAsset {
  /** Public path, e.g. "/visuals/odoo-sales/master-data-and-transactions/o2c-flow.svg" */
  src: string;
  course: string;
  lesson: string;
  /** The concept the visual explains. */
  concept: string;
  type: "process-diagram" | "decision-tree" | "timeline" | "infographic" | "comparison" | "screenshot" | "illustration";
  source: AssetSource;
  caption: string;
  alt: string;
  format: "svg" | "png" | "webp" | "jpg";
  width: number;
  height: number;
  /** Usage rights / attribution, e.g. "Generated with the company's Napkin AI account (plan: …)". */
  rights: string;
  /** Napkin prompt ID from docs/visual-learning/napkin-prompts.md, when applicable. */
  promptId?: string;
  /** Screenshots: Odoo version and database they were captured from. */
  capturedFrom?: string;
  reviewedBy?: string;
}

export const visualAssets: VisualAsset[] = [
  // Add Napkin exports / screenshots here as they are produced, e.g.
  // {
  //   src: "/visuals/odoo-sales/master-data-and-transactions/np-07-sales-document-flow.svg",
  //   course: "odoo-sales", lesson: "master-data-and-transactions",
  //   concept: "Quotation to invoice document flow", type: "process-diagram", source: "napkin-ai",
  //   caption: "…", alt: "…", format: "svg", width: 1600, height: 900,
  //   rights: "Generated with the company's Napkin AI account — confirm plan terms for commercial use",
  //   promptId: "NP-07", reviewedBy: "…",
  // },
];
