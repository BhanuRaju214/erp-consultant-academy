# Lesson-by-lesson visual enhancement matrix

Planning document for the visual upgrade of the consultant training portal. Each of the 105 lessons in the 12 courses is listed here (same order as `allCourses` in `src/content/index.ts`) with the visual blocks proposed for it. The proposals come from what each lesson actually contains: its headings, tables, walkthroughs, journal entries, ASCII diagrams and troubleshooting tables. The business processes and configuration scenarios follow, then a summary and the rollout order.

**Sources:** lesson bodies in `src/content/courses/*.ts`, `src/content/processes.ts`, `src/content/config-scenarios.ts`; statistics from `docs/visual-learning/audit-data.json`; block types from `docs/visual-learning/visual-blocks.md`. Companion files: `napkin-prompts.md` (NP-xx IDs) and `image-requirements.md` (screenshots, illustrations).

## Legend

| Column / value | Meaning |
|---|---|
| Current state | From the audit: words, Markdown tables, ASCII diagrams, `A → B → C` arrow chains, code fences. A longest text run of 100 or more means a wall of text. |
| Proposed visuals | Block type (exact `visual-*` name) and a short description. Every proposal replaces or supports existing content. None are decorative. |
| Odoo screen mockup needed? | "Yes — screen": a labelled `visual-mockup` block is proposed now and a real screenshot replaces or supplements it later. "Screenshot later — screen": no mockup block now, but a screenshot of that screen would help once captured. Both are listed in `image-requirements.md` §A. |
| Napkin | NP-ID of a recommended Napkin AI diagram, exported and embedded through `visual-figure`, in addition to the in-portal blocks. "—" means the in-portal blocks are enough. |
| **P1** | High learning impact: process-heavy content, an ASCII diagram (per the audit), or a wall of text. This includes the 7 troubleshooting & interview lessons. |
| **P2** | Medium: table-heavy configuration or reference content that a visual makes clearer. |
| **P3** | Nice-to-have: code-centred or exercise lessons where text and code stay primary. |

Selection rules applied: sequence → `visual-flow`/`visual-steps`; troubleshooting or outcome tables → `visual-decision`; options → `visual-compare`; lifecycle/history/phases → `visual-timeline`; Odoo operation → `visual-mockup`/`visual-steps`; mistakes/pitfalls → `visual-dodont`; Debit/Credit tables → `visual-journal`; worked examples with numbers → `visual-scenario`. `visual-takeaways` is generated automatically from `## Key takeaways`, so it is not listed per lesson.


## ERP Fundamentals

Course slug: `erp-fundamentals` · 11 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `what-is-erp` ★ | 580 words, 1 table, 1 ASCII diagram, 1 code fence | ERP definition; business resources; MRP → ERP II history; integrated document chain | `visual-hero`: objectives + one-database module hub<br>`visual-timeline`: MRP → MRP II → ERP → cloud ERP<br>`visual-flow`: sales order → delivery → invoice → ledger<br>`visual-check`: what ERP is not | No | NP-07 | **P1** |
| 2 | `why-businesses-implement-erp` | 630 words, 1 table | Business drivers vs client symptoms; tangible vs intangible benefits; business case | `visual-cards`: drivers with symptom and ERP answer<br>`visual-compare`: tangible vs intangible benefits<br>`visual-scenario`: business case with baseline metrics | No | — | **P2** |
| 3 | `problems-with-disconnected-applications` | 632 words, 1 table, 1 ASCII diagram, 1 code fence | Disconnected landscape (ASCII); seven core problems; quantifying cost in discovery | `visual-beforeafter`: CSV/spreadsheet landscape vs one ERP<br>`visual-cards`: seven core problems of silos<br>`visual-compare`: integration vs ERP | No | — | **P1** |
| 4 | `erp-architecture-components` | 548 words, 2 tables, 1 code fence | Layered architecture (box diagram in code fence); shared master data; transactions vs master data vs configuration | `visual-hub`: shared database with modules and integration<br>`visual-cards`: UI, app server, integration, database layers<br>`visual-compare`: transaction vs master data vs configuration<br>`visual-check`: classify a record type | No | — | **P1** |
| 5 | `crm-vs-erp-vs-accounting` | 566 words, 2 tables, 1 arrow chain | Four software categories; when each fits; hidden cost of point-to-point | `visual-compare`: accounting vs CRM vs standalone vs ERP<br>`visual-decision`: which category fits the client<br>`visual-cards`: hidden costs of “just connect them” | No | — | **P2** |
| 6 | `cloud-vs-on-premises` | 586 words, 1 table, 1 code fence | SaaS vs managed platform vs on-premises/IaaS; shared responsibility; Odoo options | `visual-compare`: SaaS vs managed vs on-premises<br>`visual-compare`: shared-responsibility matrix by layer<br>`visual-decision`: selection criteria → deployment model | No | — | **P2** |
| 7 | `saas-hosting-environments-access` | 663 words, 2 tables, 1 ASCII diagram, 1 code fence | DEV → TEST → STAGING → PROD (ASCII); config vs code promotion; least privilege; SoD; access matrix | `visual-flow`: DEV → TEST → STAGING → PRODUCTION promotion<br>`visual-compare`: sample role access matrix<br>`visual-dodont`: least privilege and segregation of duties | Screenshot later — Settings ▸ Users & Companies ▸ Users (access rights tab) | — | **P1** |
| 8 | `standard-vs-customization` | 618 words, 2 tables, 1 ASCII diagram, 1 arrow chain, 1 code fence | Configuration vs customization; five-rung “standard first” ladder; effort-over-time curve (ASCII) | `visual-decision`: five-step standard-first ladder<br>`visual-compare`: standard vs configuration vs custom<br>`visual-cards`: long-term costs of customization<br>`visual-timeline`: effort growth go-live → upgrade 2 | No | NP-08 | **P1** |
| 9 | `consultant-types` | 507 words, 1 table, 1 ASCII diagram, 1 code fence | Three profiles; skills comparison; ticket diagnosis tree (ASCII); career path | `visual-compare`: functional vs technical vs techno-functional<br>`visual-decision`: ticket diagnosis from reproduce to escalate<br>`visual-timeline`: techno-functional consultant’s day | No | NP-09 | **P1** |
| 10 | `roles-and-raci` | 634 words, 3 tables | Client / partner / vendor roles; RACI letters; sample RACI; role problems | `visual-cards`: client, partner and vendor roles<br>`visual-compare`: sample RACI matrix per activity<br>`visual-dodont`: role problems and prevention | No | — | **P2** |
| 11 | `costs-benefits-risks-success-factors` | 611 words, 3 tables, 1 ASCII diagram, 1 code fence | Full cost picture; KPI baseline → target; risks + warning signs; phased vs big-bang (ASCII) | `visual-compare`: big-bang vs phased go-live<br>`visual-timeline`: phase 1 → phase 2 → phase 3 rollout<br>`visual-cards`: often-forgotten cost categories<br>`visual-scenario`: KPI baseline → target metrics | No | — | **P1** |

## ERP Implementation Methodology

