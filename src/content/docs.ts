import type { DocContent } from "./types";

/**
 * Documentation library: glossary, ready-to-copy templates, checklists and
 * reference notes. All companies, people and figures are fictional.
 */
export const docLibrary: DocContent[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "erp-odoo-glossary",
    title: "ERP & Odoo Glossary",
    category: "Glossary",
    summary: "Plain-language definitions of 60+ ERP, accounting, supply chain, project and Odoo terms with examples.",
    body: `## How to use this glossary

Terms are grouped loosely by area. Odoo-specific names are as they appear in Odoo 17.0; labels can change between versions (verify for your version).

| Term | Meaning | Example |
|---|---|---|
| ERP | Enterprise Resource Planning: one integrated system for finance, sales, purchasing, inventory, manufacturing, HR | A company replaces separate accounting and stock spreadsheets with Odoo |
| Module / App | A functional package in Odoo that can be installed | Sales, Inventory, Accounting |
| Community Edition | Open-source edition of Odoo (LGPL) | Self-hosted Odoo with Sales and Inventory |
| Enterprise Edition | Licensed edition with additional apps and features | Studio, full Accounting, Helpdesk |
| Odoo.sh | Odoo's cloud platform for hosting Enterprise with custom code and staging branches | Production + staging branch for UAT |
| Database | One Odoo instance's data store; can contain several companies | crestline-prod |
| Company | A legal entity configured in Odoo | Crestline Furniture Ltd |
| Multi-company | Several companies in one database with access controlled per user | UK and India subsidiaries |
| Master data | Relatively static reference data used by transactions | Customers, products, chart of accounts |
| Transaction data | Day-to-day business documents | Sales orders, invoices, receipts |
| Partner (res.partner) | Odoo's single model for customers, vendors, contacts and addresses | "Blue Harbor Traders" with a delivery address child contact |
| Product template / variant | Template holds common data; variants are combinations of attributes | T-shirt template, variant "Red / M" |
| Product type | Storable (tracked stock), consumable, service — labels vary by version | Laptop = storable; installation = service |
| Product category | Grouping that drives accounting and valuation settings | "Finished Goods" with automated valuation |
| UoM | Unit of Measure; conversions within a category | Buy in Box of 12, sell in Units |
| Pricelist | Rules that determine sales prices per customer/quantity/date | Wholesale pricelist 15% below public |
| Tax | Tax definition with rate, computation and accounts | 15% sales tax, price exclusive |
| Fiscal position | Rules that map taxes/accounts for certain partners | Export customers: 15% tax → 0% |
| Payment terms | Rules that compute due dates and instalments | 30% advance, 70% in 30 days |
| Chart of accounts | List of GL accounts | 1100 Receivables, 4000 Sales |
| Journal | Book in which entries are recorded | Sales journal, Bank journal |
| Journal entry | Balanced accounting record with debit/credit lines | Invoice entry: Dr AR, Cr Sales, Cr Tax |
| General Ledger (GL) | All accounts with their postings | GL report for account 1100 |
| Subledger | Detail-level ledger supporting a GL control account | Aged receivable per customer |
| Control account | GL account whose balance is explained by a subledger | Receivable account |
| Trial balance | List of all account balances at a date | Used to agree opening balances |
| Accounts Receivable (AR) | Money owed by customers | Unpaid customer invoices |
| Accounts Payable (AP) | Money owed to vendors | Unpaid vendor bills |
| Credit note | Document reversing (part of) an invoice | Refund for returned goods |
| Reconciliation | Matching related entries so they offset, or agreeing two balances | Matching payment to invoice; bank statement to bank account |
| Bank statement line | Transaction imported/entered from the bank | Customer transfer of 1,150.00 |
| Lock date | Date before which entries cannot be posted/modified | Period closed to 31 March |
| Fiscal year | Accounting year | 1 April to 31 March |
| Analytic account | Dimension to track costs/revenues by project, department etc. | Project "Store Fit-out 12" |
| Inventory valuation | Value of stock on hand | 70 units × 20.00 = 1,400.00 |
| Automated (perpetual) valuation | Stock moves post journal entries in real time | Delivery posts Dr COGS / Cr Stock |
| Manual (periodic) valuation | Stock value not posted automatically; accounted periodically | Month-end stock adjustment entry |
| Costing method | Standard, Average (AVCO) or FIFO | FIFO for perishable goods |
| COGS | Cost of Goods Sold | Cost of the 10 units delivered |
| Landed costs | Additional costs (freight, duties) added to stock value | Freight 300.00 spread over a receipt (edition-dependent; verify) |
| Warehouse | Physical site with locations and routes | WH Main |
| Location | Place within (or outside) a warehouse where stock sits | WH/Stock/Shelf A |
| Route | Set of rules that define how products move | Buy, Manufacture, MTO |
| Reordering rule | Min/max rule that triggers replenishment | Min 50, Max 200 |
| MTO | Make (or Buy) to Order: replenish specifically for a demand | Custom table built after SO |
| MTS | Make to Stock: replenish to stock levels independent of orders | Standard bulbs kept in stock |
| Transfer (stock.picking) | Receipt, delivery or internal move document | WH/OUT/00045 |
| Backorder | Remaining quantity of a partially processed transfer | 40 units still to receive |
| Lot / Serial number | Traceability identifiers for batches or single units | Lot L-2024-05; serial SN-0001 |
| Inventory adjustment | Correction of counted on-hand quantity | Cycle count finds 2 fewer units |
| Dropship | Vendor ships directly to customer | Supplier delivers large appliances |
| BoM | Bill of Materials: components and quantities to produce an item | Table = 1 top + 4 legs + 16 screws |
| MO | Manufacturing Order | MO/00012 for 5 tables |
| Work center | Resource (machine/team) where operations happen | Assembly Line 1 |
| RFQ | Request for Quotation (draft purchase order) | RFQ sent to 2 vendors |
| PO | Purchase Order | P00031 confirmed |
| Vendor bill | Supplier invoice recorded in Accounting | BILL/2024/05/0007 |
| Three-way match | Comparing PO, receipt and bill before payment | Bill qty 60 = received 60 |
| Quotation / SO | Sales offer; once confirmed becomes a Sales Order | S00045 |
| Invoicing policy | Invoice on ordered or delivered quantities | Delivered for goods, ordered for subscriptions |
| O2C | Order to Cash process | Quote → order → deliver → invoice → collect |
| P2P | Procure to Pay process | Requisition → PO → receipt → bill → pay |
| R2R | Record to Report: accounting close and reporting | Month-end close |
| Model | Odoo data structure (database table) | sale.order, product.template |
| Field | Attribute of a model | partner_id on sale.order |
| View | UI definition of a model (form, list, kanban...) | Sales order form view |
| Developer mode | Mode that shows technical menus and field names | Settings ▸ Activate developer mode |
| External ID (XML ID) | Stable text identifier for a record used in imports/modules | product_led_panel_40w |
| Access rights | Group-level CRUD permissions on models | Sales User: Own Documents Only |
| Record rule | Domain-based filter limiting which records a group sees | Salesperson sees own orders |
| Studio | Enterprise no-code customization tool | Add a field to sales order form |
| Custom module | Python/XML addon developed for specific needs | crestline_sale_extension |
| OCA | Odoo Community Association: community-maintained addons | OCA modules for reporting |
| Scheduled action (cron) | Job that runs periodically | Nightly stock sync |
| Automated action | Rule triggering actions on record events | Email when SO above 10,000.00 |
| API (XML-RPC/JSON-RPC) | Interfaces external systems use to read/write Odoo data | E-commerce platform creates orders |
| Fit-gap analysis | Comparing requirements to standard features | 80% fit, 20% gap |
| RTM | Requirement Traceability Matrix | REQ-SAL-004 → TC-O2C-001 |
| SIT | System Integration Testing | End-to-end tests across apps |
| UAT | User Acceptance Testing | Key users sign off processes |
| Cutover | Transition activities from legacy to new system | Freeze, final loads, go-live |
| Go-live | Date the new system becomes the system of record | 1 July |
| Hypercare | Intensive support period right after go-live | 4 weeks of daily stand-ups |
| Key user | Business user who represents a department in the project | Senior accountant |
| Change request | Request to change agreed scope | Add new report after sign-off |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "business-discovery-questionnaire",
    title: "Business Discovery Questionnaire",
    category: "Template",
    summary: "Department-by-department discovery questions to run requirements workshops, with columns for answers and follow-ups.",
    body: `## How to use

Send the general section in advance, then run one workshop per department. Record answers in the Answer column, and capture volumes and pain points — they drive design and testing. Mark each answer with a Requirement ID once it becomes a requirement.

## 1. Company overview

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| G1 | Legal entities, countries and currencies? | | |
| G2 | Number of users per department? | | |
| G3 | Current systems (ERP, spreadsheets, e-commerce, payroll)? | | |
| G4 | Fiscal year, reporting deadlines, auditors? | | |
| G5 | Main pain points with current systems? | | |
| G6 | Target go-live date and critical business events (peak season, year end)? | | |

## 2. Sales & CRM

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| S1 | How do leads arrive and who qualifies them? | | |
| S2 | Customer types (B2B, B2C, distributors)? Pricing rules per type? | | |
| S3 | Discounts: who can give how much? Approval thresholds? | | |
| S4 | Quotation format, validity, terms and conditions? | | |
| S5 | Credit limits and credit checks? | | |
| S6 | Invoicing on order, on delivery, milestones or subscriptions? | | |
| S7 | Monthly volume of quotations / orders / order lines? | | |
| S8 | Commission rules? | | |

## 3. Purchasing

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| P1 | Who can request purchases? Approval levels by amount? | | |
| P2 | Vendor selection: tenders, price lists, preferred vendors? | | |
| P3 | Lead times and minimum order quantities? | | |
| P4 | Do bills need three-way match (PO, receipt, bill)? | | |
| P5 | Imports: freight, duties, landed costs? | | |
| P6 | Volumes of POs and bills per month? | | |

## 4. Inventory & Warehouse

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| W1 | Number of warehouses and locations/bins? | | |
| W2 | Receiving and shipping steps (1, 2 or 3 step)? | | |
| W3 | Lot/serial tracking, expiry dates? | | |
| W4 | Units of measure (buy vs sell units)? | | |
| W5 | Replenishment method: reorder points, MTO, manual? | | |
| W6 | Stock counting: annual or cycle counts? | | |
| W7 | Barcode scanners used? Labels? | | |
| W8 | Carriers and shipping integrations? | | |

## 5. Manufacturing (if applicable)

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| M1 | Make to stock or make to order? | | |
| M2 | BoM levels, variants, by-products, scrap? | | |
| M3 | Routings/work centers and capacity planning? | | |
| M4 | Subcontracting? | | |
| M5 | Quality checks during production? | | |

## 6. Finance & Accounting

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| F1 | Chart of accounts: keep current or localize? | | |
| F2 | Tax regimes, tax reports, e-invoicing obligations? | | |
| F3 | Banks, statement import/sync, payment methods? | | |
| F4 | Inventory valuation method (FIFO, AVCO, standard) and perpetual vs periodic? | | |
| F5 | Analytic/cost centre reporting? | | |
| F6 | Month-end close steps and deadlines? | | |
| F7 | Multi-currency and revaluation? | | |
| F8 | Opening balances strategy at go-live? | | |

## 7. HR & Payroll (if in scope)

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| H1 | Employee count, departments, contracts? | | |
| H2 | Leave policies and approvals? | | |
| H3 | Expenses process? | | |
| H4 | Payroll: in Odoo (localization availability; verify) or external? | | |

## 8. Reporting, integrations & IT

| # | Question | Answer | Req. ID / Follow-up |
|---|---|---|---|
| R1 | Top 10 reports management uses today? | | |
| R2 | External systems that must exchange data with the ERP? | | |
| R3 | Hosting preference: Odoo Online, Odoo.sh, on-premise? | | |
| R4 | Security/audit requirements (segregation of duties, logs)? | | |
| R5 | Data to migrate and how many years of history? | | |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "requirement-traceability-matrix",
    title: "Requirement Traceability Matrix (RTM)",
    category: "Template",
    summary: "Track every requirement from workshop to design, build, test case and sign-off.",
    body: `## Purpose

The RTM ensures every requirement is designed, built, tested and accepted — and that nothing is built without a requirement. Update it throughout the project; it is a key audit artefact at go-live.

## Template

| Req. ID | Process / Area | Requirement description | Source (workshop/date) | Priority (Must/Should/Could) | Fit-Gap result | Solution type (Standard/Config/Custom/Integration/Report) | Design doc ref | Build ref (task/PR) | Test case IDs | UAT script ID | Status | Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-SAL-001 | O2C | Wholesale customers get wholesale pricelist | Sales WS 2024-02-05 | Must | Fit | Config | CWB-SAL-03 | — | TC-O2C-001 | UAT-SAL-01 | Tested | Sales lead |
| REQ-SAL-002 | O2C | Orders above 10,000.00 need manager approval | Sales WS 2024-02-05 | Must | Partial | Config / Custom (verify standard options) | FS-007 | DEV-112 | TC-O2C-010, NEG-01 | UAT-SAL-04 | In build | Consultant |
| REQ-PUR-001 | P2P | Bills based on received quantities | Purchase WS 2024-02-07 | Must | Fit | Config | CWB-PUR-02 | — | TC-P2P-001 | UAT-PUR-01 | Accepted | AP lead |
| REQ-INV-004 | Inventory | Lot tracking with expiry for chemicals | Warehouse WS 2024-02-08 | Must | Fit | Config | CWB-INV-05 | — | TC-INV-004 | UAT-INV-02 | Designed | WH lead |
| REQ-INT-001 | Integration | Website orders flow into Odoo hourly | IT WS 2024-02-10 | Should | Gap | Integration | IDD-001 | DEV-120 | TC-INT-001..005 | UAT-INT-01 | Open | Tech lead |

## Status values

| Status | Meaning |
|---|---|
| Open | Captured, not yet analysed |
| Designed | Solution documented |
| In build | Configuration/development in progress |
| Tested | Passed SIT |
| Accepted | Passed UAT, signed off |
| Deferred | Moved to later phase (with approval) |
| Rejected | Not in scope (with reason) |

## Coverage checks

- Every Must requirement has at least one test case.
- Every test case references a requirement.
- No requirement is Accepted without a UAT script result.
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "fit-gap-analysis-template",
    title: "Fit-Gap Analysis",
    category: "Template",
    summary: "Classify each requirement as fit, partial fit or gap, and decide the solution option and effort.",
    body: `## Purpose

A fit-gap analysis compares business requirements with standard Odoo capabilities to decide **how** each requirement will be met: standard, configuration, workaround, customization, third-party module or integration. Demonstrate the standard first; only document a gap when standard really cannot meet the business need.

## Template

| Req. ID | Requirement | Standard Odoo capability (app/feature) | Edition needed | Fit level (Fit / Partial / Gap) | Gap description | Options considered | Recommended solution | Effort (days) | Risk | Decision / Approved by |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-SAL-001 | Customer-specific pricing | Sales pricelists | Community & Enterprise | Fit | — | — | Configure pricelists | 0.5 | Low | Approved — Sales head |
| REQ-SAL-002 | Approval for orders above 10,000.00 | Approval options vary by version (verify) | Verify | Partial | Threshold approval not matching exactly | 1) Studio approval rule (Enterprise) 2) Custom module 3) Process workaround | Option per edition | 3 | Medium | Pending |
| REQ-INV-007 | Print GS1 labels | Barcode / label printing (verify) | Verify | Partial | Label format differs | Custom QWeb report | Custom report | 2 | Low | Approved |
| REQ-INT-001 | Hourly website order import from external shop | No native connector for this platform | — | Gap | Integration needed | Third-party connector, custom API integration | Custom integration via API | 10 | High | Approved — CFO |

