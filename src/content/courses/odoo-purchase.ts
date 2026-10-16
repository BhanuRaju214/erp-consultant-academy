import type { CourseContent } from "../types";

/**
 * Odoo Purchase application training (16-point application template).
 * Running example company: Northwind Office Supplies Pvt Ltd (B2B office-supplies distributor).
 */
export const odooPurchase: CourseContent = {
  slug: "odoo-purchase",
  section: "odoo-apps",
  title: "Odoo Purchase: RFQ to Vendor Bill",
  summary:
    "Learn the Odoo Purchase app end to end: RFQs and purchase orders, vendor pricelists, purchase agreements, order approval, bill control policies, 3-way matching, receipts, replenishment with reordering rules and MTO, vendor bills, accounting impact and reporting. Includes troubleshooting, practice tasks and interview preparation.",
  level: "intermediate",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 3,
  skills: [
    "Explain the procure-to-pay flow in Odoo",
    "Configure Purchase settings including order approval and bill control",
    "Maintain vendor pricelists and purchase agreements",
    "Process RFQs, purchase orders, receipts and vendor bills",
    "Set up replenishment with reordering rules and MTO",
    "Explain accounting and inventory impact of purchases",
    "Troubleshoot common purchasing and billing issues",
  ],
  modules: [
    {
      title: "Module 1: Understanding Odoo Purchase",
      lessons: [
        {
          slug: "overview-and-business-problems",
          title: "Overview, business problems & process flow",
          durationMin: 30,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. Application overview

The **Odoo Purchase** app manages buying from vendors: **Requests for Quotation (RFQ)**, confirmed **Purchase Orders (PO)**, the link to **receipts** in Inventory and the control of **vendor bills** in Accounting. It is the core of the Procure-to-Pay (P2P) cycle.

Running example:

| Item | Value |
|---|---|
| Company | Northwind Office Supplies Pvt Ltd |
| Main vendors | Sunrise Paper Mills (paper), PrintTech Distributors (toner), ErgoSeat Furniture (chairs) |
| Warehouse | Main warehouse, Bengaluru (WH) |
| Buying policy | POs above INR 5,00,000 need Purchase Manager approval |
| Billing policy | Pay only for what was received |

### Document lifecycle (Odoo 17)

| Status | Meaning |
|---|---|
| RFQ | Draft request to a vendor |
| RFQ Sent | Emailed to vendor |
| To Approve | Waiting for manager approval (Order Approval enabled and amount above threshold) |
| Purchase Order | Confirmed; receipt created for goods |
| Locked | Confirmed order locked (Lock Confirmed Orders setting) |
| Cancelled | Cancelled |

Technical model: **purchase.order** and **purchase.order.line**. Vendor prices are stored in **product.supplierinfo**.

> **Consultant tip:** As with Sales, an RFQ and a PO are the same record in different states. The reference (P00012) stays the same on confirmation.

## 2. Business problems solved

| Business problem at Northwind | Odoo Purchase feature |
|---|---|
| Buyers order at random prices | Vendor pricelists on the product's Purchase tab |
| No control over large orders | Order Approval with a minimum amount |
| Stock-outs on fast-moving paper | Reordering rules (min/max) and Replenishment |
| Special customer orders bought manually | Make To Order (MTO) route creating RFQs from sales orders |
| Paying vendors for goods not received | Bill control policy = Received quantities; 3-way matching |
| Annual contracts with negotiated prices | Purchase agreements (blanket orders) |
| Comparing several vendor quotes | Call for tenders / RFQ alternatives (version dependent) |
| No spend visibility | Purchase Analysis report, vendor performance |

## 3. Process flow

\`\`\`visual-flow
{
  "title": "Procure-to-Pay in Purchase",
  "steps": [
    {
      "title": "Need identified",
      "icon": "target",
      "detail": "Manual, reordering rule, or MTO from a sales order."
    },
    {
      "title": "RFQ",
      "icon": "file"
    },
    {
      "title": "RFQ sent",
      "icon": "mail",
      "detail": "Sent by email; update prices when the vendor replies."
    },
    {
      "title": "Confirm order",
      "icon": "check",
      "branch": {
        "when": "Amount > threshold and user not a manager",
        "result": "To Approve → manager clicks Approve Order",
        "tone": "warning"
      }
    },
    {
      "title": "Purchase order",
      "icon": "cart",
      "app": "Purchase"
    },
    {
      "title": "Receive & bill",
      "icon": "workflow",
      "parallel": [
        {
          "title": "Receipt",
          "app": "Inventory",
          "icon": "package",
          "detail": "Validate received quantities."
        },
        {
          "title": "Vendor bill",
          "app": "Accounting",
          "icon": "receipt",
          "detail": "Per the bill control policy."
        }
      ]
    },
    {
      "title": "3-way match",
      "icon": "scale",
      "detail": "PO, receipt and bill agree."
    },
    {
      "title": "Pay the vendor",
      "icon": "payment",
      "app": "Accounting"
    }
  ]
}
\`\`\`

## 4. Dependencies on other apps

| App | Dependency |
|---|---|
| Contacts | Vendors |
| Product | Products, vendor pricelists, units of measure |
| Invoicing / Accounting | Vendor bills, payment terms, taxes |
| Inventory | Receipts, reordering rules, routes (Buy, MTO, Dropship) |
| Sales | MTO and dropship flows starting from sales orders |
| Manufacturing | Components bought for manufacturing orders |
| Approvals app | Generic purchase requests — Enterprise, separate from the PO approval setting |

> **Consultant tip:** The PO "Order Approval" setting (standard) and the **Approvals** app (Enterprise) are different things. Clients often confuse them — clarify in the workshop.

### Who uses Purchase at Northwind

| Role | Responsibility in Odoo Purchase |
|---|---|
| Buyer | Creates and sends RFQs, negotiates, confirms POs, follows up late deliveries |
| Purchase Manager | Approves POs above the threshold, negotiates agreements, reviews spend |
| Warehouse team | Validates receipts and backorders (Inventory) |
| Accounts Payable | Records vendor bills against POs, checks matching, schedules payments |
| Supply chain planner | Maintains reordering rules and vendor lead times |

### A typical week

Every morning the planner opens the Replenishment screen and orders products below their minimum. Buyers send the generated RFQs and update prices when vendors reply. On Wednesday the Purchase Manager filters orders *To Approve* and approves the large furniture orders. When trucks arrive, the warehouse validates receipts and records shortages as backorders. On Friday AP creates bills from the confirmed POs; because bills are controlled on received quantities, a vendor who invoices the full order before delivering everything is only billed for what the warehouse received.

> **Consultant tip:** Ask the client "What happens today when a vendor invoices more than you received?" The answer tells you how strict the bill control and matching configuration must be.

## Key takeaways

- Purchase covers RFQ → PO → receipt → bill → payment.
- Vendor prices live on the product (supplierinfo), not on the vendor contact.
- Approval, bill control and replenishment are standard settings/configuration.
- Purchase depends heavily on Inventory and Accounting configuration.`,
          flashcards: [
            { term: "RFQ", definition: "Request for Quotation: a draft purchase.order sent to a vendor; becomes a PO when confirmed." },
            { term: "Vendor pricelist (supplierinfo)", definition: "Vendor-specific price, minimum quantity, lead time and validity stored on the product's Purchase tab." },
            { term: "Order Approval", definition: "Purchase setting requiring a manager to approve POs above a minimum amount (two-step approval)." },
            { term: "Bill control policy", definition: "Product setting: bill ordered quantities or received quantities." },
            { term: "3-way matching", definition: "Comparing PO, receipt and vendor bill before paying the vendor." },
            { term: "Reordering rule", definition: "Min/max stock rule that triggers replenishment (RFQs) when forecast stock falls below the minimum." },
            { term: "Blanket order", definition: "A purchase agreement fixing prices for a period; individual POs are released against it." },
            { term: "MTO", definition: "Make To Order route: a sales order demand directly generates an RFQ (with the Buy route)." },
          ],
          resources: [
            { title: "Odoo 17 Purchase documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/purchase.html" },
            { title: "Vendor import template", kind: "template", url: "/api/templates/vendors" },
          ],
        },
      ],
    },
    {
      title: "Module 2: Setting up Purchase",
      lessons: [
        {
          slug: "prerequisites-configuration-settings",
          title: "Prerequisites, configuration & settings",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## 5. Prerequisites

| Prerequisite | Why | Source at Northwind |
|---|---|---|
| Vendor master list with tax IDs, addresses, bank details, payment terms | Vendors and bills | Purchase + Finance |
| Product list with purchase UoM, cost, taxes | PO lines | Product manager |
| Vendor price agreements and lead times | Vendor pricelists | Buyers |
| Approval matrix (who approves what amount) | Order Approval | Management |
| Billing policy (pay ordered or received) | Bill control | Finance |
| Warehouse and stock locations | Receipts | Warehouse manager |
| Replenishment policy (min/max quantities, MTO items) | Reordering rules / routes | Supply chain |
| Chart of accounts, taxes, stock valuation method | Bills and valuation | Finance |

### Access rights

| Purchase access | Typical user | Note |
|---|---|---|
| User | Buyer | Can create RFQs/POs; POs above threshold go to To Approve |
| Administrator | Purchase Manager | Can approve and configure |

## 6. Configuration and settings

Go to **Purchase ▸ Configuration ▸ Settings**. Odoo 17 labels (verify in your training instance):

| Section | Setting | Effect | Northwind decision |
|---|---|---|---|
| Orders | Purchase Order Approval (Order Approval) | Two-step validation above a minimum amount | On, INR 5,00,000 |
| Orders | Lock Confirmed Orders | Confirmed POs become locked | On |
| Orders | Warnings | Warning messages on vendors/products | On |
| Orders | Purchase Agreements | Blanket orders and calls for tender | On |
| Invoicing | Bill Control (default) | Ordered quantities / Received quantities for new products | Received quantities |
| Invoicing | 3-way matching | Adds a "Should Be Paid" control on bills | On (Enterprise — verify) |
| Products | Variants | Product attributes | On |
| Products | Units of Measure | Purchase UoM different from sales UoM | On |
| Logistics | Dropshipping | Vendor ships directly to customer | Off for now |

### Step-by-step: Order Approval

1. In Purchase settings tick **Purchase Order Approval**.
2. Set **Minimum Amount** = 5,00,000 (company currency).
3. Save.
4. Result: when a buyer (Purchase User) confirms an RFQ above the amount, the status becomes **To Approve**. A Purchase Administrator opens it and clicks **Approve Order**. Orders confirmed by an administrator are approved directly.

> **Consultant tip:** This is a single threshold for the company. Multi-level approval (e.g. INR 5 lakh → manager, INR 25 lakh → CFO) is **not** standard; it requires Studio approval rules (Enterprise) or a custom module.

### Step-by-step: Bill control

1. Set the default **Bill Control** to **Received quantities**.
2. Remember: this default applies to new products. On each existing product check **Purchase tab ▸ Control Policy** (verify label).

| Control policy | Billable quantity | Typical use |
|---|---|---|
| On ordered quantities | Ordered qty | Services, subscriptions, prepayment vendors |
| On received quantities | Received qty | Physical goods |

### Step-by-step: Purchase Agreements

1. Tick **Purchase Agreements** and save.
2. A menu **Purchase ▸ Orders ▸ Purchase Agreements** appears (verify in your instance).
3. Agreement types in 17: **Blanket Order** and **Call for Tenders**. In 18.0 agreement types were revised (e.g. blanket order and purchase template, with RFQ alternatives for tendering) — verify in your training instance.

### Inventory-side configuration used by Purchase

- **Inventory ▸ Configuration ▸ Settings**: Multi-Step Routes (if receipts need quality/storage steps), Storage Locations.
- **Routes**: the **Buy** route is available on products once Purchase is installed. The **Replenish on Order (MTO)** route is archived by default in recent versions; unarchive it under **Inventory ▸ Configuration ▸ Routes** (developer mode / archived filter — verify).

## Key takeaways

- Collect approval matrix, billing policy and replenishment policy before configuring.
- Order Approval = one threshold, two steps; multi-level needs Studio/customization.
- Bill control is product-level; the setting is the default for new products.
- Purchase agreements and 3-way matching are settings; check edition availability.`,
          resources: [
            { title: "Odoo 17 Purchase documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/purchase.html" },
            { title: "Vendor import template", kind: "template", url: "/api/templates/vendors" },
          ],
        },
      ],
    },
    {
      title: "Module 3: Working in Purchase",
      lessons: [
        {
          slug: "master-data-and-transactions",
          title: "Master data & transactions",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 7. Master data

| Master data | Key fields | Northwind example | Template |
|---|---|---|---|
| Vendors | Name, address, tax ID, bank account, vendor payment terms, purchase currency | Sunrise Paper Mills | /api/templates/vendors |
| Products | Type, purchase UoM, cost, vendor taxes, control policy, routes | A4 Paper 75 GSM | /api/templates/products |
| Product categories | Costing method, valuation, stock accounts | Paper — AVCO, automated | /api/templates/product-categories |
| Vendor pricelists | Vendor, price, min qty, delivery lead time, validity | Sunrise: INR 210/ream, min 500, 7 days | — |
| Reordering rules | Product, location, min, max, multiple | A4 Paper: min 1,000 / max 4,000 | — |
| Purchase agreements | Vendor, products, agreed prices, period | Blanket order with PrintTech for 2024 | — |

### Vendor pricelist on the product

1. Open **Purchase ▸ Products ▸ Products ▸ A4 Paper 75 GSM**.
2. Go to the **Purchase** tab.
3. Add lines:

| Vendor | Quantity (min) | Price | Delivery Lead Time |
|---|---|---|---|
| Sunrise Paper Mills | 500 | 210.00 | 7 days |
| Sunrise Paper Mills | 2,000 | 198.00 | 7 days |
| Metro Paper Traders | 1 | 225.00 | 2 days |

Odoo picks the price matching vendor, quantity and validity on the RFQ line. Replenishment uses the first applicable vendor line (sequence matters).

> **Consultant tip:** Product type matters. In 17 use **Storable Product** for stock-tracked items. In 18 use **Goods** with **Track Inventory** ticked. Reordering rules and stock valuation need stock-tracked products.

## 8. Transactions — step-by-step walkthroughs

### Walkthrough A — Create an RFQ and confirm it

1. Go to **Purchase ▸ Orders ▸ Requests for Quotation** and click **New**.
2. **Vendor**: Sunrise Paper Mills. Vendor payment terms and currency fill in.
3. Add product A4 Paper 75 GSM, quantity 2,000. Unit price 198.00 comes from the vendor pricelist.
4. Click **Send by Email** → status **RFQ Sent**.
5. Vendor confirms; click **Confirm Order**.
6. Amount = 3,96,000 (< 5,00,000) → status **Purchase Order** directly. A **Receipt** smart button appears.

### Walkthrough B — PO requiring approval

1. Buyer creates an RFQ to ErgoSeat Furniture: 50 executive chairs × 12,500 = 6,25,000.
2. Buyer clicks **Confirm Order** → status **To Approve**.
3. Purchase Manager opens the order (filter *To Approve*) and clicks **Approve Order** → status **Purchase Order**.

### Walkthrough C — Receive goods (partial)

1. Click the **Receipt** smart button (or Inventory ▸ Operations ▸ Receipts).
2. Sunrise delivers 1,500 of 2,000 reams. Enter 1,500 as the received quantity.
3. Click **Validate**. Odoo asks whether to create a **backorder** for 500 — choose *Create Backorder* (or *No Backorder* if the vendor will not deliver the rest).
4. On the PO line, **Received** shows 1,500.

### Walkthrough D — Vendor bill with bill control

| Control policy | Ordered | Received | Billable now |
|---|---|---|---|
| Ordered quantities | 2,000 | 1,500 | 2,000 |
| Received quantities | 2,000 | 1,500 | 1,500 |

1. On the PO click **Create Bill**.
2. A draft bill is created for the billable quantity (1,500 at INR 198).
3. Enter the vendor's **Bill Reference** and **Bill Date**; check taxes.
4. Click **Confirm** to post.
5. Alternatively create the bill from Accounting and use the **Auto-Complete** field to select the PO (verify label in your instance).

### Walkthrough E — 3-way matching

With 3-way matching enabled, the vendor bill has a **Should Be Paid** status (verify field label) that compares billed vs received quantities. Accountants filter on bills that should be paid before running payments. If billed quantity > received quantity, the bill is flagged and payment is held.

### Walkthrough F — Replenishment

1. **Reordering rule**: Inventory ▸ Operations ▸ Replenishment ▸ New: product A4 Paper, location WH/Stock, min 1,000, max 4,000, route Buy.
2. When forecast stock drops below 1,000, the scheduler (or **Order Once** / **Order** buttons in Replenishment) creates an RFQ to the first vendor for the quantity needed to reach 4,000.
3. **MTO**: on Executive Chair, tick routes **Buy** and **Replenish on Order (MTO)**. Confirming a sales order for 20 chairs creates an RFQ to ErgoSeat for 20 chairs, linked to the sales order.

### Walkthrough G — Blanket order

1. Purchase ▸ Orders ▸ Purchase Agreements ▸ New, type **Blanket Order**, vendor PrintTech, lines: Toner XL at INR 2,950, quantity 1,000 for the year.
2. Confirm the agreement. New RFQs to PrintTech created from the agreement use the agreed price; consumed quantities are tracked on the agreement (verify the exact behaviour in your version).

## Key takeaways

- Vendor pricelists on the product drive RFQ prices and replenishment vendor choice.
- Order Approval inserts a To Approve state for large orders confirmed by users.
- Receipts update received quantities; bill control decides what can be billed.
- Reordering rules and MTO automate RFQ creation.`,
          resources: [
            { title: "Vendor import template", kind: "template", url: "/api/templates/vendors" },
            { title: "Product import template", kind: "template", url: "/api/templates/products" },
            { title: "Product categories template", kind: "template", url: "/api/templates/product-categories" },
          ],
        },
        {
          slug: "automation-reports-impact",
          title: "Automation, reports & impact",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise", "customization"],
          body: `## 9. Approval rules and automation

| Need | Solution | Scope |
|---|---|---|
| Manager approval above an amount | Purchase Order Approval setting + minimum amount | Configuration |
| Prevent edits to confirmed POs | Lock Confirmed Orders | Configuration |
| Automatic RFQs on low stock | Reordering rules + Buy route (scheduler) | Configuration |
| RFQ per sales order | MTO + Buy routes | Configuration |
| Agreed prices for a period | Blanket orders | Configuration |
| Pay only received goods | Bill control = received quantities; 3-way matching | Configuration / Enterprise (3-way — verify) |
| Vendor warnings ("pay advance only") | Warnings setting on vendor/product | Configuration |
| Multi-level approvals (manager → CFO) | Studio approval rules | Enterprise |
| Employee purchase requests before RFQ | Approvals app (Purchase request category) | Enterprise |
| Budget check before PO confirmation | Custom module or Budget app with customization | Customization |
| Auto-send PO reminder to vendor | Receipt reminder option on vendor/PO (verify in your instance) | Configuration |

> **Consultant tip:** Write the approval matrix in a table during discovery. If it has more than one threshold or depends on product category or department, flag it as Studio/customization early — it affects licence (Enterprise) and budget.

## 10. Reports and dashboards

| Report | Menu | Use |
|---|---|---|
| Purchase Analysis | Purchase ▸ Reporting ▸ Purchase | Spend by vendor, product, category, buyer, period; ordered vs received vs billed quantities |
| RFQ dashboard | Purchase ▸ Orders ▸ Requests for Quotation (dashboard header) | RFQs to send, waiting, late; average order value; lead times (verify) |
| Replenishment report | Inventory ▸ Operations ▸ Replenishment | Products below minimum |
| Vendor bills | Accounting ▸ Vendors ▸ Bills | Bills, due dates, payment status |
| Aged Payable | Accounting ▸ Reporting | Outstanding vendor balances (Accounting app) |

Useful pivots for Northwind:

- Untaxed Total by **Vendor × Month**
- **Qty Ordered vs Qty Received vs Qty Billed** by product — identifies unbilled receipts and bills without receipts
- Average **days to receive** by vendor (vendor performance; verify available measures)

## 11. Accounting and inventory impact

Assume Paper category: AVCO, **automated** (perpetual) valuation. Purchase of 1,500 reams at INR 198 + GST 12%.

| Event | Inventory impact | Accounting impact |
|---|---|---|
| RFQ / PO confirmation | Incoming receipt created (forecast increases) | None |
| Receipt validated | On-hand +1,500; AVCO cost updated | Dr Stock Valuation 2,97,000 / Cr Stock Interim (Received) 2,97,000 |
| Vendor bill posted | None | Dr Stock Interim (Received) 2,97,000; Dr Input GST 35,640 / Cr Accounts Payable 3,32,640 |
| Price difference on bill | None | Difference posted to price-difference/stock accounts depending on costing method and version (verify) |
| Payment | None | Dr Accounts Payable / Cr Bank (or Outstanding Payments) |

With **manual (periodic)** valuation, the receipt creates no journal entry and the bill debits the expense/purchase account of the product category.

> **Consultant tip:** An open balance on the Stock Interim (Received) account means goods received but not billed (or billed but not received). Reviewing it at month-end is a classic consultant check for finance.

## 12. Integration with other apps

| App | Integration |
|---|---|
| Inventory | Receipts, backorders, reordering rules, routes, valuation |
| Accounting | Vendor bills, payment terms, taxes, 3-way matching, payments |
| Sales | MTO and dropshipping start purchases from sales orders |
| Manufacturing | Components replenished via Buy; subcontracting (setting in Manufacturing) |
| Quality (Enterprise) | Quality checks on receipts |
| Approvals (Enterprise) | Purchase requests converted to RFQs |
| Documents (Enterprise) | Digitised vendor bills |

## Key takeaways

- Standard approval = single threshold; complex matrices = Studio/customization.
- Purchase Analysis compares ordered, received and billed quantities.
- Receipt hits stock (and valuation with perpetual); the bill hits payables and taxes.
- Stock interim accounts are the bridge between receipts and bills.`,
          resources: [
            { title: "Odoo 17 Purchase documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/purchase.html" },
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
          body: `## 13. Common errors and troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| PO stuck in "To Approve" | Order Approval enabled; buyer lacks Purchase Administrator rights | Manager clicks Approve Order; review threshold |
| "There is no invoiceable line" on Create Bill | Control policy = received quantities and nothing received | Validate the receipt, or change policy for services |
| Unit price 0 or wrong on RFQ | No vendor pricelist line for vendor/qty/date, or UoM mismatch | Add supplierinfo line; check min qty, validity and purchase UoM |
| Reordering rule creates no RFQ | No vendor on product, Buy route missing, product not stock-tracked, scheduler not run | Add vendor line and Buy route; run Order / Order Once; check product type |
| MTO not creating RFQ | MTO route archived or not on product; vendor missing | Unarchive MTO route; tick Buy + MTO; add vendor |
| No receipt after confirmation | Product is Service/Consumable without stock tracking, or Inventory not installed | Check product type (17 Storable / 18 Goods + Track Inventory) |
| Cannot modify confirmed PO | Lock Confirmed Orders | Unlock (manager) |
| Bill quantity > received | Manual edit of the bill | 3-way matching flags it; correct the bill or wait for receipt |
| Stock Interim (Received) not zero | Receipts not billed or bills without receipts | Review Purchase Analysis qty received vs billed |
| Duplicate vendor bills | Same bill reference entered twice | Odoo warns on duplicate reference (verify); train AP team |

> **Consultant tip:** For replenishment issues, open the product's **Forecasted** report and the Replenishment menu first. They show demand, incoming and the rule that should fire.

## 14. Practical assignments

### Practice 1 — Configuration
- [ ] Enable Order Approval (INR 5,00,000), Lock Confirmed Orders, Purchase Agreements, Units of Measure
- [ ] Set default bill control to Received quantities
- [ ] Unarchive the MTO route

### Practice 2 — Master data
- [ ] Import 5 vendors with payment terms using the vendors template
- [ ] Add tiered vendor prices for A4 paper (two vendors, two quantity breaks)
- [ ] Create reordering rules for three fast-moving products

### Practice 3 — Transactions
- [ ] Create an RFQ under the threshold and confirm it
- [ ] Create one above the threshold as a buyer; approve it as manager
- [ ] Receive partially, create a backorder, bill the received quantity
- [ ] Trigger replenishment with Order Once and confirm the generated RFQ
- [ ] Sell 20 chairs with MTO and confirm the linked RFQ
- [ ] Build a pivot of Qty Ordered / Received / Billed by vendor

## 15. Interview questions with model answers

**Q1. Explain the Order Approval setting.**
It adds a two-step validation: POs above the minimum amount confirmed by users without Purchase Administrator rights go to To Approve; an administrator must click Approve Order. It supports one threshold per company. Multi-level approval needs Studio (Enterprise) or customization.

**Q2. Ordered vs received quantities for bills?**
Ordered allows billing the full PO immediately (services, prepayments). Received allows billing only received quantities, protecting against paying for undelivered goods. It is set per product with a default in settings.

**Q3. What is 3-way matching?**
Comparing the PO, the receipt and the vendor bill. In Odoo the setting adds a should-be-paid status on bills so AP pays only what was ordered and received.

**Q4. How does Odoo pick the vendor and price on an automatic RFQ?**
From the product's vendor pricelist (supplierinfo): the applicable line considering sequence, minimum quantity, validity and company. The price and lead time come from that line.

**Q5. Reordering rule vs MTO?**
A reordering rule replenishes stock to a min/max level regardless of specific customer orders. MTO creates a purchase for a specific sales demand, bypassing stock levels.

**Q6. What entries are posted on receipt and on bill with perpetual valuation?**
Receipt: Dr Stock Valuation / Cr Stock Interim (Received). Bill: Dr Stock Interim (Received) + Dr Input tax / Cr Accounts Payable.

**Q7. What is a blanket order?**
A purchase agreement fixing prices (and optionally quantities) with a vendor for a period. POs are released against it, and consumption is tracked. Agreement types were revised in 18.0 — verify in the instance.

## Key takeaways

- Most purchase issues come from vendor pricelists, product type, routes or control policy.
- Practise approval, partial receipt + billing and replenishment end to end.
- Be explicit in interviews about standard settings vs Enterprise vs customization.`,
          resources: [
            { title: "Odoo 17 Purchase documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/purchase.html" },
            { title: "Vendor import template", kind: "template", url: "/api/templates/vendors" },
          ],
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-purchase-final",
    title: "Odoo Purchase – Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "With Order Approval set at INR 5,00,000, a Purchase User confirms an RFQ of INR 6,25,000. What is the resulting status?",
        kind: "single",
        options: ["Purchase Order", "To Approve", "Cancelled", "RFQ Sent"],
        correct: [1],
        explanation: "Orders above the threshold confirmed by non-administrators go to To Approve until a manager approves.",
      },
      {
        prompt: "Where are vendor-specific prices and lead times stored?",
        kind: "single",
        options: ["On the vendor contact", "On the product's Purchase tab (vendor pricelist / supplierinfo)", "On the warehouse", "On the payment terms"],
        correct: [1],
        explanation: "Vendor prices are product.supplierinfo records maintained on the product's Purchase tab.",
      },
      {
        prompt: "The standard Order Approval setting supports multiple approval levels by amount.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "It supports one minimum amount (two-step approval). Multi-level approval requires Studio or customization.",
      },
      {
        prompt: "Control policy is 'Received quantities'. Ordered 2,000, received 1,500. How many can be billed?",
        kind: "single",
        options: ["2,000", "1,500", "500", "0"],
        correct: [1],
        explanation: "Only received quantities are billable under this policy.",
      },
      {
        prompt: "With automated (perpetual) valuation, which entry is posted when the receipt is validated?",
        kind: "single",
        options: ["Dr Stock Valuation / Cr Stock Interim (Received)", "Dr Expense / Cr Payable", "Dr Payable / Cr Bank", "No entry"],
        correct: [0],
        explanation: "Receiving goods debits stock valuation and credits the stock interim (received) account, cleared later by the bill.",
      },
      {
        prompt: "Which are required for a reordering rule to generate an RFQ automatically? (Select all that apply)",
        kind: "multiple",
        options: ["A vendor on the product", "The Buy route", "A stock-tracked product", "The Leads setting in CRM"],
        correct: [0, 1, 2],
        explanation: "Replenishment by purchase needs a vendor, the Buy route and a stock-tracked product. CRM settings are unrelated.",
      },
      {
        prompt: "What does the MTO route do when combined with Buy?",
        kind: "single",
        options: ["Creates an RFQ linked to the specific sales demand", "Blocks sales orders", "Creates a manufacturing order only", "Creates a vendor bill directly"],
        correct: [0],
        explanation: "MTO + Buy creates a purchase for the demand of a specific sales order, regardless of stock levels.",
      },
      {
        prompt: "The Approvals app and the Purchase Order Approval setting are the same feature.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Order Approval is a standard Purchase setting; Approvals is a separate Enterprise app for generic requests.",
      },
      {
        prompt: "What is 3-way matching?",
        kind: "single",
        options: ["Comparing PO, receipt and vendor bill before payment", "Matching three vendors' prices", "Matching bank, bill and payment", "Approving with three managers"],
        correct: [0],
        explanation: "3-way matching checks the order, the received goods and the bill to ensure only valid amounts are paid.",
      },
      {
        prompt: "Which agreement type fixes prices with one vendor for a period, with POs released against it?",
        kind: "single",
        options: ["Call for Tenders", "Blanket Order", "Pricelist", "Dropship"],
        correct: [1],
        explanation: "A blanket order sets agreed prices/quantities over a period; individual POs consume it.",
      },
      {
        prompt: "Which may explain why no receipt is created after confirming a PO? (Select all that apply)",
        kind: "multiple",
        options: ["Product is a Service", "Inventory app not installed", "Product is stock-tracked goods", "Product is a consumable/non-tracked item without Inventory"],
        correct: [0, 1, 3],
        explanation: "Receipts are created for goods when Inventory is installed. Services never create receipts; without Inventory no receipts exist.",
      },
      {
        prompt: "At month end the Stock Interim (Received) account has a balance. What does it usually indicate?",
        kind: "single",
        options: ["Bank not reconciled", "Goods received but not billed, or billed but not received", "Sales not invoiced", "Taxes misconfigured"],
        correct: [1],
        explanation: "The interim account bridges receipts and bills; a residual balance signals unmatched receipts or bills.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-purchase-assignment-1",
      title: "Configure procure-to-pay controls for Northwind",
      instructions: `## Scenario

Northwind wants manager approval above INR 5,00,000, payment only for received goods, automatic replenishment of paper and toner, and MTO for executive chairs.

## Tasks

1. Configure Purchase settings (Order Approval, Lock Confirmed Orders, Purchase Agreements, bill control).
2. Import vendors and add tiered vendor prices for three products.
3. Create reordering rules for paper and toner; set Buy + MTO routes on chairs.
4. Create a blanket order with PrintTech for toner.

## Deliverables

- Configuration workbook with an approval matrix and a statement of what is standard vs Enterprise vs customization.
- Screenshots of vendor pricelists, reordering rules and the blanket order.
- Import files used.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Correct settings and approval behaviour | 30% |
| Vendor pricelists and replenishment configured correctly | 30% |
| Clear fit-gap labelling (standard / Enterprise / customization) | 20% |
| Documentation quality | 20% |`,
    },
    {
      slug: "odoo-purchase-assignment-2",
      title: "Procure-to-pay end to end with accounting reconciliation",
      instructions: `## Scenario

Execute a full P2P cycle for Northwind and prove the accounting is correct.

## Tasks

1. Buyer creates a PO above the threshold; manager approves.
2. Receive 75% of the quantity, create a backorder, bill the received quantity.
3. Receive the remaining quantity and bill it; register payment.
4. Trigger an automatic RFQ via a reordering rule and an MTO RFQ via a sales order.
5. Extract journal items for the receipt(s) and bill(s) and show the Stock Interim (Received) account returns to zero.

## Deliverables

- Step log with all document numbers.
- Journal entry table per event (account, debit, credit).
- Purchase Analysis pivot (Qty Ordered / Received / Billed by vendor).

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Correct document flow and statuses | 30% |
| Accurate journal entries and interim reconciliation | 35% |
| Replenishment and MTO executed | 20% |
| Clarity of documentation | 15% |`,
    },
  ],
};
