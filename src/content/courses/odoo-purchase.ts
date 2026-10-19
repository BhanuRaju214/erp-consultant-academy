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

\`\`\`visual-cards
{
  "label": "Key concepts",
  "title": "Purchase building blocks",
  "columns": 3,
  "cards": [
    { "icon": "file", "title": "RFQ / PO", "body": "One purchase.order record: RFQ while draft, Purchase Order once confirmed. Same reference." },
    { "icon": "tag", "title": "Vendor pricelist", "body": "product.supplierinfo on the product's Purchase tab: price, minimum quantity, lead time, validity." },
    { "icon": "shield", "title": "Order Approval", "body": "POs above INR 5,00,000 wait in To Approve for a Purchase Administrator.", "tone": "warning" },
    { "icon": "refresh", "title": "Reordering rule", "body": "Min/max rule that creates RFQs when forecast stock drops below the minimum." },
    { "icon": "receipt", "title": "Bill control", "body": "Bill ordered or received quantities. Northwind pays only for what was received." },
    { "icon": "scale", "title": "3-way matching", "body": "PO, receipt and vendor bill must agree before AP pays.", "tone": "info" }
  ]
}
\`\`\`

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

\`\`\`visual-beforeafter
{
  "title": "Northwind purchasing: before and after Odoo",
  "before": {
    "title": "Emails and phone orders",
    "points": [
      "Buyers order at whatever price the vendor quotes",
      "Large furniture orders placed without manager sign-off",
      "Paper runs out because nobody watches stock levels",
      "Vendors are paid for full orders that arrived short",
      "No view of spend per vendor"
    ]
  },
  "after": {
    "title": "Procure-to-Pay in Odoo",
    "points": [
      "Vendor pricelists propose the negotiated price on every RFQ",
      "Orders above INR 5,00,000 wait for Purchase Manager approval",
      "Reordering rules create RFQs before paper runs out",
      "Bills controlled on received quantities with 3-way matching",
      "Purchase Analysis shows spend and vendor performance"
    ]
  }
}
\`\`\`

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

\`\`\`visual-hub
{
  "title": "Purchase and its integrations",
  "center": { "label": "Purchase (purchase.order)", "icon": "cart" },
  "nodes": [
    { "label": "Contacts", "icon": "users", "detail": "Vendors such as Sunrise Paper Mills and PrintTech Distributors." },
    { "label": "Product", "icon": "box", "detail": "Products, vendor pricelists and units of measure." },
    { "label": "Inventory", "icon": "warehouse", "detail": "Receipts, reordering rules and routes (Buy, MTO, Dropship)." },
    { "label": "Accounting", "icon": "receipt", "detail": "Vendor bills, payment terms, taxes and payments." },
    { "label": "Sales", "icon": "file", "detail": "MTO and dropship flows start from sales orders." },
    { "label": "Manufacturing", "icon": "factory", "detail": "Components bought for manufacturing orders." }
  ]
}
\`\`\`

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

\`\`\`visual-order
{
  "title": "Procure-to-Pay order",
  "prompt": "Put Northwind's purchase steps in the order they happen.",
  "items": [
    "Reordering rule detects A4 paper below minimum",
    "RFQ created and sent to Sunrise Paper Mills",
    "Buyer confirms the RFQ as a purchase order",
    "Warehouse validates the receipt",
    "AP creates the vendor bill for received quantities",
    "AP pays the vendor"
  ],
  "explanation": "With bill control on received quantities, the bill can only be created for what the receipt validated, so the receipt comes before the bill."
}
\`\`\`

\`\`\`visual-check
{
  "question": "Northwind's buyer confirms a PO for INR 7,00,000 and it shows To Approve. Why?",
  "options": [
    "The vendor has no pricelist",
    "Order Approval is on and the amount is above the INR 5,00,000 threshold for a user without Purchase Administrator rights",
    "The Approvals app is installed",
    "The product is not storable"
  ],
  "correct": 1,
  "explanation": "The standard Order Approval setting sends POs above the minimum amount to To Approve when the user is not a Purchase Administrator. It is separate from the Enterprise Approvals app."
}
\`\`\`

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

#### In Odoo 20: Vendor price list and bill control

\`\`\`visual-screen
{
  "src": "/visuals/odoo-purchase/screens/pur-product-vendors.webp",
  "alt": "Odoo 20 product Purchase tab with the vendor price list and the control policy.",
  "title": "Vendor price list and bill control",
  "path": "Product ▸ Purchase tab",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "callouts": [
    {
      "x": 31.9,
      "y": 43.2,
      "w": 58.7,
      "h": 21.8,
      "tag": "top",
      "title": "Vendors",
      "text": "Vendor, minimum quantity, price and lead time: RFQs and replenishment use the first matching line."
    },
    {
      "x": 20.9,
      "y": 65.3,
      "w": 20.1,
      "h": 7.5,
      "tag": "right",
      "title": "Control Policy",
      "text": "Received quantities: you can only bill what arrived."
    }
  ],
  "caption": "Real screen from an Odoo 20 training database with fictional Northwind data; amounts in ₹ with Indian GST."
}
\`\`\`

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

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Add a vendor price list to a product",
  "intro": "PrintTech Supplies quoted ₹52 per toner cartridge for orders of 10 or more. Record it on the product so RFQs use it automatically.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "Toner now has a vendor line for PrintTech: RFQs and replenishment pick this vendor and price automatically for 10 or more cartridges.",
  "steps": [
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-01.webp",
      "alt": "Product form for Toner Cartridge HP 26A with the Purchase tab.",
      "path": "Inventory ▸ Products ▸ Toner Cartridge HP 26A",
      "task": "Vendor prices live on the **Purchase** tab. Open it.",
      "target": {
        "x": 17.95,
        "y": 26.25,
        "w": 6.7,
        "h": 4.8,
        "label": "Purchase"
      },
      "explain": "The Purchase tab lists vendors, their prices, minimum quantities and lead times."
    },
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-02.webp",
      "alt": "Purchase tab of the toner product with the vendor list and Add a line.",
      "path": "Product ▸ Purchase",
      "task": "**Add a vendor line.**",
      "target": {
        "x": 3.25,
        "y": 40.35,
        "w": 5,
        "h": 3.1,
        "label": "Add a line"
      },
      "explain": "A new vendor line opens."
    },
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-03.webp",
      "alt": "Vendor dropdown on the new line showing PrintTech Supplies.",
      "path": "Product ▸ Purchase ▸ Vendor",
      "task": "**Pick the vendor** PrintTech Supplies.",
      "target": {
        "x": 3.65,
        "y": 43.25,
        "w": 21.8,
        "h": 3.5,
        "label": "PrintTech Supplies"
      },
      "explain": "The vendor is set; now its conditions."
    },
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-04.webp",
      "alt": "Vendor line for PrintTech with the minimum quantity column.",
      "path": "Product ▸ Purchase",
      "task": "The price applies from **10** cartridges. Set the minimum quantity.",
      "target": {
        "x": 25.65,
        "y": 39.45,
        "w": 7.6,
        "h": 5,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Minimum quantity",
        "answer": "10",
        "placeholder": "units"
      },
      "explain": "Below 10 cartridges Odoo will look for another vendor line (or this one without a break)."
    },
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-05.webp",
      "alt": "Vendor line for PrintTech with the price column.",
      "path": "Product ▸ Purchase",
      "task": "The quoted price is **52**. Enter it.",
      "target": {
        "x": 45.95,
        "y": 39.45,
        "w": 8.5,
        "h": 5,
        "label": "the Price cell"
      },
      "input": {
        "label": "Unit price",
        "answer": "52",
        "placeholder": "₹"
      },
      "explain": "RFQs to PrintTech for 10 or more cartridges will propose ₹52."
    },
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-06.webp",
      "alt": "Product form with the new vendor line and the save button.",
      "path": "Product ▸ Purchase",
      "task": "**Save the product.**",
      "target": {
        "x": 25.15,
        "y": 6.55,
        "w": 2.4,
        "h": 3.9,
        "label": "Save"
      },
      "hint": "The cloud icon next to the breadcrumb saves the record.",
      "explain": "Saved: the vendor price list is live."
    },
    {
      "src": "/visuals/odoo-purchase/sims/cfg-pur-vendor-price-07.webp",
      "alt": "Saved toner product with PrintTech Supplies in the vendor list.",
      "path": "Product ▸ Purchase",
      "task": "The vendor line is saved.",
      "explain": "Order of the lines matters: Odoo uses the first matching line, so put the preferred vendor on top."
    }
  ]
}
\`\`\`

## 8. Transactions — step-by-step walkthroughs

### Walkthrough A — Create an RFQ and confirm it

1. Go to **Purchase ▸ Orders ▸ Requests for Quotation** and click **New**.
2. **Vendor**: Sunrise Paper Mills. Vendor payment terms and currency fill in.
3. Add product A4 Paper 75 GSM, quantity 2,000. Unit price 198.00 comes from the vendor pricelist.
4. Click **Send by Email** → status **RFQ Sent**.
5. Vendor confirms; click **Confirm Order**.
6. Amount = 3,96,000 (< 5,00,000) → status **Purchase Order** directly. A **Receipt** smart button appears.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Create an RFQ and confirm the purchase order",
  "intro": "You are Northwind's buyer. Paper stock is low: order 2,000 reams of A4 paper from Paper Mills Inc.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "**P00006** is a confirmed purchase order for 2,000 reams. Odoo created the receipt for Northwind Main automatically.",
  "steps": [
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-01.webp",
      "alt": "Purchase Requests for Quotation list view with the New button.",
      "path": "Purchase ▸ Orders ▸ Requests for Quotation",
      "task": "Start a new request for quotation.",
      "target": {
        "x": 0.8500000000000001,
        "y": 5.95,
        "w": 4,
        "h": 4.2,
        "label": "New"
      },
      "explain": "An empty RFQ opens. Nothing is sent or committed until you confirm."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-02.webp",
      "alt": "New RFQ with the Vendor field showing Paper Mills Inc in the dropdown.",
      "path": "Purchase ▸ RFQ ▸ Vendor",
      "task": "Typing **Paper Mills** shows matching vendors. **Pick Paper Mills Inc.**",
      "target": {
        "x": 13.05,
        "y": 30.95,
        "w": 17.7,
        "h": 3.5,
        "label": "Paper Mills Inc"
      },
      "hint": "Choose the existing vendor; *Create* would make a duplicate.",
      "traps": [
        {
          "x": 13.05,
          "y": 36.95,
          "w": 17.7,
          "h": 3.5,
          "feedback": "That would create a **new** vendor. Paper Mills Inc already exists: duplicates split the purchase history."
        }
      ],
      "explain": "The vendor's payment terms and currency fill in from the partner record."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-03.webp",
      "alt": "RFQ with vendor Paper Mills Inc and the Add a product link.",
      "path": "Purchase ▸ RFQ ▸ Products",
      "task": "**Add a product line.**",
      "target": {
        "x": 4.65,
        "y": 57.45,
        "w": 6.8,
        "h": 3.1,
        "label": "Add a product"
      },
      "explain": "A new line opens with the product field ready."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-04.webp",
      "alt": "Product dropdown on the RFQ line showing A4 Copy Paper 80gsm (Ream).",
      "path": "Purchase ▸ RFQ ▸ Products",
      "task": "Typing **A4 Copy** finds the product. **Select A4 Copy Paper 80gsm.**",
      "target": {
        "x": 4.95,
        "y": 60.45,
        "w": 24.8,
        "h": 3.5,
        "label": "A4 Copy Paper 80gsm (Ream)"
      },
      "explain": "The unit price comes from the vendor price list on the product (₹4.00 from Paper Mills)."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-05.webp",
      "alt": "RFQ line for A4 Copy Paper with quantity 1 and unit price 4.00.",
      "path": "Purchase ▸ RFQ ▸ Products",
      "task": "Order **2,000 reams**. Set the quantity.",
      "target": {
        "x": 12.55,
        "y": 56.55,
        "w": 7.6,
        "h": 9.4,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Quantity",
        "answer": "2000",
        "placeholder": "reams"
      },
      "traps": [
        {
          "x": 36.15,
          "y": 56.55,
          "w": 7.6,
          "h": 9.4,
          "feedback": "That is the **unit price**; it comes from the vendor price list. Change the quantity."
        }
      ],
      "explain": "2,000 × ₹4.00 = ₹8,000 before GST."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-06.webp",
      "alt": "Deliver To dropdown showing Northwind Main: Receipts.",
      "path": "Purchase ▸ RFQ ▸ Deliver To",
      "task": "The paper must arrive at the **Northwind Main** warehouse. **Pick its receipts operation.**",
      "target": {
        "x": 43.15,
        "y": 45.85,
        "w": 17.7,
        "h": 3.5,
        "label": "Northwind Main: Receipts"
      },
      "explain": "**Deliver To** decides which warehouse receives the goods, and so which receipt Odoo creates."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-07.webp",
      "alt": "Completed RFQ for 2,000 reams with the Send by Email and Confirm Order buttons.",
      "path": "Purchase ▸ RFQ",
      "task": "Paper Mills confirmed the price by phone. **Turn the RFQ into a purchase order.**",
      "target": {
        "x": 6.95,
        "y": 11.75,
        "w": 8.4,
        "h": 4.2,
        "label": "Confirm Order"
      },
      "traps": [
        {
          "x": 0.8500000000000001,
          "y": 11.75,
          "w": 6.3,
          "h": 4.2,
          "feedback": "**Send by Email** sends the RFQ to the vendor but does not confirm it. The vendor already agreed: confirm the order."
        }
      ],
      "explain": "The RFQ becomes a **Purchase Order** and Odoo creates the receipt for Northwind Main."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-rfq-08.webp",
      "alt": "Confirmed purchase order with the Receive button and a Receipt smart button.",
      "path": "Purchase ▸ Orders",
      "task": "P00006 is confirmed.",
      "explain": "Status **Purchase Order**. The **Receipt** smart button links to the incoming shipment."
    }
  ]
}
\`\`\`

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

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Receive part of the order and bill what arrived",
  "intro": "The paper is billed on **received quantities**. Paper Mills delivers 1,500 of the 2,000 reams.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "Received 1,500, billed 1,500, and **NW/IN/00010** still expects 500. With *received quantities* control you never pay for paper that has not arrived.",
  "steps": [
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-01.webp",
      "alt": "Confirmed purchase order for 2,000 reams with the Receive button.",
      "path": "Purchase ▸ Orders",
      "task": "The truck from Paper Mills has arrived for **P00006**. **Open the receipt.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 5.4,
        "h": 4.2,
        "label": "Receive"
      },
      "also": [
        {
          "x": 54.85,
          "y": 6.05,
          "w": 7.8,
          "h": 4.2
        }
      ],
      "explain": "The receipt for Northwind Main opens with a demand of 2,000."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-02.webp",
      "alt": "Receipt for 2,000 reams of A4 paper in Ready state.",
      "path": "Inventory ▸ Receipts",
      "task": "Only **1,500 reams** were delivered. Record what arrived.",
      "target": {
        "x": 38.95,
        "y": 48.55,
        "w": 7.6,
        "h": 5,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Quantity received",
        "answer": "1500",
        "placeholder": "reams"
      },
      "traps": [
        {
          "x": 0.8500000000000001,
          "y": 11.85,
          "w": 5.6,
          "h": 4.2,
          "feedback": "Validating now would receive **2,000**. Count the delivery first."
        }
      ],
      "explain": "Quantity 1,500 against a demand of 2,000."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-03.webp",
      "alt": "Receipt line with demand 2,000 and quantity 1,500.",
      "path": "Inventory ▸ Receipts",
      "task": "**Confirm the receipt.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.85,
        "w": 5.6,
        "h": 4.2,
        "label": "Validate"
      },
      "explain": "Odoo sees that 500 are missing and asks what to do with them."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-04.webp",
      "alt": "Create Backorder dialog.",
      "path": "Validate ▸ Create Backorder?",
      "task": "Paper Mills will ship the other **500 next week**. What do you choose?",
      "target": {
        "x": 16.85,
        "y": 58.05,
        "w": 9.6,
        "h": 4.2,
        "label": "Create Backorder"
      },
      "traps": [
        {
          "x": 26.45,
          "y": 58.05,
          "w": 8.1,
          "h": 4.2,
          "feedback": "**No Backorder** cancels the remaining 500. Use it only when the vendor will not deliver them."
        }
      ],
      "explain": "1,500 reams enter NW/Stock; a backorder receipt waits for the other 500."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-05.webp",
      "alt": "Receipt in Done state with a breadcrumb back to the purchase order.",
      "path": "Inventory ▸ Receipts",
      "task": "Receipt done. **Go back to P00006** using the breadcrumb.",
      "target": {
        "x": 7.45,
        "y": 5.75,
        "w": 3.4,
        "h": 2.4,
        "label": "the purchase order breadcrumb"
      },
      "hint": "Breadcrumbs at the top left take you back to where you came from.",
      "explain": "Back on the purchase order: **Received** now shows 1,500."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-06.webp",
      "alt": "Purchase order line showing quantity 2,000, received 1,500 and billed 0, with the Upload Bill button.",
      "path": "Purchase ▸ Orders",
      "task": "The order shows **Received 1,500** and **Billed 0**. Now the vendor's invoice arrives.",
      "explain": "In Odoo 20 there is no *Create Bill* button on the order: you either **Upload Bill** (the vendor's PDF, read by OCR) or create the bill in Accounting and link the order. Next you do the second."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-07.webp",
      "alt": "Vendor bills list with the New button.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "In Accounting, **start a new vendor bill**.",
      "target": {
        "x": 0.8500000000000001,
        "y": 5.95,
        "w": 4,
        "h": 4.2,
        "label": "New"
      },
      "explain": "An empty draft bill opens."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-08.webp",
      "alt": "Vendor field on the draft bill with Paper Mills Inc in the dropdown.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "**Select the vendor** Paper Mills Inc.",
      "target": {
        "x": 12.05,
        "y": 31.75,
        "w": 28.7,
        "h": 3.5,
        "label": "Paper Mills Inc"
      },
      "explain": "With the vendor set, the **Auto-Complete** field can offer that vendor's open purchase orders."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-09.webp",
      "alt": "Auto-Complete dropdown on the draft bill offering the purchase order.",
      "path": "Accounting ▸ Vendors ▸ Bills ▸ Auto-Complete",
      "task": "Link the bill to the order: in **Auto-Complete**, pick **P00006**.",
      "target": {
        "x": 12.05,
        "y": 48.15,
        "w": 19.9,
        "h": 3.5,
        "label": "P00006"
      },
      "hint": "Auto-Complete copies the billable lines of a purchase order into the bill.",
      "explain": "Odoo copies the billable quantity: **1,500 reams** (received), not the 2,000 ordered."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-10.webp",
      "alt": "Draft vendor bill for 1,500 reams loaded from the purchase order.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "Enter the vendor's invoice number **PM-7781** as the bill reference.",
      "target": {
        "x": 11.65,
        "y": 32.55,
        "w": 19.3,
        "h": 3.2,
        "label": "Bill Reference"
      },
      "input": {
        "label": "Bill Reference",
        "answer": "PM-7781",
        "placeholder": "vendor invoice number"
      },
      "explain": "The reference lets Odoo warn you about duplicate bills from the same vendor."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-11.webp",
      "alt": "Bill Date calendar open on the draft vendor bill.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "Set the **Bill Date** to today, the date on the vendor's invoice.",
      "target": {
        "x": 44.75,
        "y": 58.35,
        "w": 2.9,
        "h": 4.4,
        "label": "today's date"
      },
      "explain": "The bill date drives the due date (from the payment terms) and the accounting period."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-12.webp",
      "alt": "Draft vendor bill with reference PM-7781 and bill date, ready to confirm.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "1,500 reams match the receipt. **Post the bill.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 5.6,
        "h": 4.2,
        "label": "Confirm"
      },
      "explain": "The bill is **Posted**: Northwind owes Paper Mills for 1,500 reams plus GST."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-receive-bill-13.webp",
      "alt": "Posted vendor bill for Paper Mills Inc.",
      "path": "Accounting ▸ Vendors ▸ Bills",
      "task": "The bill is posted. Notice the red banner.",
      "explain": "The red banner is Odoo duplicate-bill check: another bill from Paper Mills already uses reference **PM-7781**. In real life stop here and compare the two before paying anything. The order now shows **Billed 1,500**."
    }
  ]
}
\`\`\`

### Walkthrough E — 3-way matching

With 3-way matching enabled, the vendor bill has a **Should Be Paid** status (verify field label) that compares billed vs received quantities. Accountants filter on bills that should be paid before running payments. If billed quantity > received quantity, the bill is flagged and payment is held.

### Walkthrough F — Replenishment

1. **Reordering rule**: Inventory ▸ Operations ▸ Replenishment ▸ New: product A4 Paper, location WH/Stock, min 1,000, max 4,000, route Buy.
2. When forecast stock drops below 1,000, the scheduler (or **Order Once** / **Order** buttons in Replenishment) creates an RFQ to the first vendor for the quantity needed to reach 4,000.
3. **MTO**: on Executive Chair, tick routes **Buy** and **Replenish on Order (MTO)**. Confirming a sales order for 20 chairs creates an RFQ to ErgoSeat for 20 chairs, linked to the sales order.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Order from the replenishment report",
  "intro": "Toner has a reordering rule in NW/Stock: minimum 100, maximum 200. The forecast is below the minimum.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "Odoo created a request for quotation to the vendor on the product for the quantity needed to reach the maximum. Buyers review and confirm it like any RFQ.",
  "steps": [
    {
      "src": "/visuals/odoo-purchase/sims/inv-replenish-01.webp",
      "alt": "Replenishment report with the toner line and its Order button.",
      "path": "Inventory ▸ Operations ▸ Replenishment",
      "task": "Toner: on hand 67, below the minimum of 100; Odoo proposes **133** to reach the maximum of 200. **Order it.**",
      "target": {
        "x": 89.05,
        "y": 21.55,
        "w": 5.1,
        "h": 3.1,
        "label": "Order"
      },
      "traps": [
        {
          "x": 89.05,
          "y": 24.55,
          "w": 7,
          "h": 3.1,
          "feedback": "**Automate** switches the rule to automatic ordering for the future. Here you just want to order now."
        }
      ],
      "explain": "Odoo creates an RFQ for the To Order quantity."
    },
    {
      "src": "/visuals/odoo-purchase/sims/inv-replenish-02.webp",
      "alt": "Replenishment report after ordering toner.",
      "path": "Inventory ▸ Operations ▸ Replenishment",
      "task": "The forecast is now 200.",
      "explain": "Forecast 67 + 133 ordered = 200 (the maximum); To Order drops to 0. The RFQ to the toner vendor waits in Purchase for the buyer to confirm."
    }
  ]
}
\`\`\`

### Walkthrough G — Blanket order

1. Purchase ▸ Orders ▸ Purchase Agreements ▸ New, type **Blanket Order**, vendor PrintTech, lines: Toner XL at INR 2,950, quantity 1,000 for the year.
2. Confirm the agreement. New RFQs to PrintTech created from the agreement use the agreed price; consumed quantities are tracked on the agreement (verify the exact behaviour in your version).

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Agree a yearly price with a blanket order",
  "intro": "PrintTech agrees **₹50 per toner cartridge for 1,000 cartridges** this year. Record it once; every RFQ then uses that price.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "The blanket order is confirmed and an RFQ was created from it with the agreed ₹50. The agreement tracks how much of the 1,000 has been ordered.",
  "steps": [
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-01.webp",
      "alt": "Purchase agreements list with the New button.",
      "path": "Purchase ▸ Orders ▸ Purchase Agreements",
      "task": "**Create a purchase agreement.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 5.95,
        "w": 4,
        "h": 4.2,
        "label": "New"
      },
      "explain": "An empty agreement opens; the default type is a blanket order."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-02.webp",
      "alt": "Vendor dropdown showing PrintTech Supplies.",
      "path": "Purchase Agreement ▸ Vendor",
      "task": "**Pick the vendor** PrintTech Supplies.",
      "target": {
        "x": 11.35,
        "y": 30.95,
        "w": 19.3,
        "h": 3.5,
        "label": "PrintTech Supplies"
      },
      "explain": "The agreed prices apply to RFQs for this vendor."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-03.webp",
      "alt": "Agreement with the Add a product link.",
      "path": "Purchase Agreement ▸ Products",
      "task": "**Add the product line.**",
      "target": {
        "x": 3.25,
        "y": 50.85,
        "w": 6.8,
        "h": 3.1,
        "label": "Add a product"
      },
      "explain": "A line opens."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-04.webp",
      "alt": "Product dropdown showing Toner Cartridge HP 26A.",
      "path": "Purchase Agreement ▸ Products",
      "task": "**Pick Toner Cartridge HP 26A.**",
      "target": {
        "x": 3.65,
        "y": 53.85,
        "w": 21.5,
        "h": 3.5,
        "label": "Toner Cartridge HP 26A"
      },
      "explain": "Now the agreed quantity and price."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-05.webp",
      "alt": "Agreement line for toner with the quantity cell.",
      "path": "Purchase Agreement ▸ Products",
      "task": "The agreement covers **1000** cartridges.",
      "target": {
        "x": 21.15,
        "y": 49.95,
        "w": 7.6,
        "h": 7.1,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Quantity",
        "answer": "1000",
        "placeholder": "cartridges"
      },
      "explain": "Odoo tracks the ordered quantity against this."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-06.webp",
      "alt": "Agreement line with the unit price cell.",
      "path": "Purchase Agreement ▸ Products",
      "task": "The agreed price is **50**.",
      "target": {
        "x": 44.45,
        "y": 49.95,
        "w": 7.6,
        "h": 7.1,
        "label": "the Unit Price cell"
      },
      "input": {
        "label": "Unit price",
        "answer": "50",
        "placeholder": "₹"
      },
      "explain": "₹50 instead of the usual ₹52–55."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-07.webp",
      "alt": "Draft agreement with the Confirm button.",
      "path": "Purchase Agreement",
      "task": "**Confirm the agreement.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 5.6,
        "h": 4.2,
        "label": "Confirm"
      },
      "explain": "The blanket order is running."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-08.webp",
      "alt": "Confirmed agreement with the New Quotation button.",
      "path": "Purchase Agreement",
      "task": "Order the first 100 against it: **create an RFQ** from the agreement.",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 8.8,
        "h": 4.2,
        "label": "New Quotation"
      },
      "explain": "Odoo opens an RFQ for PrintTech with the agreed price, linked to the agreement."
    },
    {
      "src": "/visuals/odoo-purchase/sims/pur-blanket-09.webp",
      "alt": "RFQ created from the blanket order with toner at 50.",
      "path": "Purchase ▸ RFQ",
      "task": "The RFQ uses the agreed price.",
      "explain": "Set the quantity and confirm as usual; the agreement Ordered column goes up. Tip: set Deliver To to your warehouse (here it defaulted to the main company warehouse)."
    }
  ]
}
\`\`\`

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

\`\`\`visual-flow
{
  "title": "Automatic replenishment: low stock to vendor receipt",
  "caption": "Reordering rules + Buy route, with the Purchase Order Approval threshold switched on.",
  "steps": [
    { "title": "Stock falls below minimum", "icon": "warehouse", "app": "Inventory", "detail": "Forecasted quantity drops under the reordering rule's minimum.", "odoo": "Inventory ▸ Operations ▸ Replenishment" },
    { "title": "Scheduler runs the rule", "icon": "refresh", "app": "Inventory", "detail": "Needs a vendor line on the product, the Buy route and a stock-tracked product." },
    { "title": "RFQ created", "icon": "file", "app": "Purchase", "actor": "System", "detail": "Draft RFQ for the vendor on the product's vendor pricelist.", "impact": "No journal entry" },
    { "title": "Buyer confirms", "icon": "check", "app": "Purchase", "actor": "Buyer", "detail": "Above the minimum amount the PO waits in To Approve.", "branch": { "when": "Above approval amount", "result": "Manager clicks Approve Order", "tone": "warning" } },
    { "title": "Receipt created", "icon": "truck", "app": "Inventory", "detail": "Incoming receipt; forecast increases.", "impact": "Entry only when the receipt is validated (perpetual)" }
  ]
}
\`\`\`

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

\`\`\`visual-match
{
  "title": "Business question to report",
  "prompt": "Match each question from Northwind's managers to the report that answers it.",
  "leftLabel": "Business question",
  "rightLabel": "Report",
  "pairs": [
    { "left": "How much did we spend per vendor each month?", "right": "Purchase Analysis (Untaxed Total by Vendor x Month)" },
    { "left": "Which RFQs are still to send or late?", "right": "RFQ dashboard" },
    { "left": "Which products are below their minimum?", "right": "Replenishment report" },
    { "left": "Which bills are due and are they paid?", "right": "Vendor bills" },
    { "left": "How much do we still owe each vendor?", "right": "Aged Payable" }
  ],
  "explanation": "Purchase Analysis covers spend and ordered vs received vs billed quantities; payables questions belong to the Accounting reports."
}
\`\`\`

## 11. Accounting and inventory impact

Assume Paper category: AVCO, **automated** (perpetual) valuation. Purchase of 1,500 reams at INR 198 + GST 12%.

| Event | Inventory impact | Accounting impact |
|---|---|---|
| RFQ / PO confirmation | Incoming receipt created (forecast increases) | None |
| Receipt validated | On-hand +1,500; AVCO cost updated | Dr Stock Valuation 2,97,000 / Cr Stock Interim (Received) 2,97,000 |
| Vendor bill posted | None | Dr Stock Interim (Received) 2,97,000; Dr Input GST 35,640 / Cr Accounts Payable 3,32,640 |
| Price difference on bill | None | Difference posted to price-difference/stock accounts depending on costing method and version (verify) |
| Payment | None | Dr Accounts Payable / Cr Bank (or Outstanding Payments) |

\`\`\`visual-journal
{
  "title": "Receipt validated: 1,500 reams @ INR 198 (AVCO, automated)",
  "lines": [
    { "account": "Stock Valuation", "debit": "2,97,000" },
    { "account": "Stock Interim (Received)", "credit": "2,97,000" }
  ],
  "note": "The receipt values the goods at cost; no tax and no payable yet."
}
\`\`\`

\`\`\`visual-journal
{
  "title": "Vendor bill posted: 1,500 reams + GST 12%",
  "lines": [
    { "account": "Stock Interim (Received)", "debit": "2,97,000" },
    { "account": "Input GST", "debit": "35,640" },
    { "account": "Accounts Payable", "credit": "3,32,640" }
  ],
  "note": "The bill clears the interim account to zero and creates the payable including GST."
}
\`\`\`

With **manual (periodic)** valuation, the receipt creates no journal entry and the bill debits the expense/purchase account of the product category.

> **Consultant tip:** An open balance on the Stock Interim (Received) account means goods received but not billed (or billed but not received). Reviewing it at month-end is a classic consultant check for finance.

\`\`\`visual-check
{
  "question": "At month-end Northwind's Stock Interim (Received) account shows a debit of 2,97,000 with no matching credit. What happened?",
  "options": ["The receipt was validated but the vendor bill is not posted", "The vendor bill was posted but the goods were never received", "The payment was registered twice", "The PO was confirmed but not received"],
  "correct": 1,
  "explanation": "The bill debits Stock Interim (Received); only the receipt credits it. A debit balance means billed but not received. A received-not-billed situation would leave a credit balance, and PO confirmation creates no entry."
}
\`\`\`

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

\`\`\`visual-decision
{
  "title": "Vendor bill amount does not match the PO",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is the bill quantity higher than the received quantity?", "options": [ { "label": "Yes", "next": "r1" }, { "label": "No", "next": "q2" } ] },
    "r1": { "result": "Bill only what was received", "tone": "warning", "detail": "With bill control on received quantities, correct the bill or wait for the backorder receipt." },
    "q2": { "question": "Is the unit price on the bill different from the PO?", "options": [ { "label": "Yes", "next": "r2" }, { "label": "No", "next": "q3" } ] },
    "r2": { "result": "Confirm the agreed price with the buyer", "tone": "info", "detail": "If the vendor price changed, update the vendor pricelist for future RFQs; dispute the bill if it did not." },
    "q3": { "question": "Are taxes or the purchase unit of measure different?", "options": [ { "label": "Yes", "next": "r3" }, { "label": "No", "next": "r4" } ] },
    "r3": { "result": "Fix the tax or UoM on the product or vendor", "tone": "warning", "detail": "A box-of-5 vendor UoM versus units on the bill, or a wrong fiscal position, changes the total." },
    "r4": { "result": "Check for extra lines such as freight or a duplicate bill", "tone": "info", "detail": "Compare Qty Ordered, Received and Billed in Purchase Analysis." }
  }
}
\`\`\`

> **Consultant tip:** For replenishment issues, open the product's **Forecasted** report and the Replenishment menu first. They show demand, incoming and the rule that should fire.

\`\`\`visual-match
{
  "title": "Purchase symptoms and root causes",
  "prompt": "Match each symptom to its most likely root cause.",
  "leftLabel": "Symptom",
  "rightLabel": "Root cause",
  "pairs": [
    { "left": "PO stuck in To Approve", "right": "Order Approval threshold exceeded by a non-administrator" },
    { "left": "There is no invoiceable line on Create Bill", "right": "Bill control is Received quantities and nothing was received" },
    { "left": "Unit price 0 on the RFQ", "right": "No matching vendor pricelist line for vendor, quantity or date" },
    { "left": "No receipt after confirming the PO", "right": "Product is a service or not tracked in inventory" },
    { "left": "MTO sale creates no RFQ", "right": "MTO route archived or not ticked on the product" },
    { "left": "Cannot edit a confirmed PO", "right": "Lock Confirmed Orders is enabled" }
  ],
  "explanation": "Most purchase issues come from vendor pricelists, product type, routes or the bill control policy."
}
\`\`\`

\`\`\`visual-check
{
  "question": "PrintTech delivered 40 of 50 toners. AP clicks Create Bill. What does Odoo propose with bill control on received quantities?",
  "options": ["50 toners", "40 toners", "10 toners", "Nothing until all 50 arrive"],
  "correct": 1,
  "explanation": "Received-quantity control bills what the warehouse validated (40). The remaining 10 stay on the backorder and are billed when received."
}
\`\`\`

\`\`\`visual-decision
{
  "title": "Reordering rule creates no RFQ",
  "start": "q1",
  "nodes": {
    "q1": { "question": "Is the product tracked in stock (17: Storable; 18: Goods + Track Inventory)?", "options": [ { "label": "No", "next": "r1" }, { "label": "Yes", "next": "q2" } ] },
    "r1": { "result": "Fix the product type", "tone": "warning", "detail": "Reordering rules only apply to stock-tracked products." },
    "q2": { "question": "Does the product have the Buy route and a vendor line on the Purchase tab?", "options": [ { "label": "No", "next": "r2" }, { "label": "Yes", "next": "q3" } ] },
    "r2": { "result": "Add the Buy route and a vendor pricelist line", "tone": "warning", "detail": "Without a vendor Odoo cannot create an RFQ; the rule raises an exception instead." },
    "q3": { "question": "Is the forecast quantity really below the minimum?", "options": [ { "label": "No", "next": "r3" }, { "label": "Yes", "next": "r4" } ] },
    "r3": { "result": "Working as designed", "tone": "info", "detail": "Incoming receipts already cover the need; check the Forecasted report." },
    "r4": { "result": "Run Order Once or wait for the scheduler", "tone": "success", "detail": "Replenishment runs with the daily scheduler or manually from the Replenishment menu." }
  }
}
\`\`\`

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

\`\`\`visual-roleplay
{
  "title": "Purchase hypercare at Northwind",
  "setting": "First month after go-live. The Accounts Payable lead and the Purchase Manager raise issues in a weekly call.",
  "client": "AP lead",
  "rounds": [
    {
      "says": "The ErgoSeat bill is higher than the PO. Odoo let us post it!",
      "options": [
        { "text": "Let's compare ordered, received and billed quantities and the unit price on the bill against the PO and receipt.", "quality": "best", "feedback": "This is 3-way matching: find whether quantity, price, tax or an extra line causes the difference before acting." },
        { "text": "Just pay it, the vendor knows best.", "quality": "poor", "feedback": "Paying unchecked bills is exactly the problem the received-quantity policy was meant to stop." },
        { "text": "Delete the bill and ask the vendor to resend.", "quality": "ok", "feedback": "May be needed later, but first find the cause so the same mismatch does not return." }
      ]
    },
    {
      "says": "We click Create Bill and get 'There is no invoiceable line'.",
      "options": [
        { "text": "Bill control is on received quantities and the receipt is not validated yet. Validate the receipt first.", "quality": "best", "feedback": "Correct root cause and it reinforces the company's 'pay only what was received' policy." },
        { "text": "Change all products to ordered quantities.", "quality": "poor", "feedback": "Removes the control the business asked for. Ordered quantities fit services and prepayments only." },
        { "text": "It is a bug, I will log a ticket.", "quality": "poor", "feedback": "It is standard behaviour; a ticket wastes time." }
      ]
    },
    {
      "says": "A4 paper ran out even though we created reordering rules.",
      "options": [
        { "text": "Let's open the Forecasted report and Replenishment menu: check the vendor line, Buy route, product type and whether the scheduler ran.", "quality": "best", "feedback": "These four causes explain almost every rule that does not fire." },
        { "text": "Raise the minimum to a very high number.", "quality": "poor", "feedback": "Ties up cash in stock and does not fix a rule that never fires." },
        { "text": "Order paper manually every Monday.", "quality": "ok", "feedback": "Keeps shelves full short term but abandons the automation." }
      ]
    },
    {
      "says": "The buyer says a large chair order has been stuck for three days.",
      "options": [
        { "text": "It is in To Approve because it is above INR 5,00,000. I'll show the Purchase Manager the To Approve filter so approvals happen daily.", "quality": "best", "feedback": "Explains the standard approval step and fixes the process gap." },
        { "text": "Give the buyer Purchase Administrator rights.", "quality": "poor", "feedback": "Removes the approval control the business required." },
        { "text": "Raise the threshold to INR 10,00,000.", "quality": "ok", "feedback": "Only valid if management agrees; it changes policy, not the bottleneck." }
      ]
    },
    {
      "says": "Can we have two approval levels, one for the manager and one for the CFO?",
      "options": [
        { "text": "Standard supports one threshold per company. Two levels need Studio on Enterprise or a customization; let's log it in the fit-gap with effort.", "quality": "best", "feedback": "Clear on standard versus customization, and keeps change control." },
        { "text": "Yes, standard Odoo has multi-level PO approval.", "quality": "poor", "feedback": "Incorrect: Order Approval has a single threshold." },
        { "text": "Use the Approvals app for every PO.", "quality": "ok", "feedback": "The Approvals app handles generic requests and is Enterprise; it is not the PO approval and may duplicate work." }
      ]
    }
  ],
  "wrapup": "Check pricelists, product type, routes and bill control first; explain standard behaviour; push real gaps through the fit-gap."
}
\`\`\`

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