Course slug: `implementation-methodology` · 10 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `implementation-approaches` | 647 words, 2 tables, 1 code fence | Waterfall chain; agile; hybrid; nine course phases with deliverables | `visual-timeline`: nine phases with main deliverables<br>`visual-compare`: waterfall vs agile vs hybrid<br>`visual-flow`: waterfall discovery → support (compact) | No | NP-10 | **P1** |
| 2 | `phase-1-business-discovery` | 784 words, 3 tables | Prepare → interviews → observe → document AS-IS; questionnaire; pain-point register | `visual-steps`: four discovery activities to AS-IS<br>`visual-cards`: inputs, outputs, who is involved<br>`visual-dodont`: discovery pitfalls | No | — | **P2** |
| 3 | `phase-2-requirement-analysis` | 806 words, 4 tables | Requirement types; classification; MoSCoW; RTM template | `visual-compare`: MoSCoW priorities with guidelines<br>`visual-decision`: classify requirement standard → custom<br>`visual-flow`: workshop note → RTM row → fit/gap | No | — | **P2** |
| 4 | `phase-3-to-be-process-design` | 703 words, 4 tables, 1 ASCII diagram, 1 code fence | TO-BE quote-to-install flow (ASCII); app mapping; approval controls; fit-gap | `visual-flow`: TO-BE quote-to-install with app per step<br>`visual-compare`: fit vs partial fit vs gap<br>`visual-cards`: approval controls and approvers | No | NP-11 | **P1** |
| 5 | `phase-4-solution-configuration` | 747 words, 1 table, 1 code fence | Nine-step configuration order; key configuration areas; configuration workbook | `visual-steps`: nine-step recommended configuration order<br>`visual-cards`: companies, access, journals, UoM, sequences<br>`visual-dodont`: configuration pitfalls | No | — | **P2** |
| 6 | `phase-5-data-migration` | 820 words, 3 tables, 1 code fence | Extract → cleanse → map → validate → load → reconcile loop; dependency order; opening balances | `visual-flow`: six migration steps with trial-load loop<br>`visual-steps`: eight-object load dependency order<br>`visual-scenario`: reconciliation counts and totals sign-off | Screenshot later — Contacts list ▸ Import records (column mapping) | NP-12 | **P1** |
| 7 | `phase-6-development-integration` | 771 words, 3 tables, 1 ASCII diagram, 1 code fence | Gap → functional spec → technical spec → build → test → staging (ASCII); expiry rule; integration questions | `visual-flow`: approved gap → spec → DEV → TEST → STAGING<br>`visual-decision`: expiry-warning business rule<br>`visual-cards`: build practices to expect | No | NP-15 | **P1** |
| 8 | `phase-7-testing-training` | 790 words, 4 tables, 1 arrow chain | Test types; test case template; defect register; end-to-end UAT cycles | `visual-compare`: test types by purpose, who, when<br>`visual-flow`: end-to-end UAT cycles (compact)<br>`visual-cards`: user manual outline sections | No | — | **P2** |
| 9 | `phase-8-go-live` | 768 words, 2 tables, 1 code fence | Cutover timeline T-4 weeks → T+2; readiness criteria; data validation; hypercare | `visual-timeline`: cutover T-4 weeks → go-live Monday<br>`visual-decision`: go/no-go meeting outcome<br>`visual-cards`: readiness criteria and hypercare metrics | No | NP-13 | **P1** |
| 10 | `phase-9-post-go-live-support` | 810 words, 4 tables, 1 ASCII diagram, 1 arrow chain, 2 code fences | Ticket lifecycle (ASCII); escalation L1 → L3; priority matrix; RCA; adoption KPIs | `visual-flow`: ticket logged → closed with escalation branch<br>`visual-flow`: end user → L1 → L2 → L3/vendor<br>`visual-compare`: priority matrix response vs resolution | No | NP-14 | **P1** |

## Odoo CRM: Leads, Pipeline & Forecasting

Course slug: `odoo-crm` · 5 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `overview-and-business-problems` | 623 words, 4 tables, 1 ASCII diagram, 1 code fence | Enquiry → lead → opportunity → quotation → won/lost (ASCII); Leads setting on/off; core objects | `visual-flow`: enquiry → lead → opportunity → quotation → won<br>`visual-decision`: Leads setting on vs off<br>`visual-hub`: CRM dependencies on Sales, Contacts, Mail | Screenshot later — CRM ▸ Sales ▸ My Pipeline (Kanban) | NP-16 | **P1** |
| 2 | `prerequisites-configuration-settings` | 620 words, 4 tables | Access levels; seven configuration steps; pipeline stages; lost reasons | `visual-steps`: seven CRM configuration steps<br>`visual-flow`: New → Qualified → Proposition → Won stages<br>`visual-mockup`: CRM settings with Leads option | Yes — CRM ▸ Configuration ▸ Settings | — | **P2** |
| 3 | `master-data-and-transactions` | 668 words, 2 tables | Walkthroughs A–F: capture, qualify/convert, merge, pipeline, quotation, won/lost | `visual-steps`: capture → convert → quotation → won<br>`visual-mockup`: Convert to Opportunity wizard<br>`visual-compare`: Won vs Lost vs Restore outcome | Yes — CRM ▸ Leads ▸ Leads ▸ Convert to Opportunity wizard | — | **P2** |
| 4 | `automation-reports-impact` | 561 words, 4 tables | Automation mechanisms; predictive lead scoring; reports; KPI formulas; no accounting impact | `visual-cards`: CRM KPIs with formulas<br>`visual-flow`: lead-scoring inputs → probability<br>`visual-hub`: CRM integration points | Screenshot later — CRM ▸ Reporting ▸ Pipeline (pivot) | — | **P2** |
| 5 | `troubleshooting-practice-interview` | 688 words, 1 table, 1 arrow chain, longest text run 289 | 10-row troubleshooting table; 3 practice tasks; 7 interview Q&As (wall of text) | `visual-decision`: 10 CRM symptoms → cause → fix<br>`visual-dodont`: lead hygiene and duplicates<br>`visual-steps`: three practice assignments<br>`visual-check`: lead vs opportunity interview check | No | — | **P1** |

## Odoo Sales: Quotation to Invoice

Course slug: `odoo-sales` · 5 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `overview-and-business-problems` | 569 words, 5 tables, 1 ASCII diagram, 1 arrow chain, 1 code fence | Document lifecycle statuses; quotation → order → delivery/invoice → payment (ASCII); roles; dependencies | `visual-flow`: quotation → sales order → delivery → invoice → payment<br>`visual-flow`: status chain Quotation → Sales Order (compact)<br>`visual-hub`: Sales with CRM, Inventory, Accounting<br>`visual-cards`: Northwind sales roles | Screenshot later — Sales ▸ Orders ▸ Quotations (form status bar) | NP-17 | **P1** |
| 2 | `prerequisites-configuration-settings` | 561 words, 3 tables | Prerequisites; settings table; pricelist computation; payment terms; templates; invoicing policy | `visual-compare`: pricelist computation types with examples<br>`visual-mockup`: Sales settings (pricelists, templates)<br>`visual-steps`: configure payment term 50% advance | Yes — Sales ▸ Configuration ▸ Settings | — | **P2** |
| 3 | `master-data-and-transactions` ★ | 586 words, 3 tables | Product type 17 vs 18; walkthroughs A–F; invoicing policy table; down payment; discounts/margins | `visual-steps`: walkthroughs A–F quotation to invoice<br>`visual-mockup`: quotation for Greenfield International School<br>`visual-compare`: ordered vs delivered invoiceable quantity<br>`visual-flow`: down payment → delivery → final invoice | Yes — Sales ▸ Orders ▸ Quotations ▸ New (S00042) | NP-17 | **P1** |
| 4 | `automation-reports-impact` | 498 words, 4 tables | Discount approval options; reports; event → inventory/accounting impact table; integrations | `visual-flow`: confirm → deliver → invoice with impact<br>`visual-journal`: customer invoice posted<br>`visual-compare`: discount approval options by scope | Screenshot later — Sales ▸ Reporting ▸ Sales (pivot) | — | **P2** |
| 5 | `troubleshooting-practice-interview` ★ | 664 words, 1 table, longest text run 252 | 10-row troubleshooting table; 3 practice tasks; 7 interview Q&As (wall of text) | `visual-decision`: “no invoiceable line” and pricing issues<br>`visual-dodont`: invoicing policy and pricelist mistakes<br>`visual-steps`: three practice assignments<br>`visual-check`: invoicing policy interview check | No | — | **P1** |

