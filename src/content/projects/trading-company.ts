import type { ProjectContent } from "../types";

/**
 * Project A — Trading company implementation.
 *
 * Fictional company and synthetic data only. Master data rows use the exact
 * column keys of the portal's import templates (templateKey).
 */
export const tradingProject: ProjectContent = {
  slug: "trading-company-implementation",
  code: "A",
  configScenario: "trading-company",
  title: "Bluewave Trading LLC — Odoo implementation for a two-warehouse distributor",
  industry: "Wholesale distribution (kitchen appliances & hardware)",
  level: "beginner",
  odooVersion: "Odoo 17.0",
  summary:
    "Implement Odoo 17.0 Sales, Purchase, Inventory, CRM and Accounting for a kitchen-appliance and hardware distributor with two warehouses, replacing spreadsheets, email ordering and a legacy desktop accounting package.",
  company: {
    name: "Bluewave Trading LLC",
    profile: `## Bluewave Trading LLC (fictional)

Bluewave Trading LLC distributes **small and large kitchen appliances** and **kitchen hardware** (hinges, handles, drawer slides, sinks) to independent retailers, kitchen fitters and hotel groups across Texas and neighbouring states.

| Attribute | Value |
|---|---|
| Founded | 2012 |
| Annual revenue | ~ USD 18 million |
| Customers | ~450 active B2B accounts (retailers, kitchen fitters, hospitality) |
| Vendors | ~35 manufacturers and importers (US and Asia) |
| SKUs | ~2,200 stocked items, ~60 serial-tracked large appliances |
| Warehouses | **WH** — Dallas main warehouse (receiving, bulk storage, shipping); **WH2** — Houston branch warehouse (fast movers, local delivery) |
| Payment terms | Customers mostly 30 days; key accounts 45 days; vendors 30–60 days |

### Organisation
- **Sales** (8): 2 inside sales, 5 field reps, 1 sales manager
- **Purchasing** (3): 2 buyers, 1 purchasing manager
- **Warehouse** (14): Dallas 10, Houston 4
- **Finance** (4): controller, AR clerk, AP clerk, accountant
- **Management** (3): CEO, COO, IT/operations lead

### Why now?
Growth from one to two warehouses exposed the limits of spreadsheets: stock is not visible across sites, customers are promised goods that are not available, and month-end closing takes 12 working days.`,
    locations: ["Dallas, TX (Head office & WH — main warehouse)", "Houston, TX (WH2 — branch warehouse)"],
    employees: 32,
    currency: "USD",
  },
  requirements: [
    { id: "REQ-01", area: "CRM", description: "Track leads and opportunities from trade shows and the website contact form through a sales pipeline with stages and expected revenue.", type: "standard", priority: "Should" },
    { id: "REQ-02", area: "CRM", description: "Assign opportunities to sales reps by region (North Texas / South Texas) using sales teams.", type: "configuration", priority: "Could" },
    { id: "REQ-03", area: "Sales", description: "Create quotations and sales orders with customer-specific pricing: Retail list, Fitter (-8%) and Key Account (-12%) pricelists.", type: "configuration", priority: "Must" },
    { id: "REQ-04", area: "Sales", description: "Show real-time available stock per warehouse when entering an order line and warn when quantity is not available.", type: "standard", priority: "Must" },
    { id: "REQ-05", area: "Sales", description: "Capture a customer 'Delivery Window' (e.g. Mon–Wed 8am–12pm) on the sales order and print it on the delivery slip.", type: "customization", priority: "Should" },
    { id: "REQ-06", area: "Sales", description: "Warn sales staff when a customer exceeds their credit limit (standard warning).", type: "configuration", priority: "Must" },
    { id: "REQ-07", area: "Sales", description: "Block confirmation of sales orders for customers over their credit limit unless approved by the controller.", type: "customization", priority: "Should" },
    { id: "REQ-08", area: "Purchase", description: "Purchase orders above USD 10,000 require purchasing manager approval.", type: "configuration", priority: "Must" },
    { id: "REQ-09", area: "Purchase", description: "Vendor bills may only be paid for quantities actually received (bill control on received quantities).", type: "configuration", priority: "Must" },
    { id: "REQ-10", area: "Purchase", description: "Automatically propose replenishment for fast movers using min/max reordering rules per warehouse.", type: "configuration", priority: "Should" },
    { id: "REQ-11", area: "Inventory", description: "Manage two warehouses (Dallas WH, Houston WH2) with real-time stock per location.", type: "standard", priority: "Must" },
    { id: "REQ-12", area: "Inventory", description: "Track large appliances by serial number from receipt to delivery.", type: "configuration", priority: "Must" },
    { id: "REQ-13", area: "Inventory", description: "Transfer stock from Dallas to Houston with an internal transfer document and in-transit visibility.", type: "configuration", priority: "Must" },
    { id: "REQ-14", area: "Inventory", description: "Support partial deliveries with automatic backorders and customer returns with restocking.", type: "standard", priority: "Must" },
    { id: "REQ-15", area: "Inventory", description: "Perform quarterly cycle counts by location and post differences to an inventory-loss account.", type: "standard", priority: "Should" },
    { id: "REQ-16", area: "Accounting", description: "Perpetual (automated) inventory valuation with FIFO for appliances and average cost for hardware.", type: "configuration", priority: "Must" },
    { id: "REQ-17", area: "Accounting", description: "Customer invoicing based on delivered quantities, with Texas sales tax applied per customer/fiscal position (resale certificates exempt).", type: "configuration", priority: "Must" },
    { id: "REQ-18", area: "Accounting", description: "Import bank statements and reconcile customer receipts and vendor payments.", type: "standard", priority: "Must" },
    { id: "REQ-19", area: "Accounting", description: "Migrate open AR/AP items and the opening trial balance from the legacy accounting package at cut-over.", type: "standard", priority: "Must" },
    { id: "REQ-20", area: "Reporting", description: "Monthly sales report by customer segment, product category and warehouse.", type: "reporting", priority: "Must" },
    { id: "REQ-21", area: "Reporting", description: "Aged receivables and payables, balance sheet and profit & loss (Enterprise financial reports or Community alternative).", type: "reporting", priority: "Must" },
    { id: "REQ-22", area: "Reporting", description: "Inventory valuation by warehouse and category, reconciled with the stock valuation account.", type: "reporting", priority: "Should" },
    { id: "REQ-23", area: "Integration", description: "Receive orders from the largest retail customer via a daily CSV/EDI-like file drop and create sales orders automatically.", type: "integration", priority: "Could" },
    { id: "REQ-24", area: "Integration", description: "Send shipment tracking numbers to customers using a carrier integration (Enterprise shipping connectors or third-party).", type: "integration", priority: "Could" },
  ],
  asIs: `## AS-IS — current situation

### Systems in use
| Area | Current tool | Pain points |
|---|---|---|
| Customer & price lists | Excel workbooks per rep | Different prices quoted for the same customer; no history |
| Order taking | Email and phone; orders typed into an Excel order log | Orders lost in inboxes; duplicate entry; no order status |
| Stock | One Excel sheet per warehouse, updated at end of day | Stock not visible across Dallas and Houston; overselling |
| Purchasing | Buyers email vendors; POs in Word templates | No approval control; no link between PO, receipt and bill |
| Accounting | Legacy desktop accounting package (Tally-like) | Invoices re-keyed from order log; inventory valued manually at month end |
| Reporting | Manual Excel pivot by finance | Month-end close takes ~12 working days |

### Current order-to-cash (simplified)
1. Customer emails/calls a rep with an order.
2. Rep checks the warehouse spreadsheet (often outdated) and replies with a price from their own Excel list.
3. Rep forwards the email to the warehouse; the warehouse prints it as a picking list.
4. Warehouse ships and writes the shipped quantity on the paper.
5. Finance types the invoice into the accounting package from the paper, days later.
6. Payments are matched manually to invoices from the bank statement.

### Current procure-to-pay (simplified)
1. Buyer notices low stock (or the warehouse complains).
2. Buyer emails the vendor and creates a Word PO without approval.
3. Goods arrive; the warehouse signs the vendor's delivery note.
4. AP enters the vendor bill in the accounting package — no check against received quantities.

### Key problems
- **Overselling** and backorders not tracked; customers are unhappy.
- **No serial traceability** for warranty claims on large appliances.
- **Credit risk**: orders shipped to customers already over their limit.
- **Inventory value** in the books is a monthly estimate; shrinkage is unknown.
- **Double data entry** between order log, warehouse and accounting.`,
  toBe: `## TO-BE — future process in Odoo 17.0

### Principles
- One integrated database for CRM, Sales, Purchase, Inventory and Accounting.
- **Standard Odoo first**; only two small customizations (Delivery Window, credit-limit block).
- Real-time stock per warehouse and automated (perpetual) valuation.

### Order to cash
\`\`\`
CRM opportunity ─▶ Quotation (pricelist, availability) ─▶ Credit check
      ─▶ Sales order confirmed ─▶ Delivery order (WH or WH2, serials)
      ─▶ Partial delivery? ─▶ Backorder
      ─▶ Customer invoice (delivered qty, tax) ─▶ Payment ─▶ Bank reconciliation
\`\`\`
1. Reps create opportunities in **CRM** and convert them to quotations.
2. Quotation uses the customer's **pricelist** and shows **forecasted availability** per warehouse.
3. Credit limit warning (standard) and approval block (custom) are applied before confirmation.
4. Confirmation creates a **delivery order** from the selected warehouse; serial numbers are scanned for appliances.
5. Partial shipments create **backorders** automatically.
6. Finance invoices **delivered quantities**; payments are matched in **bank reconciliation**.

### Procure to pay
\`\`\`
Reordering rule / buyer ─▶ RFQ ─▶ Approval (> USD 10,000) ─▶ Purchase order
      ─▶ Receipt (serials, WH or WH2) ─▶ Vendor bill (received qty) ─▶ Payment
\`\`\`

### Inventory
- Two warehouses: **WH** (Dallas) and **WH2** (Houston); internal transfers WH ▸ WH2.
- Serial tracking for large appliances; FIFO for appliances, AVCO for hardware.
- Quarterly cycle counts via **Physical Inventory**.

### Reporting
- Sales analysis by customer segment (tags), category, warehouse.
- Inventory valuation report reconciled with the GL.
- Financial reports: Enterprise dynamic reports **or** Community alternatives (to be confirmed in design).`,
  masterDataFiles: [
    {
      name: "Product categories",
      templateKey: "product-categories",
      description: "Category hierarchy with costing method and valuation. FIFO for appliances (serial-tracked, higher value), average cost for hardware.",
      rows: [
        { id: "categ_appliances", name: "Appliances", "parent_id/id": "product.product_category_all", property_cost_method: "fifo", property_valuation: "real_time" },
        { id: "categ_small_appliances", name: "Small Appliances", "parent_id/id": "categ_appliances", property_cost_method: "fifo", property_valuation: "real_time" },
        { id: "categ_large_appliances", name: "Large Appliances", "parent_id/id": "categ_appliances", property_cost_method: "fifo", property_valuation: "real_time" },
        { id: "categ_hardware", name: "Kitchen Hardware", "parent_id/id": "product.product_category_all", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_services", name: "Services", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "manual_periodic" },
      ],
    },
    {
      name: "Customers",
      templateKey: "customers",
      description: "Synthetic B2B customers (retailers, kitchen fitters, hospitality).",
      rows: [
        { id: "cust_0001", name: "Lone Star Kitchens Inc.", is_company: "1", email: "orders@lonestarkitchens.example", phone: "+1 214-555-0101", street: "1200 Commerce St", city: "Dallas", zip: "75202", country_id: "United States", vat: "US-TX-1000001", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_0002", name: "Gulf Coast Home Supply", is_company: "1", email: "purchasing@gulfcoasthome.example", phone: "+1 713-555-0102", street: "88 Harbor Blvd", city: "Houston", zip: "77002", country_id: "United States", vat: "US-TX-1000002", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_0003", name: "Prairie Cabinet Fitters LLC", is_company: "1", email: "office@prairiefitters.example", phone: "+1 817-555-0103", street: "450 Main St", city: "Fort Worth", zip: "76102", country_id: "United States", vat: "US-TX-1000003", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_0004", name: "Riverwalk Hotel Group", is_company: "1", email: "procurement@riverwalkhotels.example", phone: "+1 210-555-0104", street: "300 Alamo Plaza", city: "San Antonio", zip: "78205", country_id: "United States", vat: "US-TX-1000004", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_0005", name: "Capitol Appliance Outlet", is_company: "1", email: "buyer@capitolappliance.example", phone: "+1 512-555-0105", street: "77 Congress Ave", city: "Austin", zip: "78701", country_id: "United States", vat: "US-TX-1000005", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_0006", name: "Bayou Renovations Co.", is_company: "1", email: "accounts@bayoureno.example", phone: "+1 504-555-0106", street: "15 Canal St", city: "New Orleans", zip: "70112", country_id: "United States", vat: "US-LA-2000006", property_payment_term_id: "15 Days", customer_rank: "1" },
        { id: "cust_0007", name: "Red River Builders Supply", is_company: "1", email: "orders@redriverbuilders.example", phone: "+1 405-555-0107", street: "900 Broadway", city: "Oklahoma City", zip: "73102", country_id: "United States", vat: "US-OK-3000007", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_0008", name: "Maria Delgado", is_company: "0", email: "maria.delgado@mail.example", phone: "+1 214-555-0108", street: "23 Elm St", city: "Plano", zip: "75074", country_id: "United States", vat: "", property_payment_term_id: "Immediate Payment", customer_rank: "1" },
      ],
    },
    {
      name: "Vendors",
      templateKey: "vendors",
      description: "Synthetic manufacturers and importers.",
      rows: [
        { id: "vend_0001", name: "Northfield Appliance Manufacturing", is_company: "1", email: "sales@northfieldappliance.example", phone: "+1 312-555-0201", street: "500 Industrial Pkwy", city: "Chicago", zip: "60607", country_id: "United States", vat: "US-IL-4000001", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
        { id: "vend_0002", name: "Summit Hardware Components", is_company: "1", email: "orders@summithardware.example", phone: "+1 216-555-0202", street: "1400 Euclid Ave", city: "Cleveland", zip: "44115", country_id: "United States", vat: "US-OH-4000002", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_0003", name: "Pacific Rim Housewares Ltd.", is_company: "1", email: "export@pacificrimhousewares.example", phone: "+1 206-555-0203", street: "220 Harbor Way", city: "Seattle", zip: "98101", country_id: "United States", vat: "US-WA-4000003", property_supplier_payment_term_id: "End of Following Month", supplier_rank: "1" },
        { id: "vend_0004", name: "Lakeside Sinks & Fixtures", is_company: "1", email: "trade@lakesidesinks.example", phone: "+1 414-555-0204", street: "75 Lake Dr", city: "Milwaukee", zip: "53202", country_id: "United States", vat: "US-WI-4000004", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_0005", name: "Texan Freight Services", is_company: "1", email: "billing@texanfreight.example", phone: "+1 214-555-0205", street: "3100 Logistics Dr", city: "Dallas", zip: "75247", country_id: "United States", vat: "US-TX-4000005", property_supplier_payment_term_id: "15 Days", supplier_rank: "1" },
      ],
    },
    {
      name: "Products",
      templateKey: "products",
      description: "Storable appliances and hardware plus a delivery service. Barcodes are synthetic EAN-13 codes in the in-store (20x) range.",
      rows: [
        { id: "prod_blender_bw500", name: "Bluewave Pro Blender 500W", default_code: "SA-BLD-500", detailed_type: "product", "categ_id/id": "categ_small_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "89.00", standard_price: "52.00", barcode: "2001000000012", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_toaster_4s", name: "4-Slice Stainless Toaster", default_code: "SA-TST-004", detailed_type: "product", "categ_id/id": "categ_small_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "59.00", standard_price: "31.50", barcode: "2001000000029", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_coffee_12c", name: "12-Cup Programmable Coffee Maker", default_code: "SA-COF-012", detailed_type: "product", "categ_id/id": "categ_small_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "74.00", standard_price: "40.00", barcode: "2001000000036", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_fridge_ff28", name: "French-Door Refrigerator 28 cu ft", default_code: "LA-REF-028", detailed_type: "product", "categ_id/id": "categ_large_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "2199.00", standard_price: "1520.00", barcode: "2001000000043", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_range_gas30", name: "30in Gas Range 5-Burner", default_code: "LA-RNG-030", detailed_type: "product", "categ_id/id": "categ_large_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "1299.00", standard_price: "880.00", barcode: "2001000000050", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_dishwasher_24", name: "24in Built-in Dishwasher", default_code: "LA-DSW-024", detailed_type: "product", "categ_id/id": "categ_large_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "849.00", standard_price: "575.00", barcode: "2001000000067", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_hinge_softclose", name: "Soft-Close Cabinet Hinge (pair)", default_code: "HW-HNG-SC2", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "6.50", standard_price: "2.80", barcode: "2001000000074", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_slide_18in", name: "Full-Extension Drawer Slide 18in", default_code: "HW-SLD-018", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "14.90", standard_price: "7.10", barcode: "2001000000081", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_sink_ss33", name: "Stainless Undermount Sink 33in", default_code: "HW-SNK-033", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "329.00", standard_price: "185.00", barcode: "2001000000098", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_delivery_local", name: "Local Delivery Charge", default_code: "SRV-DEL-LOC", detailed_type: "service", "categ_id/id": "categ_services", uom_id: "Units", uom_po_id: "Units", list_price: "45.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
      ],
    },
    {
      name: "Opening stock",
      templateKey: "opening-stock",
      description: "Counted quantities at cut-over per warehouse. Large appliances are serial-tracked: one row per serial with quantity 1.",
      rows: [
        { "product_id/id": "prod_blender_bw500", location_id: "WH/Stock", inventory_quantity: "120", lot_id: "" },
        { "product_id/id": "prod_blender_bw500", location_id: "WH2/Stock", inventory_quantity: "40", lot_id: "" },
        { "product_id/id": "prod_toaster_4s", location_id: "WH/Stock", inventory_quantity: "200", lot_id: "" },
        { "product_id/id": "prod_coffee_12c", location_id: "WH2/Stock", inventory_quantity: "65", lot_id: "" },
        { "product_id/id": "prod_fridge_ff28", location_id: "WH/Stock", inventory_quantity: "1", lot_id: "REF28-0001" },
        { "product_id/id": "prod_fridge_ff28", location_id: "WH/Stock", inventory_quantity: "1", lot_id: "REF28-0002" },
        { "product_id/id": "prod_range_gas30", location_id: "WH2/Stock", inventory_quantity: "1", lot_id: "RNG30-0001" },
        { "product_id/id": "prod_hinge_softclose", location_id: "WH/Stock", inventory_quantity: "2500", lot_id: "" },
        { "product_id/id": "prod_slide_18in", location_id: "WH2/Stock", inventory_quantity: "800", lot_id: "" },
      ],
    },
    {
      name: "Opening AR/AP balances",
      description: "Open customer invoices and vendor bills at cut-over, to be imported as individual opening invoices/bills (not as a lump sum) so they can be reconciled with future payments.",
      rows: [
        { type: "AR", partner: "cust_0001", document: "LEG-INV-10452", date: "2026-08-28", due_date: "2026-09-27", amount: "12450.00", currency: "USD" },
        { type: "AR", partner: "cust_0002", document: "LEG-INV-10471", date: "2026-09-05", due_date: "2026-10-20", amount: "28730.50", currency: "USD" },
        { type: "AR", partner: "cust_0004", document: "LEG-INV-10488", date: "2026-09-12", due_date: "2026-10-27", amount: "9875.00", currency: "USD" },
        { type: "AR", partner: "cust_0005", document: "LEG-INV-10495", date: "2026-09-20", due_date: "2026-10-20", amount: "4310.00", currency: "USD" },
        { type: "AP", partner: "vend_0001", document: "NAM-77812", date: "2026-08-30", due_date: "2026-10-14", amount: "45600.00", currency: "USD" },
        { type: "AP", partner: "vend_0002", document: "SHC-2291", date: "2026-09-10", due_date: "2026-10-10", amount: "8120.40", currency: "USD" },
        { type: "AP", partner: "vend_0005", document: "TFS-0934", date: "2026-09-25", due_date: "2026-10-10", amount: "1980.00", currency: "USD" },
      ],
    },
  ],
  phases: [
    {
      key: "discovery",
      title: "Discovery",
      tasks: [
        { title: "Kick-off meeting", description: "Align sponsor, key users and consultants on scope, timeline, roles and communication.", deliverable: "Kick-off deck and project charter" },
        { title: "Stakeholder interviews", description: "Interview sales, purchasing, warehouse and finance leads about current processes and pain points.", deliverable: "Interview notes" },
        { title: "AS-IS process mapping", description: "Document current O2C, P2P, stock and month-end processes including spreadsheets used.", deliverable: "AS-IS process maps" },
        { title: "Data landscape review", description: "Inventory existing data sources (Excel workbooks, legacy accounting) and assess quality.", deliverable: "Data source inventory and quality assessment" },
      ],
    },
    {
      key: "requirements",
      title: "Requirements",
      tasks: [
        { title: "Requirements workshops", description: "Run workshops per area to capture requirements with business justification.", deliverable: "Requirements register" },
        { title: "Fit-gap analysis", description: "Classify each requirement as standard, configuration, customization, integration or reporting.", deliverable: "Fit-gap matrix" },
        { title: "MoSCoW prioritisation", description: "Agree Must/Should/Could with the sponsor and freeze go-live scope.", deliverable: "Signed-off prioritised scope" },
      ],
    },
    {
      key: "design",
      title: "Solution design",
      tasks: [
        { title: "TO-BE process design", description: "Design future processes in Odoo incl. approvals, warehouses and valuation.", deliverable: "TO-BE process document" },
        { title: "Configuration design", description: "Define settings, chart of accounts mapping, taxes, pricelists, routes and user roles.", deliverable: "Solution design document (SDD)" },
        { title: "Customization specifications", description: "Write functional and technical specs for Delivery Window and credit-limit block.", deliverable: "Functional/technical specs" },
        { title: "Data migration design", description: "Define objects, templates, mapping rules, cut-over date and reconciliation approach.", deliverable: "Data migration plan" },
      ],
    },
    {
      key: "configuration",
      title: "Configuration",
      tasks: [
        { title: "Company and accounting setup", description: "Localization, chart of accounts, journals, taxes, fiscal positions, payment terms.", deliverable: "Configured accounting" },
        { title: "Inventory setup", description: "Warehouses WH and WH2, locations, serial tracking, routes, reordering rules, categories with valuation.", deliverable: "Configured inventory" },
        { title: "Sales, CRM and Purchase setup", description: "Pipeline stages, sales teams, pricelists, invoicing policy, PO approval, bill control.", deliverable: "Configured sales and purchase" },
        { title: "Users and access rights", description: "Create users and assign access groups per role.", deliverable: "User access matrix" },
      ],
    },
    {
      key: "migration",
      title: "Data migration",
      tasks: [
        { title: "Data cleansing", description: "Deduplicate customers, standardise product names, SKUs and barcodes.", deliverable: "Cleansed data files" },
        { title: "Trial imports", description: "Import categories, partners, products and opening stock into a test database.", deliverable: "Import log with errors fixed" },
        { title: "Opening balances", description: "Import open AR/AP documents and the opening trial balance; reconcile with legacy.", deliverable: "Reconciled opening balances" },
        { title: "Final cut-over load", description: "Load final data into production on the cut-over date.", deliverable: "Cut-over sign-off" },
      ],
    },
    {
      key: "development",
      title: "Development",
      tasks: [
        { title: "Delivery Window module", description: "Custom module adding the field on sales order and delivery, propagated and printed on the delivery slip.", deliverable: "Custom module + unit tests" },
        { title: "Credit limit approval", description: "Custom approval block on SO confirmation for customers over limit.", deliverable: "Custom module + unit tests" },
        { title: "Order file import", description: "Scheduled import of the key customer's CSV order file into sales orders.", deliverable: "Integration script/module with error log" },
      ],
    },
    {
      key: "testing",
      title: "Testing",
      tasks: [
        { title: "Unit/system testing", description: "Consultants test each configured function and customization.", deliverable: "System test results" },
        { title: "Integration testing", description: "End-to-end O2C and P2P scenarios across both warehouses.", deliverable: "Integration test log" },
        { title: "User acceptance testing", description: "Key users execute test cases and sign off.", deliverable: "UAT sign-off" },
        { title: "Training", description: "Role-based training for sales, purchasing, warehouse and finance.", deliverable: "Training materials and attendance" },
      ],
    },
    {
      key: "golive",
      title: "Go-live & hypercare",
      tasks: [
        { title: "Go/no-go meeting", description: "Review readiness checklist, open defects and cut-over plan.", deliverable: "Go/no-go decision" },
        { title: "Cut-over execution", description: "Freeze legacy, final data load, physical count, opening balances.", deliverable: "Cut-over checklist completed" },
        { title: "Hypercare support", description: "Two weeks of on-site/remote support, daily issue triage.", deliverable: "Issue log and resolution report" },
        { title: "Project closure", description: "Handover to support, lessons learned, final documentation.", deliverable: "Closure report" },
      ],
    },
  ],
  transactionScenarios: [
    {
      id: "TS-01",
      title: "Procure to pay — restock blenders in Dallas",
      steps: [
        "Create an RFQ to Northfield Appliance Manufacturing for 100 Bluewave Pro Blender 500W at USD 52.00, deliver to WH",
        "Confirm the PO (below approval threshold)",
        "Validate the receipt of 100 units in WH/Stock",
        "Create and confirm the vendor bill from the PO",
        "Register payment from the bank journal",
      ],
      expected: "Stock in WH increases by 100; valuation increases by USD 5,200; bill is Paid; Stock Interim (Received) nets to zero.",
    },
    {
      id: "TS-02",
      title: "Order to cash — key account order with serials",
      steps: [
        "Create a quotation for Gulf Coast Home Supply (Key Account pricelist) for 2 French-Door Refrigerators from WH",
        "Confirm the SO (credit within limit)",
        "Validate the delivery, scanning serials REF28-0001 and REF28-0002",
        "Create and confirm the invoice for delivered quantities",
        "Register the customer payment",
      ],
      expected: "Prices reflect -12%; serials traced to customer; COGS posted at FIFO cost; invoice Paid.",
    },
    {
      id: "TS-03",
      title: "Partial delivery and backorder",
      steps: [
        "Create and confirm an SO for 300 Soft-Close Cabinet Hinges for Prairie Cabinet Fitters, shipped from WH",
        "On the delivery order set the done quantity to 200 (the truck can only take 200 today)",
        "Validate the delivery and choose Create Backorder for the remaining 100",
        "Invoice the 200 delivered",
        "Deliver the remaining 100 later and invoice",
      ],
      expected: "Backorder of 100 exists; first invoice covers 200 only; SO fully invoiced after second delivery.",
    },
    {
      id: "TS-04",
      title: "Customer return",
      steps: [
        "Customer Capitol Appliance Outlet returns 2 toasters from a delivered order",
        "Use Return on the delivery order for 2 units into WH/Stock",
        "Create a credit note from the invoice for 2 units",
        "Refund or reconcile against open receivable",
      ],
      expected: "Stock increases by 2; credit note reduces receivable; valuation restored.",
    },
    {
      id: "TS-05",
      title: "Inter-warehouse transfer Dallas → Houston",
      steps: [
        "Create an internal transfer of 50 toasters from WH/Stock to WH2/Stock (or use resupply route if configured)",
        "Validate the outgoing step in Dallas",
        "Validate receipt in Houston",
      ],
      expected: "WH stock -50, WH2 stock +50; total company valuation unchanged.",
    },
    {
      id: "TS-06",
      title: "Payment and bank reconciliation",
      steps: [
        "Import a bank statement with one customer receipt and one vendor payment",
        "Match each statement line with the open invoice/bill or outstanding payment",
        "Validate the reconciliation",
      ],
      expected: "Bank balance in Odoo equals statement; invoice and bill show Paid.",
    },
    {
      id: "TS-07",
      title: "Quarterly cycle count",
      steps: [
        "Open Physical Inventory filtered on WH2/Stock",
        "Enter counted quantities (e.g. drawer slides counted 792 vs 800 system)",
        "Apply the adjustment",
      ],
      expected: "Stock adjusted by -8; journal entry posts the loss to the inventory-loss account.",
    },
  ],
  customizations: [
    {
      id: "CUS-01",
      title: "Delivery Window on sales order and delivery slip (REQ-05)",
      spec: `## Functional specification
**Classification:** Customization (custom module). Odoo 17 has no standard 'delivery window' field. Standard alternatives considered: the **Delivery Date / Commitment Date** field and order notes — rejected because the customer needs a recurring time window, not a single date.

### Business need
Kitchen fitters only accept deliveries in specific windows. Drivers need the window printed on the delivery slip.

### Design
| Item | Detail |
|---|---|
| Field | **Delivery Window** (char, optional) on the customer (default) and on the sales order |
| Default | Copied from the customer when the customer is selected on the SO |
| Propagation | Copied to the delivery order(s) created from the SO |
| Report | Printed on the Delivery Slip below the shipping address |
| Access | Editable by sales users while the SO is not done |

### Technical notes
- New module **bluewave_delivery_window** depending on sale_stock.
- Add fields on res.partner, sale.order and stock.picking; compute/default from partner; propagate on picking creation.
- Inherit the delivery slip QWeb report.
- No change to standard business logic.

### Acceptance
- Window shows on SO, delivery and printed slip; backorders keep the window.`,
    },
    {
      id: "CUS-02",
      title: "Credit-limit approval block on SO confirmation (REQ-06 / REQ-07)",
      spec: `## Functional specification
**Classification:** REQ-06 is **configuration** — Odoo 17 provides a standard customer credit limit (Accounting ▸ Configuration ▸ Settings, Customer Payments section — **Sales Credit Limit**; verify in your training instance) that shows a **warning** on the sales order when the customer's total receivable + order exceeds the limit. REQ-07 (**blocking** confirmation until the controller approves) is **not** standard and is a **customization**.

### Business need
Orders for customers over limit must not ship without controller approval.

### Design
1. Use the standard credit limit field on the customer.
2. On **Confirm**, if the standard over-limit condition is true and the user is not in the new group **Credit Controller**, raise a user error: "Customer is over the credit limit — request approval".
3. Add a **Request Credit Approval** button creating an activity for the controller.
4. Controller can **Approve Credit**, which records approver and date and allows confirmation.

### Technical notes
- Module **bluewave_credit_block** depending on sale and account.
- Reuse the standard credit computation; do not reimplement receivable totals.
- Log approvals in chatter.

### Acceptance
- Under limit: confirm works normally. Over limit: sales user blocked; controller approval enables confirmation; audit trail visible.`,
    },
    {
      id: "CUS-03",
      title: "Daily key-customer order file import (REQ-23)",
      spec: `## Functional / technical specification
**Classification:** Integration.

### Design
- The key customer drops a CSV file (customer PO number, SKU, quantity, requested date) to an SFTP folder daily.
- A scheduled action reads the file, matches SKU to **Internal Reference**, creates a draft quotation per customer PO number and logs errors (unknown SKU, duplicate PO).
- Processed files are archived; errors are emailed to inside sales.

### Notes
- Standard import (manual CSV) can be used as a fallback.
- Prefer an existing third-party/OCA connector if the customer adopts a standard EDI format.`,
    },
  ],
  testCases: [
    { id: "TC-001", requirementId: "REQ-03", module: "Sales", scenario: "Key Account pricelist applied on quotation", preconditions: "Gulf Coast Home Supply has Key Account pricelist", testData: "2 × LA-REF-028", steps: "Create quotation, add product", expected: "Unit price = 2,199 × 0.88 = 1,935.12" },
    { id: "TC-002", requirementId: "REQ-04", module: "Sales", scenario: "Availability warning", preconditions: "Range RNG30 only 1 in WH2", testData: "3 × LA-RNG-030 from WH2", steps: "Add line with quantity 3", expected: "Forecast/availability widget warns of insufficient stock" },
    { id: "TC-003", requirementId: "REQ-05", module: "Sales/Inventory", scenario: "Delivery Window printed", preconditions: "CUS-01 installed; customer window 'Mon-Wed 8-12'", testData: "Prairie Cabinet Fitters SO", steps: "Confirm SO, print delivery slip", expected: "Window shown on SO, picking and slip" },
    { id: "TC-004", requirementId: "REQ-06", module: "Sales", scenario: "Standard credit limit warning", preconditions: "Credit limit setting enabled; customer limit 10,000 with 9,000 open", testData: "SO 2,000", steps: "Create SO", expected: "Warning displayed on the SO" },
    { id: "TC-005", requirementId: "REQ-07", module: "Sales", scenario: "Over-limit block and approval", preconditions: "CUS-02 installed", testData: "Same as TC-004", steps: "Confirm as sales user; request approval; approve as controller; confirm", expected: "Blocked first, confirmed after approval; approval logged" },
    { id: "TC-006", requirementId: "REQ-08", module: "Purchase", scenario: "PO approval threshold", preconditions: "Approval at 10,000", testData: "PO 12 × LA-REF-028 (18,240)", steps: "Confirm as buyer", expected: "PO status To Approve; manager approves" },
    { id: "TC-007", requirementId: "REQ-09", module: "Purchase/Accounting", scenario: "Bill control on received qty", preconditions: "Bill control = received", testData: "PO 100 blenders, receive 60", steps: "Create bill", expected: "Bill proposes 60 units" },
    { id: "TC-008", requirementId: "REQ-10", module: "Inventory/Purchase", scenario: "Reordering rule generates RFQ", preconditions: "Rule WH min 50 max 200 on toasters, vendor set", testData: "Stock falls to 40", steps: "Run Replenishment / scheduler", expected: "RFQ for 160 toasters" },
    { id: "TC-009", requirementId: "REQ-12", module: "Inventory", scenario: "Serial tracking on receipt and delivery", preconditions: "Large appliances tracked by serial", testData: "Receive 2 dishwashers", steps: "Validate receipt without serials, then with serials", expected: "Validation requires serials; traceability report shows them" },
    { id: "TC-010", requirementId: "REQ-13", module: "Inventory", scenario: "Inter-warehouse transfer", preconditions: "Stock in WH", testData: "50 toasters", steps: "Execute TS-05", expected: "WH -50, WH2 +50" },
    { id: "TC-011", requirementId: "REQ-14", module: "Inventory/Sales", scenario: "Backorder and return", preconditions: "Stock available", testData: "TS-03 and TS-04", steps: "Execute scenarios", expected: "Backorder created; return increases stock; credit note issued" },
    { id: "TC-012", requirementId: "REQ-16", module: "Accounting/Inventory", scenario: "Automated FIFO valuation", preconditions: "Category Large Appliances FIFO, real time", testData: "Receive 1 fridge at 1,520 then 1 at 1,560; deliver 1", steps: "Check valuation layers and COGS", expected: "COGS 1,520 (first in)" },
    { id: "TC-013", requirementId: "REQ-17", module: "Accounting", scenario: "Tax exemption for resale customer", preconditions: "Fiscal position 'Resale exempt' on customer", testData: "SO for Capitol Appliance Outlet", steps: "Invoice", expected: "No sales tax applied" },
    { id: "TC-014", requirementId: "REQ-19", module: "Accounting", scenario: "Opening AR/AP reconciliation", preconditions: "Opening documents imported", testData: "Opening AR/AP file", steps: "Compare aged balances with legacy totals", expected: "AR total 55,365.50 and AP total 55,700.40 match legacy" },
    { id: "TC-015", requirementId: "REQ-22", module: "Reporting", scenario: "Valuation reconciles with GL", preconditions: "Transactions TS-01..TS-07 done", testData: "-", steps: "Compare inventory valuation report to stock valuation account", expected: "Totals equal" },
  ],
  acceptanceCriteria: [
    "All Must requirements are implemented and their test cases passed in UAT with sign-off by process owners",
    "Opening stock quantities per warehouse match the cut-over physical count (100% of SKUs, zero unexplained differences)",
    "Opening AR/AP and trial balance match the legacy system at cut-over date",
    "Inventory valuation report equals the stock valuation account balance after test scenarios",
    "End-to-end O2C and P2P scenarios run without manual workarounds across WH and WH2",
    "Serial numbers are traceable from receipt to customer for all large appliances",
    "Customizations are delivered as installable modules with documentation and pass code review",
    "All users trained, with role-based access verified (no user has unnecessary administrator rights)",
    "No open critical or high-severity defects at go/no-go",
  ],
  documentation: [
    "Project charter and plan",
    "AS-IS process document",
    "Requirements register with fit-gap matrix and MoSCoW priority",
    "TO-BE process document with process flows",
    "Solution Design Document (configuration decisions per app)",
    "Functional and technical specifications for customizations",
    "Data migration plan, templates, import logs and reconciliation reports",
    "Test plan, test cases and UAT sign-off",
    "User access matrix",
    "Role-based user manuals and training materials",
    "Cut-over plan and go-live checklist",
    "Hypercare issue log and project closure report",
  ],
  rubric: [
    { criterion: "Requirements analysis & fit-gap", weight: 15, excellent: "All requirements correctly classified (incl. credit limit warning vs block) with justified priorities", adequate: "Most requirements classified, minor misclassifications", poor: "Missing or wrong classification; customizations proposed for standard features" },
    { criterion: "Process design (TO-BE)", weight: 15, excellent: "Clear flows covering exceptions (backorders, returns, transfers) mapped to Odoo", adequate: "Main flows documented, few exceptions", poor: "Flows absent or not linked to Odoo" },
    { criterion: "Configuration quality", weight: 20, excellent: "Warehouses, valuation, pricelists, taxes, approvals configured and justified", adequate: "Configuration works with minor issues", poor: "Key settings missing (e.g. manual valuation, no approval)" },
    { criterion: "Data migration", weight: 15, excellent: "Clean imports, reconciled opening stock and balances with evidence", adequate: "Imports done, partial reconciliation", poor: "Import errors or unreconciled balances" },
    { criterion: "Customization specifications", weight: 10, excellent: "Precise functional/technical specs, standard alternatives considered", adequate: "Specs present but vague", poor: "No specs or unjustified custom work" },
    { criterion: "Testing", weight: 15, excellent: "Test cases trace to requirements, all executed with evidence", adequate: "Most tests executed", poor: "Little or no testing evidence" },
    { criterion: "Documentation & communication", weight: 10, excellent: "Complete, professional deliverables suitable for the client", adequate: "Deliverables present with gaps", poor: "Missing key deliverables" },
  ],
};
