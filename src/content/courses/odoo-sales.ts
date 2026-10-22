import type { CourseContent } from "../types";
import { salesTroubleshootingBody } from "../visual-lessons/sales-troubleshooting";
import { salesMasterDataTransactionsBody } from "../visual-lessons/sales-master-data-transactions";

/**
 * Odoo Sales application training (16-point application template).
 * Running example company: Northwind Office Supplies Pvt Ltd (B2B office-supplies distributor).
 */
export const odooSales: CourseContent = {
  slug: "odoo-sales",
  section: "odoo-apps",
  title: "Odoo Sales: Quotation to Invoice",
  summary:
    "Master the Odoo Sales app from quotation to invoice: quotation templates, optional products, pricelists, discounts, payment terms, online signature and payment, invoicing policies, down payments and the link with Inventory and Accounting. Includes troubleshooting, practice tasks and interview preparation.",
  level: "beginner",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 2,
  skills: [
    "Explain the quotation-to-cash flow in Odoo",
    "Configure Sales settings, pricelists, quotation templates and payment terms",
    "Set up products with correct invoicing policy and units of measure",
    "Create, send, confirm and invoice sales orders including down payments",
    "Explain accounting and inventory impact of sales transactions",
    "Analyse sales with the Sales Analysis report",
    "Troubleshoot common invoicing and pricing issues",
  ],
  modules: [
    {
      title: "Module 1: Understanding Odoo Sales",
      lessons: [
        {
          slug: "overview-and-business-problems",
          title: "Overview, business problems & process flow",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `\`\`\`visual-video
{
  "src": "/videos/odoo-sales-q2i.mp4",
  "poster": "/videos/odoo-sales-q2i.webp",
  "title": "Odoo Sales: quotation to invoice, recorded live in Odoo 20",
  "duration": "3:37",
  "caption": "A short introduction, then the full process as a continuous live screen recording in an Odoo 20 database with fictional Northwind data.",
  "chapters": [
    {
      "t": 0,
      "label": "Introduction"
    },
    {
      "t": 12,
      "label": "What Odoo Sales does"
    },
    {
      "t": 33,
      "label": "Why it matters"
    },
    {
      "t": 50,
      "label": "Document flow"
    },
    {
      "t": 72,
      "label": "Live: create the quotation"
    },
    {
      "t": 120,
      "label": "Live: confirm the order"
    },
    {
      "t": 132,
      "label": "Live: pick and deliver"
    },
    {
      "t": 156,
      "label": "Live: create and post the invoice"
    },
    {
      "t": 177,
      "label": "Live: register the payment"
    },
    {
      "t": 200,
      "label": "Recap"
    }
  ]
}
\`\`\`

## 1. Application overview

The **Odoo Sales** app manages the commercial agreement with the customer: the **quotation**, its approval by the customer, and the confirmed **sales order** that triggers delivery and invoicing. It sits between CRM (opportunities) and Inventory/Accounting (delivery and invoice).

Running example:

| Item | Value |
|---|---|
| Company | Northwind Office Supplies Pvt Ltd |
| Products | A4 paper reams, toner cartridges, office chairs, pantry supplies, installation service |
| Customers | Corporate offices, schools, co-working spaces |
| Price lists | Standard (list price), Education (−8%), Key Account (contract prices) |
| Payment terms | Immediate, 30 Days, 50% advance / balance in 30 days |

### Document lifecycle

| Status | Meaning |
|---|---|
| Quotation | Draft offer, editable |
| Quotation Sent | Sent to the customer by email/portal |
| Sales Order | Confirmed by customer or salesperson; delivery created if storable products |
| Locked / Done | Locked after confirmation if Lock Confirmed Sales is enabled (verify label in your instance) |
| Cancelled | Cancelled order |

Technical model: **sale.order** (header) and **sale.order.line** (lines).

> **Consultant tip:** A quotation and a sales order are the same record in different states. The document number (e.g. S00042) does not change on confirmation.

\`\`\`visual-cards
{
  "label": "Key concepts",
  "title": "Sales building blocks",
  "columns": 3,
  "cards": [
    { "icon": "file", "title": "Quotation / sales order", "body": "One sale.order record; S00042 keeps its number on confirmation." },
    { "icon": "tag", "title": "Pricelist", "body": "Standard, Education (-8%) and Key Account prices, assigned per customer." },
    { "icon": "clipboard", "title": "Quotation template", "body": "Default lines, optional products and validity for faster, consistent offers." },
    { "icon": "invoice", "title": "Invoicing policy", "body": "Ordered or Delivered quantities: decides when an order can be invoiced.", "tone": "warning" },
    { "icon": "coins", "title": "Down payment", "body": "Advance invoice, e.g. 50% on furniture, deducted from the final invoice." },
    { "icon": "signature", "title": "Online signature and payment", "body": "The customer confirms the quotation on the portal.", "tone": "info" }
  ]
}
\`\`\`

## 2. Business problems solved

| Business problem at Northwind | Odoo Sales feature |
|---|---|
| Quotations typed in Word with inconsistent prices | Products with list price + pricelists |
| Different prices for schools and key accounts | Pricelists assigned to customers |
| Salespeople give unapproved discounts | Discount setting + access rights; margin visibility |
| Slow customer approval | Online signature and online payment on the customer portal |
| Invoices raised before goods delivered | Invoicing policy "Delivered quantities" |
| Cash-flow risk on furniture orders | Down payments and payment terms |
| Upselling missed | Optional products and quotation templates |
| No sales visibility | Sales Analysis report, sales team dashboards |

\`\`\`visual-beforeafter
{
  "title": "Northwind sales: before and after Odoo",
  "before": {
    "title": "Word quotations and email",
    "points": [
      "Quotations typed in Word with inconsistent prices",
      "School and key-account prices remembered by each salesperson",
      "Unapproved discounts given freely",
      "Invoices raised before goods are delivered",
      "No view of open quotations or sales per team"
    ]
  },
  "after": {
    "title": "Quote-to-Cash in Odoo Sales",
    "points": [
      "Products with list prices and pricelists per customer",
      "Quotation templates and optional products for upselling",
      "Online signature and payment speed up approval",
      "Delivered-quantities policy invoices only what was shipped",
      "Sales Analysis and team dashboards show the whole pipeline"
    ]
  }
}
\`\`\`

## 3. Process flow

\`\`\`visual-flow
{
  "title": "Quote-to-Cash in Sales",
  "steps": [
    {
      "title": "CRM opportunity",
      "icon": "target",
      "app": "CRM"
    },
    {
      "title": "Quotation",
      "icon": "file",
      "app": "Sales"
    },
    {
      "title": "Quotation sent",
      "icon": "mail",
      "app": "Sales"
    },
    {
      "title": "Sales order",
      "icon": "check",
      "app": "Sales",
      "detail": "The customer signs or pays online, or the salesperson clicks Confirm."
    },
    {
      "title": "Fulfil & invoice",
      "icon": "workflow",
      "parallel": [
        {
          "title": "Delivery order",
          "app": "Inventory",
          "icon": "truck",
          "detail": "Storable products; goods shipped."
        },
        {
          "title": "Create invoice",
          "app": "Accounting",
          "icon": "invoice",
          "detail": "Per the invoicing policy."
        }
      ]
    },
    {
      "title": "Customer invoice",
      "icon": "invoice",
      "app": "Accounting"
    },
    {
      "title": "Payment / reconciliation",
      "icon": "bank",
      "app": "Accounting"
    }
  ]
}
\`\`\`

## 4. Dependencies on other apps

| App | Dependency |
|---|---|
| Contacts | Customers and addresses |
| Product (base) | Products, variants, units of measure |
| Invoicing / Accounting | Required to create customer invoices; installed with Sales |
| Inventory | Delivery orders for storable/consumable products (optional) |
| CRM | Opportunities and sales teams (optional) |
| Payment providers | Online payment on quotations (optional) |
| Website / eCommerce | Online orders create sales orders (optional) |
| Subscriptions | Recurring orders — Enterprise |

> **Consultant tip:** Sales without Inventory is perfectly valid for service businesses. Install Inventory only when you actually ship physical goods or need stock control.

\`\`\`visual-hub
{
  "title": "Sales and its integrations",
  "center": { "label": "Sales (sale.order)", "icon": "file" },
  "nodes": [
    { "label": "Contacts", "icon": "users", "detail": "Customers and their invoice and delivery addresses." },
    { "label": "CRM", "icon": "target", "detail": "Opportunities and sales teams (optional)." },
    { "label": "Inventory", "icon": "truck", "detail": "Delivery orders for stock-tracked products (optional)." },
    { "label": "Invoicing / Accounting", "icon": "invoice", "detail": "Customer invoices; installed with Sales." },
    { "label": "Payment providers", "icon": "payment", "detail": "Online payment on quotations (optional)." },
    { "label": "Website / eCommerce", "icon": "globe", "detail": "Online orders create sales orders (optional)." }
  ]
}
\`\`\`

### Who uses Sales at Northwind

| Role | Responsibility in Odoo Sales |
|---|---|
| Salesperson | Creates quotations, sends them, follows up, confirms orders |
| Sales Manager | Reviews discounts and margins, monitors team quotations and Sales Analysis |
| Sales Coordinator | Maintains customers, pricelists and quotation templates |
| Warehouse team | Validates deliveries created by confirmed orders (Inventory) |
| Accounts Receivable | Creates/posts invoices from the "To Invoice" list and registers payments |

### A typical day

On Monday morning the Corporate Sales manager opens **Sales ▸ Orders ▸ Quotations**, filters on *Quotation Sent* older than seven days and asks salespeople to follow up. The AR accountant opens the orders waiting to be invoiced and invoices every order whose goods were delivered on Friday. The sales coordinator updates the Key Account pricelist after the annual price revision. Notice that each person works in the same sale.order records, but from a different angle — this is the integration benefit of an ERP compared with separate spreadsheets.

> **Consultant tip:** In discovery, ask "Who raises the invoice today and when?" The answer tells you the invoicing policy, whether down payments are needed and who needs Accounting access.

\`\`\`visual-order
{
  "title": "Quote-to-Cash order",
  "prompt": "Put the steps of a Northwind chair order in the right order (policy: Delivered quantities).",
  "items": [
    "Salesperson creates the quotation",
    "Quotation is sent to the customer",
    "Customer signs online and the order is confirmed",
    "Warehouse validates the delivery",
    "AR creates and posts the customer invoice",
    "Payment is registered and reconciled"
  ],
  "explanation": "With Delivered quantities nothing is invoiceable before the delivery is validated."
}
\`\`\`

\`\`\`visual-check
{
  "question": "What does Odoo post in Accounting when Northwind confirms sales order S00042?",
  "options": ["A receivable for the order total", "Nothing: entries start with the invoice (and stock entries with the delivery if valuation is automated)", "A revenue entry", "A tax liability entry"],
  "correct": 1,
  "explanation": "Confirmation triggers the delivery and makes the order invoiceable, but posts nothing itself."
}
\`\`\`

## Key takeaways

- Sales owns the customer agreement: quotation → sales order → invoice request.
- Pricelists, templates and optional products standardise pricing and upselling.
- The invoicing policy decides *when* an order can be invoiced.
- Sales triggers Inventory (deliveries) and Accounting (invoices) but posts nothing itself on confirmation.`,
          flashcards: [
            { term: "Quotation", definition: "A draft sale.order offered to the customer; becomes a sales order once confirmed." },
            { term: "Pricelist", definition: "A set of price rules (fixed price, discount, formula) applied to customers; enabled in Sales settings." },
            { term: "Quotation template", definition: "Predefined lines, optional products, validity and terms used to create quotations quickly." },
            { term: "Invoicing policy", definition: "Product setting: invoice ordered quantities or delivered quantities." },
            { term: "Down payment", definition: "An advance invoice (percentage or fixed amount) deducted from the final invoice." },
            { term: "Optional products", definition: "Upsell suggestions shown on the quotation that the customer can add from the portal." },
            { term: "Payment terms", definition: "Rules defining when the invoice is due, e.g. 30 Days or 50% advance." },
          ],
          resources: [
            { title: "Odoo 17 Sales documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/sales.html" },
            { title: "Product import template", kind: "template", url: "/api/templates/products" },
          ],
        },
      ],
    },
    {
      title: "Module 2: Setting up Sales",
      lessons: [
        {
          slug: "prerequisites-configuration-settings",
          title: "Prerequisites, configuration & settings",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 5. Prerequisites

| Prerequisite | Why | Source at Northwind |
|---|---|---|
| Company details, currency, fiscal localisation | Invoices and taxes | Finance |
| Chart of accounts and taxes (e.g. GST 18%, 12%) | Tax computation on lines | Finance |
| Product categories | Income accounts, reporting | Product manager |
| Product list with prices, UoM, taxes | Order lines | Product manager |
| Customer list with payment terms and pricelists | Pre-filled orders | Sales Ops |
| Pricing policy and discount authority | Pricelists, discount setting | Sales Head |
| Invoicing rule (advance, on order, on delivery) | Invoicing policy | Finance + Sales |
| Sales teams and users | Access and reporting | Sales Head |

## 6. Configuration and settings

Open **Sales ▸ Configuration ▸ Settings**. Key options (labels for Odoo 17 — verify in your training instance):

| Section | Setting | What it does | Northwind decision |
|---|---|---|---|
| Product Catalog | Variants | Products with attributes (colour, size) | On — chairs in black/grey |
| Product Catalog | Units of Measure | Sell in different UoM (Ream, Box of 5) | On |
| Pricing | Discounts | Discount % column on order lines | On |
| Pricing | Pricelists | Customer-specific price rules | On |
| Pricing | Margins | Show margin on orders (based on product cost) | On |
| Quotations & Orders | Quotation Templates | Reusable quotation structures | On |
| Quotations & Orders | Online Signature | Customer signs on the portal | On |
| Quotations & Orders | Online Payment | Customer pays/prepays on the portal | On for furniture |
| Quotations & Orders | Lock Confirmed Sales | Prevent edits after confirmation | On |
| Quotations & Orders | Pro-Forma Invoice | Send pro-forma before payment | On (export customers) |
| Invoicing | Invoicing Policy (default) | Invoice what is ordered / delivered | Delivered quantities |
| Invoicing | Down Payments | Default product for down payments | Auto-created on first use |

### Pricelists in Odoo 17

When **Pricelists** is enabled, go to **Sales ▸ Products ▸ Pricelists**. Each pricelist contains **price rules** that can apply to all products, a product category, a product or a variant, with a minimum quantity and validity dates. Price computation types:

| Computation | Example |
|---|---|
| Fixed price | Toner XL = INR 3,450 for Key Accounts |
| Discount | Education: 8% off all products |
| Formula | Based on cost + 25% markup, rounded |

Assign the pricelist on the customer (**Sales & Purchase** tab of the contact) so it is pre-filled on new quotations.

> **Consultant tip:** In Odoo 16 the setting had two modes (multiple prices per product / advanced price rules). Odoo 17 simplified this to a single Pricelists option with rules. If a client upgrades from older versions, re-check their pricelists after migration.

### Payment terms

**Invoicing/Accounting ▸ Configuration ▸ Payment Terms** (menu label depends on installed apps). Northwind creates:

- **Immediate Payment**
- **30 Days**
- **50% Advance, Balance 30 Days** — two lines: 50% due on invoice date, balance 30 days after.

Payment terms on the order flow to the invoice and compute the due date(s).

### Quotation templates

**Sales ▸ Configuration ▸ Quotation Templates** (visible after enabling the setting):

1. Click **New**, name it *School Annual Supply*.
2. **Lines** tab: A4 paper 75 GSM (500 reams), Whiteboard markers (200 boxes).
3. **Optional Products** tab: Document trays, Stapler heavy-duty.
4. Set **Quotation expires after** 30 days.
5. Enable **Online Signature** and/or **Online Payment** with a prepayment percentage if needed.
6. Add terms and conditions in the template.

### Default invoicing policy

The setting defines the default for **new** products only. Each product has its own **Invoicing Policy** field on the **General Information** tab. Changing the setting does not update existing products.

#### In Odoo 20: Product settings that drive sales

\`\`\`visual-screen
{
  "src": "/visuals/odoo-sales/screens/sal-product-invoicing.webp",
  "alt": "Odoo 20 product form for A4 Copy Paper with invoicing policy, sales price and sales taxes.",
  "title": "Product settings that drive sales",
  "path": "Sales ▸ Products ▸ Products",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 21.4,
      "y": 38.5,
      "w": 19.4,
      "h": 3.3,
      "tag": "right",
      "title": "Invoicing Policy",
      "text": "Ordered quantities: invoice at confirmation. Delivered: only what shipped."
    },
    {
      "x": 46.1,
      "y": 34,
      "w": 8.8,
      "h": 3.3,
      "tag": "right",
      "title": "Sales Price",
      "text": "Default price; pricelists can override it."
    },
    {
      "x": 46.7,
      "y": 39.6,
      "w": 9.9,
      "h": 6.4,
      "tag": "right",
      "title": "Sales Taxes",
      "text": "Default GST on sales; fiscal positions can swap it."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

## Key takeaways

- Finance must deliver taxes, accounts and payment terms before Sales go-live.
- Pricelists (17: rules-based), discounts and margins are settings, not customizations.
- Quotation templates bring standard lines, optional products, validity, signature and payment.
- The invoicing policy is product-level; the setting is only a default for new products.`,
          resources: [
            { title: "Odoo 17 Sales documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/sales.html" },
            { title: "Product categories template", kind: "template", url: "/api/templates/product-categories" },
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
          ],
        },
      ],
    },
    {
      title: "Module 3: Working in Sales",
      lessons: [
        {
          slug: "master-data-and-transactions",
          title: "Master data & transactions",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: salesMasterDataTransactionsBody,
          resources: [
            { title: "Product import template", kind: "template", url: "/api/templates/products" },
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
            { title: "Odoo 17 Sales documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/sales.html" },
          ],
        },
        {
          slug: "automation-reports-impact",
          title: "Automation, reports & impact",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise", "customization"],
          body: `## 9. Approval rules and automation

Unlike Purchase, the Sales app has **no standard order-approval setting** in Odoo 17. Controls and automation options:

| Need | Solution | Scope |
|---|---|---|
| Prevent changes after confirmation | Lock Confirmed Sales setting | Configuration |
| Customer must accept before confirmation | Online Signature / Online Payment | Configuration |
| Credit limit warning | Accounting setting for customer credit limit (verify availability in your edition/instance) | Configuration |
| Warn on specific customers/products | Sale warnings on contact/product (Warnings setting — verify label) | Configuration |
| Auto-send follow-up when quotation expires | Automation rule (developer mode) | Configuration |
| Discount above 10% needs manager approval | Studio approval rules or custom module | Enterprise (Studio) / Customization |
| Generic approval requests | Approvals app | Enterprise |
| Automatic invoicing after online payment | Setting in Sales/payment configuration (verify in your instance) | Configuration |

\`\`\`visual-match
{
  "title": "Which control answers the need?",
  "prompt": "Match each client need to the standard Odoo 17 answer.",
  "leftLabel": "Client need",
  "rightLabel": "Solution",
  "pairs": [
    { "left": "Prevent changes after confirmation", "right": "Lock Confirmed Sales setting" },
    { "left": "Customer must accept before confirmation", "right": "Online Signature / Online Payment" },
    { "left": "Auto-send follow-up when a quotation expires", "right": "Automation rule (developer mode)" },
    { "left": "Discount above 10% needs manager approval", "right": "Studio approval rules or a custom module" },
    { "left": "Generic approval requests", "right": "Approvals app (Enterprise)" }
  ],
  "explanation": "Locks, signatures and automation rules are configuration; a discount approval on the sales order itself needs Studio or customization because Sales has no standard order-approval setting."
}
\`\`\`

> **Consultant tip:** When a client asks for "sales approval", clarify *what* is approved: price, discount, credit, or the order itself. Each has a different standard answer — and only some need customization.

## 10. Reports and dashboards

| Report | Menu | Use |
|---|---|---|
| Sales Analysis | Sales ▸ Reporting ▸ Sales | Revenue, quantities, margins by product, customer, salesperson, team, period |
| Quotations / Orders lists | Sales ▸ Orders | Pipeline of quotations and order statuses |
| Orders to Invoice | Sales ▸ To Invoice ▸ Orders to Invoice | Orders waiting for invoicing |
| Sales team overview | Sales ▸ Orders ▸ Sales Teams (verify location) | Team targets and quotations |
| Invoice Analysis | Accounting/Invoicing ▸ Reporting | Invoiced revenue (actual) |

Note the difference: **Sales Analysis** is based on confirmed orders (booked revenue), while **Invoice Analysis** shows invoiced revenue. Explain this to finance users to avoid "the numbers don't match" tickets.

\`\`\`visual-cards
{
  "label": "Key reports",
  "title": "Which report answers which question?",
  "columns": 3,
  "cards": [
    { "icon": "chart", "title": "Sales Analysis", "body": "Booked revenue, quantities and margins from confirmed orders, by product, customer, salesperson, team or period.", "tone": "info" },
    { "icon": "list", "title": "Quotations / Orders", "body": "The pipeline of quotations and the status of each order." },
    { "icon": "invoice", "title": "Orders to Invoice", "body": "Orders that are waiting to be invoiced.", "tone": "warning" },
    { "icon": "users", "title": "Sales team overview", "body": "Team targets and open quotations per team." },
    { "icon": "coins", "title": "Invoice Analysis", "body": "Invoiced (actual) revenue from posted invoices, under Accounting/Invoicing reporting.", "tone": "success" }
  ]
}
\`\`\`

\`\`\`visual-check
{
  "question": "Northwind's finance manager says this month's Sales Analysis total is higher than Invoice Analysis. What is the most likely reason?",
  "options": ["Sales Analysis includes taxes twice", "Some confirmed orders have not been invoiced yet", "Invoice Analysis ignores posted invoices", "The pricelist was changed"],
  "correct": 1,
  "explanation": "Sales Analysis is based on confirmed orders (booked revenue); Invoice Analysis only shows posted invoices. Orders still waiting in Orders to Invoice explain the gap."
}
\`\`\`

Useful pivots for Northwind:

- Untaxed Total by **Product Category × Month**
- Margin by **Salesperson**
- Quantity Ordered vs Quantity Delivered vs Quantity Invoiced by **Product**

## 11. Accounting and inventory impact

| Event | Inventory impact | Accounting impact |
|---|---|---|
| Quotation / confirmation | Reservation on delivery (for stock-tracked goods) | None |
| Delivery validated | Stock decreases, stock move to Customers location | With automated (perpetual) valuation: Dr Stock Interim (Delivered) / Cr Stock Valuation at cost |
| Customer invoice posted | None | Dr Accounts Receivable / Cr Product Sales (income) / Cr Tax Payable; with Anglo-Saxon perpetual valuation also Dr COGS / Cr Stock Interim (Delivered) |
| Payment registered | None | Dr Bank (or Outstanding Receipts) / Cr Accounts Receivable |
| Down payment invoice | None | Dr Receivable / Cr Down-payment account (as configured on the down-payment product) / Cr Tax |

Exact accounts depend on the localisation and product category configuration — verify in your training instance. With periodic (manual) valuation, no stock journal entries are created on delivery.

\`\`\`visual-flow
{
  "title": "Where each sales event hits inventory and accounting",
  "caption": "Automated (perpetual) Anglo-Saxon valuation; exact accounts depend on localisation and product category.",
  "steps": [
    { "title": "Quotation / confirmation", "icon": "file", "app": "Sales", "detail": "Reserves stock on the delivery for stock-tracked goods.", "impact": "No journal entry" },
    { "title": "Delivery validated", "icon": "truck", "app": "Inventory", "detail": "Stock moves to the Customers location.", "impact": "Dr Stock Interim (Delivered) / Cr Stock Valuation at cost" },
    { "title": "Customer invoice posted", "icon": "invoice", "app": "Accounting", "detail": "Revenue and receivable are recognised.", "impact": "Dr Receivable / Cr Product Sales / Cr Tax Payable; plus Dr COGS / Cr Stock Interim (Delivered)" },
    { "title": "Payment registered", "icon": "payment", "app": "Accounting", "impact": "Dr Bank (or Outstanding Receipts) / Cr Receivable" }
  ]
}
\`\`\`

## 12. Integration with other apps

| App | Integration |
|---|---|
| CRM | Quotations from opportunities; won status |
| Inventory | Deliveries, routes (MTO/dropship), availability on lines |
| Purchase | MTO / dropship routes create RFQs from sales orders |
| Manufacturing | MTO + Manufacture route creates manufacturing orders |
| Accounting / Invoicing | Invoices, payment terms, taxes, down payments |
| Website / eCommerce | Online orders become sales orders |
| Project / Timesheets | Service products can create tasks/projects; invoice on timesheets |
| Subscriptions | Recurring orders — Enterprise |

## Key takeaways

- Sales offers locks, signatures and warnings; order/discount approvals require Studio or customization.
- Sales Analysis ≠ Invoice Analysis — booked vs invoiced revenue.
- Delivery drives inventory and (with perpetual valuation) stock entries; the invoice drives revenue and receivables.
- Routes on products connect Sales to Purchase and Manufacturing.`,
          resources: [
            { title: "Odoo 17 Sales documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/sales.html" },
          ],
        },
      ],
    },
    {
      title: "Module 4: Consultant readiness",
      lessons: [
        {
          slug: "troubleshooting-practice-interview",
          title: "Troubleshooting, practice & interview prep",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: salesTroubleshootingBody,
          resources: [
            { title: "Odoo 17 Sales documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/sales/sales.html" },
            { title: "Product import template", kind: "template", url: "/api/templates/products" },
          ],
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-sales-final",
    title: "Odoo Sales – Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "A product has invoicing policy 'Delivered quantities'. 100 units are ordered and 60 delivered. How many can be invoiced?",
        kind: "single",
        options: ["100", "60", "40", "0"],
        correct: [1],
        explanation: "With delivered quantities, only the delivered 60 units are invoiceable.",
      },
      {
        prompt: "Confirming a sales order creates a journal entry in Accounting.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Confirmation creates no journal entry. Entries come from deliveries (perpetual valuation) and invoices.",
      },
      {
        prompt: "Where do you enable quotation templates?",
        kind: "single",
        options: ["Inventory settings", "Sales ▸ Configuration ▸ Settings", "Accounting ▸ Journals", "CRM ▸ Stages"],
        correct: [1],
        explanation: "Quotation Templates is a Sales setting; templates are then managed under Sales ▸ Configuration.",
      },
      {
        prompt: "Which are standard Sales settings in Odoo 17? (Select all that apply)",
        kind: "multiple",
        options: ["Pricelists", "Discounts", "Online Signature", "Discount approval by manager"],
        correct: [0, 1, 2],
        explanation: "Pricelists, discounts and online signature are settings; discount approvals require Studio or customization.",
      },
      {
        prompt: "How is a down payment treated on the final invoice?",
        kind: "single",
        options: ["Ignored", "Deducted as a negative line", "Added again", "Converted to a credit note automatically"],
        correct: [1],
        explanation: "The regular invoice deducts previous down payments as negative lines.",
      },
      {
        prompt: "What determines the default price on a new quotation for a customer?",
        kind: "single",
        options: ["The customer's pricelist (and its rules)", "The vendor pricelist", "The product cost", "The sales team"],
        correct: [0],
        explanation: "The pricelist assigned to the customer applies its rules to compute line prices.",
      },
      {
        prompt: "Changing the default invoicing policy in Sales settings updates all existing products.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "The setting only provides a default for new products; existing products keep their own policy.",
      },
      {
        prompt: "In Odoo 18, what replaces the 'Storable Product' type?",
        kind: "single",
        options: ["Consumable", "Goods with Track Inventory enabled", "Service", "Combo"],
        correct: [1],
        explanation: "Odoo 18 uses product type Goods with a Track Inventory checkbox for stock-tracked products.",
      },
      {
        prompt: "With Anglo-Saxon perpetual valuation, which entry is posted when the customer invoice is validated (in addition to receivable/income/tax)?",
        kind: "single",
        options: ["Dr COGS / Cr Stock Interim (Delivered)", "Dr Stock / Cr Payable", "Dr Bank / Cr Receivable", "No additional entry"],
        correct: [0],
        explanation: "Anglo-Saxon accounting recognises COGS at invoice time, clearing the stock interim (delivered) account.",
      },
      {
        prompt: "What is the main difference between Sales Analysis and Invoice Analysis?",
        kind: "single",
        options: ["No difference", "Sales Analysis is based on orders; Invoice Analysis on posted invoices", "Invoice Analysis only shows vendor bills", "Sales Analysis only shows quotations"],
        correct: [1],
        explanation: "Sales Analysis reflects booked order revenue, Invoice Analysis reflects invoiced revenue.",
      },
      {
        prompt: "Which features allow the customer to confirm a quotation from the portal? (Select all that apply)",
        kind: "multiple",
        options: ["Online Signature", "Online Payment", "Lock Confirmed Sales", "Margins"],
        correct: [0, 1],
        explanation: "Online signature and/or payment confirm the quotation from the portal; locking and margins do not.",
      },
      {
        prompt: "A user gets 'no invoiceable line' on a confirmed order of goods. What is the most likely cause?",
        kind: "single",
        options: ["Missing pricelist", "Invoicing policy is delivered quantities and nothing is delivered", "Customer has no email", "Quotation template missing"],
        correct: [1],
        explanation: "Delivered-quantity products cannot be invoiced before the delivery is validated.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-sales-assignment-1",
      title: "Configure pricing and quotations for Northwind",
      instructions: `## Scenario

Northwind sells to schools at 8% discount, to key accounts at contract prices and to everyone else at list price. Furniture orders need 50% advance.

## Tasks

1. Configure Sales settings (variants, UoM, discounts, pricelists, margins, quotation templates, online signature).
2. Create three pricelists and assign them to sample customers.
3. Create payment terms including 50% advance / balance 30 days.
4. Create the quotation template School Annual Supply with optional products.
5. Import at least 10 products and 5 customers using the portal templates.

## Deliverables

- Configuration workbook (settings, pricelist rules, payment terms, template).
- Screenshots of one quotation per pricelist showing the computed unit prices.
- Completed import files.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Correct settings and pricelist rules | 35% |
| Accurate prices on test quotations | 25% |
| Clean import files (no errors, correct UoM/taxes/policy) | 25% |
| Documentation quality | 15% |`,
    },
    {
      slug: "odoo-sales-assignment-2",
      title: "End-to-end order to invoice with partial delivery and down payment",
      instructions: `## Scenario

Greenfield International School orders 600 reams of A4 paper (delivered quantities policy) and 20 executive chairs with a 50% down payment.

## Tasks

1. Create, send and confirm the quotation (use online signature in the portal preview).
2. Raise the 50% down payment invoice for the chairs and register payment.
3. Deliver 400 reams and all chairs; invoice; then deliver the 200-ream backorder and invoice.
4. Record the journal entries generated at each step (from the invoice/stock journal items).

## Deliverables

- A step log with document numbers (SO, deliveries, invoices, payments).
- A table of journal entries per event (account, debit, credit).
- A one-paragraph explanation of how the invoicing policy affected each invoice.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Correct transaction sequence and statuses | 35% |
| Down payment correctly deducted | 20% |
| Accurate journal entry table | 30% |
| Clarity of explanation | 15% |`,
    },
  ],
};
