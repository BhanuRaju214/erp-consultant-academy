/**
 * Business Process Academy — seed content.
 *
 * Six end-to-end business processes explained the way a techno-functional
 * consultant must understand them: business first, then the documents, the
 * accounting/inventory impact, and finally how Odoo handles each step.
 *
 * Accuracy rule: menu paths are given only where they are standard in Odoo 17.0.
 * Where a path or behaviour differs by edition, version or localization, the
 * text says so or asks the trainee to "verify in your training instance".
 */
import type { BusinessProcessContent } from "./types";

const ODOO_VERSION = "Odoo 17.0 (notes for 18.0 where different)";

/* ================================================================== */
/* 1. ORDER TO CASH                                                    */
/* ================================================================== */

const orderToCash: BusinessProcessContent = {
  slug: "order-to-cash",
  title: "Order to Cash (O2C)",
  shortName: "Order to Cash",
  category: "Sales & Receivables",
  summary:
    "The complete revenue cycle: from the first contact with a prospect (lead) through quotation, sales order, delivery, invoicing, customer payment and bank reconciliation.",
  objective:
    "Convert customer demand into cash as quickly and accurately as possible: capture and qualify demand, quote correct prices and terms, deliver the right goods on time, invoice exactly what was delivered, collect payment within terms, and ensure every transaction is correctly reflected in revenue, receivables, inventory and cash.",
  odooVersion: ODOO_VERSION,
  departments: ["Sales / Business Development", "Sales Operations", "Warehouse & Logistics", "Finance – Accounts Receivable", "Treasury", "Management"],
  stakeholders: [
    { role: "Sales Representative", responsibility: "Qualifies leads, manages opportunities, prepares quotations and negotiates prices and terms with the customer." },
    { role: "Sales Manager", responsibility: "Approves discounts beyond policy, monitors the pipeline and forecast, and owns the sales targets." },
    { role: "Credit Controller", responsibility: "Sets and monitors customer credit limits and payment terms; blocks or releases orders for customers on credit hold." },
    { role: "Warehouse Supervisor / Picker", responsibility: "Picks, packs and ships goods, records the quantities actually delivered and handles backorders." },
    { role: "Accounts Receivable Accountant", responsibility: "Creates and posts customer invoices, issues credit notes, sends payment reminders and manages the aged receivable." },
    { role: "Treasury / Cashier", responsibility: "Records customer receipts and reconciles the bank statement against payments and invoices." },
    { role: "Customer", responsibility: "Requests quotations, confirms orders, receives goods and pays invoices within the agreed terms." },
  ],
  steps: [
    {
      id: "lead",
      title: "Capture the lead",
      actor: "Sales Representative / Marketing",
      department: "Sales / Marketing",
      description:
        "A potential customer shows interest — through the website, a trade show, an email or a phone call. The lead is recorded with contact details, source and the expressed need so that nobody loses track of it. At this stage the business does not yet know whether the interest is real or what it is worth.",
      document: "Lead record (enquiry)",
      odoo:
        "CRM app. Enable Leads in CRM ▸ Configuration ▸ Settings (the 'Leads' option); leads are then managed in CRM ▸ Leads ▸ Leads. Leads can also be created automatically from an email alias or a website form (Website app).",
      impact: "No accounting or inventory impact.",
    },
    {
      id: "opportunity",
      title: "Qualify into an opportunity",
      actor: "Sales Representative",
      department: "Sales",
      description:
        "The salesperson contacts the lead and checks budget, authority, need and timing. If the lead is qualified it is converted into an opportunity with an expected revenue, probability and closing date. The opportunity then moves through pipeline stages (e.g. New ▸ Qualified ▸ Proposition ▸ Won).",
      document: "Opportunity",
      odoo:
        "CRM ▸ Leads ▸ Leads ▸ open lead ▸ 'Convert to Opportunity'. The pipeline is in CRM ▸ Sales ▸ My Pipeline (Kanban by stage). Activities (call, meeting, email) are scheduled from the chatter.",
      impact: "No accounting impact. Expected revenue feeds the pipeline forecast only.",
    },
    {
      id: "customer",
      title: "Create / validate the customer master",
      actor: "Sales Operations / Credit Controller",
      department: "Sales Operations / Finance",
      description:
        "Before quoting, the customer must exist as a master record with correct legal name, addresses (invoice and delivery), tax ID, payment terms, pricelist and fiscal position. Finance may set a credit limit. Clean customer data prevents wrong taxes, wrong prices and misdirected deliveries later.",
      document: "Customer master record",
      odoo:
        "Contacts app or Sales ▸ Orders ▸ Customers. Payment terms and pricelist on the 'Sales & Purchase' tab; receivable account and fiscal position on the 'Invoicing'/'Accounting' tab. Credit limits: enable 'Sales Credit Limit' in Accounting/Invoicing ▸ Configuration ▸ Settings, then set the limit on the customer (verify in your training instance).",
      impact: "No journal entry. Determines the receivable account, taxes (via fiscal position) and due dates used later.",
      approval: "New customers and credit limits are usually approved by Finance / Credit Control.",
    },
    {
      id: "quotation",
      title: "Prepare and send the quotation",
      actor: "Sales Representative",
      department: "Sales",
      description:
        "The salesperson builds a quotation listing products, quantities, unit prices, discounts, taxes, payment terms and validity date. It is sent to the customer for review, often as a PDF or online portal link. Discounts above policy require manager approval before sending.",
      document: "Quotation",
      odoo:
        "From the opportunity click 'New Quotation', or Sales ▸ Orders ▸ Quotations ▸ New. Use 'Send by Email' to send the PDF and portal link. Optional products, quotation templates (Sales ▸ Configuration ▸ Quotation Templates, after enabling the setting) and online signature/payment are standard.",
      impact: "No accounting or inventory impact. Forecasted stock is not reserved by a quotation.",
      approval:
        "Discount approval is not a standard workflow in Sales; options are: restrict discount editing by access rights, use the Approvals app (Enterprise) or Studio/custom rule (customization).",
    },
    {
      id: "sales-order",
      title: "Confirm the sales order",
      actor: "Sales Representative",
      department: "Sales",
      description:
        "When the customer accepts (signature, purchase order or online payment), the quotation is confirmed into a sales order. This is the binding commitment: it triggers the delivery and later the invoice. Credit checks are performed at this point for credit-controlled customers.",
      document: "Sales Order (Order Confirmation)",
      odoo:
        "Sales ▸ Orders ▸ Quotations ▸ open ▸ 'Confirm'. The record becomes a Sales Order (Sales ▸ Orders ▸ Orders) and, for storable products, a delivery order is created automatically (Delivery smart button).",
      impact:
        "No journal entry at confirmation. Inventory: a delivery order is created and stock is reserved according to the picking type's reservation method (default: at confirmation, if available).",
      approval: "Orders exceeding the customer's credit limit show a warning; blocking requires configuration or customization.",
    },
    {
      id: "delivery",
      title: "Pick, pack and deliver",
      actor: "Warehouse Supervisor / Picker",
      department: "Warehouse & Logistics",
      description:
        "The warehouse picks the reserved goods, packs them and ships them with a delivery slip. The quantities actually shipped are recorded; anything short becomes a backorder. In 1-step delivery this is a single operation; in 2- or 3-step delivery there are separate Pick, Pack and Ship transfers.",
      document: "Delivery Order / Delivery Slip",
      odoo:
        "Delivery smart button on the sales order, or Inventory ▸ Operations ▸ Transfers (filter 'Deliveries'; in 17.0 the Operations menu also lists Deliveries directly). Set quantities and click 'Validate'; choose 'Create Backorder' if partial. Multi-step routes are set in Inventory ▸ Configuration ▸ Warehouses.",
      impact:
        "Inventory: on-hand quantity decreases (WH/Stock ▸ Partners/Customers). Accounting with automated (perpetual) valuation: Dr Stock Output (interim) / Cr Stock Valuation at cost. With Anglo-Saxon accounting, COGS is recognized when the invoice is posted: Dr Cost of Goods Sold / Cr Stock Output. With manual (periodic) valuation: no journal entry.",
    },
    {
      id: "invoice",
      title: "Issue the customer invoice",
      actor: "Accounts Receivable Accountant",
      department: "Finance – AR",
      description:
        "Finance invoices the customer according to the invoicing policy — usually for delivered quantities so that the customer is never billed for goods not shipped. The invoice states amounts, taxes, due date and payment instructions. Posting it creates the receivable and recognizes revenue.",
      document: "Customer Invoice (Tax Invoice)",
      odoo:
        "Sales order ▸ 'Create Invoice' (Regular invoice, or down payment), or batch from Sales ▸ To Invoice ▸ Orders to Invoice. Review and 'Confirm' (post) the draft in Accounting/Invoicing ▸ Customers ▸ Invoices, then 'Send & Print'. Invoicing policy (Ordered vs Delivered quantities) is set per product and as a default in Sales ▸ Configuration ▸ Settings.",
      impact:
        "Dr Accounts Receivable (gross) / Cr Product Sales (Revenue, net) / Cr Tax Payable (output tax). With Anglo-Saxon perpetual valuation, also Dr Cost of Goods Sold / Cr Stock Output (interim) for the cost of the delivered goods.",
      approval: "Optionally review by AR supervisor before posting; credit notes usually require approval.",
    },
    {
      id: "payment",
      title: "Receive the customer payment",
      actor: "Treasury / AR Accountant",
      department: "Finance – Treasury",
      description:
        "The customer pays by bank transfer, card, cheque or cash. The receipt is recorded against the open invoice so the receivable is cleared. Overdue invoices trigger follow-up reminders according to the company's dunning policy.",
      document: "Payment Receipt / Remittance Advice",
      odoo:
        "On the posted invoice click 'Register Payment', or Accounting/Invoicing ▸ Customers ▸ Payments ▸ New. Online payments via payment providers (portal) are registered automatically. Follow-up reminders: Accounting ▸ Customers ▸ Follow-up Reports (Enterprise).",
      impact:
        "Odoo 17.0: Dr Outstanding Receipts (bank journal's outstanding account) / Cr Accounts Receivable; the invoice is marked 'In Payment' until the bank line is reconciled. Note 18.0: the outstanding account on payment methods is optional — if left empty, no payment journal entry is created and the bank statement line clears the receivable directly (verify in your training instance).",
    },
    {
      id: "reconciliation",
      title: "Reconcile the bank statement",
      actor: "Treasury / Accountant",
      department: "Finance",
      description:
        "The bank statement is imported or synchronized, and each line is matched with the registered payment (or directly with the open invoice). This proves the cash actually arrived and closes the cycle. Unmatched amounts — bank fees, short payments, unidentified receipts — are investigated and booked.",
      document: "Bank Statement",
      odoo:
        "Accounting ▸ Dashboard ▸ bank journal ▸ 'Reconcile' (bank reconciliation widget — Enterprise). Statements via bank synchronization (Enterprise), or import of CSV/OFX/CAMT files. Reconciliation models automate recurring matches (Accounting ▸ Configuration ▸ Reconciliation Models). In Community (Invoicing app) there is no reconciliation widget.",
      impact:
        "Dr Bank / Cr Outstanding Receipts (Odoo 17.0). Fees: Dr Bank Charges / Cr Bank. After reconciliation the invoice status becomes 'Paid'.",
    },
  ],
  documents: [
    "Lead / Enquiry",
    "Opportunity",
    "Quotation (with validity date and terms)",
    "Customer Purchase Order (received from customer)",
    "Sales Order / Order Confirmation",
    "Pick list, Delivery Order / Delivery Slip",
    "Customer Invoice",
    "Credit Note (for returns or price corrections)",
    "Payment Receipt",
    "Bank Statement",
    "Payment Reminder / Follow-up Letter",
  ],
  masterData: [
    "Customers (contacts: addresses, tax ID, payment terms, pricelist, fiscal position, credit limit)",
    "Products (sales price, sales taxes, invoicing policy, product category, unit of measure)",
    "Pricelists and discount rules",
    "Payment terms",
    "Taxes and fiscal positions",
    "Salespersons and sales teams",
    "Warehouses, delivery routes and carriers",
    "Chart of accounts (receivable, revenue, COGS, stock accounts), journals (Sales, Bank)",
  ],
  transactionData: [
    "Leads and opportunities",
    "Quotations and sales orders",
    "Delivery orders and backorders",
    "Customer invoices and credit notes",
    "Customer payments",
    "Bank statement lines and reconciliations",
  ],
  approvals: [
    "New customer creation and credit limit (Finance / Credit Control)",
    "Discounts above the salesperson's authority (Sales Manager)",
    "Orders for customers over credit limit or on credit hold (Credit Controller)",
    "Credit notes and write-offs (Finance Manager)",
  ],
  accountingImpact: `## Accounting impact of Order to Cash

Example: sale of goods for 10,000 net + 15% tax (1,500). Cost of the goods: 6,000. Automated (perpetual) inventory valuation with Anglo-Saxon accounting.

### 1. Delivery validated
| Account | Debit | Credit |
|---|---:|---:|
| Stock Output (interim) | 6,000 | |
| Stock Valuation (inventory asset) | | 6,000 |

### 2. Customer invoice posted
| Account | Debit | Credit |
|---|---:|---:|
| Accounts Receivable | 11,500 | |
| Product Sales (Revenue) | | 10,000 |
| Tax Payable (Output VAT/GST) | | 1,500 |
| Cost of Goods Sold | 6,000 | |
| Stock Output (interim) | | 6,000 |

### 3. Payment registered (Odoo 17.0)
| Account | Debit | Credit |
|---|---:|---:|
| Outstanding Receipts | 11,500 | |
| Accounts Receivable | | 11,500 |

### 4. Bank statement reconciled
| Account | Debit | Credit |
|---|---:|---:|
| Bank | 11,500 | |
| Outstanding Receipts | | 11,500 |

### Key points
- Revenue is recognized when the invoice is posted, not when the order is confirmed.
- The Stock Output interim account should net to zero once all deliveries are invoiced; a residual balance means goods delivered but not yet invoiced (or vice versa).
- With **continental** accounting (common in some European localizations), the delivery posts directly to an expense account and there is no COGS line on the invoice.
- With **manual (periodic)** valuation no stock entries are posted; inventory is adjusted at period end.
- Early-payment discounts and write-offs post to dedicated discount/write-off accounts via the payment or reconciliation.`,
  inventoryImpact: `## Inventory impact of Order to Cash

| Step | Stock movement | Quantity effect |
|---|---|---|
| Quotation | None | Forecast unaffected |
| Sales order confirmed | Delivery order created, stock reserved (if available) | On hand unchanged; forecasted and free quantity reduced |
| Pick (2/3-step) | WH/Stock ▸ WH/Output (or Packing Zone) | Moves within warehouse |
| Delivery validated | WH/Stock (or WH/Output) ▸ Partners/Customers | On hand decreases |
| Customer return | Partners/Customers ▸ WH/Stock (return transfer) | On hand increases; value restored at cost |

- **Reservation** happens on the delivery order, not on the sales order. Reservation strategy (at confirmation, manually, or before scheduled date) is set per operation type.
- **Backorders** keep undelivered quantities open; the invoice (delivered-quantity policy) bills only what shipped.
- **Lots/serials** are captured at delivery when tracking is enabled, giving full traceability to the customer.
- Service and consumable products do not create valued stock moves.`,
  exceptions: [
    { title: "Customer exceeds credit limit", mitigation: "Enable Sales Credit Limit warning; define a credit-hold procedure; route exceptions to the Credit Controller before confirming the order." },
    { title: "Insufficient stock at confirmation", mitigation: "Check forecasted quantity on the quotation line; use replenishment rules / make-to-order route; communicate realistic commitment dates; allow partial delivery with backorders." },
    { title: "Wrong price or unauthorized discount", mitigation: "Maintain pricelists centrally; restrict who can edit prices/discounts; review margin before confirmation (margin is shown when the Margins setting is enabled)." },
    { title: "Invoice does not match delivery (billing for unshipped goods)", mitigation: "Use 'Delivered quantities' invoicing policy for physical goods; run the Orders to Invoice list daily; reconcile Stock Output interim account monthly." },
    { title: "Customer returns or damaged goods", mitigation: "Process a Return on the delivery; issue a credit note linked to the original invoice; inspect returns into a quarantine location if required." },
    { title: "Short payment or unidentified receipt", mitigation: "Use reconciliation models for bank fees/tolerances; park unknown receipts in a suspense account and follow up within 48 hours." },
    { title: "Duplicate customers", mitigation: "Search before creating; use VAT/tax ID as a uniqueness check; periodically merge duplicates (Contacts merge action)." },
  ],
  kpis: [
    { name: "Lead-to-Opportunity conversion rate", formula: "Opportunities created ÷ Leads received × 100" },
    { name: "Quotation win rate", formula: "Confirmed sales orders ÷ Quotations sent × 100" },
    { name: "On-time delivery (OTD)", formula: "Deliveries shipped on or before commitment date ÷ Total deliveries × 100" },
    { name: "Order-to-invoice cycle time", formula: "Average (Invoice date − Order confirmation date) in days" },
    { name: "Days Sales Outstanding (DSO)", formula: "(Accounts receivable balance ÷ Credit sales for the period) × Days in period" },
    { name: "Gross margin %", formula: "(Revenue − Cost of goods sold) ÷ Revenue × 100" },
    { name: "Overdue receivables %", formula: "Receivables past due date ÷ Total receivables × 100" },
  ],
  reports: [
    "CRM ▸ Reporting ▸ Pipeline (pipeline analysis by stage, salesperson, expected revenue)",
    "Sales ▸ Reporting ▸ Sales (Sales Analysis: revenue, quantities, margin by product/customer/salesperson)",
    "Inventory ▸ Reporting ▸ Stock / Moves Analysis (deliveries)",
    "Accounting ▸ Reporting ▸ Aged Receivable (Enterprise)",
    "Accounting ▸ Reporting ▸ Invoice Analysis (Invoices analysis — available also in Invoicing)",
    "Accounting ▸ Reporting ▸ Profit and Loss (Enterprise)",
    "Customer Statement / Follow-up report (Enterprise)",
  ],
  odooHandling: `## How Odoo handles Order to Cash

### Apps involved
- **CRM** – leads, opportunities, pipeline, activities.
- **Sales** – quotations, sales orders, pricelists, quotation templates, online signature and payment through the customer portal.
- **Inventory** – delivery orders, reservations, routes (1/2/3-step delivery), backorders, returns.
- **Invoicing** (Community) or **Accounting** (Enterprise) – invoices, payments, follow-ups, bank reconciliation, financial reports.

### Key settings
- CRM ▸ Configuration ▸ Settings: enable **Leads** (otherwise everything starts as an opportunity).
- Sales ▸ Configuration ▸ Settings: **Pricelists**, **Discounts**, **Margins**, **Quotation Templates**, **Online Signature / Online Payment**, default **Invoicing Policy**.
- Inventory ▸ Configuration ▸ Warehouses: delivery steps; Inventory settings: **Multi-Step Routes**, **Lots & Serial Numbers**.
- Product category: **Inventory Valuation** = Automated (perpetual) or Manual (periodic); **Costing Method** = Standard, Average (AVCO) or FIFO.

### Standard vs Enterprise vs customization
| Need | How delivered |
|---|---|
| Lead-to-invoice flow | Standard (Community + Enterprise) |
| Credit limit warning | Standard configuration (warning only) |
| Hard credit block / discount approval workflow | Approvals app (Enterprise) or customization / Studio (Enterprise) |
| Bank reconciliation widget, bank sync, Aged Receivable, P&L, follow-up reports | Enterprise (Accounting app) |
| Customer invoices and payments | Standard (Invoicing app in Community) |

### Consultant tips
- Decide **invoicing policy** per product type early — it drives cash-flow timing and customer disputes.
- Explain the **interim accounts** (Stock Output, Outstanding Receipts) to the finance team during design; they are a frequent source of confusion.
- Odoo 18.0 note: payments can be configured without an outstanding account, so the journal entry appears only at bank reconciliation — confirm the client's preference.`,
  video: `\`\`\`visual-video
{
  "src": "/videos/o2c-explained.mp4",
  "poster": "/videos/o2c-explained.webp",
  "title": "Order to Cash, explained",
  "duration": "6:03",
  "caption": "Narrated explainer built from this process: the steps, who does what, the Odoo documents, the journal entries, risks and controls.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 14,
      "label": "What is O2C?"
    },
    {
      "t": 38,
      "label": "Who is involved"
    },
    {
      "t": 68,
      "label": "The 9 steps"
    },
    {
      "t": 98,
      "label": "Steps 1 and 2"
    },
    {
      "t": 128,
      "label": "Step 3"
    },
    {
      "t": 156,
      "label": "Step 4"
    },
    {
      "t": 182,
      "label": "Step 5"
    },
    {
      "t": 207,
      "label": "Step 6"
    },
    {
      "t": 235,
      "label": "Step 7"
    },
    {
      "t": 258,
      "label": "Steps 8 and 9"
    },
    {
      "t": 281,
      "label": "Accounting impact"
    },
    {
      "t": 314,
      "label": "Risks and controls"
    },
    {
      "t": 340,
      "label": "Recap"
    }
  ]
}
\`\`\``,
  example: {
    company: "Northwind Office Supplies Pvt. Ltd. (fictional distributor of office furniture and stationery)",
    narrative: `\`\`\`visual-story
{
  "title": "Order to Cash: Northwind sells 40 chairs to Bluepeak",
  "company": "Northwind Office Supplies · fictional",
  "pace": 7,
  "intro": "This animation follows one sale through Odoo, from the first enquiry to the cash in the bank. Each box is a department or system. The moving parcel is the document being handed over, and the number on it shows the order of events.",
  "legend": "Boxes are departments or systems, not steps. The numbered parcel is the document being handed over; the number is the step.",
  "stations": [
    {
      "id": "customer",
      "label": "Customer: Bluepeak",
      "icon": "building",
      "x": 0,
      "y": 0,
      "app": "Outside Northwind",
      "outside": true
    },
    {
      "id": "crm",
      "label": "Northwind CRM · Priya",
      "icon": "target",
      "app": "CRM",
      "x": 3,
      "y": 0
    },
    {
      "id": "sales",
      "label": "Sales team",
      "icon": "file",
      "app": "Sales",
      "x": 4,
      "y": 2
    },
    {
      "id": "warehouse",
      "label": "Warehouse",
      "icon": "warehouse",
      "app": "Inventory",
      "x": 3,
      "y": 4
    },
    {
      "id": "accounting",
      "label": "Accounts",
      "icon": "landmark",
      "app": "Accounting",
      "x": 1,
      "y": 4
    },
    {
      "id": "bank",
      "label": "Bank",
      "icon": "bank",
      "x": 0,
      "y": 2,
      "outside": true
    }
  ],
  "scenes": [
    {
      "at": "3 Mar",
      "from": "customer",
      "to": "crm",
      "carry": "Enquiry: 40 chairs",
      "document": "Lead",
      "title": "Website enquiry becomes a lead",
      "text": "A facilities manager at Bluepeak fills in the contact form on Northwind's website. The form creates a **lead** in CRM, assigned to salesperson **Priya**.",
      "say": "A facilities manager at Bluepeak, the customer, fills in the contact form on Northwind's website. The customer and the CRM are separate boxes because the enquiry starts outside the company and lands inside Northwind's CRM as a lead, assigned to Priya. A lead is still unqualified: nobody knows yet whether it is a real deal."
    },
    {
      "at": "4 Mar",
      "to": "crm",
      "document": "Opportunity",
      "title": "Lead qualified into an opportunity",
      "text": "Priya calls: Bluepeak moves into a new office in April with a budget of about 12,000. She converts the lead into an **opportunity**: expected revenue 11,000 at 60% probability.",
      "say": "Priya calls Bluepeak and learns they are moving office in April, with a budget of about twelve thousand. The enquiry is now qualified, so she converts the lead into an opportunity, with expected revenue of eleven thousand and a sixty percent probability. That opportunity feeds the sales forecast."
    },
    {
      "at": "Before quoting",
      "from": "crm",
      "to": "sales",
      "carry": "New customer",
      "title": "Customer master data created",
      "text": "Sales Operations creates Bluepeak: legal name, GST/VAT number, invoice address, a separate delivery address, payment terms **30 Days** and the **Corporate** pricelist. Finance sets a **credit limit of 15,000**.",
      "say": "Before quoting, Bluepeak must exist as a customer. Sales Operations creates the record with the tax number, the invoice and delivery addresses, thirty day payment terms and the Corporate pricelist. Finance sets a credit limit of fifteen thousand. Good master data here means every later document fills in correctly."
    },
    {
      "at": "Before 10 Mar",
      "from": "sales",
      "to": "customer",
      "carry": "Quotation S00231",
      "document": "S00231 (quotation)",
      "title": "Quotation sent by email",
      "text": "40 × ErgoMax Chair at 280 = 11,200, less a 5% volume discount = **10,640**, plus 15% tax 1,596 = **12,236**. A 5% discount is within Priya's authority, so no approval is needed.",
      "say": "Priya prepares the quotation: forty chairs at two hundred and eighty, less a five percent volume discount, is ten thousand six hundred and forty. Adding fifteen percent tax gives twelve thousand two hundred and thirty-six. Five percent is within her authority, so no approval is needed, and she emails the quotation."
    },
    {
      "at": "10 Mar",
      "from": "customer",
      "to": "sales",
      "carry": "Signed online",
      "document": "S00231 (sales order)",
      "tone": "success",
      "title": "Signed online: sales order confirmed",
      "text": "Bluepeak signs the quotation online and it becomes **sales order S00231**.",
      "say": "On the tenth of March Bluepeak signs online through the customer portal, and the quotation becomes a sales order. Nothing is posted to the accounts yet. An order is a commitment, not an accounting transaction."
    },
    {
      "at": "10 Mar",
      "from": "sales",
      "to": "warehouse",
      "carry": "Delivery order",
      "document": "WH/OUT/00412",
      "tone": "warning",
      "title": "Delivery created, but only 30 in stock",
      "text": "Odoo creates delivery **WH/OUT/00412** and reserves the chairs, but only **30 of the 40** are in stock.",
      "say": "Confirming the order automatically creates the delivery order and reserves stock. But only thirty of the forty chairs are available. This is an exception the warehouse must handle, and the customer should be told."
    },
    {
      "at": "14 Mar",
      "from": "warehouse",
      "to": "customer",
      "carry": "30 chairs",
      "document": "WH/OUT/00412",
      "title": "30 chairs delivered, 10 on backorder",
      "text": "The warehouse validates 30 chairs and Odoo creates a **backorder** for the other 10. At an average cost of 150 per chair, the stock value leaves the warehouse.",
      "entries": [
        {
          "account": "Stock Output",
          "debit": "4,500"
        },
        {
          "account": "Stock Valuation",
          "credit": "4,500"
        }
      ],
      "say": "On the fourteenth the warehouse ships thirty chairs, and Odoo creates a backorder for the remaining ten. With automated valuation, stock worth four thousand five hundred, at an average cost of one hundred and fifty each, moves out of Stock Valuation into the Stock Output interim account."
    },
    {
      "at": "After delivery",
      "from": "warehouse",
      "to": "accounting",
      "carry": "Invoice 30 chairs",
      "document": "INV/2025/0158",
      "title": "First invoice: only what was delivered",
      "text": "The invoicing policy is **Delivered quantities**, so the AR accountant invoices 30 chairs: 30 × 266 = 7,980 + tax 1,197 = **9,177**. Posting also moves the cost to COGS.",
      "entries": [
        {
          "account": "Accounts Receivable",
          "debit": "9,177"
        },
        {
          "account": "Sales",
          "credit": "7,980"
        },
        {
          "account": "Tax Payable",
          "credit": "1,197"
        },
        {
          "account": "Cost of Goods Sold",
          "debit": "4,500"
        },
        {
          "account": "Stock Output",
          "credit": "4,500"
        }
      ],
      "say": "The chair's invoicing policy is delivered quantities, so the accountant can only invoice what was shipped: thirty chairs, nine thousand one hundred and seventy-seven including tax. Posting the invoice records the receivable, the revenue and the tax, and moves the cost from Stock Output to cost of goods sold."
    },
    {
      "at": "20 Mar",
      "from": "warehouse",
      "to": "customer",
      "carry": "10 chairs",
      "title": "Backorder delivered",
      "text": "The remaining 10 chairs arrive from the supplier and are delivered the same day (10 × average cost 150).",
      "entries": [
        {
          "account": "Stock Output",
          "debit": "1,500"
        },
        {
          "account": "Stock Valuation",
          "credit": "1,500"
        }
      ],
      "say": "On the twentieth the remaining ten chairs arrive from the supplier and are delivered the same day. Another one thousand five hundred of cost moves into Stock Output."
    },
    {
      "at": "20 Mar",
      "from": "warehouse",
      "to": "accounting",
      "carry": "Invoice 10 chairs",
      "title": "Second invoice posted",
      "text": "A second invoice of **3,059** (2,660 + 399 tax) is posted.",
      "entries": [
        {
          "account": "Accounts Receivable",
          "debit": "3,059"
        },
        {
          "account": "Sales",
          "credit": "2,660"
        },
        {
          "account": "Tax Payable",
          "credit": "399"
        },
        {
          "account": "Cost of Goods Sold",
          "debit": "1,500"
        },
        {
          "account": "Stock Output",
          "credit": "1,500"
        }
      ],
      "say": "A second invoice for the ten chairs is posted, for three thousand and fifty-nine including tax. Stock Output is cleared again, which proves that everything delivered has been invoiced."
    },
    {
      "at": "12 Apr",
      "from": "customer",
      "to": "bank",
      "carry": "9,177 transfer",
      "title": "Bluepeak pays the first invoice",
      "text": "Bluepeak pays 9,177 by bank transfer and the accountant **registers the payment** against INV/2025/0158.",
      "entries": [
        {
          "account": "Outstanding Receipts",
          "debit": "9,177"
        },
        {
          "account": "Accounts Receivable",
          "credit": "9,177"
        }
      ],
      "say": "On the twelfth of April Bluepeak pays the first invoice by bank transfer, and the accountant registers the payment. The receivable goes down, and the money waits in Outstanding Receipts until it appears on the bank statement."
    },
    {
      "at": "12 Apr",
      "from": "bank",
      "to": "accounting",
      "carry": "Bank statement",
      "tone": "success",
      "title": "Bank line reconciled: invoice Paid",
      "text": "When the bank statement is imported, the accountant reconciles the line. The first invoice turns **Paid**.",
      "entries": [
        {
          "account": "Bank",
          "debit": "9,177"
        },
        {
          "account": "Outstanding Receipts",
          "credit": "9,177"
        }
      ],
      "say": "When the bank statement is imported, the accountant matches the bank line to the payment. The money is now confirmed in the bank account, and the first invoice is marked Paid."
    },
    {
      "at": "Day 31",
      "from": "accounting",
      "to": "customer",
      "carry": "Payment reminder",
      "tone": "warning",
      "title": "Second invoice overdue: follow-up sent",
      "text": "The second invoice is still open. On day 31 it appears in the **Aged Receivable 1–30 days overdue** bucket and a follow-up email is sent.",
      "say": "The second invoice is still unpaid after its thirty day term. On day thirty-one it appears in the one to thirty days overdue column of the Aged Receivable report, and a follow-up email goes to Bluepeak."
    },
    {
      "at": "After follow-up",
      "from": "customer",
      "to": "bank",
      "carry": "3,049 received",
      "title": "Short payment: a 10 bank fee",
      "text": "Bluepeak pays **3,049**, because its bank deducted a 10 fee. The accountant applies a **reconciliation model** that books the 10 to Bank Charges and closes the invoice.",
      "entries": [
        {
          "account": "Bank",
          "debit": "3,049"
        },
        {
          "account": "Bank Charges",
          "debit": "10"
        },
        {
          "account": "Accounts Receivable",
          "credit": "3,059"
        }
      ],
      "say": "Bluepeak pays, but Northwind receives only three thousand and forty-nine, because the bank took a ten fee. Instead of leaving ten open, the accountant applies a reconciliation model that books the difference to Bank Charges, and the invoice closes."
    },
    {
      "at": "Result",
      "to": "accounting",
      "tone": "success",
      "title": "Order to cash complete",
      "text": "Revenue 10,640, COGS 6,000, gross margin **4,640 (43.6%)**. The Stock Output interim account is back to zero: everything delivered was invoiced. Sales Analysis shows the deal under Priya.",
      "say": "The sale is complete. Revenue is ten thousand six hundred and forty and cost of goods sold is six thousand, so the gross margin is four thousand six hundred and forty, or about forty-four percent. Stock Output is back to zero, and the deal shows under Priya in the sales analysis."
    }
  ],
  "counters": [
    {
      "label": "Order total (incl. tax)",
      "values": [
        "—",
        "11,000 est.",
        "11,000 est.",
        "12,236 quoted",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236"
      ]
    },
    {
      "label": "Chairs delivered",
      "values": [
        "0 / 40",
        "0 / 40",
        "0 / 40",
        "0 / 40",
        "0 / 40",
        "0 / 40",
        "30 / 40",
        "30 / 40",
        "40 / 40",
        "40 / 40",
        "40 / 40",
        "40 / 40",
        "40 / 40",
        "40 / 40",
        "40 / 40"
      ]
    },
    {
      "label": "Invoiced",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "9,177",
        "9,177",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236",
        "12,236"
      ]
    },
    {
      "label": "Open receivable",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "9,177",
        "9,177",
        "12,236",
        "3,059",
        "3,059",
        "3,059",
        "0",
        "0"
      ]
    }
  ],
  "results": [
    {
      "label": "Revenue",
      "value": "10,640"
    },
    {
      "label": "Cost of goods sold",
      "value": "6,000"
    },
    {
      "label": "Gross margin",
      "value": "4,640 (43.6%)"
    },
    {
      "label": "Order-to-cash cycle",
      "value": "33–44 days"
    },
    {
      "label": "Stock Output balance",
      "value": "0"
    },
    {
      "label": "Bank charges",
      "value": "10"
    }
  ]
}
\`\`\`

#### The full story

**Northwind Office Supplies** distributes office chairs and stationery to corporate clients. On 3 March a facilities manager at *Bluepeak Consulting* fills in the contact form on Northwind's website asking for 40 ergonomic chairs. The form creates a **lead** in the CRM app assigned to salesperson Priya.

Priya calls the next day, confirms Bluepeak is moving into a new office in April with a budget of about 12,000, and converts the lead into an **opportunity** with expected revenue 11,000 and 60% probability.

Bluepeak is new, so Priya asks Sales Operations to create the **customer**: legal name, GST/VAT number, invoice address, a separate delivery address for the new office, payment terms *30 Days* and the *Corporate* pricelist. Finance sets a credit limit of 15,000.

Priya prepares **quotation S00231**: 40 × *ErgoMax Chair* at 280 = 11,200, less a 5% volume discount = 10,640, plus 15% tax 1,596, total **12,236**. Because 5% is within her authority no approval is needed. She sends it by email; Bluepeak signs online on 10 March and the quotation becomes **sales order S00231**. Odoo creates delivery **WH/OUT/00412** and reserves the chairs — but only 30 are in stock.

On 14 March the warehouse validates 30 chairs and creates a **backorder** for 10. Each chair has an average cost of 150, so Odoo posts Dr Stock Output 4,500 / Cr Stock Valuation 4,500.

Because the chair's invoicing policy is *Delivered quantities*, the AR accountant invoices only 30 chairs: 30 × 266 = 7,980 + tax 1,197 = **9,177**. Posting invoice INV/2025/0158 produces Dr Accounts Receivable 9,177 / Cr Sales 7,980 / Cr Tax Payable 1,197, and Dr COGS 4,500 / Cr Stock Output 4,500.

The remaining 10 chairs arrive from the supplier on 20 March and are delivered the same day; a second invoice of **3,059** (2,660 + 399 tax) is posted.

On 12 April Bluepeak pays 9,177 by bank transfer. The accountant registers the payment (Dr Outstanding Receipts / Cr AR) and, when the bank statement is imported, reconciles the line (Dr Bank / Cr Outstanding Receipts). The first invoice turns **Paid**. The second invoice is still open; on day 31 it appears in the **Aged Receivable** 1–30 days overdue bucket and a follow-up email is sent. Bluepeak pays 3,049 — the bank deducted a 10 fee — so the accountant applies a reconciliation model that books the 10 to Bank Charges and closes the invoice.

**Results:** revenue 10,640, COGS 6,000, gross margin 4,640 (43.6%); order-to-cash cycle 33–44 days. The Sales Analysis report shows the deal under Priya, and the Stock Output interim account is back to zero — proof that everything delivered was invoiced.`,
  },
  quiz: {
    slug: "order-to-cash-quiz",
    title: "Order to Cash – Knowledge Check",
    passMark: 70,
    questions: [
      {
        prompt: "In Odoo, which document first reserves stock for a confirmed sale?",
        kind: "single",
        options: ["The quotation", "The delivery order created when the sales order is confirmed", "The customer invoice", "The opportunity"],
        correct: [1],
        explanation: "Reservation happens on the delivery order (stock picking) generated when the sales order is confirmed. Quotations and invoices do not reserve stock.",
      },
      {
        prompt: "With Anglo-Saxon automated valuation, which entry is posted when the customer invoice is confirmed (besides revenue and tax)?",
        kind: "single",
        options: ["Dr Stock Valuation / Cr COGS", "Dr COGS / Cr Stock Output (interim)", "Dr Bank / Cr Accounts Receivable", "No additional entry"],
        correct: [1],
        explanation: "Anglo-Saxon accounting matches COGS to revenue: at invoice posting Odoo moves the cost from the Stock Output interim account to Cost of Goods Sold.",
      },
      {
        prompt: "A company wants to bill customers only for goods actually shipped. Which setting achieves this?",
        kind: "single",
        options: ["Invoicing policy = Ordered quantities", "Invoicing policy = Delivered quantities", "Payment terms = Immediate", "Reservation method = Manual"],
        correct: [1],
        explanation: "With 'Delivered quantities' only validated delivered quantities become invoiceable on the sales order.",
      },
      {
        prompt: "Which of the following are Enterprise-only in Odoo 17? (select all that apply)",
        kind: "multiple",
        options: ["Bank reconciliation widget", "Aged Receivable report", "Creating customer invoices", "Registering a customer payment"],
        correct: [0, 1],
        explanation: "Invoices and payments are available in the Community Invoicing app. The reconciliation widget and accounting reports such as Aged Receivable are part of Enterprise Accounting.",
      },
      {
        prompt: "In Odoo 17.0, registering a payment debits the bank account directly.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "In 17.0 the payment debits the journal's Outstanding Receipts account; the Bank account is debited when the bank statement line is reconciled.",
      },
      {
        prompt: "Which KPI measures how quickly receivables are collected?",
        kind: "single",
        options: ["Quotation win rate", "On-time delivery", "Days Sales Outstanding (DSO)", "Gross margin %"],
        correct: [2],
        explanation: "DSO = (AR balance ÷ credit sales) × days in period; it expresses the average number of days to collect payment.",
      },
    ],
  },
};