## Odoo Purchase: RFQ to Vendor Bill

Course slug: `odoo-purchase` · 5 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `overview-and-business-problems` | 571 words, 5 tables, 1 ASCII diagram, 1 arrow chain, 1 code fence | RFQ lifecycle; approval threshold; receipt + bill; 3-way match; payment (ASCII) | `visual-flow`: need → RFQ → PO → receipt/bill → payment<br>`visual-decision`: approval threshold → To Approve<br>`visual-hub`: Purchase with Inventory and Accounting | Screenshot later — Purchase ▸ Orders ▸ Purchase Orders (status bar) | NP-18 | **P1** |
| 2 | `prerequisites-configuration-settings` | 524 words, 4 tables, 1 arrow chain | Access rights; Order Approval; bill control policy; Purchase Agreements | `visual-steps`: enable Order Approval threshold<br>`visual-compare`: ordered vs received bill control<br>`visual-mockup`: Purchase settings Order Approval | Yes — Purchase ▸ Configuration ▸ Settings | — | **P2** |
| 3 | `master-data-and-transactions` | 696 words, 3 tables | Vendor pricelist; walkthroughs A–G (approval, partial receipt, bill control, 3-way match, replenishment, blanket order) | `visual-steps`: RFQ → approve → receive → bill<br>`visual-mockup`: RFQ with vendor pricelist line<br>`visual-decision`: 3-way match → should be paid<br>`visual-compare`: billable now by control policy | Yes — Purchase ▸ Orders ▸ Requests for Quotation | — | **P2** |
| 4 | `automation-reports-impact` | 520 words, 4 tables | Approval needs vs solutions; reports; receipt/bill accounting impact; integrations | `visual-journal`: receipt then vendor bill entries<br>`visual-flow`: PO → receipt → bill with impact<br>`visual-compare`: approval needs vs solution scope | Screenshot later — Purchase ▸ Reporting ▸ Purchase (pivot) | — | **P2** |
| 5 | `troubleshooting-practice-interview` | 666 words, 1 table, longest text run 261 | 10-row troubleshooting table; 3 practice tasks; 7 interview Q&As (wall of text) | `visual-decision`: PO stuck, no bill line, no RFQ<br>`visual-dodont`: vendor pricelist and bill mistakes<br>`visual-steps`: three practice assignments<br>`visual-check`: 3-way matching interview check | No | — | **P1** |

## Odoo Inventory: Warehouses, Routes, Stock Operations and Valuation

Course slug: `odoo-inventory` · 6 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `inventory-overview-and-process-flow` | 681 words, 4 tables, 3 code fences | Procure-to-stock-to-ship flow; 3-step delivery/receipt; side flows (count, scrap, returns) | `visual-flow`: PO → receipt → stock → SO → delivery<br>`visual-compare`: 1-step vs 2-step vs 3-step routes<br>`visual-cards`: locations, quants, operation types, routes | Screenshot later — Inventory ▸ Overview dashboard | NP-19 | **P1** |
| 2 | `inventory-dependencies-and-configuration` | 765 words, 6 tables | App dependencies; master-data checklist; settings; warehouse steps; operation types; category valuation | `visual-hub`: Inventory with Purchase, Sales, Accounting<br>`visual-mockup`: warehouse incoming/outgoing shipment steps<br>`visual-compare`: standard vs Enterprise vs custom | Yes — Inventory ▸ Configuration ▸ Warehouses | — | **P2** |
| 3 | `inventory-master-data` | 674 words, 6 tables | UoM categories; costing per category; product types; location types; putaway; routes; lots; opening stock | `visual-compare`: product types tracked vs valued<br>`visual-cards`: internal vs virtual location types<br>`visual-mockup`: product form Inventory tab<br>`visual-steps`: load opening stock via Physical Inventory | Yes — Inventory ▸ Products ▸ Products (Inventory tab) | — | **P2** |
| 4 | `inventory-transactions` | 710 words, 1 table | Transfer states; receipt with backorder; 2-step Pick ▸ Ship; lots; returns; counts; scrap; landed costs | `visual-flow`: Draft → Waiting → Ready → Done states<br>`visual-steps`: 2-step delivery NW/PICK → NW/OUT<br>`visual-decision`: partial receipt → backorder or not<br>`visual-mockup`: receipt validation with backorder prompt | Yes — Inventory ▸ Operations ▸ Transfers (receipt) | — | **P1** |
| 5 | `inventory-automation-reports-valuation` | 708 words, 10 tables | Reordering rule min/max; reports; costing methods; manual vs automated valuation; Anglo-Saxon entries | `visual-scenario`: reorder rule min 400 / max 1,200<br>`visual-compare`: Standard vs AVCO vs FIFO<br>`visual-journal`: receipt, delivery, COGS, loss entries<br>`visual-mockup`: Replenishment screen | Yes — Inventory ▸ Operations ▸ Replenishment | NP-20 | **P1** |
| 6 | `inventory-troubleshooting-and-interview` | 825 words, 1 table, longest text run 386 | 10-row troubleshooting table; 11-task checklist; 10 interview Q&As (longest text run in course) | `visual-decision`: stock exists but not reservable<br>`visual-dodont`: valuation and UoM mistakes<br>`visual-steps`: practical assignment task list<br>`visual-check`: storable vs consumable interview check | No | — | **P1** |

## Odoo Accounting: Invoicing, Payments, Bank Reconciliation, Reporting & Indian GST E-Invoicing

