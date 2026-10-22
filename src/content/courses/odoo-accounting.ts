import type { CourseContent } from "../types";

/**
 * Odoo Accounting / Invoicing — application training course.
 * Follows the 16-point application training template:
 *  1 overview, 2 business problems, 3 process flow, 4 dependencies, 5 prerequisites & master data,
 *  6 configuration, 7 master data creation, 8 transactions, 9 approvals & automation, 10 reports,
 *  11 accounting impact, 12 integration, 13 troubleshooting, 14 practical assignments,
 *  15 interview questions, 16 assessment (course `assessment`).
 */
export const odooAccounting: CourseContent = {
  slug: "odoo-accounting",
  section: "odoo-apps",
  title: "Odoo Accounting: Invoicing, Payments, Bank Reconciliation, Reporting & Indian GST E-Invoicing",
  summary:
    "Learn how Odoo Invoicing (Community) and Accounting (Enterprise) record customer invoices, vendor bills, payments and bank statements, how to configure the chart of accounts, journals, taxes and fiscal positions, load opening balances, close periods and read financial reports. Built around the fictional B2B distributor Northwind Office Supplies Pvt Ltd. A dedicated India localization module covers GST (CGST/SGST/IGST, HSN/SAC, reverse charge, ITC), the Odoo India fiscal localization, GST e-invoicing (IRN and signed QR via the IRP), e-way bills, GST returns (GSTR-1/3B/2B) and TDS/TCS.",
  level: "intermediate",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 5,
  skills: [
    "Fiscal localization and chart of accounts",
    "Journals, taxes and fiscal positions",
    "Payment terms and multi-currency",
    "Customer invoices, credit notes and vendor bills",
    "Payments and outstanding payments",
    "Bank statements and reconciliation",
    "Opening balances and lock dates",
    "Analytic accounting (analytic plans)",
    "Financial reporting (GL, Trial Balance, Balance Sheet, P&L, Aged reports)",
    "Indian GST in Odoo",
    "GST e-invoicing (IRN)",
    "E-way bill",
    "GST returns (GSTR-1/3B)",
    "TDS/TCS overview (India)",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1: Accounting Foundations in Odoo",
      lessons: [
        {
          slug: "accounting-overview-and-process-flow",
          title: "Accounting Overview, Business Problems and Process Flow",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "enterprise"],
          body: `\`\`\`visual-video
{
  "src": "/videos/odoo-accounting-live.mp4",
  "poster": "/videos/odoo-accounting-live.webp",
  "title": "Odoo Accounting: invoice to payment, recorded live in Odoo 20",
  "duration": "2:45",
  "caption": "A short introduction, then the process as a continuous live screen recording in an Odoo 20 database with fictional Northwind data. Narration: Indian English neural voice.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 12,
      "label": "What Odoo Accounting does"
    },
    {
      "t": 39,
      "label": "Why it matters"
    },
    {
      "t": 57,
      "label": "Document flow"
    },
    {
      "t": 80,
      "label": "Live: New invoice"
    },
    {
      "t": 89,
      "label": "Live: Customer"
    },
    {
      "t": 97,
      "label": "Live: Invoice line"
    },
    {
      "t": 109,
      "label": "Live: Post"
    },
    {
      "t": 119,
      "label": "Live: Register payment"
    },
    {
      "t": 129,
      "label": "Live: In Payment"
    },
    {
      "t": 142,
      "label": "Recap"
    }
  ]
}
\`\`\`

## 1. Overview

Accounting is where every operational transaction in Odoo ends up. A sales invoice, a vendor bill, a stock receipt (with automated valuation), a payroll run or a POS session all become **journal entries** made of **journal items** (debit/credit lines on accounts). As a techno-functional consultant you must be able to explain *both* the business document and the entry it produces.

### Community "Invoicing" vs Enterprise "Accounting"

| Capability | Odoo Community (Invoicing app) | Odoo Enterprise (Accounting app) |
|---|---|---|
| Customer invoices, credit notes, vendor bills | Yes | Yes |
| Payments, outstanding payments | Yes | Yes |
| Chart of accounts, journals, taxes, fiscal positions | Yes | Yes |
| Analytic accounting | Yes | Yes |
| Full financial reports (Balance Sheet, P&L, GL, Trial Balance, Aged reports, Tax report) | Limited (invoice analysis) | Yes |
| Bank reconciliation widget, bank synchronisation | No | Yes |
| Assets, deferred revenue/expense | No | Yes |
| Budgets | No | Yes |
| Payment follow-ups | No | Yes |
| Lock dates wizard, invoice digitization (OCR) | Limited / No | Yes |

Feature availability shifts between versions — always **verify in your training instance** before promising a client a feature.

### Our client

| Attribute | Value |
|---|---|
| Company | Northwind Office Supplies Pvt Ltd |
| Business | B2B distributor of office supplies |
| Currency | USD (some EUR purchases from European vendors) |
| Go-live | 1 January, fiscal year = calendar year |
| Bank | First City Bank — operating account |
| Pain today | Invoices in Word, payments matched manually in Excel, no aged receivables, month-end takes 15 days |

## 2. Business problems solved

| Business problem | Odoo solution |
|---|---|
| Invoices typed manually from sales orders | Invoices generated from sales orders / delivered quantities |
| Unknown who owes what | Aged Receivable, outstanding credits on invoices, follow-ups (Enterprise) |
| Vendor bills paid twice | Bills linked to purchase orders, duplicate reference warning, payment status |
| Slow bank matching | Bank statements + reconciliation models (Enterprise widget) |
| Tax errors | Tax templates from the fiscal localization, tax grids feeding the tax report |
| No profitability by department/project | Analytic plans and analytic distribution |
| Back-dated changes after closing | Lock dates |
| Month end in 15 days | Real-time GL; closing becomes review rather than data entry |

## 3. Process flow

### Order-to-Cash

\`\`\`visual-flow
{
  "title": "Order-to-Cash",
  "caption": "Select a step to see what it does to the accounts.",
  "steps": [
    {
      "title": "Sales order",
      "icon": "cart",
      "app": "Sales"
    },
    {
      "title": "Delivery",
      "icon": "truck",
      "app": "Inventory"
    },
    {
      "title": "Customer invoice (draft)",
      "icon": "invoice",
      "app": "Accounting"
    },
    {
      "title": "Confirm → posted",
      "icon": "check",
      "app": "Accounting",
      "impact": "AR ↑, Revenue ↑, Tax payable ↑"
    },
    {
      "title": "Register payment",
      "icon": "payment",
      "app": "Accounting",
      "impact": "AR ↓, Outstanding Receipts ↑"
    },
    {
      "title": "Reconcile bank statement line",
      "icon": "bank",
      "app": "Accounting",
      "impact": "Bank ↑, Outstanding Receipts ↓"
    }
  ]
}
\`\`\`

### Procure-to-Pay

\`\`\`visual-flow
{
  "title": "Procure-to-Pay",
  "caption": "Select a step to see what it does to the accounts.",
  "steps": [
    {
      "title": "Purchase order",
      "icon": "cart",
      "app": "Purchase"
    },
    {
      "title": "Receipt",
      "icon": "package",
      "app": "Inventory"
    },
    {
      "title": "Vendor bill (draft)",
      "icon": "receipt",
      "app": "Accounting"
    },
    {
      "title": "Confirm → posted",
      "icon": "check",
      "app": "Accounting",
      "impact": "Expense / stock interim ↑, Tax receivable ↑, AP ↑"
    },
    {
      "title": "Register payment",
      "icon": "payment",
      "app": "Accounting",
      "impact": "AP ↓, Outstanding Payments ↑"
    },
    {
      "title": "Reconcile bank statement line",
      "icon": "bank",
      "app": "Accounting",
      "impact": "Bank ↓, Outstanding Payments ↓"
    }
  ]
}
\`\`\`

### Record-to-Report

\`\`\`visual-flow
{
  "title": "Record-to-Report",
  "steps": [
    {
      "title": "Daily postings",
      "icon": "invoice"
    },
    {
      "title": "Bank reconciliation",
      "icon": "bank"
    },
    {
      "title": "Accruals / misc. entries",
      "icon": "file"
    },
    {
      "title": "Review trial balance",
      "icon": "scale"
    },
    {
      "title": "Lock date",
      "icon": "lock"
    },
    {
      "title": "Balance sheet / P&L / tax report",
      "icon": "chart"
    },
    {
      "title": "Year-end closing",
      "icon": "calendar"
    }
  ]
}
\`\`\`

> **Consultant tip:** Accountants think in entries, operations people think in documents. In workshops, show both side by side: open the invoice, then click the **Journal Items** tab. That single habit removes most fear of "the system posting things behind our back".

## How this course is structured

| Lesson | Template points |
|---|---|
| 1. Overview (this lesson) | Overview, business problems, process flow |
| 2. Dependencies and configuration | Dependencies, prerequisites, settings, localization, journals, taxes |
| 3. Master data and opening balances | Accounts, partners, payment terms, fiscal positions, currencies, opening balances |
| 4. Transactions | Invoices, credit notes, bills, payments, bank reconciliation |
| 5. Controls, reports and integration | Approvals, automation, lock dates, analytics, reports, entries, integration |
| 6. Troubleshooting and interview prep | Errors, practical tasks, interview questions |

## Key takeaways

- Every document in Odoo ends as a journal entry; learn to read the Journal Items tab.
- Community = Invoicing; Enterprise = full Accounting (reports, reconciliation widget, assets, budgets, follow-ups).
- O2C, P2P and R2R are the three flows you will configure and explain.
- Registering a payment does not touch the bank account directly in Odoo 17 when outstanding accounts are used; reconciliation with the statement does.`,
          flashcards: [
            { term: "Journal entry", definition: "A balanced accounting record (account.move) made of journal items; invoices, bills and payments are all journal entries." },
            { term: "Fiscal localization", definition: "Country package providing the chart of accounts, taxes, tax report and fiscal positions." },
            { term: "Fiscal position", definition: "Rules that map taxes and accounts for specific partners, e.g. exempt or foreign customers." },
            { term: "Outstanding Receipts account", definition: "Transitional account used when a customer payment is registered before it is matched to a bank statement line." },
            { term: "Bank Suspense Account", definition: "Temporary counterpart of imported bank statement lines until they are reconciled." },
            { term: "Lock date", definition: "Date before which entries can no longer be created or modified, used to close periods." },
            { term: "Analytic plan", definition: "Odoo 17 structure grouping analytic accounts (e.g. Departments, Projects) for multi-dimensional analysis." },
            { term: "Tax grid", definition: "Tag on tax distribution lines that feeds a box of the legal tax report." },
          ],
          resources: [
            { title: "Odoo 17 Accounting documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting.html" },
          ],
        },
        {
          slug: "accounting-dependencies-and-configuration",
          title: "Dependencies, Prerequisites and Configuration",
          durationMin: 50,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## 4. Dependencies on other apps

Accounting/Invoicing is installed automatically by Sales, Purchase, POS and others because they need to create invoices. Its relationships:

| App | What it sends to Accounting |
|---|---|
| Sales | Customer invoices (ordered or delivered quantities) |
| Purchase | Vendor bills (ordered or received quantities) |
| Inventory | Stock valuation entries (automated valuation), COGS |
| Point of Sale | Session closing entries |
| Expenses | Employee expense reports and reimbursements |
| Payroll (Enterprise) | Salary entries |
| Project / Timesheets | Analytic lines (costs per project) |

Accounting itself depends only on the base modules and a **fiscal localization**.

## 5. Prerequisites and master data checklist

| # | Item | Owner |
|---|---|---|
| 1 | Company legal details, tax ID, currency, fiscal year end | Finance controller |
| 2 | Fiscal localization (country package) | Consultant + finance |
| 3 | Chart of accounts mapping from legacy system | Finance |
| 4 | Bank accounts and journals | Treasury |
| 5 | Taxes and tax report requirements | Tax advisor |
| 6 | Payment terms | Credit control |
| 7 | Customers and vendors (with receivable/payable accounts, terms, fiscal position) | Sales / Purchasing |
| 8 | Opening trial balance at go-live date | Finance |
| 9 | Open AR/AP items (unpaid invoices/bills) at go-live date | Finance |
| 10 | Analytic plans (departments, projects) | Controller |

## 6. Configuration and settings

\`\`\`visual-steps
{
  "title": "Northwind accounting configuration, in order",
  "steps": [
    { "title": "Select the fiscal localization", "body": "Before any transaction is posted. Installs chart of accounts, taxes, tax report and fiscal positions.", "path": "Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization", "result": "Country package installed" },
    { "title": "Review key settings", "body": "Default taxes 8%, Multi-Currencies (EUR), Analytic Accounting, default terms and conditions.", "path": "Accounting ▸ Configuration ▸ Settings" },
    { "title": "Map the chart of accounts", "body": "Check code, name, **type** and Allow Reconciliation against the legacy chart.", "path": "Accounting ▸ Configuration ▸ Chart of Accounts" },
    { "title": "Set up journals", "body": "Sales (INV), Purchase (BILL), Bank (BNK1), Cash (CSH1), Miscellaneous (MISC, STJ).", "path": "Accounting ▸ Configuration ▸ Journals" },
    { "title": "Check the taxes", "body": "Computation, type, included in price, tax group and tax grids.", "path": "Accounting ▸ Configuration ▸ Taxes", "result": "Ready for master data and opening balances" }
  ]
}
\`\`\`

### 6.1 Fiscal localization

Path: **Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization** — select the package (e.g. "United States - Generic" or the client's country). The package installs:

- Chart of accounts (with account types)
- Default taxes and tax groups
- Tax report with tax grids
- Fiscal positions (country-dependent)

> **Consultant tip:** Choose the localization **before any transaction** is posted. Switching packages after posting is not supported in practice. In Odoo 17 the package is normally installed when the company country is set on database creation — verify in your training instance.

### 6.2 Key settings

Path: **Accounting ▸ Configuration ▸ Settings**. Commonly reviewed (names as in Odoo 17 — verify):

| Setting | Purpose | Northwind |
|---|---|---|
| Default Taxes | Sales/purchase tax proposed on new products | Sales Tax 8%, Purchase Tax 8% |
| Multi-Currencies | Enable foreign currencies | Yes (EUR) |
| Automatic Currency Rates | Daily rate updates from a provider | Yes (verify edition) |
| Analytic Accounting | Enable analytic plans/distribution | Yes |
| Cash Rounding | Rounding of cash invoices | No |
| Customer Invoices ▸ Default Terms & Conditions | Printed on invoices | Yes |
| Payment Terms (Early discount) | Early payment discount handling | Optional |
| Bank & Cash ▸ Outstanding Receipts/Payments accounts | Transitional accounts for payments | Default from localization |

\`\`\`visual-match
{
  "title": "Setting and its effect",
  "prompt": "Match each accounting setting to what it does.",
  "leftLabel": "Setting",
  "rightLabel": "Effect",
  "pairs": [
    { "left": "Default Taxes", "right": "Proposes a sales/purchase tax on new products" },
    { "left": "Multi-Currencies", "right": "Allows invoices and bills in foreign currencies such as EUR" },
    { "left": "Automatic Currency Rates", "right": "Updates exchange rates daily from a provider" },
    { "left": "Analytic Accounting", "right": "Enables analytic plans and distribution" },
    { "left": "Cash Rounding", "right": "Rounds the total of cash invoices" },
    { "left": "Outstanding Receipts/Payments accounts", "right": "Holds payments until they are reconciled with the bank" }
  ],
  "explanation": "Most of these defaults come from the localization; the consultant reviews them with the finance controller before go-live."
}
\`\`\`

### 6.3 Chart of accounts

Path: **Accounting ▸ Configuration ▸ Chart of Accounts**. Each account has a **Code**, **Name**, **Type** and flags such as **Allow Reconciliation**.

| Account type (Odoo 17) | Report section | Example |
|---|---|---|
| Receivable | Balance Sheet — current assets | 121000 Account Receivable |
| Payable | Balance Sheet — current liabilities | 211000 Account Payable |
| Bank and Cash | Balance Sheet | 101401 First City Bank |
| Current Assets | Balance Sheet | 110100 Stock Valuation |
| Fixed Assets / Non-current Assets | Balance Sheet | 151000 Furniture & Fixtures |
| Current Liabilities | Balance Sheet | 251000 Tax Payable |
| Equity | Balance Sheet | 301000 Capital |
| Current Year Earnings | Balance Sheet (computed) | 999999 Undistributed Profits/Losses |
| Income / Other Income | P&L | 400000 Product Sales |
| Cost of Revenue | P&L | 500000 Cost of Goods Sold |
| Expenses / Depreciation | P&L | 600000 Expenses |

Account codes above are illustrative of the generic chart; actual codes come from your localization.

### 6.4 Journals

Path: **Accounting ▸ Configuration ▸ Journals**.

| Type | Northwind journals | Notes |
|---|---|---|
| Sales | Customer Invoices (INV) | Sequence INV/2025/00001 |
| Purchase | Vendor Bills (BILL) | |
| Bank | First City Bank (BNK1) | Linked to a bank account number; has suspense and outstanding accounts |
| Cash | Petty Cash (CSH1) | |
| Miscellaneous | Miscellaneous Operations (MISC), Inventory Valuation (STJ), Exchange Difference | Accruals, opening entries, adjustments |

### 6.5 Taxes

Path: **Accounting ▸ Configuration ▸ Taxes**.

| Field | Meaning |
|---|---|
| Tax Computation | Fixed, Percentage of Price, Percentage of Price Tax Included, Group of Taxes |
| Tax Type | Sales / Purchase / None |
| Tax Scope | Goods / Services (optional) |
| Included in Price (Advanced Options) | Price entered includes tax |
| Tax Group | Groups taxes on invoice totals and reports |
| Distribution for Invoices / Refunds | Base and tax lines, accounts and **tax grids** |

Example: price 108.00 with "Sales Tax 8% **included**" ⇒ base 100.00, tax 8.00. Same price with tax **excluded** ⇒ base 108.00, tax 8.64, total 116.64.

\`\`\`visual-decision
{
  "title": "Price 108.00 with Sales Tax 8%: what does the customer pay?",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is Included in Price ticked on the tax?", "options": [ { "label": "Yes, tax included", "next": "r1" }, { "label": "No, tax excluded", "next": "r2" } ] },
    "r1": { "result": "Base 100.00 + tax 8.00 = total 108.00", "tone": "success", "detail": "Odoo extracts the tax from the price; use for B2C shops that show gross prices." },
    "r2": { "result": "Base 108.00 + tax 8.64 = total 116.64", "tone": "info", "detail": "Tax is added on top of the price; the usual choice for B2B price lists." }
  }
}
\`\`\`

## Standard vs Enterprise vs customization

| Requirement | Classification |
|---|---|
| Chart of accounts, taxes, journals, fiscal positions | Standard (configuration) |
| Bank synchronisation, reconciliation widget, financial reports | Enterprise |
| Custom invoice layout with extra fields | Customization (Studio or QWeb module) |
| Integration with an external tax engine | Third-party |

\`\`\`visual-check
{
  "question": "Northwind's test database already has posted invoices when the team realises the wrong fiscal localization was installed. What is the best advice?",
  "options": ["Switch the localization package in Settings; Odoo converts the entries", "Rename the accounts to match the new country", "Start from a fresh database and select the right localization before any transaction", "Keep it and fix the tax report at year end"],
  "correct": 2,
  "explanation": "Switching packages after posting is not supported in practice. The localization drives the chart of accounts, taxes and tax report, so it must be chosen before any transaction."
}
\`\`\`

## Key takeaways

- The localization decides your chart of accounts, taxes and tax report — pick it first.
- Account **type** drives where an account appears in reports and how it behaves.
- Five journal types: Sales, Purchase, Bank, Cash, Miscellaneous.
- Tax included vs excluded changes the base, not just the display.`,
          resources: [
            { title: "Odoo 17 Accounting documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting.html" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2: Master Data and Daily Transactions",
      lessons: [
        {
          slug: "accounting-master-data-and-opening-balances",
          title: "Master Data, Fiscal Positions, Currencies and Opening Balances",
          durationMin: 50,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 7. Master data creation

### 7.1 Payment terms

Path: **Accounting ▸ Configuration ▸ Payment Terms**.

| Term | Lines | Use at Northwind |
|---|---|---|
| Immediate Payment | 100% due on invoice date | Walk-in / new customers |
| 30 Days | 100% after 30 days | Standard corporate customers |
| 50% Advance, 50% in 30 days | 50% at 0 days, 50% at 30 days | Large furniture projects |
| 2/10 Net 30 | Early payment discount 2% within 10 days, balance in 30 (Odoo 17 early discount feature — verify) | Key accounts |

Payment terms create one **receivable line per installment**, which is why the Aged Receivable shows split due dates.

### 7.2 Customers and vendors

Path: **Accounting ▸ Customers ▸ Customers** and **Accounting ▸ Vendors ▸ Vendors** (both are the same contact model).

| Field (Sales & Purchase / Accounting tabs) | Example: Contoso Ltd |
|---|---|
| Customer Payment Terms | 30 Days |
| Fiscal Position | (empty — domestic) |
| Account Receivable | 121000 Account Receivable |
| Account Payable | 211000 Account Payable |
| Bank Accounts | For vendors you pay by transfer |

### 7.3 Fiscal positions

Path: **Accounting ▸ Configuration ▸ Fiscal Positions**. A fiscal position **maps** taxes and accounts.

| Fiscal position | Tax mapping | Account mapping | Auto-apply |
|---|---|---|---|
| Tax Exempt Customer | Sales Tax 8% ▸ (no tax) | — | No — set on partner |
| Export Customer | Sales Tax 8% ▸ Export 0% | Product Sales ▸ Export Sales | Yes, by country group |

With **Detect Automatically**, Odoo selects the position from the customer's country/state (and VAT requirement). A fiscal position set on the partner takes precedence.

### 7.4 Currencies and exchange rates

Enable **Multi-Currencies** in settings, then **Accounting ▸ Configuration ▸ Currencies**; activate EUR and maintain rates (manually or automatically — verify provider/edition). Northwind buys from Bürotech GmbH in EUR: a bill for EUR 1,000 at rate 1.10 is booked at USD 1,100. If paid when the rate is 1.12 (USD 1,120), the USD 20 difference is posted automatically to the **exchange difference** journal/account (realised loss).

### 7.5 Products (accounting view)

On the product form ▸ Accounting tab: **Income Account**, **Expense Account** (falling back to the product category accounts), and default **Customer/Vendor Taxes**.

### 7.6 Opening balances (go-live 1 January)

There are several valid techniques; the generic approach every consultant should know:

**Step A — Balance sheet accounts (excluding AR/AP detail).** Create one journal entry in the *Miscellaneous* journal dated **31 December** (the day before go-live), reference "Opening Balance". Post every balance-sheet account from the legacy trial balance. Use an agreed **opening-balance / suspense equity account** as the balancing line if needed. Odoo 17 also offers opening debit/credit columns on the Chart of Accounts list which generate an opening move (verify in your training instance).

**Step B — Open receivables and payables.** Import each unpaid customer invoice and vendor bill (or one summary line per partner and due date) so they can be paid and aged in Odoo. The counterpart is the same opening suspense account instead of revenue/expense.

**Step C — Clear the suspense.** In Step A, post total AR and AP *to the suspense account* (not to Receivable/Payable), because Step B creates the real AR/AP lines. After both steps, the suspense balance must be **zero**.

**Northwind example (31 Dec):**

| Account | Debit | Credit |
|---|---|---|
| First City Bank | 85,000.00 | |
| Stock Valuation | 142,000.00 | |
| Furniture & Fixtures | 30,000.00 | |
| Opening suspense (for AR 64,000 − AP 51,000) | 13,000.00 | |
| Tax Payable | | 9,000.00 |
| Capital | | 200,000.00 |
| Retained Earnings | | 61,000.00 |
| **Total** | **270,000.00** | **270,000.00** |

\`\`\`visual-journal
{
  "title": "Step A: Opening Balance (MISC journal, 31 Dec)",
  "lines": [
    { "account": "First City Bank", "debit": "85,000.00" },
    { "account": "Stock Valuation", "debit": "142,000.00" },
    { "account": "Furniture & Fixtures", "debit": "30,000.00" },
    { "account": "Opening suspense (AR 64,000 less AP 51,000)", "debit": "13,000.00" },
    { "account": "Tax Payable", "credit": "9,000.00" },
    { "account": "Capital", "credit": "200,000.00" },
    { "account": "Retained Earnings", "credit": "61,000.00" }
  ],
  "note": "Total 270,000.00 on each side. AR and AP go to the suspense account, not to Receivable/Payable, because Step B creates the real open items."
}
\`\`\`

Step B then imports open invoices (AR 64,000 Dr / suspense Cr) and bills (suspense Dr / AP 51,000 Cr): suspense nets to zero.

\`\`\`visual-journal
{
  "title": "Step B: open invoices and bills imported (totals)",
  "lines": [
    { "account": "Accounts Receivable (open customer invoices)", "debit": "64,000.00" },
    { "account": "Opening suspense", "credit": "64,000.00" },
    { "account": "Opening suspense", "debit": "51,000.00" },
    { "account": "Accounts Payable (open vendor bills)", "credit": "51,000.00" }
  ],
  "note": "Suspense: 13,000 Dr (Step A) minus 64,000 Cr plus 51,000 Dr = 0. The open items can now be paid and aged in Odoo."
}
\`\`\`

\`\`\`visual-order
{
  "title": "Opening balance cut-over",
  "prompt": "Put Northwind's opening-balance tasks in the right order for a 1 January go-live.",
  "items": [
    "Choose the fiscal localization and set up the chart of accounts",
    "Get the legacy trial balance and open AR/AP list at 31 December",
    "Post the Opening Balance entry in the Miscellaneous journal dated 31 December, with AR/AP to suspense",
    "Import unpaid customer invoices and vendor bills against the suspense account",
    "Check that the opening suspense balance is zero",
    "Start posting live transactions from 1 January"
  ],
  "explanation": "The chart must exist before balances are posted; the suspense account only clears once both Step A and Step B are in, and that check comes before live posting."
}
\`\`\`

\`\`\`visual-check
{
  "question": "After Steps A and B the opening suspense account shows a debit of 13,000. What was most likely missed?",
  "options": ["The open customer invoices and vendor bills were not imported", "The bank balance was posted twice", "The fiscal year was not closed", "Retained earnings were posted to the P&L"],
  "correct": 0,
  "explanation": "Step A leaves 13,000 Dr on suspense (AR 64,000 minus AP 51,000). Only the Step B imports (64,000 Cr and 51,000 Dr) bring it back to zero."
}
\`\`\`

> **Consultant tip:** Stock valuation in the opening entry must equal the valuation of the opening stock loaded in Inventory. If Inventory's physical-inventory import also posts an entry (automated valuation), do not post stock twice — agree which side creates the value.

## Key takeaways

- Payment terms create multiple due-date lines on receivables/payables.
- Fiscal positions map taxes and accounts; they can apply automatically.
- Exchange differences on payments are booked automatically.
- Opening balances: balance sheet via a misc entry, open items via invoice/bill import, suspense must end at zero.`,
        },
        {
          slug: "accounting-transactions",
          title: "Transactions: Invoices, Credit Notes, Bills, Payments and Bank Reconciliation",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "enterprise"],
          body: `## 8. Transaction processing

### 8.1 Customer invoice

Path: **Accounting ▸ Customers ▸ Invoices ▸ New** (usually generated from the sales order via **Create Invoice**).

1. Customer: Contoso Ltd. Payment terms default to 30 Days.
2. Invoice Date: 10 March. Due date is computed.
3. Line: A4 Copy Paper, quantity 120, price 6.50, tax Sales Tax 8% (excluded).
4. Totals: untaxed 780.00, tax 62.40, total **842.40**.
5. Click **Confirm**. The invoice receives its number INV/2025/00045 and is **Posted**.
6. Send via **Send & Print**.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Post a customer invoice and register the payment",
  "intro": "Contoso Ltd bought **10 toner cartridges**. Invoice them, then record Contoso's bank transfer.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "Invoice **INV/26-27/0003** is posted and the payment recorded. The payment sits in *Outstanding Receipts* until the bank statement line is reconciled.",
  "steps": [
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-01.webp",
      "alt": "Customer invoices list with the New button.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "Start a **new customer invoice**.",
      "target": {
        "x": 0.8500000000000001,
        "y": 5.95,
        "w": 4,
        "h": 4.2,
        "label": "New"
      },
      "explain": "A draft invoice opens. It has no number until it is posted."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-02.webp",
      "alt": "Customer field on the draft invoice with Contoso Ltd in the dropdown.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "**Select the customer** Contoso Ltd.",
      "target": {
        "x": 12.65,
        "y": 31.45,
        "w": 18,
        "h": 3.5,
        "label": "Contoso Ltd"
      },
      "explain": "Payment terms and the receivable account come from the customer."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-03.webp",
      "alt": "Draft invoice for Contoso Ltd with the Add a line link.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "**Add an invoice line.**",
      "target": {
        "x": 4.65,
        "y": 55.45,
        "w": 5,
        "h": 3.1,
        "label": "Add a line"
      },
      "explain": "A new line opens with the product field active."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-04.webp",
      "alt": "Product dropdown on the invoice line showing Toner Cartridge HP 26A.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "**Select Toner Cartridge HP 26A.**",
      "target": {
        "x": 4.95,
        "y": 58.25,
        "w": 21.5,
        "h": 3.5,
        "label": "Toner Cartridge HP 26A"
      },
      "explain": "The price, income account and GST come from the product."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-05.webp",
      "alt": "Invoice line for Toner Cartridge HP 26A with quantity 1.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "Contoso bought **10** cartridges. Set the quantity.",
      "target": {
        "x": 20.25,
        "y": 54.55,
        "w": 7.6,
        "h": 11.7,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Quantity",
        "answer": "10",
        "placeholder": "units"
      },
      "traps": [
        {
          "x": 34.45,
          "y": 54.55,
          "w": 7.6,
          "h": 11.7,
          "feedback": "That is the **price**. Change the quantity."
        }
      ],
      "explain": "The totals update: untaxed amount, GST and total."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-06.webp",
      "alt": "Draft invoice for 10 toner cartridges with the Confirm button.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "**Post the invoice.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 5.6,
        "h": 4.2,
        "label": "Confirm"
      },
      "explain": "The invoice gets its number and posts: debit Receivable, credit Sales and GST."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-07.webp",
      "alt": "Posted invoice with the Pay button.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "Contoso paid the full amount by bank transfer. **Record the payment** (the **Pay** button).",
      "target": {
        "x": 8.75,
        "y": 12.15,
        "w": 3.6,
        "h": 4.2,
        "label": "Pay"
      },
      "traps": [
        {
          "x": 17.35,
          "y": 12.15,
          "w": 7.1,
          "h": 4.2,
          "feedback": "**Credit Note** cancels (part of) the invoice. The customer paid: register the payment."
        }
      ],
      "explain": "The payment dialog proposes the full amount, the bank journal and today's date."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-08.webp",
      "alt": "Register Payment dialog with journal Bank and the full amount.",
      "path": "Register Payment",
      "task": "Journal, amount and date are right. **Create the payment.**",
      "target": {
        "x": 16.85,
        "y": 61.95,
        "w": 9,
        "h": 4.2,
        "label": "Create Payment"
      },
      "traps": [
        {
          "x": 25.85,
          "y": 61.95,
          "w": 5.3,
          "h": 4.2,
          "feedback": "Discard closes the dialog without recording anything."
        }
      ],
      "explain": "Odoo posts the payment and matches it with the invoice."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-invoice-pay-09.webp",
      "alt": "Invoice with the payment status ribbon.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "INV/26-27/0003 now shows **In Payment**.",
      "explain": "**In Payment** means the money is recorded but not yet matched to a bank statement line; after bank reconciliation it shows **Paid**."
    }
  ]
}
\`\`\`

### 8.2 Credit note

Contoso returns 20 reams. Open the posted invoice ▸ **Credit Note** (reversal wizard) ▸ reason "Damaged goods" ▸ create a draft credit note, set quantity 20 ▸ **Confirm**. Credit note value: 130.00 + 10.40 tax = 140.40. It appears as an outstanding credit that can be reconciled with the invoice.

Posted documents are never deleted: use **Reset to Draft** (if no lock date or payment blocks it) or a credit note.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Issue a credit note for returned goods",
  "intro": "Contoso returns **2 damaged cartridges**. Posted invoices are never edited or deleted: you credit them.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The credit note reverses 2 cartridges plus GST. Because the invoice was already paid, it stays as an **outstanding credit** for Contoso: use it on the next invoice or refund it.",
  "steps": [
    {
      "src": "/visuals/odoo-accounting/sims/acc-credit-note-01.webp",
      "alt": "Posted and paid invoice with the Credit Note button.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "Two cartridges from INV/26-27/0003 arrived damaged. **Start a credit note.**",
      "target": {
        "x": 17.35,
        "y": 12.15,
        "w": 7.1,
        "h": 4.2,
        "label": "Credit Note"
      },
      "traps": [
        {
          "x": 30.95,
          "y": 12.15,
          "w": 8.1,
          "h": 4.2,
          "feedback": "**Reset to Draft** rewrites history on a paid invoice. Use a credit note."
        }
      ],
      "explain": "The reversal dialog opens."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-credit-note-02.webp",
      "alt": "Credit note dialog with the Reason field.",
      "path": "Credit Note",
      "task": "Record why: type **Damaged goods** as the reason.",
      "target": {
        "x": 28.45,
        "y": 40.55,
        "w": 54.7,
        "h": 3.2,
        "label": "Reason"
      },
      "input": {
        "label": "Reason",
        "answer": "Damaged goods",
        "placeholder": "why the invoice is credited"
      },
      "explain": "The reason is printed on the credit note and kept for audit."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-credit-note-03.webp",
      "alt": "Credit note dialog with reason Damaged goods and the Reverse button.",
      "path": "Credit Note",
      "task": "**Create the credit note.**",
      "target": {
        "x": 16.85,
        "y": 62.95,
        "w": 5.4,
        "h": 4.2,
        "label": "Reverse"
      },
      "traps": [
        {
          "x": 22.35,
          "y": 62.95,
          "w": 13.9,
          "h": 4.2,
          "feedback": "That also creates a **new invoice** (for re-invoicing a corrected amount). Contoso only returns goods."
        }
      ],
      "explain": "A draft credit note opens, copying the invoice line (10 cartridges)."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-credit-note-04.webp",
      "alt": "Draft credit note copied from the invoice with quantity 10.",
      "path": "Accounting ▸ Customers ▸ Credit Notes",
      "task": "Only **2** cartridges are credited. Set the quantity.",
      "target": {
        "x": 21.95,
        "y": 63.25,
        "w": 7.6,
        "h": 7,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Quantity",
        "answer": "2",
        "placeholder": "units"
      },
      "explain": "The credit note now covers 2 cartridges plus GST."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-credit-note-05.webp",
      "alt": "Draft credit note for 2 cartridges with the Confirm button.",
      "path": "Accounting ▸ Customers ▸ Credit Notes",
      "task": "**Post the credit note.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.85,
        "w": 5.6,
        "h": 4.2,
        "label": "Confirm"
      },
      "explain": "Posting reverses revenue and GST for 2 cartridges: debit Sales and GST, credit Receivable."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-credit-note-06.webp",
      "alt": "Posted credit note for Contoso Ltd.",
      "path": "Accounting ▸ Customers ▸ Credit Notes",
      "task": "The credit note is posted.",
      "explain": "Contoso now has an outstanding credit you can apply to the next invoice or refund."
    }
  ]
}
\`\`\`

### 8.3 Vendor bill

Path: **Accounting ▸ Vendors ▸ Bills ▸ New**, or from the purchase order (**Create Bill**).

1. Vendor: Paper Mills Inc. Bill Reference: PM-7781 (Odoo warns on duplicate references).
2. Bill Date: 5 March. Use **Auto-Complete** to load the PO lines (purchase order link) or let the PO create it.
3. 300 × 4.00 = 1,200.00 + Purchase Tax 8% 96.00 = **1,296.00**.
4. **Confirm**.

### 8.4 Payments

From the posted invoice click **Register Payment**: journal First City Bank, amount 842.40, date 25 March ▸ **Create Payment**. The invoice shows **In Payment** until the payment is matched with a bank statement line, then **Paid** (behaviour depends on outstanding-account configuration — verify in your training instance).

**Outstanding payments:** if Contoso pays 1,000.00 before an invoice exists (via Accounting ▸ Customers ▸ Payments ▸ New), the amount becomes an **outstanding credit**. When the next invoice is posted, a banner "You have outstanding credits for this customer" offers **Add** to reconcile it.

**Partial payment:** registering 500.00 against 842.40 leaves the invoice **Partially Paid** with 342.40 due (or choose "Mark as fully paid" and write off the difference to an account).

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Record a partial payment",
  "intro": "Greenfield School paid **₹200** of invoice INV/26-27/0002 (₹409.50). The rest comes next month.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The invoice is **Partially Paid** with ₹209.50 still due; it stays in the aged receivable until the rest arrives.",
  "steps": [
    {
      "src": "/visuals/odoo-accounting/sims/acc-partial-payment-01.webp",
      "alt": "Posted invoice INV/26-27/0002 for Greenfield with the Pay button.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "**Record the payment.**",
      "target": {
        "x": 8.75,
        "y": 12.15,
        "w": 3.6,
        "h": 4.2,
        "label": "Pay"
      },
      "explain": "The payment dialog proposes the full ₹409.50."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-partial-payment-02.webp",
      "alt": "Payment dialog with the amount 409.50.",
      "path": "Pay",
      "task": "Only **200** was received. Change the amount.",
      "target": {
        "x": 58.15,
        "y": 45.15,
        "w": 8.2,
        "h": 3.2,
        "label": "Amount"
      },
      "input": {
        "label": "Amount received",
        "answer": "200",
        "placeholder": "₹"
      },
      "explain": "Odoo shows the payment difference: keep it open (the default) or write it off."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-partial-payment-03.webp",
      "alt": "Payment dialog with 200 and the Payment Difference set to keep open.",
      "path": "Pay",
      "task": "Keep the rest open. **Create the payment.**",
      "target": {
        "x": 16.85,
        "y": 67.45,
        "w": 9,
        "h": 4.2,
        "label": "Create Payment"
      },
      "explain": "₹200 is recorded against the invoice."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-partial-payment-04.webp",
      "alt": "Invoice with the Partial status and the remaining amount due.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "The invoice is partially paid.",
      "explain": "Amount Due shows ₹209.50; follow-up reminders use this balance."
    }
  ]
}
\`\`\`

### 8.5 Bank statements and reconciliation

Bank statement lines can be imported (CSV, OFX, CAMT depending on modules), synchronised (Enterprise), or created manually.

1. Import statement for March: line "CONTOSO LTD INV/2025/00045 842.40".
2. On import: Dr Bank 842.40 / Cr **Bank Suspense Account** 842.40.
3. Open the bank reconciliation (Enterprise widget from the bank journal card on the Accounting dashboard).
4. Odoo proposes the matching payment or open invoice; validate. The suspense line is replaced by Outstanding Receipts (if a payment exists) or Accounts Receivable (if matching the invoice directly).

**Reconciliation models** (Accounting ▸ Configuration ▸ Reconciliation Models — location may vary, verify) automate common cases:

| Model type | Northwind example |
|---|---|
| Button to generate counterpart entry | "Bank fees" ▸ 100% to Bank Charges |
| Rule to suggest counterpart entry | Label contains "FEE" ▸ Bank Charges |
| Rule to match invoices/bills | Match by partner and amount, with tolerance |

### 8.6 Miscellaneous entries

Accruals, reclassifications and depreciation (without the Assets app) are posted via **Accounting ▸ Accounting ▸ Journal Entries ▸ New** in the Miscellaneous journal. Example accrual on 31 March: Dr Electricity Expense 1,500 / Cr Accrued Expenses 1,500, with **Auto-reverse** on 1 April if available (verify; in Odoo 17 use the Reverse action with a date).

### 8.7 Paying vendors

1. Go to **Accounting ▸ Vendors ▸ Bills**, filter on due date (e.g. due before 31 March).
2. Select several posted bills and use **Actions ▸ Register Payment** (or the button in the list header) to pay them in one step; Odoo can group payments per vendor (verify the option label in your training instance).
3. Choose the bank journal and payment method (manual, check, or batch/SEPA methods depending on installed modules and edition).
4. Payment entries post Dr Accounts Payable / Cr Outstanding Payments; the bank statement debit later clears Outstanding Payments.

| Document state | Meaning |
|---|---|
| Draft | Editable, no accounting impact |
| Posted | Entry in the ledger, numbered |
| In Payment | Payment registered, not yet matched to the bank |
| Paid | Fully reconciled |
| Partially Paid | Residual amount remains |
| Reversed | Fully cancelled by a credit note / reversal |

> **Consultant tip:** Teach users the difference between "In Payment" and "Paid". Most "Odoo did not record my payment" tickets are simply payments waiting for bank reconciliation.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Pay several vendor bills at once",
  "intro": "Two Paper Mills bills (reference PM-7781) are due. Pay them in one run.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "Both bills are paid in one action: Odoo created one payment per bill (PBNK1/26-27/0003 and 0004, ₹6,300 each). Tick **Group Payments** in the dialog to get a single payment per vendor instead.",
  "steps": [
    {
      "src": "/visuals/odoo-accounting/sims/acc-batch-pay-01.webp",
      "alt": "Vendor bills list filtered on PM-7781 showing two bills.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "**Select all** listed bills.",
      "target": {
        "x": 0.8500000000000001,
        "y": 13.05,
        "w": 1.5,
        "h": 2.1,
        "label": "the select-all checkbox"
      },
      "explain": "Both bills are selected."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-batch-pay-02.webp",
      "alt": "Two selected bills with the Pay button.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "**Pay the selected bills.**",
      "target": {
        "x": 43.55,
        "y": 5.95,
        "w": 3.6,
        "h": 4.2,
        "label": "Pay"
      },
      "explain": "One dialog for all selected bills."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-batch-pay-03.webp",
      "alt": "Batch payment dialog for two bills with Group payments.",
      "path": "Pay",
      "task": "Bank journal and date are right. **Create the payments.**",
      "target": {
        "x": 16.85,
        "y": 60.05,
        "w": 9.4,
        "h": 4.2,
        "label": "Create Payment"
      },
      "explain": "Odoo posts the payments and matches each bill."
    },
    {
      "src": "/visuals/odoo-accounting/sims/acc-batch-pay-04.webp",
      "alt": "Payments list with two ₹6,300 payments to Paper Mills Inc, both Paid.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "Odoo opens the two payments it created.",
      "explain": "Two payments of ₹6,300, both **Paid**. In real life you would first resolve the duplicate PM-7781 reference before paying twice!"
    }
  ]
}
\`\`\`

## Key takeaways

- Invoices and bills are drafts until **Confirm**; posting assigns the number.
- Corrections are made via credit notes or reset to draft, never deletion of posted entries.
- Payments land in Outstanding Receipts/Payments; bank reconciliation clears them.
- Imported statement lines use the Bank Suspense Account until reconciled.
- Reconciliation models remove repetitive matching work.`,
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3: Controls, Reporting and Integration",
      lessons: [
        {
          slug: "accounting-controls-reports-integration",
          title: "Approvals, Lock Dates, Analytics, Reports, Journal Entries and Integration",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "enterprise", "configuration", "customization"],
          body: `## 9. Approval rules and automation

| Control | Mechanism | Scope |
|---|---|---|
| Who can post invoices/bills | Access rights: Accounting *Billing*, *Accountant*/*Advisor* roles (names vary by edition — verify) | Standard |
| Purchase spending approval | Purchase ▸ Settings ▸ Purchase Order Approval (bills then follow approved POs) | Standard (Purchase) |
| Bill matches order | Purchase "Bill Control": Ordered vs Received quantities | Standard |
| Vendor bill approval workflow (e.g. > USD 5,000 needs CFO) | Approvals app / Studio / custom module | Enterprise / customization |
| Period closing | Lock dates | Standard / Enterprise UI |
| Payment reminders | Follow-up levels | Enterprise |
| Bank matching | Reconciliation models | Configuration (widget Enterprise) |
| Recurring tasks | Automated actions / scheduled actions | Configuration / Studio |

### Lock dates

In Odoo 17 lock dates are set from **Accounting ▸ Accounting ▸ Lock Dates** (Enterprise) or in settings (verify in your training instance):

- **Lock date for non-advisers**: regular users cannot post before it.
- **Lock date for all users**: nobody can post before it (hard close).
- **Tax lock date**: no changes affecting taxes before it (after filing a return).

Odoo 18 restructures lock dates (e.g. sales, purchase and hard lock dates) — verify.

### Analytic accounting (analytic plans)

Enable **Analytic Accounting** in settings, then **Accounting ▸ Configuration ▸ Analytic Plans** (path may vary — verify). Northwind plans:

| Plan | Analytic accounts |
|---|---|
| Department | Sales, Warehouse, Admin |
| Region | North, South |

On invoice and bill lines, the **Analytic Distribution** field allocates percentages (e.g. Warehouse 70% / Admin 30%). **Analytic distribution models** pre-fill distributions by product, partner or account.

## 10. Reports and dashboards

| Report | Path | Edition |
|---|---|---|
| Accounting Dashboard (journal cards) | Accounting ▸ Dashboard | Standard |
| Invoice Analysis | Accounting ▸ Reporting ▸ Invoice Analysis (name may vary) | Standard |
| Balance Sheet | Accounting ▸ Reporting ▸ Balance Sheet | Enterprise |
| Profit and Loss | Accounting ▸ Reporting ▸ Profit and Loss | Enterprise |
| General Ledger | Accounting ▸ Reporting ▸ General Ledger | Enterprise |
| Trial Balance | Accounting ▸ Reporting ▸ Trial Balance | Enterprise |
| Aged Receivable / Aged Payable | Accounting ▸ Reporting ▸ Aged Receivable / Aged Payable | Enterprise |
| Partner Ledger | Accounting ▸ Reporting ▸ Partner Ledger | Enterprise |
| Tax Report (Tax Return) | Accounting ▸ Reporting ▸ Tax Return (name may vary) | Enterprise |

In Community, journal items can still be analysed with list, pivot and group-by views (e.g. group by account) — verify menus in your training instance.

## 11. Accounting impact (journal entries)

**Customer invoice INV/2025/00045**

| Account | Debit | Credit |
|---|---|---|
| Accounts Receivable (Contoso) | 842.40 | |
| Product Sales | | 780.00 |
| Tax Payable (Sales Tax 8%) | | 62.40 |

**Payment registered (outstanding accounts configured)**

| Account | Debit | Credit |
|---|---|---|
| Outstanding Receipts | 842.40 | |
| Accounts Receivable | | 842.40 |

**Bank statement line reconciled**

| Account | Debit | Credit |
|---|---|---|
| First City Bank | 842.40 | |
| Outstanding Receipts (replacing Bank Suspense) | | 842.40 |

**Vendor bill PM-7781 (stockable products, automated valuation)**

| Account | Debit | Credit |
|---|---|---|
| Stock Interim (Received) | 1,200.00 | |
| Tax Receivable (Purchase Tax 8%) | 96.00 | |
| Accounts Payable | | 1,296.00 |

For a service bill (e.g. electricity), the debit goes to the expense account instead of stock interim.

**Credit note (20 reams)**

| Account | Debit | Credit |
|---|---|---|
| Product Sales | 130.00 | |
| Tax Payable | 10.40 | |
| Accounts Receivable | | 140.40 |

**Exchange loss on EUR bill** — Dr Accounts Payable 1,100 + Dr Exchange Loss 20 / Cr Outstanding Payments 1,120.

## 12. Integration with other apps

| App | Integration |
|---|---|
| Sales | Invoicing policy (ordered/delivered); down payments; invoice status on SO |
| Purchase | Bill control; 3-way match (PO, receipt, bill) |
| Inventory | Automated valuation entries; COGS on invoice (Anglo-Saxon); landed costs |
| POS | Session closing posts sales and payments by method |
| Expenses | Expense reports become bills/misc entries |
| Website / eCommerce | Online payments create payments via payment providers |

> **Consultant tip:** When a client asks for an approval workflow, first ask *what risk* they control. Often Purchase Order Approval plus bill control on received quantities removes the need for a custom bill approval.

#### In Odoo 20: The journal entry behind an invoice

\`\`\`visual-screen
{
  "src": "/visuals/odoo-accounting/screens/acc-invoice-journal.webp",
  "alt": "Odoo 20 Journal Items tab of invoice INV/26-27/0003 for Contoso with the receivable, sales and CGST/SGST lines.",
  "title": "The journal entry behind an invoice",
  "path": "Customer invoice ▸ Journal Items",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 14.6,
      "y": 51.2,
      "w": 8.7,
      "h": 4.9,
      "tag": "bottom",
      "title": "Journal Items tab",
      "text": "Every posted invoice is a balanced journal entry; this tab shows it."
    },
    {
      "x": 31.9,
      "y": 67.7,
      "w": 58.7,
      "h": 25.7,
      "tag": "top",
      "title": "Debits = credits",
      "text": "Debit the customer receivable ₹934.50; credit sales ₹890 and CGST/SGST ₹22.25 each."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

## Key takeaways

- Odoo relies on access rights, upstream approvals and lock dates more than on invoice-level approvals.
- Analytic plans give multi-dimensional reporting without extra GL accounts.
- Full financial reports are Enterprise; Community relies on analysis views.
- Learn the entries for invoice, payment, bank, bill and credit note by heart.`,
          resources: [
            { title: "Odoo 17 Accounting documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting.html" },
          ],
        },
        {
          slug: "accounting-troubleshooting-and-interview",
          title: "Troubleshooting, Practical Assignments and Interview Questions",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "customization"],
          body: `## 13. Common errors and troubleshooting

| Symptom / error | Likely cause | Fix |
|---|---|---|
| "You cannot add/modify entries prior to and inclusive of the lock date" | Posting date before a lock date | Use a date after the lock, or an adviser adjusts the lock date with approval |
| Invoice stays "In Payment" | Payment not yet reconciled with a bank statement line | Import/enter the statement and reconcile |
| Tax amount differs by a cent | Rounding method (per line vs globally) | Settings ▸ Taxes ▸ Rounding Method — agree with the tax advisor |
| Wrong tax on foreign customer | Fiscal position missing or not auto-detected | Set fiscal position on the partner or configure auto-detection |
| Cannot reconcile account | Account does not have **Allow Reconciliation** | Enable on the account (only where appropriate) |
| Trial balance does not tie to legacy | Opening suspense not cleared or wrong date | Review suspense balance and opening entry dates |
| Duplicate vendor bill warning | Same vendor reference used | Verify — it may be a genuine duplicate |
| Bank journal balance ≠ bank statement | Unreconciled or missing statement lines | Reconcile; check suspense account balance |
| Exchange difference not posted | Currency rates missing for the date | Maintain rates; check the exchange difference journal in settings |
| Reports menu missing | Community edition | Enterprise needed, or use journal item analysis |

\`\`\`visual-match
{
  "title": "Symptom to cause",
  "prompt": "Match each symptom to its most likely cause.",
  "pairs": [
    { "left": "Cannot post: entries prior to the lock date", "right": "Posting date falls before a lock date" },
    { "left": "Invoice stays In Payment", "right": "Payment not reconciled with a bank statement line" },
    { "left": "Tax differs by a cent", "right": "Rounding method per line vs globally" },
    { "left": "Wrong tax on a foreign customer", "right": "Fiscal position missing or not auto-detected" },
    { "left": "Trial balance does not tie to legacy", "right": "Opening suspense not cleared or wrong date" },
    { "left": "Exchange difference not posted", "right": "Currency rates missing for the date" }
  ],
  "explanation": "Most of these are configuration or master data, not bugs. Find the cause first: fixing the symptom (for example editing a tax on a line) repeats the problem on the next document."
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Invoice paid but still In Payment, or bank does not match",
  "start": "registered",
  "nodes": {
    "registered": { "question": "Was the payment registered in Odoo?", "options": [ { "label": "Yes", "next": "line" }, { "label": "No", "next": "register" } ] },
    "register": { "result": "Register the payment, then reconcile", "tone": "warning", "detail": "Without a payment the invoice stays Not Paid; the customer's money is not linked to anything." },
    "line": { "question": "Is the bank statement line imported or entered?", "options": [ { "label": "Yes", "next": "reco" }, { "label": "No", "next": "import" } ] },
    "import": { "result": "Import or enter the statement", "tone": "warning", "detail": "Odoo waits for the bank to confirm the money arrived; until then the amount sits in outstanding receipts." },
    "reco": { "question": "Is the statement line reconciled with the payment?", "options": [ { "label": "Yes", "next": "suspense" }, { "label": "No", "next": "doreco" } ] },
    "doreco": { "result": "Reconcile the line: the invoice becomes Paid", "tone": "success", "detail": "Reconciliation moves the amount from outstanding receipts to the bank account, so the bank GL equals the real statement." },
    "suspense": { "result": "Check the suspense account balance", "tone": "info", "detail": "If the bank journal still differs from the statement, look for lines reconciled to suspense or missing statement lines." }
  }
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Tax on an invoice looks wrong",
  "start": "size",
  "nodes": {
    "size": { "question": "How big is the difference?", "options": [ { "label": "One cent", "next": "rounding" }, { "label": "Wrong tax or rate", "next": "foreign" } ] },
    "rounding": { "result": "Review the rounding method", "tone": "info", "detail": "Settings ▸ Taxes ▸ Rounding Method (per line vs globally). Agree the method with the tax advisor, because it changes every invoice." },
    "foreign": { "question": "Is the customer foreign, tax-exempt or in another state?", "options": [ { "label": "Yes", "next": "fp" }, { "label": "No", "next": "product" } ] },
    "fp": { "result": "Fix the fiscal position", "tone": "warning", "detail": "Set it on the partner or configure auto-detection by country/state. The fiscal position maps the tax, so fixing it fixes all future invoices." },
    "product": { "result": "Check the product default taxes", "tone": "warning", "detail": "The line tax comes from the product. Correct the product, not the line, so the next invoice is right too." }
  }
}
\`\`\`

## 14. Practical assignments (task list)

Complete in your training instance with Northwind data:

- [ ] Confirm the fiscal localization; review the chart of accounts and add a "Bank Charges" expense account.
- [ ] Create journals: First City Bank (Bank), Petty Cash (Cash).
- [ ] Create Sales Tax 8% excluded and a price-included variant; test both on invoices.
- [ ] Create payment terms 30 Days and 50% Advance / 50% in 30 Days.
- [ ] Create fiscal positions Tax Exempt and Export; assign to two customers.
- [ ] Post the opening balance entry and import open AR/AP; prove suspense = 0.
- [ ] Post an invoice, partial payment, full payment and credit note for Contoso.
- [ ] Post a EUR vendor bill and pay it at a different rate; find the exchange entry.
- [ ] Import a bank statement and reconcile all lines; create a bank-fee reconciliation model.
- [ ] Configure Department analytic plan and allocate a bill 70/30.
- [ ] Set a lock date for non-advisers at month end and test posting before it.
- [ ] Run Trial Balance, P&L, Balance Sheet and Aged Receivable (Enterprise) and explain them.

## 15. Interview questions with model answers

**Q1. Difference between Invoicing and Accounting apps?**
*Model answer:* Invoicing (Community) handles invoices, bills, payments, taxes and basic analysis. Accounting (Enterprise) adds full financial reports, bank reconciliation widget and synchronisation, assets, budgets, follow-ups and more — I always verify the exact list for the version.

**Q2. What does a fiscal position do?**
*Model answer:* It maps taxes and accounts for specific partners or countries — e.g. 8% sales tax to 0% export — and can be auto-detected by country/state.

**Q3. Explain tax included vs excluded.**
*Model answer:* With included, the price contains the tax and Odoo extracts it (108 ⇒ 100 + 8); with excluded, tax is added on top (108 ⇒ 108 + 8.64).

**Q4. Why does Odoo use outstanding receipts and suspense accounts?**
*Model answer:* To separate registering a payment from confirming it reached the bank. The bank account only reflects reconciled statement lines, so the bank GL equals the real statement.

**Q5. How do you load opening balances?**
*Model answer:* Post a balance-sheet opening entry dated the day before go-live; import open invoices and bills individually; route AR/AP totals and imported items through a suspense account that nets to zero; reconcile stock with Inventory valuation.

**Q6. What is a lock date used for?**
*Model answer:* To prevent changes to closed periods; non-adviser, all-users and tax lock dates in 17.

**Q7. How do analytic plans differ from accounts?**
*Model answer:* GL accounts answer "what" (nature of cost); analytic accounts answer "for whom/where" (department, project). Odoo 17 allows several plans and percentage distributions on lines.

**Q8. A customer paid before receiving an invoice. How is it handled?**
*Model answer:* Register the payment without an invoice; it becomes an outstanding credit and is added to the invoice once posted.

**Q9. Client wants every vendor bill above USD 5,000 approved by the CFO. Standard?**
*Model answer:* Not as a native bill workflow. Options: purchase order approval upstream (standard), Approvals app/Studio (Enterprise), or a custom module. I classify it and estimate accordingly.

**Q10. How do you explain the entries for a stock sale with automated valuation?**
*Model answer:* Delivery: Dr Stock Output / Cr Stock Valuation. Invoice: Dr AR / Cr Sales / Cr Tax and Dr COGS / Cr Stock Output.

\`\`\`visual-roleplay
{
  "title": "Month-end call with the Northwind CFO",
  "setting": "Day 2 of month-end close at Northwind. The CFO calls you, the Odoo consultant, with problems.",
  "client": "CFO",
  "rounds": [
    { "says": "My accountant cannot post a missed bill into last month. Odoo says something about a lock date. Can you remove it?",
      "options": [
        { "text": "Sure, I will delete the lock date now.", "quality": "poor", "feedback": "The lock date protects a closed period. Removing it without approval lets anyone change numbers already reported." },
        { "text": "The lock date is doing its job. Either post it in the current period, or an adviser moves the lock date with your approval and we lock again after.", "quality": "best", "feedback": "Explains why it blocks, gives both options and keeps control with the CFO." },
        { "text": "Post it with today's date and ignore it.", "quality": "ok", "feedback": "Valid option, but the CFO should decide knowingly, since it changes which period carries the cost." }
      ] },
    { "says": "Several invoices the customers already paid still show In Payment. Is Odoo broken?",
      "options": [
        { "text": "Yes, I will raise a ticket with Odoo.", "quality": "poor", "feedback": "This is standard behaviour, not a bug: a support ticket wastes time and credibility." },
        { "text": "No. In Payment means the payment is registered but not yet matched with a bank statement line. Once we reconcile, they turn Paid.", "quality": "best", "feedback": "Explains the outstanding-receipts mechanism and the action that resolves it." }
      ] },
    { "says": "The trial balance does not tie to our old system. Which one is wrong?",
      "options": [
        { "text": "Let me check the opening suspense balance and the opening entry dates first; if suspense is not zero, something was not loaded.", "quality": "best", "feedback": "Suspense must net to zero after opening balances; a balance there points straight to the gap." },
        { "text": "The old system is probably wrong.", "quality": "poor", "feedback": "A guess with no evidence; the CFO needs a reconciliation, not an opinion." },
        { "text": "Let's post a correcting entry for the difference.", "quality": "poor", "feedback": "Plugging the difference hides the real cause and will surface again at audit." }
      ] },
    { "says": "I want every vendor bill above ₹5,00,000 approved by me. Is that standard?",
      "options": [
        { "text": "Yes, just tick a box.", "quality": "poor", "feedback": "Not a native bill workflow; overpromising creates a gap later." },
        { "text": "Not as a native bill workflow. Options are purchase order approval upstream, Approvals or Studio in Enterprise, or a custom module. I will classify and estimate.", "quality": "best", "feedback": "Honest about standard, offers options and sets up a scoped estimate." }
      ] }
  ],
  "wrapup": "A strong answer always has three parts: the business reason, the Odoo mechanism and, where relevant, the journal entry."
}
\`\`\`

> **Consultant tip:** Bring a one-page "entry cheat sheet" to every finance workshop. Finance users trust consultants who can predict the journal entry before clicking Confirm.

## Key takeaways

- Most accounting tickets come from lock dates, unreconciled payments, taxes and fiscal positions.
- Practise opening balances until suspense always returns to zero.
- Interview answers: business reason + Odoo mechanism + journal entry.`,
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "India Localization: GST, E-Invoicing & Compliance",
      lessons: [
        {
          slug: "india-gst-fundamentals",
          title: "Indian GST Fundamentals for ERP Consultants",
          durationMin: 50,
          odooVersions: "Odoo 17.0 (18.0 differences noted)",
          scope: ["standard", "configuration"],
          body: `> **Compliance disclaimer:** Indian GST rules, thresholds, rates and the e-invoice schema change through CBIC/GSTN notifications and GST Council decisions. Always verify against the current CBIC/GSTN notifications and the Odoo documentation for your version. Training uses **sandbox environments only** — never enter real GSTINs or production IRP credentials in a training database. All GSTINs in this module are **fictional** and only follow the format.

## 1. Business context

For this module, Northwind Office Supplies Pvt Ltd operates from **Mumbai, Maharashtra (state code 27)** and invoices in **INR**. It sells office furniture and stationery to companies across India and buys from manufacturers in Maharashtra and Gujarat. Before touching Odoo, a consultant must be able to explain *why* the same chair carries different taxes on two invoices.

GST (Goods and Services Tax) is a destination-based tax on supply. It replaced excise, service tax, VAT and several state levies. There are three main components:

| Component | Levied by | When it applies |
|---|---|---|
| CGST (Central GST) | Centre | Intra-state supply (together with SGST/UTGST) |
| SGST / UTGST (State / Union Territory GST) | State or UT | Intra-state supply (together with CGST) |
| IGST (Integrated GST) | Centre (shared with destination state) | Inter-state supply, imports, exports and supplies to SEZ |

\`\`\`visual-compare
{
  "title": "CGST + SGST vs CGST + UTGST vs IGST",
  "columns": ["CGST + SGST", "CGST + UTGST", "IGST"],
  "rows": [
    { "label": "Type of supply", "values": ["Intra-state: supplier and place of supply in the same state", "Intra-UT: supplier and place of supply in the same Union Territory without its own legislature (e.g. Chandigarh)", "Inter-state, imports, exports and supplies to SEZ"] },
    { "label": "Who collects", "values": ["Centre (CGST) and the state (SGST)", "Centre (CGST) and the UT administration (UTGST)", "Centre, then shared with the destination state"] },
    { "label": "Rate split (assumed 18%)", "values": ["9% + 9%", "9% + 9%", "18% as one tax"] },
    { "label": "Northwind example", "values": ["Chairs delivered to Pune (Maharashtra)", "Not applicable to Mumbai sales: Northwind is registered in a state", "Chairs delivered to Bengaluru (Karnataka)"] },
    { "label": "Customer pays more?", "values": ["No: same total", "No: same total", "No: same total"] },
    { "label": "Odoo tax shape", "values": ["Tax group of two taxes", "Tax group of two taxes", "Single tax"] }
  ],
  "highlight": 2,
  "caption": "The total tax is the same; what changes is which government receives it. That is why the place of supply must be right on every invoice: a wrong split means tax paid to the wrong government, which cannot simply be offset later."
}
\`\`\`

## 2. GSTIN structure

Every registered person gets a **15-character GSTIN** per state of registration.

| Position | Example (fictional 27ABCDE1234F1Z5) | Meaning |
|---|---|---|
| 1–2 | 27 | State code (27 = Maharashtra, 29 = Karnataka, 24 = Gujarat) |
| 3–12 | ABCDE1234F | PAN of the legal entity |
| 13 | 1 | Entity number for the same PAN within that state (1–9, then A–Z) |
| 14 | Z | "Z" by default |
| 15 | 5 | Checksum character |

A company with branches in three states has **three GSTINs** sharing the same PAN. In ERP terms this often means one Odoo company (or branch) per GSTIN — a design decision to settle early.

\`\`\`visual-match
{
  "title": "Read a GSTIN",
  "prompt": "Match each part of the fictional GSTIN 27ABCDE1234F1Z5 to its meaning.",
  "leftLabel": "Part",
  "rightLabel": "Meaning",
  "pairs": [
    { "left": "27 (positions 1-2)", "right": "State code: Maharashtra, so it must match the company state in Odoo" },
    { "left": "ABCDE1234F (positions 3-12)", "right": "PAN of the legal entity: the same in every state where it registers" },
    { "left": "1 (position 13)", "right": "Entity number for the same PAN within that state" },
    { "left": "Z (position 14)", "right": "Default letter Z" },
    { "left": "5 (position 15)", "right": "Checksum that catches typing errors" }
  ],
  "explanation": "Because the first two digits are the state code, a GSTIN starting with 29 on a partner whose state is Maharashtra is a master-data error you can spot before it produces a wrong tax."
}
\`\`\`

## 3. Place of supply and the tax type

The **place of supply** (POS) decides intra- vs inter-state. For goods it is generally where movement terminates (delivery location); for services the general rule is the recipient's registered location, with many exceptions (immovable property, events, transport — verify for each service).

- Supplier state = place of supply ⇒ **CGST + SGST/UTGST** (rate split equally)
- Supplier state ≠ place of supply ⇒ **IGST** (full rate)

\`\`\`visual-gst
{
  "title": "Try it: Northwind (Mumbai, Maharashtra) invoices a customer",
  "sellerState": "Maharashtra",
  "states": ["Maharashtra", "Karnataka", "Gujarat", "Delhi", "Tamil Nadu", "Telangana", "West Bengal", "Uttar Pradesh", "Goa", "Chandigarh"],
  "amount": 125000,
  "rate": 18,
  "rates": [0, 5, 12, 18, 28],
  "caption": "Start with ₹1,25,000 (50 chairs at ₹2,500) and switch the place of supply between Maharashtra and Karnataka: the total stays ₹1,47,500, only the split changes. Rates are for practice only; always verify the current rate for each HSN/SAC. For a supply inside a Union Territory such as Chandigarh, UTGST replaces SGST."
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Intra-state or inter-state? (Northwind, Maharashtra)",
  "caption": "Simplified from the rules in this lesson. Service place-of-supply rules have many exceptions: verify each service.",
  "start": "export",
  "nodes": {
    "export": { "question": "Is the customer overseas (export) or an SEZ unit/developer?", "options": [ { "label": "Yes", "next": "zero" }, { "label": "No, a domestic customer", "next": "kind" } ] },
    "zero": { "result": "Zero-rated: treated as IGST supply", "tone": "info", "detail": "Exports and SEZ supplies are zero-rated: either under LUT without paying IGST, or with IGST payment and a refund. In Odoo this needs the export/SEZ taxes and the right partner GST treatment, not a normal 18% tax." },
    "kind": { "question": "Is it a supply of goods or of services?", "options": [ { "label": "Goods", "next": "goods" }, { "label": "Services", "next": "special" } ] },
    "goods": { "question": "Where does the movement of goods end (delivery location)?", "options": [ { "label": "In Maharashtra", "next": "intra" }, { "label": "In another state", "next": "inter" } ] },
    "special": { "question": "Is it a special service (immovable property, events, transport)?", "options": [ { "label": "Yes", "next": "verify" }, { "label": "No, a general service", "next": "recipient" } ] },
    "verify": { "result": "Check the specific place-of-supply rule", "tone": "warning", "detail": "These services have their own place-of-supply rules (for example, the location of the property). Do not assume the recipient's state; confirm with the client's tax advisor before configuring." },
    "recipient": { "question": "Where is the recipient's registered location?", "options": [ { "label": "In Maharashtra", "next": "intra" }, { "label": "In another state", "next": "inter" } ] },
    "intra": { "result": "Intra-state: CGST + SGST", "tone": "success", "detail": "Supplier state equals place of supply, so the rate is split equally, e.g. 9% + 9%. Example: chairs delivered to Deccan Traders in Pune." },
    "inter": { "result": "Inter-state: IGST at the full rate", "tone": "success", "detail": "Supplier state differs from the place of supply, so one IGST tax applies, e.g. 18%. Example: chairs delivered to Lalbagh Systems in Bengaluru." }
  }
}
\`\`\`

### HSN and SAC

Goods are classified by **HSN** (Harmonised System of Nomenclature) codes, services by **SAC** (Services Accounting Code). The number of HSN digits required on invoices depends on aggregate turnover (4 or 6 digits under current notifications — verify). The rate follows the HSN/SAC.

### Rate slabs

Historically GST used 0%, 5%, 12%, 18% and 28% (plus compensation cess on some goods). The GST Council rationalised slabs in 2025 towards mainly 5% and 18% with a higher special rate for demerit goods. **Rates change through GST Council notifications — always verify the current rate for each HSN/SAC.** The examples below *assume* 18% purely for arithmetic.

\`\`\`visual-match
{
  "title": "HSN, SAC and what they drive",
  "prompt": "Match each term to what it means for an ERP consultant.",
  "pairs": [
    { "left": "HSN code", "right": "Classifies goods, e.g. chairs and copy paper" },
    { "left": "SAC code", "right": "Classifies services, e.g. chair installation" },
    { "left": "HSN digits on invoices", "right": "Depend on aggregate turnover (4 or 6; verify)" },
    { "left": "GST rate of a product", "right": "Follows its HSN/SAC and changes only by notification" }
  ],
  "explanation": "The rate follows the code, not the product name. Put HSN/SAC on the product master once and every invoice gets the right rate and HSN summary."
}
\`\`\`

## 4. Real-world scenario: Northwind sells chairs (worked example)

Northwind (fictional GSTIN 27ABCDE1234F1Z5) sells 50 ergonomic chairs at ₹2,500 each (taxable value ₹1,25,000, assumed rate 18%).

| Invoice | Customer (fictional) | Customer GSTIN | Place of supply | Tax |
|---|---|---|---|---|
| A | Deccan Traders LLP, Pune | 27PQRSX5678K1Z2 | Maharashtra (27) | CGST 9% ₹11,250 + SGST 9% ₹11,250 |
| B | Lalbagh Systems Pvt Ltd, Bengaluru | 29LMNOP4321Q1Z8 | Karnataka (29) | IGST 18% ₹22,500 |

Both invoices total ₹1,47,500 — the *customer* pays the same, but the tax goes to different governments.

**Invoice A (intra-state, Pune)**

| Account | Debit (₹) | Credit (₹) |
|---|---|---|
| Accounts Receivable — Deccan Traders | 1,47,500 | |
| Sales | | 1,25,000 |
| Output CGST | | 11,250 |
| Output SGST | | 11,250 |

**Invoice B (inter-state, Bengaluru)**

| Account | Debit (₹) | Credit (₹) |
|---|---|---|
| Accounts Receivable — Lalbagh Systems | 1,47,500 | |
| Sales | | 1,25,000 |
| Output IGST | | 22,500 |

### Purchase side and input tax credit (ITC)

Northwind buys stationery from Thane (Maharashtra) worth ₹50,000 and chairs from Ahmedabad (Gujarat, 24) worth ₹80,000, both at an assumed 18%.

| Bill | Account | Debit (₹) | Credit (₹) |
|---|---|---|---|
| Thane vendor (intra-state) | Purchases / Stock interim | 50,000 | |
| | Input CGST | 4,500 | |
| | Input SGST | 4,500 | |
| | Accounts Payable | | 59,000 |
| Ahmedabad vendor (inter-state) | Purchases / Stock interim | 80,000 | |
| | Input IGST | 14,400 | |
| | Accounts Payable | | 94,400 |

**ITC** lets Northwind set off input tax against output tax, subject to conditions (valid tax invoice, goods/services received, supplier has filed and the credit appears in GSTR-2B, tax paid to government, no blocked credit). Simplified monthly set-off:

| Head | Output (₹) | Input (₹) | Net payable (₹) |
|---|---|---|---|
| IGST | 22,500 | 14,400 | 8,100 |
| CGST | 11,250 | 4,500 | 6,750 |
| SGST | 11,250 | 4,500 | 6,750 |
| **Total** | **45,000** | **23,400** | **21,600** |

The legal utilisation order (IGST credit first across heads, CGST credit never against SGST and vice versa) is prescribed by the CGST Act and rules — verify the current order before configuring settlement entries.

## 5. Special situations

| Situation | Rule of thumb (verify) | ERP impact |
|---|---|---|
| Reverse charge (RCM) | For notified supplies (e.g. certain goods transport agency services, legal services, supplies from unregistered persons in notified cases) the **recipient** pays GST | Purchase tax that both credits a payable and debits an input account |
| Composition scheme | Small taxpayers pay a flat rate on turnover, issue a *bill of supply*, cannot charge GST or claim ITC | Partner GST treatment "Composition"; no ITC on purchases from them |
| Unregistered / consumer (B2C) | Tax charged by POS; no GSTIN on invoice | Separate reporting (B2C large/small) in GSTR-1 |
| Export / SEZ | Zero-rated: under **LUT** without paying IGST, or with IGST payment and refund | 0% / export taxes and specific GST treatment |
| Credit / debit notes | Must reference the original invoice; affect the period's return | Odoo credit notes with reason and original reference |

**RCM example:** Northwind pays a goods transport agency ₹10,000 freight (assumed 5% under RCM, intra-state):

| Account | Debit (₹) | Credit (₹) |
|---|---|---|
| Freight Inward | 10,000 | |
| Input CGST (RCM) | 250 | |
| Input SGST (RCM) | 250 | |
| Accounts Payable — Transporter | | 10,000 |
| Output CGST payable (RCM) | | 250 |
| Output SGST payable (RCM) | | 250 |

The vendor is paid only ₹10,000; Northwind pays ₹500 GST in cash and claims it back as ITC.

\`\`\`visual-match
{
  "title": "Supply scenario to tax treatment",
  "prompt": "Northwind is registered in Maharashtra. Match each situation to its GST treatment.",
  "pairs": [
    { "left": "Chairs delivered to Pune", "right": "CGST 9% + SGST 9%" },
    { "left": "Chairs delivered to Bengaluru", "right": "IGST 18%" },
    { "left": "Chairs exported to Dubai under LUT", "right": "Zero-rated without paying IGST" },
    { "left": "Freight from a goods transport agency (RCM)", "right": "Northwind as recipient pays the GST" },
    { "left": "Purchase from a composition dealer", "right": "Bill of supply: no GST charged, no ITC" }
  ],
  "explanation": "Rates assumed at 18%. Each row needs its own tax or partner GST treatment in Odoo, which is why you collect one sample document per type before configuring."
}
\`\`\`

> **Consultant tip:** In discovery workshops, ask for one real sample of each document type: intra-state invoice, inter-state invoice, export invoice, RCM bill, credit note. Map each to a tax and a GST treatment before configuring anything — most GST go-live issues are master-data issues, not software bugs.

## 6. Checklist: information to collect from the client

| # | Item | Why |
|---|---|---|
| 1 | GSTIN(s) per state and registration type | Company/branch design, sequences |
| 2 | Aggregate annual turnover (AATO) | Decides e-invoicing applicability and HSN digits |
| 3 | HSN/SAC list with rates | Product master |
| 4 | Customer and vendor GSTINs and states | Intra/inter-state determination |
| 5 | RCM services used | Purchase taxes |
| 6 | Export/SEZ activity and LUT status | Zero-rated taxes |
| 7 | Return filing responsibility (in-house / CA) | Report and export needs |

\`\`\`visual-check
{
  "question": "Northwind (Maharashtra) sells chairs worth ₹1,25,000 to a Bengaluru customer at an assumed 18%. Which tax lines are correct?",
  "options": ["CGST ₹11,250 + SGST ₹11,250", "IGST ₹22,500", "IGST ₹11,250 + SGST ₹11,250", "No GST because the customer is registered"],
  "correct": 1,
  "explanation": "The place of supply (Karnataka) differs from the supplier state (Maharashtra), so it is inter-state and one IGST tax at the full rate applies. The customer pays the same ₹1,47,500 either way; only the receiving government changes."
}
\`\`\`

\`\`\`visual-check
{
  "question": "Why can Northwind not claim ITC on a purchase bill that is missing from its GSTR-2B?",
  "options": ["ITC is only allowed on inter-state purchases", "A condition for ITC is that the credit appears in GSTR-2B, which needs the supplier to have filed", "The bill must first be paid in cash", "ITC is never allowed on goods"],
  "correct": 1,
  "explanation": "ITC conditions include a valid invoice, receipt of goods or services, the supplier filing so the credit shows in GSTR-2B, and tax paid to the government. Until it appears, the credit is deferred."
}
\`\`\`

## Key takeaways

- GSTIN = state code + PAN + entity number + Z + checksum (15 characters).
- Same state ⇒ CGST + SGST; different state ⇒ IGST. Place of supply decides.
- HSN (goods) and SAC (services) drive the rate — rates change by notification.
- ITC reduces cash tax; conditions include the credit appearing in GSTR-2B.
- RCM, composition, exports/SEZ and credit notes each need specific taxes and partner settings.`,
          flashcards: [
            { term: "GSTIN", definition: "15-character GST identification number: 2-digit state code, 10-character PAN, entity number, 'Z' and a checksum." },
            { term: "IRN", definition: "Invoice Reference Number — a unique hash returned by the Invoice Registration Portal (IRP) when an e-invoice is registered." },
            { term: "HSN / SAC", definition: "Classification codes: HSN for goods, SAC for services; they determine the applicable GST rate." },
            { term: "Place of supply", definition: "Location that determines whether a supply is intra-state (CGST + SGST/UTGST) or inter-state (IGST)." },
            { term: "Input tax credit (ITC)", definition: "GST paid on purchases that can be set off against output GST, subject to conditions such as appearing in GSTR-2B." },
            { term: "E-way bill", definition: "Electronic document generated on the e-way bill portal for movement of goods above the notified value (generally ₹50,000 — verify)." },
          ],
          resources: [
            { title: "Odoo 17 India fiscal localization", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/fiscal_localizations/india.html" },
            { title: "GST portal (official)", kind: "link", url: "https://www.gst.gov.in/" },
          ],
        },
        {
          slug: "india-gst-configuration-odoo",
          title: "Configuring the Odoo India Localization for GST",
          durationMin: 55,
          odooVersions: "Odoo 17.0 (18.0 differences noted)",
          scope: ["standard", "configuration"],
          body: `> **Compliance disclaimer:** GST rules, rates and document requirements change through CBIC/GSTN notifications. Always verify against current notifications and the Odoo documentation for your version. Use a **training/sandbox database only** — never real GSTINs or production credentials. All GSTINs here are fictional.

## 1. Business context

Northwind's finance head wants every invoice to show the correct CGST/SGST or IGST automatically, with the HSN code printed, without the billing clerk choosing taxes manually. In Odoo this is achieved by combining the **India fiscal localization**, correct **company and partner master data**, **product HSN/SAC codes** and **fiscal positions**.

\`\`\`visual-flow
{
  "title": "GST configuration path in Odoo",
  "caption": "Each step feeds the next: the tax on an invoice line is only as good as the company state, partner state and product HSN behind it. Verify labels in your training instance.",
  "steps": [
    { "title": "India fiscal localization", "icon": "globe", "odoo": "Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization", "detail": "l10n_in brings the Indian chart of accounts, GST taxes, tax groups and fiscal positions." },
    { "title": "Company master data", "icon": "building", "detail": "State Maharashtra, GSTIN 27ABCDE1234F1Z5, full address with PIN. The company state is the reference for intra vs inter-state." },
    { "title": "Partner GST treatment and state", "icon": "users", "detail": "Each customer and vendor gets a GST Treatment and a state, compared with the company state." },
    { "title": "Product HSN/SAC and taxes", "icon": "tag", "detail": "HSN/SAC code and default customer/vendor taxes, e.g. GST 18%." },
    { "title": "Fiscal positions", "icon": "workflow", "detail": "Inter-state fiscal position maps the intra-state GST group to IGST when the partner state differs." },
    { "title": "Journals and sequences", "icon": "list", "detail": "Invoice numbers of at most 16 characters, unique per financial year." },
    { "title": "Test invoices", "icon": "check", "detail": "One draft invoice per customer type; compare tax lines and journal items." }
  ]
}
\`\`\`

## 2. Installing the India fiscal localization

The India localization (technical name **l10n_in**) is part of standard Odoo (Community and Enterprise). As in Lesson 2, select it at **Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization** — normally it is installed automatically when the company country is India on database creation (verify in your training instance). It provides:

| Component | What you get (verify exact names per version) |
|---|---|
| Chart of accounts | Indian chart with GST input/output accounts per component |
| Taxes | GST sales and purchase taxes by rate, split into CGST/SGST tax groups, IGST taxes, exempt/nil-rated/zero-rated taxes and RCM variants |
| Tax groups | CGST, SGST, IGST, CESS — shown separately on invoice totals |
| Fiscal positions | Inter-state mapping (intra-state taxes ▸ IGST) and export/SEZ mappings |
| Reports | GST-related reports (scope differs by version and edition — see Lesson 4) |

A typical intra-state "GST 18%" tax is a **group of taxes** (CGST 9% + SGST 9%); "IGST 18%" is a single tax. Open **Accounting ▸ Configuration ▸ Taxes** and filter by "18" to see both.

> In Odoo 18 the tax and fiscal position data for India was reorganised (for example automatic intra/inter-state detection based on the company and partner states) — verify behaviour in an 18.0 instance before reusing 17.0 configuration notes.

\`\`\`visual-match
{
  "title": "Odoo setting to purpose",
  "prompt": "Match each Odoo setting to why it matters for GST.",
  "pairs": [
    { "left": "Company state", "right": "Reference compared with the partner state" },
    { "left": "Partner GST Treatment", "right": "Classifies B2B, B2C, export or SEZ for taxes and returns" },
    { "left": "Product HSN/SAC Code", "right": "Drives the rate and is printed on the invoice" },
    { "left": "Inter-state fiscal position", "right": "Maps CGST + SGST taxes to IGST" },
    { "left": "Tax groups CGST, SGST, IGST, CESS", "right": "Show each component separately on invoice totals" },
    { "left": "Sales journal sequence", "right": "Keeps invoice numbers within 16 characters" }
  ],
  "explanation": "None of these is optional: if one is wrong, the tax on the invoice is wrong and GSTR-1 repeats the error every month."
}
\`\`\`

## 3. Company setup

| Field | Northwind value (fictional) | Notes |
|---|---|---|
| Country | India | Drives the localization |
| State | Maharashtra | **Critical** — compared with partner state |
| GSTIN (Tax ID) | 27ABCDE1234F1Z5 | Must start with the state code |
| Address / city / PIN code | Andheri East, Mumbai, 400069 | Required by e-invoice and e-way bill |
| Currency | INR | |

Odoo may validate GSTIN format/checksum (VAT verification); fictional numbers might fail validation. In e-invoice sandbox testing use the test GSTINs issued by the sandbox portal (verify).

## 4. Partner setup: GST treatment

On the contact, the India localization adds a **GST Treatment** field (verify exact labels per version). Typical values:

| GST Treatment | Use for | Effect |
|---|---|---|
| Registered Business - Regular | Normal GST-registered customers/vendors | B2B, e-invoice eligible |
| Registered Business - Composition | Composition dealers | No ITC on their bills of supply |
| Unregistered Business | Businesses without GSTIN | Treated as B2C/unregistered in returns |
| Consumer | Individuals | B2C |
| Overseas | Foreign customers/vendors | Export/import taxes |
| Special Economic Zone | SEZ units/developers | Zero-rated supply |
| Deemed Export | Notified deemed exports | Specific treatment |
| UIN Holders | Embassies/UN bodies (appears in some versions — verify) | Specific treatment |

The **partner state** plus the company state determine intra- vs inter-state. With the inter-state fiscal position set to detect automatically (by country India and state ≠ company state — check the fiscal position's auto-detection settings in your training instance), Odoo maps GST 18% to IGST 18% for Lalbagh Systems (Karnataka) but keeps CGST+SGST for Deccan Traders (Maharashtra).

## 5. Products: HSN/SAC and taxes

On the product form (Accounting/General tab — verify location), fill the **HSN/SAC Code** and default customer/vendor taxes. Northwind sample:

| Product | Type | HSN/SAC | Customer tax | Vendor tax |
|---|---|---|---|---|
| Ergonomic chair | Goods | 9401 (illustrative — verify) | GST 18% | GST 18% |
| A4 copy paper | Goods | 4802 (illustrative — verify) | Per current rate | Per current rate |
| Installation service | Service | 9987 (illustrative SAC — verify) | GST 18% | — |

Also map **units of measure** to GST UQC codes (e.g. NOS, BOX, KGS) where the localization provides the field (verify) — the e-invoice schema rejects unknown units.

### Tax-included vs tax-excluded pricing

Most B2B price lists in India are tax-excluded. For retail (MRP-based) pricing, use price-included taxes. Example: ₹1,180 tax-included at 18% ⇒ base ₹1,000, GST ₹180; tax-excluded ⇒ base ₹1,180, GST ₹212.40, total ₹1,392.40.

## 6. Journals and document sequences

GST rules require a consecutive invoice serial number, unique per financial year, **not exceeding 16 characters** (letters, digits, hyphen and slash) — verify the current rule. Review the sales journal sequence: "INV/25-26/00001" (15 characters) complies; a long prefix such as "NWMUMINV/2025-2026/00001" does not. Use separate journals (or sequences) where the client needs different series — e.g. export invoices, bills of supply, or per branch/GSTIN.

## 7. Reverse charge and TDS/TCS

- **RCM:** use the localization's RCM purchase taxes (verify names), which post both the input credit and the RCM liability, as in the freight example of the previous lesson.
- **TDS/TCS:** Odoo 17/18 India localization offers TDS/TCS configuration (withholding sections and rates, applied on bills/payments or invoices) through an additional India withholding module in recent versions — verify availability and module name per version and edition before scoping.

## 8. Real-world scenario: configuration walk-through

1. Confirm company state Maharashtra and fictional GSTIN 27ABCDE1234F1Z5.
2. Create Deccan Traders LLP (Pune, Maharashtra, 27PQRSX5678K1Z2, Registered Business - Regular).
3. Create Lalbagh Systems Pvt Ltd (Bengaluru, Karnataka, 29LMNOP4321Q1Z8, Registered Business - Regular).
4. Create Sahyadri Home Store (Nashik, Consumer, no GSTIN) and Gulf Office Trading LLC (Dubai, Overseas).
5. Set HSN on the chair product; default tax GST 18%.
6. Draft one invoice per customer for 50 chairs at ₹2,500 and compare the **tax lines and Journal Items**: Pune ⇒ CGST ₹11,250 + SGST ₹11,250; Bengaluru ⇒ IGST ₹22,500; Dubai ⇒ export tax per LUT setup (verify).

\`\`\`visual-order
{
  "title": "Configuration walk-through",
  "prompt": "Put the walk-through steps in a sensible order.",
  "items": ["Check the India fiscal localization is installed", "Confirm company state Maharashtra and GSTIN", "Create partners and products with GST treatment, state and HSN", "Draft one invoice per customer for 50 chairs", "Compare tax lines and journal items", "Fix wrong taxes in master data, never on the line"],
  "explanation": "The localization provides the taxes; the company state is the reference every partner state is compared with; invoices only read master data. So when a test shows a wrong tax, the fix goes back to master data, otherwise GSTR-1 is wrong every month."
}
\`\`\`

> **Consultant tip:** Never let users "fix" a wrong tax by editing the tax on the line. If Bengaluru shows CGST/SGST, the partner state or fiscal position is wrong — fix the master data, otherwise GSTR-1 will be wrong every month.

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Inter-state customer gets CGST+SGST | Partner state missing/wrong; fiscal position not auto-detected | Correct state; review fiscal position auto-detection |
| HSN not printed on invoice | Product HSN empty | Fill HSN/SAC on product; make it mandatory in the data-migration template |
| GSTIN rejected on save | Format/checksum validation | Use valid sandbox test GSTINs (verify) |
| Invoice number too long for GST | Long sequence prefix | Shorten journal sequence (≤ 16 characters) |
| ITC not booked on RCM bill | Normal tax used instead of RCM tax | Use the RCM tax variant |

\`\`\`visual-check
{
  "question": "A Bengaluru customer's invoice shows CGST + SGST instead of IGST. What should the consultant do?",
  "options": ["Tell the clerk to change the tax on the invoice line", "Check the partner state and the inter-state fiscal position auto-detection", "Create a new IGST tax", "Change the company state to Karnataka"],
  "correct": 1,
  "explanation": "Odoo picks IGST by comparing the partner state with the company state through the fiscal position. Editing the line fixes one invoice but leaves the cause, so every future invoice and GSTR-1 stays wrong."
}
\`\`\`

#### In Odoo 20: Fiscal positions switch GST to IGST

\`\`\`visual-screen
{
  "src": "/visuals/odoo-accounting/screens/acc-fiscal-positions.webp",
  "alt": "Odoo 20 fiscal positions list with Intra State, Inter State and Export entries.",
  "title": "Fiscal positions switch GST to IGST",
  "path": "Accounting ▸ Configuration ▸ Fiscal Positions",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 51.3,
      "y": 22.9,
      "w": 93.6,
      "h": 5,
      "tag": "right",
      "title": "Inter State",
      "text": "Maps GST taxes to IGST when the place of supply is another state."
    },
    {
      "x": 51.3,
      "y": 18.5,
      "w": 93.6,
      "h": 5,
      "tag": "right",
      "title": "Intra State",
      "text": "Keeps CGST + SGST for same-state supplies."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

#### In Odoo 20: GST taxes created by the Indian localisation

\`\`\`visual-screen
{
  "src": "/visuals/odoo-accounting/screens/acc-taxes-gst.webp",
  "alt": "Odoo 20 taxes list filtered on 18% showing GST and IGST sales and purchase taxes.",
  "title": "GST taxes created by the Indian localisation",
  "path": "Accounting ▸ Configuration ▸ Taxes",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 14.2,
      "y": 18.5,
      "w": 19.3,
      "h": 5,
      "tag": "right",
      "title": "Intra-state GST",
      "text": "A group: 9% CGST + 9% SGST, used when buyer and seller are in the same state."
    },
    {
      "x": 14.2,
      "y": 27.4,
      "w": 19.3,
      "h": 5,
      "tag": "right",
      "title": "Inter-state IGST",
      "text": "Single 18% tax for supplies to another state."
    },
    {
      "x": 14.2,
      "y": 22.9,
      "w": 19.3,
      "h": 5,
      "tag": "right",
      "title": "Purchase side",
      "text": "P = purchase taxes; S = sales taxes."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

## Key takeaways

- l10n_in is standard: Indian CoA, GST taxes/tax groups and fiscal positions.
- Company state + partner state + fiscal position decide CGST/SGST vs IGST.
- GST treatment on partners and HSN/SAC on products are mandatory master data.
- Keep invoice numbers within 16 characters; use separate series where needed.
- TDS/TCS and later Odoo versions differ — verify before committing scope.`,
          resources: [
            { title: "Odoo 17 India fiscal localization", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/fiscal_localizations/india.html" },
            { title: "Odoo 17 Accounting documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting.html" },
          ],
        },
        {
          slug: "india-e-invoicing-irn",
          title: "GST E-Invoicing (IRN and QR Code) with Odoo",
          durationMin: 60,
          odooVersions: "Odoo 17.0 (18.0 differences noted)",
          scope: ["configuration", "enterprise"],
          body: `> **Compliance disclaimer:** E-invoicing applicability thresholds, time limits, the INV-01 schema and portal procedures change through CBIC/GSTN notifications and advisories. Always verify against the latest notifications, the e-invoice portal and the Odoo documentation for your version. Train **only against the sandbox IRP** with test credentials — never production IRP credentials or real GSTINs. All data here is fictional.

## 1. Business context

Under GST e-invoicing, a B2B invoice is not "valid" for GST purposes just because the ERP printed it. The supplier must **report** the invoice JSON to an **Invoice Registration Portal (IRP)**. The IRP validates it and returns:

- **IRN** — Invoice Reference Number, a unique hash for supplier GSTIN + document type + document number + financial year
- **Acknowledgement number and date**
- **Signed QR code** (and signed invoice) — the QR code must be printed on the invoice

The IRP passes the data to the GST system (auto-populating GSTR-1) and to the e-way bill system.

\`\`\`visual-sequence
{
  "title": "How an invoice gets its IRN",
  "caption": "Odoo never talks to the IRP directly: it goes through Odoo IAP, acting via a GSP. Verify the current GSP in the Odoo documentation.",
  "actors": ["Odoo", "IAP / GSP", "IRP", "GST system"],
  "messages": [
    { "from": "Odoo", "to": "Odoo", "label": "Confirm invoice: status To Send", "kind": "self" },
    { "from": "Odoo", "to": "IAP / GSP", "label": "Invoice JSON (INV-01) + API user", "note": "Sent by the scheduled action or Process now", "kind": "request" },
    { "from": "IAP / GSP", "to": "IRP", "label": "Forward the invoice for registration", "kind": "request" },
    { "from": "IRP", "to": "IRP", "label": "Validate GSTINs, HSN, PIN/state, duplicates; create IRN", "note": "If validation fails, the error goes back and Odoo shows it on the invoice", "kind": "self" },
    { "from": "IRP", "to": "IAP / GSP", "label": "IRN + ack no/date + signed invoice + signed QR", "kind": "response" },
    { "from": "IAP / GSP", "to": "Odoo", "label": "Signed response", "kind": "response" },
    { "from": "Odoo", "to": "Odoo", "label": "Store IRN and QR, status Sent, print PDF with QR", "kind": "self" },
    { "from": "IRP", "to": "GST system", "label": "Invoice data auto-populates GSTR-1", "kind": "async" }
  ]
}
\`\`\`

| Topic | Rule (verify against the latest CBIC/GSTN notification) |
|---|---|
| Who | Taxpayers whose aggregate annual turnover in any year since 2017-18 exceeds the notified threshold. Thresholds have been lowered over time (most recently to ₹5 crore — check the latest notification) |
| Documents | Tax invoices, credit notes and debit notes for B2B, exports and SEZ supplies |
| Not covered | B2C invoices generally; some sectors are exempted (e.g. certain banks/insurers, SEZ units — verify) |
| B2C | Very large taxpayers have a separate *dynamic QR code* requirement for B2C invoices — not an IRN (verify) |
| Cancellation | Possible on the IRP within **24 hours** of generation (verify); after that, corrections go through credit notes and returns |
| Reporting time limit | Larger taxpayers (e.g. AATO above a notified limit) cannot report invoices older than a notified number of days (verify the current limit) |

\`\`\`visual-decision
{
  "title": "Must this invoice be e-invoiced?",
  "caption": "Uses only the rules in the table above. Thresholds and exemptions change: verify the latest notification.",
  "start": "aato",
  "nodes": {
    "aato": { "question": "Has the company's aggregate annual turnover in any year since 2017-18 exceeded the notified threshold (most recently ₹5 crore, verify)?", "options": [ { "label": "Yes", "next": "sector" }, { "label": "No", "next": "notreq" } ] },
    "notreq": { "result": "E-invoicing not mandatory", "tone": "info", "detail": "Below the threshold, a normal GST tax invoice is enough. Re-check every year: once any year crosses the threshold, it applies." },
    "sector": { "question": "Is the company in an exempted sector (e.g. certain banks/insurers, SEZ units; verify)?", "options": [ { "label": "Yes", "next": "exempt" }, { "label": "No", "next": "doc" } ] },
    "exempt": { "result": "Exempt from e-invoicing", "tone": "info", "detail": "Confirm the exemption against the notification with the client's tax advisor before scoping it out." },
    "doc": { "question": "Is the document a B2B, export or SEZ tax invoice, credit note or debit note?", "options": [ { "label": "Yes", "next": "yes" }, { "label": "No, it is B2C", "next": "b2c" } ] },
    "yes": { "result": "E-invoice it: get an IRN before issuing", "tone": "success", "detail": "Without an IRN the invoice is not valid for GST purposes, even if Odoo printed it." },
    "b2c": { "result": "No IRN for B2C", "tone": "warning", "detail": "B2C invoices are generally not covered, but very large taxpayers need a dynamic QR code on B2C invoices (verify)." }
  }
}
\`\`\`

## 2. INV-01 schema: key fields

| Section | Key fields | Odoo source (typical) |
|---|---|---|
| TranDtls | Tax scheme (GST), supply type (B2B, SEZWP/SEZWOP, EXPWP/EXPWOP, DEXP), reverse charge flag | Partner GST treatment, taxes |
| DocDtls | Type (INV / CRN / DBN), number, date | Invoice / credit note |
| SellerDtls | GSTIN, legal name, address, location, PIN code, state code | Company |
| BuyerDtls | GSTIN, legal name, place of supply, address, PIN, state code | Customer |
| ItemList | Is service, HSN, quantity, unit (UQC), unit price, discount, assessable value, GST rate, IGST/CGST/SGST/cess amounts, item total | Invoice lines, product HSN, UoM mapping |
| ValDtls | Assessable value, CGST/SGST/IGST totals, round-off, total invoice value | Invoice totals |

Invoice A from Lesson 1 would report AssVal ₹1,25,000, CgstVal ₹11,250, SgstVal ₹11,250, TotInvVal ₹1,47,500; Invoice B would report IgstVal ₹22,500 with the same totals.

## 3. Odoo e-invoicing: how it works

The **Indian E-invoicing** module (technical name **l10n_in_edi**) sends invoices to the government IRP through **Odoo's IAP (In-App Purchase) service**, which acts via a GST Suvidha Provider (GSP) — verify the current GSP name in the Odoo documentation. IAP credits are consumed per request (verify pricing and free credits for your edition/subscription). Availability: the module ships with the India localization, but it relies on Odoo IAP — confirm the client's edition/hosting and subscription.

### Setup steps (Odoo 17 — verify exact labels in your training instance)

1. On the **e-invoice portal (sandbox for training)**, create an API user for the GSTIN and choose integration through a GSP, selecting the GSP named in the Odoo documentation.
2. In Odoo install the India e-invoicing module (Apps ▸ search "Indian - E-invoicing" — verify name).
3. Go to **Accounting ▸ Configuration ▸ Settings** and find the Indian electronic invoicing section (verify location); enter the **API username and password** and verify/test the connection. Keep **production mode off** for sandbox (verify the option).
4. On the sales journal, confirm the e-invoicing (EDI) format is enabled (verify field name).

\`\`\`visual-order
{
  "title": "E-invoicing setup order",
  "prompt": "Put the Odoo 17 e-invoicing setup steps in order.",
  "items": ["Create an API user for the GSTIN on the sandbox e-invoice portal, choosing the GSP", "Install the Indian E-invoicing module", "Enter API username and password in Accounting Settings, production mode off", "Confirm the EDI format is enabled on the sales journal", "Send a test invoice and check the IRN"],
  "explanation": "The credentials only exist after the portal creates the API user, and Odoo can only accept them once the module is installed. Production mode stays off so training never hits the real IRP."
}
\`\`\`

### Prerequisites checklist

| # | Check | Typical failure if missing |
|---|---|---|
| 1 | Company GSTIN, full address, state and PIN code | Seller validation error |
| 2 | Customer GSTIN, GST treatment, state and PIN code | Buyer GSTIN/state error |
| 3 | HSN/SAC on every product line (correct digits) | Invalid HSN |
| 4 | UoM mapped to GST UQC codes | Invalid unit |
| 5 | Correct taxes (CGST+SGST vs IGST) consistent with place of supply | Tax-type/POS mismatch |
| 6 | Invoice number ≤ 16 characters, unique in financial year | Invalid document number / duplicate |
| 7 | IAP credits and valid API credentials | Authentication/credit error |

### Invoice status flow (Odoo 17)

1. Confirm the invoice ⇒ electronic invoicing status **To Send**.
2. A scheduled action sends it, or the user clicks **Process now** (verify button label).
3. On success the status becomes **Sent**; the IRN, acknowledgement number/date and signed QR data are stored on the invoice (e-invoice JSON attached).
4. On failure Odoo shows the IRP error message on the invoice; fix the data and resend.
5. Print the invoice: the PDF includes the **IRN and QR code** (verify the report layout).

**Cancellation:** within the portal's window, use the request-cancellation action on the invoice (verify label) and choose a **reason code** — Duplicate, Data Entry Mistake, Order Cancelled or Others — plus remarks. Status moves to "To Cancel" then "Cancelled". After the window, issue a **credit note** (which is itself e-invoiced as a CRN).

\`\`\`visual-decision
{
  "title": "An e-invoiced invoice is wrong: cancel or credit note?",
  "start": "irn",
  "nodes": {
    "irn": { "question": "Has the invoice already received an IRN?", "options": [ { "label": "Yes", "next": "window" }, { "label": "No, still To Send or in error", "next": "fix" } ] },
    "fix": { "result": "Correct the data and resend", "tone": "success", "detail": "Nothing is registered yet, so fix the master data (HSN, GSTIN, PIN/state) or the invoice and resend." },
    "window": { "question": "Is it still within the IRP cancellation window (24 hours, verify)?", "options": [ { "label": "Yes", "next": "cancel" }, { "label": "No", "next": "credit" } ] },
    "cancel": { "result": "Cancel on the IRP with a reason code", "tone": "warning", "detail": "Choose Duplicate, Data Entry Mistake, Order Cancelled or Others. Re-issue with a NEW invoice number: the cancelled number cannot get a new IRN." },
    "credit": { "result": "Issue a credit note (e-invoiced as CRN)", "tone": "info", "detail": "After the window the IRN cannot be cancelled, so the correction goes through a credit note and the returns." }
  }
}
\`\`\`

> In Odoo 18 the Indian e-invoicing flow was refactored (for example sending is integrated in the invoice send process rather than the generic EDI framework) — verify buttons and statuses in an 18.0 instance.

## 4. Real-world scenario

Northwind invoices Lalbagh Systems (fictional sandbox GSTIN) for 50 chairs, ₹1,25,000 + IGST ₹22,500. The first attempt fails: "HSN code is invalid". The chair product had "94" only. The consultant updates the HSN to the correct digits, resends, and receives an IRN and QR code. The clerk prints the invoice with the QR. Two hours later sales finds the quantity should be 40: the invoice is cancelled on the IRP with reason "Data Entry Mistake" and re-issued with a **new invoice number** (the cancelled number cannot be reused for a new IRN).

> **Consultant tip:** Run a "GST master-data health check" before go-live: export partners and products, check GSTIN format/state code match, HSN presence and UQC mapping. Fixing 2,000 records in Excel before go-live is far cheaper than fixing failed IRNs one by one after go-live.

## 5. Common errors and fixes

| Error (paraphrased) | Cause | Fix |
|---|---|---|
| Invalid GSTIN of buyer/seller | Typo, cancelled GSTIN or sandbox vs production mismatch | Correct GSTIN; use sandbox test GSTINs in training |
| HSN missing or invalid | Product without HSN or wrong digits | Update product HSN; resend |
| PIN code does not belong to state | Address master data inconsistent | Correct PIN/state on partner or company |
| Duplicate IRN | Same document number already registered | Check if already registered; do not reuse cancelled numbers |
| Authentication failed / token error | Wrong API user, password or GSP selection | Re-create API user on portal; re-enter in settings |
| Insufficient IAP credits | Credits exhausted | Buy/assign IAP credits (verify) |
| Tax type mismatch with place of supply | IGST used for intra-state or vice versa | Fix partner state/fiscal position; recreate invoice |

\`\`\`visual-check
{
  "question": "Two hours after the IRN, sales says the quantity should be 40, not 50. What is the right action?",
  "options": ["Edit the quantity and resend with the same number", "Cancel on the IRP with reason Data Entry Mistake and re-issue with a new number", "Wait and issue a debit note", "Delete the invoice in Odoo only"],
  "correct": 1,
  "explanation": "Within the cancellation window the IRN can be cancelled, but the cancelled document number cannot be reused for a new IRN, so the corrected invoice needs a new number."
}
\`\`\`

## Key takeaways

- The IRP returns IRN, acknowledgement and a signed QR code that must be printed.
- Applicability depends on aggregate turnover thresholds that change — check notifications.
- Odoo's l10n_in_edi uses IAP to reach the IRP; configure credentials and test in sandbox.
- Most failures are master data: GSTIN, HSN, PIN/state, UQC.
- Cancel within the IRP window; afterwards use credit notes.`,
          resources: [
            { title: "Odoo 17 India fiscal localization (e-invoicing section)", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/fiscal_localizations/india.html" },
            { title: "E-invoice IRP portal (official)", kind: "link", url: "https://einvoice1.gst.gov.in/" },
          ],
        },
        {
          slug: "india-eway-bill-returns-tds",
          title: "E-Way Bill, GST Returns, Reconciliation and TDS/TCS",
          durationMin: 55,
          odooVersions: "Odoo 17.0 (18.0 differences noted)",
          scope: ["configuration", "enterprise"],
          body: `> **Compliance disclaimer:** E-way bill thresholds, validity rules, return forms, due dates and TDS/TCS sections change through notifications (and e-way bill rules vary by state). Always verify against current CBIC/GSTN notifications and the Odoo documentation for your version. Training uses **sandbox environments only** — never real GSTINs or production credentials. All data here is fictional.

## 1. E-way bill: business context

An **e-way bill (EWB)** is required for movement of goods when the consignment value exceeds the notified limit — generally **₹50,000** (some states apply different limits for intra-state movement — verify). It is generated on the e-way bill portal (or via API) before the goods move.

| Part | Contents | Filled by |
|---|---|---|
| Part A | Recipient GSTIN, place of delivery, document number/date, value, HSN, reason for transport, transporter ID/document | Supplier (or recipient/transporter) |
| Part B | Vehicle number (road) or transport document details | Transporter or supplier |

**Validity** depends on distance: for normal cargo roughly **1 day per 200 km** (over-dimensional cargo has a shorter per-day distance) — verify the current rule. Validity can be extended in specified circumstances. An e-way bill can generally be cancelled within 24 hours if goods were not moved (verify).

When e-invoicing applies, the IRP can generate the e-way bill from the IRN if transport details are supplied.

\`\`\`visual-decision
{
  "title": "Is an e-way bill needed?",
  "caption": "Only the rules in this lesson. Limits differ by state for intra-state movement: verify.",
  "start": "goods",
  "nodes": {
    "goods": { "question": "Is there a movement of goods?", "options": [ { "label": "Yes", "next": "value" }, { "label": "No, a service only", "next": "none" } ] },
    "none": { "result": "No e-way bill", "tone": "info", "detail": "An e-way bill tracks goods in transit; a service such as installation has nothing to move." },
    "value": { "question": "Does the consignment value exceed the notified limit (generally ₹50,000; verify state rules)?", "options": [ { "label": "Yes", "next": "einv" }, { "label": "No", "next": "below" } ] },
    "below": { "result": "Generally not required", "tone": "info", "detail": "Below the limit no e-way bill is needed, unless the state applies a different intra-state limit." },
    "einv": { "question": "Is the invoice e-invoiced with transport details supplied?", "options": [ { "label": "Yes", "next": "fromirn" }, { "label": "No", "next": "portal" } ] },
    "fromirn": { "result": "Generate the e-way bill from the IRN", "tone": "success", "detail": "The IRP passes the data to the e-way bill system, so the data is not keyed twice." },
    "portal": { "result": "Generate Part A + Part B before goods move", "tone": "success", "detail": "Via the e-way bill portal or the Odoo e-waybill module: Part A for document, value and HSN, Part B for vehicle or transport document." }
  }
}
\`\`\`

### E-way bill in Odoo

Odoo provides an **Indian E-waybill** module (technical name **l10n_in_edi_ewaybill** in 17.0; reorganised in 18.0 — verify) that uses IAP like e-invoicing. Typical setup (verify labels):

1. Create an API user on the e-way bill portal (sandbox for training).
2. Install the e-way bill module and enter credentials in **Accounting ▸ Configuration ▸ Settings** (verify the section).
3. On the posted invoice (and, depending on version, on the delivery order — verify), fill transport mode, transporter, vehicle number, distance and type of transaction, then send.
4. Odoo stores the EWB number and validity and prints them on the document.

Availability and the delivery-based flow depend on version and edition — verify before promising it.

## 2. GST returns

| Return | Purpose | Data source in ERP |
|---|---|---|
| GSTR-1 | Outward supplies: B2B, B2C (large/small), exports, SEZ, credit/debit notes, HSN summary, document summary | Posted customer invoices and credit notes |
| GSTR-3B | Monthly summary return and **tax payment** (output tax, ITC claimed, net cash) | Tax ledgers, GSTR-2B |
| GSTR-2B | Auto-drafted, static ITC statement built from suppliers' GSTR-1 | Downloaded from GST portal; compared with vendor bills |

Frequencies and due dates depend on turnover and schemes such as QRMP — verify current due dates.

\`\`\`visual-match
{
  "title": "Which return or document holds what?",
  "prompt": "Match each return or e-way bill part to its content.",
  "pairs": [
    { "left": "GSTR-1", "right": "Outward supplies: B2B, B2C, exports, credit notes, HSN summary" },
    { "left": "GSTR-3B", "right": "Monthly summary of output tax, ITC claimed and net cash paid" },
    { "left": "GSTR-2B", "right": "Auto-drafted ITC statement built from suppliers' GSTR-1" },
    { "left": "E-way bill Part A", "right": "Recipient GSTIN, document, value, HSN and reason for transport" },
    { "left": "E-way bill Part B", "right": "Vehicle number or transport document" }
  ],
  "explanation": "GSTR-2B is built from suppliers' GSTR-1, so your ITC depends on their filing. That is why 2B is reconciled with vendor bills before GSTR-3B is filed."
}
\`\`\`

\`\`\`visual-timeline
{
  "title": "Monthly GST cycle for June (monthly filer; verify current due dates)",
  "items": [
    { "when": "During June", "title": "Post invoices, IRNs and e-way bills", "detail": "No invoice left in To Send or error.", "icon": "invoice" },
    { "when": "30 June", "title": "Close sales and review HSN summary", "detail": "Post pending credit notes so they land in the right period.", "icon": "calendar" },
    { "when": "By about 11 July", "title": "File GSTR-1", "detail": "Outward supplies from posted invoices and credit notes; customers' 2B is built from it.", "icon": "file" },
    { "when": "Around 14 July", "title": "GSTR-2B available", "detail": "Static ITC statement from suppliers' GSTR-1.", "icon": "receipt" },
    { "when": "Before GSTR-3B", "title": "Reconcile 2B with vendor bills", "detail": "Defer ITC that is in books but not in 2B.", "icon": "scale" },
    { "when": "By about 20 July", "title": "File GSTR-3B and pay tax", "detail": "Output tax ties to output accounts; ITC to input accounts minus deferred credit.", "icon": "payment" },
    { "when": "After filing", "title": "Set the tax lock date", "detail": "Stops anyone posting into a filed period.", "icon": "lock" }
  ]
}
\`\`\`

### What Odoo offers (verify by version and edition)

- **Community/standard:** GST taxes post to separate accounts and tax groups; invoice/journal-item analysis grouped by tax, partner GST treatment and HSN supports building GSTR-1 data; exports via list/pivot views.
- **Enterprise (17/18):** India GST reports and **GST return features** — e.g. GSTR-1 preparation and sending, fetching GSTR-2B and reconciling it with vendor bills, and a GSTR-3B summary — operating through IAP and GST portal credentials. Exact menus, steps and filing scope differ by version; **verify in your training instance** and the Odoo documentation.

Many clients still file through their chartered accountant or a GSP tool; in that case Odoo's job is to produce clean, reconciled data (exports by return section).

### GSTR-2B reconciliation

Compare vendor bills (Input CGST/SGST/IGST) with GSTR-2B per supplier GSTIN and invoice number:

| Status | Meaning | Action |
|---|---|---|
| Matched | Bill and 2B agree | Claim ITC |
| In books, not in 2B | Supplier has not filed / filed wrong GSTIN | Follow up with vendor; defer ITC |
| In 2B, not in books | Bill not recorded | Record bill or investigate |
| Value mismatch | Rate/amount difference | Correct bill or request supplier amendment |

\`\`\`visual-decision
{
  "title": "Vendor bill vs GSTR-2B: claim ITC now?",
  "start": "books",
  "nodes": {
    "books": { "question": "Is the bill recorded in Odoo?", "options": [ { "label": "Yes", "next": "in2b" }, { "label": "No, but it is in 2B", "next": "record" } ] },
    "record": { "result": "Record the bill or investigate", "tone": "warning", "detail": "A supplier reported a supply you have not booked: either a missing bill or a wrong GSTIN on their side." },
    "in2b": { "question": "Does it appear in GSTR-2B?", "options": [ { "label": "Yes", "next": "value" }, { "label": "No", "next": "defer" } ] },
    "defer": { "result": "Defer the ITC and follow up with the vendor", "tone": "danger", "detail": "Like the Ahmedabad bill: ₹14,400 IGST deferred until the vendor amends and it appears in 2B." },
    "value": { "question": "Do rate and amounts agree?", "options": [ { "label": "Yes", "next": "claim" }, { "label": "No", "next": "fixv" } ] },
    "fixv": { "result": "Correct the bill or request a supplier amendment", "tone": "warning", "detail": "Claim only what both sides agree on." },
    "claim": { "result": "Matched: claim ITC", "tone": "success", "detail": "Bill and 2B agree, so the credit can go into GSTR-3B." }
  }
}
\`\`\`

## 3. Real-world scenario: Northwind's month-end (fictional)

In June, Northwind posts 180 B2B invoices, 40 B2C invoices and 6 credit notes. GSTR-2B shows ITC from 52 suppliers. The Ahmedabad chair vendor (fictional 24FGHIJ9876L1Z4) invoice of ₹94,400 (IGST ₹14,400) is "in books, not in 2B" — the vendor reported it with a typo in Northwind's GSTIN. Northwind defers ₹14,400 IGST ITC in GSTR-3B, asks the vendor to amend, and claims it in the month it appears. Output tax in GSTR-3B must tie to the Output CGST/SGST/IGST account balances; ITC claimed must tie to Input accounts minus deferred/blocked credits.

## 4. TDS/TCS overview

| Item | Income-tax TDS/TCS | GST TDS/TCS |
|---|---|---|
| Who deducts/collects | Payers under the Income-tax Act (e.g. on contracts, professional fees, rent); sellers collecting TCS in specified cases | Government bodies (TDS) and e-commerce operators (TCS) under GST |
| Odoo | India withholding (TDS/TCS) features in 17/18 — verify module and edition | Usually manual entries or specific features — verify |

Example (rates illustrative, verify sections/rates): Northwind receives a ₹50,000 professional fee bill; TDS at 10% ⇒ pay vendor ₹45,000, credit TDS Payable ₹5,000 (GST on the fee handled separately).

\`\`\`visual-journal
{
  "title": "Professional fee bill with TDS at 10% (illustrative)",
  "lines": [
    { "account": "Professional Fees (expense)", "debit": "₹50,000" },
    { "account": "Accounts Payable — vendor", "credit": "₹45,000" },
    { "account": "TDS Payable", "credit": "₹5,000" }
  ],
  "note": "The full ₹50,000 is the expense, but Northwind owes the vendor only ₹45,000. The ₹5,000 is a liability to the government until it is deposited, which is why it sits in TDS Payable, not in the vendor balance. GST on the fee is a separate line."
}
\`\`\`

> **Consultant tip:** Agree in the design phase *who* files returns and *which* Odoo report each return box comes from. Write a "return-to-account mapping" sheet (GSTR-3B table ⇒ Odoo accounts/tax grids). It turns month-end from a debate into a checklist.

## 5. Month-end GST compliance checklist

| # | Task | Evidence |
|---|---|---|
| 1 | All B2B invoices have IRN (no "To Send"/error) | Filter invoices by e-invoice status |
| 2 | E-way bills generated for qualifying movements | EWB list vs deliveries |
| 3 | HSN summary reviewed | HSN-wise sales report |
| 4 | GSTR-1 data exported/prepared and reviewed | GSTR-1 summary |
| 5 | GSTR-2B downloaded and reconciled with bills | Reconciliation sheet |
| 6 | RCM liabilities booked and paid in cash | RCM tax account |
| 7 | GSTR-3B prepared; ledgers tie to returns | Tie-out sheet |
| 8 | TDS/TCS deducted, paid and returns prepared | TDS payable ledger |
| 9 | Tax lock date set after filing | Lock date setting |

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| EWB rejected: invalid vehicle number | Format error | Correct format, resend Part B |
| EWB expired in transit | Distance/validity underestimated | Extend validity per rules (verify) |
| GSTR-1 total ≠ sales tax accounts | Manual entries using tax accounts without taxes, unposted credit notes | Review journal items on tax accounts by journal |
| ITC in books > 2B | Supplier non-filing | Vendor follow-up; defer ITC |

\`\`\`visual-check
{
  "question": "Northwind's GSTR-1 total is lower than the Output GST account balances. What is the most likely cause?",
  "options": ["The e-way bills expired", "Manual journal entries posted to tax accounts without taxes, or unposted credit notes", "GSTR-2B was not downloaded", "The tax lock date is set"],
  "correct": 1,
  "explanation": "GSTR-1 is built from posted invoices and credit notes with taxes. A manual entry hitting a tax account changes the ledger but not the return, so review journal items on tax accounts by journal."
}
\`\`\`

## Key takeaways

- E-way bill: generally above ₹50,000 consignment value; Part A + Part B; validity by distance.
- GSTR-1 (outward), GSTR-3B (summary and payment), GSTR-2B (ITC statement) — reconcile monthly.
- Odoo Enterprise adds GST return/reconciliation features via IAP — verify per version.
- Tie returns to ledgers, then set the tax lock date.
- TDS/TCS exists in two laws (income tax and GST) — scope each separately.`,
          resources: [
            { title: "Odoo 17 India fiscal localization", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/fiscal_localizations/india.html" },
            { title: "GST portal (official)", kind: "link", url: "https://www.gst.gov.in/" },
          ],
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-accounting-final",
    title: "Odoo Accounting — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which of the following are typically Enterprise-only features in Odoo 17 Accounting? (Select all that apply)",
        kind: "multiple",
        options: ["Customer invoices", "Bank reconciliation widget", "Assets management", "Full Balance Sheet / P&L reports"],
        correct: [1, 2, 3],
        explanation: "Invoices are available in Community Invoicing; reconciliation widget, assets and full financial reports are Enterprise (verify per version).",
      },
      {
        prompt: "What does a fiscal localization package install?",
        kind: "single",
        options: [
          "Only the company logo and address",
          "Chart of accounts, taxes, tax report and fiscal positions",
          "Sales and Purchase apps",
          "Bank synchronisation",
        ],
        correct: [1],
        explanation: "The localization provides country-specific accounts, taxes, tax report (grids) and fiscal positions.",
      },
      {
        prompt: "Which journal type would you use for an opening balance entry?",
        kind: "single",
        options: ["Sales", "Purchase", "Bank", "Miscellaneous"],
        correct: [3],
        explanation: "Opening entries, accruals and adjustments are posted in a Miscellaneous journal.",
      },
      {
        prompt: "A price of 108.00 has an 8% tax marked 'Included in Price'. What is the untaxed base?",
        kind: "single",
        options: ["99.36", "100.00", "108.00", "116.64"],
        correct: [1],
        explanation: "108 / 1.08 = 100.00 base and 8.00 tax.",
      },
      {
        prompt: "A fiscal position can map both taxes and accounts.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "Fiscal positions have tax mapping and account mapping tabs.",
      },
      {
        prompt: "After 'Register Payment' with outstanding accounts configured, what is the entry?",
        kind: "single",
        options: [
          "Dr Bank / Cr Accounts Receivable",
          "Dr Outstanding Receipts / Cr Accounts Receivable",
          "Dr Accounts Receivable / Cr Sales",
          "Dr Bank Suspense / Cr Bank",
        ],
        correct: [1],
        explanation: "The payment moves the receivable to Outstanding Receipts; the bank is hit when reconciling the statement line.",
      },
      {
        prompt: "An imported bank statement line that is not yet reconciled sits against which account?",
        kind: "single",
        options: ["Accounts Receivable", "Bank Suspense Account", "Retained Earnings", "Exchange Difference"],
        correct: [1],
        explanation: "Statement lines are posted Bank vs Bank Suspense until reconciliation replaces the suspense line.",
      },
      {
        prompt: "Contoso's invoice total is 842.40 including 62.40 tax. Which line is credited with 780.00?",
        kind: "single",
        options: ["Accounts Receivable", "Tax Payable", "Product Sales", "Outstanding Receipts"],
        correct: [2],
        explanation: "Revenue (Product Sales) is credited with the untaxed amount; AR is debited 842.40 and Tax Payable credited 62.40.",
      },
      {
        prompt: "What is the correct way to correct a posted customer invoice that was over-billed?",
        kind: "single",
        options: ["Delete the invoice", "Issue a credit note (or reset to draft if allowed)", "Edit the posted journal items directly", "Change the payment term"],
        correct: [1],
        explanation: "Posted entries are not deleted; use a credit note or reset to draft when no lock date or payment prevents it.",
      },
      {
        prompt: "In the generic opening-balance approach, what should the opening suspense account balance be after loading open AR/AP items?",
        kind: "single",
        options: ["Equal to total AR", "Equal to total AP", "Zero", "Equal to retained earnings"],
        correct: [2],
        explanation: "The suspense is used as a bridge between the summary opening entry and the detailed AR/AP items; it must net to zero.",
      },
      {
        prompt: "Which lock date prevents changes affecting taxes after a tax return has been filed (Odoo 17)?",
        kind: "single",
        options: ["Lock date for non-advisers", "Tax lock date", "Fiscal year end date", "Payment term date"],
        correct: [1],
        explanation: "The tax lock date blocks entries that would change already-reported taxes.",
      },
      {
        prompt: "In Odoo 17, what is used to allocate a bill line 70% to Warehouse and 30% to Admin departments?",
        kind: "single",
        options: ["Fiscal positions", "Analytic distribution on analytic plans", "Two separate journals", "Payment terms"],
        correct: [1],
        explanation: "Analytic distribution allocates line amounts by percentage across analytic accounts from analytic plans.",
      },
      {
        prompt: "Northwind (Mumbai, Maharashtra) sells goods worth ₹1,00,000 at an assumed 18% GST to a registered customer in Bengaluru, Karnataka. Which tax applies?",
        kind: "single",
        options: ["CGST ₹9,000 + SGST ₹9,000", "IGST ₹18,000", "CGST ₹18,000", "No GST — inter-state supplies are exempt"],
        correct: [1],
        explanation: "Supplier state (27) differs from the place of supply (29), so the supply is inter-state and attracts IGST at the full rate: 18% × ₹1,00,000 = ₹18,000.",
      },
      {
        prompt: "In a 15-character GSTIN, the first two characters are the state code and characters 3 to 12 are the PAN of the entity.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "GSTIN = 2-digit state code + 10-character PAN + entity number + 'Z' (default) + checksum character.",
      },
      {
        prompt: "What does the Invoice Registration Portal (IRP) return when an e-invoice is successfully registered?",
        kind: "single",
        options: [
          "Only a PDF copy of the invoice",
          "An IRN, acknowledgement number and date, and a signed QR code",
          "An e-way bill number only",
          "A GSTR-3B challan",
        ],
        correct: [1],
        explanation: "The IRP returns the IRN (hash), acknowledgement number/date and the signed invoice/QR code, which must be printed on the invoice.",
      },
      {
        prompt: "Which master data items must be correct before Odoo can successfully send an Indian e-invoice? (Select all that apply)",
        kind: "multiple",
        options: [
          "HSN/SAC code on every product line",
          "Customer GSTIN, GST treatment and state",
          "Company GSTIN, address, state and PIN code",
          "Bank synchronisation enabled on the bank journal",
        ],
        correct: [0, 1, 2],
        explanation: "The INV-01 payload requires seller and buyer GSTIN/address/state/PIN and HSN per item; bank synchronisation has nothing to do with e-invoicing.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-accounting-assignment-1",
      title: "Configure Northwind's Accounting and Load Opening Balances",
      instructions: `## Brief

Northwind Office Supplies Pvt Ltd goes live on 1 January. Configure accounting and load opening balances in your training instance.

## Tasks

1. Confirm the fiscal localization; review account types; add Bank Charges and Opening Suspense accounts.
2. Configure journals (Bank, Cash), taxes (8% excluded and included), payment terms and two fiscal positions.
3. Post the opening balance entry dated 31 December using the trial balance in Lesson 3.
4. Import 5 open customer invoices (total 64,000) and 4 open vendor bills (total 51,000) against the suspense account.
5. Prove the suspense account balance is zero and the trial balance matches the legacy one.

## Deliverables

- Configuration workbook (setting, value, reason).
- Opening entry and import files.
- Trial balance export with a short reconciliation note.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Configuration correct and justified | 30% |
| Opening entry balanced and dated correctly | 25% |
| Open items imported; suspense = 0 | 30% |
| Documentation quality | 15% |`,
    },
    {
      slug: "odoo-accounting-assignment-2",
      title: "Run a Month of Transactions and Close the Period",
      instructions: `## Brief

Process March for Northwind and close the month.

## Tasks

1. Post 5 customer invoices, one credit note, 4 vendor bills (one in EUR).
2. Register full, partial and advance payments.
3. Import a March bank statement; reconcile all lines; create a bank-fees reconciliation model.
4. Post one accrual with its reversal in April.
5. Allocate two bills by analytic distribution.
6. Set the lock date for non-advisers to 31 March and test it.
7. Produce Trial Balance, P&L, Balance Sheet and Aged Receivable (Enterprise) or equivalent analyses (Community).

## Deliverables

- Journal entry table for every transaction (accounts, debit, credit).
- Bank reconciliation summary (statement balance vs GL).
- Month-end closing checklist with evidence.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Transactions correctly posted | 30% |
| Reconciliation complete; suspense explained | 25% |
| Journal entries correctly explained | 25% |
| Closing checklist and reporting | 20% |`,
    },
    {
      slug: "odoo-accounting-assignment-india-gst",
      title: "Configure Indian GST and Simulate E-Invoicing for Northwind",
      instructions: `## Brief

Northwind Office Supplies Pvt Ltd (Mumbai, Maharashtra, fictional GSTIN 27ABCDE1234F1Z5) is moving its Indian operations to Odoo. Configure GST in a **training database** and prove that invoices are e-invoice ready.

> **Disclaimer:** Use fictional data and sandbox environments only. Never use real GSTINs or production IRP/e-way bill credentials. Verify all rates, thresholds and rules against current CBIC/GSTN notifications and the Odoo documentation for your version.

## Tasks

1. Confirm the India fiscal localization; document the GST taxes, tax groups and fiscal positions installed.
2. Set company state, GSTIN, address and PIN code.
3. Create partners with different GST treatments: Deccan Traders LLP (Pune, Regular), Lalbagh Systems Pvt Ltd (Bengaluru, Regular), a Composition vendor, a Consumer, an Overseas customer and an SEZ customer.
4. Add HSN/SAC codes and taxes to at least five products (goods and services); map UoMs to GST UQC codes if available.
5. Post an intra-state invoice (Pune) and an inter-state invoice (Bengaluru) for 50 chairs at ₹2,500 and show the tax breakup and journal entries.
6. Post one RCM bill (freight) and one inter-state vendor bill.
7. Complete the e-invoice readiness checklist; attempt IRN generation in the **sandbox** (if IAP/sandbox access is available) or document a simulation with the expected INV-01 field values.
8. Prepare a GSTR-1 summary (B2B, B2C, exports/SEZ, credit notes, HSN summary) from Odoo data.

## Deliverables

- Localization setup evidence (screenshots or exports of taxes, tax groups, fiscal positions, company data).
- Partner list with GST treatment, state and fictional GSTIN.
- Product list with HSN/SAC and taxes.
- Intra- vs inter-state invoices with tax breakup and journal entry tables.
- E-invoice readiness checklist with pass/fail per item.
- Sandbox IRN result (IRN, acknowledgement, QR on PDF) **or** a documented simulation including at least one error and its fix.
- GSTR-1 summary sheet tied to Output CGST/SGST/IGST account balances.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Localization and company setup correct and evidenced | 15% |
| Partner GST treatments and states correct | 15% |
| Products with valid HSN/SAC and taxes | 10% |
| Intra/inter-state invoices and RCM bill correctly taxed; entries explained | 25% |
| E-invoice readiness checklist and sandbox IRN / simulation | 20% |
| GSTR-1 summary tied to ledgers | 10% |
| Documentation quality and "verify" notes for version-specific items | 5% |`,
    },
  ],
};
