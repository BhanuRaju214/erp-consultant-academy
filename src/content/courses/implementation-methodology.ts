import type { CourseContent } from "../types";

/**
 * Implementation Methodology — phase-by-phase guide to delivering an ERP project.
 * Generic methodology; Odoo 17.0 used for examples. All companies and data are fictional.
 */
export const implementationMethodology: CourseContent = {
  slug: "implementation-methodology",
  section: "methodology",
  title: "ERP Implementation Methodology",
  summary:
    "Walk through every phase of an ERP implementation — discovery, requirements, TO-BE design, configuration, data migration, development, testing, go-live and support — with reusable templates, inputs, deliverables, roles and pitfalls for each phase.",
  level: "intermediate",
  platform: "generic",
  odooVersion: "Version-independent (examples use Odoo 17.0)",
  position: 1,
  skills: [
    "Plan and run business discovery workshops",
    "Build a requirement traceability matrix and fit-gap analysis",
    "Design and document TO-BE processes",
    "Prepare configuration workbooks and data migration plans",
    "Write technical specifications for customizations",
    "Design and execute test cases and UAT",
    "Plan cutover, go-live and hypercare",
    "Run structured post-go-live support",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 0 — Methodology Overview",
      lessons: [
        {
          slug: "implementation-approaches",
          title: "Implementation Approaches: Waterfall, Agile and Hybrid",
          durationMin: 25,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

Two fictional clients sign ERP contracts in the same week. **Atlas Precision Engineering** wants a fixed price and a fixed go-live date approved by its board. **BrightPath Learning Services** wants to start using CRM and invoicing within six weeks and "figure out the rest as we go". Both projects need a methodology — but not the same one. A methodology is simply an agreed way of moving from "we signed" to "the business runs on the new system" with predictable quality.

## Why a methodology matters

- Everyone knows what happens next and what is expected of them.
- Deliverables and sign-offs create checkpoints where problems surface early.
- Scope, time and cost can be controlled with a common vocabulary.
- Knowledge can be reused across projects (templates, checklists).

## Waterfall (sequential)

Phases follow one another; each finishes with a sign-off before the next starts.

\`\`\`visual-flow
{
  "compact": true,
  "title": "Waterfall phases",
  "steps": [
    {
      "title": "Discovery"
    },
    {
      "title": "Requirements"
    },
    {
      "title": "Design"
    },
    {
      "title": "Build / config"
    },
    {
      "title": "Test"
    },
    {
      "title": "Go-live"
    },
    {
      "title": "Support"
    }
  ]
}
\`\`\`

**Strengths:** clear contracts and budgets; strong documentation; suits regulated industries and fixed-price deals.
**Weaknesses:** users see the system late; changes are expensive once design is signed; long time to first value.

## Agile (iterative)

Work is split into short iterations (sprints, often 2–3 weeks). Each sprint configures and demonstrates a slice of functionality; the backlog is re-prioritised continuously.

**Strengths:** early feedback; users shape the system by seeing it; good for unclear requirements.
**Weaknesses:** harder to fix price and scope; needs a highly available client product owner; ERP integration across modules can make "small slices" tricky; risk of skipping documentation.

## Hybrid (most common in ERP)

Most ERP partners use a hybrid: **waterfall-style governance and phases** (discovery, sign-off, cutover, go-live) with **iterative build cycles** inside the configuration and development phase. Instead of designing everything on paper, consultants configure a prototype early and run "conference room pilot" sessions where key users try real scenarios, then refine.

| Aspect | Waterfall | Agile | Hybrid |
|---|---|---|---|
| Planning | Upfront, detailed | Rolling | Phases upfront, iterations inside build |
| Client involvement | Peaks at start and UAT | Continuous | Regular demos/prototype reviews |
| Documentation | Heavy | Light | Essential documents only, kept current |
| Contract | Fixed price/scope | Time & materials | Fixed phases + change control |
| Best for | Large, regulated, stable scope | Small, evolving scope | Most SME ERP projects |

## How Odoo projects are typically run

Odoo's own published guidance and most Odoo partners favour a **standard-first, iterative approach**: start from a clean database, demonstrate standard flows early, adapt processes to the standard where reasonable, configure in short cycles with key users, and keep customizations minimal. Projects commonly begin with a kickoff and discovery, followed by repeated configure-and-review cycles, data import, user training and go-live. The exact service packages and names offered change over time — check the vendor's current offering rather than relying on memory.

## The phases used in this course

| # | Phase | Main deliverable |
|---|---|---|
| 1 | Business Discovery | AS-IS documentation |
| 2 | Requirement Analysis | Requirement Traceability Matrix (RTM) |
| 3 | TO-BE Process Design | TO-BE document + fit-gap, signed off |
| 4 | Solution Configuration | Configuration workbook + configured system |
| 5 | Data Migration | Mapping sheets, loaded & reconciled data |
| 6 | Development & Integration | Technical specs, tested customizations |
| 7 | Testing & Training | Test results, UAT sign-off, user manuals |
| 8 | Go-Live | Cutover executed, go-live sign-off |
| 9 | Post-Go-Live Support | Ticket log, knowledge base, KPI reports |

Phases 4–7 often overlap in iterations; phases 1–3 and 8 are usually gated by formal sign-off.

## Real-world scenario

**Atlas Precision Engineering** used a hybrid: a four-week discovery and requirements phase ended with a signed RTM and fixed budget; configuration and development then ran in three-week cycles, each ending with a key-user demo; a formal UAT and go/no-go gate came before cutover. **BrightPath Learning Services** used a lighter agile approach: CRM and invoicing went live in week six, projects and timesheets were added in two later sprints.

## Key takeaways

- A methodology gives predictable steps, deliverables and sign-offs.
- Waterfall suits fixed scope/price; agile suits evolving scope; hybrid suits most ERP projects.
- Iterative prototyping with key users catches design problems before UAT.
- Odoo implementations generally favour standard-first, iterative delivery.
- The nine phases in this course each produce a named deliverable you can reuse.
`,
          flashcards: [
            { term: "Waterfall", definition: "Sequential methodology where each phase completes and is signed off before the next begins." },
            { term: "Agile", definition: "Iterative methodology delivering functionality in short cycles with continuous re-prioritisation." },
            { term: "Hybrid methodology", definition: "Phase-gated governance combined with iterative build cycles inside the project." },
            { term: "Sprint", definition: "A fixed, short time-box (often 2–3 weeks) in which a set of backlog items is delivered." },
            { term: "Conference room pilot", definition: "A session where key users run real business scenarios in a prototype system to validate design." },
            { term: "Phase gate", definition: "A formal checkpoint where deliverables are reviewed and approved before moving on." },
          ],
          resources: [{ title: "Odoo 17.0 documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/" }],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1 — Analyse and Design",
      lessons: [
        {
          slug: "phase-1-business-discovery",
          title: "Phase 1 — Business Discovery",
          durationMin: 40,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Business context

**Crescent Tiles & Stone** (fictional) imports tiles, stocks them in two warehouses and sells to contractors and walk-in retail customers. The owner says: "We need Odoo for sales and stock." In discovery the consultant learns that tiles are sold by box but quoted by square metre, that batches differ in shade so customers must receive a single batch, and that contractors get credit while retail customers pay upfront. None of this was in the original request. **Discovery exists to find what the client did not think to tell you.**

## Objectives

1. Understand the **industry** and how this company makes money.
2. Understand **operations** end to end: who does what, with which documents and systems.
3. Identify **pain points** and their business impact.
4. Collect **evidence**: forms, spreadsheets, reports, sample transactions.
5. Produce **AS-IS documentation** that the client confirms is accurate.

## Inputs

- Signed proposal / statement of work and high-level scope
- Organisation chart and list of stakeholders
- Access to current systems (screens, reports, exports)
- Sample documents: quotations, orders, invoices, delivery notes, GRNs, purchase orders, price lists

## Activities

### 1. Prepare
- Research the industry: typical processes, regulations, terminology, KPIs.
- Send a pre-workshop questionnaire one week ahead.
- Agree a workshop schedule per process area (sales, purchase, inventory, finance, etc.).

### 2. Stakeholder interviews
- **Management** — strategy, objectives, success measures, reports they need.
- **Process owners** — rules, approvals, exceptions.
- **Key users** — daily tasks, workarounds, volumes, pain points.
- **IT** — current systems, integrations, infrastructure, security.

Ask open questions ("Walk me through what happens when a customer orders a product you don't have in stock") and then probe exceptions ("What if the customer cancels after delivery?").

### 3. Observe and collect
Sit with users while they work. Collect every form, spreadsheet and report — then ask *who uses it and what decision it supports*. Many reports are produced but never read.

### 4. Document AS-IS
Write process narratives and simple flow diagrams; list systems, volumes, pain points and data sources.

## Template — Discovery questionnaire

| # | Area | Question | Answer | Evidence collected | Follow-up |
|---|---|---|---|---|---|
| G1 | General | What are the legal entities, branches and locations? | | | |
| G2 | General | What are your top 3 objectives for this project? | | | |
| S1 | Sales | How do customers order (phone, email, portal, walk-in)? Monthly volume? | | | |
| S2 | Sales | How are prices and discounts determined? Who can approve exceptions? | | | |
| S3 | Sales | Do you check credit limits or require advance payment? | | | |
| P1 | Purchase | How do you decide what and when to buy? | | | |
| P2 | Purchase | What approvals are needed for purchases, and at what amounts? | | | |
| I1 | Inventory | How many warehouses/locations? Do you track lots, serials or expiry dates? | | | |
| I2 | Inventory | What units do you buy, stock and sell in? | | | |
| I3 | Inventory | How and how often do you count stock? | | | |
| M1 | Manufacturing | Do you produce or assemble? Are there bills of materials? | | | |
| F1 | Finance | Which taxes apply? Which currencies? Fiscal year? | | | |
| F2 | Finance | How are customer payments received and reconciled? | | | |
| R1 | Reporting | Which reports do you use weekly/monthly? Who reads them? | | | |
| T1 | Systems | What systems are used today and what data do they hold? Any integrations? | | | |
| X1 | Pain points | What are the three biggest daily frustrations? | | | |

## Template — Current systems & pain-point register

| ID | Process | System / tool | Pain point | Impact (time / money / risk) | Frequency | Raised by |
|---|---|---|---|---|---|---|
| PP-01 | Order entry | Spreadsheet | Orders typed twice | ~6 hrs/day | Daily | Sales lead |
| PP-02 | Stock | Warehouse sheet | Shade batches mixed | Returns, rework | Weekly | Storekeeper |

## Outputs / deliverables

- Completed questionnaires and interview notes
- Collected documents library (forms, spreadsheets, reports)
- Current systems inventory and pain-point register
- **AS-IS process document** (narratives, diagrams, volumes, roles)
- Draft list of high-level requirements to feed Phase 2

## Who is involved

| Role | Involvement |
|---|---|
| Functional / techno-functional consultant | Leads workshops, documents AS-IS |
| Partner project manager | Plans schedule, manages logistics and risks |
| Process owners & key users | Explain processes, provide documents, validate AS-IS |
| Management / sponsor | Objectives, priorities, approval |
| Client IT | Systems, integrations, infrastructure |

## Common pitfalls

- **Jumping to the solution** — demonstrating screens before understanding the business.
- **Only talking to managers** — key users know the real workarounds.
- **Missing exceptions** — returns, cancellations, partial deliveries, write-offs.
- **No volumes** — 50 orders a month and 5,000 orders a day need different designs.
- **Not collecting evidence** — "we have a report for that" means nothing until you see it.
- **Unvalidated AS-IS** — always get the client to confirm the document.

## Real-world scenario

At **Crescent Tiles & Stone**, discovery revealed three unit-of-measure needs (square metre, box, pallet), lot tracking for shade batches, two customer payment policies and an import landed-cost process. The AS-IS document captured these with sample documents attached. The client corrected two errors in the draft — a typical and healthy outcome.

## Key takeaways

- Discovery finds the requirements the client didn't mention.
- Interview management, process owners, key users and IT separately.
- Collect real documents and ask what decision each supports.
- Record pain points with impact and frequency.
- The signed-off AS-IS document is the foundation for requirements.
`,
          flashcards: [
            { term: "AS-IS process", definition: "Documentation of how the business currently operates, including systems, roles and pain points." },
            { term: "Discovery workshop", definition: "Structured session with stakeholders to understand operations and requirements." },
            { term: "Pain-point register", definition: "List of current problems with their impact, frequency and source." },
            { term: "Stakeholder", definition: "Any person or group affected by or able to influence the project." },
            { term: "Process narrative", definition: "A written step-by-step description of a business process." },
          ],
        },
        {
          slug: "phase-2-requirement-analysis",
          title: "Phase 2 — Requirement Analysis",
          durationMin: 40,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard", "configuration", "customization"],
          body: `## Business context

Following discovery at **Crescent Tiles & Stone**, the consultant has 40 pages of notes. The client's managing director asks: "So how much will it cost and what exactly will we get?" To answer, notes must become a structured, numbered, classified and prioritised list of requirements. That list — the **Requirement Traceability Matrix (RTM)** — will be used to estimate effort, design, test and accept the system.

## What is a requirement?

A requirement is a **testable statement** of what the business needs the system to do. Good requirements are:

- **Specific** — "The system must block sales order confirmation when the customer exceeds the credit limit, unless approved by the Sales Manager."
- **Testable** — someone can prove it works or not.
- **Business-oriented** — describe the need, not the screen.
- **Unique and numbered** — e.g. SAL-007.

Bad example: "System should handle credit properly."

## Types of requirement

- **Functional** — what the system does (create quotations in m² and convert to boxes).
- **Non-functional** — performance, security, availability, usability (e.g. 30 concurrent users).
- **Data** — what must be migrated and how much history.
- **Reporting** — outputs needed by management or authorities.
- **Integration** — data exchanged with external systems.

## Classification

Each requirement gets one primary classification:

| Classification | Meaning | Typical effort |
|---|---|---|
| Standard | Works out of the box | Training only |
| Configuration | Standard feature that must be set up | Low |
| Customization | Requires development (code or Studio — Studio is Enterprise-only) | Medium–high |
| Integration | Requires data exchange with an external system | Medium–high |
| Reporting | New or adapted report/dashboard | Low–medium |

## Prioritisation — MoSCoW

| Priority | Meaning | Guideline |
|---|---|---|
| **Must** | Cannot go live without it (legal, core process) | Keep below ~60% of effort |
| **Should** | Important, but a workaround exists for a while | Planned for go-live if possible |
| **Could** | Nice to have | Only if time/budget allow |
| **Won't (this time)** | Explicitly out of scope for this phase | Recorded to avoid re-discussion |

## Gaps and risks

A **gap** is a requirement the standard product cannot satisfy by configuration. For each gap, record options (process change, existing module, customization) and the recommended one. Record **risks** linked to requirements, such as unclear rules, dependency on a third party or high data volume.

## Template — Requirement Traceability Matrix (RTM)

| Req ID | Process area | Requirement description | Source (workshop / doc) | Type | Classification | Priority (MoSCoW) | Odoo app | Fit / Gap | Solution notes | Effort (days) | Owner | Design ref | Test case IDs | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SAL-001 | Sales | Quote in m², deliver and invoice in boxes | WS-Sales-02 | Functional | Configuration | Must | Sales, Inventory | Fit | Units of measure with conversion (verify UoM category setup) | 1 | Sales Mgr | TB-SAL-01 | TC-010, TC-011 | Approved |
| SAL-002 | Sales | Block confirmation over credit limit unless manager approves | WS-Sales-03 | Functional | Customization | Must | Sales, Accounting | Partial gap | Standard credit-limit warning exists in Accounting settings (verify behaviour); hard block + approval needs development | 4 | Finance Mgr | TB-SAL-04 | TC-020 | Approved |
| INV-003 | Inventory | Track shade batches; ship one batch per order line | WS-Inv-01 | Functional | Configuration | Must | Inventory | Fit | Lot tracking on tile products; picking rules to be designed | 2 | Warehouse Mgr | TB-INV-02 | TC-030 | Approved |
| PUR-002 | Purchase | Include freight and duty in product cost | WS-Pur-01 | Functional | Configuration | Should | Inventory, Accounting | Fit | Landed costs (verify edition/availability in your instance) | 2 | Finance Mgr | TB-PUR-03 | TC-045 | Approved |
| RPT-001 | Reporting | Monthly margin by product category | WS-Mgmt-01 | Reporting | Reporting | Should | Sales / Accounting | Fit | Pivot analysis + saved filter | 1 | MD | TB-RPT-01 | TC-090 | Draft |
| INT-001 | Integration | Import orders from B2B portal | WS-IT-01 | Integration | Integration | Could | Sales | Gap | API connector; phase 2 candidate | 8 | IT Lead | — | — | Deferred |

The RTM is **traceable** in both directions: from requirement to design to test case, and from a test case back to the requirement it proves.

## Inputs

- AS-IS document and pain-point register
- Workshop notes, collected documents
- Project objectives and budget constraints

## Outputs / deliverables

- RTM (classified, prioritised, estimated)
- Gap list with recommended options
- Risk register entries
- Updated effort estimate and scope statement
- Requirements sign-off from process owners

## Who is involved

| Role | Involvement |
|---|---|
| Techno-functional consultant | Writes, classifies and estimates requirements |
| Solution architect / developer | Estimates gaps, integrations |
| Process owners | Validate and prioritise |
| Sponsor | Approves scope and budget |
| Partner PM | Maintains RTM baseline and change control |

## Common pitfalls

- Recording solutions instead of needs ("add a button") — the real need may be met by standard.
- Everything is "Must" — push back by asking "Can you go live without it for one month?"
- Classifying as customization before checking standard and configuration.
- No source reference — later nobody knows who asked for it.
- Not baselining — after sign-off, all changes must go through change requests.

## Real-world scenario

Crescent's draft RTM had 112 requirements, 70% marked Must. In a prioritisation workshop, the consultant asked for a workaround for each Must. The result: 48 Must, 36 Should, 18 Could, 10 Won't. The B2B portal integration moved to Phase 2, saving 15% of the budget and four weeks.

## Key takeaways

- Requirements must be specific, testable, business-oriented and numbered.
- Classify each as standard, configuration, customization, integration or reporting.
- Use MoSCoW to prioritise; challenge excessive Musts.
- The RTM links requirements to design and test cases.
- Baseline the RTM at sign-off and control changes formally.
`,
          flashcards: [
            { term: "RTM", definition: "Requirement Traceability Matrix — table linking each requirement to its classification, design, test cases and status." },
            { term: "MoSCoW", definition: "Prioritisation method: Must, Should, Could, Won't (this time)." },
            { term: "Gap", definition: "A requirement that standard functionality and configuration cannot meet." },
            { term: "Non-functional requirement", definition: "Requirement about qualities like performance, security or availability rather than features." },
            { term: "Baseline", definition: "The approved version of scope/requirements against which changes are controlled." },
            { term: "Traceability", definition: "Ability to follow a requirement forward to design and tests, and back to its source." },
          ],
        },
        {
          slug: "phase-3-to-be-process-design",
          title: "Phase 3 — TO-BE Process Design",
          durationMin: 40,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard", "configuration", "customization"],
          body: `## Business context

**Maple Leaf Office Interiors** (fictional) designs and fits out offices. Today, a designer prepares a quotation in a spreadsheet, the owner approves it by email, a buyer orders items from several vendors, and installation is scheduled on a whiteboard. Requirements are now signed off. The next question is: **how will the business work in the future, using the ERP?** That is the TO-BE design — the bridge between requirements and configuration.

## Objectives

- Define **future-state workflows** for each in-scope process.
- **Map** each step to an ERP app, document and role.
- Define **approval levels, validations and controls**.
- Confirm the **fit-gap** position and agree how each gap is handled.
- Obtain **formal sign-off** so configuration can start.

## Designing future-state workflows

1. Start from the AS-IS and the RTM.
2. Remove steps that only existed because systems were disconnected (re-typing, manual reconciliation).
3. Prefer the ERP's standard flow; change the process where reasonable.
4. Add controls at the right points (approvals, mandatory fields, blocking checks).
5. Walk the flow with key users using a prototype, not only on paper.

### Example — TO-BE quote-to-install flow

\`\`\`visual-flow
{
  "title": "TO-BE quote-to-install flow",
  "caption": "* Field Service is an Enterprise app; Project tasks are an alternative.",
  "steps": [
    {
      "title": "Quotation",
      "icon": "file",
      "app": "Sales",
      "actor": "Designer",
      "branch": {
        "when": "Discount > 10%",
        "result": "Owner approves",
        "tone": "warning"
      }
    },
    {
      "title": "Sales order confirmed",
      "icon": "check",
      "app": "Sales",
      "actor": "Customer confirms"
    },
    {
      "title": "Advance invoice",
      "icon": "invoice",
      "app": "Accounting"
    },
    {
      "title": "Purchase orders per vendor",
      "icon": "cart",
      "app": "Purchase"
    },
    {
      "title": "Receipts",
      "icon": "package",
      "app": "Inventory"
    },
    {
      "title": "Delivery to site",
      "icon": "truck",
      "app": "Inventory"
    },
    {
      "title": "Installation tasks",
      "icon": "wrench",
      "app": "Project / Field Service*"
    },
    {
      "title": "Final invoice",
      "icon": "invoice",
      "app": "Accounting"
    },
    {
      "title": "Payment & reconciliation",
      "icon": "bank",
      "app": "Accounting"
    }
  ]
}
\`\`\`

## Mapping to Odoo apps

| Business step | Odoo app | Document | Role | Scope |
|---|---|---|---|---|
| Lead / enquiry | CRM | Lead / opportunity | Designer | Standard |
| Quotation | Sales | Quotation | Designer | Standard |
| Discount approval | Sales | Quotation | Owner | Configuration / customization (verify available approval options in your instance) |
| Down payment invoice | Sales + Accounting | Customer invoice | Accountant | Standard |
| Buy items for project | Purchase | Purchase order | Buyer | Standard |
| Receive goods | Inventory | Receipt | Storekeeper | Standard |
| Deliver to site | Inventory | Delivery order | Storekeeper | Standard |
| Installation | Project or Field Service | Task | Site supervisor | Standard / Enterprise |
| Project profitability | Project + Accounting | Analytic reporting | Owner | Configuration |

## Approval levels and validations

| Control | Rule | Who approves | Implementation |
|---|---|---|---|
| Sales discount | > 10% on any line | Owner | Configuration or customization — confirm in prototype |
| Purchase amount | PO total > 5,000 | Operations manager | Purchase approval setting (verify in your instance) |
| Credit check | Customer overdue > 30 days | Finance manager | To be designed |
| Mandatory fields | Project, delivery address on order | — | Configuration |

## Template — TO-BE process document (per process)

| Section | Content |
|---|---|
| Process ID & name | e.g. TB-O2C-01 Quote to Install |
| Scope & objectives | What the process covers and why |
| Related requirements | RTM IDs |
| Roles | Who performs each step |
| Process flow | Diagram + numbered steps |
| Step detail | For each step: actor, app, document, inputs, outputs, validations |
| Approvals & controls | Thresholds, approvers, blocking rules |
| Exceptions | Cancellations, returns, partial deliveries |
| Reports & KPIs | Outputs used to monitor the process |
| Gaps & decisions | Gap IDs and agreed resolution |
| Open points | Issues still to resolve, owner, due date |
| Sign-off | Process owner name, date, signature |

## Template — Fit-gap analysis

| Gap/Fit ID | Req ID | Requirement | Standard behaviour | Fit level (Fit / Partial / Gap) | Options considered | Decision | Classification | Effort (days) | Approved by |
|---|---|---|---|---|---|---|---|---|---|
| FG-01 | SAL-004 | Owner approves discounts > 10% | Standard supports discount control options (verify) | Partial | Configure available setting; or custom approval | Prototype both, choose in CRP | Configuration / Customization | 0.5–3 | Owner |
| FG-02 | PRJ-002 | Profit per project | Analytic accounting on orders and bills | Fit | — | Use analytic accounts per project | Configuration | 1 | Finance |
| FG-03 | RPT-005 | Branded installation sign-off sheet | No standard document | Gap | Paper form; custom report | Custom PDF report | Reporting | 2 | Owner |

## Inputs

- Signed RTM, AS-IS documentation
- Prototype / demo database
- Company policies (approval matrix, credit policy)

## Outputs / deliverables

- TO-BE process documents for each process
- Fit-gap analysis with decisions
- Approval matrix
- Updated RTM (design references)
- **Design sign-off** by process owners

## Who is involved

Consultants (lead design), process owners (decide and sign), key users (validate in prototype), developers/architect (assess gaps), PM (sign-off and change control).

## Common pitfalls

- Copying AS-IS into the ERP ("paving the cow path") instead of improving it.
- Designing on paper only — users understand flows when they click through them.
- Too many approval levels that slow the business down.
- Forgetting exceptions (returns, cancellations, partial receipts).
- Starting configuration before sign-off, then redoing work.

## Real-world scenario

Maple Leaf initially wanted three approval levels for every quotation. In a conference room pilot, the owner saw that 85% of quotations had no discount above 10%. The approval was limited to high-discount quotations only — saving a day per quote on average.

## Key takeaways

- TO-BE defines how the business will run on the ERP, step by step.
- Map every step to an app, document, role and scope label.
- Design approvals and validations deliberately and sparingly.
- Fit-gap records each gap's options and decision.
- Sign-off before configuration protects scope and budget.
`,
          flashcards: [
            { term: "TO-BE process", definition: "The designed future-state process showing how the business will operate using the ERP." },
            { term: "Fit-gap analysis", definition: "Comparison of requirements against standard functionality, recording fit level and decisions for gaps." },
            { term: "Approval matrix", definition: "Table of transaction types, thresholds and the roles authorised to approve them." },
            { term: "Design sign-off", definition: "Formal approval by process owners that the TO-BE design is accepted." },
            { term: "Partial fit", definition: "Requirement mostly covered by standard but needing configuration, workaround or small development." },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2 — Build",
      lessons: [
        {
          slug: "phase-4-solution-configuration",
          title: "Phase 4 — Solution Configuration",
          durationMin: 45,
          odooVersions: "Odoo 17.0 (concepts version-independent)",
          scope: ["standard", "configuration", "enterprise"],
          body: `## Business context

**Riverbend Distributors** (fictional) has two companies (a trading company and a service company), three warehouses and 45 users. TO-BE is signed off. The consultant now turns design into a working system. Configuration done in the wrong order — or not documented — causes rework: for example, products created before units of measure are finalised, or journals created before the chart of accounts is reviewed.

## Objectives

- Build the system exactly as designed, in a **test/configuration environment** first.
- Record every setting in a **configuration workbook** so it can be reproduced in production and supported later.
- Validate each configuration with key users.

## Recommended configuration order

\`\`\`visual-steps
{
  "title": "Recommended configuration order",
  "steps": [
    {
      "title": "Company & localisation",
      "body": "Company data, currency, fiscal localisation."
    },
    {
      "title": "Users & access",
      "body": "Groups, record rules, companies."
    },
    {
      "title": "Accounting foundations",
      "body": "Chart of accounts, taxes, journals, payment terms."
    },
    {
      "title": "Inventory structure",
      "body": "Warehouses, locations, routes, operation types."
    },
    {
      "title": "Products & units of measure",
      "body": "Categories, units, tracking."
    },
    {
      "title": "Sales / purchase settings",
      "body": "Pricelists, approvals, terms & conditions."
    },
    {
      "title": "Sequences & documents"
    },
    {
      "title": "Automation & approvals"
    },
    {
      "title": "Reports & dashboards"
    }
  ]
}
\`\`\`

## Key configuration areas

### Companies and branches
Decide whether branches are separate companies (separate accounting) or warehouses/analytic accounts within one company. In Odoo, multiple companies in one database are managed under **Settings ▸ Users & Companies ▸ Companies**.

### Users, roles, access rights and record rules
Create users under **Settings ▸ Users & Companies ▸ Users** and assign access levels per app. Record rules limit which records users see (e.g. own documents only, own company only). Define roles from the TO-BE, not from people's names. Test each role by logging in as a sample user.

### Warehouses and locations
Create warehouses (Inventory ▸ Configuration ▸ Warehouses), then internal locations if bin-level tracking is needed (the Storage Locations setting must be enabled). Decide reception and delivery steps (1, 2 or 3 steps) per warehouse.

### Journals, taxes and currencies
Fiscal localisation packages usually provide a chart of accounts and taxes; review rather than recreate. Configure journals (sales, purchase, bank, cash, miscellaneous), tax rates and tax mappings (fiscal positions), and activate additional currencies with a rate update method if needed.

### Units of measure
Enable units of measure, define categories and conversion ratios (e.g. box of 1.44 m²). Units used for purchase and sale must be in the same category as the stock unit.

### Sequences
Agree document numbering (quotations, orders, invoices). Invoice numbering often has legal requirements in many countries — verify local rules before changing.

### Workflows, automation and approvals
Use standard settings first (e.g. purchase order approval thresholds, where available). Automated actions and scheduled activities can handle reminders and simple rules; Studio (Enterprise-only) adds no-code automation and fields — treat these as customizations and record them.

### Reports
Configure standard reports, saved filters, pivot views and dashboards per role. Adjust document layouts (logo, address, footer) in company document settings.

## Template — Configuration workbook

| Config ID | Area | Setting / object | Menu path (verify in instance) | Value / decision | Req ID | Design ref | Configured by | Date | Env (TEST/PROD) | Verified by | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CFG-001 | Company | Company name, address, VAT | Settings ▸ Users & Companies ▸ Companies | Riverbend Trading Ltd | GEN-001 | TB-GEN-01 | A. Rao | 03-Mar | TEST | Key user | Logo uploaded |
| CFG-010 | Users | Sales user group | Settings ▸ Users & Companies ▸ Users | Sales: "User: Own Documents Only" | SEC-002 | TB-SEC-01 | A. Rao | 04-Mar | TEST | Sales Mgr | |
| CFG-020 | Inventory | Warehouse North | Inventory ▸ Configuration ▸ Warehouses | Code NTH, 2-step delivery | INV-001 | TB-INV-01 | A. Rao | 05-Mar | TEST | WH Mgr | |
| CFG-030 | Accounting | Sales tax 15% | Accounting ▸ Configuration ▸ Taxes | 15% on sales, tax-exclusive | FIN-004 | TB-FIN-02 | B. Lee | 05-Mar | TEST | Accountant | Fictional rate |
| CFG-040 | UoM | Box (1.44 m²) | Inventory ▸ Configuration ▸ UoM | Bigger than reference, ratio 1.44 | SAL-001 | TB-SAL-01 | A. Rao | 06-Mar | TEST | Sales Mgr | |
| CFG-050 | Purchase | PO approval | Purchase ▸ Configuration ▸ Settings | Double validation above 5,000 | PUR-003 | TB-P2P-01 | B. Lee | 06-Mar | TEST | Ops Mgr | Verify setting name |

## Inputs

Signed TO-BE documents, fit-gap decisions, approval matrix, chart of accounts and tax details from the client's accountant, user list with roles.

## Outputs / deliverables

- Configured test environment
- **Configuration workbook** (complete, versioned)
- Role/access matrix
- Configuration walkthrough sign-off by key users

## Who is involved

Functional/techno-functional consultants (configure), key users (validate), client accountant (chart of accounts, taxes), IT (users, email, domains), PM (tracking).

## Common pitfalls

- Configuring directly in production.
- Not documenting settings — impossible to reproduce or support.
- Giving everyone administrator rights "temporarily".
- Wrong UoM categories or tax setup discovered after transactions exist — changes become hard.
- Ignoring localisation packages and recreating accounts manually.

## Real-world scenario

At Riverbend, the consultant initially set up branches as separate companies. During a configuration walkthrough, finance explained branches share one tax registration and one set of books. The design was changed to one company with three warehouses and analytic accounts per branch — caught early because the workbook was reviewed before data loading.

## Key takeaways

- Configure in a logical order: company, access, accounting, inventory, products, processes, automation, reports.
- Always configure and verify in test before production.
- The configuration workbook is a core deliverable — every setting, why and who verified it.
- Use standard and localisation features first; record Studio/automation as customizations.
- Test access by logging in as each role.
`,
          flashcards: [
            { term: "Configuration workbook", definition: "Versioned record of every configuration setting, its value, reason, requirement link and verification." },
            { term: "Access right", definition: "Permission for a group to read, create, edit or delete a type of record." },
            { term: "Fiscal localisation", definition: "Country-specific package providing chart of accounts, taxes and legal reports." },
            { term: "Fiscal position", definition: "Odoo mechanism that maps taxes and accounts for specific customers or vendors (e.g. exports)." },
            { term: "UoM category", definition: "Group of units that can be converted into one another (e.g. units, boxes, dozens)." },
            { term: "Journal", definition: "Accounting register grouping entries of one type, e.g. sales, purchase, bank." },
          ],
          resources: [
            { title: "Odoo 17.0 — Users and access", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/general/users.html" },
            { title: "Odoo 17.0 — Inventory", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/inventory.html" },
            { title: "Odoo 17.0 — Accounting", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting.html" },
          ],
        },
        {
          slug: "phase-5-data-migration",
          title: "Phase 5 — Data Migration",
          durationMin: 45,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard"],
          body: `## Business context

**Summit Hardware Supplies** (fictional) has 6,200 products, 1,100 customers, 240 vendors and four years of history spread across an old accounting package and spreadsheets. On go-live morning, the sales team must find every customer, the warehouse must see correct stock, and finance must start with balances matching the old system to the cent. Data migration is where many projects slip — because data is always dirtier than the client believes.

## The migration process

\`\`\`visual-flow
{
  "title": "The migration process",
  "loop": "Validate → trial load → reconcile, **2–3 trial loads**, then the final load.",
  "steps": [
    {
      "title": "Extract",
      "icon": "database"
    },
    {
      "title": "Cleanse",
      "icon": "filter"
    },
    {
      "title": "Transform / map",
      "icon": "workflow"
    },
    {
      "title": "Validate",
      "icon": "check"
    },
    {
      "title": "Load (trial)",
      "icon": "package"
    },
    {
      "title": "Reconcile",
      "icon": "scale"
    }
  ]
}
\`\`\`

### 1. Extract
Export data from each source system in full. Record date, source and row counts.

### 2. Cleanse
Owned by the **business**. Remove duplicates, inactive records, fix spellings, complete missing mandatory values (tax IDs, units, categories), standardise formats (phone, country, dates).

### 3. Map and transform
Map source fields to target fields, translate codes (e.g. old payment term codes to new payment terms), split or merge fields.

### 4. Validate
Check mandatory fields, unique references, valid relational values (category exists, UoM exists), sensible values (no negative prices).

### 5. Load
Use the ERP's import tools with templates. In Odoo, most list views offer an import feature that accepts CSV/XLSX files and lets you map columns to fields (verify location of the menu in your training instance). Large or complex migrations may use scripts via the API.

### 6. Reconcile
Compare counts and totals between source and target. Get business sign-off.

## Dependency order

Records referring to other records must be loaded after them:

| Order | Object | Depends on |
|---|---|---|
| 1 | Configuration (companies, taxes, UoM, warehouses, payment terms) | — |
| 2 | Product categories | — |
| 3 | Customers and vendors (contacts) | Countries, payment terms |
| 4 | Products | Categories, UoM, taxes, vendors (for vendor price lists) |
| 5 | Pricelists, bills of materials | Products, customers |
| 6 | Opening stock | Products, warehouses/locations, lots |
| 7 | Open documents (open orders, if migrated) | Customers, products |
| 8 | Opening balances (trial balance, open AR/AP) | Accounts, journals, contacts |

## Opening balances and opening stock

- **Opening stock**: load quantity per product per location (and lot/serial if tracked) as at cut-off date, valued at agreed cost. Use an inventory adjustment or import (verify method for your valuation setup).
- **Open receivables/payables**: load each open invoice/bill individually (customer, document number, date, due date, amount) so they can be collected/paid and aged correctly.
- **General ledger balances**: load a trial balance as an opening journal entry, using a temporary/suspense account where receivables, payables and stock are loaded separately — so they are not doubled.
- History (old closed invoices) is usually **not** migrated; keep the old system read-only or archive reports.

## Template — Data mapping sheet

| Target model / field | Field label | Required? | Source system / file | Source column | Transformation rule | Default value | Validation rule | Example source | Example target | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| Contact / name | Name | Yes | OldAcc customers.csv | CUST_NAME | Trim spaces, title case | — | Not empty, no duplicates | "ACME tiles  " | "Acme Tiles" | Sales admin |
| Contact / vat | Tax ID | Conditional | OldAcc customers.csv | GSTNO | Remove spaces | — | Valid format for country | "29 ABC" | "29ABC" | Finance |
| Contact / property_payment_term_id | Payment terms | No | OldAcc customers.csv | TERMS | Map: N30 → "30 Days" | Immediate | Must exist in target | "N30" | "30 Days" | Finance |
| Product / default_code | Internal reference | Yes (project rule) | Item_master.xlsx | ITEM_CODE | Uppercase | — | Unique | "hd-1002" | "HD-1002" | Purchasing |
| Product / categ_id | Product category | Yes | Item_master.xlsx | GROUP | Map to category path | All | Category exists | "PLMB" | "All / Plumbing" | Purchasing |

(Technical field names shown are common Odoo field names; always confirm against your version's import screen.)

## Template — Migration reconciliation

| Object | Source count | Loaded count | Rejected | Source total | Target total | Difference | Explained? | Signed by |
|---|---|---|---|---|---|---|---|---|
| Customers | 1,100 | 1,072 | 0 | — | — | 28 duplicates merged | Yes | Sales Mgr |
| Products | 6,200 | 5,480 | 0 | — | — | 720 inactive excluded | Yes | Purchasing |
| Opening stock value | — | — | — | 2,450,300.00 | 2,450,300.00 | 0.00 | Yes | Finance |
| Open AR | 412 invoices | 412 | 0 | 918,440.50 | 918,440.50 | 0.00 | Yes | Finance |

## Inputs

Source system exports, signed configuration, import templates, data owners' availability, cut-off date.

## Outputs / deliverables

- Data migration plan (objects, owners, order, dates, tools)
- Mapping sheets per object
- Cleansed import files
- Trial load reports and final load logs
- **Reconciliation sign-off** from business owners

## Who is involved

Business data owners (cleansing, validation, sign-off), techno-functional consultant (templates, mapping, loads), developer (scripts for large/complex loads), finance (balances), PM (schedule).

## Common pitfalls

- Starting cleansing too late — begin during discovery.
- Only one trial load — always rehearse at least twice, the last one on a full data set.
- Loading in the wrong order, causing missing-reference errors.
- Double-counting balances (AR loaded both as invoices and inside the trial balance).
- No reconciliation sign-off — disputes surface months later.
- Migrating junk history "just in case".

## Real-world scenario

Summit's first trial load rejected 900 products because category codes in the item master did not match the new category tree. The mapping sheet gained a translation table, and the second load succeeded. A third, full rehearsal took 6 hours — this timing went straight into the cutover plan.

## Key takeaways

- Extract, cleanse, map, validate, load, reconcile — and repeat with trial loads.
- The business owns data quality; the consultant owns method and tools.
- Respect dependency order; load configuration and masters before transactions.
- Load open AR/AP individually and avoid double-counting in the opening trial balance.
- Reconcile counts and totals with the source and get signed acceptance.
`,
          flashcards: [
            { term: "Data cleansing", definition: "Correcting, de-duplicating and completing data before migration." },
            { term: "Field mapping", definition: "Defining which source field populates which target field, with transformation rules." },
            { term: "Trial load", definition: "A rehearsal data import into a test environment to find errors and measure timing." },
            { term: "Opening balance", definition: "Account balances carried into the new system at the cut-off date." },
            { term: "Cut-off date", definition: "The date at which balances and stock are taken from the old system for migration." },
            { term: "Suspense account", definition: "Temporary account used to balance entries during migration, which must end at zero." },
          ],
          resources: [
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
            { title: "Vendor import template", kind: "template", url: "/api/templates/vendors" },
            { title: "Product import template", kind: "template", url: "/api/templates/products" },
            { title: "Product category import template", kind: "template", url: "/api/templates/product-categories" },
            { title: "Opening stock import template", kind: "template", url: "/api/templates/opening-stock" },
            { title: "Odoo 17.0 — Export and import data", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/essentials/export_import_data.html" },
          ],
        },
        {
          slug: "phase-6-development-integration",
          title: "Phase 6 — Development and Integration",
          durationMin: 40,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["customization", "third-party"],
          body: `## Business context

**Lakeside Fresh Foods** (fictional) needs three things the standard system does not provide: a pallet label in a retailer's format, an automatic order import from a retail chain's EDI provider, and an expiry-date warning on delivery screens. Each gap was approved in the fit-gap analysis. The techno-functional consultant's job is now to turn approved gaps into **clear technical specifications**, coordinate the build and verify the result — so the developer builds the right thing, once.

## From requirement to delivered customization

\`\`\`visual-flow
{
  "title": "From requirement to delivered customization",
  "steps": [
    {
      "title": "Approved gap",
      "icon": "flag",
      "app": "RTM / fit-gap"
    },
    {
      "title": "Functional spec",
      "icon": "file",
      "detail": "What and why."
    },
    {
      "title": "Technical spec",
      "icon": "code",
      "detail": "How."
    },
    {
      "title": "Estimate & approval",
      "icon": "signature"
    },
    {
      "title": "Build in DEV",
      "icon": "code",
      "app": "Version control"
    },
    {
      "title": "Unit tests",
      "icon": "check"
    },
    {
      "title": "Code review",
      "icon": "search"
    },
    {
      "title": "Deploy to TEST",
      "icon": "server"
    },
    {
      "title": "Functional + integration test",
      "icon": "clipboard"
    },
    {
      "title": "Fix defects",
      "icon": "wrench"
    },
    {
      "title": "Promote to STAGING",
      "icon": "rocket"
    }
  ]
}
\`\`\`

## Customization requirements

Before writing a specification, confirm:

- The RTM ID and approved fit-gap decision.
- Why standard/configuration/process change was rejected.
- Business rules, including exceptions and edge cases.
- Expected volume and performance.
- Who will accept the result.

## Writing a technical specification

A good specification lets a developer build without guessing and lets a tester verify without asking.

### Template — Technical specification outline

| Section | Content |
|---|---|
| 1. Document control | Spec ID, version, author, reviewers, approval date |
| 2. References | RTM IDs, fit-gap ID, TO-BE process |
| 3. Business requirement | Plain-language need and business justification |
| 4. Scope | In scope / out of scope |
| 5. Functional design | User story, screens affected, fields, buttons, messages |
| 6. Data model | New/changed models and fields (name, type, required, default, related model) |
| 7. Business logic | Rules, calculations, triggers, validations, error messages |
| 8. Security | Which groups may see/edit; record rules |
| 9. Reports / outputs | Layout, fields, sample mock-up |
| 10. Integration (if any) | System, direction, protocol, authentication, frequency, payload mapping, error handling, retries, logging |
| 11. Dependencies | Apps/modules required, Enterprise-only components |
| 12. Upgrade considerations | Standard objects extended; how to minimise upgrade impact |
| 13. Test scenarios | Positive, negative, edge cases with expected results |
| 14. Acceptance criteria | Measurable conditions for sign-off |
| 15. Estimate | Build, test, deploy effort |

### Example — business logic section (expiry warning)

| Rule | Condition | Result |
|---|---|---|
| BL-1 | Lot expiry date is within 10 days of scheduled delivery date | Show warning on the delivery; allow validation |
| BL-2 | Lot expiry date is before scheduled delivery date | Block validation with message "Lot expired — choose another lot" |
| BL-3 | Product is not tracked by lot | No check |

## Build practices (what to expect from developers)

- Custom code in **separate modules** that extend, not modify, standard code.
- **Version control** (e.g. Git), with code review before merge.
- No direct database edits in production.
- Configuration data shipped in the module where possible, so environments stay consistent.
- Clear module naming and documentation.

## Integrations and APIs

Integrations exchange data with external systems: e-commerce, EDI providers, banks, couriers, payroll, government e-invoicing. Odoo exposes an external API (XML-RPC / JSON-RPC) for reading and writing records; many integrations also use connectors or middleware. Key design questions:

| Question | Example answer |
|---|---|
| Direction | Inbound orders, outbound shipment confirmations |
| Trigger / frequency | Every 15 minutes, or on event |
| Master of the data | ERP is master for products and prices |
| Matching key | Customer external ID, product barcode |
| Error handling | Failed records logged, email alert to IT, retry 3 times |
| Security | API keys, dedicated integration user with minimal rights |
| Volume | ~600 orders/day peak |

## Unit and integration testing

- **Unit tests** — developer verifies each function/rule in isolation (e.g. BL-1 to BL-3).
- **Integration tests** — verify data flows end to end between systems, including failure cases (wrong product code, duplicate order, network timeout).
- The techno-functional consultant runs **functional verification** in TEST against the spec's acceptance criteria before handing over to UAT.

## Inputs

Approved fit-gap, RTM, TO-BE documents, external system documentation and test credentials, configured TEST environment.

## Outputs / deliverables

- Approved technical specifications
- Custom modules in version control, deployed to TEST/STAGING
- Unit and integration test evidence
- Integration runbook (monitoring, error handling)
- Updated RTM status

## Who is involved

Techno-functional consultant (specs, verification), developers (build, unit tests), solution architect (design review), external system vendors (APIs, test endpoints), client IT (security, network), process owner (acceptance).

## Common pitfalls

- Vague specs ("make it like the old system").
- Building before the gap is approved — unbillable rework.
- Modifying standard code directly — breaks on upgrade.
- Ignoring error handling in integrations — silent data loss.
- Forgetting security: integration users with administrator rights.
- No test data from the external partner until the last week.

## Real-world scenario

The EDI integration for Lakeside was specified with a payload mapping table and error-handling rules. During integration testing, the retail chain sent a product code that did not exist; because the spec required unmatched lines to be logged and flagged rather than dropped, the issue was caught and a code-mapping table was added before UAT.

## Key takeaways

- Only approved gaps become development; trace every build to an RTM ID.
- Technical specs cover data model, logic, security, integration, upgrade impact, tests and acceptance.
- Extend standard through separate modules under version control.
- Design integrations for direction, frequency, master data, errors, security and volume.
- Unit and integration tests come before UAT; the consultant verifies against acceptance criteria.
`,
          flashcards: [
            { term: "Functional specification", definition: "Document describing what a customization must do from the business perspective." },
            { term: "Technical specification", definition: "Document describing how a customization will be built: data model, logic, security, tests." },
            { term: "Unit test", definition: "Test of an individual function or rule in isolation, usually by the developer." },
            { term: "Integration test", definition: "Test verifying data flows correctly between modules or systems, including errors." },
            { term: "External API (Odoo)", definition: "XML-RPC/JSON-RPC interface allowing external systems to read and write Odoo records." },
            { term: "Version control", definition: "System such as Git that tracks code changes and supports review and rollback." },
            { term: "Middleware", definition: "Software that sits between systems to transform and route integration messages." },
          ],
          resources: [{ title: "Odoo 17.0 — Developer documentation (External API)", kind: "link", url: "https://www.odoo.com/documentation/17.0/developer/reference/external_api.html" }],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3 — Test, Train and Deploy",
      lessons: [
        {
          slug: "phase-7-testing-training",
          title: "Phase 7 — Testing and Training",
          durationMin: 45,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard"],
          body: `## Business context

**Pinecrest Building Materials** (fictional) planned one week for testing. On day two, users found that invoices for partial deliveries were wrong, a purchase approval blocked every order, and two warehouse users could not see delivery orders at all. Testing was extended to four weeks — painful, but far cheaper than finding these problems after go-live. Testing proves the system works; training proves people can use it. Both are required for **business acceptance**.

## Types of testing

| Test type | Purpose | Who | When |
|---|---|---|---|
| Unit testing | Each customization works in isolation | Developer | During build |
| Functional testing | Each feature/configuration works as designed | Consultant | After configuration |
| Integration testing | End-to-end flows across apps and external systems | Consultant + key users | After functional |
| Regression testing | Existing features still work after a change | Consultant / tester | After every fix or deployment |
| User acceptance testing (UAT) | Business confirms the system supports its processes | Key users | Before go-live |
| Performance testing (if needed) | Response times at expected volume | Technical team | Before go-live |

## Writing test cases

Each test case must trace back to a requirement (RTM) and be executable by someone who did not write it.

### Template — Test case table

| Test Case ID | Requirement ID | Module | Scenario | Preconditions | Test Data | Steps | Expected Result | Actual Result | Status | Defect ID | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-010 | SAL-001 | Sales | Quote in m², deliver in boxes | Product "Tile Grey 60x60" with stock unit Box (1.44 m²), sale unit m² | Customer: Delta Builders; Qty 144 m² | 1. Create quotation 2. Add product, qty 144 m² 3. Confirm 4. Open delivery | Delivery shows 100 Box | 100 Box | Pass | — | |
| TC-020 | SAL-002 | Sales | Block order over credit limit | Customer credit limit 50,000; open AR 48,000 | Order total 5,000 | 1. Create order 2. Confirm | Confirmation blocked; message shown; manager can approve | Order confirmed without block | Fail | DEF-007 | Custom rule not triggered |
| TC-030 | INV-003 | Inventory | Single shade lot per line | Lots L-A (60 boxes), L-B (80 boxes) | Order 70 boxes | 1. Confirm order 2. Check reserved lots | Reservation follows agreed lot rule from design | | Not run | | |
| TC-045 | PUR-002 | Purchase | Landed cost added to product cost | Receipt validated; freight bill 1,000 | — | 1. Create landed cost 2. Validate | Product valuation increases by allocated amount | | Not run | | Verify edition |

Status values: **Not run, Pass, Fail, Blocked**.

## Defect management

| Defect ID | Test Case | Severity | Description | Steps to reproduce | Assigned to | Root cause (config / data / code / training) | Status | Retest date | Closed by |
|---|---|---|---|---|---|---|---|---|---|
| DEF-007 | TC-020 | High | Credit block not triggered | See TC-020 | Developer | Code — rule checks only overdue invoices | Fixed | 14-May | Key user |

Severity guide: **Critical** (process stopped, no workaround), **High** (major function wrong, workaround hard), **Medium** (workaround exists), **Low** (cosmetic). After a fix: **retest** the failed case and run **regression** on related cases.

## UAT

- Use **real business scenarios** with migrated (trial) data, not demo data.
- Key users execute; consultants support but do not "drive".
- Include end-to-end cycles: quote → order → delivery → invoice → payment; requisition → PO → receipt → bill → payment; month-end close.
- Entry criteria: functional/integration tests passed, data loaded, users created.
- Exit criteria example: 100% critical and high cases passed; no open critical/high defects; medium defects have workarounds and a fix date.

## Training

- **Train-the-trainer**: consultants train key users, who train end users.
- Role-based sessions: a storekeeper does not need the accounting configuration.
- Hands-on in a training database with realistic data.
- Provide **user manuals / quick-reference guides** per role.

### Template — User manual outline (per role/process)

| Section | Content |
|---|---|
| Purpose & audience | Role, process covered |
| Process overview | TO-BE diagram |
| Step-by-step instructions | Numbered steps with screenshots |
| Business rules | Approvals, mandatory fields, limits |
| Exceptions | Returns, cancellations, corrections |
| FAQs / troubleshooting | Common errors and fixes |
| Support contacts | How to log a ticket |

## Inputs

RTM, TO-BE documents, configured system with customizations, trial-migrated data, user list.

## Outputs / deliverables

- Test plan, test cases and execution results
- Defect log with resolutions
- **UAT sign-off** (business acceptance)
- Training plan, attendance records, user manuals

## Who is involved

Consultants (test design, functional/integration testing, training), developers (fixes), key users (UAT, train end users), process owners (acceptance), PM (test progress, go/no-go input).

## Common pitfalls

- Testing only "happy paths" — test exceptions and negative cases.
- Consultants doing UAT on behalf of users.
- Skipping regression after fixes.
- Training too early (users forget) or too late (no practice time).
- Generic manuals that don't match the configured system.

## Real-world scenario

Pinecrest's revised UAT used 85 test cases traced to 62 Must/Should requirements. Twenty-three defects were logged: 9 configuration, 6 data, 5 code, 3 training. All critical and high defects were closed, and the warehouse manager signed UAT after running a full day's real orders in staging.

## Key takeaways

- Test in layers: unit, functional, integration, regression, UAT.
- Every test case links to a requirement and has clear expected results.
- Log, classify, fix, retest and regression-test every defect.
- UAT is performed by the business with realistic data, and ends in formal acceptance.
- Train by role, hands-on, close to go-live, with role-specific manuals.
`,
          flashcards: [
            { term: "UAT", definition: "User Acceptance Testing — business users confirm the system supports their processes before go-live." },
            { term: "Regression testing", definition: "Re-running tests on existing features after a change to ensure nothing broke." },
            { term: "Defect severity", definition: "Rating of a defect's business impact, e.g. Critical, High, Medium, Low." },
            { term: "Entry / exit criteria", definition: "Conditions that must be met to start or finish a test phase." },
            { term: "Train-the-trainer", definition: "Approach where consultants train key users who then train end users." },
            { term: "Test case", definition: "Documented scenario with preconditions, data, steps and expected result, linked to a requirement." },
          ],
        },
        {
          slug: "phase-8-go-live",
          title: "Phase 8 — Go-Live",
          durationMin: 40,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard"],
          body: `## Business context

**Bluewater Marine Supplies** (fictional) chose to go live on the first working day of a new month. On Friday evening the old system was frozen; over the weekend the team loaded final data and reconciled balances; on Monday 40 users logged in and started trading. Behind this calm Monday sat a detailed **cutover plan** rehearsed twice. Go-live is not a single click — it is a carefully choreographed sequence of tasks with owners, timings and checkpoints.

## Key concepts

- **Cutover** — the period and set of activities that move the business from the old system to the new.
- **Freeze** — the point after which no new transactions are entered in the old system (or they are captured for manual re-entry).
- **Go/no-go decision** — formal decision, based on readiness criteria, to proceed with go-live.
- **Rollback plan** — what to do if go-live must be aborted.
- **Hypercare** — the intensive support period immediately after go-live.

## Cutover timeline

\`\`\`text
 T-4 weeks  Final UAT sign-off, training complete, cutover plan approved
 T-2 weeks  Full dress rehearsal (final trial migration on staging, timed)
 T-1 week   Go/no-go meeting #1, user accounts verified, communications sent
 T-2 days   Final master-data extract and load; freeze master-data changes
 T-0 (Fri)  Transaction freeze in old system, stock count, final balances
 T+0 (Sat)  Load opening stock and balances, reconcile, smoke test
 T+1 (Sun)  Go/no-go meeting #2 (final), enable users
 T+2 (Mon)  GO-LIVE — hypercare starts
\`\`\`

## Readiness criteria

| Area | Criterion |
|---|---|
| Testing | UAT signed; no open critical/high defects |
| Data | Final migration rehearsed; reconciliation templates ready |
| Configuration | Production configured from the workbook and verified |
| Users | All users created with correct roles; passwords/invites tested |
| Training | All users trained; manuals available |
| Infrastructure | Printers, scanners, email, backups, network checked |
| Support | Hypercare team, ticket process and escalation contacts published |
| Business | Old-system freeze communicated to customers/vendors where needed |

## Template — Cutover checklist

| # | Task | Owner | Planned start | Duration | Dependency | Status | Verified by | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Approve cutover plan | Sponsor | T-4w | — | UAT sign-off | | PM | |
| 2 | Verify production configuration vs workbook | Consultant | T-2w | 1 day | — | | Key user | |
| 3 | Create/verify all users and roles | Consultant / IT | T-1w | 0.5 day | 2 | | Process owners | Test login per role |
| 4 | Freeze master data in old system | Client PM | T-2d | — | — | | | |
| 5 | Load customers, vendors, products | Consultant | T-2d | 4 hrs | 4 | | Data owners | Use final templates |
| 6 | Freeze transactions in old system | Client PM | T-0 18:00 | — | — | | | |
| 7 | Physical stock count | Warehouse Mgr | T-0 | 6 hrs | 6 | | Finance | |
| 8 | Load opening stock | Consultant | T+0 | 2 hrs | 5, 7 | | Warehouse Mgr | |
| 9 | Load open AR/AP and opening trial balance | Consultant + Finance | T+0 | 3 hrs | 5 | | Finance Mgr | |
| 10 | Reconcile stock value and balances with source | Finance | T+0 | 2 hrs | 8, 9 | | Finance Mgr | Sign reconciliation |
| 11 | Smoke test: one order, delivery, invoice, payment, PO, receipt | Key users | T+1 | 2 hrs | 10 | | Consultant | Reverse/cancel test docs per agreed method |
| 12 | Final go/no-go | Sponsor | T+1 16:00 | 30 min | 11 | | Steering committee | |
| 13 | Enable all users; send go-live communication | IT / PM | T+1 | — | 12 | | | |
| 14 | Start hypercare; daily stand-up | PM | T+2 | 2–4 weeks | 13 | | | |
| R | Rollback trigger & steps documented | PM | T-1w | — | — | | Sponsor | Criteria + who decides |

## Data validation at cutover

- Record counts per object match the reconciliation sheet.
- Stock quantity and value per warehouse match the count/old system.
- AR and AP totals and ageing match.
- Trial balance matches the old system at cut-off; suspense account is zero.
- Spot-checks: 20 random customers, products and open invoices compared field by field.

## Hypercare monitoring

For the first 2–4 weeks:

- Daily stand-up with key users and consultants.
- On-site or "floor-walking" support in busy departments.
- Monitor: open tickets, stuck documents (unvalidated deliveries, draft invoices), integration errors, scheduled actions, performance.
- Track a few daily health metrics: orders created, deliveries validated, invoices posted, bank reconciliation progress.
- Exit hypercare when tickets fall to an agreed level and month-end close succeeds.

## Inputs

UAT sign-off, configuration workbook, final migration files, rehearsal timings, trained users, support process.

## Outputs / deliverables

- Approved cutover plan and executed checklist
- Signed data reconciliation
- Go/no-go decision record
- Go-live communication
- Hypercare log and exit report

## Who is involved

Sponsor (go/no-go), client and partner PMs (coordinate), consultants (loads, validation, support), finance and warehouse managers (counts, reconciliation), key users (smoke tests, floor support), IT (infrastructure, access).

## Common pitfalls

- No dress rehearsal — loads take three times longer than expected.
- Go-live date treated as fixed regardless of readiness.
- Transactions continuing in the old system after freeze.
- Users unable to log in on day one.
- Going live just before a peak season or year-end without contingency.
- Consultants leaving immediately after go-live.

## Real-world scenario

At Bluewater, the rehearsal showed the opening stock load took 5 hours instead of 2 because of 3,000 lot numbers. The plan was adjusted to load lots on Saturday morning. A rollback trigger was defined: if stock value differed by more than 0.5% by Sunday 14:00, go-live would be postponed one week. Actual difference: 0.02%, explained by rounding. Go-live proceeded.

## Key takeaways

- Go-live is a rehearsed cutover with owners, timings and dependencies.
- Use readiness criteria and a formal go/no-go decision.
- Freeze the old system, count stock, load and reconcile before enabling users.
- Always have a documented rollback plan.
- Hypercare provides intensive support and monitoring until the business is stable.
`,
          flashcards: [
            { term: "Cutover", definition: "Set of activities transferring operations from the old system to the new one." },
            { term: "Go/no-go decision", definition: "Formal decision to proceed with go-live based on readiness criteria." },
            { term: "Rollback plan", definition: "Pre-agreed steps and triggers for reverting to the old system if go-live fails." },
            { term: "Hypercare", definition: "Intensive support period immediately after go-live." },
            { term: "Dress rehearsal", definition: "Full timed run-through of the cutover on a staging environment." },
            { term: "Smoke test", definition: "Quick test of critical end-to-end transactions to confirm the system is usable." },
            { term: "Transaction freeze", definition: "Point after which no new transactions are entered in the old system." },
          ],
        },
        {
          slug: "phase-9-post-go-live-support",
          title: "Phase 9 — Post-Go-Live Support",
          durationMin: 40,
          odooVersions: "Version-independent (examples use Odoo 17.0)",
          scope: ["standard"],
          body: `## Business context

Three months after go-live, **Orchid Event Rentals** (fictional) has a growing pile of emails titled "urgent!!", users who have quietly returned to spreadsheets for quotations, and a manager asking whether the ERP was worth it. Go-live is the beginning of value, not the end of the project. Structured post-go-live support protects the investment: issues are logged and solved systematically, knowledge is captured, and adoption is measured.

## Objectives

- Resolve issues quickly and permanently (not just the symptom).
- Distinguish **training, configuration, data and code** problems.
- Build a **knowledge base** so the same question is not answered fifty times.
- Monitor **adoption** and **KPIs** against the business case.
- Feed improvements into a controlled backlog.

## Ticket lifecycle

\`\`\`visual-flow
{
  "title": "Ticket lifecycle",
  "steps": [
    {
      "title": "Logged",
      "icon": "mail"
    },
    {
      "title": "Triaged",
      "icon": "filter",
      "detail": "Category and priority set."
    },
    {
      "title": "Assigned",
      "icon": "user"
    },
    {
      "title": "Investigating",
      "icon": "search",
      "branch": {
        "when": "Code defect",
        "result": "Escalated to developer / vendor",
        "tone": "warning"
      }
    },
    {
      "title": "Resolved",
      "icon": "wrench",
      "detail": "Fix or workaround."
    },
    {
      "title": "User confirms",
      "icon": "check"
    },
    {
      "title": "Closed",
      "icon": "flag"
    }
  ]
}
\`\`\`

## Logging and categorisation

Every issue goes through one channel (helpdesk tool, ticket portal or a dedicated email address linked to a ticket system — Odoo's Helpdesk app is Enterprise-only; Project tasks can serve as an alternative).

| Category | Example | Typical resolver |
|---|---|---|
| How-to / training | "How do I return goods to a vendor?" | Key user / consultant |
| Configuration | Wrong default tax on a product category | Consultant |
| Data | Customer created twice; wrong opening stock for one item | Key user + consultant |
| Access | User cannot see invoices | Consultant / admin |
| Defect — customization | Custom report shows wrong total | Developer (partner) |
| Defect — standard | Standard behaviour suspected wrong | Vendor support |
| Change request | "Can we add a new approval?" | PM → backlog |

### Priority matrix

| Priority | Definition | Response target | Resolution target |
|---|---|---|---|
| P1 Critical | Business stopped, no workaround (cannot invoice/ship) | 1 hour | Same day |
| P2 High | Major process impaired, workaround hard | 4 hours | 2 days |
| P3 Medium | Workaround exists | 1 day | 5 days |
| P4 Low | Cosmetic, question, enhancement | 2 days | Planned |

(Targets are examples — agree actual SLAs in the support contract.)

## Template — Support ticket

| Field | Content |
|---|---|
| Ticket ID | SUP-0142 |
| Reported by / department | R. Mensah, Warehouse |
| Date & time | 12-Jun 09:20 |
| Environment | Production |
| App / module | Inventory |
| Category | Data |
| Priority | P2 |
| Summary | Delivery cannot be validated — "not enough stock" for item CHAIR-WHT |
| Steps to reproduce | Open delivery WH/OUT/xxxxx, click Validate |
| Expected vs actual | Expected: delivery validated. Actual: insufficient quantity message |
| Screenshots / record references | Attached |
| Root cause | Opening stock loaded to wrong location (WH/Stock vs WH/Stock/Shelf A) |
| Resolution | Internal transfer to correct location; verified with user |
| Preventive action | Add location check to migration reconciliation checklist |
| Knowledge base article | KB-031 "Insufficient stock — check location" |
| Status / closed date | Closed, 12-Jun 11:05 |

## Root-cause analysis (RCA)

Ask **"why"** until you reach something you can fix permanently (the "5 Whys"):

1. Why can't the delivery be validated? — System sees no stock.
2. Why? — Stock is in a different location.
3. Why? — Opening stock file used the wrong location column.
4. Why? — The template allowed free text for location.
5. Why? — No validation step for locations in the migration checklist. → **Fix the checklist** (preventive) and **move the stock** (corrective).

## Fixing safely

- **Configuration fixes**: reproduce and test in staging first, update the configuration workbook, then apply in production.
- **Data fixes**: correct via standard documents (credit notes, inventory adjustments, reversals) to keep the audit trail; avoid direct database edits.
- **Code defects**: escalate with full reproduction steps; fix goes through DEV → TEST → regression → production.

## Escalation path

\`\`\`visual-flow
{
  "title": "Escalation path",
  "steps": [
    {
      "title": "End user",
      "icon": "user"
    },
    {
      "title": "Key user",
      "icon": "users",
      "app": "L1"
    },
    {
      "title": "Consultant / partner support",
      "icon": "handshake",
      "app": "L2"
    },
    {
      "title": "Final escalation",
      "icon": "wrench",
      "parallel": [
        {
          "title": "Developer",
          "app": "L3",
          "icon": "code",
          "detail": "Customization defects"
        },
        {
          "title": "Vendor support",
          "icon": "building",
          "detail": "Standard product issues"
        }
      ]
    }
  ]
}
\`\`\`

## Knowledge base

Turn repeated questions into short articles: problem, cause, solution, screenshots, related process. Link articles in ticket replies. Review monthly for the top 10 ticket topics.

## Adoption and KPI monitoring

| Indicator | What it shows | Example target |
|---|---|---|
| Active users vs licensed users | Are people logging in? | > 90% weekly |
| Documents created outside ERP | Shadow spreadsheets | Zero quotations outside system |
| Tickets per week by category | Training vs system issues | Falling trend |
| Business KPIs from business case | Value delivered | DSO 62 → 48 days |
| Month-end close duration | Finance maturity | ≤ 4 days by month 3 |

## Inputs

Hypercare exit report, support contract/SLA, configuration workbook, user manuals, business case KPIs.

## Outputs / deliverables

- Ticket log with categories, root causes and resolutions
- Knowledge base articles
- Monthly support and adoption report
- Prioritised improvement backlog / change requests

## Who is involved

Key users (first line), consultants (second line), developers and vendor (third line), client admin, process owners (prioritise improvements), sponsor (reviews value).

## Common pitfalls

- Support through personal phone calls and chats — nothing tracked.
- Fixing symptoms without root cause — issue returns.
- Direct database changes that break the audit trail.
- Treating every request as urgent; no priority definitions.
- Not measuring adoption; shadow spreadsheets grow silently.

## Real-world scenario

Orchid introduced a ticket form and priority rules. In the first month, 64% of tickets were "how-to". The consultant wrote 15 knowledge-base articles and ran two refresher sessions on quotations. Tickets fell by half in six weeks, and quotation spreadsheets disappeared once a pricing configuration issue (found via RCA) was fixed.

## Key takeaways

- Log every issue in one place with category and priority.
- Diagnose training vs configuration vs data vs code, and find the root cause.
- Fix safely: test first, use standard correcting documents, escalate code defects with evidence.
- Build a knowledge base from repeated questions.
- Monitor adoption and business KPIs to prove and improve value.
`,
          flashcards: [
            { term: "SLA", definition: "Service Level Agreement — agreed response and resolution times for support tickets." },
            { term: "Root-cause analysis", definition: "Investigation to find the underlying cause of an issue so it can be fixed permanently." },
            { term: "5 Whys", definition: "RCA technique asking 'why' repeatedly until the fundamental cause is found." },
            { term: "Knowledge base", definition: "Library of articles documenting solutions to common questions and issues." },
            { term: "L1 / L2 / L3 support", definition: "Support tiers: key users, consultants/partner support, developers/vendor." },
            { term: "Shadow system", definition: "Unofficial spreadsheet or tool users keep instead of the ERP — a sign of poor adoption." },
          ],
        },
      ],
    },
  ],

  /* -------------------------------------------------------------------- */
  assessment: {
    slug: "implementation-methodology-final",
    title: "Implementation Methodology — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "What is the main deliverable of the Business Discovery phase?",
        kind: "single",
        options: ["Configuration workbook", "AS-IS process documentation validated by the client", "UAT sign-off", "Cutover checklist"],
        correct: [1],
        explanation: "Discovery produces the AS-IS documentation (processes, systems, pain points) that feeds requirement analysis.",
      },
      {
        prompt: "Which of the following are good characteristics of a requirement? (Select all that apply)",
        kind: "multiple",
        options: ["Testable", "Uniquely numbered", "Describes the business need", "Specifies the exact button colour the user prefers"],
        correct: [0, 1, 2],
        explanation: "Requirements should be specific, testable, uniquely identified and business-oriented. Cosmetic preferences are not business requirements.",
      },
      {
        prompt: "In MoSCoW prioritisation, what does 'W' stand for?",
        kind: "single",
        options: ["Wanted", "Won't (this time)", "Workaround", "Waiting"],
        correct: [1],
        explanation: "Won't (this time) records items explicitly excluded from the current phase so they are not re-discussed.",
      },
      {
        prompt: "A Requirement Traceability Matrix links each requirement to its design reference and test cases.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "Traceability allows following a requirement forward to design and tests, and backward from a test to its requirement.",
      },
      {
        prompt: "During fit-gap analysis, a requirement is only partly covered by standard features. What should be recorded?",
        kind: "single",
        options: [
          "Nothing — partial fits are treated as fits",
          "The fit level, options considered, the decision and its classification/effort",
          "Only the developer's estimate",
          "The requirement is automatically deleted",
        ],
        correct: [1],
        explanation: "The fit-gap table records fit level, options, decision, classification and effort so the choice is transparent and approved.",
      },
      {
        prompt: "Why should configuration be performed in a test environment and documented in a configuration workbook? (Select all that apply)",
        kind: "multiple",
        options: [
          "To avoid disrupting live operations",
          "To reproduce the setup accurately in production",
          "To support troubleshooting later",
          "Because production databases cannot be configured at all",
        ],
        correct: [0, 1, 2],
        explanation: "Production can technically be configured, but testing first and documenting settings protects operations and enables reproduction and support.",
      },
      {
        prompt: "Which is the correct dependency order for loading data?",
        kind: "single",
        options: [
          "Opening stock, products, product categories",
          "Product categories, products, opening stock",
          "Products, opening stock, product categories",
          "Opening balances, customers, configuration",
        ],
        correct: [1],
        explanation: "Categories must exist before products reference them, and products must exist before stock can be loaded for them.",
      },
      {
        prompt: "Open customer invoices are loaded individually AND the full receivable balance is also included in the opening trial balance against the receivable account. What is the risk?",
        kind: "single",
        options: ["No risk", "Receivables are double-counted", "Invoices cannot be printed", "Taxes are removed"],
        correct: [1],
        explanation: "Loading AR both as invoices and inside the trial balance doubles the balance. Use a suspense/clearing approach so each is counted once.",
      },
      {
        prompt: "Who owns data cleansing in a migration?",
        kind: "single",
        options: ["The ERP vendor", "The business data owners", "The developer", "Nobody — the import tool cleans data"],
        correct: [1],
        explanation: "The business knows what data is correct. Consultants provide method, templates and validation tools.",
      },
      {
        prompt: "Which items belong in a technical specification? (Select all that apply)",
        kind: "multiple",
        options: ["Data model changes", "Business logic and validations", "Security / access rules", "Acceptance criteria and test scenarios"],
        correct: [0, 1, 2, 3],
        explanation: "A complete technical specification covers data model, logic, security, integration, upgrade impact, tests and acceptance criteria.",
      },
      {
        prompt: "Regression testing means re-running tests on existing functionality after a change to make sure nothing else broke.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "Regression testing protects existing features after fixes, deployments or upgrades.",
      },
      {
        prompt: "Who should execute User Acceptance Testing?",
        kind: "single",
        options: ["The developers", "The partner consultants on behalf of users", "Key users from the business", "The ERP vendor"],
        correct: [2],
        explanation: "UAT is the business confirming the system supports its processes; key users execute it with consultant support.",
      },
      {
        prompt: "Which of the following belong in a cutover plan? (Select all that apply)",
        kind: "multiple",
        options: ["Transaction freeze in the old system", "Final data loads and reconciliation", "Go/no-go decision point", "Rollback triggers and steps"],
        correct: [0, 1, 2, 3],
        explanation: "A cutover plan sequences freeze, loads, reconciliation, smoke tests, go/no-go and rollback, each with owners and timings.",
      },
      {
        prompt: "A delivery cannot be validated because opening stock was loaded into the wrong location. How should this support ticket be categorised?",
        kind: "single",
        options: ["Defect — customization", "Data", "Change request", "Defect — standard product"],
        correct: [1],
        explanation: "The system behaves correctly; the stock data is wrong. It is a data issue, fixed through a standard correcting document such as an internal transfer.",
      },
      {
        prompt: "The best way to correct wrong posted data after go-live is to edit the database tables directly, because it is fastest.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Direct database edits bypass business logic and break the audit trail. Use standard correcting documents (reversals, credit notes, adjustments) after testing.",
      },
    ],
  },

  /* -------------------------------------------------------------------- */
  assignments: [
    {
      slug: "implementation-methodology-rtm",
      title: "Build an RTM and Fit-Gap Analysis",
      instructions: `## Scenario

**Silverline Lighting Solutions** (fictional) imports and assembles LED light fittings. It sells to electrical contractors (on 30-day credit) and through a showroom (cash/card). It has one company, one main warehouse and a small showroom stock location. 30 users. Target system: Odoo 17.0. Edition not yet decided — you must flag any Enterprise-only feature.

### Discovery notes (summarised)

1. Contractors request quotations by email; sales staff build quotations in spreadsheets with project-specific prices.
2. Discounts above 12% must be approved by the Sales Director.
3. Contractors must not receive goods if they have invoices overdue by more than 45 days, unless Finance approves.
4. Fittings are assembled from a housing, driver, LED board and diffuser; assembly happens in the warehouse workshop.
5. Every LED driver has a serial number that must be traceable to the customer for warranty claims.
6. Purchases from overseas suppliers in USD; freight, insurance and customs duty must be included in product cost.
7. Purchase orders above 10,000 (local currency) require approval by the Operations Manager.
8. The showroom sells over the counter and needs receipts printed immediately.
9. Contractors want to see their open invoices and delivery status online.
10. Management wants a monthly report of gross margin by contractor and by product category.
11. A courier company provides an API for shipment booking and tracking; management would like shipments booked automatically.
12. Warranty claims are currently logged in a notebook.
13. Existing data: 2,300 products, 410 customers, 55 vendors in spreadsheets; opening stock to be counted at go-live.

## Tasks

1. **RTM** — Convert the notes into at least **15 requirements** using this structure:

| Req ID | Process area | Requirement description | Source (note #) | Type | Classification (standard / configuration / customization / integration / reporting) | Priority (MoSCoW) | Odoo app(s) | Fit / Partial / Gap | Solution notes | Edition (Community / Enterprise / either) | Test case ID |
|---|---|---|---|---|---|---|---|---|---|---|---|

2. **Fit-gap analysis** — For every Partial or Gap item:

| FG ID | Req ID | Standard behaviour | Options considered | Recommended option | Effort (days) | Risk | Decision owner |
|---|---|---|---|---|---|---|---|

3. **Test cases** — Write at least **5 test cases** for Must requirements using the columns: Test Case ID, Requirement ID, Module, Scenario, Preconditions, Test Data, Steps, Expected Result.
4. **Data migration note** — List the objects to migrate in dependency order, with the owner of each and which internal template you would use (e.g. /api/templates/products).
5. **Assumptions & open questions** — List what you assumed and what you would ask the client.

## Rules

- Do not invent Odoo features or menu paths; where unsure, write "verify in training instance".
- Clearly mark Enterprise-only apps/features.
- Apply the standard-first principle; justify every customization.

## Deliverables

- RTM table (15+ rows)
- Fit-gap table
- 5+ test cases
- Migration object list
- Assumptions and open questions (half a page)

## Evaluation criteria

| Criterion | Weight | Excellent |
|---|---|---|
| Requirement quality | 25% | Specific, testable, uniquely numbered, traceable to notes |
| Classification accuracy | 20% | Correct use of standard/configuration/customization/integration/reporting; edition flagged correctly |
| Prioritisation | 10% | Realistic MoSCoW with justified Musts |
| Fit-gap reasoning | 20% | Options considered, standard-first applied, sensible effort and risks |
| Test cases | 15% | Linked to requirements, clear data and expected results, includes negative cases |
| Migration & assumptions | 10% | Correct dependency order; useful, specific client questions |

Passing requires at least 70% overall.
`,
    },
  ],
};
