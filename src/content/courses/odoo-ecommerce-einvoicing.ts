import type { CourseContent } from "../types";

/**
 * Odoo eCommerce & E-Invoicing — application training course (online retail industry).
 * Follows the 16-point application training template:
 *  1 overview, 2 business problems, 3 process flow, 4 dependencies, 5 prerequisites & master data,
 *  6 configuration, 7 master data creation, 8 transactions, 9 automation, 10 reports,
 *  11 accounting & inventory impact, 12 integration, 13 troubleshooting, 14 practical assignments,
 *  15 interview questions, 16 assessment (course `assessment`).
 * Electronic invoicing is covered in depth in Module 3 (two lessons).
 */
export const odooEcommerceEinvoicing: CourseContent = {
  slug: "odoo-ecommerce-einvoicing",
  section: "odoo-apps",
  title: "Odoo eCommerce & E-Invoicing for Online Retail",
  summary:
    "Learn how an online retailer runs order-to-cash in Odoo: publishing products on the Website/eCommerce apps, taking online payments, generating invoices automatically, issuing structured electronic invoices (UBL, Peppol BIS Billing 3.0, Factur-X) and reconciling payment-provider payouts. Covers B2C tax-included pricing, EU OSS fiscal positions, B2B wholesale orders, returns and credit notes, and country e-invoicing localizations. Built around the fictional apparel web shop Urban Thread Online.",
  level: "intermediate",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 7,
  skills: [
    "eCommerce configuration",
    "Online payments",
    "Automatic invoicing",
    "Electronic invoicing (EDI)",
    "Peppol & e-invoice formats",
    "Online order-to-cash reconciliation",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1: eCommerce Foundations",
      lessons: [
        {
          slug: "ecommerce-overview-and-process-flow",
          title: "eCommerce Overview, Business Problems and Process Flow",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. Overview

An online retailer sells through a web shop instead of (or next to) a physical store. The customer serves themselves: they browse, add items to a cart, pay online and expect a confirmation email within seconds. Behind that experience the retailer still has to do everything a classic distributor does — reserve stock, pick and ship, invoice, collect cash and handle returns — but at **high volume, low value per order and with almost no human touch**. That is why automation and clean master data matter more in eCommerce than in almost any other industry.

### The eCommerce business model in one table

| Dimension | Typical online retailer |
|---|---|
| Customers | Mostly consumers (B2C), some trade customers (B2B wholesale) |
| Order value | Low (EUR 40–200 B2C), higher for B2B |
| Payment | Paid up front online (card, wallet) for B2C; invoice + payment terms for B2B |
| Pricing | Tax-included prices for consumers, tax-excluded for trade |
| Fulfilment | Ship from warehouse via carriers; returns are common (apparel: 15–30%) |
| Invoicing | One invoice per order, sent automatically; structured e-invoices for B2B/B2G and in mandate countries |
| Cash | Arrives as **payouts** from payment providers, net of fees, days after the order |

### Odoo apps involved

| App | Role in the online flow |
|---|---|
| **Website** | Site builder, pages, menus, domains, multi-website |
| **eCommerce** (website_sale) | Shop, product pages, cart, checkout, customer portal |
| **Sales** | Every web order is a sales order (quotation until payment/confirmation) |
| **Inventory** | Delivery orders, returns, stock valuation |
| **Invoicing / Accounting** | Invoices, credit notes, payments, taxes, e-invoicing, reconciliation |
| **Payment providers** | Stripe, PayPal, Adyen, Mollie, etc. (list varies by version and country) |
| **Delivery methods** | Fixed/rule-based shipping prices or carrier connectors |

Website and eCommerce are available in **Odoo Community**; some carrier connectors, marketplace connectors and the full accounting reports / bank reconciliation widget are **Enterprise** (verify in your training instance).

### Where invoicing and e-invoicing fit

A web order is not finished when the customer pays. The retailer must issue a legally valid **invoice**: for consumers usually a PDF in the portal or email, for business customers increasingly a **structured electronic invoice** (XML) transmitted over a network such as **Peppol**, and in some countries the invoice must even be **cleared by the tax authority** before it is valid. Module 3 of this course is entirely dedicated to e-invoicing.

### Our client: Urban Thread Online

| Attribute | Value |
|---|---|
| Company | Urban Thread Online BV (fictional) |
| Business | Direct-to-consumer apparel web shop (hoodies, tees, jeans) |
| Based in | Belgium; ships domestically and to EU customers |
| Currency | EUR; standard VAT 21% |
| Synthetic VAT number | BE0123456749 |
| Volume | ~1,800 web orders/month, average basket EUR 92; 6% of revenue from ~40 B2B boutiques |
| Payment | Stripe (cards/wallets) for B2C; wire transfer, 30 days for B2B |
| Pain today | Invoices exported one by one from the shop plugin; Stripe payouts matched in Excel; B2B customers in Belgium asking for Peppol invoices; EU VAT on cross-border sales handled manually |

## 2. Business problems solved

| Business problem | Odoo solution |
|---|---|
| Shop, stock and accounting in three systems | One database: web order = sales order = delivery = invoice |
| Invoices created manually | **Automatic Invoice** on confirmed online payment (verify location of setting) |
| Payout amounts never match orders | Payments posted per order; payout reconciled with fees in one step |
| Wrong VAT on cross-border B2C sales | EU OSS fiscal positions mapped by delivery country |
| B2B customers need net prices and tax IDs | Pricelists, fiscal positions, VAT field at checkout, B2B website or portal |
| Trade customers demand Peppol / structured invoices | UBL/CII formats on invoices; Peppol sending where supported |
| Abandoned carts lost forever | Abandoned cart list and automatic reminder emails |
| Returns not reflected in accounting | Return pickings + credit notes + refunds through the provider |

## 3. Process flow

\`\`\`text
 Customer browses shop ──► Adds to cart ──► Checkout (address, delivery method, tax ID for B2B)
        │
        ▼
 Online payment (Stripe/PayPal...) ──► Payment transaction "done"
        │                                     │
        ▼                                     ▼
 Sales Order confirmed               Payment posted: Outstanding Receipts ↑ / Receivable ↓
        │
        ├──► Delivery order (pick, pack, ship) ──► Stock ↓ (valuation entry if automated)
        │
        ▼
 Customer invoice (auto-generated, posted, reconciled with the payment)
        │
        ▼
 Send & Print: email/portal PDF  ──►  E-invoice (UBL/Peppol/Factur-X or local EDI) transmitted
        │
        ▼
 Provider payout hits the bank ──► Bank statement line reconciled (net amount + fees)
        │
        ▼
 Return? ──► Return receipt ──► Credit note ──► Refund (provider or bank)
\`\`\`

> **Consultant tip:** In the discovery workshop, take one real web order from the client's current shop and trace it on a whiteboard through every box above. Each box where they say "someone does that by hand" is a requirement.

## How this course is structured

| Lesson | Template points |
|---|---|
| 1. Overview (this lesson) | Overview, business problems, process flow |
| 2. Dependencies, prerequisites and configuration | Dependencies, master data prerequisites, settings |
| 3. Master data and online transactions | Master data creation, B2C/B2B/return walkthroughs |
| 4. E-invoicing concepts | Formats, networks, clearance vs post-audit, applicability |
| 5. E-invoicing and automation in Odoo | Partner formats, Send & Print, Peppol, localizations, checklists, automation |
| 6. Reports, accounting impact and integration | Dashboards, journal entries, payouts, connectors |
| 7. Troubleshooting, assignments and interview prep | Errors, tasks, interview questions |

## Key takeaways

- In Odoo every web order is a sales order; eCommerce is a front-end on top of Sales, Inventory and Invoicing.
- B2C and B2B customers need different prices, taxes and invoice formats — design both from day one.
- Cash from online sales arrives as provider payouts net of fees; reconciliation design is part of the eCommerce project.
- E-invoicing is moving from "nice to have" to legal requirement in many countries; always check current regulations.`,
          flashcards: [
            { term: "Web order", definition: "A sales order created from the eCommerce checkout; it stays a quotation until payment or confirmation." },
            { term: "Payment provider", definition: "Odoo record connecting to an online payment service (e.g. Stripe, PayPal) that captures payments at checkout." },
            { term: "Payout", definition: "The transfer from the payment provider to the merchant's bank, usually several orders netted of fees." },
            { term: "Tax-included price", definition: "A price that already contains VAT, standard for consumer (B2C) shops; Odoo extracts the tax from it." },
            { term: "OSS (One-Stop Shop)", definition: "EU scheme to declare VAT of the customer's country on cross-border B2C distance sales; supported in Odoo via OSS fiscal positions." },
            { term: "E-invoice", definition: "A structured, machine-readable invoice (e.g. UBL XML) that software can process automatically — a PDF is not an e-invoice." },
            { term: "Automatic Invoice", definition: "Setting that generates and posts the invoice when an online payment is confirmed (verify its location in your version)." },
          ],
          resources: [
            { title: "Odoo 17 eCommerce documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/websites/ecommerce.html" },
          ],
        },
        {
          slug: "ecommerce-dependencies-prerequisites-configuration",
          title: "Dependencies, Prerequisites and Configuration",
          durationMin: 50,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 4. Dependencies

Installing **eCommerce** automatically installs Website, Sales, Invoicing and the payment framework. Inventory and Delivery are separate decisions.

| Dependency | Why it is needed | Installed automatically? |
|---|---|---|
| Website | Hosts the shop pages | Yes |
| Sales | Web orders are sales orders; pricelists | Yes |
| Invoicing / Accounting | Invoices, taxes, payments | Invoicing yes; Accounting is Enterprise |
| Payment providers | Capture online payments | Framework yes; each provider configured |
| Inventory | Stock availability, deliveries, returns | Install it for physical goods |
| Delivery methods | Shipping cost at checkout | Enable in settings (installs delivery modules) |
| Shipping connectors | Live carrier rates and labels | Per carrier; many are Enterprise (verify) |
| Fiscal localization | Chart of accounts, VAT taxes, tax report | Chosen when Accounting/Invoicing is set up |
| EU OSS module | Cross-border B2C VAT mapping | Enabled from accounting settings (EU companies) |
| E-invoicing modules | UBL/CII formats, Peppol, local EDI | Depends on country and version (verify) |

> **Consultant tip:** Install and configure the fiscal localization **before** creating products. Products created first get default taxes that may later be wrong for tax-included B2C prices.

## 5. Prerequisites and master data

| Master data | What Urban Thread needs | Why it matters online |
|---|---|---|
| Company | Legal name, address, **VAT BE0123456749**, company registry, logo | Printed on invoices and embedded in e-invoices |
| Taxes | 21% **included in price** for B2C sales; 21% excluded; 0% intra-EU; OSS taxes | Tax-included display for consumers |
| Fiscal positions | B2B Domestic, Intra-EU B2B (reverse charge), EU OSS per country, Export | Correct tax by customer type and destination |
| Products | Published, with images, descriptions, internal reference, barcode, weight, HS code for exports | Shop catalogue, shipping rates, customs |
| Categories | eCommerce (public) categories for navigation; product categories for accounting/valuation | Two different category concepts |
| Variants | Attributes Size (XS–XXL) and Colour; one variant per SKU | Stock and barcodes per variant |
| Pricelists | Public (EUR), Wholesale (B2B), optional promotions | Prices by customer group |
| Customers | Portal users created at checkout; B2B partners with VAT, Peppol endpoint | Invoices, portal access, e-invoice routing |
| Payment terms | Immediate for B2C; 30 Days for B2B | Due dates and follow-up |
| Delivery methods | Belgium Standard EUR 5.00 net; EU Standard EUR 12.00 net; free over threshold | Shipping lines on orders |

### Two kinds of categories

- **eCommerce categories** (public categories) build the shop navigation: Men ▸ Hoodies, Women ▸ Tees.
- **Product categories** drive costing method, valuation and income/expense accounts.

A product needs both. Beginners often confuse them.

### B2C tax-included pricing

Consumers in the EU must see VAT-inclusive prices. The cleanest approach is to store sales prices tax-included and use a tax with **Included in Price** enabled:

| Item | Value |
|---|---|
| Canal Hoodie sales price | EUR 84.70 (tax-included) |
| Tax | 21% Included in Price |
| Odoo extracts | Base 70.00, VAT 14.70 |

When a B2B customer has a fiscal position mapping "21% included" to "21% excluded" (or to 0% intra-EU), Odoo removes the included tax first, so the net price stays 70.00. Test this in your instance with pricelists, because the result depends on how pricelist rules and fiscal positions combine.

### Cross-border B2C: EU OSS

Above the EU-wide distance-selling threshold (EUR 10,000 per year at the time of writing — verify current rules), VAT of the **customer's country** applies. In Odoo, enabling the OSS feature in accounting settings creates fiscal positions per EU country that map the domestic tax to the destination-country tax (verify the exact setting label in your version). Set fiscal positions to **Detect Automatically** by country so the checkout picks them up from the delivery address.

> **Consultant tip:** With tax-included prices, mapping 21% to e.g. 20% (France) may change the consumer price, because Odoo can recompute the gross price from the net. Decide with the client whether gross prices should be identical across the EU, and test it.

## 6. Configuration and settings

### Website ▸ Configuration ▸ Settings (eCommerce-related, Odoo 17)

| Setting (labels vary — verify) | Urban Thread choice | Reason |
|---|---|---|
| Customer account / sign in at checkout | Optional (guest checkout allowed) | Fewer abandoned carts |
| Product prices displayed | Tax included | B2C legal display |
| Pricelists | Multiple prices per product / advanced rules | Public vs wholesale |
| Delivery methods / shipping costs | Enabled | Charge shipping at checkout |
| Abandoned cart emails | Enabled, after 1 hour | Recover lost sales |
| Extra checkout step, wishlist, comparison | Optional | Marketing preference |

### Payment providers

Path: **Website ▸ Configuration ▸ Payment Providers** (also reachable from Invoicing/Accounting configuration).

1. Open **Stripe**, enter API keys in **Test** state first.
2. On the configuration tab choose the **Payment Journal** (e.g. a dedicated "Stripe" bank journal or the main bank journal — decide with finance).
3. Choose allowed payment methods, countries and currencies.
4. Publish the provider on the website; switch to **Enabled** only after test orders succeed.
5. Optionally keep **Wire Transfer** for B2B customers.

### Automatic invoicing

Enable **Automatic Invoice** so that confirmed online payments generate a posted invoice. In Odoo 17 this is found in the Sales settings under the invoicing section (verify in your training instance). It only invoices what is invoiceable: products with the **Ordered quantities** invoicing policy are invoiced immediately; **Delivered quantities** products are not until shipped.

### Accounting side

- Payment journals: confirm outstanding receipts account on the Stripe/bank journal.
- Bank fees expense account and a reconciliation model for provider fees (Enterprise widget).
- EU OSS: enable and refresh the tax mapping.
- E-invoicing: install/enable the formats needed (Lesson 5).

## Key takeaways

- eCommerce depends on Website, Sales, Invoicing; add Inventory and delivery for physical goods.
- Configure localization, taxes and fiscal positions before products and pricelists.
- B2C prices should be tax-included; B2B gets fiscal positions and pricelists.
- Payment providers start in Test state and need a payment journal decision.
- Automatic Invoice + Ordered quantities policy = invoice at payment time.`,
          resources: [
            { title: "Odoo 17 eCommerce documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/websites/ecommerce.html" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2: Master Data and Online Transactions",
      lessons: [
        {
          slug: "ecommerce-master-data-and-transactions",
          title: "Master Data Creation and Online Order Walkthroughs",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 7. Master data creation

### Products and variants

1. **Sales ▸ Products ▸ Products ▸ New**: name "Canal Hoodie", product type storable (17: "Storable Product"; 18 uses a "Track Inventory" option — verify).
2. Sales price **84.70**, customer tax **21% (included)**, cost 28.00, internal reference UTO-HOOD-CANAL.
3. **Attributes & Variants** tab: Size (S, M, L, XL) and Colour (Black, Sand) — 8 variants. Set barcodes per variant.
4. **Sales** tab: invoicing policy **Ordered quantities** (needed for automatic invoicing at payment).
5. **eCommerce** tab / website section: public categories Men ▸ Hoodies, alternative and accessory products, extra images.
6. **Inventory** tab: weight 0.65 kg (for carrier rates), HS code for non-EU shipments.
7. Click **Go to Website** and **Publish** (unpublished products are invisible to visitors).

For bulk loads, use the product import template and set the "Is Published" column — always test with 10 rows before 500.

### Pricelists

| Pricelist | Rule | Example (Canal Hoodie) |
|---|---|---|
| Public Pricelist (EUR) | Sales price | 84.70 incl. VAT |
| Wholesale B2B | 45% discount on sales price, min. qty 10 | 84.70 × 0.55 = 46.585 gross ⇒ 38.50 net after the B2B fiscal position removes 21% |
| Summer Sale | 20% off selected category, date range | 67.76 incl. VAT |

> **Consultant tip:** Write the expected net and gross price for 3 products × 3 pricelists × 3 customer types in a test sheet before configuring. Pricelist + included tax + fiscal position combinations are the number one source of "wrong price" tickets.

### Customers

- **B2C** customers are created by the checkout (guest or signed-in portal users). Do not pre-load consumers.
- **B2B** customers are created by the team: company, VAT number, invoice address, delivery addresses, pricelist **Wholesale B2B**, payment term **30 Days**, fiscal position, and e-invoicing settings on the Accounting tab (Lesson 5). Grant **portal access** so they can order on the website with their pricelist.

| B2B customer (fictional) | Country | Synthetic VAT | Fiscal position | Invoice format |
|---|---|---|---|---|
| Atelier Mosa BV | Belgium | BE0987654394 | B2B Domestic (21% excluded) | Peppol BIS Billing 3.0 |
| Boutique Nordlicht GmbH | Germany | DE123456789 | Intra-Community B2B (0%, reverse charge) | Peppol BIS Billing 3.0 / XRechnung (verify) |

Synthetic tax IDs may fail Odoo's VAT format/VIES check; in a training database disable the VIES check or use test numbers.

### Delivery methods

| Method | Rule | Price |
|---|---|---|
| Belgium Standard | Country Belgium | EUR 6.05 incl. (5.00 + VAT) |
| EU Standard | EU countries except Belgium | EUR 14.52 incl. (12.00 + VAT) |
| Free shipping | Order above EUR 100 | 0.00 |
| B2B Pallet | Manual / wholesale orders above EUR 500 free | 0.00 |

## 8. Transaction processing walkthroughs

### Scenario A — B2C order paid online (Belgium)

Customer Lea Martens orders **2 × Canal Hoodie (M, Black)** at 84.70 and Belgium Standard shipping.

| Line | Gross | Net | VAT 21% |
|---|---|---|---|
| 2 × Canal Hoodie | 169.40 | 140.00 | 29.40 |
| Shipping | 6.05 | 5.00 | 1.05 |
| **Total** | **175.45** | **145.00** | **30.45** |

1. Lea checks out as a guest, enters her address, selects Belgium Standard and pays with Stripe (test card in Test mode).
2. The payment transaction becomes **Done**; the quotation becomes **sales order S00412** (confirmed).
3. A payment of 175.45 is posted in the Stripe payment journal.
4. With Automatic Invoice enabled, invoice **INV/2025/00412** is created, posted and reconciled with the payment (status In Payment / Paid depending on outstanding-account setup).
5. A delivery order WH/OUT/00412 is created; the warehouse picks, packs and validates it.
6. Lea receives the order confirmation and the invoice (email / portal).

### Scenario B — B2B order with tax ID (Germany, intra-EU)

Boutique Nordlicht GmbH logs into the portal and orders **40 × Canal Hoodie**.

1. The Wholesale pricelist and the Intra-Community fiscal position apply automatically from the partner record.
2. Price per unit 38.50 net; total **1,540.00**, VAT 0% with reverse-charge mention; B2B Pallet shipping free.
3. Payment method: Wire Transfer (or "pay later" by payment term) — the order is confirmed by the sales team after checking credit.
4. Delivery is shipped; the invoice is created from the sales order (**Create Invoice**) based on the invoicing policy.
5. The invoice is sent with **Send & Print** as a Peppol BIS Billing 3.0 e-invoice to endpoint 9930:DE123456789 (scheme code — verify against the Peppol code list).
6. Payment arrives by bank transfer 30 days later and is reconciled with the bank statement line.

Domestic B2B variant: Atelier Mosa BV orders 20 hoodies ⇒ 770.00 net + 161.70 VAT = **931.70**.

### Scenario C — partial return

Lea returns **1 hoodie** within 30 days.

1. On the delivery order, click **Return**, quantity 1, validate the receipt into stock (or a returns/quality location).
2. On the invoice, click **Credit Note** (partial): 1 × 84.70 gross (70.00 net + 14.70 VAT).
3. Post the credit note; refund **84.70** — through Stripe if the provider supports refunds from Odoo (verify per provider) or manually via the provider dashboard, then register the outbound payment.
4. If the original invoice was sent as an e-invoice, send the credit note in the same format.

> **Consultant tip:** Agree the return policy in configuration terms: Is shipping refunded? Are returned items resaleable (stock) or damaged (scrap)? Who triggers the refund — warehouse or customer service? Each answer changes the steps above.

## Key takeaways

- Products must be published, priced tax-included and set to the right invoicing policy for automatic invoicing.
- B2B customers carry pricelist, payment term, fiscal position, VAT and e-invoice settings on the partner.
- Every online scenario is an ordinary sales order underneath — returns use standard return pickings and credit notes.`,
          resources: [
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
            { title: "Product import template", kind: "template", url: "/api/templates/products" },
            { title: "Odoo 17 eCommerce documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/websites/ecommerce.html" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3: Electronic Invoicing",
      lessons: [
        {
          slug: "einvoicing-concepts-formats-networks",
          title: "E-Invoicing Concepts: Formats, Networks and Regulatory Models",
          durationMin: 50,
          odooVersions: "Version-independent",
          scope: ["standard"],
          body: `## Why e-invoicing matters to an online retailer

Most of Urban Thread's 1,800 monthly orders are consumer sales, where a PDF invoice in the customer portal is enough in most countries. But its 40 wholesale boutiques run accounting software that wants to **import** invoices automatically, and governments across the world are making structured e-invoicing mandatory, first for B2G (selling to public bodies), then B2B, and in some countries even B2C. A consultant must be able to explain the concepts before touching configuration.

## E-invoice vs PDF invoice

| Aspect | PDF / paper invoice | Structured e-invoice |
|---|---|---|
| Format | Human-readable picture of an invoice | Machine-readable data (XML) following a standard |
| Processing at buyer | Retyped or scanned with OCR | Imported automatically into the buyer's ERP |
| Legal status | Valid in most countries for B2C | Mandatory in many countries for B2G/B2B (verify per country) |
| Errors | Typing / OCR errors | Validated against schema and business rules |
| Example | Invoice PDF emailed to customer | UBL 2.1 XML sent through Peppol |

An emailed PDF is an **electronic** invoice in the loose sense, but **not** a structured e-invoice. Regulations normally mean the structured kind.

## Structured formats

| Format | What it is | Where you meet it |
|---|---|---|
| **UBL 2.1** | OASIS Universal Business Language — XML syntax for invoices, orders, etc. | Peppol, many national formats |
| **EN 16931** | European standard defining the semantic data model of a core invoice (mandatory fields, business rules) | Basis of EU e-invoicing; supports UBL and CII syntaxes |
| **Peppol BIS Billing 3.0** | Peppol's specification (a CIUS of EN 16931) using UBL | Cross-border and domestic B2B/B2G in Peppol countries |
| **CII** | UN/CEFACT Cross Industry Invoice XML syntax | Factur-X / ZUGFeRD, some national formats |
| **Factur-X / ZUGFeRD** | Hybrid: PDF/A-3 with an embedded CII XML file | France and Germany; readable by humans and machines |
| **XRechnung** | German CIUS of EN 16931 (UBL or CII) | German public sector and B2B |
| **National formats** | FatturaPA (Italy), CFDI (Mexico), India e-invoice JSON, ZATCA UBL (Saudi Arabia) | Country clearance systems |

A short UBL invoice header looks like this (simplified, synthetic data):

\`\`\`xml
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ID>INV/2025/00977</cbc:ID>
  <cbc:IssueDate>2025-03-14</cbc:IssueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party><cbc:EndpointID schemeID="0208">0123456749</cbc:EndpointID></cac:Party>
  </cac:AccountingSupplierParty>
</Invoice>
\`\`\`

You do not write this XML in Odoo — Odoo generates it — but you must be able to read it when an e-invoice is rejected. Type code **380** = commercial invoice, **381** = credit note.

## Regulatory models: post-audit vs clearance

| Model | How it works | Examples (verify current status) |
|---|---|---|
| **Post-audit** | Seller issues and sends the invoice; tax authority audits later | Traditional EU model; Peppol-based B2B in several countries |
| **Clearance** | Invoice must be validated/registered by the tax authority (or its platform) in real time before it is valid or delivered | Italy (SdI), Mexico (CFDI via authorised providers), India (IRN via IRP for in-scope B2B), Saudi Arabia (ZATCA phase 2), Egypt (ETA) |
| **Real-time reporting** | Invoice data reported to the authority shortly after issuing, without blocking | Spain (SII for in-scope taxpayers), others |
| **Decentralised CTC** | Exchange via certified platforms/access points with data reported to the authority | Models announced in some EU countries — verify |

Timelines change frequently. Trainees must always check the **current official regulations** of the client's country; never quote a mandate date from memory. When you mention a date in a workshop, say "announced; we will verify the current status".

## Transmission networks: Peppol

**Peppol** is an international network for exchanging business documents using a "four-corner" model:

\`\`\`text
 Seller ERP (C1) ──► Seller's Access Point (C2) ══ Peppol network ══► Buyer's Access Point (C3) ──► Buyer ERP (C4)
                                   │
                         SML/SMP lookup: "where does participant 0208:0987654394 receive invoices?"
\`\`\`

| Term | Meaning |
|---|---|
| Access Point | Certified service provider that sends/receives Peppol documents for its customers |
| Participant ID / endpoint | Identifier of a company on the network: **scheme + identifier**, e.g. 0208:0123456749 (Belgian enterprise number) or a VAT-based scheme |
| EAS code | Electronic Address Scheme code (e.g. 0208, 9925, 9930 — check the official Peppol code list) |
| SMP / SML | Directory services telling the sender's access point where the receiver is registered and which documents it accepts |

If the buyer is not registered on Peppol for the document type, sending fails — a key troubleshooting point.

## Applicability: B2G, B2B, B2C

| Flow | E-invoicing typically | Urban Thread impact |
|---|---|---|
| **B2G** (to public bodies) | Mandatory in most EU countries (EU directive 2014/55) | Only if selling uniforms to public bodies |
| **B2B** | Mandatory or announced in a growing number of countries | 40 wholesale boutiques; Belgian B2B Peppol mandate announced — verify current status |
| **B2C** | Usually PDF/receipt; some clearance countries require reporting of B2C/simplified invoices too | Consumer invoices stay PDF in Belgium (verify) |

### India note

For academy projects using INR companies: Indian GST e-invoicing generates an **IRN** (Invoice Reference Number) and signed **QR code** through the Invoice Registration Portal for **B2B** invoices (and certain other supplies) of taxpayers above the notified aggregate turnover threshold; it generally does **not** apply to B2C invoices, although separate B2C dynamic QR rules exist for some large taxpayers. Thresholds and scope have changed several times — **verify current GST notifications**.

## Archiving

Structured invoices must be archived for the legal retention period (often 7–10 years, country-specific) in a way that keeps them readable, authentic and unaltered. In Odoo, generated XML files are stored as attachments on the invoice; agree with the client whether that is sufficient or whether an external archive is required.

> **Consultant tip:** In e-invoicing workshops always ask three questions: Which countries do you invoice from and to? Which customer types (government, business, consumer)? Which customers have already asked for Peppol or a specific XML format? The answers decide the scope before any technical discussion.

## Key takeaways

- A PDF is not a structured e-invoice; EN 16931 defines the data, UBL/CII are syntaxes, Peppol BIS 3.0 is a specification plus a network.
- Clearance countries validate invoices before they are valid; post-audit countries audit later.
- Peppol uses access points and participant IDs (scheme + identifier).
- Online retailers mostly issue B2C invoices, but B2B/wholesale and mandate countries require e-invoicing.
- Mandate dates change — verify the current regulation every time.`,
          flashcards: [
            { term: "EN 16931", definition: "European standard defining the semantic data model and business rules of a core electronic invoice." },
            { term: "UBL 2.1", definition: "OASIS XML syntax for business documents, used by Peppol BIS Billing 3.0." },
            { term: "Factur-X / ZUGFeRD", definition: "Hybrid invoice: a PDF/A-3 with an embedded CII XML, readable by humans and machines." },
            { term: "Clearance model", definition: "E-invoicing model where the tax authority validates the invoice in real time before it is legally valid." },
            { term: "Peppol Access Point", definition: "Certified provider that sends and receives Peppol documents on behalf of companies." },
            { term: "Peppol participant ID", definition: "Network address of a company: scheme code + identifier, e.g. 0208:0123456749." },
          ],
          resources: [
            { title: "Odoo 17 Electronic invoicing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting/customer_invoices/electronic_invoicing.html" },
          ],
        },
        {
          slug: "einvoicing-and-automation-in-odoo",
          title: "E-Invoicing and Invoice Automation in Odoo",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## How Odoo handles e-invoicing

Odoo separates two things:

1. **Generating** a structured file (UBL, CII/Factur-X, a national XML/JSON) from a posted invoice.
2. **Transmitting** it — by email attachment, through Peppol, or to a government platform via a country EDI localization.

Exact menus, labels and editions change between 17.0, 17.x (Odoo Online) and 18.0. Everything below marked *(verify in your training instance)* must be checked before you demonstrate it to a client.

## Generating structured formats

- Odoo's UBL/CII module (account_edi_ubl_cii) can produce formats such as **Peppol BIS Billing 3.0**, **XRechnung**, **Factur-X (CII)** and some national UBL variants *(verify the list for your version)*.
- Odoo can embed a **Factur-X** XML in the invoice PDF and/or attach a UBL XML to the invoice *(verify when this happens by default in your version)*.
- Vendor bills received as UBL/Factur-X can be **imported** to create draft bills automatically — useful for the retailer's own purchases.

### Partner-level settings

On the customer form, **Accounting tab**, Odoo 17 shows an e-invoicing section where you choose the customer's **format** (e.g. Peppol BIS Billing 3.0, XRechnung, Factur-X) and the **Peppol e-address**: scheme (EAS) and endpoint *(verify exact labels per version; Odoo 18 renames/reorganises some of these fields)*.

| Field (approximate label) | Atelier Mosa BV | Boutique Nordlicht GmbH |
|---|---|---|
| E-invoice format | Peppol BIS Billing 3.0 | Peppol BIS Billing 3.0 or XRechnung (customer's choice) |
| Peppol EAS (scheme) | 0208 | 9930 (verify) |
| Peppol endpoint | 0987654394 | DE123456789 |
| VAT | BE0987654394 | DE123456789 |

## The Send & Print wizard

When you click **Send & Print** on a posted invoice (Odoo 17), the wizard proposes options such as:

| Option | Effect |
|---|---|
| Email | Sends the PDF (plus attachments) using the invoice email template |
| Download / Print | Produces the PDF |
| Generate/attach XML format | Adds the partner's structured format (e.g. UBL) to the email/attachments *(label verify)* |
| Send via Peppol | Transmits the e-invoice through Odoo's Peppol access point when the company is registered and the partner is reachable *(verify)* |
| Country EDI | Sends to the government platform where a localization requires it *(verify)* |

The wizard works in batch: select 200 invoices in list view ▸ Send & Print to process them together (large batches may be processed in the background — verify).

## Odoo as a Peppol access point

From Odoo 17.x, Odoo offers a built-in **Peppol** integration (account_peppol) in which Odoo acts as the access point for registered companies in certain countries; Odoo 18 expanded the country list and the user experience *(verify the country list, edition and pricing in your version)*. Typical steps:

1. **Accounting/Invoicing ▸ Configuration ▸ Settings**: find the Peppol section *(verify)*.
2. Enter the company's Peppol EAS and endpoint (Urban Thread: 0208:0123456749), contact email and phone; accept terms.
3. Complete verification (e.g. SMS code) and wait for registration to become active.
4. On customers, check that their participant ID is valid/reachable (Odoo can verify registration on the network — verify).
5. Use **Send & Print ▸ by Peppol**; follow the status on the invoice (e.g. processing, done, error).
6. Incoming Peppol vendor bills arrive in the purchase journal as drafts.

If the client already uses another access point provider, integrate via that provider (third-party module or middleware) instead.

## Country EDI localizations

Clearance countries need dedicated l10n modules that sign and send invoices to the authority and store the response (UUID, stamp, QR code). Examples:

| Country | Platform / format | Odoo approach (verify edition & version) |
|---|---|---|
| Italy | SdI, FatturaPA XML | Italian EDI localization |
| Mexico | CFDI via authorised provider (PAC) | Mexican EDI localization |
| India | IRN + QR via IRP (in-scope B2B) | Indian e-invoice localization; verify current GST notifications |
| Saudi Arabia | ZATCA phase 2 (UBL-based) | Saudi EDI localization |
| Spain | SII / regional TicketBAI / announced Verifactu | Spanish localizations — verify status |
| Egypt | ETA e-invoice | Egyptian EDI localization |

Availability, edition (many are Enterprise), certificates and behaviour vary by version. Always read the localization page of the official documentation for the exact version.

## E-invoicing readiness checklist

- [ ] Countries, customer types and in-scope flows identified; current regulation checked and documented with source.
- [ ] Required formats per customer group agreed (PDF only / Peppol BIS 3.0 / XRechnung / national).
- [ ] Odoo version and edition confirmed to support the formats and transmission (tested in training instance).
- [ ] Company registered on Peppol (or other access point) and test exchange done.
- [ ] Partner e-invoicing fields filled for all B2B customers.
- [ ] Credit notes tested in the same format.
- [ ] Rejection handling procedure and owner defined.
- [ ] Archiving and retention approach agreed.

## Data-quality checklist

| Data | Rule | Typical rejection if wrong |
|---|---|---|
| Company VAT / GSTIN | Present, valid format, matches registration | Seller identification error |
| Partner tax ID | Mandatory for B2B (EU VAT incl. country prefix) | Buyer VAT missing |
| Peppol endpoint | Scheme + ID valid and registered | Receiver not found |
| Addresses | Street, city, ZIP, **country** filled for seller and buyer | Schema/business-rule error |
| Units of measure | Mapped to UN/ECE codes (Units ▸ C62 "one") | Invalid unit code |
| Tax codes/categories | Each tax maps to a valid VAT category (S, Z, E, AE reverse charge, K intra-EU…) with exemption reason where needed | Tax category / exemption reason missing |
| Bank account | IBAN on company for payment means | Payment information missing |
| Invoice reference | Buyer reference/PO number where the customer requires it | Rejected by buyer |

## 9. Automation in the online order-to-cash flow

| Automation | How | Scope |
|---|---|---|
| Automatic invoice on confirmed online payment | **Automatic Invoice** setting (Sales settings in 17 — verify) + Ordered quantities policy | Standard (configuration) |
| Invoice email | The auto-generated invoice is emailed with the invoice template; customers also see it in the **portal** | Standard |
| Order confirmation, shipping emails | Email templates on sales order / delivery | Standard |
| E-invoice sending | Send & Print with Peppol/EDI option, batch from list view | Standard / localization / verify |
| Abandoned cart reminder | Website setting, delay in hours | Standard |
| Scheduled follow-up of unpaid B2B invoices | Payment follow-ups | Enterprise |
| Custom triggers (e.g. send Peppol automatically when posted) | Automation rules (Studio/Enterprise) or custom module | Customization |

> **Consultant tip:** Automatic invoicing creates a PDF and email, not a Peppol transmission. If B2B web orders must go out by Peppol automatically, design a rule or a daily batch through Send & Print and test it — do not assume.

## Key takeaways

- Odoo generates UBL/CII formats and can transmit via its own Peppol access point (version/country dependent) or country EDI modules.
- Partner Accounting tab holds the format and Peppol address — wrong data here causes most failures.
- Clean master data (VAT, endpoints, addresses, units, tax categories) is the real e-invoicing project.
- Automatic Invoice covers B2C volume; B2B e-invoice sending needs explicit design.`,
          resources: [
            { title: "Odoo 17 Electronic invoicing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/finance/accounting/customer_invoices/electronic_invoicing.html" },
            { title: "Customer import template", kind: "template", url: "/api/templates/customers" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 4: Reporting, Accounting Impact and Go-Live Readiness",
      lessons: [
        {
          slug: "ecommerce-reports-accounting-integration",
          title: "Reports, Accounting & Inventory Impact and Integrations",
          durationMin: 50,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "enterprise", "third-party"],
          body: `## 10. Reports and dashboards

| Report | Where (Odoo 17 — verify) | Question it answers |
|---|---|---|
| eCommerce dashboard / analytics | Website ▸ Reporting (eCommerce) | Online revenue, orders, average basket, conversion |
| Website visitors | Website ▸ Reporting / Visitors | Traffic, pages viewed, visitor to customer |
| Sales analysis | Sales ▸ Reporting ▸ Sales, filter by website/sales team | Revenue by product, category, country, pricelist |
| Abandoned carts | Website ▸ eCommerce ▸ Abandoned Carts (menu label verify) | Carts with items but no payment; recovery emails |
| Invoice analysis | Invoicing ▸ Reporting ▸ Invoice Analysis | Invoiced revenue, credit notes, margin |
| Aged receivable | Accounting ▸ Reporting (Enterprise) | Unpaid B2B invoices |
| Tax report / EC sales list / OSS | Accounting ▸ Reporting (Enterprise, localization) | VAT, intra-EU and OSS declarations |
| Inventory valuation | Inventory ▸ Reporting | Stock value after deliveries and returns |

### KPIs for Urban Thread

| KPI | Formula | Target |
|---|---|---|
| Conversion rate | Orders ÷ sessions | 2.0% |
| Average order value | Online revenue ÷ orders | EUR 92 |
| Cart abandonment rate | Abandoned carts ÷ carts created | < 70% |
| Return rate | Credit-noted qty ÷ invoiced qty | < 20% |
| Payment fee ratio | Provider fees ÷ online revenue | < 2% |
| E-invoice rejection rate | Rejected ÷ sent e-invoices | < 1% |

## 11. Accounting and inventory impact

We follow Scenario A (Lea, total 175.45) and assume outstanding accounts on the Stripe journal and automated (perpetual) inventory valuation at average cost 28.00.

### Step 1 — Online payment confirmed

| Account | Debit | Credit |
|---|---|---|
| Outstanding Receipts (Stripe journal) | 175.45 | |
| Accounts Receivable (Lea Martens) | | 175.45 |

Until the invoice exists, this is an outstanding credit on the customer.

### Step 2 — Automatic invoice posted and reconciled with the payment

| Account | Debit | Credit |
|---|---|---|
| Accounts Receivable | 175.45 | |
| Product Sales | | 140.00 |
| Shipping Revenue | | 5.00 |
| VAT Payable 21% | | 30.45 |

Receivable is now zero for Lea (invoice matched with payment).

### Step 3 — Delivery validated (2 units × 28.00)

| Account | Debit | Credit |
|---|---|---|
| Stock Output / interim (Anglo-Saxon) or COGS (continental) | 56.00 | |
| Stock Valuation | | 56.00 |

With Anglo-Saxon accounting, the invoice additionally posts Dr COGS 56.00 / Cr Stock Output 56.00. Whether Anglo-Saxon is active depends on the localization and settings — verify for the client's country.

### Step 4 — Stripe payout reaches the bank

Stripe fee for this order: 1.5% + 0.25 = **2.88**; net **172.57**. In reality one payout covers many orders; the logic is the same.

Bank statement line imported (before reconciliation):

| Account | Debit | Credit |
|---|---|---|
| Bank | 172.57 | |
| Bank Suspense | | 172.57 |

Reconciliation (the suspense line is replaced):

| Account | Debit | Credit |
|---|---|---|
| Bank Suspense | 172.57 | |
| Bank Fees (expense) | 2.88 | |
| Outstanding Receipts | | 175.45 |

Invoice status moves to **Paid**. The bank reconciliation widget and reconciliation models are Enterprise; in Community the matching is more manual.

> **Consultant tip:** Some providers report fees per transaction, others per payout. Decide early: one Stripe journal reconciled with the provider's payout report (fees per order), or the main bank journal with a fee reconciliation model. Both work; mixing them does not.

### Partial return (Scenario C)

| Document | Debit | Credit |
|---|---|---|
| Return receipt (1 × 28.00) | Stock Valuation 28.00 | Stock Output / COGS 28.00 |
| Credit note | Product Sales 70.00; VAT Payable 14.70 | Accounts Receivable 84.70 |
| Refund payment | Accounts Receivable 84.70 | Outstanding Payments 84.70 |

### B2B intra-EU invoice (Boutique Nordlicht)

| Account | Debit | Credit |
|---|---|---|
| Accounts Receivable | 1,540.00 | |
| Product Sales (intra-EU) | | 1,540.00 |

No VAT; the tax grid reports the amount as an intra-Community supply (and EC sales list) through the 0% intra-EU tax.

## 12. Integration

| Integration | Options | Notes |
|---|---|---|
| Payment providers | Native providers (Stripe, PayPal, Adyen, Mollie, Razorpay…) | List varies by version/country; test webhooks |
| Shipping carriers | Native connectors (e.g. DHL, FedEx, UPS, bpost, Sendcloud — verify) | Many are Enterprise; need carrier accounts |
| Marketplaces | Amazon Connector (Enterprise — verify); eBay connector availability changed across versions (verify) | Orders imported as sales orders; fees and payouts need reconciliation design |
| Other storefronts | Shopify, WooCommerce, etc. via third-party apps or middleware | Third-party; check maintenance and version support |
| E-invoicing | Odoo Peppol, country EDI modules, or external access point via API | Choose one transmission channel per flow |
| Middleware / iPaaS | Make, Zapier, n8n, custom XML-RPC/JSON-RPC integration | Use Odoo's external API; never write directly to the database |

> **Consultant tip:** For every integration write down: system of record for customers, products, prices and stock; direction and frequency of sync; who owns errors. Marketplaces especially create duplicate customers and unmatched payouts if this is not agreed.

## Key takeaways

- eCommerce analytics, sales analysis, invoice analysis and abandoned carts cover the operational view; full financial and tax reports are Enterprise.
- Online payment ⇒ Outstanding Receipts; payout ⇒ Bank + Fees vs Outstanding Receipts.
- Returns create a stock receipt, a credit note and a refund — three entries.
- Marketplace and shipping connectors are edition- and version-sensitive; always verify.`,
          resources: [
            { title: "Odoo 17 eCommerce documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/websites/ecommerce.html" },
          ],
        },
        {
          slug: "ecommerce-troubleshooting-and-interview",
          title: "Troubleshooting, Practical Assignments and Interview Questions",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "customization"],
          body: `## 13. Common errors and troubleshooting

| Symptom / error | Likely cause | Fix |
|---|---|---|
| E-invoice rejected by receiver or network | Schema/business-rule violation (missing buyer VAT, address, tax category, unit code) | Read the rejection message; fix partner/tax/UoM data; reset and resend; send credit note if a corrected invoice is required |
| "Receiver not found" / Peppol send unavailable | Missing or wrong Peppol endpoint, customer not registered on Peppol, company not registered | Verify scheme + ID; check registration; fall back to email/PDF if agreed |
| Missing tax ID warning on B2B invoice | VAT not entered at checkout or on partner | Make VAT mandatory for B2B partners; data clean-up before go-live |
| Wrong tax on tax-included price | Tax not marked Included in Price, or fiscal position maps to a tax with a different price-included setting | Review the tax and fiscal position mapping; test gross/net per customer type |
| Wholesale price 21% lower than expected | Pricelist price treated as tax-included and stripped by the B2B fiscal position | Define wholesale prices consistently (discount on gross list price or verified fixed prices); retest |
| Invoice not auto-generated after payment | Automatic Invoice disabled; products set to Delivered quantities; payment not "Done" (e.g. pending) | Enable setting; adjust invoicing policy; check transaction state and provider webhook |
| Payment not reconciled / invoice stays In Payment | Payout not imported or not matched; fees not handled | Import statement; reconcile payout with fees (reconciliation model in Enterprise) |
| Order stuck as quotation after payment | Webhook from provider not reaching Odoo (URL, firewall, test vs live keys) | Check provider logs and webhook configuration |
| OSS VAT not applied to EU consumer | Fiscal position not auto-detected (country, VAT required flag) | Check Detect Automatically, countries and OSS mapping refresh |
| Product invisible on shop | Not published, not saleable, website restriction | Publish; check "Can be Sold" and website field |

## 14. Practical assignments (task list)

Complete in your training instance with Urban Thread data:

- [ ] Install eCommerce and Inventory; confirm the Belgian (or your country's) localization.
- [ ] Create taxes 21% included and 21% excluded; fiscal positions B2B Domestic and Intra-EU B2B; enable OSS.
- [ ] Create Canal Hoodie with 8 variants, publish it, set Ordered quantities policy.
- [ ] Create Public, Wholesale B2B and Summer Sale pricelists; prove the expected prices in a test sheet.
- [ ] Configure Stripe in Test state and Wire Transfer; enable Automatic Invoice.
- [ ] Place Scenario A as a guest; verify sales order, payment, invoice, delivery.
- [ ] Create Atelier Mosa and Boutique Nordlicht with e-invoicing fields; process Scenario B.
- [ ] Generate a UBL/Peppol XML and inspect seller, buyer, tax category and totals.
- [ ] Process Scenario C (partial return, credit note, refund).
- [ ] Import a payout statement line and reconcile with fees; write the journal entries.
- [ ] Review eCommerce dashboard, abandoned carts and invoice analysis.

## 15. Interview questions with model answers

**Q1. How does an eCommerce order become an invoice in Odoo?**
*Model answer:* Checkout creates a quotation; when the online payment is confirmed it becomes a sales order. With Automatic Invoice enabled and Ordered quantities policy, Odoo creates, posts and reconciles the invoice with the payment and emails it.

**Q2. Why use tax-included prices and how do B2B customers get net prices?**
*Model answer:* Consumers must see gross prices, so product prices use an included tax. B2B partners get a fiscal position mapping it to an excluded or 0% tax and a wholesale pricelist; I test the combinations because pricelist and fiscal position interact.

**Q3. What is the difference between a PDF invoice and an e-invoice?**
*Model answer:* A PDF is a picture for humans; an e-invoice is structured data such as UBL following EN 16931/Peppol BIS 3.0 that the buyer's system imports automatically and that regulators can mandate.

**Q4. Explain Peppol in two minutes.**
*Model answer:* A four-corner network: seller and buyer each use an access point; participants are identified by scheme + ID; the sender's access point looks up the receiver in SMP/SML. Odoo can act as access point for supported countries/versions, or we integrate an external one.

**Q5. Clearance vs post-audit?**
*Model answer:* Clearance means the authority validates the invoice in real time before it is valid (Italy SdI, Mexico CFDI, India IRN for in-scope B2B); post-audit means invoices are exchanged freely and audited later. I always verify current regulations.

**Q6. Which master data causes most e-invoice rejections?**
*Model answer:* Buyer/seller VAT, Peppol endpoint, complete addresses with country, unit of measure codes and tax categories/exemption reasons.

**Q7. How do you reconcile Stripe payouts?**
*Model answer:* Each payment posts to Outstanding Receipts; the payout statement line is matched with those payments and the difference booked to bank fees, ideally with a reconciliation model (Enterprise).

**Q8. A client wants every B2B web order sent by Peppol automatically. Standard?**
*Model answer:* Automatic Invoice sends email, not necessarily Peppol. Options: batch Send & Print daily (standard), an automation rule (Studio/Enterprise) or a small custom module — classified and estimated accordingly, after verifying the version's behaviour.

**Q9. How is VAT handled for EU consumers abroad?**
*Model answer:* Above the EU distance-selling threshold, destination VAT applies via OSS; Odoo's OSS feature creates fiscal positions per country, auto-detected from the delivery address.

**Q10. What happens in accounting on a partial return?**
*Model answer:* Return receipt reverses stock valuation; a credit note reverses revenue and VAT; the refund payment clears the receivable.

> **Consultant tip:** In interviews, answer with business reason + Odoo mechanism + verification step. Saying "I would verify that in the version's documentation" is a strength, not a weakness, for e-invoicing topics.

## Key takeaways

- Most eCommerce tickets come from prices/taxes, automatic invoicing conditions, webhooks and payout reconciliation.
- Most e-invoicing tickets come from master data and network registration.
- Practise all three scenarios end-to-end and be able to draw their entries.`,
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-ecommerce-einvoicing-final",
    title: "Odoo eCommerce & E-Invoicing — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which conditions are needed for Odoo to generate an invoice automatically when a web order is paid online? (Select all that apply)",
        kind: "multiple",
        options: [
          "The Automatic Invoice setting is enabled",
          "Products use the Ordered quantities invoicing policy",
          "The payment transaction reaches the Done state",
          "The customer has a Peppol endpoint",
        ],
        correct: [0, 1, 2],
        explanation: "Automatic invoicing needs the setting, invoiceable lines (Ordered quantities) and a confirmed payment. A Peppol endpoint is only relevant for e-invoice transmission.",
      },
      {
        prompt: "A hoodie costs EUR 84.70 with a 21% tax marked Included in Price. What is the net (untaxed) amount?",
        kind: "single",
        options: ["66.91", "70.00", "84.70", "102.49"],
        correct: [1],
        explanation: "84.70 / 1.21 = 70.00 net and 14.70 VAT.",
      },
      {
        prompt: "An invoice PDF sent by email is a structured e-invoice in the sense of EN 16931.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "A plain PDF is not machine-readable structured data. Structured e-invoices use formats like UBL or CII (Factur-X embeds CII XML inside a PDF/A-3).",
      },
      {
        prompt: "Which statement best describes the clearance model?",
        kind: "single",
        options: [
          "The buyer approves the invoice before payment",
          "The tax authority (or its platform) validates the invoice in real time before it is valid",
          "Invoices are archived for 10 years",
          "The seller sends invoices only by Peppol",
        ],
        correct: [1],
        explanation: "In clearance countries (e.g. Italy SdI, Mexico CFDI) the authority validates the invoice before it is legally valid; post-audit models audit later.",
      },
      {
        prompt: "Which items identify a company on the Peppol network? (Select all that apply)",
        kind: "multiple",
        options: ["A scheme (EAS) code", "An identifier such as an enterprise or VAT number", "The company logo", "The invoice journal code"],
        correct: [0, 1],
        explanation: "A Peppol participant ID is scheme + identifier, e.g. 0208:0123456749.",
      },
      {
        prompt: "After an online Stripe payment of 175.45 is confirmed (outstanding accounts configured), which entry is posted?",
        kind: "single",
        options: [
          "Dr Bank 175.45 / Cr Sales 175.45",
          "Dr Outstanding Receipts 175.45 / Cr Accounts Receivable 175.45",
          "Dr Bank Fees 2.88 / Cr Bank 2.88",
          "Dr Accounts Receivable 175.45 / Cr Outstanding Receipts 175.45",
        ],
        correct: [1],
        explanation: "The payment moves the amount to Outstanding Receipts; the bank is only hit when the payout statement line is reconciled.",
      },
      {
        prompt: "A Stripe payout of 172.57 settles a 175.45 order. How is the 2.88 difference typically booked during reconciliation?",
        kind: "single",
        options: ["As additional revenue", "As bank/payment fees expense", "As VAT payable", "It is left in the suspense account"],
        correct: [1],
        explanation: "Provider fees are an expense; Dr Bank 172.57, Dr Bank Fees 2.88, Cr Outstanding Receipts 175.45.",
      },
      {
        prompt: "Which data problems commonly cause e-invoice rejections? (Select all that apply)",
        kind: "multiple",
        options: [
          "Missing buyer VAT number on a B2B invoice",
          "Wrong or unregistered Peppol endpoint",
          "Missing country in the buyer's address",
          "A product image that is too large",
        ],
        correct: [0, 1, 2],
        explanation: "Tax IDs, endpoints, addresses, unit codes and tax categories drive rejections; product images are irrelevant to the XML.",
      },
      {
        prompt: "Indian GST e-invoicing (IRN/QR) generally applies to B2C invoices of all taxpayers.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "IRN e-invoicing targets in-scope B2B (and certain other) supplies of taxpayers above notified turnover thresholds; it generally does not apply to B2C. Always verify current GST notifications.",
      },
      {
        prompt: "In Odoo 17, where do you typically set a B2B customer's e-invoice format and Peppol address?",
        kind: "single",
        options: [
          "On the product form, Sales tab",
          "On the customer (contact) form, Accounting tab",
          "In the website theme editor",
          "On the delivery method",
        ],
        correct: [1],
        explanation: "The e-invoicing format and Peppol EAS/endpoint are partner settings on the Accounting tab (exact labels vary by version — verify).",
      },
      {
        prompt: "A French consumer buys from Belgian Urban Thread above the EU distance-selling threshold. What should apply French VAT at checkout?",
        kind: "single",
        options: [
          "A manual change of the tax on every order",
          "An OSS fiscal position auto-detected from the delivery country",
          "The Wholesale pricelist",
          "The Peppol access point",
        ],
        correct: [1],
        explanation: "Odoo's OSS feature creates fiscal positions per EU country that map domestic tax to destination tax; auto-detection applies them.",
      },
      {
        prompt: "Which documents does a partial customer return of a paid web order normally produce? (Select all that apply)",
        kind: "multiple",
        options: ["A return receipt (stock in)", "A credit note", "A refund payment", "A new purchase order"],
        correct: [0, 1, 2],
        explanation: "The return picking restores stock, the credit note reverses revenue and VAT, and the refund clears the receivable. No purchase order is involved.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-ecommerce-einvoicing-assignment-1",
      title: "Configure Urban Thread Online's Web Shop and Online Order-to-Cash",
      instructions: `## Brief

Urban Thread Online BV is moving its web shop to Odoo. Configure the shop and prove the online order-to-cash flow end-to-end in your training instance.

## Tasks

1. Install Website, eCommerce and Inventory; confirm the localization, 21% included/excluded taxes, B2B Domestic and Intra-EU fiscal positions, and OSS.
2. Create 3 products with variants (one hoodie with 8 variants), public categories and images; publish them.
3. Create Public, Wholesale B2B (45% discount) and Summer Sale pricelists; document expected net/gross prices in a test sheet.
4. Configure Stripe (Test state) with a payment journal decision, Wire Transfer for B2B, delivery methods and abandoned cart emails.
5. Enable Automatic Invoice and process Scenario A (B2C, 175.45) and a French consumer order (OSS).
6. Import a payout statement line and reconcile it with fees.

## Deliverables

- Configuration workbook (setting, value, business reason, verified in version X).
- Price test sheet with expected vs actual results.
- Screenshots of the sales order, invoice, delivery and payment.
- Journal entry table for payment, invoice, delivery and payout reconciliation.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Configuration correct and justified | 30% |
| Prices and taxes correct for B2C, OSS and B2B | 25% |
| End-to-end order with automatic invoice | 20% |
| Payout reconciliation and journal entries explained | 15% |
| Documentation quality | 10% |`,
    },
    {
      slug: "odoo-ecommerce-einvoicing-assignment-2",
      title: "E-Invoicing Readiness for B2B Wholesale Customers",
      instructions: `## Brief

Urban Thread's Belgian and German wholesale boutiques require structured e-invoices. Assess readiness and implement e-invoicing for B2B orders in your training instance.

## Tasks

1. Research and document the current e-invoicing regulation for Belgium and Germany (B2B and B2G) with official sources and dates checked; mark anything unconfirmed as "verify".
2. Complete the e-invoicing readiness checklist and the data-quality checklist from Lesson 5 for the company and 5 B2B customers.
3. Configure partner e-invoicing format and Peppol address for Atelier Mosa BV and Boutique Nordlicht GmbH.
4. Process Scenario B (40 hoodies, 1,540.00, intra-EU) and the domestic Atelier Mosa order (931.70); generate the UBL/Peppol XML.
5. Annotate the XML: supplier, customer, endpoint IDs, tax category, totals, invoice type code.
6. Issue a partial credit note and generate it in the same format.
7. If your version and country support Odoo's Peppol access point, document the registration steps (do not register a real company); otherwise describe the alternative (external access point).

## Deliverables

- Regulation summary (1 page) with sources and verification date.
- Completed readiness and data-quality checklists.
- Annotated XML of one invoice and one credit note.
- Rejection-handling procedure (who, what, how fast).

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Regulatory research accurate, sourced and caveated | 20% |
| Master data complete and checklists evidenced | 25% |
| Correct invoice/credit note XML generated and explained | 30% |
| Transmission approach and rejection procedure | 15% |
| Documentation quality | 10% |`,
    },
  ],
};
