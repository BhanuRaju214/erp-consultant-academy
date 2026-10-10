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
          body: `## 1. Overview

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

\`\`\`text
 Sales Order ──► Delivery ──► Customer Invoice (Draft) ──Confirm──► Posted (AR ↑, Revenue ↑, Tax payable ↑)
                                                                         │
                                       Register Payment ◄────────────────┘
                                              │   (AR ↓, Outstanding Receipts ↑)
                                              ▼
                               Bank statement line ──Reconcile──► Bank ↑, Outstanding Receipts ↓
\`\`\`

### Procure-to-Pay

\`\`\`text
 Purchase Order ──► Receipt ──► Vendor Bill (Draft) ──Confirm──► Posted (Expense/Stock interim ↑, Tax receivable ↑, AP ↑)
                                                                     │
                                       Register Payment ◄────────────┘
                                              │   (AP ↓, Outstanding Payments ↑)
                                              ▼
                               Bank statement line ──Reconcile──► Bank ↓, Outstanding Payments ↓
\`\`\`

### Record-to-Report

\`\`\`text
 Daily postings ─► Bank reconciliation ─► Accruals / Misc entries ─► Review Trial Balance
     ─► Lock date ─► Balance Sheet / P&L / Tax report ─► Year-end closing
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

## Standard vs Enterprise vs customization

| Requirement | Classification |
|---|---|
| Chart of accounts, taxes, journals, fiscal positions | Standard (configuration) |
| Bank synchronisation, reconciliation widget, financial reports | Enterprise |
| Custom invoice layout with extra fields | Customization (Studio or QWeb module) |
| Integration with an external tax engine | Third-party |

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

Step B then imports open invoices (AR 64,000 Dr / suspense Cr) and bills (suspense Dr / AP 51,000 Cr): suspense nets to zero.

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

### 8.2 Credit note

Contoso returns 20 reams. Open the posted invoice ▸ **Credit Note** (reversal wizard) ▸ reason "Damaged goods" ▸ create a draft credit note, set quantity 20 ▸ **Confirm**. Credit note value: 130.00 + 10.40 tax = 140.40. It appears as an outstanding credit that can be reconciled with the invoice.

Posted documents are never deleted: use **Reset to Draft** (if no lock date or payment blocks it) or a credit note.

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

## 3. Place of supply and the tax type

The **place of supply** (POS) decides intra- vs inter-state. For goods it is generally where movement terminates (delivery location); for services the general rule is the recipient's registered location, with many exceptions (immovable property, events, transport — verify for each service).

- Supplier state = place of supply ⇒ **CGST + SGST/UTGST** (rate split equally)
- Supplier state ≠ place of supply ⇒ **IGST** (full rate)

### HSN and SAC

Goods are classified by **HSN** (Harmonised System of Nomenclature) codes, services by **SAC** (Services Accounting Code). The number of HSN digits required on invoices depends on aggregate turnover (4 or 6 digits under current notifications — verify). The rate follows the HSN/SAC.

### Rate slabs

Historically GST used 0%, 5%, 12%, 18% and 28% (plus compensation cess on some goods). The GST Council rationalised slabs in 2025 towards mainly 5% and 18% with a higher special rate for demerit goods. **Rates change through GST Council notifications — always verify the current rate for each HSN/SAC.** The examples below *assume* 18% purely for arithmetic.

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

> **Consultant tip:** Never let users "fix" a wrong tax by editing the tax on the line. If Bengaluru shows CGST/SGST, the partner state or fiscal position is wrong — fix the master data, otherwise GSTR-1 will be wrong every month.

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Inter-state customer gets CGST+SGST | Partner state missing/wrong; fiscal position not auto-detected | Correct state; review fiscal position auto-detection |
| HSN not printed on invoice | Product HSN empty | Fill HSN/SAC on product; make it mandatory in the data-migration template |
| GSTIN rejected on save | Format/checksum validation | Use valid sandbox test GSTINs (verify) |
| Invoice number too long for GST | Long sequence prefix | Shorten journal sequence (≤ 16 characters) |
| ITC not booked on RCM bill | Normal tax used instead of RCM tax | Use the RCM tax variant |

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

| Topic | Rule (verify against the latest CBIC/GSTN notification) |
|---|---|
| Who | Taxpayers whose aggregate annual turnover in any year since 2017-18 exceeds the notified threshold. Thresholds have been lowered over time (most recently to ₹5 crore — check the latest notification) |
| Documents | Tax invoices, credit notes and debit notes for B2B, exports and SEZ supplies |
| Not covered | B2C invoices generally; some sectors are exempted (e.g. certain banks/insurers, SEZ units — verify) |
| B2C | Very large taxpayers have a separate *dynamic QR code* requirement for B2C invoices — not an IRN (verify) |
| Cancellation | Possible on the IRP within **24 hours** of generation (verify); after that, corrections go through credit notes and returns |
| Reporting time limit | Larger taxpayers (e.g. AATO above a notified limit) cannot report invoices older than a notified number of days (verify the current limit) |

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

## 3. Real-world scenario: Northwind's month-end (fictional)

In June, Northwind posts 180 B2B invoices, 40 B2C invoices and 6 credit notes. GSTR-2B shows ITC from 52 suppliers. The Ahmedabad chair vendor (fictional 24FGHIJ9876L1Z4) invoice of ₹94,400 (IGST ₹14,400) is "in books, not in 2B" — the vendor reported it with a typo in Northwind's GSTIN. Northwind defers ₹14,400 IGST ITC in GSTR-3B, asks the vendor to amend, and claims it in the month it appears. Output tax in GSTR-3B must tie to the Output CGST/SGST/IGST account balances; ITC claimed must tie to Input accounts minus deferred/blocked credits.

## 4. TDS/TCS overview

| Item | Income-tax TDS/TCS | GST TDS/TCS |
|---|---|---|
| Who deducts/collects | Payers under the Income-tax Act (e.g. on contracts, professional fees, rent); sellers collecting TCS in specified cases | Government bodies (TDS) and e-commerce operators (TCS) under GST |
| Odoo | India withholding (TDS/TCS) features in 17/18 — verify module and edition | Usually manual entries or specific features — verify |

Example (rates illustrative, verify sections/rates): Northwind receives a ₹50,000 professional fee bill; TDS at 10% ⇒ pay vendor ₹45,000, credit TDS Payable ₹5,000 (GST on the fee handled separately).

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