/* ================================================================== */
/* 2. PROCURE TO PAY                                                   */
/* ================================================================== */

const procureToPay: BusinessProcessContent = {
  slug: "procure-to-pay",
  title: "Procure to Pay (P2P)",
  shortName: "Procure to Pay",
  category: "Purchasing & Payables",
  summary:
    "The complete purchasing cycle: identifying a need, selecting a vendor, issuing an RFQ and purchase order, receiving goods, matching the vendor bill against the order and receipt (3-way match), and paying the vendor.",
  objective:
    "Buy the right goods and services, at the right price and quality, from approved vendors, at the right time — while ensuring the company pays only for what it ordered and received, captures liabilities and inventory correctly, and pays vendors on time to protect relationships and capture discounts.",
  odooVersion: ODOO_VERSION,
  departments: ["Requesting department (Operations / Production / Admin)", "Purchasing / Procurement", "Warehouse – Receiving", "Quality Control", "Finance – Accounts Payable", "Treasury", "Management"],
  stakeholders: [
    { role: "Requester", responsibility: "Identifies the need and raises a purchase requisition with item, quantity, required date and budget/cost center." },
    { role: "Department Head / Budget Owner", responsibility: "Approves the requisition against budget and business need." },
    { role: "Buyer / Purchasing Officer", responsibility: "Selects vendors, sends RFQs, compares offers, negotiates and issues the purchase order." },
    { role: "Purchasing Manager", responsibility: "Approves purchase orders above the buyer's authority limit and maintains the approved vendor list." },
    { role: "Storekeeper / Receiving Clerk", responsibility: "Receives goods, checks quantity and condition against the PO, and records the receipt." },
    { role: "Quality Inspector", responsibility: "Inspects goods where required and accepts or rejects them." },
    { role: "Accounts Payable Accountant", responsibility: "Records vendor bills, performs the 3-way match and resolves price/quantity discrepancies." },
    { role: "Treasury / Finance Manager", responsibility: "Schedules and approves vendor payments according to due dates and cash position." },
  ],
  steps: [
    {
      id: "requisition",
      title: "Raise the purchase requisition (where applicable)",
      actor: "Requester",
      department: "Requesting department",
      description:
        "An employee or an automated replenishment rule identifies a need — raw material, spare parts, office equipment or a service. In a controlled environment the need is documented in a requisition and approved by the budget owner before Purchasing acts. Small companies often skip this step and buyers create RFQs directly.",
      document: "Purchase Requisition (internal request)",
      odoo:
        "Odoo has no Community 'requisition' document for employees. Options: (1) Approvals app (Enterprise) with a 'Purchase Request' category that generates an RFQ on approval; (2) automatic RFQs from reordering rules (Inventory ▸ Operations ▸ Replenishment) or make-to-order routes; (3) buyers create RFQs directly. Note: 'Purchase Agreements' (Blanket Orders / Calls for Tenders) are vendor agreements, not internal requisitions — some older docs call them 'requisitions' (purchase_requisition module).",
      impact: "No accounting or inventory impact.",
      approval: "Budget owner / department head approves the requisition.",
    },
    {
      id: "vendor-selection",
      title: "Select the vendor",
      actor: "Buyer",
      department: "Purchasing",
      description:
        "The buyer identifies qualified vendors from the approved vendor list. For recurring items the preferred vendor and agreed price are already known; for new or high-value purchases several vendors are invited to quote and their offers are compared on price, lead time, quality and terms.",
      document: "Vendor comparison / bid evaluation sheet",
      odoo:
        "Vendor prices and lead times are kept on the product's Purchase tab (vendor pricelist / 'supplierinfo'). For competitive bids enable Purchase Agreements in Purchase ▸ Configuration ▸ Settings and create a Call for Tenders (Purchase ▸ Orders ▸ Purchase Agreements) — alternatives are compared with 'Compare Product Lines' (verify in your training instance; in 17.0 alternative RFQs are linked via the 'Alternatives' tab).",
      impact: "No accounting or inventory impact.",
    },
    {
      id: "rfq",
      title: "Send the Request for Quotation (RFQ)",
      actor: "Buyer",
      department: "Purchasing",
      description:
        "The buyer sends an RFQ stating the items, quantities, required date and delivery address. The vendor replies with prices and lead times, which the buyer records on the RFQ. RFQs not selected are cancelled.",
      document: "Request for Quotation",
      odoo: "Purchase ▸ Orders ▸ Requests for Quotation ▸ New ▸ 'Send by Email'. Vendor responses can be entered directly on the RFQ lines.",
      impact: "No accounting or inventory impact.",
    },
    {
      id: "purchase-order",
      title: "Approve and confirm the Purchase Order",
      actor: "Buyer / Purchasing Manager",
      department: "Purchasing",
      description:
        "The selected RFQ is confirmed into a purchase order — a legal commitment to buy at the agreed price and terms. POs above the buyer's authority limit must be approved by a manager first. The PO is sent to the vendor and an incoming receipt is planned.",
      document: "Purchase Order",
      odoo:
        "RFQ ▸ 'Confirm Order'. With 'Purchase Order Approval' enabled in Purchase ▸ Configuration ▸ Settings (minimum amount), POs above the threshold go to 'To Approve' and a Purchase Administrator clicks 'Approve Order'. Confirmed POs: Purchase ▸ Orders ▸ Purchase Orders.",
      impact:
        "No journal entry (a commitment, not a liability). Inventory: a receipt (WH/IN) is created for storable products; incoming quantity raises the forecasted stock.",
      approval: "Two-level approval above a configured amount (standard 'Purchase Order Approval' setting); multi-level approvals need the Approvals app (Enterprise) or customization.",
    },
    {
      id: "receipt",
      title: "Receive the goods (Goods Receipt)",
      actor: "Storekeeper / Quality Inspector",
      department: "Warehouse – Receiving",
      description:
        "When the delivery arrives, the storekeeper compares the vendor's delivery note to the PO, counts the goods and checks for damage. Accepted quantities are recorded; shortages remain open as a backorder and rejected items are returned. The receipt confirms that the company now owns the goods and owes the vendor.",
      document: "Goods Receipt Note (GRN) / Receipt",
      odoo:
        "Receipt smart button on the PO, or Inventory ▸ Operations ▸ Transfers (filter 'Receipts'). Enter received quantities, lots/serials if tracked, then 'Validate'; choose backorder or no backorder. Quality checks require the Quality app (Enterprise).",
      impact:
        "Inventory: on hand increases (Partners/Vendors ▸ WH/Stock). Accounting (automated valuation): Dr Stock Valuation / Cr Stock Input (interim, 'goods received not invoiced'), at PO price (FIFO/AVCO) or standard cost. Manual valuation: no entry.",
    },
    {
      id: "vendor-bill",
      title: "Record the vendor bill and perform the 3-way match",
      actor: "Accounts Payable Accountant",
      department: "Finance – AP",
      description:
        "The vendor sends a bill. AP checks it against the purchase order (price, terms) and the receipt (quantity) — the 3-way match. Only matched bills are approved for payment; discrepancies are resolved with the buyer or vendor (credit note, corrected bill, or accepted price variance).",
      document: "Vendor Bill (Supplier Invoice)",
      odoo:
        "PO ▸ 'Create Bill', or Accounting/Invoicing ▸ Vendors ▸ Bills ▸ New and select the PO in 'Auto-Complete'. Bill control policy ('Ordered quantities' vs 'Received quantities') on the product / Purchase settings controls what can be billed. 'Should Be Paid' status from the 3-way matching setting is Enterprise (account_3way_match; verify in your training instance). Bills can be digitized with OCR (Enterprise, IAP credits).",
      impact:
        "Dr Stock Input (interim) for received goods / Dr Tax Receivable (input tax) / Cr Accounts Payable. Expenses/services: Dr Expense account. Price differences (FIFO/AVCO) are posted to stock valuation for goods still in stock or to a price difference account, depending on costing method and version (verify in your training instance).",
      approval: "Bills with price/quantity variance above tolerance require buyer or Finance Manager approval.",
    },
    {
      id: "payment",
      title: "Pay the vendor",
      actor: "Treasury / Finance Manager",
      department: "Finance – Treasury",
      description:
        "Approved bills are scheduled for payment according to their due dates and the company's cash position, often in a weekly payment run. Payments are released by an authorized signatory, sent to the bank, and later reconciled against the bank statement.",
      document: "Payment Voucher / Remittance Advice / Bank Transfer File",
      odoo:
        "On the bill 'Register Payment', or select several bills in Vendors ▸ Bills ▸ Action ▸ Register Payment (batch). Vendor payments: Accounting/Invoicing ▸ Vendors ▸ Payments. SEPA credit transfer / batch payment files depend on localization and Enterprise modules. Bank reconciliation widget is Enterprise.",
      impact:
        "Odoo 17.0: Dr Accounts Payable / Cr Outstanding Payments; at bank reconciliation Dr Outstanding Payments / Cr Bank. (18.0: outstanding accounts optional — verify.)",
      approval: "Payment release by authorized signatory; segregation of duties between bill entry and payment approval.",
    },
  ],
  documents: [
    "Purchase Requisition",
    "Request for Quotation (RFQ)",
    "Vendor Quotation / Bid",
    "Bid comparison sheet / Purchase Agreement (Blanket Order, Call for Tenders)",
    "Purchase Order",
    "Vendor Delivery Note",
    "Goods Receipt Note (Receipt)",
    "Quality inspection report",
    "Vendor Bill",
    "Debit note / Vendor credit note",
    "Payment Voucher and Remittance Advice",
    "Bank Statement",
  ],
  masterData: [
    "Vendors (address, tax ID, bank account, payment terms, currency, fiscal position)",
    "Products (purchase UoM, vendor prices and lead times, purchase taxes, bill control policy, product category & valuation)",
    "Approved vendor list / vendor pricelists",
    "Purchase agreements (blanket orders)",
    "Payment terms, taxes, fiscal positions",
    "Warehouses, receiving routes (1/2/3 steps)",
    "Chart of accounts (AP, Stock Input, Stock Valuation, expense accounts), purchase and bank journals",
    "Analytic accounts / budgets (cost centers)",
  ],
  transactionData: [
    "Purchase requisitions / approval requests",
    "RFQs and purchase orders",
    "Receipts and backorders, vendor returns",
    "Vendor bills and refunds",
    "Vendor payments and batch payments",
    "Bank statement lines",
  ],
  approvals: [
    "Requisition approval by budget owner",
    "New vendor onboarding (Purchasing Manager + Finance for bank details)",
    "Purchase order approval above amount threshold",
    "Price/quantity variance on vendor bill",
    "Payment release (authorized signatory)",
  ],
  accountingImpact: `## Accounting impact of Procure to Pay

Example: purchase of 100 units at 50 = 5,000 + 15% input tax 750. Automated (perpetual) valuation, AVCO.

### 1. Purchase order confirmed
No journal entry — a PO is a commitment, not a liability.

### 2. Goods receipt validated
| Account | Debit | Credit |
|---|---:|---:|
| Stock Valuation (inventory asset) | 5,000 | |
| Stock Input (interim – goods received not invoiced) | | 5,000 |

### 3. Vendor bill posted
| Account | Debit | Credit |
|---|---:|---:|
| Stock Input (interim) | 5,000 | |
| Tax Receivable (Input VAT/GST) | 750 | |
| Accounts Payable | | 5,750 |

### 4. Payment registered (Odoo 17.0)
| Account | Debit | Credit |
|---|---:|---:|
| Accounts Payable | 5,750 | |
| Outstanding Payments | | 5,750 |

### 5. Bank statement reconciled
| Account | Debit | Credit |
|---|---:|---:|
| Outstanding Payments | 5,750 | |
| Bank | | 5,750 |

### Key points
- The **Stock Input** balance at month end = goods received but not yet billed (an accrued liability). If the bill arrives before the goods, the account carries a debit balance (billed not received).
- **Services and non-stock items** are expensed on the bill: Dr Expense / Dr Input Tax / Cr AP.
- **Price differences** between PO and bill are handled per costing method: for AVCO/FIFO Odoo adjusts the stock value of units still on hand (and posts the rest to the price difference/expense account); for Standard price the difference goes to the price difference account.
- With **manual (periodic)** valuation the bill posts directly to the purchase/expense account.`,
  inventoryImpact: `## Inventory impact of Procure to Pay

| Step | Stock movement | Quantity effect |
|---|---|---|
| RFQ | None | None |
| PO confirmed | Receipt created (Partners/Vendors ▸ WH/Stock or WH/Input) | Forecast (incoming) increases |
| Receipt validated (1-step) | Partners/Vendors ▸ WH/Stock | On hand increases |
| 2-step / 3-step reception | Vendors ▸ WH/Input ▸ (WH/Quality Control) ▸ WH/Stock | Goods visible but staged until put-away |
| Return to vendor | WH/Stock ▸ Partners/Vendors | On hand decreases; refund expected |

- **Costing**: AVCO recalculates average cost on each receipt; FIFO creates a new cost layer; Standard keeps the fixed cost.
- **Lots/serials and expiry dates** are captured at receipt.
- **Put-away rules** (Inventory ▸ Configuration ▸ Putaway Rules, with Storage Locations enabled) direct goods to the right shelf.
- **Landed costs** (freight, duty) can be added to stock value with the Landed Costs feature (Inventory settings; verify edition in your instance).`,
  exceptions: [
    { title: "Maverick buying (purchases without PO)", mitigation: "Policy 'No PO, no pay'; restrict bill creation without PO; review bills without purchase origin monthly." },
    { title: "Partial or excess delivery", mitigation: "Create backorder for shortages; reject or return excess; set bill control to 'Received quantities' so only received quantities can be billed." },
    { title: "Price on bill differs from PO", mitigation: "3-way match before payment; tolerance policy; involve buyer to obtain credit note or approve variance." },
    { title: "Damaged or non-conforming goods", mitigation: "2/3-step receipt with quality location; Quality app checks (Enterprise); return to vendor and request credit note." },
    { title: "Duplicate vendor bill", mitigation: "Mandatory vendor reference on bills — Odoo warns on duplicate vendor reference; restrict who can post bills." },
    { title: "Fraudulent change of vendor bank account", mitigation: "Segregate vendor master maintenance from payment; verify bank changes by call-back; review audit log in chatter." },
    { title: "Late vendor deliveries stopping operations", mitigation: "Track vendor on-time performance; maintain safety stock via reordering rules; expedite through activities on late receipts." },
  ],
  kpis: [
    { name: "PO cycle time", formula: "Average (PO confirmation date − requisition/RFQ creation date) in days" },
    { name: "Vendor on-time delivery rate", formula: "Receipts received on or before expected date ÷ Total receipts × 100" },
    { name: "Purchase price variance (PPV)", formula: "(Actual bill price − PO/standard price) × Quantity" },
    { name: "3-way match first-pass rate", formula: "Bills matched without exception ÷ Total bills × 100" },
    { name: "Days Payable Outstanding (DPO)", formula: "(Accounts payable balance ÷ Cost of purchases for the period) × Days in period" },
    { name: "Spend under PO %", formula: "Spend with an approved PO ÷ Total spend × 100" },
    { name: "Early-payment discount capture", formula: "Discounts taken ÷ Discounts available × 100" },
  ],
  reports: [
    "Purchase ▸ Reporting ▸ Purchase (Purchase Analysis: spend by vendor/product, qty ordered/received/billed, on-time delivery)",
    "Inventory ▸ Reporting ▸ Moves Analysis / Moves History (receipts)",
    "Accounting ▸ Reporting ▸ Aged Payable (Enterprise)",
    "Vendors ▸ Bills list grouped by due date (payment planning)",
    "Accounting ▸ Reporting ▸ General Ledger – Stock Input account (goods received not invoiced) (Enterprise)",
    "Accounting ▸ Reporting ▸ Profit and Loss / Balance Sheet (Enterprise)",
  ],
  odooHandling: `## How Odoo handles Procure to Pay

### Apps involved
- **Purchase** – RFQs, purchase orders, vendor pricelists, purchase agreements, PO approval.
- **Inventory** – receipts, backorders, returns, put-away, reordering rules / replenishment.
- **Invoicing** (Community) / **Accounting** (Enterprise) – vendor bills, payments, reconciliation.
- Optional: **Approvals** (Enterprise) for purchase requests; **Quality** (Enterprise) for inspection; **Documents** (Enterprise) / bill digitization (OCR).

### Key settings (Purchase ▸ Configuration ▸ Settings)
- **Purchase Order Approval** – two-step validation with a minimum amount.
- **Purchase Agreements** – Blanket Orders and Calls for Tenders.
- **Bill Control** – default 'Ordered quantities' or 'Received quantities' (per product it can be overridden).
- **3-way matching** – adds a 'Should Be Paid' indicator on bills (Enterprise; verify in your training instance).
- **Vendor pricelists**, **Purchase Warnings**, **Lock confirmed orders**.

### Standard vs Enterprise vs customization
| Need | How delivered |
|---|---|
| RFQ ▸ PO ▸ Receipt ▸ Bill ▸ Payment | Standard |
| Single-threshold PO approval | Standard configuration |
| Employee purchase requests with approval flow | Approvals app (Enterprise) |
| Multi-level approvals by amount/department | Approvals app or customization |
| Budget check at PO | Budgets (Enterprise Accounting) for reporting; blocking needs customization |
| Bill OCR, bank reconciliation widget, Aged Payable | Enterprise |

### Consultant tips
- Agree the meaning of "requisition" with the client — many expect an internal request, while the Odoo module named purchase_requisition provides vendor agreements.
- Use **'Received quantities'** bill control for stock items to enforce the 3-way match in practice.
- Reconcile the **Stock Input** account every month end — it is the best indicator of unmatched receipts and bills.`,
  video: `\`\`\`visual-video
{
  "src": "/videos/p2p-explained.mp4",
  "poster": "/videos/p2p-explained.webp",
  "title": "Procure to Pay, explained",
  "duration": "5:37",
  "caption": "Narrated explainer built from this process: the steps, who does what, the Odoo documents, the journal entries, risks and controls.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 17,
      "label": "What is P2P?"
    },
    {
      "t": 41,
      "label": "Who is involved"
    },
    {
      "t": 67,
      "label": "The 7 steps"
    },
    {
      "t": 93,
      "label": "Steps 1 and 2"
    },
    {
      "t": 119,
      "label": "Step 3"
    },
    {
      "t": 143,
      "label": "Step 4"
    },
    {
      "t": 172,
      "label": "Step 5"
    },
    {
      "t": 200,
      "label": "Step 6"
    },
    {
      "t": 229,
      "label": "Step 7"
    },
    {
      "t": 252,
      "label": "Accounting impact"
    },
    {
      "t": 284,
      "label": "Risks and controls"
    },
    {
      "t": 316,
      "label": "Recap"
    }
  ]
}
\`\`\``,
  example: {
    company: "Stonebridge Builders Ltd. (fictional mid-size construction contractor)",
    narrative: `\`\`\`visual-story
{
  "title": "Procure to Pay: Stonebridge buys 200 bags of cement",
  "company": "Stonebridge Builders · fictional",
  "layout": "timeline",
  "pace": 7,
  "intro": "This animation follows one purchase through Odoo, from the site's need to the payment to the vendor. Each lane is a department or an outside party. The box is the document, and when it moves to another lane, the work has been handed over.",
  "legend": "Lanes are departments or outside parties. Numbered gates are the events in time order, left to right. The box is the document; a lane change is a handover.",
  "stations": [
    {
      "id": "site",
      "label": "Site & project",
      "icon": "building",
      "app": "Project"
    },
    {
      "id": "purchasing",
      "label": "Purchasing",
      "icon": "cart",
      "app": "Purchase"
    },
    {
      "id": "vendor",
      "label": "Vendor: CemCo",
      "icon": "truck",
      "app": "Outside Stonebridge",
      "outside": true
    },
    {
      "id": "warehouse",
      "label": "Site store",
      "icon": "warehouse",
      "app": "Inventory"
    },
    {
      "id": "ap",
      "label": "Accounts payable",
      "icon": "landmark",
      "app": "Accounting"
    },
    {
      "id": "bank",
      "label": "Bank",
      "icon": "bank",
      "outside": true
    }
  ],
  "scenes": [
    {
      "at": "2 Jun",
      "to": "site",
      "carry": "Material need",
      "title": "Material needed for the next pour",
      "text": "Site engineer **Rahul** needs **200 bags of cement** and **5 tonnes of reinforcement steel** on site by **12 June**.",
      "say": "Stonebridge is building a twenty-four unit residential block. Site engineer Rahul sees that the next pour needs two hundred bags of cement and five tonnes of steel, on site by the twelfth of June."
    },
    {
      "at": "2 Jun",
      "from": "site",
      "to": "purchasing",
      "carry": "Purchase request",
      "document": "Purchase request (Approvals)",
      "title": "Purchase request approved within budget",
      "text": "Rahul submits a **purchase request** in the Approvals app, tagged to the project's analytic account. The project manager approves it within the **9,000** budget and Odoo generates draft RFQs.",
      "say": "Rahul raises a purchase request in the Approvals app and tags it to the project, so the cost will land on the right budget. The project manager approves it within the nine thousand budget, and Odoo creates draft requests for quotation for the buyer."
    },
    {
      "at": "RFQ stage",
      "from": "purchasing",
      "to": "vendor",
      "carry": "3 RFQs",
      "title": "RFQs sent to three approved vendors",
      "text": "Buyer **Meera** sends RFQs. CemCo: 34/bag, 4 days. BuildMart: 32/bag, 10 days. Apex Cement: 35/bag, 3 days.",
      "say": "Buyer Meera sends requests for quotation to three approved vendors. CemCo offers thirty-four a bag with a four day lead time, BuildMart thirty-two with ten days, and Apex Cement thirty-five with three days."
    },
    {
      "at": "RFQ stage",
      "from": "vendor",
      "to": "purchasing",
      "carry": "Quotes back",
      "tone": "warning",
      "title": "Cheapest is not best: CemCo selected",
      "text": "BuildMart is cheapest but cannot deliver by 12 June, so Meera selects **CemCo** (200 × 34 = **6,800**). Steel goes to Ironline at 420/tonne (2,100). Losing RFQs are cancelled with the reason logged in the chatter.",
      "say": "BuildMart is the cheapest, but ten days is too late for the pour, so Meera chooses CemCo at six thousand eight hundred. The steel goes to Ironline. The losing quotes are cancelled, and the reason is recorded, so the decision can be audited later."
    },
    {
      "at": "PO",
      "to": "purchasing",
      "document": "PO · CemCo",
      "tone": "warning",
      "carry": "PO to approve",
      "title": "PO above the approval threshold",
      "text": "The cement PO is 6,800 + 15% tax = **7,820**. The PO approval threshold is **5,000**, so the PO goes to *To Approve* and the purchasing manager approves it.",
      "say": "With fifteen percent tax, the cement order is seven thousand eight hundred and twenty. That is above the five thousand approval threshold, so the order waits in To Approve until the purchasing manager approves it."
    },
    {
      "at": "PO",
      "from": "purchasing",
      "to": "vendor",
      "carry": "PO emailed",
      "document": "WH/IN/00087",
      "title": "PO sent, receipt expected",
      "text": "The approved PO is emailed to CemCo, and Odoo creates the expected receipt **WH/IN/00087**.",
      "say": "The approved order is emailed to CemCo. At the same moment Odoo creates the expected receipt, so the store knows exactly what should arrive."
    },
    {
      "at": "9 Jun",
      "from": "vendor",
      "to": "warehouse",
      "carry": "190 bags",
      "document": "WH/IN/00087",
      "tone": "warning",
      "title": "Short delivery: 190 of 200 bags",
      "text": "CemCo delivers **190 bags**. The storekeeper validates 190 and Odoo creates a **backorder** for 10.",
      "entries": [
        {
          "account": "Stock Valuation",
          "debit": "6,460"
        },
        {
          "account": "Stock Input",
          "credit": "6,460"
        }
      ],
      "say": "On the ninth of June CemCo delivers only one hundred and ninety bags. The storekeeper records what actually arrived, and Odoo keeps a backorder for the missing ten. The stock value goes up, balanced by the Stock Input account until the bill arrives."
    },
    {
      "at": "11 Jun",
      "from": "vendor",
      "to": "warehouse",
      "carry": "10 bags",
      "title": "Backorder received on time",
      "text": "The remaining 10 bags arrive on 11 June, one day before the pour.",
      "entries": [
        {
          "account": "Stock Valuation",
          "debit": "340"
        },
        {
          "account": "Stock Input",
          "credit": "340"
        }
      ],
      "say": "The last ten bags arrive on the eleventh, one day before the pour. The full two hundred bags are now in stock."
    },
    {
      "at": "Bill received",
      "from": "vendor",
      "to": "ap",
      "carry": "Bill at 35/bag",
      "tone": "danger",
      "title": "3-way match fails on price",
      "text": "CemCo bills 200 bags at **35** = 7,000 + tax 1,050. AP accountant **Joseph** creates the bill from the PO: quantity matches the receipt, but the price differs from the PO (34). He puts the bill **on hold**.",
      "say": "CemCo's bill arrives at thirty-five a bag instead of thirty-four. Joseph in accounts payable creates the bill from the purchase order. The quantity matches what was received, but the price does not match the order, so he puts the bill on hold."
    },
    {
      "at": "Bill on hold",
      "from": "ap",
      "to": "purchasing",
      "carry": "Price query",
      "title": "Buyer confirms the agreed price",
      "text": "Joseph contacts Meera, who confirms the agreed price was **34**. CemCo is asked for a corrected bill.",
      "say": "Joseph checks with Meera, who negotiated the deal. She confirms the agreed price was thirty-four, so CemCo is asked for a corrected bill."
    },
    {
      "at": "Corrected bill",
      "from": "vendor",
      "to": "ap",
      "carry": "Corrected bill",
      "tone": "success",
      "title": "Corrected bill posted",
      "text": "CemCo issues a corrected bill: 6,800 + 1,020 tax = **7,820**. The Stock Input account for this PO is now zero.",
      "entries": [
        {
          "account": "Stock Input",
          "debit": "6,800"
        },
        {
          "account": "Tax Receivable",
          "debit": "1,020"
        },
        {
          "account": "Accounts Payable",
          "credit": "7,820"
        }
      ],
      "say": "The corrected bill for seven thousand eight hundred and twenty is posted. It clears the Stock Input account for this order, records the tax that can be claimed back, and creates the amount owed to CemCo."
    },
    {
      "at": "Friday payment run",
      "from": "ap",
      "to": "bank",
      "carry": "Batch payment 7,820",
      "title": "Paid in the weekly payment run",
      "text": "CemCo's terms are **15 Days**. In the Friday payment run the finance manager selects all bills due next week and registers a **batch payment**; the transfer of 7,820 is released.",
      "entries": [
        {
          "account": "Accounts Payable",
          "debit": "7,820"
        },
        {
          "account": "Outstanding Payments",
          "credit": "7,820"
        }
      ],
      "say": "CemCo's terms are fifteen days. In the Friday payment run, the finance manager selects every bill due next week and pays them together as one batch. The amount owed goes to zero, and the money waits in Outstanding Payments until the bank confirms it."
    },
    {
      "at": "Bank statement",
      "from": "bank",
      "to": "ap",
      "carry": "Bank statement",
      "tone": "success",
      "title": "Bank line reconciled",
      "text": "When the bank statement arrives, the line is matched to the payment.",
      "entries": [
        {
          "account": "Outstanding Payments",
          "debit": "7,820"
        },
        {
          "account": "Bank",
          "credit": "7,820"
        }
      ],
      "say": "When the bank statement arrives, the payment line is matched. The money has now left the bank account, and the purchase is fully paid."
    },
    {
      "at": "Pour",
      "from": "warehouse",
      "to": "site",
      "carry": "Cement to site",
      "title": "Cement charged to the project",
      "text": "The cement is consumed by the project through a stock transfer charged to the project's **analytic account**, so the project cost report shows the real material cost.",
      "say": "Finally, the cement goes from the store to the site. The transfer is charged to the project, so the project's cost report shows what the material really cost."
    },
    {
      "at": "Outcome",
      "to": "ap",
      "tone": "success",
      "title": "Procure to pay complete",
      "text": "The 3-way match prevented an overpayment of **200 + tax**. CemCo's delivery: first receipt partial, second on time. Stock Input for the PO is back to zero.",
      "say": "The purchase is complete. Matching the bill against the order and the receipt stopped an overpayment of two hundred plus tax. CemCo's first delivery was short, the second on time, and that record feeds the vendor's performance rating."
    }
  ],
  "counters": [
    {
      "label": "PO value (incl. tax)",
      "values": [
        "—",
        "—",
        "—",
        "6,800 + tax",
        "7,820 · to approve",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820"
      ]
    },
    {
      "label": "Bags received",
      "values": [
        "0 / 200",
        "0 / 200",
        "0 / 200",
        "0 / 200",
        "0 / 200",
        "0 / 200",
        "190 / 200",
        "200 / 200",
        "200 / 200",
        "200 / 200",
        "200 / 200",
        "200 / 200",
        "200 / 200",
        "200 / 200",
        "200 / 200"
      ]
    },
    {
      "label": "Billed",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "8,050 on hold",
        "8,050 on hold",
        "7,820",
        "7,820",
        "7,820",
        "7,820",
        "7,820"
      ]
    },
    {
      "label": "Owed to CemCo",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "7,820",
        "0",
        "0",
        "0",
        "0"
      ]
    }
  ],
  "results": [
    {
      "label": "Cement cost",
      "value": "6,800 + 1,020 tax"
    },
    {
      "label": "Overpayment prevented",
      "value": "200 + tax"
    },
    {
      "label": "Stock Input balance",
      "value": "0"
    },
    {
      "label": "Deliveries",
      "value": "Partial, then on time"
    },
    {
      "label": "Paid",
      "value": "7,820 in the Friday run"
    },
    {
      "label": "Approvals",
      "value": "Request + PO"
    }
  ]
}
\`\`\`

#### The full story

**Stonebridge Builders** is building a 24-unit residential block. On 2 June the site engineer, Rahul, realises the project needs **200 bags of cement** and **5 tonnes of reinforcement steel** for the next pour, required on site by 12 June.

**Requisition.** Stonebridge uses Odoo Enterprise, so Rahul submits a *Purchase Request* in the Approvals app, tagged to the project's analytic account. The project manager approves it within the budget of 9,000 and Odoo generates draft RFQs.

**Vendor selection & RFQ.** The buyer, Meera, sends RFQs to three approved vendors. Responses: *CemCo* 34/bag, 4-day lead time; *BuildMart* 32/bag, 10-day lead time; *Apex Cement* 35/bag, 3-day lead time. BuildMart is cheapest but cannot meet the 12 June date, so Meera selects **CemCo** for cement (200 × 34 = 6,800). Steel goes to *Ironline Steel Traders* at 420/tonne (5 × 420 = 2,100). Losing RFQs are cancelled with a reason logged in the chatter.

**Purchase order.** The cement PO totals 6,800 + 15% tax = 7,820. The company's PO approval threshold is 5,000, so the PO goes to *To Approve*; the purchasing manager approves it and it is emailed to CemCo. Odoo creates receipt WH/IN/00087.

**Goods receipt.** On 9 June CemCo delivers **190 bags** — 10 are short. The storekeeper validates 190 and creates a backorder for 10. Odoo posts Dr Stock Valuation 6,460 / Cr Stock Input 6,460. The remaining 10 bags arrive on 11 June (Dr Stock Valuation 340 / Cr Stock Input 340).

**Vendor bill & 3-way match.** CemCo's bill arrives for 200 bags at **35** = 7,000 + tax 1,050. AP accountant Joseph creates the bill from the PO: the quantity (200) matches the received quantity, but the price (35) differs from the PO (34). He puts the bill on hold and contacts Meera, who confirms the agreed price was 34. CemCo issues a corrected bill for 6,800 + 1,020 tax = **7,820**. Posting it gives Dr Stock Input 6,800 / Dr Tax Receivable 1,020 / Cr Accounts Payable 7,820 — the Stock Input account for this PO is now zero.

**Payment.** CemCo's terms are *15 Days*. In the Friday payment run the finance manager selects all bills due next week, registers a batch payment, and the bank transfer of 7,820 is released (Dr AP / Cr Outstanding Payments). When the bank statement arrives the line is reconciled (Dr Outstanding Payments / Cr Bank).

**Outcome.** The 3-way match prevented an overpayment of 200 + tax. Vendor on-time delivery for CemCo for this PO: first receipt partial, second on time. The cement is consumed to the project via a stock transfer charged to the project's analytic account, so the project's cost report reflects the real material cost.`,
  },
  quiz: {
    slug: "procure-to-pay-quiz",
    title: "Procure to Pay – Knowledge Check",
    passMark: 70,
    questions: [
      {
        prompt: "What journal entry does Odoo post when a purchase order is confirmed?",
        kind: "single",
        options: ["Dr Stock / Cr Accounts Payable", "Dr Expense / Cr Accounts Payable", "No journal entry — a PO is a commitment", "Dr Stock Input / Cr Bank"],
        correct: [2],
        explanation: "A purchase order is a commitment, not a liability. Entries are created at receipt (automated valuation) and at bill posting.",
      },
      {
        prompt: "What does a 3-way match compare?",
        kind: "single",
        options: ["Quotation, sales order and invoice", "Purchase order, goods receipt and vendor bill", "Vendor bill, payment and bank statement", "Requisition, RFQ and purchase order"],
        correct: [1],
        explanation: "The 3-way match confirms that the bill's price matches the PO and its quantity matches what was actually received.",
      },
      {
        prompt: "In automated valuation, what does a credit balance on the Stock Input (interim) account at month end usually represent?",
        kind: "single",
        options: ["Goods received but not yet billed", "Goods billed but not yet received", "Overdue vendor payments", "Inventory write-offs"],
        correct: [0],
        explanation: "The receipt credits Stock Input; the bill debits it. A remaining credit means goods have arrived but the bill has not yet been posted (an accrual).",
      },
      {
        prompt: "The Odoo 'Purchase Agreements' feature (purchase_requisition module) is primarily used for internal employee purchase requests.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Purchase Agreements provide Blanket Orders and Calls for Tenders with vendors. Internal purchase requests with approvals are typically handled with the Approvals app (Enterprise).",
      },
      {
        prompt: "Which settings help enforce purchasing controls in standard Odoo? (select all that apply)",
        kind: "multiple",
        options: ["Purchase Order Approval with a minimum amount", "Bill control based on received quantities", "Automatic payment of all bills on receipt", "Warning on duplicate vendor reference"],
        correct: [0, 1, 3],
        explanation: "PO approval thresholds, 'Received quantities' bill control and duplicate-reference warnings are standard controls. Automatic payment on receipt is not a control and not standard.",
      },
      {
        prompt: "Which KPI shows how long the company takes to pay its vendors?",
        kind: "single",
        options: ["DSO", "DPO", "PPV", "Inventory turnover"],
        correct: [1],
        explanation: "Days Payable Outstanding = (AP balance ÷ purchases) × days in period.",
      },
    ],
  },
};

