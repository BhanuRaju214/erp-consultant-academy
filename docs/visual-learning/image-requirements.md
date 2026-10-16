# Required images, illustrations and screenshots

This list covers every raster or vector asset the visual upgrade needs beyond the in-portal blocks. It has three groups: (A) authentic Odoo screenshots, (B) concept and scenario illustrations, (C) diagrams. Lesson references use `course-slug/lesson-slug`, as in `enhancement-matrix.md`. Diagram prompts live in `napkin-prompts.md`.

---

## A. Authentic Odoo screenshots

**Rule: screenshots must be captured from a real Odoo 17.0 training database. Never fabricate, edit field values into, or AI-generate an Odoo screen.** Until a screenshot exists and is approved, the lesson uses the labelled `visual-mockup` block ("Illustrative mockup — not a screenshot") proposed in the matrix. When the screenshot arrives, add it as a `visual-figure` next to the mockup or in place of it.

**Capture setup**

| Item | Requirement |
|---|---|
| Database | Odoo **17.0** training database (Enterprise where the lesson says the feature is Enterprise; state the edition in the caption). Separate India-localization database for GST/e-invoicing screens. |
| Data | Fictional only, exactly as named in the lessons: Northwind Office Supplies Pvt Ltd, Greenfield International School, Contoso Ltd, Paper Mills Inc, ErgoSeat Furniture (Sales/Purchase/Inventory/Accounting/CRM); Timbercraft (Manufacturing); Urban Thread Online, Atelier Mosa BV, Boutique Nordlicht GmbH (eCommerce); Bluewave Trading LLC (trading project); fictional GSTINs from the GST lessons. No real customer, employee, e-mail, bank or tax data. |
| External services | Sandbox/test mode only (IRP sandbox, Stripe test keys, Peppol test). Never capture real credentials, API keys or tokens. Blur API username fields. |
| Browser | English (US) UI, light theme, 1440 × 900 viewport at 2x device pixel ratio, browser chrome cropped, user avatar and name set to a training user (e.g. "Trainer"). |
| Annotations | Numbered cyan (`#17C0E2`) markers with a navy (`#0b1120`) outline. Numbers match the `annotations` of the corresponding `visual-mockup`. Use thin highlight boxes only, no arrows over field values. Annotate in a copy, never on the master capture. |
| Metadata | Record Odoo version/build, edition, database name and capture date in the registry entry. Re-capture after an upgrade. |