## Fit levels

| Level | Definition |
|---|---|
| Fit | Met by standard features or configuration |
| Partial | Mostly met; minor workaround, report or small customization |
| Gap | Not supported; requires development, third-party module or process change |

## Summary block

| Metric | Value |
|---|---|
| Total requirements | |
| Fit (%) | |
| Partial (%) | |
| Gap (%) | |
| Total estimated gap effort (days) | |
| Requirements resolved by process change | |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "configuration-workbook",
    title: "Configuration Workbook",
    category: "Template",
    summary: "Record every configuration decision and setting per app so the system can be rebuilt, audited and tested.",
    body: `## Purpose

The configuration workbook is the single record of **what was configured, where, why and by whom**. It is used to rebuild databases, review design with the client, and write test cases. Keep one tab/section per app.

## Header

| Field | Value |
|---|---|
| Project | |
| Odoo version / edition | |
| Database | |
| Workbook version / date | |
| Prepared by / reviewed by | |

## Configuration log

| CWB ID | App | Menu path | Setting / record | Value | Business reason | Req. ID | Configured by / date | Verified in test case |
|---|---|---|---|---|---|---|---|---|
| CWB-GEN-01 | Settings | Settings ▸ Companies | Company name, address, currency | Crestline Furniture Ltd, USD | Legal entity | REQ-GEN-001 | A. Rao 2024-03-01 | TC-GEN-001 |
| CWB-SAL-03 | Sales | Sales ▸ Configuration ▸ Settings | Pricelists | Enabled (advanced rules) | Customer-specific pricing | REQ-SAL-001 | A. Rao 2024-03-02 | TC-O2C-001 |
| CWB-INV-02 | Inventory | Inventory ▸ Configuration ▸ Warehouses | WH Main outgoing shipments | 2 steps (Pick + Ship) | Packing area control | REQ-INV-002 | A. Rao 2024-03-03 | TC-INV-002 |
| CWB-ACC-04 | Accounting | Accounting ▸ Configuration ▸ Taxes | Sales tax 15% | Percentage, price excluded | Local tax law | REQ-ACC-003 | M. Iyer 2024-03-04 | TC-O2C-001 |
| CWB-PUR-02 | Purchase | Purchase ▸ Configuration ▸ Settings | Bill control | On received quantities | Three-way match | REQ-PUR-001 | A. Rao 2024-03-05 | TC-P2P-001 |

## Suggested sections

| Section | Typical content |
|---|---|
| General | Companies, users, languages, currencies, email servers |
| Accounting | Chart of accounts, taxes, fiscal positions, journals, payment terms, lock dates |
| Sales | Settings, pricelists, quotation templates, teams |
| Purchase | Settings, approval, vendor pricelists |
| Inventory | Warehouses, locations, routes, operation types, product categories, valuation |
| Manufacturing | Work centers, BoMs, operations settings |
| Security | Groups per user, record rules, multi-company access |
| Automation | Scheduled actions, automated actions, email templates |

Note settings that depend on edition and record the menu path as it appears in your version.
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "data-mapping-specification",
    title: "Data Mapping Specification",
    category: "Template",
    summary: "Map legacy fields to Odoo models and fields with transformation rules, mandatory flags and validation checks.",
    body: `## Purpose