/* ================================================================== */
/* 3. INVENTORY MANAGEMENT                                             */
/* ================================================================== */

const inventoryManagement: BusinessProcessContent = {
  slug: "inventory-management",
  title: "Inventory Management",
  shortName: "Inventory Management",
  category: "Supply Chain & Warehousing",
  summary:
    "The lifecycle of stock inside the business: creating items, setting up warehouses and locations, loading opening stock, receiving, transferring, reserving and delivering goods, counting stock and valuing inventory in the books.",
  objective:
    "Keep exactly the right quantity of each item in the right place at the right time, with an accurate, auditable record of every movement — so that sales can promise reliably, purchasing buys only what is needed, working capital tied up in stock is minimized, and the inventory value on the balance sheet matches the physical stock.",
  odooVersion: ODOO_VERSION,
  departments: ["Warehouse & Logistics", "Purchasing", "Sales", "Finance – Cost Accounting", "Master Data Management", "Store Operations (retail)"],
  stakeholders: [
    { role: "Master Data Officer", responsibility: "Creates and maintains item records: names, internal references, barcodes, units of measure, categories, tracking and costing settings." },
    { role: "Warehouse Manager", responsibility: "Designs warehouse and location structure, routes and operation types; owns stock accuracy and warehouse KPIs." },
    { role: "Storekeeper / Warehouse Operator", responsibility: "Executes receipts, put-away, internal transfers, picking and deliveries; scans barcodes and records quantities." },
    { role: "Inventory Controller", responsibility: "Plans and supervises cycle counts and physical inventories, investigates differences and approves adjustments." },
    { role: "Inventory Planner / Buyer", responsibility: "Sets reordering rules (min/max), monitors replenishment and avoids stock-outs and overstock." },
    { role: "Cost Accountant", responsibility: "Defines costing methods, reconciles the stock valuation report with the general ledger and books write-downs." },
    { role: "Store Manager (retail)", responsibility: "Requests replenishment from the central warehouse and confirms receipt of transfers at the store." },
  ],
  steps: [
    {
      id: "item-creation",
      title: "Create the item (product master)",
      actor: "Master Data Officer",
      department: "Master Data Management",
      description:
        "Every stocked item needs a product record before it can be bought, stored or sold. Key attributes are the product type, unit of measure, internal reference/SKU, barcode, product category (which carries the costing method and stock accounts), tracking (none, lots or serial numbers), and routes. Wrong settings here cause wrong valuation and wrong stock figures later.",
      document: "Item master / product data sheet",
      odoo:
        "Inventory ▸ Products ▸ Products ▸ New. Odoo 17.0: Product Type = 'Storable Product' for tracked stock ('Consumable' is not tracked in valuation, 'Service' is non-physical). Odoo 18.0: Product Type = 'Goods' with the 'Track Inventory' checkbox replacing 'Storable'. Variants require the Variants setting. Product categories: Inventory ▸ Configuration ▸ Product Categories.",
      impact: "No transactions. The product category defines Costing Method (Standard / AVCO / FIFO), Inventory Valuation (Manual / Automated) and, for automated valuation, the Stock Valuation, Stock Input, Stock Output and Stock Journal accounts.",
      approval: "New items reviewed by Master Data / Finance to avoid duplicates and wrong costing setup.",
    },
    {
      id: "warehouse-setup",
      title: "Set up warehouses, locations and routes",
      actor: "Warehouse Manager / Consultant",
      department: "Warehouse & Logistics",
      description:
        "The physical network is modelled as warehouses (sites) and locations (zones, aisles, shelves, bins). For each warehouse the business decides how many steps are used for receiving and delivering, and which routes move stock between warehouses or stores. This structure determines what operators do every day.",
      document: "Warehouse layout / location map",
      odoo:
        "Inventory ▸ Configuration ▸ Warehouses (incoming/outgoing shipment steps). Enable 'Storage Locations' and 'Multi-Step Routes' in Inventory ▸ Configuration ▸ Settings to manage Inventory ▸ Configuration ▸ Locations and Routes. Operation types: Inventory ▸ Configuration ▸ Operation Types. Inter-warehouse resupply: 'Resupply From' on the warehouse.",
      impact: "No transactions. Location types matter: only 'Internal' locations count as on-hand stock and are valued.",
    },
    {
      id: "opening-stock",
      title: "Load opening stock",
      actor: "Inventory Controller / Consultant",
      department: "Warehouse & Finance",
      description:
        "At go-live the quantities and values of stock on hand in the legacy system are loaded per product, location and lot. The opening quantity must agree with a physical count and the opening value with the legacy balance sheet. Finance and the warehouse jointly sign off the cut-over figures.",
      document: "Opening stock sheet (count sheet with quantities and unit costs)",
      odoo:
        "Inventory ▸ Operations ▸ Physical Inventory: enter or import 'Counted Quantity' per product/location/lot and click 'Apply'. Set the product cost first (for AVCO/Standard) so the opening value is right. Large loads are done by importing the quants list (verify import columns in your training instance).",
      impact:
        "Inventory: Virtual Locations/Inventory adjustment ▸ WH/Stock. Automated valuation: Dr Stock Valuation / Cr counterpart account of the inventory adjustment location (or category Stock Input account if none is set). For go-live, consultants usually point the counterpart to an opening balance / migration clearing account so it can be reconciled with the opening trial balance (verify in your training instance).",
      approval: "Opening stock values signed off by Finance Controller.",
    },
    {
      id: "receipts",
      title: "Receive stock",
      actor: "Storekeeper",
      department: "Warehouse – Receiving",
      description:
        "Goods arriving from vendors (or returns from customers) are checked against the expected receipt, counted and put away. Lots, serial numbers and expiry dates are recorded at this point so the item is traceable throughout its life.",
      document: "Goods Receipt Note",
      odoo:
        "Inventory ▸ Operations ▸ Transfers (filter 'Receipts'), or the Inventory Overview dashboard ▸ Receipts card. Scan with the Barcode app (Enterprise) or type quantities, then 'Validate'. Put-away rules: Inventory ▸ Configuration ▸ Putaway Rules.",
      impact: "On hand increases. Automated valuation: Dr Stock Valuation / Cr Stock Input (interim). AVCO updates the average cost; FIFO creates a new cost layer.",
    },
    {
      id: "transfers",
      title: "Internal and inter-warehouse transfers",
      actor: "Storekeeper / Store Manager",
      department: "Warehouse & Store Operations",
      description:
        "Stock is moved between bins, from bulk to pick-faces, or from the central warehouse to stores. Each move is documented so the system location always matches the physical location. Inter-warehouse transfers typically go via a transit location until the receiving site confirms arrival.",
      document: "Internal Transfer / Stock Transfer Note",
      odoo:
        "Inventory ▸ Operations ▸ Transfers ▸ New with operation type 'Internal Transfers' (requires Storage Locations). Inter-warehouse replenishment via resupply routes generates a delivery from the source warehouse and a receipt at the destination (verify route setup in your training instance).",
      impact: "Quantities move between internal locations; total company on hand unchanged. No journal entry for transfers between internal locations of the same company (the value does not change).",
    },
    {
      id: "reservations",
      title: "Reserve stock for outgoing orders",
      actor: "System / Warehouse Manager",
      department: "Warehouse & Logistics",
      description:
        "When a sales order or manufacturing order needs stock, specific quantities (and lots) are reserved so that two orders do not promise the same units. The removal strategy decides which units are taken first — oldest received (FIFO), latest (LIFO) or first-expiring (FEFO).",
      document: "Reservation on the pick list / delivery order",
      odoo:
        "Reservation happens on the transfer ('Check Availability' button). Reservation method (At Confirmation / Manually / Before scheduled date) is set on the operation type (Inventory ▸ Configuration ▸ Operation Types). Removal strategy is set on the product category or location (FEFO requires Expiration Dates setting). 'Unreserve' releases stock.",
      impact: "No quantity or value change; reserved quantity reduces the free-to-use quantity.",
    },
    {
      id: "delivery",
      title: "Deliver stock",
      actor: "Picker / Dispatcher",
      department: "Warehouse – Shipping",
      description:
        "Reserved stock is picked, packed and shipped to the customer or store. The delivered quantity is validated, lots/serials are confirmed, and a delivery slip accompanies the goods. Partial shipments create backorders.",
      document: "Delivery Order / Delivery Slip",
      odoo: "Inventory ▸ Operations ▸ Transfers (filter 'Deliveries') ▸ 'Validate'. Shipping carriers integrate via the Delivery Methods setting (carrier connectors are mostly Enterprise).",
      impact: "On hand decreases. Automated valuation: Dr Stock Output (interim) / Cr Stock Valuation, then at invoice (Anglo-Saxon) Dr Cost of Goods Sold / Cr Stock Output.",
    },
    {
      id: "stock-count",
      title: "Count stock (cycle count / physical inventory)",
      actor: "Inventory Controller",
      department: "Warehouse & Finance",
      description:
        "Stock is counted periodically to find and correct differences caused by errors, damage or theft. Many companies use cycle counting (a portion of locations every week) instead of a once-a-year full count. Differences are investigated before adjustments are approved, because each adjustment changes the company's profit.",
      document: "Count sheet / Inventory adjustment report",
      odoo:
        "Inventory ▸ Operations ▸ Physical Inventory: filter by location or product, 'Request a Count' assigns counts to users, enter Counted Quantity, then 'Apply' (reason can be entered). Cycle counting: set the annual inventory day in Settings and a count frequency per location (verify in your training instance). Counting with Barcode app is Enterprise.",
      impact:
        "Shortage: WH/Stock ▸ Virtual Locations/Inventory adjustment; automated valuation Dr Inventory Loss (adjustment expense) / Cr Stock Valuation. Surplus: the reverse entry.",
      approval: "Adjustments above a value threshold approved by Inventory Controller / Finance (restrict 'Apply' to Inventory Administrators).",
    },
    {
      id: "valuation",
      title: "Value inventory and reconcile to the ledger",
      actor: "Cost Accountant",
      department: "Finance – Cost Accounting",
      description:
        "At each period end Finance confirms that the value of inventory in the stock valuation report equals the inventory balance in the general ledger. Slow-moving or obsolete items are reviewed for write-down, and landed costs are allocated to the items that caused them.",
      document: "Inventory valuation report / stock reconciliation",
      odoo:
        "Inventory ▸ Reporting ▸ Valuation (stock valuation layers by product, with quantity and value). Compare with the Stock Valuation account balance in Accounting ▸ Reporting ▸ Balance Sheet / General Ledger (Enterprise). Landed Costs: Inventory ▸ Operations ▸ Landed Costs after enabling the setting. Revaluation of AVCO/FIFO items can be done from the valuation report (verify in your training instance).",
      impact: "Write-down example: Dr Inventory Write-down Expense / Cr Stock Valuation. Landed costs: Dr Stock Valuation / Cr Freight/Customs clearing account.",
      approval: "Write-downs and revaluations approved by Finance Controller.",
    },
  ],
  documents: [
    "Item master data sheet",
    "Warehouse / location map",
    "Opening stock count sheet",
    "Goods Receipt Note",
    "Internal transfer / stock transfer note",
    "Pick list, packing list, delivery slip",
    "Cycle count sheet and inventory adjustment report",
    "Inventory valuation report",
    "Landed cost allocation sheet",
  ],
  masterData: [
    "Products and variants (type, UoM, SKU, barcode, weight/volume)",
    "Product categories (costing method, valuation mode, stock accounts)",
    "Units of measure and UoM categories",
    "Warehouses, locations, routes, operation types",
    "Reordering rules (min/max) and replenishment settings",
    "Lots / serial numbers, expiry settings",
    "Putaway and removal strategies",
    "Vendors with lead times; customers with delivery addresses",
  ],
  transactionData: [
    "Receipts, deliveries and internal transfers",
    "Stock moves and move lines (with lots/serials)",
    "Inventory adjustments / quant updates",
    "Scrap orders",
    "Stock valuation layers and landed costs",
    "Replenishment / reordering suggestions",
  ],
  approvals: [
    "New item creation and costing setup (Master Data / Finance)",
    "Inventory adjustments above threshold (Inventory Controller)",
    "Scrap and write-off of damaged or expired goods (Warehouse Manager + Finance)",
    "Inventory revaluation / write-down (Finance Controller)",
  ],
  accountingImpact: `## Accounting impact of inventory movements (automated valuation)

Assume item *Denim Jacket*, AVCO, average cost 40.

| Movement | Debit | Credit |
|---|---|---|
| Opening stock 500 units (20,000) | Stock Valuation 20,000 | Opening balance / migration clearing 20,000 |
| Receipt 100 units at 46 (4,600) | Stock Valuation 4,600 | Stock Input (interim) 4,600 |
| Vendor bill for the receipt | Stock Input 4,600 + Input Tax | Accounts Payable |
| Internal transfer WH ▸ Store (same company) | — no entry — | — |
| Delivery 50 units at avg 41 (2,050) | Stock Output (interim) 2,050 | Stock Valuation 2,050 |
| Customer invoice (Anglo-Saxon) | Cost of Goods Sold 2,050 | Stock Output 2,050 |
| Count shortage 3 units (123) | Inventory Loss / Adjustment expense 123 | Stock Valuation 123 |
| Scrap 2 damaged units (82) | Scrap expense 82 | Stock Valuation 82 |
| Landed cost (freight 300) | Stock Valuation 300 | Freight clearing / AP 300 |

New average after receipt: (500 × 40 + 100 × 46) ÷ 600 = 41.00.

### Manual (periodic) valuation
No entries are posted by stock moves. The accountant posts a period-end entry to adjust the inventory account to the valuation report, e.g. Dr Inventory / Cr Change in Inventory (P&L).

### Reconciliation rule
**Inventory ▸ Reporting ▸ Valuation total = balance of the Stock Valuation account(s).** Differences usually come from manual journal entries posted to the stock account, changes of product category/costing method, or opening stock posted against the wrong account.`,
  inventoryImpact: `## Inventory impact by step

| Step | From location | To location | On hand | Reserved |
|---|---|---|---|---|
| Opening stock | Inventory adjustment (virtual) | WH/Stock | + | – |
| Receipt | Partners/Vendors | WH/Stock (or WH/Input) | + | – |
| Internal transfer | WH/Stock/Shelf A | WH/Stock/Shelf B | 0 (location changes) | – |
| Inter-warehouse | WH/Stock | Transit ▸ STORE/Stock | moves between warehouses | – |
| Reservation | — | — | 0 | + |
| Delivery | WH/Stock | Partners/Customers | – | released |
| Count shortage | WH/Stock | Inventory adjustment (virtual) | – | – |
| Scrap | WH/Stock | Virtual/Scrap | – | – |

### Quantity concepts in Odoo
- **On Hand** – physically in internal locations.
- **Forecasted** – on hand + incoming − outgoing (planned moves).
- **Free to use / Available** – on hand − reserved.

### Removal strategies
FIFO (first in, first out), LIFO, FEFO (first expiry first out), Closest Location, Least Packages — configured on product category or location.`,
  exceptions: [
    { title: "Duplicate or badly configured items", mitigation: "Mandatory internal reference and barcode uniqueness; restrict product creation to Master Data role; review category/costing before first transaction." },
    { title: "Negative stock (delivering more than recorded on hand)", mitigation: "Investigate missing receipts; train operators to validate receipts before deliveries; monitor negative quants report (filter Negative Stock in Inventory ▸ Reporting ▸ Stock)." },
    { title: "Stock in wrong location", mitigation: "Barcode scanning of source/destination locations; put-away rules; regular cycle counts of high-movement bins." },
    { title: "Shrinkage / theft", mitigation: "ABC cycle counting, restricted access, adjustment reason codes and approval above threshold, CCTV for high-value items." },
    { title: "Expired or obsolete stock", mitigation: "Enable expiration dates and FEFO; review aging monthly; write down obsolete items with Finance approval." },
    { title: "Valuation report does not match ledger", mitigation: "Forbid manual journal entries on stock accounts (lock or review); never change costing method with stock on hand without a planned revaluation; reconcile monthly." },
    { title: "Stock-outs of fast movers", mitigation: "Min/max reordering rules with lead times and safety stock; review Replenishment screen daily." },
  ],
  kpis: [
    { name: "Inventory accuracy", formula: "Locations (or SKUs) with count = system ÷ Locations counted × 100" },
    { name: "Inventory turnover", formula: "Cost of goods sold for the period ÷ Average inventory value" },
    { name: "Days Inventory Outstanding (DIO)", formula: "(Average inventory value ÷ COGS) × Days in period" },
    { name: "Stock-out rate", formula: "Order lines not fulfilled from stock ÷ Total order lines × 100" },
    { name: "Shrinkage %", formula: "Value of negative adjustments and scrap ÷ Average inventory value × 100" },
    { name: "Dock-to-stock time", formula: "Average (put-away completion time − goods arrival time)" },
    { name: "Order fill rate", formula: "Quantity shipped complete on first delivery ÷ Quantity ordered × 100" },
  ],
  reports: [
    "Inventory ▸ Reporting ▸ Stock (on hand by product/location/lot)",
    "Inventory ▸ Reporting ▸ Valuation (stock valuation layers)",
    "Inventory ▸ Reporting ▸ Moves History / Moves Analysis",
    "Inventory ▸ Operations ▸ Replenishment (reordering suggestions)",
    "Product forecasted report (from the product form 'Forecasted' button)",
    "Lots/Serial Numbers traceability report",
    "Accounting ▸ Reporting ▸ Balance Sheet / General Ledger for stock accounts (Enterprise)",
  ],
  odooHandling: `## How Odoo handles inventory management

### Apps involved
- **Inventory** – products, warehouses, locations, routes, transfers, reservations, physical inventory, replenishment, valuation.
- **Purchase / Sales / Manufacturing / Point of Sale** – generate the receipts and deliveries.
- **Barcode** (Enterprise) – scanning for receipts, transfers, picking and counting.
- **Accounting / Invoicing** – journal entries for automated valuation.

### Key settings (Inventory ▸ Configuration ▸ Settings)
- **Storage Locations**, **Multi-Step Routes** – required for bins and multi-step flows.
- **Lots & Serial Numbers**, **Expiration Dates** – traceability and FEFO.
- **Packages**, **Units of Measure**, **Variants** (Sales/Inventory settings).
- **Landed Costs** – capitalize freight and duty.
- Product Category ▸ **Costing Method** and **Inventory Valuation** (Automated requires Accounting/Invoicing installed).

### Version notes
- **17.0:** product types Consumable / Service / Storable Product.
- **18.0:** product types Goods / Service / Combo, with a **Track Inventory** checkbox on Goods replacing "Storable Product".

### Standard vs Enterprise vs customization
| Need | How delivered |
|---|---|
| Warehouses, routes, transfers, counts, valuation report | Standard |
| Barcode scanning app, carrier connectors, Quality checks | Enterprise |
| Approval workflow for adjustments | Access rights (standard) or customization |
| Bin-level ABC classification | Customization / third-party (OCA) |

### Consultant tips
- Decide costing method per category **before** go-live — changing later requires revaluation.
- Keep the number of steps minimal; every extra step is daily work for operators.
- Use a dedicated **opening balance clearing account** for opening stock and reconcile it to the legacy trial balance.`,
  video: `\`\`\`visual-video
{
  "src": "/videos/inventory-explained.mp4",
  "poster": "/videos/inventory-explained.webp",
  "title": "Inventory Management, explained",
  "duration": "6:21",
  "caption": "Narrated explainer built from this process: the steps, who does what, the Odoo documents, the journal entries, risks and controls.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 16,
      "label": "What is it?"
    },
    {
      "t": 43,
      "label": "Who is involved"
    },
    {
      "t": 70,
      "label": "The 9 steps"
    },
    {
      "t": 98,
      "label": "Steps 1 and 2"
    },
    {
      "t": 130,
      "label": "Step 3"
    },
    {
      "t": 156,
      "label": "Step 4"
    },
    {
      "t": 184,
      "label": "Step 5"
    },
    {
      "t": 208,
      "label": "Steps 6 and 7"
    },
    {
      "t": 238,
      "label": "Step 8"
    },
    {
      "t": 268,
      "label": "Step 9"
    },
    {
      "t": 295,
      "label": "Accounting impact"
    },
    {
      "t": 325,
      "label": "Risks and controls"
    },
    {
      "t": 357,
      "label": "Recap"
    }
  ]
}
\`\`\``,
  example: {
    company: "UrbanThread Retail Pvt. Ltd. (fictional fashion retailer with one central warehouse and two stores)",
    narrative: `\`\`\`visual-story
{
  "title": "Inventory: UrbanThread moves denim jackets",
  "company": "UrbanThread Retail · fictional",
  "token": "box",
  "pace": 7,
  "intro": "This animation follows one product, the Classic Denim Jacket in size M, through UrbanThread's warehouse and stores. Buildings are locations, parcels are documents, and trucks carry the goods. What happens at each place is shown on the spot.",
  "legend": "Buildings are locations. Parcels are documents, trucks carry goods. The badge under a building shows the work happening there.",
  "stations": [
    {
      "id": "office",
      "label": "Head office · data team",
      "icon": "building",
      "app": "Inventory settings",
      "x": 0,
      "y": 0
    },
    {
      "id": "input",
      "label": "CWH · Input dock",
      "icon": "package",
      "app": "Receipts",
      "x": 3,
      "y": 0
    },
    {
      "id": "stock",
      "label": "CWH · Stock A-01",
      "icon": "warehouse",
      "app": "Central warehouse",
      "x": 4,
      "y": 2
    },
    {
      "id": "north",
      "label": "Store North",
      "icon": "store",
      "app": "Store warehouse",
      "x": 3,
      "y": 4
    },
    {
      "id": "customer",
      "label": "Online customer",
      "icon": "user",
      "app": "Outside UrbanThread",
      "x": 1,
      "y": 4,
      "outside": true
    },
    {
      "id": "vendor",
      "label": "Vendor",
      "icon": "factory",
      "app": "Outside UrbanThread",
      "x": 0,
      "y": 2,
      "outside": true
    }
  ],
  "scenes": [
    {
      "at": "Before go-live",
      "to": "office",
      "action": "Importing 1,200 products",
      "document": "Product import",
      "title": "Products created with the right valuation",
      "text": "The master data officer imports **1,200 products**. The Classic Denim Jacket has variants S, M and L, each a storable product with a barcode, unit *Units* and category *Apparel / Outerwear* set to **AVCO** and **automated** valuation.",
      "say": "Before go-live, the master data officer imports twelve hundred products. The denim jacket has three sizes, each with its own barcode. Its category uses average costing with automated valuation, so every stock movement will also post to the accounts."
    },
    {
      "at": "Before go-live",
      "from": "office",
      "to": "stock",
      "carry": "Routes & bins",
      "action": "Setting up routes and bins",
      "title": "Warehouse flows configured",
      "text": "CWH uses **2-step receipts** (Input, then Stock) and 1-step delivery. Each store is its own warehouse, resupplied from CWH. Storage locations such as **CWH/Stock/A-01** are enabled.",
      "say": "The central warehouse receives goods in two steps: first at the input dock, then into stock. Each store is set up as its own small warehouse that is resupplied from the centre, and the central stock is split into bins such as A zero one."
    },
    {
      "at": "31 Mar",
      "to": "stock",
      "action": "Counting 500 jackets",
      "document": "Inventory adjustment",
      "title": "Opening stock counted and valued",
      "text": "The team counts **500 jackets** size M at the legacy cost of 40, so the opening value is **20,000**. The adjustment posts to *Opening Balance Clearing*, which Finance ties back to the legacy balance sheet.",
      "entries": [
        {
          "account": "Stock Valuation",
          "debit": "20,000"
        },
        {
          "account": "Opening Balance Clearing",
          "credit": "20,000"
        }
      ],
      "say": "On the thirty-first of March the team counts five hundred jackets at the old cost of forty, which is twenty thousand. The count is posted against an opening balance clearing account, so finance can tie it back to the old system's balance sheet."
    },
    {
      "at": "5 Apr",
      "from": "vendor",
      "to": "input",
      "token": "truck",
      "carry": "100 jackets",
      "action": "Unloading 100 jackets",
      "document": "Receipt · step 1",
      "title": "Goods arrive at the input dock",
      "text": "**100 jackets** arrive at 46 each. Validating the first receipt step brings them into the company at the input dock.",
      "entries": [
        {
          "account": "Stock Valuation",
          "debit": "4,600"
        },
        {
          "account": "Stock Input",
          "credit": "4,600"
        }
      ],
      "say": "On the fifth of April a truck brings one hundred more jackets at forty-six each. They are unloaded at the input dock. As soon as the receipt is validated, the goods belong to UrbanThread, and their value enters the stock account."
    },
    {
      "at": "5 Apr",
      "from": "input",
      "to": "stock",
      "carry": "Put-away",
      "action": "Put-away to bin A-01",
      "document": "Receipt · step 2",
      "title": "Put away; average cost becomes 41.00",
      "text": "The second step moves the jackets into stock. The average cost becomes (20,000 + 4,600) ÷ 600 = **41.00**. Moving inside the warehouse posts no journal entry.",
      "say": "The second step moves the jackets from the dock to their bin. This is just a change of location, so nothing is posted. The average cost is now twenty-four thousand six hundred divided by six hundred, which is forty-one."
    },
    {
      "at": "Store request",
      "from": "stock",
      "to": "north",
      "token": "truck",
      "carry": "120 jackets",
      "action": "Unloading at the store",
      "title": "Resupply truck to Store North",
      "text": "Store North requests **120 jackets**. The resupply route creates a delivery from CWH and a receipt at the store.",
      "say": "Store North asks for one hundred and twenty jackets. The resupply route creates two linked documents: a delivery out of the central warehouse, and a receipt at the store. The truck leaves with the goods."
    },
    {
      "at": "Two days later",
      "to": "north",
      "action": "Checking in 120 jackets",
      "tone": "success",
      "title": "Store validates the arrival",
      "text": "The store manager validates the receipt two days later. Total company value is unchanged, so there is **no journal entry**.",
      "say": "Two days later the store manager checks in the delivery. The jackets have only moved between two locations of the same company, so the total stock value does not change, and no journal entry is needed."
    },
    {
      "at": "Online order",
      "from": "customer",
      "to": "stock",
      "carry": "Order: 30 jackets",
      "action": "Reserving 30 jackets",
      "title": "Online order reserves stock",
      "text": "An online order for **30 jackets** reserves units in CWH at confirmation. Free-to-use quantity drops from 480 to **450**, while on hand stays 480.",
      "say": "An online customer orders thirty jackets. Odoo reserves them in the central warehouse straight away. On hand is still four hundred and eighty, but only four hundred and fifty are now free for other orders."
    },
    {
      "at": "9 Apr",
      "from": "stock",
      "to": "customer",
      "token": "truck",
      "carry": "30 jackets",
      "action": "Delivered to the customer",
      "document": "Delivery order",
      "title": "30 jackets shipped",
      "text": "The 30 jackets ship on 9 April at the average cost of 41. COGS of 1,230 is recognised when the order is invoiced.",
      "entries": [
        {
          "account": "Stock Output",
          "debit": "1,230"
        },
        {
          "account": "Stock Valuation",
          "credit": "1,230"
        }
      ],
      "say": "On the ninth of April the thirty jackets are picked, packed and shipped. Their cost, thirty times forty-one, leaves the stock account. It becomes cost of goods sold when the order is invoiced."
    },
    {
      "at": "April cycle count",
      "to": "stock",
      "action": "Counting zone A",
      "tone": "warning",
      "document": "Count · reason Shrinkage",
      "title": "Cycle count finds 3 missing",
      "text": "The system shows **450** jackets M in zone A, but the team counts **447**. The controller checks receipts and transfers, finds no error, and applies the adjustment with reason *Shrinkage*.",
      "entries": [
        {
          "account": "Inventory Loss",
          "debit": "123"
        },
        {
          "account": "Stock Valuation",
          "credit": "123"
        }
      ],
      "say": "During the April cycle count of zone A, the system says four hundred and fifty, but the team finds four hundred and forty-seven. The controller checks for a missed receipt or transfer, finds none, and records three jackets as shrinkage."
    },
    {
      "at": "Month end",
      "from": "stock",
      "to": "office",
      "carry": "Valuation report",
      "action": "Reconciling 21,607",
      "tone": "success",
      "title": "Stock report matches the balance sheet",
      "text": "Inventory valuation: 447 at CWH + 120 at Store North − 40 sold in store = **527 jackets × 41 = 21,607**. The Stock Valuation account shows the same 21,607: reconciled.",
      "say": "At month end the valuation report shows five hundred and twenty-seven jackets at forty-one, which is twenty-one thousand six hundred and seven. The stock account in the balance sheet shows exactly the same, so stock and accounts are reconciled."
    },
    {
      "at": "April KPIs",
      "to": "office",
      "tone": "success",
      "title": "Inventory under control",
      "text": "Inventory accuracy **96%** (48 of 50 bins exact), shrinkage **0.5%**, turnover on track for **6×** per year.",
      "say": "The April results: ninety-six percent of bins were exactly right, shrinkage was half a percent, and stock is turning over at a pace of about six times a year."
    }
  ],
  "counters": [
    {
      "label": "CWH on hand",
      "values": [
        "0",
        "0",
        "500",
        "500 + 100 at dock",
        "600",
        "480",
        "480",
        "480 (450 free)",
        "450",
        "447",
        "447",
        "447"
      ]
    },
    {
      "label": "Store North",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "120 in transit",
        "120",
        "120",
        "120",
        "120",
        "80 (40 sold)",
        "80"
      ]
    },
    {
      "label": "Average cost",
      "values": [
        "—",
        "—",
        "40.00",
        "41.00",
        "41.00",
        "41.00",
        "41.00",
        "41.00",
        "41.00",
        "41.00",
        "41.00",
        "41.00"
      ]
    },
    {
      "label": "Stock value",
      "values": [
        "0",
        "0",
        "20,000",
        "24,600",
        "24,600",
        "24,600",
        "24,600",
        "24,600",
        "23,370",
        "23,247",
        "21,607",
        "21,607"
      ]
    }
  ],
  "results": [
    {
      "label": "Stock value (reconciled)",
      "value": "21,607"
    },
    {
      "label": "Average cost",
      "value": "41.00"
    },
    {
      "label": "Inventory accuracy",
      "value": "96%"
    },
    {
      "label": "Shrinkage",
      "value": "0.5%"
    },
    {
      "label": "Turnover",
      "value": "On track for 6× a year"
    },
    {
      "label": "Journal entry for transfers",
      "value": "None needed"
    }
  ]
}
\`\`\`

#### The full story

**UrbanThread** sells casual clothing through a central warehouse (*CWH*) and two city stores (*Store North*, *Store South*). It goes live on Odoo 17 on 1 April.

**Item creation.** The master data officer imports 1,200 products. For the *Classic Denim Jacket* there are size variants S, M, L; each is a Storable Product with a barcode, UoM *Units*, and category *Apparel / Outerwear* configured with **AVCO** and **Automated** valuation (Stock Valuation 1101, Stock Input 2105, Stock Output 1105).

**Warehouse setup.** CWH uses 2-step receipt (Input ▸ Stock) and 1-step delivery; each store is a separate warehouse with 1-step flows and a resupply route from CWH. Storage Locations are enabled and CWH has bins such as CWH/Stock/A-01.

**Opening stock.** On 31 March the team counts 500 jackets size M at CWH. Legacy cost is 40, so the opening value is 20,000. The consultant has set the inventory adjustment location's counterpart to *Opening Balance Clearing*; applying the count posts Dr Stock Valuation 20,000 / Cr Opening Balance Clearing 20,000, which Finance ties back to the legacy balance sheet.

**Receipts.** On 5 April 100 more jackets arrive at 46 each. After validation the average cost becomes (20,000 + 4,600) ÷ 600 = **41.00**.

**Transfers.** Store North requests 120 jackets. The resupply route creates a delivery from CWH and a receipt at Store North; the store manager validates arrival two days later. Total company value is unchanged — no journal entry.

**Reservations.** An online order for 30 jackets reserves units in CWH immediately (reservation at confirmation). Free-to-use quantity drops from 480 to 450 while on hand stays 480.

**Delivery.** The 30 jackets ship on 9 April: Dr Stock Output 1,230 / Cr Stock Valuation 1,230; at invoicing COGS 1,230 is recognized.

**Stock count.** In the April cycle count of zone A, the system shows 450 jackets M but the team counts 447. The controller checks receipts and transfers, finds no error, and applies the adjustment with reason *Shrinkage*: Dr Inventory Loss 123 / Cr Stock Valuation 123.

**Valuation.** At month end, Inventory ▸ Reporting ▸ Valuation shows 447 + 120 (Store North) − 40 sold at the store = 527 jackets × 41 = **21,607**. The Stock Valuation account in the balance sheet shows the same 21,607 for this product family — reconciled.

**KPIs for April:** inventory accuracy 96% (48 of 50 bins exact), shrinkage 0.5%, turnover on track for 6× per year.`,
  },
  quiz: {
    slug: "inventory-management-quiz",
    title: "Inventory Management – Knowledge Check",
    passMark: 70,
    questions: [
      {
        prompt: "Where is the costing method (Standard / AVCO / FIFO) configured in Odoo?",
        kind: "single",
        options: ["On the warehouse", "On the product category", "On the stock location", "On the sales order"],
        correct: [1],
        explanation: "Costing method and inventory valuation mode (manual/automated) are set on the product category, which also holds the stock accounts.",
      },
      {
        prompt: "An internal transfer between two bins of the same warehouse creates a journal entry in automated valuation.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Moves between internal locations of the same company do not change value, so no journal entry is posted.",
      },
      {
        prompt: "On hand = 480, reserved = 30, incoming = 100, outgoing (planned) = 50. What is the free-to-use quantity?",
        kind: "single",
        options: ["480", "450", "530", "500"],
        correct: [1],
        explanation: "Free to use = on hand − reserved = 480 − 30 = 450. Forecasted would be 480 + 100 − 50 = 530.",
      },
      {
        prompt: "A count reveals 3 units missing (cost 41 each). What entry is posted with automated valuation?",
        kind: "single",
        options: ["Dr Stock Valuation 123 / Cr Inventory Loss 123", "Dr Inventory Loss 123 / Cr Stock Valuation 123", "Dr COGS 123 / Cr Accounts Payable 123", "No entry"],
        correct: [1],
        explanation: "A shortage reduces the inventory asset and is expensed through the inventory adjustment (loss) account.",
      },
      {
        prompt: "In Odoo 18.0, what replaces the 17.0 'Storable Product' type?",
        kind: "single",
        options: ["Consumable", "Goods with 'Track Inventory' enabled", "Combo", "Kit"],
        correct: [1],
        explanation: "18.0 uses product type 'Goods' with a 'Track Inventory' checkbox to indicate stock-tracked products.",
      },
      {
        prompt: "Which removal strategy should a food retailer use to ship items closest to expiry first?",
        kind: "single",
        options: ["FIFO", "LIFO", "FEFO", "Closest Location"],
        correct: [2],
        explanation: "FEFO (First Expiry, First Out) requires the Expiration Dates setting and picks lots with the earliest removal/expiry date first.",
      },
    ],
  },
};