| ID | App | Menu path (as written in the lesson) | Record / data to show | Annotations | Used in |
|---|---|---|---|---|---|
| S-01 | Settings | Settings ▸ Users & Companies ▸ Users ▸ user ▸ Access Rights tab | Training user "Sales Coordinator" with Sales: User – Own Documents Only, Inventory: User | 1 app access level, 2 Accounting role, 3 multi-company field | erp-fundamentals/saas-hosting-environments-access; testing-qa/role-based-access-testing |
| S-02 | CRM | CRM ▸ Configuration ▸ Settings | Leads option enabled | 1 Leads checkbox, 2 Save | odoo-crm/prerequisites-configuration-settings |
| S-03 | CRM | CRM ▸ Sales ▸ My Pipeline (Kanban) | Northwind pipeline with stages New, Qualified, Proposition, Won; 4–6 fictional opportunities | 1 stage column, 2 expected revenue, 3 activity icon | odoo-crm/overview-and-business-problems |
| S-04 | CRM | CRM ▸ Leads ▸ Leads ▸ open lead ▸ Convert to Opportunity | Lead from walkthrough B (budget approx. INR 8 lakh); wizard with Conversion Action, Salesperson/Sales Team, Customer options | 1 Conversion Action, 2 Sales Team, 3 Customer choice, 4 Create Opportunity | odoo-crm/master-data-and-transactions |
| S-05 | CRM | CRM ▸ Reporting ▸ Pipeline (pivot; path per lesson table) | Pipeline by stage × salesperson | 1 measures, 2 group-by | odoo-crm/automation-reports-impact |
| S-06 | Sales | Sales ▸ Configuration ▸ Settings | Pricelists, Quotation Templates, Discounts, Online Signature/Payment as decided for Northwind | 1 Pricelists, 2 Quotation Templates, 3 Discounts, 4 Online Signature | odoo-sales/prerequisites-configuration-settings |
| S-07 | Sales | Sales ▸ Orders ▸ Quotations ▸ New | S00042 for Greenfield International School; Education pricelist; template "School Annual Supply"; 600 reams A4 at 262.20 | 1 Send by Email, 2 status bar, 3 pricelist, 4 unit price, 5 optional products tab | odoo-sales/master-data-and-transactions ★ |
| S-08 | Sales | Confirmed order ▸ Create Invoice wizard | 20 Executive Chairs order (INR 4,20,000); Down payment (percentage) 50 selected | 1 Regular invoice, 2 Down payment (percentage), 3 Down payment (fixed amount) | odoo-sales/master-data-and-transactions ★ |
| S-09 | Sales | Sales ▸ Reporting ▸ Sales | Pivot by product category × month | 1 measure, 2 margin column (if enabled) | odoo-sales/automation-reports-impact |
| S-10 | Purchase | Purchase ▸ Configuration ▸ Settings | Order Approval with minimum amount; Bill Control policy | 1 Order Approval, 2 minimum amount, 3 Bill Control | odoo-purchase/prerequisites-configuration-settings |
| S-11 | Purchase | Purchase ▸ Orders ▸ Requests for Quotation | RFQ to ErgoSeat Furniture, 50 executive chairs × 12,500, status To Approve | 1 status To Approve, 2 Approve Order button, 3 total | odoo-purchase/master-data-and-transactions; odoo-purchase/overview-and-business-problems |
| S-12 | Inventory | Inventory ▸ Products ▸ Products ▸ product ▸ Purchase tab | Vendor pricelist lines (vendor, min quantity, price, delivery lead time) | 1 vendor line, 2 min qty, 3 lead time | odoo-purchase/master-data-and-transactions |
| S-13 | Inventory | Inventory ▸ Configuration ▸ Warehouses | Warehouse NW: 1-step receipts, 2-step deliveries | 1 Incoming Shipments, 2 Outgoing Shipments | odoo-inventory/inventory-dependencies-and-configuration |
| S-14 | Inventory | Inventory ▸ Overview | Operation-type cards (Receipts, Delivery Orders, PICK) with counts | 1 Receipts card, 2 To Process button | odoo-inventory/inventory-overview-and-process-flow |
| S-15 | Inventory | Inventory ▸ Operations ▸ Transfers (Receipts) | P00021 receipt: 500 ordered, 300 done; backorder dialog | 1 quantity column, 2 Validate, 3 Create Backorder | odoo-inventory/inventory-transactions |
| S-16 | Inventory | Inventory ▸ Operations ▸ Transfers | NW/PICK/00031 Done and NW/OUT/00028 Ready for SO S00045 (Contoso Ltd, 120 reams) | 1 PICK state, 2 OUT state, 3 source document | odoo-inventory/inventory-transactions |
| S-17 | Inventory | Inventory ▸ Operations ▸ Replenishment | A4 paper rule: NW/Stock, min 400, max 1,200, multiple 100, route Buy | 1 forecast, 2 min/max, 3 Order Once, 4 Trigger | odoo-inventory/inventory-automation-reports-valuation |
| S-18 | Inventory | Inventory ▸ Reporting ▸ Valuation | Valuation layers after the receipt and delivery walkthroughs | 1 quantity, 2 total value | odoo-inventory/inventory-automation-reports-valuation; testing-qa/financial-inventory-reconciliation-tests |
| S-19 | Inventory | Inventory ▸ Operations ▸ Physical Inventory | Rack-B count with counted quantity differing by −3 | 1 Counted Quantity, 2 Difference, 3 Apply | odoo-inventory/inventory-master-data |
| S-20 | Accounting | Accounting ▸ Dashboard | Sales, Purchase, First City Bank journal cards | 1 bank card, 2 Reconcile button | odoo-accounting/accounting-overview-and-process-flow |
| S-21 | Accounting | Accounting ▸ Customers ▸ Invoices ▸ posted invoice ▸ Journal Items tab | Contoso Ltd invoice with receivable, revenue and tax lines | 1 Journal Items tab, 2 AR line, 3 tax line | odoo-accounting/accounting-overview-and-process-flow; odoo-accounting/accounting-transactions |
| S-22 | Accounting (Enterprise) | Accounting ▸ Dashboard ▸ bank journal ▸ Reconcile | Statement line "CONTOSO LTD INV/2025/00045 842.40" with proposed match | 1 statement line, 2 proposed counterpart, 3 Validate | odoo-accounting/accounting-transactions |
| S-23 | Accounting | Accounting ▸ Configuration ▸ Taxes | "Sales Tax 8%" excluded and price-included variant | 1 Amount, 2 Included in Price, 3 Tax Group | odoo-accounting/accounting-dependencies-and-configuration |
| S-24 | Contacts | Contacts ▸ Contoso Ltd ▸ Accounting / Sales & Purchase tabs | Payment terms, fiscal position, receivable account | 1 payment terms, 2 fiscal position, 3 receivable | odoo-accounting/accounting-master-data-and-opening-balances |
| S-25 | Accounting (Enterprise) | Accounting ▸ Reporting ▸ Profit and Loss (and Trial Balance) | Northwind period after the practice transactions | 1 period filter, 2 comparison | odoo-accounting/accounting-controls-reports-integration |
| S-26 | Settings (India DB) | Settings ▸ Users & Companies ▸ Companies | Northwind, Mumbai, Maharashtra, GSTIN 27ABCDE1234F1Z5 (fictional) | 1 GSTIN, 2 State, 3 PIN code | odoo-accounting/india-gst-configuration-odoo |
| S-27 | Contacts (India DB) | Contacts ▸ Deccan Traders LLP | GST Treatment and GSTIN 27PQRSX5678K1Z2 (fictional) | 1 GST Treatment, 2 GSTIN, 3 State | odoo-accounting/india-gst-configuration-odoo |
| S-28 | Accounting (India DB) | Accounting ▸ Customers ▸ Invoices | Invoice A (CGST 9% + SGST 9%) and Invoice B (IGST 18%), 50 chairs at ₹2,500 | 1 tax lines, 2 place of supply | odoo-accounting/india-gst-fundamentals |
| S-29 | Accounting (India DB, sandbox) | Posted invoice ▸ e-invoicing status | Status Sent with IRN, acknowledgement number/date from the **sandbox** IRP | 1 status, 2 IRN, 3 QR on PDF | odoo-accounting/india-e-invoicing-irn |
| S-30 | Manufacturing | Manufacturing ▸ Configuration ▸ Settings | Work Orders, By-Products, Subcontracting enabled | 1 Work Orders, 2 Subcontracting | odoo-manufacturing/manufacturing-dependencies-and-configuration |
| S-31 | Manufacturing | Manufacturing ▸ Products ▸ Bills of Materials | Kitchen Cabinet 60cm: Components tab and Operations tab (Cut panels, Assemble carcass, Spray finish) | 1 component qty, 2 operation, 3 work center, 4 duration | odoo-manufacturing/manufacturing-master-data |
| S-32 | Manufacturing | BoM ▸ BoM Overview (structure & cost) | Cost roll-up totalling 106.20 | 1 component cost, 2 operation cost, 3 total | odoo-manufacturing/manufacturing-master-data |
| S-33 | Manufacturing | Manufacturing ▸ Operations ▸ Manufacturing Orders | MO for 10 cabinets, In Progress, Work Orders tab | 1 status bar, 2 Work Orders tab, 3 Produce/Mark as Done | odoo-manufacturing/manufacturing-transactions |
| S-34 | Website | Website ▸ Configuration ▸ Settings | eCommerce settings chosen for Urban Thread (tax display, checkout options) | 1 prices tax-included, 2 automatic invoice | odoo-ecommerce-einvoicing/ecommerce-dependencies-prerequisites-configuration |
| S-35 | Website | Shop checkout (front end) | Canal Hoodie order, payment step with Stripe in test mode | 1 delivery method, 2 payment provider | odoo-ecommerce-einvoicing/ecommerce-overview-and-process-flow |
| S-36 | Accounting | Posted invoice ▸ Send & Print | Boutique Nordlicht GmbH invoice with e-invoice/Peppol options visible | 1 Email, 2 XML format, 3 Peppol | odoo-ecommerce-einvoicing/einvoicing-and-automation-in-odoo |
| S-37 | Settings (dev DB) | Settings ▸ Technical ▸ Record Rules (developer mode) | Record rule from academy_sale_extension ("own orders" rule) | 1 domain, 2 groups, 3 permissions | odoo-technical-fundamentals/actions-menus-and-security |
| S-38 | Settings (dev DB) | Settings ▸ Technical ▸ Automation Rules | Automation rule from the scheduled-actions lesson | 1 trigger, 2 action | odoo-technical-fundamentals/scheduled-and-automated-actions |
| S-39 | Sales (dev DB) | Sales order with academy_sale_extension installed | Header Request Approval / Approve / Reject buttons and custom smart button | 1 approval state, 2 buttons, 3 smart button | odoo-technical-fundamentals/approval-workflow; odoo-technical-fundamentals/smart-buttons |
| S-40 | Any (dev DB) | Developer mode debug menu ▸ View Fields | sale.order fields list | 1 debug icon, 2 technical name | odoo-technical-fundamentals/debugging-and-logging |

