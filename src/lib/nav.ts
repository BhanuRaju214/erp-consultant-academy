import type { SectionKey } from "@/content/types";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name, resolved in the Sidebar
  /** Course section rendered by /learn/[section]. */
  section?: SectionKey;
  roles?: ("student" | "trainer" | "admin")[];
  /** Highlight only on this exact URL (not on pages below it). */
  exact?: boolean;
}

/** Platform-level navigation (outside a course). */
export const PLATFORM_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/catalog", label: "Course catalog", icon: "LibraryBig" },
  { href: "/trainer", label: "Admin & Trainer Management", icon: "ShieldCheck", roles: ["trainer", "admin"] },
];

/**
 * URL prefixes that belong to the Odoo ERP Consultant Program (the (academy) route
 * group). The sidebar shows the course navigation on these pages.
 */
export const COURSE_PATH_PREFIXES = [
  "/learn",
  "/processes",
  "/courses",
  "/config-lab",
  "/import-lab",
  "/testing",
  "/projects",
  "/assessments",
  "/docs",
  "/progress",
  "/assignments",
  "/assistant",
  "/discussions",
  "/search",
];

export function isCoursePath(pathname: string): boolean {
  return COURSE_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Navigation inside the Odoo ERP Consultant Program. */
export const NAV: NavItem[] = [
  { href: "/learn", label: "Course home", icon: "LayoutDashboard", exact: true },
  { href: "/learn/erp-fundamentals", label: "ERP Fundamentals", icon: "GraduationCap", section: "erp-fundamentals" },
  { href: "/processes", label: "Business Process Academy", icon: "Workflow" },
  { href: "/learn/odoo-apps", label: "Odoo Application Training", icon: "Boxes", section: "odoo-apps" },
  { href: "/learn/methodology", label: "Implementation Methodology", icon: "Route", section: "methodology" },
  { href: "/config-lab", label: "Business Configuration Lab", icon: "SlidersHorizontal" },
  { href: "/import-lab", label: "Data Migration & Import Lab", icon: "DatabaseZap" },
  { href: "/learn/technical-lab", label: "Technical Development Lab", icon: "Code2", section: "technical-lab" },
  { href: "/learn/integration-lab", label: "Integration Lab", icon: "Plug", section: "integration-lab" },
  { href: "/testing", label: "Testing & Quality Assurance", icon: "ClipboardCheck", section: "testing" },
  { href: "/projects", label: "Real-Time Business Projects", icon: "Briefcase" },
  { href: "/assessments", label: "Assessments & Certifications", icon: "Award" },
  { href: "/docs", label: "Documentation Library", icon: "Library" },
  { href: "/progress", label: "Progress & Reports", icon: "ChartNoAxesCombined" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/assistant", label: "AI Learning Assistant", icon: "Sparkles" },
  { href: "/discussions", label: "Discussions", icon: "MessagesSquare" },
];

export const SECTION_META: Record<SectionKey, { title: string; intro: string }> = {
  "erp-fundamentals": {
    title: "ERP Fundamentals",
    intro: "Understand what ERP is, why businesses implement it, how it is structured and who does what on a project — before touching any screen.",
  },
  "business-processes": { title: "Business Process Academy", intro: "How a business operates end to end." },
  "odoo-apps": {
    title: "Odoo Application Training",
    intro: "Every application follows the same 16-point template: business problem → process → configuration → master data → transactions → automation → reports → accounting/inventory impact → troubleshooting → practice → interview prep → assessment.",
  },
  methodology: {
    title: "Implementation Methodology",
    intro: "The complete implementation lifecycle from discovery to post-go-live support, with a reusable template for every phase.",
  },
  "config-lab": { title: "Business Configuration Lab", intro: "" },
  "import-lab": { title: "Data Migration & Import Lab", intro: "" },
  "technical-lab": {
    title: "Technical Development Lab",
    intro: "Odoo technical fundamentals for consultants: models, views, security, business logic, reports and tests. Always use a development database — never production.",
  },
  "integration-lab": {
    title: "API & Integration Lab",
    intro: "REST, authentication, webhooks, Odoo's external API, and integration design with retries, idempotency and reconciliation. Secrets stay on the server.",
  },
  testing: {
    title: "Testing & Quality Assurance",
    intro: "Write and execute business scenario tests, UAT, regression, access and reconciliation tests.",
  },
  projects: { title: "Real-Time Business Projects", intro: "" },
};

export const SCOPE_LABELS: Record<string, { label: string; tone: "neutral" | "info" | "warning" | "danger" | "success" }> = {
  standard: { label: "Standard", tone: "success" },
  configuration: { label: "Configuration", tone: "info" },
  enterprise: { label: "Enterprise only", tone: "warning" },
  customization: { label: "Custom development", tone: "danger" },
  "third-party": { label: "Third-party", tone: "neutral" },
};

/** Course sections in learning order (the order of NAV), used to sort modules. */
export const SECTION_ORDER: string[] = NAV.flatMap((n) => (n.section ? [n.section] : []));