The data mapping specification defines exactly how each legacy field becomes an Odoo field. It is approved by the data owner before trial loads and drives the import templates and migration tests.

## Header

| Field | Value |
|---|---|
| Object | Customers |
| Legacy source | LegacyERP table CUSTMAST (export CSV) |
| Odoo model | res.partner |
| Record count (legacy / expected in Odoo) | 1,310 / 1,248 |
| Selection criteria | Active, or with transactions in last 3 years |
| Data owner | AR lead |

## Mapping table

| Legacy field | Odoo model | Odoo field | Transformation | Mandatory | Notes |
|---|---|---|---|---|---|
| CUST_CODE | res.partner | id (External ID) | Prefix "cust_" + code, e.g. cust_C1001 | Yes | Enables re-import as update |
| CUST_CODE | res.partner | ref | Copy as is | No | Visible customer reference |
| CUST_NAME | res.partner | name | Trim spaces, proper case | Yes | |
| — | res.partner | is_company | Constant TRUE | Yes | Contacts loaded separately |
| ADDR1 / ADDR2 | res.partner | street / street2 | Trim | No | |
| CITY | res.partner | city | Trim | No | |
| COUNTRY | res.partner | country_id | Map legacy codes to ISO (e.g. "UK" → "GB"), import by code or name | Yes | Lookup table in appendix |
| VAT_NO | res.partner | vat | Remove spaces | No | VAT validation may apply (verify) |
| EMAIL | res.partner | email | Lowercase, validate format | No | |
| PAY_TERMS | res.partner | property_payment_term_id | Map "N30" → "30 Days" | No | Terms must exist before import |
| PRICE_GRP | res.partner | property_product_pricelist | Map "W" → "Wholesale" | No | Pricelist must exist |
| CR_LIMIT | res.partner | credit_limit | Numeric, 2 decimals | No | Field shown when credit limit feature enabled (verify) |
| SALES_REP | res.partner | user_id | Map rep code to Odoo user login | No | Users created first |
| STATUS | — | — | Filter: exclude inactive | — | Not migrated |