Course slug: `odoo-accounting` · 10 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `accounting-overview-and-process-flow` | 503 words, 4 tables, 2 ASCII diagrams, 3 code fences | Invoicing vs Accounting apps; O2C, P2P and R2R flows with account impacts (2 ASCII) | `visual-flow`: O2C invoice → payment → bank with impacts<br>`visual-flow`: P2P bill → payment → bank with impacts<br>`visual-flow`: R2R daily postings → year-end (compact)<br>`visual-compare`: Community Invoicing vs Enterprise Accounting | Screenshot later — Accounting ▸ Dashboard (journal cards) | NP-21, NP-23 | **P1** |
| 2 | `accounting-dependencies-and-configuration` | 711 words, 7 tables | Apps feeding Accounting; fiscal localization; account types; journals; taxes | `visual-hub`: apps sending entries to Accounting<br>`visual-cards`: journal types with Northwind journals<br>`visual-mockup`: tax form fields explained | Yes — Accounting ▸ Configuration ▸ Taxes | — | **P2** |
| 3 | `accounting-master-data-and-opening-balances` | 620 words, 4 tables, longest text run 171 | Payment terms; partner accounting fields; fiscal positions; currencies; opening balance entry | `visual-journal`: opening balance entry 1 January<br>`visual-decision`: fiscal position auto-apply → tax mapping<br>`visual-compare`: payment terms lines and use<br>`visual-mockup`: customer Accounting tab | Yes — Contacts ▸ customer ▸ Accounting tab | — | **P1** |
| 4 | `accounting-transactions` | 725 words, 2 tables, longest text run 119 | Invoice; credit note; bill; payments; bank statement + suspense; reconciliation models; paying vendors | `visual-flow`: statement import → suspense → match → reconciled<br>`visual-journal`: payment via Outstanding Receipts<br>`visual-steps`: credit note from posted invoice<br>`visual-mockup`: bank reconciliation widget | Yes — Accounting ▸ Dashboard ▸ bank journal ▸ Reconcile | NP-22 | **P1** |
| 5 | `accounting-controls-reports-integration` | 598 words, 9 tables | Approvals; lock dates; analytic plans; reports by edition; five journal entries; integrations | `visual-journal`: five key transaction entries<br>`visual-cards`: lock date types and purpose<br>`visual-compare`: reports by Community vs Enterprise | Screenshot later — Accounting ▸ Reporting ▸ Profit and Loss | — | **P2** |
| 6 | `accounting-troubleshooting-and-interview` | 785 words, 1 table, longest text run 370 | 10-row troubleshooting table; 12-task checklist; 10 interview Q&As (wall of text) | `visual-decision`: lock date, In Payment, tax issues<br>`visual-dodont`: opening balance and reconciliation mistakes<br>`visual-steps`: practical assignment task list<br>`visual-check`: outstanding receipts interview check | No | — | **P1** |
| 7 | `india-gst-fundamentals` | 1092 words, 12 tables | CGST/SGST/IGST; GSTIN structure; place of supply; HSN/SAC; worked invoices A/B; ITC set-off | `visual-decision`: place of supply → CGST+SGST or IGST<br>`visual-journal`: invoice A intra-state vs B inter-state<br>`visual-scenario`: monthly ITC set-off net payable<br>`visual-cards`: GSTIN position meanings | No | NP-24 | **P1** |
| 8 | `india-gst-configuration-odoo` | 1044 words, 5 tables | Install localization; company GSTIN; partner GST treatment; HSN/taxes; journals; reverse charge; troubleshooting | `visual-steps`: localization → company → partners → products<br>`visual-compare`: GST treatment options and effect<br>`visual-mockup`: partner form GST Treatment field<br>`visual-decision`: GST configuration troubleshooting | Yes — Contacts ▸ customer (GST Treatment, GSTIN) | — | **P1** |
| 9 | `india-e-invoicing-irn` | 1150 words, 4 tables | IRP/IRN/QR; INV-01 fields; IAP via GSP; setup; prerequisites; status flow; cancellation | `visual-flow`: confirm → To Send → IRP → Sent<br>`visual-decision`: within 24 h cancel, else credit note<br>`visual-cards`: seven prerequisite checks<br>`visual-mockup`: invoice e-invoicing status and IRN | Yes — Accounting ▸ Customers ▸ Invoices (EDI status) | NP-25 | **P1** |
| 10 | `india-eway-bill-returns-tds` | 1003 words, 6 tables | E-way bill parts; GST returns; GSTR-2B statuses; month-end; TDS/TCS | `visual-decision`: GSTR-2B match status → action<br>`visual-steps`: e-way bill from posted invoice<br>`visual-compare`: income-tax vs GST TDS/TCS<br>`visual-timeline`: month-end GST compliance checklist | Screenshot later — Posted invoice ▸ e-way bill fields | NP-26 | **P1** |

## Odoo Manufacturing: Bills of Materials, Work Centers, Manufacturing Orders and Costing

Course slug: `odoo-manufacturing` · 6 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `manufacturing-overview-and-process-flow` | 752 words, 4 tables, 1 ASCII diagram, 2 code fences | Plan-to-produce flow; MO states; work orders; Virtual Production moves; 3-step manufacturing (ASCII) | `visual-flow`: demand → MO states → stock moves → delivery<br>`visual-compare`: 1-step vs 2-step vs 3-step manufacturing<br>`visual-cards`: BoM, work center, MO, work order | Screenshot later — Manufacturing ▸ Operations ▸ Manufacturing Orders | NP-27 | **P1** |
| 2 | `manufacturing-dependencies-and-configuration` | 823 words, 4 tables | App dependencies by edition; master data; settings; warehouse steps; routes; security | `visual-hub`: Manufacturing with Inventory, Purchase, Accounting<br>`visual-compare`: warehouse manufacturing step options<br>`visual-mockup`: Manufacturing settings (Work Orders) | Yes — Manufacturing ▸ Configuration ▸ Settings | — | **P2** |
| 3 | `manufacturing-master-data` | 779 words, 7 tables | Products; work centers; BoM components/operations; BoM types; variants; cost roll-up 106.20 | `visual-scenario`: cost roll-up 60.20 + 46.00 = 106.20<br>`visual-compare`: Manufacture vs Kit vs Subcontracting BoM<br>`visual-mockup`: BoM components and operations tabs | Yes — Manufacturing ▸ Products ▸ Bills of Materials | NP-28 | **P1** |
| 4 | `manufacturing-transactions` | 744 words, 1 table | MO lifecycle table; make 10 cabinets; partial + backorder; scrap; unbuild; MTO; subcontracting | `visual-flow`: Draft → Confirmed → In Progress → To Close → Done<br>`visual-steps`: make 10 cabinets walkthrough<br>`visual-flow`: subcontracting PO → resupply → receipt<br>`visual-mockup`: MO with Work Orders tab | Yes — MO form ▸ Work Orders tab | NP-29 | **P1** |
| 5 | `manufacturing-automation-reports-costing` | 795 words, 8 tables, longest text run 115 | Approval options; automation triggers; reports; stock moves; cost elements; MO journal entries | `visual-journal`: components consumed and finished goods in<br>`visual-compare`: approval needs standard vs Enterprise<br>`visual-flow`: stock moves From → To per MO | Screenshot later — Manufacturing ▸ Reporting (cost analysis) | — | **P1** |
| 6 | `manufacturing-troubleshooting-and-interview` | 740 words, 1 table, longest text run 354 | 10-row troubleshooting table; 11-task checklist; 10 interview Q&As (wall of text) | `visual-decision`: RFQ instead of MO, components unavailable<br>`visual-dodont`: BoM costing and consumption mistakes<br>`visual-steps`: practical assignment task list<br>`visual-check`: Kit vs Manufacture BoM check | No | — | **P1** |

## Odoo eCommerce & E-Invoicing for Online Retail