/* ================================================================== */
/* 4. RECORD TO REPORT                                                 */
/* ================================================================== */

const recordToReport: BusinessProcessContent = {
  slug: "record-to-report",
  title: "Record to Report (R2R)",
  shortName: "Record to Report",
  category: "Finance & Accounting",
  summary:
    "The financial accounting cycle: designing the chart of accounts, loading opening balances, recording customer, vendor and manual transactions, managing receivables and payables, reconciling bank accounts, producing financial statements and closing the period.",
  objective:
    "Produce complete, accurate and timely financial information: every business transaction is recorded once, in the right account and period, reconciled to external evidence (bank, customers, vendors, tax), and summarized into financial statements that management, auditors, tax authorities and investors can rely on.",
  odooVersion: ODOO_VERSION,
  departments: ["Finance & Accounting", "Accounts Receivable", "Accounts Payable", "Treasury", "Tax", "Management / Board", "External Audit"],
  stakeholders: [
    { role: "Chief Financial Officer / Finance Manager", responsibility: "Owns the close calendar, approves financial statements and accounting policies." },
    { role: "General Ledger Accountant", responsibility: "Maintains the chart of accounts, posts manual journals, accruals, depreciation and reclassifications, and prepares the trial balance." },
    { role: "AR Accountant", responsibility: "Manages customer invoices, receipts, credit notes and follow-ups; reconciles the receivable ledger." },
    { role: "AP Accountant", responsibility: "Records vendor bills, schedules payments and reconciles the payable ledger." },
    { role: "Treasury Officer", responsibility: "Imports bank statements, reconciles bank accounts and manages cash forecasting." },
    { role: "Tax Accountant", responsibility: "Prepares the periodic tax return (VAT/GST) and reconciles tax accounts." },
    { role: "External Auditor", responsibility: "Independently verifies that the financial statements are free from material misstatement." },
  ],
  steps: [
    {
      id: "coa",
      title: "Design the chart of accounts",
      actor: "Finance Manager / Consultant",
      department: "Finance",
      description:
        "The chart of accounts (CoA) is the list of all ledger accounts — assets, liabilities, equity, income and expenses — used to classify transactions. It must satisfy local statutory requirements and management reporting needs while staying simple. Analytic accounts handle dimensions such as department, project or branch so the CoA does not explode.",
      document: "Chart of Accounts",
      odoo:
        "Accounting ▸ Configuration ▸ Chart of Accounts. The fiscal localization package (Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization) installs a country CoA, taxes and fiscal positions. Account types (e.g. Receivable, Payable, Bank and Cash, Current Assets, Income, Expenses) drive report placement. Analytic: enable 'Analytic Accounting' and use Accounting ▸ Configuration ▸ Analytic Accounts / Analytic Plans.",
      impact: "No transactions. Account types determine where balances appear in the Balance Sheet and P&L and whether they are reconcilable.",
      approval: "CoA and accounting policies approved by CFO (and auditor where relevant).",
    },
    {
      id: "opening-balances",
      title: "Load opening balances",
      actor: "GL Accountant / Consultant",
      department: "Finance",
      description:
        "At go-live the closing trial balance from the legacy system becomes the opening balance in Odoo. Receivables and payables should be loaded as open invoice-level items (not one lump sum) so they can be collected and paid, and bank balances must match the bank statement on the cut-over date.",
      document: "Opening trial balance; open AR/AP item lists",
      odoo:
        "Opening balances per account can be entered in Accounting ▸ Configuration ▸ Chart of Accounts (Opening Debit/Credit columns; the difference goes to an undistributed profit/loss account) — verify in your training instance. Alternatively post a Miscellaneous journal entry (Accounting ▸ Accounting ▸ Journal Entries). Open customer invoices and vendor bills are imported individually against an opening clearing account.",
      impact: "Dr assets / Cr liabilities and equity per the legacy trial balance; AR and AP imported as individual open items against a migration clearing account that must end at zero.",
      approval: "Opening balances signed off by CFO.",
    },
    {
      id: "subledger-transactions",
      title: "Record customer and vendor transactions",
      actor: "AR and AP Accountants",
      department: "Finance – AR / AP",
      description:
        "Most entries in a modern ERP originate in operational apps: invoices from Sales, bills from Purchase, stock valuation from Inventory, payroll from HR. Accountants check that these documents carry the correct accounts, taxes and analytic tags. Good sub-ledger discipline means far fewer manual journals.",
      document: "Customer invoices, vendor bills, credit notes, payments",
      odoo: "Accounting ▸ Customers ▸ Invoices / Credit Notes / Payments; Accounting ▸ Vendors ▸ Bills / Refunds / Payments (same menus exist in the Community Invoicing app).",
      impact: "Invoice: Dr AR / Cr Revenue / Cr Tax Payable. Bill: Dr Expense or Stock Input / Dr Tax Receivable / Cr AP.",
    },
    {
      id: "journal-entries",
      title: "Post manual journal entries (accruals, depreciation, adjustments)",
      actor: "GL Accountant",
      department: "Finance – General Ledger",
      description:
        "Some transactions have no operational document: accrued expenses, prepaid expenses, depreciation, payroll summaries, provisions and corrections. These are posted as manual journal entries with clear references and supporting documents. Recurring entries are automated where possible.",
      document: "Journal voucher with supporting schedule",
      odoo:
        "Accounting ▸ Accounting ▸ Journal Entries ▸ New (Miscellaneous Operations journal). Reverse entries via 'Reverse Entry'. Assets & depreciation boards: Accounting ▸ Accounting ▸ Assets (Enterprise). Deferred revenue/expense from invoice line start/end dates (Enterprise, 17.0). Recurring entries are not a standard Community feature (verify options in your edition).",
      impact: "Example accrual: Dr Utilities Expense 1,200 / Cr Accrued Liabilities 1,200, reversed on day 1 of next month.",
      approval: "Manual journals above a threshold reviewed by Finance Manager before posting (four-eyes principle).",
    },
    {
      id: "ar",
      title: "Manage accounts receivable",
      actor: "AR Accountant / Credit Controller",
      department: "Finance – AR",
      description:
        "The receivable ledger is reviewed for overdue items, disputed invoices and unapplied payments. Customers are reminded according to the follow-up policy, and doubtful balances are provided for. At period end the AR sub-ledger (aged receivable) must equal the AR control account.",
      document: "Aged receivable report, customer statements",
      odoo: "Accounting ▸ Reporting ▸ Aged Receivable (Enterprise); follow-ups: Accounting ▸ Customers ▸ Follow-up Reports (Enterprise). Community: filter Invoices by 'Overdue'.",
      impact: "Bad debt provision: Dr Bad Debt Expense / Cr Allowance for Doubtful Debts. Write-off: Dr Allowance / Cr AR.",
    },
    {
      id: "ap",
      title: "Manage accounts payable",
      actor: "AP Accountant",
      department: "Finance – AP",
      description:
        "Payables are reviewed so that every valid liability is recorded and paid on time. Goods received not yet billed are accrued, vendor statements are reconciled, and duplicate or disputed bills are resolved. The aged payable must equal the AP control account.",
      document: "Aged payable report, vendor statement reconciliation",
      odoo: "Accounting ▸ Reporting ▸ Aged Payable (Enterprise). Bills to pay: Accounting ▸ Vendors ▸ Bills, filtered/grouped by due date. Goods received not invoiced: balance of the Stock Input account.",
      impact: "Accrual for unbilled services: Dr Expense / Cr Accrued Liabilities (reversed when bill arrives).",
    },
    {
      id: "bank-reconciliation",
      title: "Reconcile bank accounts",
      actor: "Treasury Officer",
      department: "Finance – Treasury",
      description:
        "Every bank statement line is matched to a payment, invoice, bill or expense in the ledger. Unmatched items (fees, interest, unknown receipts) are investigated and recorded. At period end the bank account balance in the books must equal the bank statement balance.",
      document: "Bank statement, bank reconciliation report",
      odoo:
        "Accounting ▸ Dashboard ▸ bank journal ▸ Reconcile (bank reconciliation widget, Enterprise). Statements via bank synchronization (Enterprise) or file import (CSV, OFX, CAMT.053, depending on modules). Reconciliation Models: Accounting ▸ Configuration ▸ Reconciliation Models.",
      impact: "Dr Bank / Cr Outstanding Receipts (customer receipts); Dr Outstanding Payments / Cr Bank (vendor payments); Dr Bank Charges / Cr Bank (fees).",
    },
    {
      id: "financial-statements",
      title: "Prepare financial statements",
      actor: "GL Accountant / Finance Manager",
      department: "Finance",
      description:
        "Once ledgers are reconciled, the trial balance is reviewed and the financial statements are produced: Balance Sheet, Profit and Loss and Cash Flow Statement, plus management reports by analytic dimension. Variances against budget and prior period are analysed and explained.",
      document: "Trial Balance, Balance Sheet, Profit & Loss, Cash Flow Statement",
      odoo:
        "Accounting ▸ Reporting ▸ Balance Sheet, Profit and Loss, Cash Flow Statement, Trial Balance, General Ledger, Tax Return (Enterprise). Community Invoicing has no standard financial statements (OCA third-party modules exist). Budgets: Accounting ▸ Configuration ▸ Budgets (Enterprise; reworked in 18.0 — verify).",
      impact: "Reporting only; no entries.",
      approval: "Statements reviewed and approved by CFO / Board.",
    },
    {
      id: "period-closing",
      title: "Close the period",
      actor: "Finance Manager",
      department: "Finance",
      description:
        "After review, the period is locked so that no one can post or change entries in it. The tax return is filed and the tax accounts are cleared. At year end, the profit for the year is carried to retained earnings and the year is locked after audit.",
      document: "Close checklist, tax return, lock-date record",
      odoo:
        "Lock dates (Enterprise 17.0: Accounting ▸ Accounting ▸ Lock Dates — verify; 18.0 reworked lock dates per journal type — verify). Tax closing entry generated from the Tax Return report (Enterprise). Year end: Odoo computes 'Current Year Earnings' automatically in the balance sheet; no closing journal is required to reset P&L, but the result is typically moved to retained earnings by a manual entry after approval.",
      impact: "Tax closing: Dr Tax Payable / Cr Tax Receivable / Cr Tax Settlement (payable to authority). Profit allocation: Dr Undistributed Profits / Cr Retained Earnings.",
      approval: "CFO approves close and sets lock date.",
    },
  ],
  documents: [
    "Chart of Accounts and accounting policy manual",
    "Opening trial balance and open item lists",
    "Customer invoices, vendor bills, credit notes",
    "Journal vouchers with supporting schedules",
    "Bank statements and bank reconciliation report",
    "Aged receivable / aged payable reports",
    "Fixed asset register and depreciation schedule",
    "Tax return",
    "Trial balance and financial statements",
    "Month-end close checklist",
  ],
  masterData: [
    "Chart of accounts and account types",
    "Journals (Sales, Purchase, Bank, Cash, Miscellaneous)",
    "Taxes, tax groups and fiscal positions",
    "Fiscal year / periods, lock dates",
    "Currencies and exchange rates",
    "Analytic plans and analytic accounts",
    "Payment terms, bank accounts",
    "Asset models (Enterprise)",
  ],
  transactionData: [
    "Customer invoices and credit notes",
    "Vendor bills and refunds",
    "Payments and bank statement lines",
    "Manual journal entries (accruals, provisions, reclassifications)",
    "Depreciation entries",
    "Tax closing entries",
  ],
  approvals: [
    "Chart of accounts changes (CFO)",
    "Manual journals above threshold (Finance Manager)",
    "Write-offs and provisions (CFO)",
    "Tax return submission (Tax Manager / CFO)",
    "Period lock and financial statements (CFO / Board)",
  ],
  accountingImpact: `## Typical journal entries in Record to Report

| Transaction | Debit | Credit |
|---|---|---|
| Customer invoice 10,000 + 15% tax | Accounts Receivable 11,500 | Revenue 10,000; Tax Payable 1,500 |
| Vendor bill (service) 2,000 + tax | Expense 2,000; Tax Receivable 300 | Accounts Payable 2,300 |
| Accrued rent at month end | Rent Expense 3,000 | Accrued Liabilities 3,000 |
| Reversal on 1st of next month | Accrued Liabilities 3,000 | Rent Expense 3,000 |
| Prepaid insurance amortisation | Insurance Expense 500 | Prepaid Expenses 500 |
| Depreciation | Depreciation Expense 800 | Accumulated Depreciation 800 |
| Bank charges from statement | Bank Charges 25 | Bank 25 |
| Tax closing | Tax Payable 1,500 | Tax Receivable 300; Tax Settlement (payable) 1,200 |
| Allocate yearly profit | Undistributed Profits / Current Year Earnings | Retained Earnings |

### Control account reconciliations at period end
| Control account | Must equal |
|---|---|
| Accounts Receivable | Aged Receivable total |
| Accounts Payable | Aged Payable total |
| Bank | Bank statement closing balance |
| Stock Valuation | Inventory valuation report |
| Stock Input / Output (interim) | Unbilled receipts / uninvoiced deliveries |
| Tax Payable / Receivable | Tax return |
| Migration clearing | Zero |`,
  inventoryImpact: `## Inventory impact in Record to Report

Record to Report has no physical stock movements, but inventory is one of the largest balance sheet items for trading and manufacturing companies, so finance must:

- **Reconcile** the Stock Valuation account to *Inventory ▸ Reporting ▸ Valuation* every month.
- **Review interim accounts** – Stock Input (goods received not invoiced) and Stock Output (goods delivered not invoiced).
- **Book write-downs** for obsolete or damaged stock (Dr Write-down Expense / Cr Stock Valuation).
- For **manual (periodic) valuation**, post the period-end inventory adjustment: Dr Inventory / Cr Change in Inventory (or the reverse) based on the counted value.
- Ensure **cut-off**: receipts and deliveries are validated in the correct period before locking.`,
  exceptions: [
    { title: "Unbalanced or unreconciled opening balances", mitigation: "Load opening balances via a clearing account; reconcile it to zero and obtain CFO sign-off before go-live." },
    { title: "Postings into closed periods", mitigation: "Set lock dates immediately after close; restrict adviser rights; review entries dated before lock date." },
    { title: "Sub-ledger not equal to control account", mitigation: "Prevent manual journals on reconcilable AR/AP accounts; reconcile aged reports to GL monthly." },
    { title: "Unreconciled bank lines piling up", mitigation: "Daily bank sync/import; reconciliation models for recurring items; weekly review of suspense account." },
    { title: "Wrong tax on transactions", mitigation: "Correct fiscal positions and product taxes; review the tax report before filing; test tax scenarios in UAT." },
    { title: "Late close / missing accruals", mitigation: "Close calendar with owners and deadlines; standard accrual checklist; use reversing entries." },
  ],
  kpis: [
    { name: "Days to close", formula: "Working days from period end to approved financial statements" },
    { name: "Number of manual journal entries", formula: "Count of entries in Miscellaneous journal per period (lower is better)" },
    { name: "Unreconciled bank items", formula: "Count (or value) of bank statement lines not reconciled at period end" },
    { name: "Post-close adjustments", formula: "Count of entries posted to a period after it was reported" },
    { name: "Gross profit margin", formula: "(Revenue − COGS) ÷ Revenue × 100" },
    { name: "Net profit margin", formula: "Net profit ÷ Revenue × 100" },
    { name: "Current ratio", formula: "Current assets ÷ Current liabilities" },
  ],
  reports: [
    "Accounting ▸ Reporting ▸ Balance Sheet (Enterprise)",
    "Accounting ▸ Reporting ▸ Profit and Loss (Enterprise)",
    "Accounting ▸ Reporting ▸ Cash Flow Statement (Enterprise)",
    "Accounting ▸ Reporting ▸ Trial Balance and General Ledger (Enterprise)",
    "Accounting ▸ Reporting ▸ Aged Receivable / Aged Payable (Enterprise)",
    "Accounting ▸ Reporting ▸ Tax Return (Enterprise)",
    "Accounting ▸ Reporting ▸ Invoice Analysis (also in Community Invoicing)",
    "Executive Summary and Analytic reports (Enterprise)",
  ],
  odooHandling: `## How Odoo handles Record to Report

### Community vs Enterprise
- **Odoo Community** includes the **Invoicing** app: customer invoices, vendor bills, payments, taxes and journal entries in the background — but no reconciliation widget, no financial reports (Balance Sheet, P&L), no assets, no follow-ups.
- **Odoo Enterprise** includes the full **Accounting** app: bank reconciliation widget, bank synchronization, financial and tax reports, assets, deferred revenue/expenses, follow-ups, budgets, lock dates, consolidation and audit tools.
- Third-party OCA modules can add reporting to Community (third-party, not supported by Odoo S.A.).

### Key settings (Accounting ▸ Configuration ▸ Settings)
- **Fiscal Localization** (country package with CoA and taxes).
- **Default taxes**, **Rounding**, **Cash basis taxes** where required.
- **Currencies** and automatic currency rates.
- **Analytic Accounting** for departments/projects/branches.
- **Fiscal periods**: fiscal year last day, and tax return periodicity.
- Journals: Accounting ▸ Configuration ▸ Journals.

### How Odoo differs from traditional ERPs
- No separate sub-ledgers: AR/AP are reconcilable accounts filtered by partner.
- Year-end does not require a closing entry; current year earnings are computed in the balance sheet.
- Interim accounts (Outstanding Receipts/Payments, Stock Input/Output) separate operational events from bank and invoice events.

### Consultant tips
- Map the legacy CoA to the localization CoA early; avoid duplicating accounts that analytic accounts can handle.
- Agree on a **month-end close checklist** that names the Odoo report used for each reconciliation.`,
  video: `\`\`\`visual-video
{
  "src": "/videos/r2r-explained.mp4",
  "poster": "/videos/r2r-explained.webp",
  "title": "Record to Report, explained",
  "duration": "6:49",
  "caption": "Narrated explainer built from this process: the steps, who does what, the Odoo documents, the journal entries, risks and controls.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 17,
      "label": "What is R2R?"
    },
    {
      "t": 46,
      "label": "Who is involved"
    },
    {
      "t": 77,
      "label": "The 9 steps"
    },
    {
      "t": 108,
      "label": "Steps 1 and 2"
    },
    {
      "t": 140,
      "label": "Step 3"
    },
    {
      "t": 173,
      "label": "Step 4"
    },
    {
      "t": 202,
      "label": "Steps 5 and 6"
    },
    {
      "t": 233,
      "label": "Step 7"
    },
    {
      "t": 261,
      "label": "Step 8"
    },
    {
      "t": 289,
      "label": "Step 9"
    },
    {
      "t": 319,
      "label": "Closing entries"
    },
    {
      "t": 352,
      "label": "Risks and controls"
    },
    {
      "t": 384,
      "label": "Recap"
    }
  ]
}
\`\`\``,
  example: {
    company: "Clearview Advisory LLP (fictional 35-person management consulting firm)",
    narrative: `\`\`\`visual-story
{
  "title": "Record to Report: Clearview closes January",
  "company": "Clearview Advisory · fictional",
  "layout": "timeline",
  "pace": 7,
  "intro": "This animation follows Clearview's first month on Odoo, from setting up the accounts to locking January. Each lane is a role, the gates are the events in date order, and the box is the paperwork moving between people.",
  "legend": "Lanes are roles. Numbered gates are the events in date order. The box is the paperwork; a lane change is a handover.",
  "stations": [
    {
      "id": "consultant",
      "label": "Implementation consultant",
      "icon": "settings",
      "app": "Configuration"
    },
    {
      "id": "arap",
      "label": "AR & AP team",
      "icon": "invoice",
      "app": "Invoicing"
    },
    {
      "id": "gl",
      "label": "GL accountant",
      "icon": "book",
      "app": "Accounting"
    },
    {
      "id": "bank",
      "label": "Bank",
      "icon": "bank",
      "outside": true
    },
    {
      "id": "tax",
      "label": "Tax accountant",
      "icon": "percent",
      "app": "Tax reports"
    },
    {
      "id": "cfo",
      "label": "CFO",
      "icon": "user",
      "app": "Sign-off"
    }
  ],
  "scenes": [
    {
      "at": "Setup",
      "to": "consultant",
      "action": "Configuring the chart",
      "document": "Fiscal localisation",
      "title": "Lean chart of accounts",
      "text": "The consultant installs the fiscal localisation and adds only **12 accounts**. Departments (Strategy, Technology, HR Advisory) become analytic accounts instead of separate revenue accounts.",
      "say": "The consultant starts from the country's standard chart of accounts and adds only twelve new accounts. Departments are tracked with analytic accounts instead of separate revenue accounts, which keeps the chart small and the reports flexible."
    },
    {
      "at": "31 Dec",
      "from": "consultant",
      "to": "cfo",
      "carry": "Opening balances",
      "action": "Reviewing the clearing account",
      "tone": "success",
      "document": "Migration Clearing = 0",
      "title": "Opening balances signed off",
      "text": "The 47 open invoices and 19 open bills are imported against *Migration Clearing*, and the remaining balances (bank 145,000, fixed assets 60,000, accruals, equity) are posted by journal entry. Migration Clearing ends at **zero** and the CFO signs off.",
      "say": "Opening balances come from the old trial balance. Open invoices and bills are imported one by one, so they can be followed up, and everything else is posted as a journal entry. A clearing account that ends at exactly zero proves nothing was missed, and the CFO signs off."
    },
    {
      "at": "January",
      "to": "arap",
      "action": "Posting 28 invoices",
      "title": "January invoicing and bills",
      "text": "Clearview issues **28 invoices** totalling 320,000 + 15% tax and receives **41 vendor bills** totalling 95,000 + tax 14,250.",
      "entries": [
        {
          "account": "Accounts Receivable",
          "debit": "368,000"
        },
        {
          "account": "Consulting Fees",
          "credit": "320,000"
        },
        {
          "account": "Tax Payable",
          "credit": "48,000"
        }
      ],
      "say": "During January the team sends twenty-eight invoices worth three hundred and twenty thousand plus tax, and records forty-one supplier bills for rent, software and subcontractors."
    },
    {
      "at": "31 Jan",
      "from": "arap",
      "to": "gl",
      "carry": "Late rent bill",
      "action": "Posting the accrual",
      "document": "Auto-reverses 1 Feb",
      "title": "Rent accrued for a late bill",
      "text": "The office rent bill arrives late, so the GL accountant accrues it. The entry **reverses automatically** on 1 February.",
      "entries": [
        {
          "account": "Rent",
          "debit": "9,000"
        },
        {
          "account": "Accrued Liabilities",
          "credit": "9,000"
        }
      ],
      "say": "The rent bill has not arrived yet, but the cost belongs to January. The GL accountant accrues nine thousand, set to reverse automatically on the first of February, when the real bill will be posted."
    },
    {
      "at": "31 Jan",
      "to": "gl",
      "action": "Depreciation & unbilled work",
      "title": "Depreciation and unbilled revenue",
      "text": "Depreciation comes from the asset board. Work done on a fixed-price project but not yet invoiced is recognised as **unbilled revenue**.",
      "entries": [
        {
          "account": "Depreciation",
          "debit": "1,250"
        },
        {
          "account": "Unbilled Revenue",
          "debit": "18,000"
        },
        {
          "account": "Accumulated Depreciation",
          "credit": "1,250"
        },
        {
          "account": "Consulting Fees",
          "credit": "18,000"
        }
      ],
      "say": "Two more month-end entries follow. Depreciation of twelve hundred and fifty comes from the asset register. And eighteen thousand of work already done on a fixed-price project is recognised as revenue now, even though it is not invoiced yet."
    },
    {
      "at": "31 Jan",
      "from": "gl",
      "to": "arap",
      "carry": "Ageing review",
      "action": "Sending reminders",
      "tone": "warning",
      "title": "Receivables and payables reviewed",
      "text": "Aged Receivable: **286,000**, of which 31,000 is over 60 days. Reminders go out and a **4,000 provision** is booked for a disputed invoice. Aged Payable (52,000) equals the AP account.",
      "entries": [
        {
          "account": "Bad Debt Expense",
          "debit": "4,000"
        },
        {
          "account": "Provision for Doubtful Debts",
          "credit": "4,000"
        }
      ],
      "say": "Customers owe two hundred and eighty-six thousand, and thirty-one thousand of it is more than sixty days old. Reminders go out, and four thousand is set aside for one disputed invoice. On the supplier side, the aged payable report agrees with the payables account."
    },
    {
      "at": "Early Feb",
      "from": "bank",
      "to": "gl",
      "carry": "214 bank lines",
      "action": "Matching 214 lines",
      "tone": "success",
      "title": "Bank reconciled",
      "text": "**214** bank lines are synced. Reconciliation models clear **180** automatically (customer payments matching invoice references, bank fees); 34 are matched by hand. Book balance equals the statement: **188,400**.",
      "say": "Two hundred and fourteen bank lines arrive through the bank feed. Reconciliation rules match one hundred and eighty of them automatically, and the accountant matches the last thirty-four by hand. The bank balance in the books now equals the statement."
    },
    {
      "at": "Early Feb",
      "from": "gl",
      "to": "cfo",
      "carry": "P&L and balance sheet",
      "action": "Reviewing the statements",
      "title": "Financial statements ready",
      "text": "P&L: revenue 338,000, staff costs 190,000, other expenses 109,250, net profit **38,750** (11.5%). Technology earns 61% of revenue. The balance sheet balances.",
      "say": "The profit and loss shows revenue of three hundred and thirty-eight thousand and a net profit of thirty-eight thousand seven hundred and fifty, an eleven and a half percent margin. Thanks to the analytic accounts, the CFO can also see that Technology brings in sixty-one percent of revenue."
    },
    {
      "at": "6 Feb",
      "from": "gl",
      "to": "tax",
      "carry": "Tax report",
      "action": "Preparing the tax return",
      "document": "Tax closing entry",
      "title": "Tax return prepared",
      "text": "Output tax 48,000 − input tax 14,250 = **33,750** payable. The tax closing entry clears both tax accounts.",
      "entries": [
        {
          "account": "Tax Payable",
          "debit": "48,000"
        },
        {
          "account": "Tax Receivable",
          "credit": "14,250"
        },
        {
          "account": "Tax Authority",
          "credit": "33,750"
        }
      ],
      "say": "On the sixth of February the tax accountant runs the tax report. Tax collected minus tax paid leaves thirty-three thousand seven hundred and fifty to pay, and the closing entry moves it to the amount owed to the tax authority."
    },
    {
      "at": "6 Feb",
      "from": "tax",
      "to": "cfo",
      "carry": "Lock request",
      "action": "Setting the lock date",
      "tone": "success",
      "document": "Lock date 31 Jan",
      "title": "January locked",
      "text": "The CFO sets the lock date to **31 January**, so the closed month cannot be changed.",
      "say": "Finally the CFO locks January. From now on nobody can post or change entries in a closed month, so the reported figures stay final."
    },
    {
      "at": "Outcome",
      "to": "cfo",
      "tone": "success",
      "title": "Closed in 4 days",
      "text": "Net profit 38,750 (11.5%), bank reconciled, tax filed, January locked. **Days to close: 4.**",
      "say": "January is closed in four working days, with reconciled bank and receivables, accrued costs, and tax ready to pay."
    }
  ],
  "counters": [
    {
      "label": "Revenue (January)",
      "values": [
        "—",
        "—",
        "320,000",
        "320,000",
        "338,000",
        "338,000",
        "338,000",
        "338,000",
        "338,000",
        "338,000",
        "338,000"
      ]
    },
    {
      "label": "Net profit",
      "values": [
        "—",
        "—",
        "—",
        "—",
        "—",
        "—",
        "—",
        "38,750",
        "38,750",
        "38,750",
        "38,750"
      ]
    },
    {
      "label": "Bank (book)",
      "values": [
        "—",
        "145,000",
        "145,000",
        "145,000",
        "145,000",
        "145,000",
        "188,400",
        "188,400",
        "188,400",
        "188,400",
        "188,400"
      ]
    },
    {
      "label": "Close status",
      "values": [
        "Setup",
        "Opening signed",
        "Posting",
        "Accruals",
        "Accruals",
        "AR/AP checked",
        "Bank done",
        "Statements",
        "Tax 33,750",
        "Locked",
        "Closed · 4 days"
      ]
    }
  ],
  "results": [
    {
      "label": "Net profit",
      "value": "38,750 (11.5%)"
    },
    {
      "label": "Revenue",
      "value": "338,000"
    },
    {
      "label": "Bank reconciled",
      "value": "188,400"
    },
    {
      "label": "Auto-matched lines",
      "value": "180 of 214 (84%)"
    },
    {
      "label": "Tax payable",
      "value": "33,750"
    },
    {
      "label": "Days to close",
      "value": "4"
    }
  ]
}
\`\`\`

#### The full story

**Clearview Advisory** provides management consulting and goes live on Odoo 17 Enterprise Accounting on 1 January.

**Chart of accounts.** The consultant installs the country's fiscal localization and adds only 12 accounts (e.g. *Consulting Fees*, *Subcontractor Costs*, *Unbilled Revenue*). Departments (*Strategy*, *Technology*, *HR Advisory*) are modelled as analytic accounts in a *Department* plan instead of separate revenue accounts.

**Opening balances.** The legacy trial balance at 31 December shows: Bank 145,000, Receivables 210,000 (47 open invoices), Fixed assets net 60,000, Payables 38,000 (19 open bills), Accrued expenses 22,000, Equity 355,000. The consultant imports the 47 invoices and 19 bills against *Migration Clearing*, then posts the remaining balances by journal entry. Migration Clearing ends at **zero** and the CFO signs off.

**January transactions.** Clearview issues 28 invoices totalling 320,000 + 15% tax (Dr AR 368,000 / Cr Consulting Fees 320,000 / Cr Tax Payable 48,000) and receives 41 vendor bills (rent, software, subcontractors) totalling 95,000 + tax 14,250.

**Journal entries.** On 31 January the GL accountant posts: rent accrual for an office whose bill arrives late (Dr Rent 9,000 / Cr Accrued Liabilities 9,000, auto-reversed on 1 February), depreciation from the asset board (Dr Depreciation 1,250 / Cr Accumulated Depreciation 1,250), and unbilled revenue for work done but not yet invoiced on a fixed-price project (Dr Unbilled Revenue 18,000 / Cr Consulting Fees 18,000).

**AR & AP.** The Aged Receivable shows 286,000 owed by customers, of which 31,000 is over 60 days; follow-up reminders go out, and a 4,000 provision is booked for a disputed invoice. The Aged Payable (52,000) equals the AP account.

**Bank reconciliation.** 214 bank lines are synced; reconciliation models clear 180 automatically (customer payments matching invoice references, bank fees). The remaining 34 are matched manually. Book balance equals the bank statement: **188,400**.

**Financial statements.** The Profit and Loss shows revenue 338,000, staff costs 190,000, other expenses 109,250 (bills 95,000, rent accrual 9,000, depreciation 1,250, bad-debt provision 4,000), net profit **38,750** (11.5% margin). By department, Technology earns 61% of revenue. The Balance Sheet balances, with current-year earnings 38,750 shown automatically.

**Period closing.** On 6 February the tax accountant generates the tax return: output tax 48,000 − input tax 14,250 = **33,750** payable, and the tax closing entry clears both tax accounts. The CFO sets the lock date to 31 January. **Days to close: 4.**`,
  },
  quiz: {
    slug: "record-to-report-quiz",
    title: "Record to Report – Knowledge Check",
    passMark: 70,
    questions: [
      {
        prompt: "Why should opening receivables be imported as individual open invoices rather than one lump-sum balance?",
        kind: "single",
        options: ["It makes the trial balance larger", "So each invoice can be followed up, aged and reconciled with incoming payments", "Odoo cannot post a lump sum to receivables", "To avoid tax"],
        correct: [1],
        explanation: "Open items let the AR team age, chase and reconcile each customer payment against the specific invoice.",
      },
      {
        prompt: "Which of these are part of Odoo Enterprise Accounting rather than Community Invoicing? (select all that apply)",
        kind: "multiple",
        options: ["Profit and Loss report", "Bank reconciliation widget", "Posting a customer invoice", "Assets and depreciation boards"],
        correct: [0, 1, 3],
        explanation: "Community Invoicing posts invoices and bills; financial reports, the reconciliation widget and assets are Enterprise features.",
      },
      {
        prompt: "What is the correct entry to accrue 3,000 rent at month end when the bill has not arrived?",
        kind: "single",
        options: ["Dr Accrued Liabilities / Cr Rent Expense", "Dr Rent Expense / Cr Accrued Liabilities", "Dr Rent Expense / Cr Bank", "Dr Prepaid Rent / Cr Accounts Payable"],
        correct: [1],
        explanation: "An accrual recognizes the expense in the correct period and a liability for the amount owed but not yet billed.",
      },
      {
        prompt: "Odoo requires a year-end closing journal entry to reset income and expense accounts before the new year can start.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Odoo computes current-year earnings automatically; P&L accounts start from zero in the new fiscal year in reports. Allocation to retained earnings is a business decision posted manually.",
      },
      {
        prompt: "Which control should be set after the month-end close so that no entries are posted into the closed period?",
        kind: "single",
        options: ["Payment terms", "Lock date", "Fiscal position", "Reconciliation model"],
        correct: [1],
        explanation: "Lock dates prevent posting or modifying entries on or before the specified date.",
      },
      {
        prompt: "The Aged Receivable total should equal which balance at period end?",
        kind: "single",
        options: ["Revenue", "Accounts Receivable control account(s)", "Bank account", "Tax Payable"],
        correct: [1],
        explanation: "The aged receivable is the detail of the receivable account; any difference indicates manual postings or unreconciled items.",
      },
    ],
  },
};