## Value mapping appendix

| Legacy value | Odoo value |
|---|---|
| N30 | 30 Days |
| COD | Immediate Payment |
| W | Wholesale |
| R | Public Pricelist |

## Validation rules

| Check | Method |
|---|---|
| Record count | Legacy filtered count = Odoo count |
| Mandatory fields | No blanks in mandatory columns before import |
| Duplicates | Unique on name + VAT; review fuzzy duplicates |
| Sample check | 25 random + 10 edge cases field by field |
| Sign-off | Data owner signs after trial load 2 |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "functional-specification-template",
    title: "Functional Specification (FS)",
    category: "Template",
    summary: "Describe a gap solution in business terms: process, rules, screens, reports, data and acceptance criteria.",
    body: `## Purpose

A functional specification explains **what** a customization, report or integration must do, in business language, so the client can approve it and the developer can estimate it. It does not prescribe code.

## Document control

| Field | Value |
|---|---|
| FS ID | FS-007 |
| Title | Sales order approval above threshold |
| Related requirements | REQ-SAL-002 |
| Author / reviewer | |
| Version / date | |
| Status | Draft / In review / Approved |

## 1. Business background

Why is this needed? Current process and pain point. Example: *Sales managers must approve orders above 10,000.00 to control discounts and credit exposure.*

## 2. Scope

| In scope | Out of scope |
|---|---|
| Sales orders created in backend | Website orders |
| Single-level approval | Multi-level approval chains |

## 3. Process flow (to-be)

1. Salesperson creates quotation.
2. On confirm, if untaxed total is greater than 10,000.00, status becomes "To Approve".
3. Sales manager receives an activity and approves or rejects with reason.
4. Approved order can be confirmed; rejected order returns to draft.

## 4. Business rules

| Rule ID | Rule |
|---|---|
| BR-01 | Threshold is configurable per company |
| BR-02 | Threshold compares untaxed amount in company currency |
| BR-03 | Approval is reset if the order lines change after approval |

## 5. Screen / field changes

| Screen | Change | Field label | Type | Visibility |
|---|---|---|---|---|
| Sales order form | New status in status bar | To Approve | Selection value | All sales users |
| Sales order form | New buttons | Approve / Reject | Button | Sales managers only |
| Sales settings | New setting | Approval threshold | Monetary | Administrators |

## 6. Reports / notifications

Activity to managers; email template "Order awaiting approval".

## 7. Security

| Role | Can approve | Can change threshold |
|---|---|---|
| Salesperson | No | No |
| Sales Manager | Yes | No |
| Administrator | Yes | Yes |

## 8. Data / migration impact

Existing open quotations: no approval required retroactively.

## 9. Assumptions and dependencies

## 10. Acceptance criteria / test scenarios

| # | Scenario | Expected |
|---|---|---|
| AC-1 | Order 9,999.99 | Confirms without approval |
| AC-2 | Order 10,000.01 | Status To Approve |
| AC-3 | Manager approves | Order can be confirmed |
| AC-4 | Line changed after approval | Approval reset |

## 11. Approval

| Name | Role | Signature | Date |
|---|---|---|---|
| | Process owner | | |
| | Project manager | | |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "technical-specification-template",
    title: "Technical Specification (TS)",
    category: "Template",
    summary: "Translate an approved functional spec into the technical design: models, fields, views, security, logic and tests.",
    body: `## Purpose

The technical specification describes **how** the functional requirement will be built in Odoo: modules, models, fields, views, security, business logic, performance and tests. It is written by the developer/technical consultant and reviewed before development.

## Document control

| Field | Value |
|---|---|
| TS ID | TS-007 |
| Related FS | FS-007 |
| Odoo version | 17.0 |
| Module name | crestline_sale_approval |
| Depends on | sale_management |
| Author / reviewer | |
| Version / status | |

## 1. Solution overview

Short summary of the approach and why it was chosen (e.g. inherit sale.order rather than Studio because logic is needed).

## 2. Data model changes