Course slug: `odoo-ecommerce-einvoicing` · 7 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `ecommerce-overview-and-process-flow` | 780 words, 5 tables, 1 ASCII diagram, 1 code fence | Online order-to-cash: cart → payment → SO → invoice → e-invoice → payout → returns (ASCII) | `visual-flow`: browse → pay → invoice → e-invoice → payout<br>`visual-hub`: Website, Sales, Inventory, Accounting apps<br>`visual-flow`: return → credit note → refund (compact) | Screenshot later — Website ▸ shop checkout (payment step) | NP-30 | **P1** |
| 2 | `ecommerce-dependencies-prerequisites-configuration` | 893 words, 4 tables | Dependencies; two kinds of categories; B2C tax-included pricing; EU OSS; settings; payment providers; auto-invoice | `visual-compare`: B2C tax-included vs B2B net pricing<br>`visual-decision`: EU consumer abroad → OSS fiscal position<br>`visual-mockup`: Website eCommerce settings | Yes — Website ▸ Configuration ▸ Settings | — | **P2** |
| 3 | `ecommerce-master-data-and-transactions` | 853 words, 4 tables | Variants; pricelists; B2B customers; delivery methods; scenarios A (B2C), B (intra-EU B2B), C (partial return) | `visual-scenario`: scenario A Belgian B2C order<br>`visual-scenario`: scenario B intra-EU B2B order<br>`visual-steps`: scenario C partial return<br>`visual-compare`: Public vs Wholesale vs Summer Sale pricelist | Screenshot later — Sales order created from website order | — | **P2** |
| 4 | `einvoicing-concepts-formats-networks` | 913 words, 5 tables, 2 code fences | PDF vs e-invoice; formats; post-audit vs clearance; Peppol four-corner model; B2G/B2B/B2C; archiving | `visual-compare`: PDF invoice vs structured e-invoice<br>`visual-flow`: Peppol C1 → C2 → C3 → C4<br>`visual-compare`: post-audit vs clearance vs real-time<br>`visual-cards`: UBL, Factur-X and other formats | No | NP-31, NP-32 | **P1** |
| 5 | `einvoicing-and-automation-in-odoo` | 1022 words, 5 tables | Partner e-invoice settings; Send & Print options; Odoo as Peppol access point; country EDI; data-quality rules | `visual-steps`: register company on Peppol in Odoo<br>`visual-mockup`: Send & Print wizard options<br>`visual-cards`: data-quality rules and rejections<br>`visual-compare`: country EDI approaches | Yes — Invoice ▸ Send & Print wizard | NP-33 | **P1** |
| 6 | `ecommerce-reports-accounting-integration` | 707 words, 10 tables | Reports; KPIs; four-step online payment accounting; partial return; intra-EU B2B entry; integrations | `visual-journal`: payment → invoice → delivery → payout entries<br>`visual-cards`: Urban Thread KPIs with targets<br>`visual-journal`: partial return credit note | Screenshot later — Website ▸ Reporting ▸ eCommerce dashboard | — | **P2** |
| 7 | `ecommerce-troubleshooting-and-interview` | 919 words, 1 table, longest text run 417 | 10-row troubleshooting table; 11-task checklist; 10 interview Q&As (longest text run in portal) | `visual-decision`: e-invoice rejected, receiver not found<br>`visual-dodont`: tax-included pricing mistakes<br>`visual-steps`: practical assignment task list<br>`visual-check`: PDF vs e-invoice interview check | No | — | **P1** |

## Odoo Technical Fundamentals

Course slug: `odoo-technical-fundamentals` · 18 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `odoo-architecture` | 907 words, 3 tables, 1 code fence | Server, ORM, PostgreSQL, web client; addons path; delivery types; six-step request flow; editions | `visual-flow`: Confirm click → RPC → access → ORM → commit<br>`visual-hub`: server, ORM, database, web client tiers<br>`visual-compare`: change type vs survives upgrade | No | NP-34 | **P2** |
| 2 | `python-essentials-for-odoo` | 551 words, 2 tables, 10 code fences | Core Python; recordsets; self.env; domains; ORM CRUD; raised errors; Odoo shell | `visual-cards`: recordset, env, domain, CRUD<br>`visual-decision`: Python error → likely cause → fix<br>`visual-check`: recordset iteration self-check | No | — | **P3** |
| 3 | `postgresql-essentials` | 536 words, 5 tables, 6 code fences | Golden rule (read-only on production); naming; essential queries; SQL concepts | `visual-dodont`: allowed vs forbidden on production<br>`visual-compare`: Odoo model vs PostgreSQL table naming<br>`visual-cards`: essential query patterns | No | — | **P3** |
| 4 | `git-workflow-for-odoo-modules` | 587 words, 4 tables, 4 code fences | Repository layout; branching model; daily workflow; commit tags; undoing mistakes; leaked secrets | `visual-flow`: feature branch → commit → review → merge → deploy<br>`visual-compare`: branch purpose and target environment<br>`visual-decision`: situation → safe undo command | No | — | **P2** |
| 5 | `dev-environment-and-safety` | 601 words, 3 tables, 6 code fences | Non-negotiable rules; environment ladder; neutralised DBs; install vs upgrade; secrets; backups | `visual-flow`: local → DEV → TEST → STAGING → PROD ladder<br>`visual-dodont`: non-negotiable safety rules<br>`visual-decision`: what changed → install or upgrade | No | — | **P2** |
| 6 | `module-structure-and-manifest` | 442 words, 2 tables, 1 ASCII diagram, 11 code fences | Module anatomy (folder tree flagged as ASCII); manifest; starter files | `visual-cards`: module file/folder purposes<br>`visual-steps`: create and install the module<br>`visual-decision`: install error → cause → fix | Screenshot later — Apps ▸ Update Apps List ▸ module card | — | **P1** |
| 7 | `models-and-field-types` | 507 words, 3 tables, 5 code fences | Simple fields; Many2one / One2many / Many2many; relationship sketch | `visual-compare`: simple vs relational field types<br>`visual-hub`: sale.order ↔ delivery window ↔ tag<br>`visual-check`: pick the right relational field | Screenshot later — Sales order form with delivery windows tab | — | **P2** |
| 8 | `computed-related-fields-and-constraints` | 561 words, 2 tables, 6 code fences | Computed fields (store/depends); related fields; Python vs SQL constraints | `visual-compare`: computed vs related vs constraint<br>`visual-decision`: Python vs SQL constraint<br>`visual-dodont`: compute dependency mistakes | No | — | **P3** |
| 9 | `views-and-view-inheritance` | 488 words, 3 tables, 1 ASCII diagram, 3 code fences | View types; Odoo 17 attribute changes; XPath positions; inheritance | `visual-compare`: Odoo 16 attrs vs Odoo 17 syntax<br>`visual-cards`: XPath position values and effect<br>`visual-mockup`: inherited field on sales order form | Yes — Sales order form (inherited field highlighted) | — | **P1** |
| 10 | `actions-menus-and-security` | 557 words, 4 tables, 5 code fences | Actions; menus; groups → access rights → record rules; expected user outcomes | `visual-flow`: groups → access rights → record rules<br>`visual-compare`: Sam vs Mia vs Wes access<br>`visual-decision`: access error → missing layer | Screenshot later — Settings ▸ Technical ▸ Record Rules | — | **P2** |
| 11 | `extending-sale-order` | 457 words, 1 table, 4 code fences | _inherit pattern; action_confirm override chain; super() | `visual-flow`: action_confirm override chain with super()<br>`visual-dodont`: always call super(), never skip | No | NP-35 | **P2** |
| 12 | `smart-buttons` | 581 words, 3 tables, 3 code fences | Smart button anatomy; open list vs single record; design guidelines | `visual-mockup`: sales order with custom smart button<br>`visual-dodont`: smart button design guidelines | Yes — Sales order form button box | — | **P2** |
| 13 | `approval-workflow` | 450 words, 2 tables, 3 code fences | approval_state values; buttons per state; threshold parameter | `visual-flow`: not_required/draft → to_approve → approved/rejected<br>`visual-mockup`: header buttons per approval state | Yes — Sales order header (Request Approval) | NP-36 | **P2** |
| 14 | `scheduled-and-automated-actions` | 644 words, 4 tables, 3 code fences | Tool selection; cron; server action; automation rule; code vs configuration | `visual-decision`: need → scheduled/server action/automation rule<br>`visual-compare`: prefer configuration vs prefer code | Screenshot later — Settings ▸ Technical ▸ Automation Rules | — | **P2** |
| 15 | `qweb-pdf-reports` | 548 words, 4 tables, 2 code fences | Report action + QWeb template; inheriting sale report; directives; requirement checklist | `visual-flow`: report action → QWeb template → PDF<br>`visual-cards`: QWeb directives cheat sheet | No | — | **P3** |
| 16 | `debugging-and-logging` | 607 words, 3 tables, 5 code fences | Structured debugging method; developer mode tools; logs; log levels; dev flags; error catalogue | `visual-steps`: structured debugging method<br>`visual-cards`: developer-mode tools and use<br>`visual-decision`: error message → root cause → fix | Screenshot later — Developer mode debug menu (View Fields) | — | **P2** |
| 17 | `automated-tests` | 422 words, 3 tables, 6 code fences | TransactionCase vs HttpCase; test file; run flags; expected output | `visual-compare`: test classes and behaviour<br>`visual-steps`: write, tag and run tests | No | — | **P3** |
| 18 | `practical-development-assignments` | 745 words, 2 tables, 1 code fence | 13 assignments; evidence checklist; common errors | `visual-cards`: 13 assignments with skills<br>`visual-check`: evidence checklist self-check | No | — | **P3** |