★ = prototype lesson (capture first).

---

## B. Illustrations (concept and scenario)

Illustrations are for ideas a screenshot cannot show, such as context, structure or physical reality. They are never decorative.

**Style guide**

- Flat vector (SVG), simple geometric shapes, 2 px strokes, generous whitespace.
- Brand palette: navy `#0b1120` (primary shapes/text), cyan `#17C0E2` (accent/active path). Neutral greys for secondary elements. Status colours only to mean success/warning/danger.
- Must read in both light and dark themes: transparent background, and no navy text on a dark background. Supply a dark variant if needed.
- Icons follow the portal icon set (database, cart, truck, warehouse, factory, invoice, bank…).
- **No stock photos of people.** Use people only as simple role icons, and only where real workplace context is essential (e.g. shop floor or warehouse roles).
- Text inside the SVG stays as live text, in the portal font, with ≥ 14 px equivalent at 1x. Names come from the lessons and are fictional.

| ID | Illustration | Purpose (what the learner should grasp) | Lesson(s) |
|---|---|---|---|
| I-01 | Disconnected landscape vs integrated ERP | Shows online store, spreadsheets, accounting tool and CSV hand-offs next to one shared database. Supports the `visual-beforeafter` block. | erp-fundamentals/problems-with-disconnected-applications |
| I-02 | ERP layered architecture | Shows UI, application server (modules), integration layer and database as stacked layers, with reporting and external systems at the edges. | erp-fundamentals/erp-architecture-components |
| I-03 | Shared-responsibility stack | Shows hardware, OS/DB, backups, upgrades, custom code, users and data quality for SaaS / managed / on-premises. Users and data are always the client's. | erp-fundamentals/cloud-vs-on-premises |
| I-04 | Environment ladder | Shows DEV, TEST, STAGING and PRODUCTION with the kind of data in each and the promotion direction. | erp-fundamentals/saas-hosting-environments-access; odoo-technical-fundamentals/dev-environment-and-safety |
| I-05 | Northwind company profile card | One-glance scenario context: products, customer types, Standard/Education/Key Account pricelists, payment terms. | odoo-sales/overview-and-business-problems (reused by CRM/Purchase/Inventory/Accounting overviews) |
| I-06 | Warehouse floor-to-location map | Maps physical stops (dock, input, quality, racks, packing zone, output) to Odoo locations WH/Input, WH/Quality Control, WH/Stock, WH/Packing Zone, WH/Output. | odoo-inventory/inventory-overview-and-process-flow; odoo-inventory/inventory-master-data |
| I-07 | Timbercraft shop floor | Shows the Cutting, Assembly and Finishing stations as work centers with time recorded per operation. Role icons allowed. | odoo-manufacturing/manufacturing-overview-and-process-flow |
| I-08 | Urban Thread online-retail context | Shows the shop, payment provider, warehouse, bank payout and customer returns as the actors around the Odoo database. | odoo-ecommerce-einvoicing/ecommerce-overview-and-process-flow |
| I-09 | Provider payout net of fees | Shows gross order payments, minus provider fees, equal to the net payout to the bank. Explains why reconciliation needs a fee line. | odoo-ecommerce-einvoicing/ecommerce-reports-accounting-integration |
| I-10 | PDF invoice vs structured e-invoice | Shows a human-readable page next to a machine-readable XML tree with the same seller, buyer, tax and totals fields highlighted. | odoo-ecommerce-einvoicing/einvoicing-concepts-formats-networks |
| I-11 | GSTIN anatomy | Shows fictional 27ABCDE1234F1Z5 split into labelled positions (state code, PAN, entity number, default Z, check digit), as in the lesson table. | odoo-accounting/india-gst-fundamentals |
| I-12 | Odoo module anatomy | Shows the folder tree (`__manifest__.py`, models, security, views, data, report, tests) with each folder's purpose. | odoo-technical-fundamentals/module-structure-and-manifest |
| I-13 | Relational field types | Shows sale.order (1) to academy.delivery.window (many) and delivery window to tag (many-to-many), using crow's-foot notation. | odoo-technical-fundamentals/models-and-field-types |
| I-14 | Three security layers | Shows groups, then access rights (ir.model.access.csv), then record rules as nested filters, with the Sam / Mia / Wes outcomes. | odoo-technical-fundamentals/actions-menus-and-security; testing-qa/role-based-access-testing |
| I-15 | Anatomy of an HTTP request | Shows method, URL, headers (auth, content type) and body as labelled parts, with the response status code. | integration-fundamentals/rest-and-http-fundamentals |
| I-16 | Where secrets live | Shows forbidden places (repository, chat, screenshot, log) next to approved ones (environment variables, secret store). | integration-fundamentals/secrets-management |
| I-17 | Severity vs priority grid | A 2 × 2 grid using the lesson's examples: year-end report wrong (high severity / low priority) and wrong logo for the CEO (low severity / high priority). | testing-qa/defect-management-and-reporting |
| I-18 | Customization effort over time | Shows effort curves for "mostly standard" vs "heavily customised" across go-live, upgrade 1 and upgrade 2. Redraws the ASCII chart. | erp-fundamentals/standard-vs-customization |