| Model | Field (technical) | Type | Label | Required | Default | Notes |
|---|---|---|---|---|---|---|
| sale.order | approval_state | Selection | Approval Status | No | not_required | values: not_required, to_approve, approved, rejected |
| sale.order | approved_by_id | Many2one res.users | Approved By | No | — | readonly |
| res.company | so_approval_threshold | Monetary | Approval Threshold | No | 10000.00 | per company |
| res.config.settings | so_approval_threshold | Monetary (related) | Approval Threshold | No | — | related to company field |

## 3. Business logic

| Method | Trigger | Logic |
|---|---|---|
| action_confirm (override) | Confirm button | If amount_untaxed (company currency) > threshold and not approved → set to_approve, schedule activity, stop confirmation |
| action_approve | Approve button | Check user in manager group; set approved, log message |
| write (override) | Order line change | If approved and lines changed → reset to to_approve |

## 4. Views

| View | Inheritance | Change |
|---|---|---|
| sale.view_order_form | Inherit | Add Approve/Reject buttons with groups attribute, approval fields |
| Settings view | Inherit | Threshold field in Sales section |

## 5. Security

| Item | Definition |
|---|---|
| Groups | Use existing Sales Administrator group, or new "Order Approver" group |
| Access rights (ir.model.access.csv) | No new models — none required |
| Record rules | None |

## 6. Data files

Email template, activity type, default settings (XML data with external IDs).

## 7. Performance and scalability

Expected volume, indexes required, avoid computed fields stored on large tables without need.

## 8. Error handling and logging

User-facing error messages; chatter log of approvals.

## 9. Upgrade considerations

Avoid overriding full views; use XPath on stable elements; list core methods overridden.

## 10. Automated tests

| Test | Type | Description |
|---|---|---|
| test_below_threshold | TransactionCase | Order below threshold confirms |
| test_above_threshold | TransactionCase | Order above threshold moves to to_approve |
| test_reset_on_change | TransactionCase | Line change resets approval |

## 11. Deployment

Branch, module install/upgrade steps, configuration after install, rollback plan.
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "test-case-template",
    title: "Test Case Template",
    category: "Template",
    summary: "Standard 12-field test case template with an Odoo O2C example ready to copy.",
    body: `## Template

| Test Case ID | Requirement ID | Module | Scenario | Preconditions | Test Data | Steps | Expected Result | Actual Result | Status | Defect ID | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | Not Run | | |

## Example

| Test Case ID | Requirement ID | Module | Scenario | Preconditions | Test Data | Steps | Expected Result | Actual Result | Status | Defect ID | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-O2C-001 | REQ-SAL-001 | Sales, Inventory, Accounting | Sell stocked item to wholesale customer | Customer on Wholesale pricelist; product with 15% tax; 50 units on hand | Blue Harbor Traders; LED Panel 40W; qty 10 | 1. Create quotation 2. Confirm 3. Validate delivery 4. Create and post invoice 5. Register payment | Price 100.00; total 1,150.00; on-hand 50 → 40; Dr AR 1,150.00 / Cr Sales 1,000.00 / Cr Tax 150.00; invoice paid | S00045, WH/OUT/00031, INV/2024/00012 as expected | Pass | — | Tested by R. Mehta, 2024-05-10 |

## Field guidance

| Field | Guidance |
|---|---|
| Test Case ID | Prefix by process: TC-O2C-, TC-P2P-, TC-INV-, TC-ACC-, NEG-, SEC- |
| Requirement ID | From the RTM |
| Module | Every app touched |
| Scenario | One line, business language |
| Preconditions | Master data, settings, stock, user role |
| Test Data | Exact records and values |
| Steps | Numbered, one action per step |
| Expected Result | Measurable: states, quantities, amounts, accounts |
| Actual Result | What happened plus document numbers |
| Status | Not Run / Pass / Fail / Blocked |
| Defect ID | If Fail |
| Remarks | Tester, date, evidence file names, environment |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "uat-sign-off-form",
    title: "UAT Sign-off Form",
    category: "Template",
    summary: "Formal acceptance form per process area recording execution results, open defects and conditions.",
    body: `## UAT sign-off

| Field | Value |
|---|---|
| Project | |
| Client / company | |
| Odoo version / database | |
| UAT cycle | |
| Process area | e.g. Order to Cash |
| Test period | |

## Execution summary

| Metric | Count |
|---|---|
| UAT scripts planned | |
| Executed | |
| Passed | |
| Failed | |
| Blocked | |

## Open defects at sign-off

| Defect ID | Title | Severity | Priority | Agreed action | Target date |
|---|---|---|---|---|---|
| | | | | | |

## Reconciliations confirmed (if applicable)

| Reconciliation | Result | Confirmed by |
|---|---|---|
| Opening AR vs legacy | | |
| Opening AP vs legacy | | |
| Stock quantity and value vs legacy | | |
| Trial balance vs legacy | | |

## Conditions of acceptance

List conditions (e.g. "DEF-044 fixed within 2 weeks of go-live").

## Decision

- [ ] Accepted
- [ ] Accepted with conditions
- [ ] Rejected — reasons:

## Signatures