## Integration Fundamentals

Course slug: `integration-fundamentals` · 12 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `rest-and-http-fundamentals` | 656 words, 5 tables, 1 ASCII diagram, 3 code fences | Client/server request-response (ASCII); request anatomy; REST resources; methods; status codes | `visual-flow`: client request → server response<br>`visual-compare`: HTTP methods safe vs idempotent<br>`visual-decision`: status code → retry or fix | No | — | **P1** |
| 2 | `json-and-xml` | 510 words, 4 tables, 4 code fences | JSON types; XML concepts; parsing; JSON vs XML; field mapping | `visual-compare`: JSON vs XML<br>`visual-flow`: web shop JSON → transform → Odoo field | No | — | **P3** |
| 3 | `authentication-and-authorization` | 837 words, 6 tables | Authentication vs authorization; methods; OAuth2 terms; Odoo API keys; integration user | `visual-compare`: authentication vs authorization<br>`visual-cards`: OAuth2 roles and tokens<br>`visual-dodont`: dedicated least-privilege integration user | Screenshot later — Preferences ▸ Account Security ▸ API Keys | — | **P2** |
| 4 | `secrets-management` | 564 words, 3 tables, 6 code fences | What is a secret; forbidden vs approved locations; env vars; rotation; masked logging | `visual-dodont`: where secrets never vs should live<br>`visual-decision`: rotation trigger → action | No | — | **P2** |
| 5 | `webhooks` | 572 words, 2 tables, 5 code fences | Polling vs webhooks; signature verification; idempotency; respond fast; ordering; Odoo options | `visual-compare`: polling vs webhook<br>`visual-flow`: verify → store → 200 → queue → process<br>`visual-decision`: duplicate or out-of-order event | No | NP-38 | **P1** |
| 6 | `postman-testing` | 545 words, 3 tables, 5 code fences | Collections; variables without secrets; JSON-RPC authenticate and read | `visual-steps`: authenticate then read customers<br>`visual-compare`: initial vs current variable values | No | — | **P3** |
| 7 | `odoo-xml-rpc` | 511 words, 3 tables, 6 code fences | /common vs /object endpoints; execute_kw; methods table; quotation with lines; error handling | `visual-flow`: version → authenticate → execute_kw calls<br>`visual-compare`: execute_kw methods args and returns<br>`visual-decision`: Fault vs transport error retry | No | NP-37 | **P1** |
| 8 | `odoo-json-rpc-and-json-2` | 584 words, 3 tables, 5 code fences | JSON-RPC (17/18); JSON-2 (19); comparison; version choice; adapter pattern | `visual-compare`: XML-RPC/JSON-RPC vs JSON-2<br>`visual-decision`: client version → API recommendation | No | — | **P2** |
| 9 | `business-integrations` | 726 words, 7 tables | Decision ladder; payment, e-commerce, CRM, banking, shipping; requirements checklist | `visual-decision`: integration decision ladder<br>`visual-cards`: five integration areas and approach | No | — | **P2** |
| 10 | `middleware-and-scheduled-sync` | 575 words, 4 tables, 1 ASCII diagram, 2 code fences | Point-to-point vs middleware; sync patterns; watermark delta; queue (ASCII); monitoring | `visual-compare`: point-to-point vs middleware/iPaaS<br>`visual-flow`: web shop → receiver → queue → worker → Odoo<br>`visual-compare`: event vs batch vs delta vs full | No | NP-40 | **P1** |
| 11 | `error-handling-retries-idempotency` | 605 words, 4 tables, 4 code fences | Error classes; exponential backoff + jitter; idempotency keys; upsert; logging; reconciliation | `visual-decision`: error class → retry strategy<br>`visual-timeline`: backoff 1 → 2 → 4 → 8 s → dead-letter<br>`visual-flow`: search by external ref → create or skip | No | NP-39 | **P1** |
| 12 | `practical-integration-assignments` | 795 words, 3 tables, 2 code fences | Six assignments; integration design template; field mapping sub-template | `visual-steps`: six assignments in order<br>`visual-cards`: integration design document sections | No | — | **P3** |

## Testing & Quality Assurance for ERP Projects

Course slug: `testing-qa` · 10 lessons

