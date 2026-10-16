import type { CourseContent } from "./types";
import { erpFundamentals } from "./courses/erp-fundamentals";
import { implementationMethodology } from "./courses/implementation-methodology";
import { odooCrm } from "./courses/odoo-crm";
import { odooSales } from "./courses/odoo-sales";
import { odooPurchase } from "./courses/odoo-purchase";
import { odooInventory } from "./courses/odoo-inventory";
import { odooAccounting } from "./courses/odoo-accounting";
import { odooManufacturing } from "./courses/odoo-manufacturing";
import { odooEcommerceEinvoicing } from "./courses/odoo-ecommerce-einvoicing";
import { technicalFundamentals } from "./courses/technical-fundamentals";
import { integrationFundamentals } from "./courses/integration-fundamentals";
import { testingQa } from "./courses/testing-qa";

export { businessProcesses } from "./processes";
export { configScenarios } from "./config-scenarios";
export { docLibrary } from "./docs";
import { tradingProject } from "./projects/trading-company";
import { manufacturingProject } from "./projects/manufacturing-company";
import { servicesProject } from "./projects/professional-services";
import { multiCompanyProject } from "./projects/multi-company";
import { migrationProject } from "./projects/legacy-migration";
import type { ProjectContent } from "./types";

export { tradingProject };

export const allCourses: CourseContent[] = [
  erpFundamentals,
  implementationMethodology,
  odooCrm,
  odooSales,
  odooPurchase,
  odooInventory,
  odooAccounting,
  odooManufacturing,
  odooEcommerceEinvoicing,
  technicalFundamentals,
  integrationFundamentals,
  testingQa,
];

/** Implementation projects loaded into the portal (Project A–E as their content is completed). */
export const allProjects: ProjectContent[] = [tradingProject, manufacturingProject, servicesProject, multiCompanyProject, migrationProject];

export const platforms = [
  { slug: "odoo", name: "Odoo", vendor: "Odoo S.A.", active: true, defaultVersion: "17.0" },
  { slug: "sap-business-one", name: "SAP Business One", vendor: "SAP", active: false, defaultVersion: null },
  { slug: "sap-s4hana", name: "SAP S/4HANA", vendor: "SAP", active: false, defaultVersion: null },
  { slug: "dynamics-365", name: "Microsoft Dynamics 365", vendor: "Microsoft", active: false, defaultVersion: null },
  { slug: "netsuite", name: "Oracle NetSuite", vendor: "Oracle", active: false, defaultVersion: null },
];

export const learningPathSeeds = [
  {
    slug: "consultant-foundations",
    title: "Consultant Foundations",
    level: "beginner" as const,
    description: "From zero ERP knowledge to understanding business processes and the core Odoo sales and purchasing apps.",
    courses: ["erp-fundamentals", "odoo-crm", "odoo-sales", "odoo-purchase", "implementation-methodology"],
  },
  {
    slug: "functional-consultant",
    title: "Functional Consultant",
    level: "intermediate" as const,
    description: "Inventory, accounting, manufacturing and eCommerce/e-invoicing depth, implementation methodology, data migration and testing — ready to deliver a trading-company implementation.",
    courses: ["odoo-inventory", "odoo-accounting", "odoo-manufacturing", "odoo-ecommerce-einvoicing", "implementation-methodology", "testing-qa"],
  },
  {
    slug: "techno-functional",
    title: "Techno-Functional Consultant",
    level: "advanced" as const,
    description: "Odoo development fundamentals, integrations and APIs, and automated testing on top of solid functional knowledge.",
    courses: ["odoo-technical-fundamentals", "integration-fundamentals", "testing-qa"],
  },
];

/** Planned projects shown in the catalogue (content ships in later releases). */
export const plannedProjects = [
  { code: "B", title: "Manufacturing Company", summary: "Products, bills of materials, work centers, manufacturing orders, inventory and costing for a furniture maker." },
  { code: "C", title: "Professional Services Company", summary: "CRM, Sales, Projects, Timesheets, Expenses and invoicing for a consulting firm." },
  { code: "D", title: "Multi-Company Business", summary: "Separate companies, user permissions, company-specific operations and intercompany scenarios." },
  { code: "E", title: "Legacy ERP to Odoo Migration", summary: "Analyse a legacy database, map fields, cleanse master data, import records and migrate opening balances." },
];