| Name | Role | Signature | Date |
|---|---|---|---|
| | Process owner | | |
| | Key user | | |
| | Client project manager | | |
| | Implementation project manager | | |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "cutover-plan-template",
    title: "Cutover Plan",
    category: "Template",
    summary: "Hour-by-hour plan for moving from the legacy system to Odoo, with owners, dependencies and rollback points.",
    body: `## Purpose

The cutover plan lists every activity between freezing the legacy system and going live in Odoo, with timing, owner, dependency and verification. Rehearse it at least once (dress rehearsal) and record actual durations.

## Key dates

| Milestone | Date / time |
|---|---|
| Legacy master data freeze | |
| Legacy transaction cut-off | |
| Final stock count | |
| Production data load start | |
| Go / No-Go meeting | |
| Go-live (users start in Odoo) | |

## Cutover activity plan

| # | Activity | Owner | Start | Duration | Depends on | Verification | Status |
|---|---|---|---|---|---|---|---|
| 1 | Communicate freeze to all users | PM | D-5 09:00 | 1h | — | Email sent | |
| 2 | Freeze master data changes in legacy | IT | D-3 18:00 | — | 1 | Access removed | |
| 3 | Production database prepared, configuration applied from workbook | Consultant | D-3 | 4h | — | Config checklist | |
| 4 | Load UoM, categories, taxes, payment terms | Consultant | D-2 09:00 | 1h | 3 | Counts | |
| 5 | Load partners, products, pricelists, BoMs | Consultant | D-2 10:00 | 3h | 4 | Counts + samples | |
| 6 | Legacy transactions cut-off; last invoices posted | Finance | D-1 17:00 | — | — | Legacy reports printed | |
| 7 | Physical stock count | Warehouse | D-1 18:00 | 6h | 6 | Count sheets signed | |
| 8 | Load opening stock | Consultant | D0 06:00 | 2h | 5, 7 | Qty & value reconciled | |
| 9 | Load open AR/AP invoices and bills | Consultant | D0 08:00 | 2h | 5, 6 | Totals = legacy aging | |
| 10 | Post opening trial balance | Finance | D0 10:00 | 1h | 8, 9 | Suspense account = 0 | |
| 11 | Load open SOs / POs | Consultant | D0 11:00 | 2h | 5 | Counts | |
| 12 | Users and access rights activated | Consultant | D0 13:00 | 1h | — | Login tests | |
| 13 | Smoke tests in production | Key users | D0 14:00 | 2h | 8–12 | Checklist | |
| 14 | Go / No-Go decision | Steering | D0 17:00 | 30m | 13 | Signed decision | |
| 15 | Integrations switched on | Tech lead | D0 18:00 | 1h | 14 | First messages processed | |

## Rollback plan

| Trigger | Rollback action | Decision owner |
|---|---|---|
| Opening balances do not reconcile by D0 16:00 | Continue in legacy one more day; reload | Finance controller |
| Critical defect found in smoke tests | Delay go-live; legacy remains system of record | Steering committee |

## Communication plan

| Audience | Message | Channel | When |
|---|---|---|---|
| All users | Freeze and go-live dates | Email | D-10 |
| Customers/vendors | Possible delays, new document formats | Letter/email | D-7 |
| Key users | Hypercare contacts | Meeting | D0 |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "go-live-checklist",
    title: "Go-Live Checklist",
    category: "Checklist",
    summary: "Readiness checklist across configuration, data, users, testing, integrations, support and communications.",
    body: `## How to use

Review in the Go / No-Go meeting. Every item needs an owner and status. Any "No" in a critical item (marked C) requires an explicit decision.

## Testing & acceptance

| # | Item | Critical | Owner | Status |
|---|---|---|---|---|
| T1 | SIT exit criteria met | C | Test lead | |
| T2 | UAT signed off for all process areas | C | Process owners | |
| T3 | No open Critical/High defects (or approved exceptions) | C | PM | |
| T4 | Regression pack passed on final build | | Consultant | |

## Configuration & system

| # | Item | Critical | Owner | Status |
|---|---|---|---|---|
| S1 | Production configured per configuration workbook | C | Consultant | |
| S2 | Custom modules installed at approved versions | C | Tech lead | |
| S3 | Document sequences and numbering set (invoice, SO, PO) | | Consultant | |
| S4 | Report layouts (invoice, delivery slip, PO) approved | | Consultant | |
| S5 | Outgoing/incoming email configured and tested | | IT | |
| S6 | Backups scheduled and restore tested (or hosting backup confirmed) | C | IT | |
| S7 | Lock dates set for periods before go-live | | Finance | |

## Data

| # | Item | Critical | Owner | Status |
|---|---|---|---|---|
| D1 | Master data loaded and counts verified | C | Consultant | |
| D2 | Opening stock reconciled (qty and value) | C | Finance/WH | |
| D3 | Open AR/AP reconciled to legacy aging | C | Finance | |
| D4 | Opening trial balance posted, suspense = 0 | C | Finance | |
| D5 | Open sales/purchase orders loaded | | Consultant | |

## Users & security

| # | Item | Critical | Owner | Status |
|---|---|---|---|---|
| U1 | All users created with correct access groups | C | Consultant | |
| U2 | Multi-company access verified | | Consultant | |
| U3 | Admin passwords secured; test users disabled | C | IT | |
| U4 | End users trained; training materials available | C | Training lead | |

## Integrations

| # | Item | Critical | Owner | Status |
|---|---|---|---|---|
| I1 | Production endpoints and credentials configured | C | Tech lead | |
| I2 | Scheduled actions enabled at correct frequency | | Tech lead | |
| I3 | Monitoring/alerts for failed messages | | Tech lead | |

## Support & communication

| # | Item | Critical | Owner | Status |
|---|---|---|---|---|
| H1 | Hypercare team, hours and contacts published | C | PM | |
| H2 | Ticket process and triage matrix agreed | | Support lead | |
| H3 | Legacy system set to read-only | | IT | |
| H4 | Customers/vendors informed of changes | | Business | |
| H5 | Go / No-Go decision signed | C | Steering | |
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "support-ticket-template-triage-matrix",
    title: "Support Ticket Template & Triage Matrix",
    category: "Template",
    summary: "Standard ticket fields and a P1–P4 priority matrix with response and resolution targets for hypercare and AMS support.",
    body: `## Support ticket template

| Field | Description | Example |
|---|---|---|
| Ticket ID | Unique reference | SUP-0142 |
| Reported by / department | Who raised it | Warehouse lead, Logistics |
| Date / time reported | | 2024-07-03 10:15 |
| Company / database | Environment affected | Production — Crestline Furniture Ltd |
| App / process | | Inventory — Delivery |
| Summary | One-line description | Cannot validate delivery WH/OUT/00412 |
| Steps to reproduce | Numbered steps | 1. Open WH/OUT/00412 2. Click Validate |
| Expected result | | Delivery validated |
| Actual result / error message | Exact text or screenshot | Error message about insufficient quantity |
| Business impact | Users/orders affected, money at risk | 1 urgent customer shipment |
| Workaround available? | Yes/No + description | No |
| Priority (P1–P4) | From matrix | P2 |
| Category | Incident / Service request / Change request / Question | Incident |
| Assigned to | | Functional consultant |
| Status | New / In progress / Waiting for customer / Resolved / Closed | New |
| Root cause | Filled at resolution | Stock reserved on another picking |
| Resolution | | Unreserved and re-assigned stock; trained user |
| Knowledge article link | | KB-031 |

## Triage matrix

Priority combines **impact** (how many users/processes) and **urgency** (how soon business is harmed).

| | Urgency: High (business stopped now) | Urgency: Medium (harm within days) | Urgency: Low (no time pressure) |
|---|---|---|---|
| **Impact: Company-wide / critical process** | P1 | P2 | P3 |
| **Impact: Department / several users** | P2 | P3 | P3 |
| **Impact: Single user / cosmetic** | P3 | P4 | P4 |

## Priority definitions and targets

| Priority | Definition | Examples | First response target | Resolution / workaround target | Updates |
|---|---|---|---|---|---|
| P1 — Critical | Production down or critical process blocked for many users, no workaround; financial/data integrity at risk | Cannot log in; no invoices can be posted; integration duplicating orders | 30 minutes | 4 hours (workaround) | Every hour |
| P2 — High | Important process impaired, workaround difficult | Deliveries cannot be validated for one warehouse; wrong taxes on a product group | 2 hours | 1 business day | Twice daily |
| P3 — Medium | Function impaired, workaround exists | Report filter missing; one user's access wrong | 1 business day | 5 business days | On change |
| P4 — Low | Cosmetic, question, enhancement | Label wording; how-to question | 2 business days | Planned release / backlog | On change |

Targets are examples — agree actual SLAs in the support contract.

## Triage process

1. Validate the ticket has steps, actual result and impact; ask for missing information.
2. Reproduce in a test/staging copy if possible — never experiment in production.
3. Assign priority using the matrix; escalate P1 immediately to the support lead.
4. Classify: incident, service request, change request (requires approval/estimate) or training need.
5. Resolve, document root cause, and update the knowledge base.
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "integration-design-document",
    title: "Integration Design Document",
    category: "Template",
    summary: "Specify an interface between Odoo and an external system: direction, trigger, mapping, error handling, security and testing.",
    body: `## Document control