---

## C. Diagrams

Process, lifecycle and decision diagrams are built two ways:

1. **In-portal blocks** (`visual-flow`, `visual-steps`, `visual-decision`, `visual-timeline`, `visual-compare`, `visual-journal`…). These are the primary, accessible and theme-aware versions. Every lesson's blocks are listed in `enhancement-matrix.md`.
2. **Napkin AI figures** (`visual-figure`). These are optional polished overviews and are produced with the prompts in `napkin-prompts.md`.

| Napkin ID | Diagram | Target lesson / page | In-portal block it complements |
|---|---|---|---|
| NP-01 | Order to Cash swimlane | processes/order-to-cash | existing interactive process flow + `visual-journal` |
| NP-02 | Procure to Pay swimlane | processes/procure-to-pay | existing interactive process flow + `visual-journal` |
| NP-03 | Inventory management flow | processes/inventory-management | existing interactive process flow |
| NP-04 | Record to Report cycle | processes/record-to-report | `visual-timeline` (month-end close) |
| NP-05 | Plan to Produce flow | processes/plan-to-produce | existing interactive process flow |
| NP-06 | Project to Profit flow | processes/project-to-profit; config-scenarios/professional-services | `visual-compare` (GL vs analytic) |
| NP-07 | Integrated document chain | erp-fundamentals/what-is-erp | `visual-flow` |
| NP-08 | Standard-first ladder | erp-fundamentals/standard-vs-customization | `visual-decision` |
| NP-09 | Ticket diagnosis tree | erp-fundamentals/consultant-types | `visual-decision` |
| NP-10 | Implementation lifecycle (9 phases) | implementation-methodology/implementation-approaches | `visual-timeline` |
| NP-11 | TO-BE quote-to-install | implementation-methodology/phase-3-to-be-process-design | `visual-flow` |
| NP-12 | Data migration cycle | implementation-methodology/phase-5-data-migration | `visual-flow` |
| NP-13 | Cutover timeline | implementation-methodology/phase-8-go-live | `visual-timeline` |
| NP-14 | Ticket lifecycle and escalation | implementation-methodology/phase-9-post-go-live-support | `visual-flow` ×2 |
| NP-15 | Gap to customization | implementation-methodology/phase-6-development-integration | `visual-flow` |
| NP-16 | CRM enquiry to won/lost | odoo-crm/overview-and-business-problems | `visual-flow` + `visual-decision` |
| NP-17 | Sales quotation to invoice | odoo-sales/overview-and-business-problems; odoo-sales/master-data-and-transactions | `visual-flow` / `visual-steps` |
| NP-18 | Purchase RFQ to payment | odoo-purchase/overview-and-business-problems | `visual-flow` + `visual-decision` |
| NP-19 | Inventory routes | odoo-inventory/inventory-overview-and-process-flow | `visual-flow` + `visual-compare` |
| NP-20 | Reordering rule logic | odoo-inventory/inventory-automation-reports-valuation | `visual-scenario` |
| NP-21 | O2C / P2P accounting impact | odoo-accounting/accounting-overview-and-process-flow | `visual-flow` ×2 |
| NP-22 | Bank reconciliation | odoo-accounting/accounting-transactions | `visual-flow` + `visual-mockup` |
| NP-23 | Record-to-report close | odoo-accounting/accounting-overview-and-process-flow | `visual-flow` (compact) |
| NP-24 | GST intra vs inter-state | odoo-accounting/india-gst-fundamentals | `visual-decision` + `visual-journal` |
| NP-25 | E-invoice IRN flow | odoo-accounting/india-e-invoicing-irn | `visual-flow` + `visual-decision` |
| NP-26 | GSTR-2B reconciliation | odoo-accounting/india-eway-bill-returns-tds | `visual-decision` |
| NP-27 | MO lifecycle | odoo-manufacturing/manufacturing-overview-and-process-flow; manufacturing-transactions | `visual-flow` |
| NP-28 | BoM cost roll-up | odoo-manufacturing/manufacturing-master-data; config-scenarios/manufacturing-company | `visual-scenario` |
| NP-29 | Subcontracting flow | odoo-manufacturing/manufacturing-transactions | `visual-flow` |
| NP-30 | Online order-to-cash | odoo-ecommerce-einvoicing/ecommerce-overview-and-process-flow | `visual-flow` |
| NP-31 | Peppol four-corner model | odoo-ecommerce-einvoicing/einvoicing-concepts-formats-networks | `visual-flow` |
| NP-32 | E-invoicing regulatory models | odoo-ecommerce-einvoicing/einvoicing-concepts-formats-networks | `visual-compare` |
| NP-33 | Odoo Peppol setup and send | odoo-ecommerce-einvoicing/einvoicing-and-automation-in-odoo | `visual-steps` |
| NP-34 | Odoo request flow | odoo-technical-fundamentals/odoo-architecture | `visual-flow` |
| NP-35 | action_confirm super() chain | odoo-technical-fundamentals/extending-sale-order | `visual-flow` |
| NP-36 | Approval state machine | odoo-technical-fundamentals/approval-workflow | `visual-flow` |
| NP-37 | XML-RPC call sequence | integration-fundamentals/odoo-xml-rpc | `visual-flow` |
| NP-38 | Webhook receive pipeline | integration-fundamentals/webhooks | `visual-flow` + `visual-decision` |
| NP-39 | Error class and retry strategy | integration-fundamentals/error-handling-retries-idempotency | `visual-decision` + `visual-timeline` |
| NP-40 | Middleware queue and sync | integration-fundamentals/middleware-and-scheduled-sync | `visual-flow` + `visual-compare` |
| NP-41 | Testing lifecycle | testing-qa/erp-testing-fundamentals | `visual-flow` |
| NP-42 | Defect lifecycle | testing-qa/defect-management-and-reporting | `visual-flow` |
| NP-43 | UAT flow | testing-qa/user-acceptance-testing | `visual-flow` + `visual-decision` |
| NP-44 | Regression test cycle | testing-qa/regression-testing | `visual-flow` |

