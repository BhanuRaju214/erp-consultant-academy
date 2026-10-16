/**
 * Visual prototype — ERP Fundamentals › What is ERP?
 * Same facts as the original text lesson, restructured around visuals:
 * hero → problem (before/after) → definition → resources → history → integration flow →
 * scenario → misconceptions → try it → check → takeaways.
 */
export const whatIsErpBody = `\`\`\`visual-hero
{
  "eyebrow": "ERP Fundamentals · Lesson 1",
  "title": "What is ERP?",
  "subtitle": "One database and one set of master data, so every department works on the same information in real time.",
  "objectives": [
    "Define ERP in one sentence",
    "Explain what **integration** means using a sales order",
    "Name the five resources an ERP plans and tracks",
    "Describe how ERP grew out of MRP",
    "Recognise what ERP is **not**"
  ],
  "hub": {
    "center": { "label": "One database · shared master data", "icon": "database" },
    "nodes": [
      { "label": "Sales", "icon": "cart", "detail": "Quotations and orders use the same customers, products and prices as everyone else." },
      { "label": "Purchase", "icon": "truck", "detail": "Buys from the same vendor and product records; shortages raise replenishment suggestions." },
      { "label": "Inventory", "icon": "warehouse", "detail": "Confirming a sales order reserves stock and creates the delivery automatically." },
      { "label": "Manufacturing", "icon": "factory", "detail": "Plans production from the same products and stock levels." },
      { "label": "Accounting", "icon": "landmark", "detail": "Invoices and journal entries are created from the order — no re-typing." },
      { "label": "HR", "icon": "users", "detail": "Employees, timesheets and payroll share the same company data." },
      { "label": "Projects", "icon": "clipboard", "detail": "Tasks, time and costs roll up into the same ledger." }
    ]
  }
}
\`\`\`

## The business problem

**Brightline Furniture Pvt Ltd** is a fictional manufacturer of office chairs with 120 employees. Every department is working hard, but no one sees the whole picture — and every hand-off between them is a phone call, an email or a re-typed spreadsheet row.

\`\`\`visual-beforeafter
{
  "title": "Brightline Furniture: one sales order, two ways of working",
  "before": {
    "title": "Disconnected applications",
    "points": [
      "Sales takes the order by **email** and types it into a spreadsheet",
      "Sales **phones** the warehouse to ask if stock exists",
      "The warehouse checks a **different** spreadsheet",
      "Purchasing buys fabric from a **printed list**",
      "Accounts invoice in a separate package **two weeks later** — when someone remembers"
    ]
  },
  "after": {
    "title": "Integrated ERP",
    "points": [
      "The quotation shows **available stock** on the product line",
      "Confirming the order creates the **delivery** automatically",
      "Short fabric triggers a **replenishment suggestion** for purchasing",
      "Accounts create the invoice from the order in **one click** — price, taxes and customer already there"
    ]
  }
}
\`\`\`

This is the problem that **Enterprise Resource Planning (ERP)** software was created to solve.

## Definition

> **Definition:** An **ERP system** is an integrated suite of business applications that share **one database** and **one set of master data**, so that every department — sales, purchasing, inventory, manufacturing, accounting, HR, projects — works on the same information in real time.

\`\`\`visual-cards
{
  "title": "Three words that define ERP",
  "columns": 3,
  "cards": [
    { "icon": "link", "title": "Integrated", "body": "A transaction in one area automatically updates the others. Confirming a sales order can reserve stock, create a delivery, and later produce an invoice and journal entry." },
    { "icon": "database", "title": "Shared data", "body": "A customer, product or vendor is created **once** and used everywhere." },
    { "icon": "workflow", "title": "Process-oriented", "body": "The system follows end-to-end business flows — for example *Order to Cash* or *Procure to Pay* — rather than isolated tasks." }
  ]
}
\`\`\`

## The "resource" in ERP

ERP plans and tracks the resources of an enterprise:

\`\`\`visual-cards
{
  "title": "Five resources an ERP manages",
  "columns": 3,
  "cards": [
    { "icon": "coins", "title": "Money", "body": "Cash, receivables, payables, budgets → **Accounting / Finance**" },
    { "icon": "package", "title": "Materials", "body": "Raw materials, finished goods, spare parts → **Inventory, Purchase, Manufacturing**" },
    { "icon": "users", "title": "People", "body": "Employees, timesheets, payroll, skills → **HR, Timesheets, Payroll**" },
    { "icon": "factory", "title": "Capacity", "body": "Machines, work centres, vehicles → **Manufacturing, Maintenance, Fleet**" },
    { "icon": "handshake", "title": "Customers & relationships", "body": "Leads, quotations, contracts → **CRM, Sales, Subscriptions**" }
  ]
}
\`\`\`

## A short history

\`\`\`visual-timeline
{
  "title": "From MRP to cloud ERP",
  "items": [
    { "when": "1960s–70s", "title": "MRP", "icon": "factory", "detail": "Material Requirements Planning calculated what raw materials to buy from a production plan." },
    { "when": "1980s", "title": "MRP II", "icon": "settings", "detail": "Added capacity planning, shop-floor control and costing." },
    { "when": "1990s", "title": "ERP", "icon": "database", "detail": "Extended the idea to finance, HR, sales and distribution in one system." },
    { "when": "2000s →", "title": "ERP II / cloud ERP", "icon": "cloud", "detail": "Web access, e-commerce, CRM, mobile apps and software-as-a-service delivery." }
  ]
}
\`\`\`

Modern ERPs range from very large enterprise suites to modular open-source platforms such as **Odoo**, which offers separate "apps" (CRM, Sales, Purchase, Inventory, Accounting, Manufacturing and many more) that share one database.

## How integration works

Select each step to see who does it and what the ERP does automatically.

\`\`\`visual-flow
{
  "title": "One confirmed sales order flows through the whole business",
  "caption": "In a non-integrated company, every arrow in this flow is a phone call, an email or a re-typed spreadsheet row.",
  "steps": [
    { "title": "Sales order confirmed", "icon": "cart", "actor": "Salesperson", "detail": "The customer accepts the quotation and the order is confirmed.", "document": "Sales order" },
    { "title": "Stock reserved", "icon": "warehouse", "actor": "ERP (automatic)", "detail": "Available stock is reserved for the order. If stock is short, a **purchase is suggested** to purchasing.", "impact": "Stock reserved for this customer" },
    { "title": "Delivery order", "icon": "clipboard", "actor": "Warehouse", "detail": "The warehouse sees the delivery to prepare without being told.", "document": "Delivery order" },
    { "title": "Goods shipped", "icon": "truck", "actor": "Warehouse", "detail": "The delivery is validated when the goods leave.", "impact": "Stock decreases" },
    { "title": "Customer invoice", "icon": "invoice", "actor": "Accounts", "detail": "Created from the order — price, taxes and customer details are already there.", "document": "Customer invoice" },
    { "title": "Journal entry", "icon": "landmark", "actor": "ERP (automatic)", "detail": "Posting the invoice records the entry in the ledger.", "impact": "Receivable and revenue recorded" }
  ]
}
\`\`\`

## Real-world scenario

\`\`\`visual-scenario
{
  "title": "Brightline Furniture after go-live",
  "company": "Brightline Furniture Pvt Ltd",
  "industry": "Manufacturing · office chairs · 120 employees",
  "situation": "Brightline implements an ERP. Each department now works from the same order, stock and customer records.",
  "steps": [
    "A salesperson creates a quotation in the Sales module and sees **available stock** on the product line",
    "The customer accepts; the order is confirmed and the warehouse **automatically** sees a delivery to prepare",
    "Fabric is short, so purchasing gets a **replenishment suggestion**",
    "The delivery is validated and accounts create the invoice from the order **with one click**"
  ],
  "metrics": [
    { "label": "Month-end close", "before": "8 days", "after": "3 days" },
    { "label": "Spreadsheets to reconcile", "before": "4", "after": "0" },
    { "label": "Invoice raised", "before": "≈ 2 weeks later", "after": "On delivery" }
  ]
}
\`\`\`

## What ERP is *not*

\`\`\`visual-dodont
{
  "title": "Common misconceptions",
  "do": [
    "Treat ERP as the platform for **all** departments — accounting is only one module",
    "Improve the process first, then automate it",
    "Plan for configuration, data, training and **ongoing ownership**"
  ],
  "dont": [
    "Think of ERP as \\"just accounting software\\"",
    "Expect ERP to fix a poor process — automating a bad process only produces bad results faster",
    "Treat it as \\"install and forget\\""
  ]
}
\`\`\`

## Try it yourself

- [ ] List the separate systems and spreadsheets used by a business you know (or Brightline) and draw the hand-offs between them
- [ ] Mark every hand-off that is a phone call, email or re-typed row — these are the arrows ERP integration removes
- [ ] For each of the five resources (money, materials, people, capacity, customers), name one record that business would keep in the ERP

## Check your understanding

\`\`\`visual-check
{
  "question": "Which statement best describes **integration** in an ERP?",
  "options": [
    "Every department uses the same login page",
    "A transaction in one area automatically updates the related records in other areas",
    "All reports are exported to one spreadsheet at month-end",
    "The accounting module is installed first"
  ],
  "correct": 1,
  "explanation": "Integration means one transaction — such as confirming a sales order — updates stock, deliveries, invoices and the ledger without re-entry."
}
\`\`\`

\`\`\`visual-check
{
  "question": "ERP evolved from which earlier type of system?",
  "options": ["CRM", "MRP (Material Requirements Planning)", "Payroll software", "E-commerce platforms"],
  "correct": 1,
  "explanation": "MRP (1960s–70s) calculated material needs from a production plan; MRP II added capacity and costing; ERP extended the idea to finance, HR, sales and distribution."
}
\`\`\`

## Key takeaways

- ERP = integrated applications on **one database** with **shared master data**.
- Integration means one transaction updates every affected department automatically.
- ERP evolved from MRP (materials) to cover finance, people, customers and capacity.
- ERP supports end-to-end processes such as Order to Cash and Procure to Pay.
- Technology alone does not fix a business; process and people matter as much as software.
`;
