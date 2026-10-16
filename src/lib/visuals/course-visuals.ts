/** Visual identity per course: icon (see components/visuals/icons) and a short subject label. */
const BY_SLUG: Record<string, { icon: string; label: string }> = {
  "erp-fundamentals": { icon: "graduation", label: "ERP basics" },
  "implementation-methodology": { icon: "workflow", label: "Methodology" },
  "odoo-crm": { icon: "handshake", label: "CRM" },
  "odoo-sales": { icon: "cart", label: "Sales" },
  "odoo-purchase": { icon: "truck", label: "Purchase" },
  "odoo-inventory": { icon: "warehouse", label: "Inventory" },
  "odoo-accounting": { icon: "landmark", label: "Accounting" },
  "odoo-manufacturing": { icon: "factory", label: "Manufacturing" },
  "odoo-ecommerce-einvoicing": { icon: "store", label: "eCommerce" },
  "odoo-technical-fundamentals": { icon: "code", label: "Development" },
  "integration-fundamentals": { icon: "plug", label: "Integration" },
  "testing-qa": { icon: "clipboard", label: "Testing" },
};

const BY_SECTION: Record<string, string> = {
  "erp-fundamentals": "graduation",
  "odoo-apps": "layers",
  methodology: "workflow",
  "technical-lab": "code",
  "integration-lab": "plug",
  testing: "clipboard",
};

export function courseVisual(slug: string, section?: string): { icon: string; label: string } {
  return BY_SLUG[slug] ?? { icon: (section && BY_SECTION[section]) || "book", label: "Course" };
}