| # | Lesson (slug) | Current state | Key concepts to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `erp-testing-fundamentals` | 808 words, 4 tables | ERP vs typical testing; seven test levels; entry/exit criteria; six-stage testing lifecycle | `visual-flow`: plan → design → prepare → execute → defects → close<br>`visual-compare`: test levels by who and when<br>`visual-compare`: SIT and UAT entry vs exit | No | NP-41 | **P1** |
| 2 | `writing-business-scenario-test-cases` | 839 words, 5 tables | Test case template; writing rules; worked O2C, P2P, return examples; common mistakes | `visual-cards`: test case template fields<br>`visual-scenario`: O2C with pricelist and tax<br>`visual-dodont`: test case writing mistakes | No | — | **P2** |
| 3 | `functional-and-integration-testing` | 574 words, 5 tables | Functional tests; internal/external integration points; MTO scenario; test cycles | `visual-flow`: MTO scenario across apps with checks<br>`visual-compare`: functional vs integration testing<br>`visual-timeline`: integration test cycles | No | — | **P2** |
| 4 | `data-migration-testing` | 599 words, 5 tables | Four validation techniques; record counts; control totals; samples; AR/AP/stock reconciliation; cycles | `visual-cards`: four validation techniques<br>`visual-scenario`: record-count sheet with differences<br>`visual-timeline`: migration test loads and sign-off | No | — | **P2** |
| 5 | `role-based-access-testing` | 632 words, 4 tables | Access layers; role matrix; positive/negative tests; record rules; multi-company | `visual-compare`: role matrix per app<br>`visual-cards`: positive vs negative access tests<br>`visual-check`: expected result of a negative test | Screenshot later — Switch user (log in as test user) — record list | — | **P2** |
| 6 | `financial-inventory-reconciliation-tests` | 651 words, 4 tables | Stock valuation vs GL; AR subledger vs control; bank; tax; reconciliation pack | `visual-compare`: source A vs source B per check<br>`visual-decision`: difference found → typical cause<br>`visual-cards`: four reconciliations in the pack | Screenshot later — Inventory ▸ Reporting ▸ Valuation vs GL balance | — | **P2** |
| 7 | `user-acceptance-testing` | 510 words, 5 tables | UAT planning; key users; scripts; kick-off → sign-off; defect vs change request; sign-off form | `visual-flow`: kick-off → guided → triage → retest → sign-off<br>`visual-decision`: defect vs change request vs training<br>`visual-dodont`: UAT pitfalls and prevention | No | NP-43 | **P1** |
| 8 | `regression-testing` | 610 words, 4 tables | Triggers vs scope; regression pack; upgrade specifics; automation candidates; six-step cycle | `visual-flow`: six-step regression cycle<br>`visual-compare`: trigger vs regression scope | No | NP-44 | **P2** |
| 9 | `negative-and-exception-testing` | 695 words, 4 tables | Negative categories; worked cases; boundary values; integration exceptions | `visual-cards`: negative test categories<br>`visual-scenario`: boundary values for a rule<br>`visual-decision`: integration exception → expected handling | No | — | **P3** |
| 10 | `defect-management-and-reporting` | 579 words, 6 tables | Defect report fields; severity vs priority; defect lifecycle; triage; metrics; summary report | `visual-flow`: New → Triaged → Fixed → Retest → Closed<br>`visual-compare`: severity vs priority combinations<br>`visual-cards`: test metrics with formulas | No | NP-42 | **P1** |

★ = prototype lesson (wave 1).

### Notes on specific lessons

- **ASCII diagrams the audit missed.** `erp-fundamentals/erp-architecture-components` (layered box diagram), `implementation-methodology/phase-4-solution-configuration`, `phase-5-data-migration`, `phase-8-go-live`, `odoo-inventory/inventory-overview-and-process-flow` and `odoo-accounting/accounting-overview-and-process-flow` (R2R) all have diagram-style `text` code fences with ASCII count 0 or an undercount. They are rated P1 anyway because they are process-heavy.
- **Possible false positives in the audit.** The ASCII diagram counted in `odoo-technical-fundamentals/module-structure-and-manifest` is a folder tree, and the one in `views-and-view-inheritance` is an XML snippet comparing Odoo 16 and 17. Both are kept at P1 as the rule requires. They can move to P2 once their `visual-cards` and `visual-compare` blocks are in.
- **Slug note.** The technical course slug is `odoo-technical-fundamentals`, not `technical-fundamentals` (the file name). Use the slug in `/visuals/<course-slug>/` paths.


## Business processes (incremental visuals only)

The six process pages already render an interactive step flow, plus stakeholders, documents, KPIs and exceptions. The proposals below only add what the interactive flow does not show: Debit/Credit impact, exception handling, KPI cards and one department-swimlane overview per process.

| # | Process (slug) | Current content | Gap to visualize | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|---|
| 1 | `order-to-cash` | 9 steps lead → reconciliation; exceptions; KPIs; Anglo-Saxon entries (10,000 + 15% tax, cost 6,000) | Accounting impact markdown table; exceptions list | `visual-journal`: delivery, invoice, payment, bank entries<br>`visual-decision`: exceptions (credit limit, stock, short payment)<br>`visual-cards`: O2C KPIs with formulas | Screenshot later — Sales order with Delivery/Invoice smart buttons | NP-01 | **P1** |
| 2 | `procure-to-pay` | 7 steps requisition → payment; approvals; 3-way match; PO = no entry | Accounting impact markdown table; exceptions list | `visual-journal`: receipt, bill (5,000 + 750), payment<br>`visual-decision`: bill price/qty variance → action<br>`visual-cards`: P2P KPIs (PPV, DPO, first-pass match) | Screenshot later — Vendor bill with PO auto-complete | NP-02 | **P1** |
| 3 | `inventory-management` | 9 steps item → valuation; reservation; counts; AVCO movements | Accounting impact markdown table; exceptions list | `visual-journal`: opening stock, receipt, sale, adjustment<br>`visual-decision`: valuation report ≠ ledger<br>`visual-cards`: inventory KPIs (accuracy, turnover, DIO) | Screenshot later — Inventory ▸ Operations ▸ Physical Inventory | NP-03 | **P2** |
| 4 | `record-to-report` | 9 steps CoA → period closing; sub-ledger vs control; close | Accounting impact markdown table; exceptions list | `visual-journal`: typical R2R entries table<br>`visual-timeline`: month-end close sequence<br>`visual-decision`: sub-ledger ≠ control account | Screenshot later — Accounting ▸ Reporting ▸ Trial Balance | NP-04 | **P1** |
| 5 | `plan-to-produce` | 7 steps BoM → cost analysis; components 3,880 + work center 1,570 | Accounting impact markdown table; exceptions list | `visual-journal`: components consumed, finished goods in<br>`visual-decision`: component shortage at release<br>`visual-cards`: OEE, scrap rate, usage variance | Screenshot later — MO Cost Analysis report | NP-05 | **P2** |
| 6 | `project-to-profit` | 6 steps project → profitability; invoicing policies; analytic vs GL | Analytic vs financial impact | `visual-compare`: GL vs analytic impact per event<br>`visual-compare`: service invoicing policies<br>`visual-cards`: margin, utilisation, realisation KPIs | Screenshot later — Project ▸ Project Updates (profitability) | NP-06 | **P2** |

## Configuration scenarios (incremental visuals only)

The five scenario pages already have step checklists with `dependsOn` prerequisites, validation notes and common mistakes. The proposals add a dependency map (built from `dependsOn`) and mockups for the screens where most mistakes happen.

