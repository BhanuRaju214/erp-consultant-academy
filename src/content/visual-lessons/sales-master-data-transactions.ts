/**
 * Visual prototype — Odoo Sales › Master data & transactions.
 * Same facts and walkthroughs as the original lesson; the Odoo screen is an
 * explicitly labelled illustrative mockup (not a screenshot).
 */
export const salesMasterDataTransactionsBody = `\`\`\`visual-hero
{
  "eyebrow": "Odoo Sales · Module 3",
  "title": "Master data & transactions",
  "subtitle": "Set up the data that drives every order, then run quotations, deliveries, invoices and down payments end to end.",
  "objectives": [
    "Name the master data Sales depends on and where each comes from",
    "Choose the right **product type** in Odoo 17 and 18",
    "Create, send and confirm a quotation",
    "Predict what can be invoiced under each **invoicing policy**",
    "Process a down payment and apply a discount"
  ]
}
\`\`\`

## 7. Master data

Customer and product records fill in the defaults on every order — get them right once and every quotation is right.

| Master data | Key fields | Northwind example | Template |
|---|---|---|---|
| Product categories | Income/expense accounts, costing method | Paper, Toner, Furniture, Services | /api/templates/product-categories |
| Products | Name, product type, sales price, cost, UoM, taxes, invoicing policy | A4 Paper 75 GSM — INR 285/ream | /api/templates/products |
| Product variants | Attributes and values | Executive Chair — Black / Grey | — |
| Units of measure | UoM category, ratio | Ream; Box of 5 reams (5× bigger) | — |
| Customers | Address, GSTIN/VAT, payment terms, pricelist, salesperson | Greenfield International School | /api/templates/customers |
| Pricelists | Rules, currency | Education −8% | — |
| Payment terms | Lines with percentage and delay | 30 Days | — |

\`\`\`visual-compare
{
  "title": "Product type — Odoo 17.0 vs 18.0",
  "columns": ["Odoo 17.0", "Odoo 18.0"],
  "rows": [
    { "label": "Stock is tracked and valued", "values": ["Storable Product (requires Inventory)", "Goods with **Track Inventory** ticked"] },
    { "label": "Stock not tracked", "values": ["Consumable", "Goods without Track Inventory"] },
    { "label": "No stock at all", "values": ["Service", "Service"] },
    { "label": "Bundled choice products", "values": ["—", "Combo"] }
  ],
  "caption": "Verify the exact field labels in your training instance when you switch versions."
}
\`\`\`

> **Consultant tip:** Choosing the wrong product type is the most expensive master-data mistake. A consumable cannot be valued in stock; changing type after transactions exist is restricted or messy.

## 8. Transactions — the document flow

Select a step to see who acts and what Odoo creates.

\`\`\`visual-flow
{
  "title": "From quotation to invoice in Odoo Sales",
  "steps": [
    { "title": "Quotation", "icon": "file", "actor": "Salesperson", "odoo": "Sales ▸ Orders ▸ Quotations ▸ New", "detail": "Customer, template and pricelist fill the lines and prices.", "document": "Quotation" },
    { "title": "Quotation Sent", "icon": "mail", "actor": "Salesperson", "odoo": "Send by Email", "detail": "The customer receives a portal link to review the offer." },
    { "title": "Sales Order", "icon": "signature", "actor": "Customer or salesperson", "odoo": "Accept & Sign / Sign & Pay — or Confirm", "detail": "Confirmed online on signature (and payment, if required) or manually.", "impact": "No journal entry on confirmation" },
    { "title": "Delivery", "icon": "truck", "actor": "Warehouse", "odoo": "Delivery smart button", "detail": "Created automatically for goods when Inventory is installed. Partial deliveries create a backorder.", "impact": "Stock decreases" },
    { "title": "Invoice", "icon": "invoice", "actor": "Accounts", "odoo": "Create Invoice ▸ Regular invoice", "detail": "Invoiceable quantity depends on the invoicing policy.", "impact": "Posted invoice creates the journal entry" }
  ]
}
\`\`\`

### Walkthrough A — Create and send a quotation

\`\`\`visual-mockup
{
  "title": "Quotation for Greenfield International School",
  "app": "Sales",
  "breadcrumb": ["Quotations", "New"],
  "buttons": [
    { "label": "Send by Email", "primary": true, "marker": 1 },
    { "label": "Confirm", "marker": 5 },
    { "label": "Preview" }
  ],
  "status": { "steps": ["Quotation", "Quotation Sent", "Sales Order"], "current": 0 },
  "fields": [
    { "label": "Customer", "value": "Greenfield International School", "marker": 2 },
    { "label": "Quotation Template", "value": "School Annual Supply", "marker": 3 },
    { "label": "Pricelist", "value": "Education", "marker": 4 },
    { "label": "Payment Terms", "value": "30 Days" }
  ],
  "lines": {
    "columns": ["Product", "Quantity", "Unit Price", "Subtotal"],
    "rows": [["A4 Paper 75 GSM", "600.00", "262.20", "1,57,320.00"]]
  },
  "annotations": [
    { "marker": 1, "title": "Send by Email", "text": "Sends the quotation with a portal link. Status becomes **Quotation Sent**." },
    { "marker": 2, "title": "Customer drives the defaults", "text": "The customer's pricelist (Education) and payment terms (30 Days) fill in automatically." },
    { "marker": 3, "title": "Quotation template", "text": "Loads the template's lines and optional products (requires the Quotation Templates setting)." },
    { "marker": 4, "title": "Pricelist applied", "text": "Education −8%: INR 285 × 0.92 = **INR 262.20** per ream." },
    { "marker": 5, "title": "Confirm", "text": "Turns the quotation into a **Sales Order**; for goods, a delivery is created when Inventory is installed." }
  ],
  "note": "Simplified layout; labels follow Odoo 17 — verify in your training instance."
}
\`\`\`

\`\`\`visual-steps
{
  "title": "Create and send the quotation",
  "steps": [
    { "title": "Open a new quotation", "path": "Sales ▸ Orders ▸ Quotations ▸ New" },
    { "title": "Select the customer", "body": "**Greenfield International School** — the pricelist (Education) and payment terms (30 Days) fill in automatically." },
    { "title": "Choose the quotation template", "body": "**School Annual Supply** loads the lines and optional products." },
    { "title": "Adjust quantities and check prices", "body": "Set A4 paper to **600 reams**; the unit price should reflect the Education pricelist.", "result": "Unit price INR 262.20 (285 − 8%)" },
    { "title": "Add extra lines if needed", "body": "For example an **Installation service** line." },
    { "title": "Send it", "path": "Send by Email", "result": "Status: Quotation Sent" }
  ]
}
\`\`\`

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Create a quotation and confirm the sales order",
  "intro": "Greenfield International School wants **60 reams** of A4 paper, shipped from Northwind Main.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "**S00005** is a confirmed sales order. Odoo created the delivery in Northwind Main, and the order is ready to invoice.",
  "steps": [
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-01.webp",
      "alt": "Sales quotations list with the New button.",
      "path": "Sales ▸ Orders ▸ Quotations",
      "task": "Start a **new quotation**.",
      "target": {
        "x": 0.8500000000000001,
        "y": 5.95,
        "w": 4,
        "h": 4.2,
        "label": "New"
      },
      "explain": "A blank quotation opens with today's date and you as salesperson."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-02.webp",
      "alt": "Customer field with Greenfield International School in the dropdown.",
      "path": "Sales ▸ Quotations ▸ Customer",
      "task": "Typing **Greenfield** finds the customer. **Pick Greenfield International School.**",
      "target": {
        "x": 11.45,
        "y": 28.55,
        "w": 34,
        "h": 3.5,
        "label": "Greenfield International School"
      },
      "traps": [
        {
          "x": 11.45,
          "y": 34.55,
          "w": 34,
          "h": 3.5,
          "feedback": "That creates a **duplicate** customer. Greenfield already exists: pick it."
        }
      ],
      "explain": "The customer's addresses, payment terms and pricelist fill in from the contact."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-03.webp",
      "alt": "Quotation for Greenfield with the Add Line link.",
      "path": "Sales ▸ Quotations ▸ Order Lines",
      "task": "**Add an order line.**",
      "target": {
        "x": 4.65,
        "y": 50.85,
        "w": 4.4,
        "h": 3.1,
        "label": "Add Line"
      },
      "explain": "A new order line opens with the product field active."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-04.webp",
      "alt": "Product dropdown on the order line showing A4 Copy Paper 80gsm (Ream).",
      "path": "Sales ▸ Quotations ▸ Order Lines",
      "task": "**Select A4 Copy Paper 80gsm.**",
      "target": {
        "x": 4.95,
        "y": 53.55,
        "w": 24.8,
        "h": 3.5,
        "label": "A4 Copy Paper 80gsm (Ream)"
      },
      "explain": "The unit price (₹6.50) and the 5% GST come from the product."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-05.webp",
      "alt": "Order line for A4 Copy Paper with quantity 1.",
      "path": "Sales ▸ Quotations ▸ Order Lines",
      "task": "The school needs **60 reams**. Set the quantity.",
      "target": {
        "x": 16.35,
        "y": 49.95,
        "w": 7.6,
        "h": 9.3,
        "label": "the Quantity cell"
      },
      "input": {
        "label": "Quantity",
        "answer": "60",
        "placeholder": "reams"
      },
      "traps": [
        {
          "x": 30.35,
          "y": 49.95,
          "w": 7.6,
          "h": 9.3,
          "feedback": "That is the **unit price** from the product or pricelist. Change the quantity."
        }
      ],
      "explain": "60 × ₹6.50 = ₹390 before GST."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-06.webp",
      "alt": "Quotation for 60 reams showing the Order Lines and Other Info tabs.",
      "path": "Sales ▸ Quotations",
      "task": "The goods must ship from **Northwind Main**. The warehouse is on the **Other Info** tab: open it.",
      "target": {
        "x": 9.85,
        "y": 41.15,
        "w": 7.3,
        "h": 4.8,
        "label": "Other Info"
      },
      "explain": "Other Info holds the delivery, invoicing and tracking settings of the order."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-07.webp",
      "alt": "Warehouse dropdown showing Northwind Main.",
      "path": "Sales ▸ Quotations ▸ Other Info ▸ Warehouse",
      "task": "**Pick the Northwind Main warehouse.**",
      "target": {
        "x": 42.25,
        "y": 90.45,
        "w": 18.6,
        "h": 3.5,
        "label": "Northwind Main"
      },
      "explain": "The delivery will be created in Northwind Main (pick, then deliver)."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-08.webp",
      "alt": "Completed quotation with Send by Email and Confirm buttons.",
      "path": "Sales ▸ Quotations",
      "task": "The school accepted by phone. **Confirm the order.**",
      "target": {
        "x": 11.15,
        "y": 11.75,
        "w": 5.6,
        "h": 4.2,
        "label": "Confirm"
      },
      "traps": [
        {
          "x": 0.8500000000000001,
          "y": 11.75,
          "w": 4.2,
          "h": 4.2,
          "feedback": "**Send by Email** sends the quotation for approval; it does not confirm it. The customer already said yes."
        }
      ],
      "explain": "The quotation becomes a **Sales Order**: Odoo reserves the paper and creates the delivery."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-quote-09.webp",
      "alt": "Confirmed sales order with the Delivery smart button.",
      "path": "Sales ▸ Orders",
      "task": "S00005 is confirmed.",
      "explain": "Status **Sales Order**. The **Delivery** smart button links to the shipment in Northwind Main."
    }
  ]
}
\`\`\`

### Walkthrough B — Customer signs online

\`\`\`visual-flow
{
  "title": "Online signature and payment",
  "steps": [
    { "title": "Opens portal link", "icon": "mail", "actor": "Customer", "detail": "From the quotation email." },
    { "title": "Adds optional products", "icon": "cart", "actor": "Customer", "detail": "For example document trays offered by the template." },
    { "title": "Signs (and pays)", "icon": "signature", "actor": "Customer", "detail": "Clicks **Sign & Pay** or **Accept & Sign** — the label depends on whether payment is required." },
    { "title": "Order confirmed", "icon": "check", "actor": "Odoo (automatic)", "detail": "On signature (and payment, if required) the quotation is confirmed automatically." }
  ]
}
\`\`\`

### Walkthrough C — Confirm manually and deliver

\`\`\`visual-steps
{
  "steps": [
    { "title": "Confirm the quotation", "path": "Confirm", "result": "Status: Sales Order" },
    { "title": "Open the delivery", "body": "A **Delivery** smart button appears (Inventory installed and a goods product)." },
    { "title": "Validate what was shipped", "body": "The warehouse validates the quantities actually shipped — e.g. **400 of 600 reams**.", "result": "A backorder is created for the remaining 200" },
    { "title": "Check the order line", "result": "The Delivered column shows 400" }
  ]
}
\`\`\`

### Walkthrough D — Invoice according to policy

\`\`\`visual-compare
{
  "title": "600 ordered, 400 delivered — what can be invoiced now?",
  "columns": ["Ordered quantities", "Delivered quantities"],
  "rows": [
    { "label": "Ordered", "values": ["600", "600"] },
    { "label": "Delivered", "values": ["400", "400"] },
    { "label": "Invoiceable now", "values": ["**600**", "**400**"] }
  ]
}
\`\`\`

\`\`\`visual-steps
{
  "steps": [
    { "title": "Click Create Invoice", "path": "Create Invoice" },
    { "title": "Choose Regular invoice" },
    { "title": "Post the draft invoice", "body": "Odoo creates a draft for the invoiceable quantity; accounting posts it (**Confirm**)." },
    { "title": "Check the order's invoice status", "result": "Invoice Status shows Fully Invoiced or To Invoice" }
  ]
}
\`\`\`

> **Consultant tip:** "Nothing to invoice" errors almost always mean the invoicing policy is "Delivered quantities" and the delivery has not been validated.

#### Try it yourself

\`\`\`visual-simulate
{
  "title": "Invoice the sales order",
  "intro": "A4 paper uses the **Ordered quantities** invoicing policy, so you can invoice as soon as the order is confirmed.",
  "version": "Odoo 20",
  "width": 1600,
  "height": 1000,
  "caption": "Real screens are from an Odoo 20 training database with fictional Northwind data; amounts are in ₹ with Indian GST.",
  "outcome": "Invoice **INV/26-27/0002** is posted for 60 reams plus GST. Under *Delivered quantities* you could only invoice what has been shipped.",
  "steps": [
    {
      "src": "/visuals/odoo-sales/sims/sal-invoice-01.webp",
      "alt": "Confirmed sales order with the Create Invoice button.",
      "path": "Sales ▸ Orders",
      "task": "Accounts wants to bill **S00005** now. **Create the invoice.**",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.75,
        "w": 8.3,
        "h": 4.2,
        "label": "Create Invoice"
      },
      "explain": "Odoo asks what kind of invoice you want."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-invoice-02.webp",
      "alt": "Create invoice dialog with Regular invoice selected and the Create Draft button.",
      "path": "Create Invoice",
      "task": "A **regular invoice** for the ordered quantity is what you need. **Create the draft.**",
      "target": {
        "x": 16.85,
        "y": 59.05,
        "w": 7.4,
        "h": 4.2,
        "label": "Create Draft"
      },
      "traps": [
        {
          "x": 26.85,
          "y": 47.35,
          "w": 13.1,
          "h": 2.8,
          "feedback": "A **down payment** bills an advance, not the order. Keep *Regular invoice*."
        }
      ],
      "explain": "A draft invoice opens for 60 reams at ₹6.50 plus GST."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-invoice-03.webp",
      "alt": "Draft customer invoice for Greenfield International School.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "Check the lines and **post the invoice**.",
      "target": {
        "x": 0.8500000000000001,
        "y": 11.85,
        "w": 5.6,
        "h": 4.2,
        "label": "Confirm"
      },
      "explain": "Posting gives the invoice its number and creates the journal entry (receivable, sales, GST)."
    },
    {
      "src": "/visuals/odoo-sales/sims/sal-invoice-04.webp",
      "alt": "Posted customer invoice with Send and Register Payment buttons.",
      "path": "Accounting ▸ Customers ▸ Invoices",
      "task": "Invoice INV/26-27/0002 is posted.",
      "explain": "Next: **Send** it to the customer, and **Register Payment** when the money arrives."
    }
  ]
}
\`\`\`

### Walkthrough E — Down payment

Order: 20 Executive Chairs, **INR 4,20,000**. Terms: 50% advance.

\`\`\`visual-flow
{
  "title": "50% down payment, then the final invoice",
  "steps": [
    { "title": "Order confirmed", "icon": "cart", "detail": "20 Executive Chairs, INR 4,20,000." },
    { "title": "Down payment invoice", "icon": "invoice", "odoo": "Create Invoice ▸ Down payment (percentage) = 50", "detail": "INR 2,10,000 + tax as applicable. A fixed-amount down payment is also possible." },
    { "title": "Customer pays", "icon": "payment", "detail": "The advance is received." },
    { "title": "Delivery", "icon": "truck", "detail": "The chairs are delivered." },
    { "title": "Final regular invoice", "icon": "receipt", "odoo": "Create Invoice ▸ Regular invoice", "detail": "The down payment is **deducted automatically** as a negative line." }
  ]
}
\`\`\`

### Walkthrough F — Discounts and margins

\`\`\`visual-steps
{
  "steps": [
    { "title": "Enter the discount", "body": "On a key-account order, enter **5%** in the **Disc.%** column." },
    { "title": "Check the margin", "body": "The **Margin** at the bottom of the order needs the product cost." },
    { "title": "Escalate if below policy", "body": "If the margin falls below company policy, escalate." }
  ]
}
\`\`\`

> **Important:** A hard approval for discounts is not standard in Sales — it needs Studio/approval customization (Enterprise or custom).

## Try it yourself

- [ ] Create a quotation for Greenfield International School from the School Annual Supply template and confirm the Education price (INR 262.20)
- [ ] Send it, then confirm it and validate a partial delivery of 400 reams
- [ ] Create the invoice and check the invoiceable quantity under your product's invoicing policy
- [ ] Process the 50% down payment for 20 Executive Chairs and check the deduction on the final invoice

## Check your understanding

\`\`\`visual-check
{
  "question": "A product's invoicing policy is **Delivered quantities**. 600 are ordered and 400 delivered. How many can be invoiced now?",
  "options": ["600", "400", "200", "0"],
  "correct": 1,
  "explanation": "With delivered quantities only what has been delivered (400) is invoiceable; the remaining 200 follow once the backorder is delivered."
}
\`\`\`

\`\`\`visual-check
{
  "question": "What happens to a 50% down payment when you create the final regular invoice?",
  "options": ["It must be refunded first", "It is deducted automatically as a negative line", "It is ignored", "A credit note must be created manually"],
  "correct": 1,
  "explanation": "The final regular invoice deducts the down payment automatically as a negative line."
}
\`\`\`

## Key takeaways

- Customer master data (pricelist, payment terms) drives defaults on every order.
- Product type and invoicing policy determine delivery creation and invoice timing.
- Down payments are deducted automatically from the final regular invoice.
- Discounts are standard; discount approvals are customization.
`;