| Field | Value |
|---|---|
| IDD ID | IDD-001 |
| Integration name | Web shop orders to Odoo |
| Related requirements | REQ-INT-001 |
| Systems | External web shop (source) → Odoo 17.0 (target) |
| Author / reviewer / version | |

## 1. Overview

Business purpose, high-level flow and volumes.

| Item | Value |
|---|---|
| Direction | Inbound to Odoo (orders), outbound from Odoo (stock levels, shipment status) |
| Pattern | Scheduled pull every 60 minutes / webhook / file exchange |
| Technology | Odoo external API (XML-RPC/JSON-RPC), REST of the web shop, middleware (if any) |
| Volume | Average 300 orders/day, peak 1,500 |
| Latency requirement | Orders in Odoo within 1 hour |

## 2. Interface list

| Interface ID | Object | Direction | Trigger | Frequency | Odoo model |
|---|---|---|---|---|---|
| INT-01 | Customer | In | New order with new customer | With order | res.partner |
| INT-02 | Sales order | In | Order paid in shop | Hourly | sale.order / sale.order.line |
| INT-03 | Stock level | Out | Scheduled | Every 30 min | stock.quant (read) |
| INT-04 | Shipment status | Out | Delivery validated | Near real time | stock.picking (read) |

## 3. Field mapping (example INT-02)

| Source field | Odoo model | Odoo field | Transformation | Mandatory | Notes |
|---|---|---|---|---|---|
| order.number | sale.order | client_order_ref | Copy | Yes | Used for duplicate check |
| customer.email | sale.order | partner_id | Find partner by email; create if missing | Yes | |
| line.sku | sale.order.line | product_id | Find product by internal reference (default_code) | Yes | Unknown SKU → error |
| line.qty | sale.order.line | product_uom_qty | Numeric | Yes | |
| line.price | sale.order.line | price_unit | Tax-exclusive conversion if needed | Yes | Check tax config |
| shipping.amount | sale.order.line | product_id = Shipping service product | Add as line | No | |

## 4. Business rules

Duplicate prevention (client_order_ref unique per channel), order confirmation rules, tax and fiscal position determination, currency.

## 5. Error handling

| Error | Handling | Notification |
|---|---|---|
| Unknown SKU | Order not created, logged in error queue | Email to sales admin |
| Duplicate order number | Skip, log as duplicate | None |
| Odoo unavailable | Retry 3 times with backoff, then alert | Alert to IT |
| Validation error | Log full payload and error | Daily error report |

## 6. Security

Dedicated integration user with minimum access rights; API key/credentials stored securely; HTTPS only; IP restrictions if available.

## 7. Monitoring & logging

Log each run (start, end, records processed, failures); dashboard or report of failed messages; re-processing procedure.

## 8. Test scenarios

| # | Scenario | Expected |
|---|---|---|
| IT-01 | New customer, 2 lines | Partner and SO created with correct prices/taxes |
| IT-02 | Existing customer | No duplicate partner |
| IT-03 | Unknown SKU | Error logged, no SO |
| IT-04 | Same order sent twice | Only one SO |
| IT-05 | Odoo down during run | Retry, then alert; no partial orders |
| IT-06 | Stock update | Shop shows Odoo available qty |

## 9. Cutover & go-live

