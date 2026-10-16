/**
 * Visual prototype — Odoo Sales › Troubleshooting, practice & interview prep.
 * The 10-row troubleshooting table becomes a guided decision tree (all causes and
 * resolutions preserved; the table remains as a printable quick reference).
 */
export const salesTroubleshootingBody = `\`\`\`visual-hero
{
  "eyebrow": "Odoo Sales · Module 4",
  "title": "Troubleshooting, practice & interview prep",
  "subtitle": "Diagnose the most common Sales issues in minutes, practise the full cycle, and answer interview questions with confidence.",
  "objectives": [
    "Trace a Sales problem to its cause: product type, invoicing policy, pricelist rules or taxes",
    "Apply the right fix without changing configuration blindly",
    "Complete the configuration, master-data and transaction practice sets",
    "Answer seven common interview questions — always linking a feature to its accounting impact"
  ]
}
\`\`\`

## 13. Common errors and troubleshooting

Answer the questions to reach the most likely cause and fix — or open the whole tree to scan every case.

\`\`\`visual-decision
{
  "title": "Sales troubleshooting guide",
  "start": "area",
  "nodes": {
    "area": { "question": "Where does the user see the problem?", "options": [
      { "label": "Invoicing", "next": "inv" },
      { "label": "Delivery", "next": "r-delivery" },
      { "label": "Prices & discounts", "next": "price" },
      { "label": "Taxes & margin", "next": "tax" },
      { "label": "Order & portal", "next": "order" }
    ] },
    "inv": { "question": "What happens when invoicing?", "options": [
      { "label": "\\"There is no invoiceable line\\"", "next": "r-noinvoice" },
      { "label": "Down payment not deducted", "next": "r-downpayment" }
    ] },
    "price": { "question": "What is wrong with the price?", "options": [
      { "label": "Pricelist price not applied", "next": "r-pricelist" },
      { "label": "Discount column missing", "next": "r-discount" }
    ] },
    "tax": { "question": "What looks wrong?", "options": [
      { "label": "Wrong tax on invoice", "next": "r-tax" },
      { "label": "Margin shows 0 or 100%", "next": "r-margin" }
    ] },
    "order": { "question": "What is the order problem?", "options": [
      { "label": "Cannot edit confirmed order", "next": "r-locked" },
      { "label": "Optional products not visible to customer", "next": "r-optional" },
      { "label": "Quotation expired", "next": "r-expired" }
    ] },
    "r-noinvoice": { "result": "Invoicing policy is Delivered quantities and nothing is delivered yet", "tone": "warning", "detail": "Validate the delivery or use a down payment; review the policy with finance." },
    "r-downpayment": { "result": "Final invoice was created as a down payment again, or lines were removed", "tone": "warning", "detail": "Create a **Regular invoice** and keep the deduct option (verify the wizard options in your instance)." },
    "r-delivery": { "result": "No delivery after confirmation: product type or Inventory", "tone": "warning", "detail": "The product is a Service/Consumable without stock tracking, or Inventory is not installed. Check the product type (17: Storable; 18: Goods + Track Inventory)." },
    "r-pricelist": { "result": "Pricelist not on customer, or a rule condition is not met", "tone": "warning", "detail": "Check the customer's pricelist and the rule dates, minimum quantity and target category; click **Update Prices** on the order (verify the button label)." },
    "r-discount": { "result": "The Discounts setting is off", "tone": "info", "detail": "Enable it in Sales settings ▸ **Discounts**." },
    "r-tax": { "result": "Product tax or customer fiscal position", "tone": "warning", "detail": "Fix the product taxes or the fiscal position mapping." },
    "r-margin": { "result": "Product cost is not set", "tone": "info", "detail": "Set the cost on the product (or rely on valuation)." },
    "r-locked": { "result": "Lock Confirmed Sales is enabled", "tone": "info", "detail": "A manager unlocks the order, or create a new order / credit note." },
    "r-optional": { "result": "Template not used or portal not accessed", "tone": "info", "detail": "Use a quotation template and check the customer's portal access." },
    "r-expired": { "result": "The validity date has passed", "tone": "info", "detail": "Update the expiration date and resend the quotation." }
  }
}
\`\`\`

\`\`\`visual-dodont
{
  "title": "How to troubleshoot like a consultant",
  "do": [
    "Reproduce the issue in a **test database** with the user's exact customer, product and quantity",
    "Check the data first — product type, invoicing policy, pricelist rules, taxes",
    "Change configuration only once the cause is confirmed"
  ],
  "dont": [
    "Change configuration in production before reproducing the issue",
    "Assume a bug — pricing issues are almost always **data**, not bugs"
  ]
}
\`\`\`

### Quick reference

| Symptom | Likely cause | Resolution |
|---|---|---|
| "There is no invoiceable line" when clicking Create Invoice | Invoicing policy = Delivered quantities and nothing delivered yet | Validate the delivery or use a down payment; review policy with finance |
| No delivery created after confirmation | Product type is Service/Consumable without stock tracking, or Inventory not installed | Check product type (17: Storable; 18: Goods + Track Inventory) |
| Pricelist price not applied | Pricelist not on customer, rule dates/min. quantity not met, or rule targets another category | Check customer pricelist and rule conditions; click Update Prices on the order (verify button label) |
| Discount column missing | Discounts setting off | Sales settings ▸ Discounts |
| Cannot edit confirmed order | Lock Confirmed Sales enabled | Unlock (manager) or create a new order/credit note |
| Wrong tax on invoice | Product tax or fiscal position on customer | Fix product taxes / fiscal position mapping |
| Margin shows 0 or 100% | Product cost not set | Set cost on product (or rely on valuation) |
| Optional products not visible to customer | Template not used or portal not accessed | Use quotation template; check portal access |
| Down payment not deducted | Final invoice created as down payment again or lines removed | Create Regular invoice; ensure deduct option kept (verify wizard options) |
| Quotation expired | Validity date passed | Update the expiration date and resend |

## 14. Practical assignments

### Practice 1 — Configuration
- [ ] Enable Variants, Units of Measure, Discounts, Pricelists, Margins, Quotation Templates, Online Signature
- [ ] Create pricelists Standard, Education (−8%) and Key Account (fixed price for toner)
- [ ] Create payment terms Immediate, 30 Days and 50% Advance / Balance 30 Days
- [ ] Create the quotation template School Annual Supply with two optional products

### Practice 2 — Master data
- [ ] Import 10 products using the products template, including one service and one variant product
- [ ] Set invoicing policy: goods = delivered quantities, installation service = ordered quantities
- [ ] Import 5 customers with pricelists and payment terms

### Practice 3 — Transactions
- [ ] Create a quotation from the template, send it, confirm it
- [ ] Deliver partially, invoice, then deliver the backorder and invoice the remainder
- [ ] Process a 50% down payment order for chairs end-to-end
- [ ] Build a Sales Analysis pivot (Product Category × Month) and compare with Invoice Analysis

## 15. Interview questions with model answers

\`\`\`visual-cards
{
  "label": "Interview prep",
  "title": "Model answers",
  "columns": 2,
  "cards": [
    { "icon": "invoice", "title": "Q1. Explain invoicing policies and their impact.", "body": "**Ordered quantities** lets you invoice as soon as the order is confirmed (prepaid goods, fixed-price services). **Delivered quantities** invoices only what has been delivered (goods shipped, timesheets, milestones). It affects cash flow, revenue-recognition timing and the \\"To Invoice\\" list." },
    { "icon": "percent", "title": "Q2. How do you give a school 8% off all products?", "body": "Enable Pricelists, create an **Education** pricelist with a rule applying a discount on all products, and assign it to the school's contact. No customization required." },
    { "icon": "file", "title": "Q3. Quotation template vs pricelist?", "body": "A template defines **what** is offered (lines, optional products, validity, terms, signature/payment). A pricelist defines **at what price**. They work together." },
    { "icon": "payment", "title": "Q4. How do down payments work in Odoo?", "body": "From a confirmed order: Create Invoice → Down payment (percentage or fixed). Odoo uses a down-payment product/account. The final regular invoice deducts the down payment as a negative line." },
    { "icon": "alert", "title": "Q5. Managers must approve discounts above 10%. Standard?", "body": "No standard Sales approval exists in 17. Options: training + margin reports, Studio approval rules (Enterprise), or a custom module. Document it as a **gap** with an effort estimate." },
    { "icon": "landmark", "title": "Q6. What happens in accounting when a sales order is confirmed?", "body": "**Nothing.** Entries are created on delivery (only with automated/perpetual valuation) and on invoice posting." },
    { "icon": "package", "title": "Q7. What changed for product types in Odoo 18?", "body": "Storable product is replaced by type **Goods** with a **Track Inventory** checkbox; a **Combo** type was added. Verify field labels in the instance." }
  ]
}
\`\`\`

\`\`\`visual-flow
{
  "title": "Q6 visualised — when does a sale hit the ledger?",
  "steps": [
    { "title": "Order confirmed", "icon": "cart", "impact": "No journal entry" },
    { "title": "Delivery validated", "icon": "truck", "impact": "Entry only with automated (perpetual) valuation" },
    { "title": "Invoice posted", "icon": "invoice", "impact": "Journal entry created" }
  ]
}
\`\`\`

\`\`\`visual-compare
{
  "title": "Q3 visualised — quotation template vs pricelist",
  "columns": ["Quotation template", "Pricelist"],
  "rows": [
    { "label": "Answers", "values": ["What is offered", "At what price"] },
    { "label": "Holds lines & optional products", "values": [true, false] },
    { "label": "Holds price rules & discounts", "values": [false, true] },
    { "label": "Validity, terms, signature/payment", "values": [true, false] }
  ]
}
\`\`\`

## Check your understanding

\`\`\`visual-check
{
  "question": "A user clicks Create Invoice and sees **\\"There is no invoiceable line\\"**. The product's policy is Delivered quantities. What do you check first?",
  "options": ["The customer's fiscal position", "Whether the delivery has been validated", "The quotation template", "The Lock Confirmed Sales setting"],
  "correct": 1,
  "explanation": "With Delivered quantities nothing is invoiceable until the delivery is validated — or use a down payment."
}
\`\`\`

## Key takeaways

- Most Sales issues come from product type, invoicing policy, pricelist rules or taxes.
- Practise partial delivery + invoicing and down payments until they feel natural.
- In interviews, always tie a feature to its accounting impact.
`;
