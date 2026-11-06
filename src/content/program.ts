/**
 * The 4-week full-time ERP Consultant program.
 *
 * 20 training days of 6 hours. Each day is a chapter: guided learning (lessons,
 * process walkthroughs, final assessments) followed by a hands-on practice block
 * (assignments, labs and projects) that fills the rest of the day.
 *
 * Every lesson and every course assessment and assignment appears exactly once —
 * `tests/program.test.ts` enforces this, so new lessons must be scheduled here.
 */

export type ProgramItem =
  | { kind: "lesson"; course: string; lesson: string }
  | { kind: "process"; slug: string }
  | { kind: "assessment"; course: string }
  | { kind: "assignment"; slug: string }
  | { kind: "lab"; title: string; href: string };

export interface ProgramDay {
  /** Chapter title for the day. */
  title: string;
  /** Lessons, process walkthroughs and assessments, in order. */
  learn: ProgramItem[];
  /** Assignments, labs and project work for the practice block. */
  practice: ProgramItem[];
}

export interface ProgramWeek {
  title: string;
  goal: string;
  days: ProgramDay[];
}

export const PROGRAM_DAY_MINUTES = 360;
/** Planning estimates for items without their own duration. */
export const PROCESS_MINUTES = 30;
export const ASSESSMENT_MINUTES = 20;

const L = (course: string, ...lessons: string[]): ProgramItem[] => lessons.map((lesson) => ({ kind: "lesson", course, lesson }));
const P = (slug: string): ProgramItem => ({ kind: "process", slug });
const A = (course: string): ProgramItem => ({ kind: "assessment", course });
const S = (...slugs: string[]): ProgramItem[] => slugs.map((slug) => ({ kind: "assignment", slug }));
const LAB = (title: string, href: string): ProgramItem => ({ kind: "lab", title, href });