Initial sync steps, switch-on time, rollback (disable scheduler).
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "odoo-import-dependency-order",
    title: "Odoo Import Dependency Order",
    category: "Reference",
    summary: "The order in which to load data into Odoo, plus how External IDs, '/id' columns, name matching and update-vs-create behave.",
    body: `## Why order matters

Odoo records reference each other. A product refers to a category, a unit of measure and taxes; a customer refers to payment terms and a pricelist; an invoice refers to customers, products and accounts. If you import a record before the records it points to exist, the import fails or links to the wrong record. Load data in dependency order.

## Recommended sequence

| Step | Data | Typical Odoo model(s) | Depends on |
|---|---|---|---|
| 0 | Company settings, chart of accounts, journals, users | res.company, account.account, account.journal, res.users | Installation / localization |
| 1 | Units of measure and UoM categories | uom.category, uom.uom | — |
| 2 | Product categories | product.category | Accounts (for valuation/income/expense accounts) |
| 3 | Taxes and payment terms (and fiscal positions) | account.tax, account.payment.term, account.fiscal.position | Accounts |
| 4 | Partners (customers, vendors, contacts) | res.partner | Countries, payment terms, pricelists (or set later), users (salesperson) |
| 5 | Products | product.template / product.product | UoM, categories, taxes, vendors (for vendor pricelists) |
| 6 | Pricelists and pricelist rules; vendor pricelists | product.pricelist, product.pricelist.item, product.supplierinfo | Products, partners |
| 7 | Bills of Materials | mrp.bom, mrp.bom.line | Products, UoM |
| 8 | Opening stock (with lots/serials) | stock.quant via inventory adjustment | Products, locations, lots |
| 9 | Opening balances (trial balance) | account.move (journal entry) | Accounts, partners |
| 10 | Open documents: open invoices/bills, open SOs/POs | account.move, sale.order, purchase.order | Everything above |

Notes:

- Pricelists are often created before partners if partners carry a pricelist value — if so, create pricelist headers first and rules after products.
- Open invoices are usually imported against an opening/suspense account so that the trial balance entry clears it to zero.
- Exact model names and import behaviour can vary by version (verify for your version).

## External IDs

Every record can have an **External ID** (also called XML ID): a stable text key such as cust_C1001 or prod_LED40. In an import file, the column named **id** holds the External ID.

Benefits:

- Lets later files refer to records unambiguously.
- Lets you re-import the same file to **update** records instead of creating duplicates.
- Survives renames (names change, external IDs do not).

Imported records without a module prefix get the prefix "__import__." automatically (e.g. __import__.cust_C1001). Export a record with "I want to update data (import-compatible export)" to see its external ID.

## Relational columns: name vs "/id" vs ".id"

| Column header | How Odoo finds the related record | Example |
|---|---|---|
| categ_id | By display name (name search) | All / Saleable / Lighting |
| categ_id/id | By External ID | categ_lighting |
| categ_id/.id | By database ID (numeric) | 14 |

Recommendations:

- Prefer **/id** columns for reliability: names may be duplicated, translated or renamed.
- Name matching is convenient for small, clean lists (e.g. countries, UoM "Units"), but if two records share a name the import may link to the wrong one or fail.
- Database IDs differ between databases (test vs production) — avoid ".id" for migration files that will run in several databases.
- For many2many fields (e.g. taxes), multiple values are separated by commas, e.g. taxes_id/id = tax_sale_15,tax_eco_fee (verify syntax for your version).
- One2many lines (e.g. order lines, BoM lines) are imported by repeating the parent columns only on the first row and filling line columns on following rows.

## Update vs create behaviour

| Situation | Result |
|---|---|
| Row has an id (External ID) that already exists | Existing record is **updated** |
| Row has an id that does not exist yet | New record is **created** and the External ID is assigned |
| Row has no id column / empty id | New record is **created** every time (risk of duplicates on re-import) |

Therefore: always include an **id** column in migration files. It makes trial loads repeatable and allows corrections by re-importing.

## Practical tips

- Use the Test button of the import tool before Import; fix every error.
- Import in batches (for example a few thousand rows) for large files to avoid timeouts.
- Keep a log of each import: file name, row count, errors, date, database.
- After each step, run record counts before moving to the next dependency.
- Disable automatic emails/followers notifications where possible during mass imports (verify options for your version).
`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "odoo-editions-feature-availability",
    title: "Odoo Editions & Feature Availability",
    category: "Reference",
    summary: "High-level comparison of Odoo Community and Enterprise apps to support fit-gap and licensing discussions.",
    body: `## Important note

Feature availability changes between versions and hosting options. This page is a **high-level training guide** only. Always verify on odoo.com (the official editions comparison page) for your version before committing to a client (verify for your version/edition).

## The two editions

| Aspect | Community | Enterprise |
|---|---|---|
| Licence | Open source (LGPL v3) | Proprietary Odoo Enterprise licence (subscription) |
| Cost | No licence fee | Per-user subscription |
| Hosting | Self-hosted (on-premise or any cloud) | Odoo Online (SaaS), Odoo.sh, or on-premise |
| Upgrades | Self-managed (or third-party tools) | Upgrade services included with subscription |
| Support | Community / partners | Odoo support + partners |
| User interface | Web client | Web client plus mobile-optimised and additional features |

## App availability (high level)

| App / feature | Community | Enterprise | Notes |
|---|---|---|---|
| CRM | Yes | Yes | |
| Sales | Yes | Yes | Some advanced features Enterprise-only |
| Purchase | Yes | Yes | |
| Inventory | Yes | Yes | Barcode app is Enterprise |
| Manufacturing (MRP) | Yes | Yes | PLM, Quality, Maintenance are Enterprise |
| Project | Yes | Yes | Some planning/forecast features Enterprise |
| Invoicing | Yes | Yes | Customer invoices, vendor bills, payments |
| Full Accounting | No (Invoicing only) | Yes | Bank synchronisation, financial reports, reconciliation tools, assets, budgets etc. |
| Website | Yes | Yes | |
| eCommerce | Yes | Yes | |
| Point of Sale | Yes | Yes | |
| Employees | Yes | Yes | |
| Recruitment | Yes | Yes | |
| Expenses | Yes | Yes | |
| Time Off | Yes | Yes | |
| Studio | No | Yes | No-code customization |
| Approvals | No | Yes | |
| Helpdesk | No | Yes | |
| Field Service | No | Yes | |
| Quality | No | Yes | |
| Documents | No | Yes | |
| Sign | No | Yes | |
| Planning | No | Yes | |
| Payroll | No | Yes | Localisation-dependent |
| Rental, Subscriptions, Appraisals | No | Yes | Verify per version |

## Consultant implications

- **Fit-gap**: always record which edition a "standard fit" relies on. A feature that is standard in Enterprise is a gap in Community.
- **Community alternatives**: OCA modules can fill some gaps (e.g. accounting reports), but they are third-party: check maturity, version support and maintenance.
- **Customization approach**: Studio is Enterprise-only; on Community, customizations require custom modules.
- **Hosting**: Odoo Online restricts custom code; Odoo.sh and on-premise allow custom modules (verify current hosting rules).
- **Testing**: test on the same edition and version as production — Enterprise adds views and fields that change behaviour.

## Quick decision checklist

| Question | If yes |
|---|---|
| Need full accounting reports, bank sync, assets? | Enterprise (or validated OCA alternatives) |
| Need Studio, Approvals, Helpdesk, Field Service, Sign, Documents? | Enterprise |
| Heavy custom development and full control of hosting? | Community or Enterprise on-premise / Odoo.sh |
| Small team, standard processes, no custom code? | Odoo Online (Enterprise) may fit |
`,
  },
];
