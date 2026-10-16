import type { CourseContent } from "../types";
import { whatIsErpBody } from "../visual-lessons/erp-what-is-erp";

/**
 * ERP Fundamentals — the entry course of the ERP Consultant Academy.
 * Platform-independent; Odoo is referenced only as an illustrative example.
 * All companies and figures are fictional.
 */
export const erpFundamentals: CourseContent = {
  slug: "erp-fundamentals",
  section: "erp-fundamentals",
  title: "ERP Fundamentals",
  summary:
    "Understand what an ERP system is, why companies implement one, how it is built and deployed, who is involved in an implementation and what makes projects succeed or fail. The foundation every techno-functional consultant needs before touching a single configuration screen.",
  level: "beginner",
  platform: "generic",
  odooVersion: "Version-independent",
  position: 1,
  skills: [
    "Explain ERP concepts to business stakeholders",
    "Identify problems caused by disconnected applications",
    "Describe ERP architecture and components",
    "Compare cloud, hosted and on-premises deployment models",
    "Distinguish configuration, customization and extension",
    "Describe consultant roles and project responsibilities (RACI)",
    "Assess ERP costs, benefits, risks and success factors",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1 — Why ERP Exists",
      lessons: [
        {
          slug: "what-is-erp",
          title: "What is ERP?",
          durationMin: 25,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: whatIsErpBody,
          flashcards: [
            { term: "ERP", definition: "Enterprise Resource Planning — an integrated suite of business applications sharing one database and common master data." },
            { term: "MRP", definition: "Material Requirements Planning — the 1970s precursor to ERP that calculates material needs from a production plan." },
            { term: "Integration", definition: "The property that a transaction in one module automatically updates related records in other modules." },
            { term: "Master data", definition: "Relatively stable reference data (customers, vendors, products, accounts) reused by many transactions." },
            { term: "Order to Cash (O2C)", definition: "End-to-end process from customer order through delivery, invoicing and payment collection." },
            { term: "Procure to Pay (P2P)", definition: "End-to-end process from purchase requisition through goods receipt, vendor bill and payment." },
          ],
          resources: [{ title: "Odoo 17.0 documentation (overview of apps)", kind: "link", url: "https://www.odoo.com/documentation/17.0/" }],
        },
        {
          slug: "why-businesses-implement-erp",
          title: "Why Businesses Implement ERP",
          durationMin: 20,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Companies rarely buy an ERP because it is fashionable. They buy one because something hurts: customers complain about late deliveries, the auditor finds stock differences, the owner cannot get a profit figure without waiting three weeks, or the business has grown from one branch to five and the old tools cannot cope.

As a consultant, your first job is to understand **why** this particular client is implementing ERP. The reason shapes scope, priorities and how success will be measured.

## Common business drivers

| Driver | Symptom the client describes | What ERP provides |
|---|---|---|
| Growth | "We opened two new branches and nothing scales." | Multi-company / multi-warehouse structure, standard processes |
| Visibility | "I don't know our real margin per product." | Real-time reports from one database |
| Control | "Anyone can give any discount." | Access rights, approval workflows, audit trail |
| Efficiency | "We type every order three times." | Single data entry flowing across modules |
| Compliance | "Tax filing takes a week and has errors." | Configured taxes, consistent ledgers, reports |
| Customer service | "We promise dates we cannot keep." | Stock availability and lead times at order entry |
| Legacy replacement | "The old system is unsupported." | Modern, supported platform |
| Investor / audit pressure | "The auditors want proper controls." | Segregation of duties, traceability |

## Tangible vs intangible benefits

**Tangible benefits** can be measured in money or time:

- Lower inventory (less safety stock because data is reliable)
- Fewer staff hours on data entry and reconciliation
- Faster month-end close
- Faster cash collection (invoices go out the day goods ship)
- Fewer stock write-offs

**Intangible benefits** are real but harder to quantify:

- Better decisions from trustworthy data
- Improved customer experience
- Standardised processes that make new branches easier to open
- Reduced dependency on "the one person who knows the spreadsheet"

## Triggers by industry

- **Manufacturing** — need for bills of materials, work orders, production costing and material planning.
- **Retail** — point of sale linked to central inventory, promotions, multi-store replenishment.
- **Distribution / wholesale** — fast order processing, multi-warehouse stock, pricelists per customer group, landed costs.
- **Professional services** — timesheets, project profitability, billing by milestone or time and materials.
- **Construction** — project costing, subcontractor purchasing, progress billing, retention.
- **Interior design** — quotations with many custom items, purchase from multiple vendors per project, site installation scheduling.

## Building the business case

A business case connects drivers to measurable outcomes. A simple structure:

1. **Current situation** — pain points with evidence (e.g. "average order entry time 18 minutes").
2. **Objectives** — SMART goals (e.g. "reduce order entry time to under 5 minutes within 6 months of go-live").
3. **Scope** — which processes and modules.
4. **Costs** — licences, implementation, hardware/hosting, training, internal time.
5. **Benefits** — tangible savings per year plus intangible benefits.
6. **Risks** — and how they will be mitigated.

## Real-world scenario

**UrbanNest Interiors**, a fictional interior-design firm with 40 staff, runs projects for offices and homes. Designers quote in spreadsheets, buyers order furniture from a dozen vendors, and the owner learns a project lost money only after it is finished. Their ERP objectives were:

- See estimated vs actual cost per project at any time.
- Convert an approved quotation into purchase orders without retyping.
- Invoice clients in milestones (advance, delivery, installation).

These three objectives became the acceptance criteria for the project. Anything that did not support them was deferred to a later phase.

## The consultant's role

You must turn vague wishes ("we want everything automated") into prioritised, measurable objectives. Ask:

- What decision can you not make today because data is missing?
- Which task wastes the most hours each week?
- What would make this project a success in the owner's eyes twelve months from now?

## Key takeaways

- ERP projects are driven by business pain: growth, visibility, control, efficiency, compliance.
- Benefits are tangible (time, money, inventory) and intangible (decisions, scalability).
- Drivers differ by industry; learn the industry before proposing scope.
- A business case links objectives to costs, benefits and risks.
- Clear objectives become the yardstick for scope decisions and acceptance.
`,
          flashcards: [
            { term: "Business driver", definition: "The underlying business reason (growth, control, compliance, etc.) for implementing ERP." },
            { term: "Business case", definition: "A document justifying an investment by comparing costs, benefits and risks against objectives." },
            { term: "Tangible benefit", definition: "A benefit measurable in money or time, such as reduced inventory or faster close." },
            { term: "Intangible benefit", definition: "A real but hard-to-quantify benefit, such as better decision-making or customer satisfaction." },
            { term: "SMART objective", definition: "An objective that is Specific, Measurable, Achievable, Relevant and Time-bound." },
          ],
        },
        {
          slug: "problems-with-disconnected-applications",
          title: "Problems with Disconnected Applications",
          durationMin: 25,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Most small and medium businesses grow organically. They start with spreadsheets, add a standalone accounting package, then an online store, a separate CRM, perhaps a courier portal. Each tool solves one problem well. Over time, the company ends up with **islands of data** connected only by people re-typing information.

Understanding these problems precisely is essential: during discovery you will document them as **pain points**, and they will justify the scope of the ERP.

## A typical disconnected landscape

\`\`\`visual-cards
{
  "label": "Disconnected landscape",
  "title": "Five tools, five versions of the truth",
  "columns": 3,
  "cards": [
    {
      "icon": "store",
      "title": "Online store",
      "body": "Orders are exported **weekly as CSV** — up to a week out of date.",
      "tone": "warning"
    },
    {
      "icon": "file",
      "title": "Order spreadsheet",
      "body": "Orders are **re-typed manually** into the accounting package.",
      "tone": "danger"
    },
    {
      "icon": "users",
      "title": "CRM tool",
      "body": "Used by the **sales team**; no link to stock or invoices.",
      "tone": "neutral"
    },
    {
      "icon": "warehouse",
      "title": "Warehouse spreadsheet",
      "body": "Kept by the **storekeeper**; stock levels nobody else can see.",
      "tone": "neutral"
    },
    {
      "icon": "landmark",
      "title": "Accounting package",
      "body": "The **accountant** re-keys orders and chases missing ones.",
      "tone": "neutral"
    },
    {
      "icon": "alert",
      "title": "Result",
      "body": "Typos, missed orders, delays and no single, trusted view of the business.",
      "tone": "danger"
    }
  ]
}
\`\`\`

## The core problems

### 1. Double (or triple) data entry
The same customer, product or order is typed into several systems. Each entry costs time and introduces typing errors. A wrong digit in a price or quantity travels silently until a customer complains.

### 2. No single source of truth
When the CRM says a customer owes 10,000, the accounting package says 12,500 and the sales spreadsheet says 9,800, which one is right? Meetings turn into arguments about whose numbers to trust instead of decisions.

### 3. Delayed information
Data moves in batches — a weekly export, a month-end upload. Managers make decisions on stale information: selling stock that was already sold, or reordering items that just arrived.

### 4. Spreadsheet risk
Spreadsheets are flexible but fragile:

- Formulas are overwritten accidentally.
- Multiple versions circulate by email ("Stock_v7_FINAL_new.xlsx").
- There is no access control or audit trail — anyone can change a past figure.
- Knowledge lives in one person's head.

### 5. Weak controls
Without integrated workflows, approvals happen by email or not at all. A purchase can be placed without a budget check; a discount can be given without a manager's approval; goods can be shipped to a customer who is over their credit limit.

### 6. Poor reporting
Combining data from several tools requires manual consolidation. Reports take days, are often inconsistent and cannot be drilled down to the source transaction.

### 7. Reconciliation overhead
Finance spends days at month-end matching stock values, sales totals and bank receipts across systems.

## Measuring the cost

| Problem | How to quantify during discovery |
|---|---|
| Double entry | Minutes per transaction × transactions per month × hourly cost |
| Errors | Number of credit notes / returns caused by wrong data |
| Delayed info | Stock-outs or overstock incidents per month |
| Reconciliation | Days to close the books |
| Weak controls | Unapproved discounts, bad debts, unexplained stock losses |

Numbers make the business case convincing and give you a baseline to measure after go-live.

## Real-world scenario

**Coastal Supplies Trading**, a fictional distributor of cleaning products, used an online B2B portal, a standalone accounting package and three warehouse spreadsheets (one per site). In discovery the consultant found:

- Each order was keyed twice — portal to spreadsheet, spreadsheet to accounting — about 9 minutes of extra effort per order on 1,400 orders a month (roughly 210 hours per month).
- The three warehouse sheets disagreed with the accounting stock value by about 6% at every audit.
- Customers over their credit limit still received goods because the warehouse could not see receivables.

The ERP proposal targeted exactly these points: one sales order flowing to delivery and invoice, one inventory valuation linked to accounting, and a credit check at order confirmation.

## Integration is not the same as ERP

Some companies try to "glue" separate tools together with integrations. This can work, but each connector must be built, monitored and maintained, and master data still lives in several places. ERP reduces the number of integrations needed by putting core processes on one database; integrations are then reserved for genuinely external systems (banks, couriers, marketplaces, government portals).

## Key takeaways

- Disconnected tools cause double entry, conflicting numbers, delays, weak controls and slow reporting.
- "No single source of truth" is the most damaging problem: people stop trusting data.
- Spreadsheets lack access control, audit trail and version control.
- Quantify each problem during discovery to build the business case and a baseline.
- ERP reduces — but does not eliminate — the need for integrations.
`,
          flashcards: [
            { term: "Single source of truth", definition: "One authoritative location for each piece of data, so all users see the same figures." },
            { term: "Double data entry", definition: "Typing the same information into more than one system, causing wasted effort and errors." },
            { term: "Data silo", definition: "A store of data isolated in one department or tool and not shared with others." },
            { term: "Audit trail", definition: "A record of who created or changed a transaction and when." },
            { term: "Reconciliation", definition: "Matching figures between two sources (e.g. stock report vs ledger) and explaining differences." },
            { term: "Pain point", definition: "A specific problem the business experiences, captured during discovery to justify scope." },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2 — ERP Architecture and the Software Landscape",
      lessons: [
        {
          slug: "erp-architecture-components",
          title: "ERP Architecture and Major Components",
          durationMin: 30,
          odooVersions: "Version-independent (Odoo used as example)",
          scope: ["standard"],
          body: `## Business context

A finance director of **Vertex Build Contractors** (fictional) asks: "If I change a customer's payment terms in the sales screen, will the accountant see it?" To answer confidently you need to understand how an ERP is put together. A techno-functional consultant does not need to be a system architect, but must understand the layers well enough to explain behaviour, diagnose issues and talk to developers.

## The layered view

\`\`\`visual-layers
{
  "title": "How an ERP is put together",
  "caption": "Every module reads and writes the same database — that is why a payment term changed in Sales is immediately visible to Accounting.",
  "layers": [
    {
      "title": "User interface",
      "subtitle": "How people work with the system",
      "icon": "globe",
      "items": [
        "Web browser",
        "Mobile app",
        "POS terminal"
      ]
    },
    {
      "title": "Application server",
      "subtitle": "Business modules and rules",
      "icon": "server",
      "items": [
        "CRM",
        "Sales",
        "Purchase",
        "Inventory",
        "Manufacturing",
        "Accounting",
        "HR",
        "Projects",
        "…"
      ],
      "detail": "Business rules, workflows, security and automation run here."
    },
    {
      "title": "Integration layer",
      "subtitle": "How other systems connect",
      "icon": "plug",
      "items": [
        "APIs",
        "Connectors",
        "Import / export"
      ]
    },
    {
      "title": "Database",
      "subtitle": "One shared source of truth",
      "icon": "database",
      "items": [
        "Shared master data",
        "Transactions"
      ]
    }
  ],
  "connects": [
    {
      "title": "Reporting & analytics",
      "detail": "Dashboards and BI tools read from the shared data.",
      "icon": "chart"
    },
    {
      "title": "External systems",
      "detail": "Banks, couriers and e-commerce exchange data through the integration layer.",
      "icon": "link"
    }
  ]
}
\`\`\`

## Component by component

### Modules (applications)
Each module covers a business area: CRM, Sales, Purchase, Inventory, Manufacturing, Accounting, HR, Projects, and so on. Modules can usually be installed independently, but their value comes from working together. In Odoo, these are called **apps**; installing Sales and Inventory together, for example, links sales orders to deliveries automatically.

### Shared master data
Master data is the backbone of integration:

| Master data | Used by |
|---|---|
| Customers / contacts | CRM, Sales, Accounting, Helpdesk |
| Vendors | Purchase, Accounting |
| Products | Sales, Purchase, Inventory, Manufacturing, POS |
| Chart of accounts | Accounting, every module that posts entries |
| Taxes | Sales, Purchase, Accounting |
| Employees | HR, Timesheets, Projects |
| Warehouses / locations | Inventory, Manufacturing, Sales |

In Odoo, customers and vendors are both stored as **contacts** — the same record can be both a customer and a vendor.

### Database
All master data and transactions live in one relational database (Odoo uses PostgreSQL). Because everything is in one place, a report can combine sales, stock and accounting data without exports.

### Application server
The server holds the business logic: what happens when an order is confirmed, which accounts a vendor bill posts to, who may approve what. It also enforces **security** — users, groups, access rights and record-level rules.

### User interface (UI)
Users interact through a web browser, mobile apps, or specialised screens such as point-of-sale or shop-floor tablets. A good UI hides complexity; the consultant's job is often to make sure each role sees only what it needs.

### Integration layer
External systems connect via **APIs** (application programming interfaces), file imports/exports, or ready-made connectors. Typical integrations: bank statement feeds, payment gateways, courier tracking, e-commerce marketplaces, e-invoicing portals.

### Reporting
ERPs provide operational reports (stock on hand, open orders), financial reports (balance sheet, profit and loss, aged receivables) and analytical views (pivot tables, graphs, dashboards). Some companies add external BI tools for advanced analytics.

## Transactions vs master data vs configuration

| Type | Example | Changes how often? |
|---|---|---|
| Configuration | Tax rates, warehouse setup, approval rules | Rarely — set during implementation |
| Master data | Customers, products, vendors | Occasionally |
| Transactions | Orders, invoices, stock moves, payments | Constantly |

Mixing these up is a classic beginner mistake. A wrong configuration affects every future transaction; a wrong transaction affects only itself.

## Real-world scenario

At **Vertex Build Contractors** the finance director's question has a simple answer: payment terms are stored on the **customer master record**, which both Sales and Accounting read. When the salesperson updates the terms, the next quotation and the next invoice both use them. However, invoices already posted keep their original terms — they are transactions, and changing master data does not rewrite history. That distinction (master data vs transaction) saves hours of confused support calls.

## Key takeaways

- An ERP has layers: UI, application server (modules + logic + security), integration, database, reporting.
- Shared master data is what makes modules integrated.
- One database lets reports combine data across departments.
- Distinguish configuration, master data and transactions — they behave differently.
- Changing master data affects future transactions, not posted history.
`,
          flashcards: [
            { term: "Module / App", definition: "A functional component of an ERP covering one business area, e.g. Sales or Inventory." },
            { term: "Application server", definition: "The layer that runs business logic, workflows and security rules." },
            { term: "API", definition: "Application Programming Interface — a defined way for external systems to read or write ERP data." },
            { term: "Relational database", definition: "A database storing data in related tables; Odoo uses PostgreSQL." },
            { term: "Configuration data", definition: "Settings that control system behaviour, such as taxes, journals and warehouses." },
            { term: "Transaction data", definition: "Records of business events such as orders, invoices, payments and stock moves." },
            { term: "Chart of accounts", definition: "The list of general ledger accounts used to record financial transactions." },
          ],
          resources: [{ title: "Odoo 17.0 documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/" }],
        },
        {
          slug: "crm-vs-erp-vs-accounting",
          title: "CRM vs ERP vs Accounting Software vs Standalone Apps",
          durationMin: 20,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Clients often say "we already have software". **PeakForm Retail** (fictional, 6 sports-goods stores) has a popular accounting package, a cloud CRM, and a point-of-sale system. The owner asks: "Why do I need ERP? Can't I just connect what I have?" To answer honestly you must understand what each category of software does and where its boundaries lie.

## The categories

### Accounting software
Records financial transactions: invoices, bills, payments, bank reconciliation, ledgers, tax returns and financial statements. Some packages have basic inventory, but usually without warehouses, lots/serials, manufacturing or advanced purchasing.

### CRM (Customer Relationship Management)
Manages the front office: leads, opportunities, pipeline stages, activities, emails and marketing. CRM knows the *customer* very well but usually knows nothing about stock, costs or accounting.

### Standalone (point) applications
Specialised tools for one job: a POS, an e-commerce store, a timesheet app, a helpdesk tool, a warehouse barcode app. They are often excellent at their single task.

### ERP
Covers the core operations of the whole business on one database — usually including accounting, sales, purchasing and inventory, and optionally CRM, manufacturing, HR, projects, POS and e-commerce.

## Comparison

| Aspect | Accounting | CRM | Standalone app | ERP |
|---|---|---|---|---|
| Primary users | Finance | Sales, marketing | One team | All departments |
| Data scope | Financial | Customers & pipeline | One domain | Whole business |
| Inventory & warehouses | Basic or none | None | Only if specialised | Full |
| Process coverage | Record-to-report | Lead-to-opportunity | One task | End-to-end (O2C, P2P, etc.) |
| Integration need | High if business is complex | High | High | Lower (core is built-in) |
| Implementation effort | Low | Low–medium | Low | Medium–high |

## When is each the right answer?

- **Accounting only** — a small service business with few transactions and no stock.
- **CRM + accounting** — a sales-driven business with simple invoicing and no inventory.
- **Best-of-breed stack** — specialised needs where one tool is far superior; requires integration investment and an owner for each connector.
- **ERP** — when processes cross departments (order → stock → invoice), inventory matters, multiple sites exist, or management needs consolidated real-time reporting.

A modular ERP such as Odoo blurs these lines: it includes CRM, POS, e-commerce and accounting apps on the same database, so a company can start with a few apps and add more later.

## Hidden cost of "just connect them"

| Item | Why it costs |
|---|---|
| Connector build | Mapping fields between systems with different data models |
| Duplicate master data | Customer or product created in two places, needs syncing rules |
| Error handling | What if the sync fails at 2 a.m.? Who notices? |
| Upgrades | Each vendor updates on its own schedule and may break the connector |
| Reporting | Data still needs consolidation for cross-functional reports |

## Real-world scenario

For **PeakForm Retail** the consultant mapped the flows. Store sales went from POS to accounting through a nightly file; stock transfers between stores were tracked on paper; the CRM had loyalty customers but no purchase history. The recommendation was an ERP covering POS, inventory, purchase and accounting on one database, with CRM data migrated in. The cloud CRM was retired, removing one subscription and one connector. The owner kept a standalone email-marketing tool because it had no inventory or financial impact — integration there was simple and low-risk.

## Key takeaways

- Accounting software records finances; CRM manages customer relationships; point apps do one job; ERP integrates core operations.
- The more processes cross departments, the stronger the case for ERP.
- Connecting separate tools has ongoing costs: mapping, syncing, monitoring and upgrades.
- Modular ERPs let a company start small and add apps over time.
- Keep standalone tools where they add value and have low integration impact.
`,
          flashcards: [
            { term: "CRM", definition: "Customer Relationship Management — software for leads, opportunities, pipeline and customer interactions." },
            { term: "Best-of-breed", definition: "Strategy of choosing the best specialised tool for each function and integrating them." },
            { term: "Point solution", definition: "A standalone application that addresses a single business function." },
            { term: "Record to Report (R2R)", definition: "Finance process from recording transactions to producing financial statements." },
            { term: "Connector", definition: "An integration component that synchronises data between two systems." },
          ],
        },
        {
          slug: "cloud-vs-on-premises",
          title: "Cloud vs On-Premises ERP",
          durationMin: 20,
          odooVersions: "Version-independent (Odoo used as example)",
          scope: ["standard", "enterprise"],
          body: `## Business context

**Harbor Steelworks** (fictional) is a fabrication workshop in an industrial zone with unreliable internet. **Lumen Consulting Group** (fictional) is a 25-person advisory firm whose staff work from client sites and home. Both are choosing an ERP — and the right deployment model for each is different. Deployment choice affects cost, control, customization options, upgrades and who is responsible for security.

## Deployment models

### On-premises
The company installs the ERP on its own servers (in its office or its own data centre). Its IT team handles hardware, operating system, database, backups, security patches and upgrades.

### Cloud — SaaS (Software as a Service)
The vendor hosts and runs the software. The customer subscribes and accesses it through a browser. The vendor handles infrastructure, backups and upgrades.

### Cloud — hosted / managed platform (PaaS-style)
The software runs on a cloud platform, but the customer (or its partner) has more control — for example, it can deploy custom code. Hosting, backups and some maintenance are provided by the platform.

### Private cloud / IaaS
The company rents virtual servers from a cloud provider and installs the ERP itself. It behaves like on-premises, but without owning hardware.

## Comparison

| Factor | SaaS | Managed platform | On-premises / IaaS |
|---|---|---|---|
| Up-front cost | Low | Low–medium | High (servers, setup) |
| Ongoing cost | Subscription | Subscription + hosting | IT staff, hardware refresh |
| Custom code | Limited or none | Allowed | Fully allowed |
| Upgrades | Vendor-driven, frequent | Planned, partner-assisted | Self-managed |
| Internet dependence | Total | Total | Can work on a local network |
| Data location control | Vendor's regions | Platform's regions | Full control |
| IT skills required | Minimal | Moderate | High |

## How this applies to Odoo

Odoo is a common teaching example because it offers all three models:

- **Odoo Online** — SaaS hosted by Odoo; custom Python modules cannot be installed, though Studio (an Enterprise feature) allows some no-code changes.
- **Odoo.sh** — a cloud platform for Odoo Enterprise that supports custom modules and provides development, staging and production branches.
- **On-premise** — self-hosted; the Community edition is open source, and the Enterprise edition requires a subscription.

Exact plan conditions change over time — always check the current offering on the vendor's website before advising a client.

## Selection criteria

1. **Customization needs** — if the client needs custom modules, pure SaaS may be ruled out.
2. **Connectivity** — sites with poor internet may need on-premises or a robust offline plan.
3. **Regulation and data residency** — some industries or countries require data to stay in a particular location.
4. **Internal IT capacity** — who will patch, back up and monitor the server at night?
5. **Total cost of ownership (TCO)** — compare over 3–5 years, not just year one.
6. **Upgrade policy** — SaaS clients get upgrades on the vendor's schedule; self-hosted clients must plan and fund them.

## Shared responsibility

\`\`\`text
                    SaaS        Managed platform    On-premises
 Hardware          Vendor        Platform            Client
 OS / database     Vendor        Platform            Client
 Backups           Vendor        Platform (+client)  Client
 ERP upgrades      Vendor        Client/partner      Client/partner
 Custom code       n/a           Client/partner      Client/partner
 Users & access    Client        Client              Client
 Data quality      Client        Client              Client
\`\`\`

Note the last two rows: **users, access and data quality are always the client's responsibility**, no matter where the ERP runs.

## Real-world scenario

- **Lumen Consulting Group** chose SaaS: staff need access from anywhere, requirements were standard (CRM, projects, timesheets, invoicing) and there is no IT team.
- **Harbor Steelworks** needed a custom quality-inspection module and worried about internet outages on the shop floor. It chose a managed cloud platform for custom code support, and invested in a backup internet line — on-premises was rejected because the company had no one to maintain a server.

## Key takeaways

- Deployment options: SaaS, managed cloud platform, on-premises or self-managed cloud servers.
- SaaS minimises IT effort but limits custom code; on-premises maximises control but needs IT skills.
- Decide using customization needs, connectivity, regulation, IT capacity and 3–5 year TCO.
- Users, access rights and data quality are always the client's responsibility.
- Verify current vendor plan conditions before advising clients.
`,
          flashcards: [
            { term: "SaaS", definition: "Software as a Service — the vendor hosts and operates the software; customers subscribe and use it via browser." },
            { term: "On-premises", definition: "Software installed on servers owned and managed by the client." },
            { term: "IaaS", definition: "Infrastructure as a Service — rented virtual servers on which the client installs and manages software." },
            { term: "TCO", definition: "Total Cost of Ownership — all costs of a system over its life, not just purchase price." },
            { term: "Data residency", definition: "Legal or policy requirement about the geographic location where data is stored." },
            { term: "Odoo.sh", definition: "Odoo's cloud platform for Enterprise databases that supports custom modules and dev/staging/production branches." },
          ],
          resources: [{ title: "Odoo 17.0 documentation — administration", kind: "link", url: "https://www.odoo.com/documentation/17.0/administration.html" }],
        },
        {
          slug: "saas-hosting-environments-access",
          title: "SaaS, Hosting, Environments, Databases and User Access",
          durationMin: 25,
          odooVersions: "Version-independent (Odoo used as example)",
          scope: ["standard", "configuration"],
          body: `## Business context

Two weeks before go-live at **Meridian Wholesale Foods** (fictional), a junior consultant tested a new tax setting directly in the live database. Invoices issued that afternoon used the wrong tax rate and had to be credited and re-issued. The lesson: **never experiment in production**. Professional implementations use separate environments, controlled databases and disciplined user access.

## Environments

An **environment** is a separate copy of the ERP used for a specific purpose.

| Environment | Purpose | Who uses it | Data |
|---|---|---|---|
| Development (dev) | Build and unit-test customizations | Developers | Small sample data |
| Test / QA | Functional and integration testing | Consultants, testers | Realistic test data |
| Staging / pre-production | Final rehearsal, UAT, migration dry-runs | Key users, consultants | Copy of production or full migrated data |
| Production (prod) | Live business operations | All business users | Real data |

### The promotion path

\`\`\`visual-flow
{
  "title": "The promotion path",
  "caption": "Changes move one way only: never build or experiment directly in production.",
  "steps": [
    {
      "title": "Development",
      "icon": "code",
      "app": "DEV",
      "detail": "Build configuration and code changes."
    },
    {
      "title": "Test",
      "icon": "search",
      "app": "TEST",
      "detail": "Verify the change against acceptance criteria."
    },
    {
      "title": "Staging",
      "icon": "refresh",
      "app": "STAGING",
      "detail": "Rehearse the deployment on a copy of production."
    },
    {
      "title": "Production",
      "icon": "rocket",
      "app": "PROD",
      "detail": "Go live for business users on real data."
    }
  ]
}
\`\`\`

Changes move **forward** through the path after passing checks. Data generally moves **backward**: production is copied to staging (often anonymised) so tests reflect reality.

### Configuration vs code promotion
- **Code** (custom modules) is promoted through version control and deployment.
- **Configuration** made in the UI (settings, taxes, journals) is usually stored as data in the database, so it must be either re-applied in production from a documented **configuration workbook** or carried by migrating a prepared database. This is why consultants document every setting they change.

## Databases

- An ERP instance may host one or several **databases**; each database is a fully separate set of companies, users and data.
- A single database can contain **multiple companies** (multi-company), which share some master data and keep separate accounting. Choosing between "one database with several companies" and "separate databases" is an important early design decision: inter-company transactions and consolidated reporting are much easier in one database.
- **Backups** must be scheduled, stored off-site and **tested by restoring** them. An untested backup is not a backup.

## User access

### Users and licences
Each person should have their own named user. Sharing logins destroys the audit trail and usually breaches licence terms. Many ERPs, including Odoo, distinguish internal users from portal users (customers or vendors who see only their own documents).

### Roles, groups and access rights
Access is granted by **groups** or **roles** rather than to individuals one by one. A group defines which menus, records and operations (read, create, write, delete) its members can use. In Odoo, users are managed under **Settings ▸ Users & Companies ▸ Users**, where each app typically offers access levels such as User and Administrator (exact levels vary by app — verify in your training instance).

### Record-level security
Beyond menus, rules may limit **which records** a user sees — for example, salespeople see only their own customers, or users see only data from their own company or branch.

### Principle of least privilege
Give each user the minimum access needed for the job. Administrator rights should be limited to a few trained people.

### Segregation of duties
The person who creates a vendor should not be the same person who approves payments to that vendor. ERP roles make this enforceable.

## A simple access matrix

| Role | Sales | Purchase | Inventory | Accounting | Settings |
|---|---|---|---|---|---|
| Salesperson | Own documents | — | Read | — | — |
| Sales manager | All documents | — | Read | Read invoices | — |
| Buyer | — | User | Read | — | — |
| Storekeeper | — | Read | User | — | — |
| Accountant | Read | Read | Read | Full | — |
| System admin | Admin | Admin | Admin | Admin | Full |

## Real-world scenario

After the tax incident, **Meridian Wholesale Foods** adopted rules:

1. All configuration changes are tried in staging first and recorded in the configuration workbook.
2. Only two named administrators can change settings in production.
3. Staging is refreshed from production each month (with personal data anonymised).
4. Backups are restored to a test server quarterly to prove they work.

Support tickets about "mysterious" setting changes dropped to zero.

## Key takeaways

- Use separate dev, test, staging and production environments; never experiment in production.
- Code is promoted forward; production data is copied backward for realistic testing.
- UI configuration must be documented so it can be reproduced in production.
- Decide early between multi-company in one database or separate databases.
- Grant access by groups, apply least privilege and segregation of duties; never share logins.
- Test backups by restoring them.
`,
          flashcards: [
            { term: "Production environment", definition: "The live system used for real business transactions." },
            { term: "Staging environment", definition: "A near-identical copy of production used for final rehearsals, UAT and migration dry-runs." },
            { term: "Least privilege", definition: "Granting users only the access they need to perform their job." },
            { term: "Segregation of duties", definition: "Splitting critical tasks between different people to reduce fraud and error risk." },
            { term: "Record rule", definition: "A security rule restricting which individual records a user can access." },
            { term: "Portal user", definition: "An external user (customer/vendor) with limited access to their own documents." },
            { term: "Configuration workbook", definition: "A document recording every configuration decision and setting, used to reproduce setup in production." },
          ],
          resources: [{ title: "Odoo 17.0 — Users and access rights", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/general/users.html" }],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3 — Standard vs Custom, and the People in a Project",
      lessons: [
        {
          slug: "standard-vs-customization",
          title: "Standard ERP vs Customization",
          durationMin: 25,
          odooVersions: "Version-independent (Odoo used as example)",
          scope: ["standard", "configuration", "customization", "enterprise"],
          body: `## Business context

**Granite & Co Construction** (fictional) asked for 140 changes during their ERP project: custom screens, renamed fields, new approval steps, special reports. Two years later, upgrading to a newer version was quoted at almost the cost of the original implementation, because every customization had to be re-tested and many re-written. Meanwhile **Oakridge Distributors** (fictional) adapted its processes to the standard system, kept just six customizations, and upgraded in three weeks.

The difference is the most important judgement a consultant makes: **when to configure, when to customize, and when to change the process instead**.

## Three levels of adaptation

| Level | What it means | Example | Who does it |
|---|---|---|---|
| **Configuration** | Using built-in settings and options; no code | Enabling multi-warehouse, defining taxes, setting payment terms, creating approval thresholds that the standard product supports | Functional consultant |
| **Customization** | Changing or adding behaviour with code or low-code tools | Adding a field and logic to sales orders, a new report layout, a new workflow step | Developer or techno-functional consultant |
| **Extension / integration** | Adding new capability alongside the core, often via a separate module or external system | A connector to a courier API, a custom module for equipment rental | Developer, integration specialist |

Some vendors also offer **low-code tools**. In Odoo, **Studio** (an Enterprise-only app) lets users add fields, change views and create simple automations without writing Python. It is still a customization — it must be documented, tested and maintained.

## The "standard first" principle

Before agreeing to any customization, walk through this ladder:

1. **Does standard already do it?** Many "gaps" are simply features the client has not seen yet.
2. **Can configuration achieve it?** A setting, a pricelist rule, an automation the product already supports.
3. **Can the process change?** Is the client's way of working genuinely better, or just familiar?
4. **Is there a ready-made module?** From the vendor or a trusted community/third-party source — evaluate quality and upgrade support.
5. **Only then: custom development** — with a written specification and cost/benefit justification.

## Why customization has a long-term cost

- **Upgrade cost** — each new version may change the code a customization relies on.
- **Testing cost** — every customization must be regression-tested on every upgrade.
- **Dependency risk** — knowledge sits with the developer who wrote it.
- **Performance and stability** — poorly written code can slow down or break standard features.
- **Lost innovation** — heavily modified systems often skip upgrades and miss new standard features.

\`\`\`visual-trend
{
  "title": "Effort over the system's life",
  "caption": "Illustrative shape, not measured data: every upgrade has to re-test and often rework custom code, so the gap widens over time.",
  "yLabel": "Effort",
  "xLabel": "Time",
  "points": [
    "Go-live",
    "Year 1",
    "Upgrade 1",
    "Year 3",
    "Upgrade 2"
  ],
  "series": [
    {
      "label": "Heavily customised",
      "values": [
        20,
        32,
        55,
        68,
        95
      ],
      "tone": "danger"
    },
    {
      "label": "Mostly standard",
      "values": [
        20,
        24,
        30,
        33,
        40
      ],
      "tone": "success"
    }
  ]
}
\`\`\`

## Good reasons to customize

- A genuine **competitive advantage** the standard cannot support.
- A **legal or regulatory** requirement not covered by standard or localisation modules.
- A high-volume process where automation saves significant time every day.
- An **integration** with an essential external system.

## Classifying requirements

During requirement analysis, every requirement should be labelled:

| Classification | Meaning |
|---|---|
| Standard | Works out of the box |
| Configuration | Standard, but needs settings |
| Customization | Needs development (code or Studio) |
| Integration | Needs connection to an external system |
| Reporting | Needs a new or adapted report |

This classification drives effort estimates and the fit-gap analysis covered in the Implementation Methodology course.

## Real-world scenario

**Oakridge Distributors** wanted a custom screen to enter orders by typing product codes quickly. The consultant demonstrated that the standard sales order lines already accept product codes and that keyboard navigation was fast enough after short training. The request was closed as "standard — training". A second request — printing a pallet label in the format required by a major customer — had no standard equivalent and was approved as a small customization with a written specification.

## Key takeaways

- Configuration uses built-in options; customization changes behaviour; extension adds capability.
- Follow the ladder: standard → configuration → process change → existing module → custom development.
- Every customization adds upgrade, testing and maintenance cost for the life of the system.
- Low-code tools (e.g. Odoo Studio, Enterprise-only) are still customizations.
- Classify each requirement as standard, configuration, customization, integration or reporting.
`,
          flashcards: [
            { term: "Configuration", definition: "Adapting the ERP using built-in settings and options without code." },
            { term: "Customization", definition: "Changing or adding system behaviour through code or low-code tools." },
            { term: "Extension", definition: "Adding new capability alongside the core product, e.g. a separate module or integration." },
            { term: "Upgrade cost", definition: "Effort to move customizations and data to a new software version, including re-testing." },
            { term: "Odoo Studio", definition: "Enterprise-only low-code app for adding fields, editing views and simple automations." },
            { term: "Regression testing", definition: "Re-testing existing features to ensure a change or upgrade has not broken them." },
          ],
        },
        {
          slug: "consultant-types",
          title: "Functional vs Technical vs Techno-Functional Consultant",
          durationMin: 20,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

A client of the fictional partner **Northwind ERP Partners** reports: "When we deliver a partial order, the backorder doesn't appear on the warehouse screen." Who should take this ticket? A functional consultant might find it is a configuration choice. A technical consultant might find a bug in a customization. A techno-functional consultant can investigate both — and that is why the role is in demand.

## The three profiles

### Functional consultant
- Understands **business processes** (sales, purchasing, inventory, accounting, HR) and how the ERP supports them.
- Runs discovery workshops, documents requirements, designs TO-BE processes, configures the system, writes test cases and trains users.
- Speaks the language of the business: margins, lead times, credit limits, VAT.

### Technical consultant (developer)
- Builds **customizations, integrations, reports and data migration scripts**.
- Works with the programming language and framework (for Odoo: Python, XML views, the ORM, PostgreSQL, JavaScript for the web client).
- Handles performance, deployment, version control and upgrades.

### Techno-functional consultant
- Combines both: understands the business need **and** how it is implemented technically.
- Translates requirements into technical specifications developers can build.
- Can read code, query data, debug configuration vs code issues, write import files, and do small developments.
- Acts as the bridge between business users and developers.

## Skills comparison

| Skill area | Functional | Technical | Techno-functional |
|---|---|---|---|
| Business process knowledge | Deep | Basic | Strong |
| ERP configuration | Deep | Moderate | Strong |
| Requirement & documentation | Deep | Moderate | Strong |
| Programming | None/basic | Deep | Moderate |
| Data models & SQL | Basic | Deep | Moderate–strong |
| Data import / migration | Moderate | Strong | Strong |
| Integrations / APIs | Basic | Deep | Moderate |
| Testing | Strong (functional, UAT) | Strong (unit) | Strong (both) |
| Client communication | Deep | Moderate | Strong |

## A day in the life of a techno-functional consultant

- **09:00** — Workshop with the warehouse team on receiving and put-away.
- **11:00** — Write a technical specification for a custom delivery slip field.
- **13:00** — Prepare and validate a product import file; fix category mismatches.
- **15:00** — Investigate a support ticket: check configuration, then inspect the record's technical fields to find the cause.
- **16:30** — Review a developer's change in the test environment against acceptance criteria.

## How tickets are diagnosed

\`\`\`visual-decision
{
  "title": "How tickets are diagnosed",
  "caption": "Click through the questions in order — each answer narrows down where the fix belongs.",
  "start": "repro",
  "nodes": {
    "repro": {
      "question": "Can you reproduce the issue in the test environment?",
      "options": [
        {
          "label": "Yes",
          "next": "user"
        },
        {
          "label": "No",
          "next": "gather"
        }
      ]
    },
    "gather": {
      "result": "Gather more information",
      "tone": "neutral",
      "detail": "Ask for the exact steps, the user and the record, then try to reproduce again."
    },
    "user": {
      "question": "Is it user error or a training gap?",
      "options": [
        {
          "label": "Yes",
          "next": "train"
        },
        {
          "label": "No",
          "next": "config"
        }
      ]
    },
    "train": {
      "result": "Train the user and update the manual",
      "tone": "success"
    },
    "config": {
      "question": "Is it a configuration or data problem?",
      "options": [
        {
          "label": "Yes",
          "next": "fix"
        },
        {
          "label": "No",
          "next": "escalate"
        }
      ]
    },
    "fix": {
      "result": "Fix the configuration or data",
      "tone": "info",
      "detail": "Test the fix in the test environment first."
    },
    "escalate": {
      "result": "Escalate to the developer or vendor",
      "tone": "warning",
      "detail": "It is a standard bug or a customisation defect."
    }
  }
}
\`\`\`

The techno-functional consultant can walk this entire tree without handing the ticket off at every step.

## Career path

Many consultants start functional (because they have a business, accounting or supply-chain background) or technical (from software development) and grow towards the techno-functional middle. Later paths include solution architect, project manager or practice lead.

## Real-world scenario

At **Northwind ERP Partners**, the backorder ticket went to a techno-functional consultant. She reproduced the issue in staging, checked the inventory settings (the backorder policy was correct), then found the warehouse screen was a customized list view whose filter excluded documents created from a backorder. She wrote a short defect note with the exact cause, the developer fixed the filter in an hour, and she retested and closed the ticket the same day.

## Key takeaways

- Functional = business process + configuration; technical = code + integration + data.
- Techno-functional consultants bridge both and translate requirements into specs.
- Key skills: process knowledge, configuration, documentation, data handling, reading code, testing.
- They can diagnose whether an issue is training, configuration, data or code.
- This academy aims to build techno-functional consultants.
`,
          flashcards: [
            { term: "Functional consultant", definition: "Expert in business processes and ERP configuration who works directly with users." },
            { term: "Technical consultant", definition: "Developer who builds customizations, integrations, reports and migration scripts." },
            { term: "Techno-functional consultant", definition: "Consultant combining business process knowledge with enough technical skill to specify, debug and build small solutions." },
            { term: "Technical specification", definition: "Document describing how a requirement will be built: data model, logic, UI and tests." },
            { term: "Solution architect", definition: "Senior role responsible for the overall design of an ERP solution and its integrations." },
          ],
        },
        {
          slug: "roles-and-raci",
          title: "Project Roles and RACI",
          durationMin: 25,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

At **Sunrise Retail Group** (fictional, 12 stores), the ERP project stalled for six weeks because nobody could approve the pricing design. Sales said finance owned it; finance said it was a sales decision; the implementation partner was waiting. Clear roles — and a **RACI** matrix — would have prevented this.

## Who is involved

### Client side
- **Executive sponsor** — senior leader who owns the business case, funds the project and resolves escalations.
- **Steering committee** — sponsor plus key managers and partner leadership; meets monthly to review progress, risks and major decisions.
- **Client project manager** — coordinates internal resources, decisions and timelines.
- **Process owners** — department heads responsible for a process (e.g. head of procurement owns Procure to Pay).
- **Key users (super users)** — experienced staff from each department who attend workshops, test the system, help with data and train colleagues. They are the most important success factor after sponsorship.
- **Business (end) users** — everyone who will use the ERP daily.
- **Internal IT** — infrastructure, network, security, integrations with existing systems.

### Implementation partner side
- **Partner project manager** — plans, tracks and reports; manages scope and change requests.
- **Functional / techno-functional consultants** — discovery, design, configuration, testing, training.
- **Developers** — customizations, integrations, migration scripts.
- **Solution architect** — overall design and technical decisions on complex projects.

### Vendor
- The ERP software publisher provides licences, product support, hosting (for SaaS) and bug fixes for the standard product.

## RACI explained

| Letter | Meaning | Rule |
|---|---|---|
| **R** — Responsible | Does the work | At least one per task |
| **A** — Accountable | Owns the outcome, signs off | Exactly one per task |
| **C** — Consulted | Gives input before/during | Two-way communication |
| **I** — Informed | Kept up to date | One-way communication |

## Sample RACI for an ERP project

| Activity | Sponsor | Client PM | Process owner | Key user | Partner PM | Consultant | Developer |
|---|---|---|---|---|---|---|---|
| Approve scope & budget | A | R | C | I | C | I | I |
| Discovery workshops | I | C | A | R | C | R | I |
| Requirements sign-off | I | R | A | C | C | R | I |
| TO-BE design | I | C | A | C | I | R | C |
| Configuration | I | I | C | C | A | R | I |
| Customization build | I | I | C | I | A | C | R |
| Data cleansing | I | A | C | R | I | C | I |
| Data migration load | I | C | I | C | A | R | R |
| UAT execution | I | C | A | R | I | C | I |
| Go-live decision | A | R | C | I | R | C | I |
| End-user training | I | C | A | R | I | R | I |

Notice two patterns:
- **The client is accountable for data cleansing and UAT.** Partners can help, but only the business knows whether its data and processes are correct.
- **The sponsor is accountable for the go-live decision**, based on readiness evidence prepared by the project managers.

## Common role problems

| Problem | Consequence | Prevention |
|---|---|---|
| Key users not released from daily work | Workshops cancelled, poor testing | Agree time allocation (e.g. 30–50%) in the project charter |
| No single accountable owner | Decisions stall | One "A" per activity in the RACI |
| Sponsor disengaged | Escalations unresolved | Monthly steering committee with clear decisions |
| Partner treated as decision-maker on business rules | Design doesn't match business | Process owners sign off designs |
| IT not involved early | Late surprises with network, security, integrations | Include IT from discovery |

## Real-world scenario

**Sunrise Retail Group** restarted with a RACI agreed at a steering committee. The Commercial Director was named **Accountable** for pricing design, with finance **Consulted** and the store managers **Informed**. A decision log was created. The pricing design was signed off within one week, and the decision log was used later to answer "why did we decide this?" questions during UAT.

## Key takeaways

- Client roles: sponsor, steering committee, client PM, process owners, key users, end users, IT.
- Partner roles: PM, consultants, developers, solution architect; the vendor supplies software and product support.
- RACI clarifies who does (R), owns (A), advises (C) and is told (I); exactly one A per activity.
- The client is accountable for data quality, UAT and business decisions.
- Release key users from daily work — they make or break the project.
`,
          flashcards: [
            { term: "RACI", definition: "Responsibility matrix: Responsible, Accountable, Consulted, Informed." },
            { term: "Executive sponsor", definition: "Senior leader who owns the business case, funds the project and resolves escalations." },
            { term: "Key user", definition: "Experienced department representative who contributes to design, testing, data and training." },
            { term: "Process owner", definition: "Manager accountable for an end-to-end business process and its design decisions." },
            { term: "Steering committee", definition: "Governance group that reviews progress, risks and major decisions periodically." },
            { term: "Implementation partner", definition: "Consulting firm that configures, customizes and deploys the ERP for the client." },
            { term: "Decision log", definition: "Record of project decisions, who made them, when and why." },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 4 — Making ERP Projects Succeed",
      lessons: [
        {
          slug: "costs-benefits-risks-success-factors",
          title: "Implementation Costs, Benefits, Risks and Success Factors",
          durationMin: 30,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

**Tidewater Components** (fictional, an electronics assembler with 200 staff) approved an ERP budget based only on software subscription and consultant fees. Six months in, they discovered the "hidden" costs: staff overtime for testing, a new barcode scanner fleet, data cleansing by a temporary team and two extra months of the old system's licence. The project went 45% over budget — not because anyone was dishonest, but because the full cost picture was never drawn.

## The full cost picture

| Cost category | Examples | Often forgotten? |
|---|---|---|
| Software | Subscriptions or licences, per-user and per-app fees | No |
| Hosting / infrastructure | Cloud platform, servers, backups, network upgrades | Sometimes |
| Implementation services | Consulting, development, project management | No |
| Customization & integration | Custom modules, connectors, report development | Sometimes |
| Data migration | Cleansing, mapping, loading, reconciliation | **Yes** |
| Hardware | Barcode scanners, label printers, POS terminals, tablets | **Yes** |
| Internal staff time | Key users in workshops, testing, data work, backfill | **Yes** |
| Training | Trainers, materials, lost productivity during training | Sometimes |
| Parallel running | Keeping the old system during transition | **Yes** |
| Post-go-live support | Hypercare, support contract, continuous improvement | Sometimes |
| Upgrades | Future version migrations, re-testing customizations | **Yes** |

## Benefits and how to measure them

| Benefit | KPI | Baseline → target example |
|---|---|---|
| Faster order processing | Minutes per order | 18 → 5 |
| Lower inventory | Inventory days on hand | 75 → 55 |
| Faster close | Days to close month | 10 → 4 |
| Better cash flow | Days sales outstanding (DSO) | 62 → 48 |
| Fewer errors | Credit notes due to errors per month | 40 → 8 |
| Better delivery | On-time delivery % | 82% → 95% |

Benefits must be **owned** by a business manager and measured after go-live; otherwise they are only hopes.

## Major risks

| Risk | Early warning sign | Mitigation |
|---|---|---|
| Scope creep | Requirements keep growing after sign-off | Formal change-request process with cost/impact |
| Poor data quality | Duplicates, missing fields found late | Start cleansing in discovery; multiple trial loads |
| Low user adoption | Users keep shadow spreadsheets | Involve key users early; role-based training; leadership pressure |
| Over-customization | Many "must have" custom requests | Standard-first policy; justify each customization |
| Weak sponsorship | Decisions delayed, steering meetings cancelled | Named sponsor with authority; escalation path |
| Unrealistic timeline | Testing compressed to "save" go-live date | Go-live criteria based on readiness, not dates |
| Key person dependency | One user knows a whole process | Document processes; cross-train |
| Integration failures | External system specs unclear | Early technical specs and integration testing |

## Critical success factors

1. **Committed executive sponsor** who makes timely decisions.
2. **Clear, measurable objectives** and a controlled scope.
3. **Dedicated key users** with time allocated.
4. **Standard-first approach** — adapt processes where reasonable.
5. **Clean data**, owned by the business.
6. **Thorough testing**, especially end-to-end and UAT with real scenarios.
7. **Change management and training** — people, not software, determine adoption.
8. **Phased approach** where sensible — core processes first, enhancements later.
9. **Strong partner–client communication** with regular status reporting and decision logs.
10. **Post-go-live ownership** — someone continues to improve and govern the system.

## Phased vs big-bang

\`\`\`visual-compare
{
  "title": "Phased vs big-bang at a glance",
  "columns": [
    "Big bang",
    "Phased"
  ],
  "rows": [
    {
      "label": "Go-live scope",
      "values": [
        "All modules, all sites",
        "Phase 1: finance + sales + stock"
      ]
    },
    {
      "label": "Later waves",
      "values": [
        "None",
        "Phase 2: manufacturing → Phase 3: other sites"
      ]
    },
    {
      "label": "Go-live events",
      "values": [
        "One go-live day",
        "One per phase"
      ]
    }
  ]
}
\`\`\`

Big bang is faster but riskier; phased reduces risk but needs temporary interfaces between old and new systems.

## Real-world scenario

**Tidewater Components** reset the project with a full TCO model, a contingency of 15%, and a phased plan: Phase 1 covered accounting, purchase, inventory and sales; Phase 2 added manufacturing. Each phase had go-live criteria (all critical test cases passed, opening balances reconciled, every user trained). Phase 1 went live one month later than originally planned but with no business disruption; inventory accuracy rose from 88% to 98% within three months.

## Key takeaways

- Budget the full cost: data, hardware, internal time, parallel running and upgrades are often forgotten.
- Benefits need baselines, KPIs and named owners.
- Top risks: scope creep, bad data, low adoption, over-customization, weak sponsorship.
- Success depends more on people, data and decisions than on software features.
- Choose big-bang or phased go-live deliberately, and set readiness-based go-live criteria.
`,
          flashcards: [
            { term: "Scope creep", definition: "Uncontrolled growth of project requirements after scope has been agreed." },
            { term: "Change request", definition: "A formal request to change agreed scope, assessed for cost, time and impact before approval." },
            { term: "KPI", definition: "Key Performance Indicator — a measurable value showing progress towards an objective." },
            { term: "Big-bang go-live", definition: "Switching all modules and sites to the new system at the same time." },
            { term: "Phased go-live", definition: "Introducing the ERP in stages by module, site or process." },
            { term: "Change management", definition: "Activities that help people adopt new processes and systems: communication, training, support." },
            { term: "Contingency", definition: "Budget or time reserve set aside for identified and unforeseen risks." },
            { term: "DSO", definition: "Days Sales Outstanding — average number of days to collect payment from customers." },
          ],
        },
      ],
    },
  ],

  /* -------------------------------------------------------------------- */
  assessment: {
    slug: "erp-fundamentals-final",
    title: "ERP Fundamentals — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "What most distinguishes an ERP system from a collection of separate business applications?",
        kind: "single",
        options: [
          "It always runs in the cloud",
          "Its modules share one database and common master data",
          "It includes a CRM module",
          "It is cheaper to purchase",
        ],
        correct: [1],
        explanation: "Integration through a shared database and master data is the defining characteristic of ERP. Deployment model, CRM inclusion and price vary.",
      },
      {
        prompt: "Which of the following are typical problems caused by disconnected applications? (Select all that apply)",
        kind: "multiple",
        options: [
          "Double data entry",
          "No single source of truth",
          "Delayed information for decisions",
          "Automatic audit trail across all departments",
        ],
        correct: [0, 1, 2],
        explanation: "Disconnected tools cause re-typing, conflicting figures and delays. A cross-department audit trail is a benefit of an integrated system, not a problem of disconnected ones.",
      },
      {
        prompt: "Changing a customer's payment terms on the customer record automatically changes the terms on invoices already posted.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Master data changes affect future transactions. Posted transactions keep the values they were created with.",
      },
      {
        prompt: "Which environment should be used for user acceptance testing and migration dry-runs?",
        kind: "single",
        options: ["Development", "Staging / pre-production", "Production", "A developer's laptop"],
        correct: [1],
        explanation: "Staging closely mirrors production and is used for final rehearsals such as UAT and trial migrations.",
      },
      {
        prompt: "Enabling multiple warehouses and defining tax rates using built-in settings is an example of:",
        kind: "single",
        options: ["Customization", "Configuration", "Integration", "Extension"],
        correct: [1],
        explanation: "Using built-in options without code is configuration.",
      },
      {
        prompt: "Which are long-term costs associated with heavy customization? (Select all that apply)",
        kind: "multiple",
        options: [
          "Higher upgrade effort",
          "Additional regression testing on every upgrade",
          "Dependency on the developers who wrote the code",
          "Lower subscription fees",
        ],
        correct: [0, 1, 2],
        explanation: "Customizations must be migrated and re-tested on upgrades and create knowledge dependency. They do not reduce subscription fees.",
      },
      {
        prompt: "Odoo Studio is available in both Community and Enterprise editions.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Studio is an Enterprise-only app. Changes made with it are still customizations that must be documented and tested.",
      },
      {
        prompt: "In a RACI matrix, how many people or roles should be Accountable for a single activity?",
        kind: "single",
        options: ["None", "Exactly one", "At least two", "Everyone on the steering committee"],
        correct: [1],
        explanation: "Exactly one Accountable role avoids ambiguity about who owns the outcome and signs off.",
      },
      {
        prompt: "Who should normally be Accountable for data cleansing in an ERP project?",
        kind: "single",
        options: ["The implementation partner's developer", "The client (business data owners)", "The ERP vendor", "The external auditor"],
        correct: [1],
        explanation: "Only the business knows whether its data is correct. Partners provide templates and tools, but the client owns data quality.",
      },
      {
        prompt: "Which consultant profile is best described as bridging business requirements and technical implementation?",
        kind: "single",
        options: ["Functional consultant", "Technical consultant", "Techno-functional consultant", "Project sponsor"],
        correct: [2],
        explanation: "Techno-functional consultants understand both business processes and enough of the technical side to specify, debug and build small solutions.",
      },
      {
        prompt: "A company with no IT staff, highly standard processes and staff working remotely would most likely choose:",
        kind: "single",
        options: ["On-premises servers", "SaaS cloud ERP", "Self-managed virtual servers", "A custom-built ERP"],
        correct: [1],
        explanation: "SaaS minimises IT effort and supports remote access; standard processes mean custom code limitations matter less.",
      },
      {
        prompt: "Which costs are frequently forgotten in ERP budgets? (Select all that apply)",
        kind: "multiple",
        options: [
          "Internal staff time for workshops and testing",
          "Data migration and cleansing",
          "Parallel running of the old system",
          "Hardware such as barcode scanners and label printers",
        ],
        correct: [0, 1, 2, 3],
        explanation: "All four are commonly underestimated. A full TCO model includes them.",
      },
      {
        prompt: "Sharing one login between several warehouse staff is acceptable if it saves licence costs.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Shared logins destroy the audit trail, prevent proper access control and usually breach licence terms.",
      },
      {
        prompt: "According to the 'standard first' principle, what should a consultant check immediately after confirming the standard product does not meet a requirement out of the box?",
        kind: "single",
        options: [
          "Write custom code",
          "Whether configuration can achieve it",
          "Purchase a third-party module",
          "Reject the requirement",
        ],
        correct: [1],
        explanation: "The ladder is: standard, configuration, process change, existing module, and only then custom development.",
      },
      {
        prompt: "Which statement about phased vs big-bang go-live is correct?",
        kind: "single",
        options: [
          "Big bang is always lower risk",
          "Phased go-live reduces risk but may need temporary interfaces between old and new systems",
          "Phased go-live is never used for multi-site companies",
          "Big bang requires no data migration",
        ],
        correct: [1],
        explanation: "Phasing spreads risk across smaller go-lives but the old and new systems must co-exist and exchange data during the transition.",
      },
    ],
  },

  /* -------------------------------------------------------------------- */
  assignments: [
    {
      slug: "erp-fundamentals-case-study",
      title: "Case Study — Proposing ERP Scope for a Disconnected Distributor",
      instructions: `## Scenario

**Evergreen Home Distribution Ltd** (fictional) distributes kitchenware and small appliances to 350 retail customers. It has 65 employees, a head office, and two warehouses (North and South). Annual turnover is about 18 million in local currency.

### Current systems

| System | Used by | Purpose | Issues reported |
|---|---|---|---|
| Spreadsheet "Orders_Master.xlsx" | Sales team (8) | Record customer orders received by phone/email | Multiple copies; orders lost; no stock visibility |
| B2B web portal (standalone) | 120 customers | Online ordering | Orders exported by CSV each morning and re-typed |
| Two warehouse spreadsheets | Storekeepers | Stock in/out per warehouse | Stock differs from accounting by 5–8%; transfers not tracked |
| Desktop accounting package | Finance (4) | Invoices, payables, ledger, tax | Invoices raised 3–10 days after delivery; stock valued manually at month-end |
| Email + paper | Purchasing (3) | Purchase orders to 40 vendors | No approval; duplicate orders; receipts not matched to bills |
| Personal phone contacts | Sales reps | Customer contacts and visit notes | Lost when reps leave |

### Management complaints
- "We don't know which products are profitable."
- "We gave goods to customers who already owed us money."
- "Month-end takes 9 working days."
- "We run out of best-sellers while slow items fill the warehouse."

## Your tasks

1. **Pain-point analysis** — For each system, list the problems and classify them (double entry, no single source of truth, delay, weak control, reporting). Quantify at least three using reasonable assumptions (state them).
2. **Process view** — Draw (table or ASCII diagram) the current Order to Cash and Procure to Pay flows, marking every manual hand-off.
3. **Proposed ERP scope** — Recommend which ERP modules/apps should be in Phase 1 and which in later phases, with justification. Indicate which systems will be retired, kept or integrated.
4. **Master data** — List the master data objects that must be created or migrated and who should own each.
5. **Deployment recommendation** — Recommend SaaS, managed cloud or on-premises, with reasons.
6. **Roles & RACI** — Propose a project team and a RACI for at least six activities.
7. **Risks & success factors** — Identify the top five risks with mitigations, and five measurable KPIs with baseline and target.

## Deliverables

- A report of 4–6 pages (or equivalent markdown) covering tasks 1–7.
- One summary table: *Current system → Problem → ERP solution → Expected benefit*.
- An executive summary of no more than 200 words suitable for the managing director.

## Evaluation criteria

| Criterion | Weight | Excellent |
|---|---|---|
| Pain-point analysis & quantification | 20% | All systems analysed; problems correctly classified; assumptions explicit and realistic |
| Process understanding | 15% | Clear flows with every hand-off and its risk identified |
| Scope recommendation | 20% | Phasing is logical, justified by pain points, avoids unnecessary scope |
| Master data & ownership | 10% | Complete list with sensible business owners |
| Deployment & standard-first thinking | 10% | Recommendation justified by IT capacity, customization needs and TCO |
| Roles, RACI, risks, KPIs | 15% | One Accountable per activity; risks have concrete mitigations; KPIs measurable |
| Communication quality | 10% | Executive summary is concise and business-oriented; no jargon without explanation |

Passing requires at least 70% overall.
`,
    },
  ],
};