export const program: ProgramWeek[] = [
  {
    title: "ERP foundations and front-office apps",
    goal: "Explain what ERP is and who does what on a project, then run lead-to-quotation and RFQ-to-bill in Odoo.",
    days: [
      {
        title: "Why ERP exists and how it is built",
        learn: [
          ...L("erp-fundamentals", "what-is-erp", "why-businesses-implement-erp", "problems-with-disconnected-applications"),
          ...L("erp-fundamentals", "erp-architecture-components", "crm-vs-erp-vs-accounting", "cloud-vs-on-premises", "saas-hosting-environments-access"),
          ...L("odoo-setup-databases", "editions-hosting-and-versions"),
          ...L("erp-fundamentals", "standard-vs-customization", "consultant-types", "roles-and-raci"),
        ],
        practice: [...S("erp-fundamentals-case-study")],
      },
      {
        title: "Project success, Order to Cash and Odoo CRM",
        learn: [
          ...L("erp-fundamentals", "costs-benefits-risks-success-factors"),
          A("erp-fundamentals"),
          P("order-to-cash"),
          ...L("odoo-setup-databases", "installing-odoo"),
          ...L("odoo-crm", "overview-and-business-problems", "prerequisites-configuration-settings", "master-data-and-transactions", "automation-reports-impact"),
        ],
        practice: [LAB("Finish and submit the ERP case study", "/assignments/erp-fundamentals-case-study"), ...S("odoo-crm-assignment-1")],
      },
      {
        title: "Odoo Sales: quotation to invoice",
        learn: [
          ...L("odoo-setup-databases", "creating-and-managing-databases"),
          ...L("odoo-crm", "troubleshooting-practice-interview"),
          A("odoo-crm"),
          ...L("odoo-sales", "overview-and-business-problems", "prerequisites-configuration-settings", "master-data-and-transactions", "automation-reports-impact"),
        ],
        practice: [...S("odoo-sales-assignment-1"), LAB("Config Lab: Trading Company", "/config-lab/trading-company")],
      },
      {
        title: "Procure to Pay and Odoo Purchase",
        learn: [
          ...L("odoo-setup-databases", "environments-and-neutralization"),
          ...L("odoo-sales", "troubleshooting-practice-interview"),
          A("odoo-sales"),
          P("procure-to-pay"),
          ...L("odoo-purchase", "overview-and-business-problems", "prerequisites-configuration-settings", "master-data-and-transactions", "automation-reports-impact"),
        ],
        practice: [...S("odoo-sales-assignment-2", "odoo-purchase-assignment-1")],
      },
      {
        title: "Inventory foundations",
        learn: [
          ...L("odoo-setup-databases", "installing-and-managing-apps"),
          ...L("odoo-purchase", "troubleshooting-practice-interview"),
          A("odoo-purchase"),
          P("inventory-management"),
          ...L("odoo-inventory", "inventory-overview-and-process-flow", "inventory-dependencies-and-configuration", "inventory-master-data"),
        ],
        practice: [...S("odoo-purchase-assignment-2"), LAB("Weekly review: retake any final below 70%", "/assessments")],
      },
    ],
  },
  {
    title: "Supply chain, finance and manufacturing",
    goal: "Run warehouse operations, close a month in Odoo Accounting with Indian GST, and produce goods from a bill of materials.",
    days: [
      {
        title: "Inventory operations and valuation",
        learn: [
          ...L("odoo-setup-databases", "first-time-setup"),
          ...L("odoo-inventory", "inventory-transactions", "inventory-automation-reports-valuation", "inventory-troubleshooting-and-interview"),
          A("odoo-inventory"),
          P("record-to-report"),
          ...L("odoo-accounting", "accounting-overview-and-process-flow"),
        ],
        practice: [...S("odoo-inventory-assignment-1", "odoo-inventory-assignment-2")],
      },
      {
        title: "Accounting setup and daily transactions",
        learn: [
          A("odoo-setup-databases"),
          ...L(
            "odoo-accounting",
            "accounting-dependencies-and-configuration",
            "accounting-master-data-and-opening-balances",
            "accounting-transactions",
            "accounting-controls-reports-integration",
          ),
        ],
        practice: [...S("odoo-setup-databases-assignment-1"),...S("odoo-accounting-assignment-1"), LAB("Import Lab: master data in dependency order", "/import-lab")],
      },
      {
        title: "Accounting controls and Indian GST",
        learn: [
          ...L("odoo-accounting", "accounting-troubleshooting-and-interview", "india-gst-fundamentals", "india-gst-configuration-odoo", "india-e-invoicing-irn"),
        ],
        practice: [...S("odoo-accounting-assignment-2")],
      },
      {
        title: "GST compliance and manufacturing foundations",
        learn: [
          ...L("odoo-accounting", "india-eway-bill-returns-tds"),
          A("odoo-accounting"),
          P("plan-to-produce"),
          ...L("odoo-manufacturing", "manufacturing-overview-and-process-flow", "manufacturing-dependencies-and-configuration", "manufacturing-master-data"),
        ],
        practice: [...S("odoo-accounting-assignment-india-gst"), LAB("Project A kickoff: Trading Company", "/projects/trading-company-implementation")],
      },
      {
        title: "Manufacturing orders and costing",
        learn: [
          ...L("odoo-manufacturing", "manufacturing-transactions", "manufacturing-automation-reports-costing", "manufacturing-troubleshooting-and-interview"),
          A("odoo-manufacturing"),
          ...L("odoo-ecommerce-einvoicing", "ecommerce-overview-and-process-flow"),
        ],
        practice: [...S("odoo-manufacturing-assignment-1", "odoo-manufacturing-assignment-2"), LAB("Config Lab: Manufacturing Company", "/config-lab/manufacturing-company")],
      },
    ],
  },
  {
    title: "eCommerce, implementation and testing",
    goal: "Take an online order to an e-invoice, then run a project from discovery to go-live with a tested, signed-off solution.",
    days: [
      {
        title: "eCommerce and electronic invoicing",
        learn: [
          ...L(
            "odoo-ecommerce-einvoicing",
            "ecommerce-dependencies-prerequisites-configuration",
            "ecommerce-master-data-and-transactions",
            "einvoicing-concepts-formats-networks",
            "einvoicing-and-automation-in-odoo",
          ),
        ],
        practice: [...S("odoo-ecommerce-einvoicing-assignment-1"), LAB("Config Lab: Retail Business", "/config-lab/retail-business")],
      },
      {
        title: "eCommerce go-live and implementation approaches",
        learn: [
          ...L("odoo-ecommerce-einvoicing", "ecommerce-reports-accounting-integration", "ecommerce-troubleshooting-and-interview"),
          A("odoo-ecommerce-einvoicing"),
          P("project-to-profit"),
          ...L("implementation-methodology", "implementation-approaches", "phase-1-business-discovery", "phase-2-requirement-analysis"),
        ],
        practice: [...S("odoo-ecommerce-einvoicing-assignment-2"), LAB("Project A: requirements and AS-IS / TO-BE", "/projects/trading-company-implementation#requirements")],
      },
      {
        title: "Design, build and migrate",
        learn: [
          ...L(
            "implementation-methodology",
            "phase-3-to-be-process-design",
            "phase-4-solution-configuration",
            "phase-5-data-migration",
            "phase-6-development-integration",
            "phase-7-testing-training",
            "phase-8-go-live",
          ),
        ],
        practice: [...S("implementation-methodology-rtm"), LAB("Project A: load master data files", "/projects/trading-company-implementation#data")],
      },
      {
        title: "Post-go-live support and test design",
        learn: [
          ...L("implementation-methodology", "phase-9-post-go-live-support"),
          A("implementation-methodology"),
          ...L(
            "testing-qa",
            "erp-testing-fundamentals",
            "writing-business-scenario-test-cases",
            "functional-and-integration-testing",
            "data-migration-testing",
            "role-based-access-testing",
          ),
        ],
        practice: [LAB("Project A: run the transaction scenarios", "/projects/trading-company-implementation#transactions"), LAB("Log test cases in your test register", "/testing#register")],
      },
      {
        title: "UAT, regression and defect management",
        learn: [
          ...L(
            "testing-qa",
            "financial-inventory-reconciliation-tests",
            "user-acceptance-testing",
            "regression-testing",
            "negative-and-exception-testing",
            "defect-management-and-reporting",
          ),
          A("testing-qa"),
          ...L("odoo-technical-fundamentals", "odoo-architecture"),
        ],
        practice: [...S("testing-qa-assignment-1"), LAB("Project A: test cases and acceptance", "/projects/trading-company-implementation#tests")],
      },
    ],
  },
  {
    title: "Technical development and integration",
    goal: "Build and test a small Odoo module, connect Odoo to outside systems through its API, and present the capstone project.",
    days: [
      {
        title: "Developer toolkit and your first module",
        learn: [
          ...L(
            "odoo-technical-fundamentals",
            "python-essentials-for-odoo",
            "postgresql-essentials",
            "git-workflow-for-odoo-modules",
            "dev-environment-and-safety",
            "module-structure-and-manifest",
            "models-and-field-types",
            "computed-related-fields-and-constraints",
          ),
        ],
        practice: [LAB("Set up a development database and create a module skeleton", "/courses/odoo-technical-fundamentals/dev-environment-and-safety")],
      },
      {
        title: "Views, security and business logic",
        learn: [
          ...L(
            "odoo-technical-fundamentals",
            "views-and-view-inheritance",
            "actions-menus-and-security",
            "extending-sale-order",
            "smart-buttons",
            "approval-workflow",
            "scheduled-and-automated-actions",
          ),
        ],
        practice: [...S("odoo-technical-fundamentals-delivery-windows")],
      },
      {
        title: "Reports, debugging and automated tests",
        learn: [
          ...L("odoo-technical-fundamentals", "qweb-pdf-reports", "debugging-and-logging", "automated-tests", "practical-development-assignments"),
          A("odoo-technical-fundamentals"),
          ...L("integration-fundamentals", "rest-and-http-fundamentals"),
        ],
        practice: [...S("odoo-technical-fundamentals-approval-report")],
      },
      {
        title: "APIs, security and the Odoo external API",
        learn: [
          ...L(
            "integration-fundamentals",
            "json-and-xml",
            "authentication-and-authorization",
            "secrets-management",
            "webhooks",
            "postman-testing",
            "odoo-xml-rpc",
            "odoo-json-rpc-and-json-2",
          ),
        ],
        practice: [...S("integration-fundamentals-product-order-sync")],
      },
      {
        title: "Integration patterns and capstone",
        learn: [
          ...L("integration-fundamentals", "business-integrations", "middleware-and-scheduled-sync", "error-handling-retries-idempotency", "practical-integration-assignments"),
          A("integration-fundamentals"),
        ],
        practice: [
          ...S("integration-fundamentals-design-document"),
          LAB("Capstone: present Project A against the rubric", "/projects/trading-company-implementation#acceptance"),
          LAB("Collect your course certificates", "/assessments"),
          LAB("Final evaluation: present your projects (10+ minutes) for the final certificate", "/evaluation"),
        ],
      },
    ],
  },
];