| # | Scenario (slug) | Current content | Proposed visuals | Odoo screen mockup needed? | Napkin | Priority |
|---|---|---|---|---|---|---|
| 1 | `trading-company` | 12 dependent steps company → reports; P2P + O2C cycles | `visual-flow`: step dependency map 1 → 12<br>`visual-mockup`: warehouse and product category setup<br>`visual-journal`: verification entries at step 11 | Yes — Inventory ▸ Reporting ▸ Valuation | — | **P2** |
| 2 | `manufacturing-company` | 10 steps components → reports; BoM + routing + MO | `visual-flow`: products → BoM → work centers → MO<br>`visual-mockup`: BoM Operations tab<br>`visual-scenario`: cost review after production | Yes — Manufacturing ▸ Products ▸ Bills of Materials | NP-28 (reuse) | **P2** |
| 3 | `professional-services` | 9 steps settings → KPIs; timesheet/milestone/expense invoicing | `visual-compare`: invoicing policies per service product<br>`visual-flow`: SO → project → timesheets → invoice<br>`visual-mockup`: task Timesheets tab | Yes — Project ▸ task ▸ Timesheets tab | NP-06 (reuse) | **P2** |
| 4 | `retail-business` | 8 steps POS shop → reports; sessions with cash control | `visual-flow`: open session → sell → close register<br>`visual-journal`: session closing entries<br>`visual-mockup`: POS Close Register dialog | Yes — Point of Sale ▸ dashboard ▸ Close Register | — | **P3** |
| 5 | `multi-company` | 8 steps companies → consolidation; shared vs company-specific data | `visual-hub`: holding with subsidiaries<br>`visual-compare`: shared vs company-specific master data<br>`visual-flow`: inter-company SO → mirrored PO | Screenshot later — Settings ▸ Users & Companies ▸ Companies | — | **P3** |

## Summary

### Proposed visuals by block type

| Block type | Lessons | Processes + scenarios | Total |
|---|---|---|---|
| `visual-compare` | 66 | 4 | 70 |
| `visual-flow` | 51 | 5 | 56 |
| `visual-decision` | 42 | 5 | 47 |
| `visual-cards` | 41 | 5 | 46 |
| `visual-steps` | 29 | 0 | 29 |
| `visual-mockup` | 23 | 4 | 27 |
| `visual-dodont` | 20 | 0 | 20 |
| `visual-journal` | 10 | 7 | 17 |
| `visual-check` | 13 | 0 | 13 |
| `visual-scenario` | 11 | 1 | 12 |
| `visual-hub` | 11 | 1 | 12 |
| `visual-timeline` | 10 | 1 | 11 |
| `visual-hero` | 1 | 0 | 1 |
| `visual-beforeafter` | 1 | 0 | 1 |
| **Total** | **329** | **33** | **362** |

`visual-takeaways` is not counted. It is generated from the existing `## Key takeaways` section in every lesson.

### Proposals by priority

| Priority | Lessons | Processes + scenarios |
|---|---|---|
| P1 | 51 | 3 |
| P2 | 44 | 6 |
| P3 | 10 | 2 |
| **Total** | **105** | **11** |

Lessons with a `visual-mockup` block: **23**. Lessons naming an Odoo screen (mockup now or screenshot later): **48**. Lessons with a recommended Napkin diagram (each becomes one `visual-figure`, not counted in the block table): **37**, plus 6 processes and 2 scenario reuses. Average proposals per lesson: **3.1**.

### Recommended rollout order

| Wave | Scope | Why |
|---|---|---|
| 1 | Prototypes: `erp-fundamentals/what-is-erp`, `odoo-sales/master-data-and-transactions`, `odoo-sales/troubleshooting-practice-interview` | Covers hero/hub/timeline (concept lesson), steps/mockup/compare (transaction lesson) and decision/dodont/check (troubleshooting lesson). These three set the patterns every later wave reuses. |
| 2 | P1 — foundations (ERP Fundamentals, Implementation Methodology) | Beginner path first. These lessons have the most ASCII diagrams to convert. |
| 3 | P1 — core Odoo apps (CRM, Sales, Purchase, Inventory) | Overview process flows and the troubleshooting lessons follow the wave-1 template. |
| 4 | P1 — Accounting (incl. India GST/e-invoicing), Manufacturing, eCommerce & E-Invoicing | Journal, decision and flow blocks with the most numeric content. Napkin diagrams NP-21…NP-33. |
| 5 | P1 — Technical Fundamentals, Integration Fundamentals, Testing & QA | Flow and decision blocks for request, webhook, retry and defect lifecycles. |
| 6 | Business processes + configuration scenarios (incremental) | Journal/decision additions and Napkin swimlanes NP-01…NP-06. |
| 7 | All P2 lessons (44) | In course order. |
| 8 | All P3 lessons (10) | Only as capacity allows. |

**P1 lessons by course (waves 2–5, after the wave-1 prototypes)**

- **ERP Fundamentals**: `problems-with-disconnected-applications`, `erp-architecture-components`, `saas-hosting-environments-access`, `standard-vs-customization`, `consultant-types`, `costs-benefits-risks-success-factors`
- **ERP Implementation Methodology**: `implementation-approaches`, `phase-3-to-be-process-design`, `phase-5-data-migration`, `phase-6-development-integration`, `phase-8-go-live`, `phase-9-post-go-live-support`
- **Odoo CRM: Leads, Pipeline & Forecasting**: `overview-and-business-problems`, `troubleshooting-practice-interview`
- **Odoo Sales: Quotation to Invoice**: `overview-and-business-problems`
- **Odoo Purchase: RFQ to Vendor Bill**: `overview-and-business-problems`, `troubleshooting-practice-interview`
- **Odoo Inventory: Warehouses, Routes, Stock Operations and Valuation**: `inventory-overview-and-process-flow`, `inventory-transactions`, `inventory-automation-reports-valuation`, `inventory-troubleshooting-and-interview`
- **Odoo Accounting: Invoicing, Payments, Bank Reconciliation, Reporting & Indian GST E-Invoicing**: `accounting-overview-and-process-flow`, `accounting-master-data-and-opening-balances`, `accounting-transactions`, `accounting-troubleshooting-and-interview`, `india-gst-fundamentals`, `india-gst-configuration-odoo`, `india-e-invoicing-irn`, `india-eway-bill-returns-tds`
- **Odoo Manufacturing: Bills of Materials, Work Centers, Manufacturing Orders and Costing**: `manufacturing-overview-and-process-flow`, `manufacturing-master-data`, `manufacturing-transactions`, `manufacturing-automation-reports-costing`, `manufacturing-troubleshooting-and-interview`
- **Odoo eCommerce & E-Invoicing for Online Retail**: `ecommerce-overview-and-process-flow`, `einvoicing-concepts-formats-networks`, `einvoicing-and-automation-in-odoo`, `ecommerce-troubleshooting-and-interview`
- **Odoo Technical Fundamentals**: `module-structure-and-manifest`, `views-and-view-inheritance`
- **Integration Fundamentals**: `rest-and-http-fundamentals`, `webhooks`, `odoo-xml-rpc`, `middleware-and-scheduled-sync`, `error-handling-retries-idempotency`
- **Testing & Quality Assurance for ERP Projects**: `erp-testing-fundamentals`, `user-acceptance-testing`, `defect-management-and-reporting`

Definition of done per lesson: the blocks render without authoring errors, existing tables stay as accessible text fallbacks where a block summarises them, every `visual-mockup` keeps its "illustrative" label, every `visual-figure` is registered and `npm run visuals:check` passes.