/* ================================================================== */
/* 5. PLAN TO PRODUCE                                                  */
/* ================================================================== */

const planToProduce: BusinessProcessContent = {
  slug: "plan-to-produce",
  title: "Plan to Produce (Manufacturing)",
  shortName: "Plan to Produce",
  category: "Manufacturing",
  summary:
    "The manufacturing cycle: defining what a product is made of (Bill of Materials) and how it is made (routing and work centers), planning and releasing production orders, issuing materials, executing operations, receiving finished goods and analysing production cost.",
  objective:
    "Produce the required quantity of finished goods on time, at the expected quality and at the lowest achievable cost — using accurate product structures and routings, keeping materials available without excess stock, capturing actual consumption and labour, and giving finance a reliable product cost for pricing, inventory valuation and margin analysis.",
  odooVersion: ODOO_VERSION,
  departments: ["Production Planning", "Production / Shop Floor", "Engineering / R&D", "Warehouse & Stores", "Quality Control", "Purchasing", "Finance – Cost Accounting"],
  stakeholders: [
    { role: "Product / Process Engineer", responsibility: "Defines and maintains Bills of Materials, operations, standard times and engineering changes." },
    { role: "Production Planner", responsibility: "Plans demand and capacity, creates and schedules manufacturing orders, checks component availability." },
    { role: "Production Supervisor", responsibility: "Releases work to the shop floor, assigns operators, monitors progress and resolves bottlenecks." },
    { role: "Machine Operator", responsibility: "Executes work orders, records start/stop times, quantities produced and scrap." },
    { role: "Storekeeper", responsibility: "Picks and issues components to production and receives finished goods into stock." },
    { role: "Quality Inspector", responsibility: "Performs in-process and final inspections and blocks non-conforming output." },
    { role: "Cost Accountant", responsibility: "Maintains standard costs, work center rates and analyses production cost variances." },
  ],
  steps: [
    {
      id: "bom",
      title: "Define the Bill of Materials (BoM)",
      actor: "Product Engineer",
      department: "Engineering",
      description:
        "The BoM lists every component and quantity needed to make one unit (or batch) of a finished product. It may include sub-assemblies (multi-level BoMs), by-products and alternative versions. An accurate BoM is the foundation of material planning, costing and backflushing.",
      document: "Bill of Materials",
      odoo:
        "Manufacturing ▸ Products ▸ Bills of Materials ▸ New. BoM type 'Manufacture this product' (or 'Kit' for phantom BoMs sold as a set). By-products and BoM versioning/ECOs require settings; Engineering Change Orders need the PLM app (Enterprise).",
      impact: "No transactions. 'Compute Price from BoM' on the product form updates the cost of a Standard-priced product from component costs plus operations (verify the button label in your training instance).",
      approval: "BoM releases and changes approved by Engineering (formal ECO approval with PLM, Enterprise).",
    },
    {
      id: "routing",
      title: "Define routing and work centers",
      actor: "Process Engineer / Cost Accountant",
      department: "Engineering & Finance",
      description:
        "The routing describes the operations required to make the product, in sequence, and where each happens. Each work center (a machine, line or team) has capacity, efficiency and an hourly cost. Operation times multiplied by work center costs give the conversion (labour and overhead) part of product cost.",
      document: "Routing / operation sheet; work center master",
      odoo:
        "Enable 'Work Orders' in Manufacturing ▸ Configuration ▸ Settings. Work centers: Manufacturing ▸ Configuration ▸ Work Centers (cost per hour, capacity, time efficiency, setup/cleanup time). Operations are defined on the BoM's 'Operations' tab (routings are no longer a separate object in recent versions).",
      impact: "No transactions. Work center cost per hour × duration is added to the manufactured product's cost (for FIFO/AVCO valuation).",
    },
    {
      id: "production-order",
      title: "Plan and create the production (manufacturing) order",
      actor: "Production Planner",
      department: "Production Planning",
      description:
        "Production is triggered by a sales order (make-to-order), a reorder rule (make-to-stock) or a master production schedule. The planner creates a manufacturing order (MO) for a quantity and date, checks component availability and capacity, and confirms it. Confirmation reserves components and schedules work orders.",
      document: "Manufacturing Order / Production Order / Job card",
      odoo:
        "Manufacturing ▸ Operations ▸ Manufacturing Orders ▸ New ▸ 'Confirm'. Automatic MOs from the 'Manufacture' route via reordering rules (Inventory ▸ Operations ▸ Replenishment) or make-to-order. Master Production Schedule (Manufacturing ▸ Planning ▸ Master Production Schedule) is Enterprise. Work order planning (Gantt) is Enterprise.",
      impact: "No journal entry. Components are reserved; forecasted stock of components decreases and of the finished product increases.",
      approval: "Production plan agreed in S&OP meeting; MO release by Production Supervisor.",
    },
    {
      id: "material-issue",
      title: "Issue materials to production",
      actor: "Storekeeper",
      department: "Warehouse & Stores",
      description:
        "Components are picked from the store and delivered to the production line. In simple setups the consumption is recorded when production is declared (backflushing); in controlled setups a pick list moves components to a pre-production area first. Extra issues and returns must be recorded to keep actual consumption accurate.",
      document: "Material requisition / pick list / component issue note",
      odoo:
        "1-step manufacturing: components are consumed directly from stock when the MO is completed. 2-step (Pick components ▸ Manufacture) or 3-step (Pick ▸ Manufacture ▸ Store) is set on the warehouse (Inventory ▸ Configuration ▸ Warehouses ▸ Manufacture setting, with Multi-Step Routes) and generates a picking to WH/Pre-Production. Consumed quantities can be edited on the MO 'Components' tab.",
      impact:
        "Pick to pre-production: internal move, no journal entry. Consumption at MO completion (automated valuation): Dr Work in Progress / production location account / Cr Stock Valuation (components) at component cost.",
    },
    {
      id: "production",
      title: "Execute production operations",
      actor: "Machine Operator / Production Supervisor",
      department: "Production / Shop Floor",
      description:
        "Operators perform the operations in sequence, recording start and stop times, quantities and any scrap. Quality checks are performed at defined points. Real durations are compared with expected durations to identify inefficiencies.",
      document: "Work order / Job card / Time sheet / Scrap report",
      odoo:
        "MO ▸ 'Work Orders' tab (Start / Pause / Done) or Manufacturing ▸ Operations ▸ Work Orders. Shop Floor app (Enterprise, 17.0) gives a tablet interface with instructions and quality checks (Quality app, Enterprise). Scrap from the MO with the 'Scrap' button.",
      impact: "Time recorded on work orders drives the conversion cost. Scrap: Dr Scrap/Loss expense / Cr Stock Valuation.",
    },
    {
      id: "fg-receipt",
      title: "Receive finished goods into stock",
      actor: "Production Supervisor / Storekeeper",
      department: "Production & Warehouse",
      description:
        "When production is complete, the produced quantity (and lot/serial numbers) is declared and the finished goods move into stock, ready for sale. Partial production can create a backorder MO for the remaining quantity. Finished goods may pass final inspection before being available.",
      document: "Production receipt / finished goods note",
      odoo:
        "MO ▸ set 'Quantity Producing' ▸ 'Produce All' / 'Validate' (button labels vary by version — verify in your training instance). Partial completion offers a backorder. 3-step manufacturing adds a 'Store Finished Product' transfer.",
      impact:
        "Inventory: finished goods move Virtual/Production ▸ WH/Stock. Automated valuation: Dr Stock Valuation (finished goods) / Cr Work in Progress (production location account). FG value = components consumed + work center cost (FIFO/AVCO) or the standard cost (Standard).",
    },
    {
      id: "cost-analysis",
      title: "Analyse production cost",
      actor: "Cost Accountant",
      department: "Finance – Cost Accounting",
      description:
        "Actual cost of each order (materials, labour/machine time, scrap) is compared with the expected or standard cost. Variances are investigated — price, usage, efficiency — and BoMs, standard times or costs are corrected. Insights feed pricing and continuous improvement.",
      document: "Production cost report / variance analysis",
      odoo:
        "MO 'Cost Analysis' report and Manufacturing ▸ Reporting ▸ Production Analysis / Cost Analysis (mrp_account_enterprise — Enterprise; verify menu names in your training instance). BoM Overview report (BoM ▸ 'BoM Overview') shows expected cost and availability. Work center performance and OEE: Manufacturing ▸ Reporting (verify).",
      impact: "Variance adjustments if any: e.g. reclassify absorbed vs actual labour: Dr/Cr Production variance / Cr/Dr WIP absorption account (manual journal).",
    },
  ],
  documents: [
    "Bill of Materials",
    "Routing / operation sheet",
    "Work center master",
    "Master production schedule",
    "Manufacturing (production) order",
    "Pick list / material issue note",
    "Work orders / job cards",
    "Quality inspection report",
    "Scrap report",
    "Finished goods receipt",
    "Production cost and variance report",
  ],
  masterData: [
    "Finished, semi-finished and component products (storable, with costing method)",
    "Bills of Materials (multi-level, by-products)",
    "Work centers (capacity, efficiency, cost per hour, working hours)",
    "Operations (on BoM) with standard durations",
    "Routes: Manufacture, Make to Order, Buy",
    "Reordering rules and lead times (manufacturing lead time, security lead time)",
    "Lots / serial numbers",
    "Product categories and stock accounts (including production location valuation account)",
  ],
  transactionData: [
    "Manufacturing orders and backorders",
    "Work orders with actual durations",
    "Component pickings and consumption moves",
    "Finished goods moves",
    "Scrap orders",
    "Quality checks / alerts (Enterprise)",
    "Stock valuation layers and journal entries",
  ],
  approvals: [
    "BoM / Engineering change approval (Engineering; PLM in Enterprise)",
    "Production plan / MO release (Production Supervisor)",
    "Excess material issue beyond BoM (Production Supervisor)",
    "Scrap above threshold (Quality / Production Manager)",
    "Standard cost updates (Cost Accountant / Finance Controller)",
  ],
  accountingImpact: `## Accounting impact of Plan to Produce (automated valuation, FIFO/AVCO)

Example: MO for 20 tables. Components consumed 3,880; work center cost (actual time × rate) 1,570.

### 1. Components consumed at MO completion
| Account | Debit | Credit |
|---|---:|---:|
| Work in Progress (production location valuation account) | 3,880 | |
| Stock Valuation – Raw materials | | 3,880 |

### 2. Finished goods produced
| Account | Debit | Credit |
|---|---:|---:|
| Stock Valuation – Finished goods | 5,450 | |
| Work in Progress (production location valuation account) | | 5,450 |

### 3. Scrap of a damaged component (cost 120)
| Account | Debit | Credit |
|---|---:|---:|
| Scrap / Production loss expense | 120 | |
| Stock Valuation – Raw materials | | 120 |

### Understanding the WIP balance
After steps 1–2, WIP has a **credit of 1,570** — the labour and overhead *absorbed* into product cost. Actual wages and overheads are posted through payroll and vendor bills to expense accounts. Finance periodically compares absorbed vs actual conversion cost; the difference is the **production variance**.

### Standard costing
With the *Standard* costing method, finished goods are always valued at the standard price; any difference between actual inputs and standard remains in the production location account and is analysed as a variance.

### Version note
Odoo 18.0 adds options for posting WIP and labour accounting entries for manufacturing orders in progress (verify in your training instance). Configure the production location's valuation account (Inventory ▸ Configuration ▸ Locations ▸ Virtual Locations/Production) — otherwise Odoo falls back to the product category accounts.`,
  inventoryImpact: `## Inventory impact of Plan to Produce

| Step | From | To | Effect |
|---|---|---|---|
| MO confirmed | — | — | Components reserved; FG forecast + |
| Pick components (2/3-step) | WH/Stock | WH/Pre-Production | Internal move |
| Consumption | WH/Stock (or Pre-Production) | Virtual Locations/Production | Components on hand – |
| Production | Virtual Locations/Production | WH/Stock (or Post-Production) | Finished goods on hand + |
| Store FG (3-step) | WH/Post-Production | WH/Stock | Internal move |
| Scrap | WH/Stock | Virtual Locations/Scrap | On hand – |

- **By-products** are received into stock with a cost share defined on the BoM.
- **Lot/serial traceability** links consumed component lots to produced lots (upstream/downstream traceability report).
- **Kits** (phantom BoMs) are not manufactured: their components are delivered directly in the sales delivery.`,
  exceptions: [
    { title: "Component shortage at release", mitigation: "Check component availability on the MO before confirming; reordering rules with lead times; MPS (Enterprise) for medium-term planning." },
    { title: "Inaccurate BoM (wrong quantities)", mitigation: "Compare actual vs expected consumption per MO; formal engineering change process; review BoM after first production run." },
    { title: "Capacity bottleneck at a work center", mitigation: "Plan work orders against capacity (Enterprise planning); alternative work centers; overtime or subcontracting." },
    { title: "Excess scrap or rework", mitigation: "Record scrap with reasons; quality control points; root-cause analysis on high scrap rates." },
    { title: "Operators not recording time", mitigation: "Shop Floor tablets (Enterprise) with start/stop buttons; supervisor review of work orders with zero duration before closing." },
    { title: "Wrong product cost / margin surprises", mitigation: "Maintain work center costs; recompute BoM costs periodically; review MO cost analysis monthly." },
  ],
  kpis: [
    { name: "Schedule adherence", formula: "MOs completed by scheduled date ÷ MOs due × 100" },
    { name: "Overall Equipment Effectiveness (OEE)", formula: "Availability × Performance × Quality" },
    { name: "Scrap rate", formula: "Scrapped quantity ÷ Total quantity produced (or consumed) × 100" },
    { name: "Material usage variance", formula: "(Actual quantity consumed − BoM standard quantity) × Standard cost" },
    { name: "Labour efficiency", formula: "Expected (standard) duration ÷ Actual duration × 100" },
    { name: "Manufacturing cycle time", formula: "Average (MO done date − MO start date)" },
    { name: "Actual vs standard unit cost variance %", formula: "(Actual unit cost − Standard unit cost) ÷ Standard unit cost × 100" },
  ],
  reports: [
    "BoM Overview (structure, availability and expected cost)",
    "Manufacturing ▸ Reporting ▸ Manufacturing Orders / Production Analysis",
    "MO Cost Analysis (Enterprise)",
    "Work Orders analysis and Overall Equipment Effectiveness (verify availability in your instance)",
    "Inventory ▸ Reporting ▸ Valuation (finished goods and raw materials)",
    "Lot/Serial traceability report",
    "Accounting ▸ Reporting ▸ Profit and Loss (Enterprise)",
  ],
  odooHandling: `## How Odoo handles Plan to Produce

### Apps involved
- **Manufacturing** – BoMs, MOs, work centers, operations, work orders, scrap, unbuild.
- **Inventory** – component pickings, finished goods storage, reordering rules, valuation.
- **Purchase** – components bought via Buy route; **Subcontracting** setting for outsourced manufacturing.
- Enterprise add-ons: **Shop Floor** (17.0, replaces tablet view), **Quality**, **PLM** (engineering change orders), **Maintenance**, **MPS**, work order **Planning** (Gantt).

### Key settings (Manufacturing ▸ Configuration ▸ Settings)
- **Work Orders** – enables work centers and operations on BoMs.
- **By-Products**, **Subcontracting**, **Lock quantities to consume**, **Unbuild** (verify labels per version).
- Warehouse ▸ **Manufacture** steps: 1, 2 or 3 steps.
- Product: routes **Manufacture** and optionally **Replenish on Order (MTO)**; manufacturing lead time on the product's Inventory tab.

### Standard vs Enterprise vs customization
| Need | How delivered |
|---|---|
| BoMs, MOs, work centers, work orders, scrap | Standard (Community) |
| Shop Floor tablet app, Quality checks, PLM/ECO, MPS, Gantt planning | Enterprise |
| MO cost analysis report | Enterprise |
| Detailed overhead allocation / activity-based costing | Customization or manual journals |
| Finite capacity scheduling across many constraints | Third-party / customization |

### Consultant tips
- Start simple: 1-step manufacturing and backflushing, then add steps only when the business really controls a pre-production area.
- Make sure every work center has a realistic **cost per hour** — otherwise finished goods are undervalued.
- Explain the **WIP / production location account** to finance before go-live.`,
  video: `\`\`\`visual-video
{
  "src": "/videos/plan-to-produce-explained.mp4",
  "poster": "/videos/plan-to-produce-explained.webp",
  "title": "Plan to Produce, explained",
  "duration": "5:46",
  "caption": "Narrated explainer built from this process: the steps, who does what, the Odoo documents, the journal entries, risks and controls.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 15,
      "label": "What is it?"
    },
    {
      "t": 41,
      "label": "Who is involved"
    },
    {
      "t": 69,
      "label": "The 7 steps"
    },
    {
      "t": 96,
      "label": "Steps 1 and 2"
    },
    {
      "t": 127,
      "label": "Step 3"
    },
    {
      "t": 158,
      "label": "Step 4"
    },
    {
      "t": 184,
      "label": "Step 5"
    },
    {
      "t": 211,
      "label": "Step 6"
    },
    {
      "t": 234,
      "label": "Step 7"
    },
    {
      "t": 265,
      "label": "Accounting impact"
    },
    {
      "t": 296,
      "label": "Risks and controls"
    },
    {
      "t": 326,
      "label": "Recap"
    }
  ]
}
\`\`\``,
  example: {
    company: "Oakridge Furniture Works Ltd. (fictional furniture manufacturer)",
    narrative: `\`\`\`visual-story
{
  "title": "Plan to Produce: Oakridge builds 20 tables",
  "company": "Oakridge Furniture Works · fictional",
  "token": "box",
  "pace": 7,
  "intro": "This animation follows a manufacturing order for twenty oak dining tables through Oakridge's factory. Each building is a place on the shop floor, and the work done there is shown on the spot.",
  "legend": "Buildings are places in the factory. Parcels are documents or parts, trucks carry goods. The badge shows the work happening on the spot.",
  "stations": [
    {
      "id": "customer",
      "label": "Hotel chain",
      "icon": "building",
      "app": "Customer",
      "x": 0,
      "y": 0,
      "outside": true
    },
    {
      "id": "planning",
      "label": "Planning office",
      "icon": "calendar",
      "app": "Manufacturing",
      "x": 2,
      "y": 0
    },
    {
      "id": "vendor",
      "label": "Leg supplier",
      "icon": "truck",
      "app": "Vendor",
      "x": 4,
      "y": 0,
      "outside": true
    },
    {
      "id": "stores",
      "label": "Raw material store",
      "icon": "warehouse",
      "app": "Inventory",
      "x": 4,
      "y": 2
    },
    {
      "id": "cnc",
      "label": "CNC Saw",
      "icon": "settings",
      "app": "Work center",
      "x": 4,
      "y": 4
    },
    {
      "id": "assembly",
      "label": "Assembly Bench",
      "icon": "wrench",
      "app": "Work center",
      "x": 2,
      "y": 4
    },
    {
      "id": "spray",
      "label": "Spray Booth",
      "icon": "factory",
      "app": "Work center",
      "x": 0,
      "y": 4
    },
    {
      "id": "fg",
      "label": "Finished goods",
      "icon": "box",
      "app": "Inventory",
      "x": 0,
      "y": 2
    }
  ],
  "scenes": [
    {
      "at": "Day 1",
      "from": "customer",
      "to": "planning",
      "carry": "Order: 20 tables",
      "action": "Creating MO WH/MO/00118",
      "document": "WH/MO/00118",
      "title": "Make-to-order creates the MO",
      "text": "A hotel chain orders **20 Heritage Dining Tables** for delivery in three weeks. Make-to-Order + Manufacture routes create **MO WH/MO/00118**.",
      "say": "A hotel chain orders twenty Heritage dining tables, to be delivered in three weeks. Because the product uses make-to-order and manufacture routes, confirming the sale creates a manufacturing order straight away."
    },
    {
      "at": "Day 1",
      "to": "planning",
      "action": "Costing the BoM",
      "title": "Expected cost: 266.50 per table",
      "text": "Materials: tabletop 120 + 4 legs 60 + 16 screws 4 + 0.5 L varnish 10 = **194**. Operations: Cutting 20 + Assembly 22.50 + Finishing 30 = **72.50**. Expected total **266.50**.",
      "say": "The bill of materials says each table needs a tabletop, four legs, sixteen screws and half a litre of varnish, a hundred and ninety-four in materials. The routing adds cutting, assembly and finishing time worth seventy-two fifty. So each table should cost two hundred and sixty-six fifty."
    },
    {
      "at": "Day 1",
      "to": "planning",
      "action": "Checking components",
      "tone": "warning",
      "title": "Short of legs: 60 of 80",
      "text": "The BoM Overview shows tabletops available, but only **60 legs** in stock against 80 needed. The MO is confirmed with a start date after the legs arrive.",
      "say": "The planner checks component availability. Tabletops are fine, but there are only sixty legs and the order needs eighty. So the start date is planned for after the missing legs arrive."
    },
    {
      "at": "Day 1",
      "from": "planning",
      "to": "vendor",
      "carry": "PO for legs",
      "action": "Confirming the PO",
      "title": "Reordering rule buys the missing legs",
      "text": "A reordering rule generates a **purchase order for legs**.",
      "say": "A reordering rule automatically creates a purchase order for legs, so nobody has to remember to buy them."
    },
    {
      "at": "Before start",
      "from": "vendor",
      "to": "stores",
      "token": "truck",
      "carry": "Legs",
      "action": "Receiving legs",
      "title": "Legs received",
      "text": "The legs arrive at the raw material store, and all components are now available.",
      "say": "The supplier's truck delivers the legs to the raw material store. Now every component for twenty tables is in stock."
    },
    {
      "at": "Start",
      "from": "stores",
      "to": "cnc",
      "carry": "Components",
      "action": "Picking components",
      "document": "Pick Components",
      "title": "Components picked to pre-production",
      "text": "2-step manufacturing: the storekeeper validates *Pick Components*, moving 20 tabletops, 80 legs, 320 screws and 10 L varnish to WH/Pre-Production. A location change only, **no journal entry**.",
      "say": "Oakridge uses two-step manufacturing. The storekeeper picks twenty tabletops, eighty legs, three hundred and twenty screws and ten litres of varnish, and moves them next to the machines. It is only a change of location, so nothing is posted."
    },
    {
      "at": "Cutting",
      "to": "cnc",
      "action": "Cutting · 10 h",
      "tone": "warning",
      "document": "Scrap order",
      "title": "Cutting: one tabletop cracks",
      "text": "Cutting takes **10 h** (expected 10 h) = 400. One tabletop cracks; the operator scraps it from the MO and an extra tabletop is issued.",
      "entries": [
        {
          "account": "Scrap Loss",
          "debit": "120"
        },
        {
          "account": "Stock Valuation",
          "credit": "120"
        }
      ],
      "say": "Cutting on the CNC saw takes exactly the planned ten hours. But one tabletop cracks. The operator scraps it from the manufacturing order, which books a loss of one hundred and twenty, and a replacement is issued."
    },
    {
      "at": "Assembly",
      "from": "cnc",
      "to": "assembly",
      "carry": "Cut parts",
      "action": "Assembling · 18 h",
      "tone": "warning",
      "title": "Assembly runs 3 hours over",
      "text": "Operators log their time on the Shop Floor tablets: **18 h** against 15 expected = 540.",
      "say": "At the assembly bench the operators log their time on shop floor tablets. Assembly takes eighteen hours instead of fifteen, because a new team member is still learning."
    },
    {
      "at": "Finishing",
      "from": "assembly",
      "to": "spray",
      "carry": "Assembled tables",
      "action": "Spraying · 21 h",
      "title": "Finishing in the spray booth",
      "text": "Finishing takes **21 h** against 20 expected = 630. Actual conversion cost **1,570** vs 1,450 expected.",
      "say": "In the spray booth, finishing takes twenty-one hours, one more than planned. In total, labour and machine time cost fifteen hundred and seventy, a hundred and twenty more than expected."
    },
    {
      "at": "Complete",
      "from": "spray",
      "to": "fg",
      "token": "truck",
      "carry": "20 tables",
      "action": "Completing the MO",
      "tone": "success",
      "title": "20 tables into finished goods",
      "text": "The supervisor completes the MO. Components are consumed and the tables received at an actual unit cost of 5,450 ÷ 20 = **272.50**.",
      "entries": [
        {
          "account": "Work in Progress",
          "debit": "3,880"
        },
        {
          "account": "Finished Goods",
          "debit": "5,450"
        },
        {
          "account": "Raw Materials",
          "credit": "3,880"
        },
        {
          "account": "Work in Progress",
          "credit": "5,450"
        }
      ],
      "say": "The supervisor completes the order. The components, worth three thousand eight hundred and eighty, are consumed, and the twenty tables enter finished goods at five thousand four hundred and fifty, which is two hundred and seventy-two fifty each."
    },
    {
      "at": "After completion",
      "from": "fg",
      "to": "planning",
      "carry": "Cost analysis",
      "action": "Analysing variances",
      "title": "6.00 per table over plan",
      "text": "Each table cost **6.00 more** (2.3%). Variances: Assembly +90, Finishing +30; the scrapped tabletop (120) is a loss outside product cost. Labour efficiency 45 ÷ 49 = **91.8%**; scrap rate 1 ÷ 21 = 4.8%.",
      "say": "The cost accountant compares actual with expected. Each table cost six more than planned. Most of the difference is the extra assembly time, plus one extra hour in finishing. The scrapped tabletop is shown separately as a loss. Labour efficiency was nearly ninety-two percent."
    },
    {
      "at": "Week 3",
      "from": "fg",
      "to": "customer",
      "token": "truck",
      "carry": "20 tables",
      "action": "Delivered to the hotel",
      "title": "Tables delivered to the hotel",
      "text": "The 20 tables go to the hotel chain within the three weeks.",
      "say": "The twenty finished tables leave for the hotel within the promised three weeks."
    },
    {
      "at": "Outcome",
      "to": "planning",
      "tone": "success",
      "title": "Margin still 47.6%",
      "text": "Selling price 520 per table gives a gross margin of **47.6%**. Actions: training for the new assembler, a protective fixture at the saw, standard times unchanged for now.",
      "say": "At five hundred and twenty a table, the gross margin is still a healthy forty-seven point six percent. The supervisor books training for the new assembler, and engineering adds a fixture at the saw to stop tabletops cracking."
    }
  ],
  "counters": [
    {
      "label": "Tables made",
      "values": [
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "0 / 20",
        "20 / 20",
        "20 / 20",
        "20 / 20",
        "20 / 20"
      ]
    },
    {
      "label": "Hours booked",
      "values": [
        "0 h",
        "0 h",
        "0 h",
        "0 h",
        "0 h",
        "0 h",
        "10 h",
        "28 h",
        "49 h",
        "49 h",
        "49 h",
        "49 h",
        "49 h"
      ]
    },
    {
      "label": "Conversion cost",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "400",
        "940",
        "1,570",
        "1,570",
        "1,570",
        "1,570",
        "1,570"
      ]
    },
    {
      "label": "Unit cost",
      "values": [
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "266.50 plan",
        "272.50",
        "272.50",
        "272.50",
        "272.50"
      ]
    }
  ],
  "results": [
    {
      "label": "Actual unit cost",
      "value": "272.50 (plan 266.50)"
    },
    {
      "label": "Total variance",
      "value": "240"
    },
    {
      "label": "Labour efficiency",
      "value": "91.8%"
    },
    {
      "label": "Scrap rate (tabletops)",
      "value": "4.8%"
    },
    {
      "label": "Selling price",
      "value": "520"
    },
    {
      "label": "Gross margin",
      "value": "47.6%"
    }
  ]
}
\`\`\`

#### The full story

**Oakridge Furniture Works** makes solid-oak dining tables. A hotel chain orders 20 *Heritage Dining Tables* for delivery in three weeks.

**Bill of Materials.** One table requires: 1 oak tabletop panel (cost 120), 4 legs (15 each = 60), 16 screws (0.25 each = 4) and 0.5 L varnish (20/L = 10). Material cost per table: **194**.

**Routing & work centers.** The BoM has three operations: *Cutting* on the CNC Saw work center (30 min, 40/hour = 20), *Assembly* at the Assembly Bench (45 min, 30/hour = 22.50) and *Finishing* in the Spray Booth (60 min, 30/hour = 30). Expected conversion cost per table 72.50; expected total cost **266.50**. The product uses AVCO with automated valuation.

**Production order.** The sales order uses the Make-to-Order + Manufacture routes, so Odoo creates **MO WH/MO/00118** for 20 tables. The planner checks the BoM Overview: tabletops are available, but only 60 legs are in stock (80 needed). A reorder rule generates a purchase for legs, and the MO is confirmed with a start date after the legs arrive.

**Material issue.** Oakridge uses 2-step manufacturing. The storekeeper validates the *Pick Components* transfer, moving 20 tabletops, 80 legs, 320 screws and 10 L varnish to WH/Pre-Production — no journal entry, just a location change. During cutting one tabletop cracks; the operator scraps it from the MO (Dr Scrap Loss 120 / Cr Stock Valuation 120) and an extra tabletop is issued.

**Production.** Operators record their times on the Shop Floor tablets: Cutting 10 h (expected 10 h) = 400, Assembly 18 h (expected 15 h) = 540, Finishing 21 h (expected 20 h) = 630. Actual conversion cost **1,570** vs expected 1,450.

**Finished goods receipt.** The supervisor sets quantity producing to 20 and completes the MO. Odoo consumes components: Dr WIP 3,880 / Cr Raw Materials 3,880; and receives finished tables: Dr Finished Goods 5,450 / Cr WIP 5,450. Actual unit cost = 5,450 ÷ 20 = **272.50**.

**Cost analysis.** Compared with the expected 266.50, each table cost 6.00 more (2.3%). The variance comes from Assembly (3 extra hours = 90, a new team member) and Finishing (1 extra hour = 30), plus the scrapped tabletop (120) booked as a loss outside the product cost. Total variance vs expectation: 240. Labour efficiency for the MO = 45 ÷ 49 = **91.8%**; scrap rate on tabletops = 1 ÷ 21 = 4.8%.

**Actions.** The supervisor schedules training for the new assembler, Engineering adds a protective fixture at the saw, and the cost accountant keeps the standard times unchanged for now. Selling price per table is 520, so the gross margin remains a healthy **47.6%**.`,
  },
  quiz: {
    slug: "plan-to-produce-quiz",
    title: "Plan to Produce – Knowledge Check",
    passMark: 70,
    questions: [
      {
        prompt: "In Odoo 17, where are routing operations defined?",
        kind: "single",
        options: ["On the work center", "On the Operations tab of the Bill of Materials", "On the product category", "On the warehouse"],
        correct: [1],
        explanation: "Operations (routing steps) are defined on the BoM's Operations tab once the Work Orders setting is enabled; each operation references a work center.",
      },
      {
        prompt: "With FIFO/AVCO automated valuation, what makes up the value of a manufactured product?",
        kind: "single",
        options: ["Only the components consumed", "Components consumed plus work center cost (duration × cost per hour)", "Its sales price", "The vendor price of the finished product"],
        correct: [1],
        explanation: "Odoo values the finished product at the cost of consumed components plus operation costs computed from work center hourly costs.",
      },
      {
        prompt: "Moving components from WH/Stock to WH/Pre-Production in 2-step manufacturing posts a journal entry.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "It is an internal transfer between internal locations, so value does not change and no entry is posted. The entry happens when components are consumed into the production location.",
      },
      {
        prompt: "Which entry is posted when finished goods are produced (automated valuation)?",
        kind: "single",
        options: ["Dr WIP / Cr Finished Goods", "Dr Finished Goods (Stock Valuation) / Cr WIP (production location account)", "Dr COGS / Cr Finished Goods", "Dr Accounts Payable / Cr WIP"],
        correct: [1],
        explanation: "Finished goods enter stock from the virtual production location, debiting stock valuation and crediting the production/WIP account.",
      },
      {
        prompt: "Which of these are Enterprise-only in Odoo 17 manufacturing? (select all that apply)",
        kind: "multiple",
        options: ["Shop Floor app", "Bills of Materials", "Master Production Schedule", "PLM engineering change orders"],
        correct: [0, 2, 3],
        explanation: "BoMs and manufacturing orders are standard; Shop Floor, MPS and PLM are Enterprise apps/features.",
      },
      {
        prompt: "Expected duration 45 h, actual duration 49 h. What is labour efficiency?",
        kind: "single",
        options: ["108.9%", "91.8%", "96.0%", "89.0%"],
        correct: [1],
        explanation: "Labour efficiency = expected ÷ actual × 100 = 45 ÷ 49 × 100 ≈ 91.8%.",
      },
    ],
  },
};