Illustration I-18 (effort curve) can also be produced in Napkin with a short prompt built from the lesson's ASCII chart. It goes through the same review.

---

## Naming and storage convention

| Rule | Convention |
|---|---|
| Folder | `public/visuals/<course-slug>/<lesson-slug>/`. Processes: `public/visuals/processes/<process-slug>/`. Scenarios: `public/visuals/config-scenarios/<scenario-slug>/`. Shared assets (e.g. I-05 reused across courses): `public/visuals/shared/`. Use the course **slug** (e.g. `odoo-technical-fundamentals`), not the file name. |
| File name | Descriptive kebab-case, prefixed by kind: `screen-<app>-<subject>.png` (e.g. `screen-sales-quotation-s00042.png`), `illus-<subject>.svg` (e.g. `illus-warehouse-location-map.svg`), Napkin diagrams use the file names in `napkin-prompts.md` (e.g. `bom-cost-roll-up.svg`). Annotated copies end with `-annotated`. No spaces, capitals, dates or version numbers in names. Version history lives in git. |
| Source files | Keep editable sources (Napkin link, `.fig`/`.ai`, un-annotated capture) outside `public/`, e.g. `docs/visual-learning/sources/`, or in the design drive. Only optimised exports go in `public/`. |
| Registry | Every file in `public/visuals/` must have an entry in `src/content/visuals/registry.ts`: `src`, `alt`, `caption`, `source` ("Odoo 17.0 training database", "Napkin AI", "In-house illustration"), `width`, `height`, rights note, capture/creation date. `npm run visuals:check` must pass. |
| Alt text | Required for every image. It describes the meaning (what the learner should understand), not the appearance, in 1–2 sentences. For screenshots, name the screen and the highlighted fields. Empty alt is allowed only for purely redundant images, which this plan does not propose. |
| Captions | Name the screen or concept plus the edition/version for screenshots, e.g. "Bank reconciliation widget (Odoo 17 Enterprise)". |

## Optimisation targets

| Asset type | Format | Target |
|---|---|---|
| Diagrams, illustrations, Napkin exports | **SVG** (preferred) | Optimised with SVGO; fonts converted to live text or subset; no embedded raster images; ≤ 150 KB typical |
| Screenshots, or Napkin export when SVG is unavailable | PNG at **2x** | **≤ 300 KB** each (quantise with pngquant/oxipng); **max width 1600 px** |
| Photographs (only if a real workplace photo is unavoidable) | **WebP** | **≤ 200 KB**, max width 1600 px, people only with documented consent |
| All | — | `width`/`height` recorded in the registry and the `visual-figure` block to prevent layout shift; descriptive kebab-case names; alt text required; no text baked into raster images that the lesson does not repeat in accessible text |