/* ================================================================== */
/* 6. PROJECT TO PROFIT                                                */
/* ================================================================== */

const projectToProfit: BusinessProcessContent = {
  slug: "project-to-profit",
  title: "Project to Profit",
  shortName: "Project to Profit",
  category: "Projects & Services",
  summary:
    "The project-based revenue cycle used by services, design and contracting businesses: creating a project from a contract, planning tasks, recording timesheets, capturing material and service costs, billing the customer and measuring project profitability.",
  objective:
    "Deliver projects within scope, time and budget while billing everything that is billable and understanding the true margin of each project — by linking every hour, expense and purchase to the project, invoicing according to the contract model (fixed price, milestones, time & materials), and comparing revenue with cost in real time.",
  odooVersion: ODOO_VERSION,
  departments: ["Sales / Business Development", "Project Management Office", "Delivery / Design team", "Purchasing", "Finance – Billing & Project Accounting", "HR (cost rates)", "Management"],
  stakeholders: [
    { role: "Account Manager", responsibility: "Agrees the contract scope, pricing model and billing milestones with the client; owns the sales order." },
    { role: "Project Manager", responsibility: "Plans tasks and resources, tracks progress, approves timesheets and expenses, and manages scope changes." },
    { role: "Team Member (designer, consultant, engineer)", responsibility: "Executes tasks and records time daily against the correct task." },
    { role: "Purchasing Officer", responsibility: "Buys materials and subcontract services for the project, coding them to the project's analytic account." },
    { role: "Billing Accountant", responsibility: "Raises invoices per milestone or timesheet period and handles re-billable costs." },
    { role: "Finance Controller", responsibility: "Reviews project profitability, work-in-progress (unbilled) and revenue recognition." },
    { role: "Client", responsibility: "Approves deliverables and milestones, and pays invoices." },
  ],
  steps: [
    {
      id: "project-creation",
      title: "Create the project from the contract",
      actor: "Account Manager / Project Manager",
      department: "Sales & PMO",
      description:
        "When the client signs, the project is set up with its customer, manager, budget and billing model. Linking the project to the sales contract ensures every hour and cost can be billed and measured against the agreed price. An analytic account is created so that all revenues and costs flow to the project.",
      document: "Signed contract / Statement of Work / Sales Order",
      odoo:
        "Sell a service product whose 'Create on Order' field (product form, Sales/General tab with the Project app installed) is 'Project & Task' or 'Project'; confirming the sales order creates the project and task automatically. Projects can also be created manually: Project ▸ (Kanban) ▸ New. The project gets an analytic account (enable Analytic Accounting).",
      impact: "No journal entry. The analytic account becomes the collector for project revenue and costs.",
      approval: "Contract and pricing approved by Sales Manager; project budget approved by management.",
    },
    {
      id: "tasks",
      title: "Plan tasks and milestones",
      actor: "Project Manager",
      department: "PMO / Delivery",
      description:
        "The scope is broken down into tasks with owners, deadlines and allocated hours. Billing milestones (e.g. concept approved, design handed over) are defined so that invoicing follows delivery. Progress is tracked on a Kanban board or Gantt chart.",
      document: "Work breakdown structure / project plan",
      odoo:
        "Project ▸ open project ▸ Tasks (Kanban stages). Allocated hours per task, sub-tasks, dependencies and milestones are enabled in Project ▸ Configuration ▸ Settings. Gantt view and resource Planning app are Enterprise.",
      impact: "No accounting impact.",
    },
    {
      id: "timesheets",
      title: "Record and approve timesheets",
      actor: "Team Members / Project Manager",
      department: "Delivery",
      description:
        "Each team member logs hours against tasks. Timesheets show where effort goes, provide the basis for time-and-materials billing, and carry the internal labour cost of the project. The project manager reviews and validates timesheets before they are invoiced.",
      document: "Timesheet",
      odoo:
        "Community: 'Timesheets' tab on the task (hr_timesheet module). Enterprise: Timesheets app (Timesheets ▸ Timesheets ▸ My Timesheets, grid view, timers, validation 'Timesheets ▸ To Validate'). Employee hourly cost is set on the employee form (HR Settings tab).",
      impact:
        "No general ledger entry. Each timesheet line creates an analytic line on the project analytic account with amount = − hours × employee hourly cost. Wages themselves are booked through payroll.",
      approval: "Timesheet validation by Project Manager (Enterprise Timesheets app).",
    },
    {
      id: "costs",
      title: "Capture material and service costs",
      actor: "Purchasing Officer / Team Members",
      department: "Purchasing & Delivery",
      description:
        "Materials, furniture, subcontractors and travel expenses are bought for the project. Each cost must carry the project's analytic account so profitability is complete. Costs that the contract allows to be passed on to the client are flagged as re-billable.",
      document: "Purchase orders, vendor bills, expense reports",
      odoo:
        "Purchase ▸ Orders ▸ Purchase Orders with the project's analytic distribution on lines; Accounting ▸ Vendors ▸ Bills; Expenses app (Expenses ▸ My Expenses). Re-invoicing: set 'Re-Invoice Expenses' (At cost / Sales price) on the product and link the cost to the sales order's analytic account — the cost then appears as a new line on the sales order (verify behaviour for vendor bills in your training instance). Stock consumed from the warehouse can be charged via analytic distribution on stock pickings only in limited scenarios (verify / may need customization).",
      impact: "Vendor bill: Dr Project cost / Expense / Dr Input Tax / Cr Accounts Payable, plus an analytic line on the project. Expense report: Dr Expense / Cr Employee payable.",
      approval: "PO approval per purchasing policy; expense report approval by Project Manager / Expenses manager.",
    },
    {
      id: "billing",
      title: "Bill the customer",
      actor: "Billing Accountant",
      department: "Finance – Billing",
      description:
        "Invoices are raised according to the contract: a fixed price in advance or by milestone, hours delivered for time & materials, and re-billable costs at cost or with a markup. Accurate, timely billing is critical for cash flow in project businesses. Unbilled work at period end represents revenue earned but not yet invoiced.",
      document: "Customer invoice (milestone, timesheet or expense invoice)",
      odoo:
        "Service product invoicing policies (Sales tab): 'Prepaid/Fixed Price', 'Based on Timesheets', 'Based on Milestones', 'Based on Delivered Quantity (Manual)'. Sales ▸ To Invoice ▸ Orders to Invoice, then 'Create Invoice' on the sales order; mark milestones reached on the project. Down payments are supported.",
      impact: "Dr Accounts Receivable / Cr Service Revenue / Cr Tax Payable. The revenue also posts an analytic line on the project.",
      approval: "Project Manager confirms milestone completion / timesheet accuracy before invoicing.",
    },
    {
      id: "profitability",
      title: "Analyse project profitability",
      actor: "Project Manager / Finance Controller",
      department: "PMO & Finance",
      description:
        "Revenue invoiced and to be invoiced is compared with labour cost, materials and subcontracting to calculate the project margin. Trends are reviewed in regular project updates so overruns are caught early. At closure, lessons learned feed future estimates and pricing.",
      document: "Project profitability report / project status update",
      odoo:
        "Project ▸ open project ▸ Project Updates (dashboard view showing Profitability: revenues and costs by type — timesheets, materials, vendor bills, expenses; verify edition and labels in your training instance). Analytic reporting: Accounting ▸ Reporting ▸ Analytic (Enterprise) or Accounting ▸ Configuration ▸ Analytic Accounts ▸ analytic items. Timesheet analysis: Timesheets ▸ Reporting (Enterprise).",
      impact: "Reporting only. Finance may accrue unbilled revenue at period end: Dr Unbilled Revenue (contract asset) / Cr Service Revenue.",
    },
  ],
  documents: [
    "Proposal / Statement of Work / Contract",
    "Sales Order",
    "Project plan and task list",
    "Timesheets",
    "Purchase orders and vendor bills",
    "Expense reports",
    "Milestone acceptance / client sign-off",
    "Customer invoices (milestone, time & materials, re-billed costs)",
    "Project status / profitability report",
  ],
  masterData: [
    "Customers",
    "Service products with invoicing policy and 'Create on Order' setting",
    "Employees with hourly cost; job positions / rates",
    "Project templates and stages",
    "Analytic plans and accounts",
    "Vendors and subcontractors",
    "Expense categories (products used in Expenses)",
  ],
  transactionData: [
    "Sales orders and projects",
    "Tasks and milestones",
    "Timesheet entries (analytic lines)",
    "Purchase orders, vendor bills and expense reports",
    "Customer invoices and payments",
    "Analytic items",
  ],
  approvals: [
    "Contract / price approval (Sales Manager)",
    "Project budget approval (Management)",
    "Timesheet validation (Project Manager)",
    "Expense and purchase approvals (Project Manager / Purchasing)",
    "Milestone completion before invoicing (Project Manager, client sign-off)",
    "Change requests (scope/price changes) (Account Manager + client)",
  ],
  accountingImpact: `## Accounting impact of Project to Profit

| Event | Financial accounting (GL) | Analytic accounting (project) |
|---|---|---|
| Timesheet 10 h at cost 40/h | No entry (wages come from payroll) | −400 (timesheet cost) |
| Vendor bill: subcontractor 4,000 + tax 600 | Dr Subcontracting 4,000; Dr Input Tax 600 / Cr AP 4,600 | −4,000 |
| Expense report: site travel 150 | Dr Travel Expense 150 / Cr Employee payable 150 | −150 |
| Purchase of furniture for client 18,000 | Dr Project materials 18,000; Dr Input Tax / Cr AP | −18,000 |
| Milestone invoice 6,000 + 15% tax | Dr AR 6,900 / Cr Service Revenue 6,000; Cr Tax Payable 900 | +6,000 |
| Re-invoice furniture at cost + 20% (21,600) | Dr AR / Cr Revenue 21,600; Cr Tax Payable | +21,600 |

### Key concepts
- **Analytic accounting** is a parallel dimension: it does not change the balance sheet, but tags revenue and cost to the project.
- **Timesheet cost** appears only in analytic accounting. Payroll records the actual salary expense in the GL.
- **Unbilled work (WIP)**: at period end, work done but not invoiced may be accrued as unbilled revenue (contract asset) per the company's revenue recognition policy (manual entry or Enterprise deferral features — verify).
- **Prepayments / down payments**: Dr AR / Cr Customer Deposits (or down payment account) until the final invoice deducts them.`,
  inventoryImpact: `## Inventory impact of Project to Profit

Most project businesses carry little stock, but materials still need control:

| Scenario | Inventory effect | Notes |
|---|---|---|
| Materials bought specifically for the project and delivered to site | Receipt then delivery, or dropship (vendor ▸ client) | Dropship route avoids touching own stock |
| Materials issued from own warehouse | Delivery / consumption from WH/Stock | Charge to project analytic account (may require configuration or customization — verify) |
| Services only (design, consulting) | None | Products of type Service |
| Unused materials returned from site | Return receipt to stock | Reduces project cost |

- Field Service (Enterprise) can record products used on a task and add them to the sales order.
- For storable materials with automated valuation, the delivery posts Dr Stock Output/COGS / Cr Stock Valuation as in Order to Cash.`,
  exceptions: [
    { title: "Unlogged or late timesheets", mitigation: "Daily timesheet reminders (Enterprise Timesheets), weekly validation, block invoicing until timesheets are validated." },
    { title: "Scope creep without change order", mitigation: "Change-request procedure; add new SO lines or a new SO for extra scope; monitor allocated vs spent hours per task." },
    { title: "Costs not coded to the project", mitigation: "Mandatory analytic distribution on PO/bill lines (analytic plan applicability set to Mandatory); monthly review of uncoded costs." },
    { title: "Re-billable costs forgotten", mitigation: "Use 'Re-Invoice Expenses' on products; review the sales order for re-invoiced lines before each billing run." },
    { title: "Milestone invoiced before client acceptance", mitigation: "Mark milestones reached only with client sign-off attached to the task." },
    { title: "Budget overrun detected too late", mitigation: "Fortnightly project updates with profitability panel; alert when spent hours exceed 80% of allocated hours." },
  ],
  kpis: [
    { name: "Project gross margin %", formula: "(Project revenue − Project costs) ÷ Project revenue × 100" },
    { name: "Billable utilisation", formula: "Billable hours ÷ Total available hours × 100" },
    { name: "Budget variance (hours)", formula: "(Hours spent − Hours allocated) ÷ Hours allocated × 100" },
    { name: "Realisation rate", formula: "Revenue billed ÷ (Billable hours × Standard rate) × 100" },
    { name: "Unbilled revenue days", formula: "Unbilled revenue ÷ Average daily revenue" },
    { name: "Effective hourly rate", formula: "Project revenue ÷ Total hours spent" },
    { name: "On-time milestone completion", formula: "Milestones reached by planned date ÷ Total milestones due × 100" },
  ],
  reports: [
    "Project ▸ Project Updates – Profitability section",
    "Project ▸ Reporting ▸ Tasks Analysis",
    "Timesheets ▸ Reporting ▸ by Employee / Project / Task (Enterprise app; Community via task timesheets)",
    "Sales ▸ Reporting ▸ Sales (service revenue by customer/product)",
    "Analytic report / Analytic items by project (Enterprise report; analytic items list available in both)",
    "Accounting ▸ Reporting ▸ Profit and Loss with analytic filter (Enterprise)",
    "Accounting ▸ Reporting ▸ Aged Receivable (Enterprise)",
  ],
  odooHandling: `## How Odoo handles Project to Profit

### Apps involved
- **Sales** – service products, contract sales orders, invoicing.
- **Project** – projects, tasks, milestones, project updates and profitability.
- **Timesheets** – Community: timesheet lines on tasks (hr_timesheet); Enterprise: the Timesheets app with grid, timers, validation and reminders.
- **Purchase**, **Expenses**, **Invoicing/Accounting** – costs, re-invoicing and billing.
- Enterprise add-ons: **Planning** (resource scheduling), **Field Service**, **Documents**, **Sign**, Gantt view.

### Key configuration
- Service product: **Invoicing Policy** (Prepaid/Fixed Price, Based on Timesheets, Based on Milestones, Based on Delivered Quantity) and **Create on Order** (Task, Project, Project & Task).
- Project ▸ Configuration ▸ Settings: **Milestones**, **Timesheets**, **Task Dependencies**, **Recurring Tasks**.
- Accounting/Invoicing settings: **Analytic Accounting**; analytic plan applicability to make project tagging mandatory.
- Employee form: hourly **cost** for timesheet valuation.
- Product: **Re-Invoice Expenses** (No / At cost / Sales price).

### Standard vs Enterprise vs customization
| Need | How delivered |
|---|---|
| Project from SO, tasks, milestones, timesheets on tasks | Standard |
| Timesheet grid, validation, reminders; Planning; Gantt; Field Service | Enterprise |
| Profitability panel on project updates | Standard with Sales/Timesheets installed (verify edition in your instance) |
| Percentage-of-completion revenue recognition | Manual journals or customization |
| Construction-style progress billing with retention | Customization / third-party |

### Consultant tips
- Choose the invoicing policy per product line, not per project — one sales order can mix fixed-fee design, timesheet-based supervision and re-billed materials.
- Set realistic **employee costs**; otherwise profitability looks better than reality.`,
  video: `\`\`\`visual-video
{
  "src": "/videos/project-to-profit-explained.mp4",
  "poster": "/videos/project-to-profit-explained.webp",
  "title": "Project to Profit, explained",
  "duration": "5:48",
  "caption": "Narrated explainer built from this process: the steps, who does what, the Odoo documents, the journal entries, risks and controls.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 18,
      "label": "What is it?"
    },
    {
      "t": 45,
      "label": "Who is involved"
    },
    {
      "t": 70,
      "label": "The 6 steps"
    },
    {
      "t": 96,
      "label": "Step 1"
    },
    {
      "t": 123,
      "label": "Step 2"
    },
    {
      "t": 149,
      "label": "Step 3"
    },
    {
      "t": 175,
      "label": "Step 4"
    },
    {
      "t": 203,
      "label": "Step 5"
    },
    {
      "t": 233,
      "label": "Step 6"
    },
    {
      "t": 262,
      "label": "Accounting impact"
    },
    {
      "t": 296,
      "label": "Risks and controls"
    },
    {
      "t": 326,
      "label": "Recap"
    }
  ]
}
\`\`\``,
  example: {
    company: "Lumen & Loom Interiors (fictional interior design studio)",
    narrative: `\`\`\`visual-story
{
  "title": "Project to Profit: Lumen & Loom fits out an office",
  "company": "Lumen & Loom Interiors · fictional",
  "layout": "timeline",
  "pace": 7,
  "intro": "This animation follows a fit-out project from contract to profit. Each lane is a person or party, the gates are the events in order, and the running totals show how the margin builds up.",
  "legend": "Lanes are people and outside parties. Numbered gates are the events in order. Watch the margin to date change as costs and invoices arrive.",
  "stations": [
    {
      "id": "client",
      "label": "Client: Harbourline",
      "icon": "building",
      "outside": true
    },
    {
      "id": "am",
      "label": "Account manager",
      "icon": "handshake",
      "app": "Sales"
    },
    {
      "id": "pm",
      "label": "Project manager · Ananya",
      "icon": "clipboard",
      "app": "Project"
    },
    {
      "id": "team",
      "label": "Designers & supervisor",
      "icon": "users",
      "app": "Timesheets"
    },
    {
      "id": "purchasing",
      "label": "Purchasing",
      "icon": "cart",
      "app": "Purchase"
    },
    {
      "id": "supplier",
      "label": "Crestwood Furnishings",
      "icon": "truck",
      "outside": true
    },
    {
      "id": "accounts",
      "label": "Accounts",
      "icon": "landmark",
      "app": "Accounting"
    }
  ],
  "scenes": [
    {
      "at": "Contract",
      "from": "client",
      "to": "am",
      "carry": "Signed contract",
      "action": "Building the sales order",
      "title": "Three ways to bill one project",
      "text": "Harbourline Logistics signs for a 600 m² office fit-out: a **fixed design fee of 12,000** in two milestones, **site supervision at 90/h**, and **furniture at cost + 20%**.",
      "say": "Harbourline Logistics hires Lumen and Loom to design and fit out its new office. The contract mixes three billing methods: a fixed design fee in two milestones, site supervision charged by the hour, and furniture charged at cost plus twenty percent."
    },
    {
      "at": "Contract",
      "from": "am",
      "to": "pm",
      "carry": "S00452 confirmed",
      "action": "Creating the project",
      "document": "Analytic HL-2025-07",
      "title": "Order confirmed, project created",
      "text": "Sales order **S00452** has three lines: design (milestones), supervision (timesheets, est. 60 h) and furniture re-invoicing. Confirming it creates the project and analytic account **HL-2025-07**.",
      "say": "The account manager enters one sales order with three lines, each with its own invoicing policy. Confirming it creates the project and its analytic account, which will collect every cost and every invoice."
    },
    {
      "at": "Planning",
      "to": "pm",
      "action": "Planning tasks & milestones",
      "title": "Tasks and milestones planned",
      "text": "Ananya plans space planning, concept, detailed drawings, furniture procurement and site supervision. Milestones: *Concept approved* (50%) and *Drawings handed over* (50%).",
      "say": "Project manager Ananya plans the tasks and links two milestones to the design fee: half when the concept is approved, and half when the drawings are handed over."
    },
    {
      "at": "Ongoing",
      "from": "pm",
      "to": "team",
      "carry": "Tasks",
      "action": "Logging 220 hours",
      "tone": "warning",
      "title": "Timesheets: design runs over",
      "text": "Designers log **160 h** (cost 40/h = 6,400), the supervisor **60 h** (45/h = 2,700). Timesheets create analytic cost lines only, **no GL entries**.",
      "say": "The designers log one hundred and sixty hours, and the site supervisor sixty. Timesheets do not post to the general ledger. They add cost lines to the project, so the project's real cost is visible as the work happens."
    },
    {
      "at": "Procurement",
      "from": "pm",
      "to": "purchasing",
      "carry": "Furniture list",
      "action": "Raising the PO",
      "title": "Furniture ordered for the project",
      "text": "The purchasing officer orders furniture from Crestwood for **18,000**, with the project's analytic distribution.",
      "say": "Purchasing orders the furniture from Crestwood for eighteen thousand, tagged to the project so the cost lands in the right place."
    },
    {
      "at": "Procurement",
      "from": "purchasing",
      "to": "supplier",
      "carry": "PO 18,000",
      "action": "Dropship to the client",
      "title": "Dropshipped straight to Harbourline",
      "text": "Crestwood delivers the furniture **directly to Harbourline** (dropship). The 18,000 cost is coded to HL-2025-07.",
      "say": "Crestwood delivers the furniture straight to the client's office, so it never passes through Lumen and Loom's own stock."
    },
    {
      "at": "Procurement",
      "from": "supplier",
      "to": "client",
      "token": "truck",
      "carry": "Furniture",
      "action": "Delivered on site",
      "title": "Furniture on site",
      "text": "The furniture arrives at the client's office. A painting subcontractor also bills **4,000**, coded to the project but **not re-billable** (included in the design fee).",
      "say": "The furniture arrives on site. A painting subcontractor also sends a bill for four thousand. It is part of the fixed design fee, so it cannot be charged on to the client."
    },
    {
      "at": "20 May",
      "from": "accounts",
      "to": "client",
      "carry": "Milestone 1",
      "action": "Invoicing 6,000",
      "title": "Concept approved: first milestone",
      "text": "The concept is approved on 20 May, so the first milestone invoice of **6,000** + tax goes out.",
      "say": "On the twentieth of May the client approves the concept, and the first milestone invoice of six thousand goes out."
    },
    {
      "at": "25 Jun",
      "from": "accounts",
      "to": "client",
      "carry": "Milestone 2",
      "action": "Invoicing 6,000",
      "title": "Drawings handed over: second milestone",
      "text": "Drawings are handed over on 25 June: second milestone invoice of **6,000** + tax.",
      "say": "On the twenty-fifth of June the drawings are handed over, and the second milestone of six thousand is invoiced."
    },
    {
      "at": "Furniture billing",
      "from": "accounts",
      "to": "client",
      "carry": "Re-invoice 21,600",
      "action": "Re-invoicing at cost + 20%",
      "title": "Furniture re-invoiced",
      "text": "Furniture is re-invoiced at cost + 20% = **21,600** + tax.",
      "say": "The furniture is re-invoiced to the client at cost plus twenty percent, twenty-one thousand six hundred."
    },
    {
      "at": "Month end",
      "from": "accounts",
      "to": "client",
      "carry": "60 h × 90",
      "action": "Invoicing timesheets",
      "title": "Supervision invoiced from timesheets",
      "text": "60 validated hours × 90 = **5,400** + tax. Total revenue: 12,000 + 21,600 + 5,400 = **39,000**.",
      "say": "At month end, the sixty validated supervision hours are invoiced at ninety, five thousand four hundred. Total revenue is now thirty-nine thousand."
    },
    {
      "at": "Review",
      "from": "accounts",
      "to": "pm",
      "carry": "Profitability",
      "action": "Reviewing profitability",
      "tone": "warning",
      "title": "20.3% overall, but design earned only 13.3%",
      "text": "Revenue 39,000, cost 31,100, margin **7,900 (20.3%)**. Design earned only 1,600 (13.3%): **160 h** against 120 planned, after three rounds of concept changes. Supervision earned 50%, furniture 16.7%.",
      "say": "The project made seven thousand nine hundred, a twenty percent margin. But the breakdown tells a different story. The design part earned only thirteen percent, because three rounds of concept changes pushed the hours from one hundred and twenty to one hundred and sixty."
    },
    {
      "at": "Lessons learned",
      "to": "am",
      "tone": "success",
      "title": "Change the contract, not just the effort",
      "text": "Next time the fixed fee covers **two concept revisions**; further revisions are billed on timesheets. Designer utilisation was 78%; effective design rate 75/h vs the 90 target.",
      "say": "The lesson goes into the next contract: the fixed fee will include only two concept revisions, and anything more will be billed by the hour. That protects the design margin."
    }
  ],
  "counters": [
    {
      "label": "Revenue invoiced",
      "values": [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "6,000",
        "12,000",
        "33,600",
        "39,000",
        "39,000",
        "39,000"
      ]
    },
    {
      "label": "Cost to date",
      "values": [
        "0",
        "0",
        "0",
        "9,100",
        "9,100",
        "27,100",
        "31,100",
        "31,100",
        "31,100",
        "31,100",
        "31,100",
        "31,100",
        "31,100"
      ]
    },
    {
      "label": "Margin to date",
      "values": [
        "0",
        "0",
        "0",
        "−9,100",
        "−9,100",
        "−27,100",
        "−31,100",
        "−25,100",
        "−19,100",
        "2,500",
        "7,900",
        "7,900 (20.3%)",
        "7,900 (20.3%)"
      ]
    },
    {
      "label": "Design hours",
      "values": [
        "0",
        "0",
        "0 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan",
        "160 / 120 plan"
      ]
    }
  ],
  "results": [
    {
      "label": "Revenue",
      "value": "39,000"
    },
    {
      "label": "Cost",
      "value": "31,100"
    },
    {
      "label": "Project margin",
      "value": "7,900 (20.3%)"
    },
    {
      "label": "Design margin",
      "value": "1,600 (13.3%)"
    },
    {
      "label": "Supervision margin",
      "value": "50%"
    },
    {
      "label": "Effective design rate",
      "value": "75/h vs 90 target"
    }
  ]
}
\`\`\`

#### The full story

**Lumen & Loom Interiors** wins a contract to design and fit out the 600 m² office of *Harbourline Logistics*. The contract has three parts: a fixed design fee of 12,000 billed in two milestones, site supervision billed at 90 per hour, and furniture supplied at cost plus 20%.

**Project creation.** The account manager creates sales order S00452 with three service lines: *Interior Design – Fixed Fee* (Based on Milestones, 12,000), *Site Supervision* (Based on Timesheets, 90/h, estimated 60 h) and a furniture re-invoicing product. Confirming the order creates project **Harbourline Office Fit-out** with tasks and analytic account *HL-2025-07*.

**Tasks.** Project manager Ananya plans tasks: *Space planning*, *Concept & mood boards*, *Detailed drawings*, *Furniture procurement* and *Site supervision*. Two milestones are linked to the design line: *Concept approved* (50%) and *Drawings handed over* (50%).

**Timesheets.** Two designers log 160 hours on the design tasks (cost 40/h = **6,400**). The site supervisor logs 60 hours on supervision (cost 45/h = **2,700**). Ananya validates timesheets weekly. No GL entries are posted for timesheets — only analytic cost lines on HL-2025-07.

**Material and service costs.** The purchasing officer orders furniture from *Crestwood Furnishings* for **18,000** with the project's analytic distribution, delivered by dropship directly to Harbourline. A painting subcontractor bills **4,000** (included in the design fee, not re-billable), also coded to the project.

**Customer billing.**
- Concept approved on 20 May ▸ milestone invoice 6,000 + 15% tax.
- Drawings handed over on 25 June ▸ second milestone invoice 6,000 + tax.
- Furniture re-invoiced at cost + 20% = **21,600** + tax.
- Supervision: 60 validated hours × 90 = **5,400** + tax, invoiced at month end.
Total revenue: 12,000 + 21,600 + 5,400 = **39,000**.

**Project profitability.** The Project Updates profitability panel shows:

| | Revenue | Cost |
|---|---:|---:|
| Design (milestones) | 12,000 | 6,400 timesheets + 4,000 subcontractor |
| Supervision | 5,400 | 2,700 timesheets |
| Furniture | 21,600 | 18,000 |
| **Total** | **39,000** | **31,100** |

Project margin = 7,900, or **20.3%**. The design component alone earned only 1,600 (13.3%) because the designers spent 160 hours against 120 planned — a 33% hours overrun caused by three rounds of concept changes. Supervision earned 50% margin and furniture 16.7%.

**Lessons learned.** For the next project, Lumen & Loom limits the fixed fee to two concept revisions and bills further revisions on timesheets. Billable utilisation for the designers in June was 78%, and the effective hourly rate on design work was 12,000 ÷ 160 = 75 versus the 90 target.`,
  },
  quiz: {
    slug: "project-to-profit-quiz",
    title: "Project to Profit – Knowledge Check",
    passMark: 70,
    questions: [
      {
        prompt: "Which product setting makes Odoo create a project automatically when a sales order is confirmed?",
        kind: "single",
        options: ["Invoicing Policy", "Create on Order = Project & Task (or Project)", "Product Type = Storable", "Re-Invoice Expenses"],
        correct: [1],
        explanation: "The 'Create on Order' field on service products creates a task, a project, or both when the sales order is confirmed.",
      },
      {
        prompt: "Recording a timesheet in Odoo posts a journal entry to the general ledger.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Timesheets create analytic lines valued at the employee's hourly cost. Salary expense reaches the GL through payroll.",
      },
      {
        prompt: "Which invoicing policies are available for service products in Odoo 17? (select all that apply)",
        kind: "multiple",
        options: ["Based on Timesheets", "Based on Milestones", "Prepaid/Fixed Price", "Based on Bank Statement"],
        correct: [0, 1, 2],
        explanation: "Service invoicing policies include Prepaid/Fixed Price, Based on Timesheets, Based on Milestones and Based on Delivered Quantity (Manual).",
      },
      {
        prompt: "A project has revenue 39,000 and costs 31,100. What is the project gross margin %?",
        kind: "single",
        options: ["20.3%", "25.4%", "79.7%", "7.9%"],
        correct: [0],
        explanation: "(39,000 − 31,100) ÷ 39,000 × 100 = 20.3%.",
      },
      {
        prompt: "Which feature ensures that every vendor bill line carries a project analytic account?",
        kind: "single",
        options: ["Lock dates", "Analytic plan applicability set to Mandatory", "Fiscal positions", "Reservation method"],
        correct: [1],
        explanation: "Analytic plan applicability rules can make analytic distribution mandatory for certain documents, preventing uncoded project costs.",
      },
      {
        prompt: "In Odoo 17, which timesheet capabilities require Enterprise? (select all that apply)",
        kind: "multiple",
        options: ["Timesheets app grid view and timers", "Timesheet validation and reminders", "Logging hours on a task's Timesheets tab", "Planning app for resource scheduling"],
        correct: [0, 1, 3],
        explanation: "Logging hours on tasks is available in Community (hr_timesheet). The Timesheets app grid, timers, validation/reminders and the Planning app are Enterprise.",
      },
    ],
  },
};

export const businessProcesses: BusinessProcessContent[] = [
  orderToCash,
  procureToPay,
  inventoryManagement,
  recordToReport,
  planToProduce,
  projectToProfit,
];
