import type { ProjectContent } from "../types";

/**
 * Project C — Professional services firm implementation.
 *
 * Fictional company and synthetic data only. Master data rows use the exact
 * column keys of the portal's import templates (templateKey). Related config
 * lab scenario: "professional-services"; related process: "project-to-profit".
 */
export const servicesProject: ProjectContent = {
  slug: "professional-services-implementation",
  code: "C",
  title: "Brightpath Consulting Group — Odoo for a professional services firm",
  industry: "Professional services / consulting",
  level: "intermediate",
  odooVersion: "Odoo 17.0",
  configScenario: "professional-services",
  summary:
    "Implement Odoo 17.0 CRM, Sales, Project, Timesheets, Expenses and Invoicing for a two-office IT consulting firm that sells fixed-price implementations, time-and-materials work and monthly support retainers, and resells a small range of barcode hardware — replacing a spreadsheet timesheet process, a standalone CRM and manual invoicing.",
  company: {
    name: "Brightpath Consulting Group",
    profile: `## Brightpath Consulting Group (fictional)

Brightpath Consulting Group delivers **IT advisory, ERP implementation and application support** services to mid-sized companies in the US Midwest and Mountain states. It also **resells barcode scanners and label printers** to implementation clients that roll out warehouse or retail processes.

| Attribute | Value |
|---|---|
| Founded | 2015 |
| Annual revenue | ~ USD 7.5 million (≈ 92% services, 8% hardware resale) |
| Clients | ~120 active clients, ~40 open engagements at any time |
| Engagement types | **Fixed-price implementations** (milestone billing), **time & materials** (hourly, billed monthly from timesheets), **monthly support retainers** (prepaid block of 20 hours + overage) |
| Offices | **Chicago, IL** — head office, small hardware storeroom (WH); **Denver, CO** — delivery office, small storeroom (WH2) |
| Staff | 35 consultants and project managers, 5 admin/finance staff |
| Payment terms | Clients mostly 30 days; enterprise clients 45 days; retainers 15 days |
| Billing rates | USD 110–250 per hour depending on role; customer-specific rate cards for key accounts |

### Organisation
- **Partners** (3): own client relationships and sign engagements
- **Delivery** (32): 2 practice leads, 6 project managers, 24 consultants (senior / consultant / junior) split ~60/40 between Chicago and Denver
- **Sales operations** (1): pipeline administration, quotations
- **Finance & admin** (4): finance controller, billing accountant, AP/expenses clerk, office manager (also handles hardware stock)

### Why now?
Timesheets are collected in a shared spreadsheet every Friday, re-keyed into invoices by the billing accountant, and expenses are claimed on paper forms. Roughly **4–6% of billable hours are never invoiced**, expenses are re-billed months late (or never), and partners only learn whether a fixed-price project lost money after it has closed.`,
    locations: ["Chicago, IL (Head office & WH — hardware storeroom)", "Denver, CO (Delivery office & WH2 — hardware storeroom)"],
    employees: 40,
    currency: "USD",
  },
  requirements: [
    { id: "C-REQ-01", area: "CRM", description: "Track leads and opportunities through a pipeline (New ▸ Qualified ▸ Proposal ▸ Negotiation ▸ Won/Lost) with expected revenue, probability and the engagement type (fixed price / T&M / retainer) as a tag.", type: "standard", priority: "Must" },
    { id: "C-REQ-02", area: "CRM", description: "Split the pipeline into two sales teams (Chicago, Denver) so each partner sees their office's opportunities and forecast.", type: "configuration", priority: "Should" },
    { id: "C-REQ-03", area: "Sales", description: "Prepare quotations from quotation templates per engagement type (Implementation, T&M Support, Retainer) with standard terms, optional training days and validity of 30 days.", type: "configuration", priority: "Should" },
    { id: "C-REQ-04", area: "Sales", description: "Sell service products whose invoicing policy matches the commercial model: Based on Timesheets (T&M), Based on Milestones (fixed price), Prepaid/Fixed Price (retainer, training days) — products sold in Hours or Days.", type: "configuration", priority: "Must" },
    { id: "C-REQ-05", area: "Project", description: "Confirming a sales order automatically creates the project (from a project template with stages and standard tasks) and links tasks to the billable sales order lines.", type: "configuration", priority: "Must" },
    { id: "C-REQ-06", area: "Timesheets", description: "Consultants record time daily against tasks with a description. The Timesheets app (grid view, timers) is Enterprise in Odoo 17; in Community, time is logged on the task's Timesheets tab (verify in your training instance).", type: "standard", priority: "Must" },
    { id: "C-REQ-07", area: "Timesheets", description: "Project managers validate timesheets weekly before they are invoiced (Timesheets ▸ To Validate — Enterprise only; verify in your training instance). Community fallback: documented review procedure plus invoice-period filter.", type: "configuration", priority: "Must" },
    { id: "C-REQ-08", area: "Timesheets", description: "Distinguish billable from non-billable time: internal projects, presales and goodwill hours must never reach an invoice but must count in utilisation and project cost.", type: "configuration", priority: "Must" },
    { id: "C-REQ-09", area: "HR / Costing", description: "Maintain a fully loaded hourly cost per employee so that timesheets value project cost (hours × hourly cost) on the project analytic account.", type: "configuration", priority: "Must" },
    { id: "C-REQ-10", area: "Expenses", description: "Employees submit expenses with receipt photos, grouped in expense reports; the project manager approves and finance posts and reimburses them.", type: "configuration", priority: "Must" },
    { id: "C-REQ-11", area: "Expenses", description: "Client-billable expenses (travel, accommodation, mileage) are re-invoiced to the customer's sales order at cost (or at a fixed mileage rate) without manual re-keying.", type: "configuration", priority: "Must" },
    { id: "C-REQ-12", area: "Invoicing", description: "Fixed-price implementations are invoiced per milestone (e.g. 30% design approved, 50% go-live, 20% hypercare complete) only when the milestone is marked reached.", type: "configuration", priority: "Must" },
    { id: "C-REQ-13", area: "Invoicing", description: "Monthly support retainers (20 prepaid hours) are invoiced at the start of each month, with hours above 20 billed as overage. Automatic recurring invoicing requires the Subscriptions app (Enterprise); Community uses a monthly sales order procedure (verify in your training instance).", type: "configuration", priority: "Should" },
    { id: "C-REQ-14", area: "Invoicing", description: "T&M work is invoiced monthly for timesheets of the closed month only (invoice period restricted by timesheet date), with a timesheet detail attachment.", type: "standard", priority: "Must" },
    { id: "C-REQ-15", area: "Accounting", description: "Analytic accounting with a Projects plan (one analytic account per project, created automatically) and an Office plan (Chicago / Denver) for office P&L.", type: "configuration", priority: "Must" },
    { id: "C-REQ-16", area: "Reporting", description: "Project profitability per project: invoiced and to-invoice revenue vs timesheet cost and expenses, with margin. Available from the project (Project Updates / profitability panel) — content differs between editions (verify in your training instance).", type: "reporting", priority: "Must" },
    { id: "C-REQ-17", area: "Reporting", description: "Utilisation dashboard: billable hours ÷ available hours per consultant and office per month, compared with the consultant's target utilisation.", type: "customization", priority: "Should" },
    { id: "C-REQ-18", area: "Timesheets", description: "Once a timesheet week is approved, consultants can no longer edit or delete those lines; only the finance controller can unlock a closed period.", type: "customization", priority: "Should" },
    { id: "C-REQ-19", area: "Sales", description: "Key accounts have negotiated rate cards (price per role, e.g. Senior Consultant USD 165 instead of 175) applied automatically on quotations.", type: "configuration", priority: "Must" },
    { id: "C-REQ-20", area: "Sales / Project", description: "On T&M projects, each consultant's hours are billed at their role rate from the customer's rate card without the PM maintaining the mapping manually per project.", type: "customization", priority: "Could" },
    { id: "C-REQ-21", area: "Planning", description: "Plan consultant allocation per project and week to avoid over-booking. The Planning app is Enterprise in Odoo 17 (verify in your training instance); Community fallback: allocated hours on tasks.", type: "configuration", priority: "Could" },
    { id: "C-REQ-22", area: "Hardware resale", description: "Stock barcode scanners and label printers in the Chicago (WH) and Denver (WH2) storerooms, sell them on the same sales order as services and invoice delivered quantities with FIFO cost of goods sold.", type: "standard", priority: "Should" },
    { id: "C-REQ-23", area: "Migration", description: "Migrate customers, vendors, products, hardware stock, open engagements (remaining budget / hours) and open receivables at cut-over.", type: "standard", priority: "Must" },
    { id: "C-REQ-24", area: "Integration", description: "Export approved monthly hours per employee as CSV for the external payroll provider (overtime and on-call allowances).", type: "integration", priority: "Could" },
    { id: "C-REQ-25", area: "Invoicing", description: "Issue credit notes for disputed hours, linked to the original invoice, and keep the related timesheets available for re-billing or write-off.", type: "standard", priority: "Must" },
  ],
  asIs: `## AS-IS — current situation

### Systems in use
| Area | Current tool | Pain points |
|---|---|---|
| Pipeline | Free CRM tool (separate login), partners' own notes | Forecast assembled manually in Excel each month; no link to signed work |
| Proposals | Word templates, prices typed by hand | Inconsistent rates; rate cards for key accounts not applied |
| Project set-up | Folder on the file share + task list in a to-do app | No budget, no link to the contract value |
| Timesheets | Shared Google-Sheets-like workbook, filled on Fridays | Late and incomplete; ~4–6% of billable hours never invoiced |
| Expenses | Paper form + receipts in an envelope | Re-billing to clients 1–3 months late or forgotten |
| Invoicing | Legacy accounting package; invoices typed from the timesheet workbook | 3 working days per month for the billing accountant; frequent disputes |
| Hardware | Excel list in the Chicago office | Stock in Denver unknown; cost of hardware sold estimated |
| Reporting | Partner spreadsheets | Profitability known only after project closure; utilisation guessed |

### Current engagement-to-cash (simplified)
1. Partner wins the deal in the CRM tool and writes a Word proposal.
2. Client signs; the partner emails the PMO to "open a project" (a folder and a code in the timesheet workbook).
3. Consultants fill the workbook weekly, often from memory.
4. At month end the billing accountant filters the workbook per client, applies rates from the proposal and types invoices.
5. Fixed-price milestones are invoiced when the partner remembers to tell finance.
6. Expenses are reimbursed through payroll; re-billing depends on the consultant writing the client name on the form.

### Key problems
- **Revenue leakage**: unbilled hours and forgotten expenses.
- **No real-time profitability**: fixed-price overruns discovered too late.
- **No utilisation figures**: hiring decisions based on gut feeling.
- **Disputes**: clients challenge hours because there is no detailed timesheet report.
- **Double entry** between CRM, proposals, workbook and accounting.`,
  toBe: `## TO-BE — future process in Odoo 17.0

### Principles
- One database for CRM, Sales, Project, Timesheets, Expenses and Invoicing; hardware resale through Inventory.
- **The sales order is the contract**: every billable hour, milestone and expense links to a sales order line.
- **Standard Odoo first**; customizations limited to the timesheet lock, utilisation dashboard and rate-card automation.
- Clearly separate **Community** and **Enterprise** capabilities (Timesheets app, timesheet validation, Planning, Subscriptions) — the edition decision is taken in design.

### Engagement to cash
\`\`\`
CRM opportunity ─▶ Quotation (template, customer rate card) ─▶ Sales order confirmed
      ─▶ Project + tasks created from template (analytic account)
      ─▶ Timesheets (daily) ─▶ PM validation ─▶ Delivered hours on SO line
      ─▶ Milestones reached ─▶ Expenses approved & re-invoiced at cost
      ─▶ Invoice (period / milestone / retainer) ─▶ Payment ─▶ Profitability review
\`\`\`
1. Partners manage opportunities in **CRM** (two sales teams) and convert them to quotations from **quotation templates**.
2. The customer's **pricelist** (rate card) sets the hourly/daily rates.
3. Confirmation creates the **project** from the template with stages and tasks; tasks link to the billable SO lines.
4. Consultants log **timesheets** on tasks; PMs validate weekly (Enterprise) or review the timesheet report (Community).
5. **Milestones** are marked reached by the PM after client acceptance.
6. **Expenses** with the customer's sales order set are re-invoiced at cost after approval and posting.
7. Billing creates monthly invoices limited to the closed timesheet period; retainers invoiced at the start of each month.

### Expense flow
\`\`\`
Receipt photo ─▶ Expense (category, project analytic, SO to re-invoice)
      ─▶ Expense report ─▶ PM approval ─▶ Finance posts ─▶ Reimbursement
      ─▶ SO line "at cost" ─▶ Customer invoice
\`\`\`

### Hardware resale
- Storable products in **WH** (Chicago) and **WH2** (Denver), FIFO with automated valuation.
- Sold on the implementation sales order; delivery order from the relevant storeroom; invoiced on delivered quantities.

### Reporting
- Project profitability (project panel / Project Updates) and analytic reports by project and office.
- Timesheet analysis: billable vs non-billable per consultant; custom utilisation dashboard against targets.`,
  masterDataFiles: [
    {
      name: "Product categories",
      templateKey: "product-categories",
      description: "Service categories (no stock valuation) and a FIFO / automated category for resold hardware.",
      rows: [
        { id: "categ_services", name: "Professional Services", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "manual_periodic" },
        { id: "categ_consulting", name: "Consulting & Implementation", "parent_id/id": "categ_services", property_cost_method: "standard", property_valuation: "manual_periodic" },
        { id: "categ_support", name: "Support & Retainers", "parent_id/id": "categ_services", property_cost_method: "standard", property_valuation: "manual_periodic" },
        { id: "categ_training", name: "Training", "parent_id/id": "categ_services", property_cost_method: "standard", property_valuation: "manual_periodic" },
        { id: "categ_hardware", name: "Hardware Resale", "parent_id/id": "product.product_category_all", property_cost_method: "fifo", property_valuation: "real_time" },
      ],
    },
    {
      name: "Customers",
      templateKey: "customers",
      description: "Synthetic client companies across the Midwest and Mountain states. Retainer clients pay in 15 days, enterprise clients in 45 days.",
      rows: [
        { id: "cust_0001", name: "Lakeshore Logistics Inc.", is_company: "1", email: "ap@lakeshorelogistics.example", phone: "+1 312-555-0141", street: "455 N Wacker Dr", city: "Chicago", zip: "60606", country_id: "United States", vat: "US-IL-5100001", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_0002", name: "Summit Ridge Health Partners", is_company: "1", email: "vendorinvoices@summitridgehealth.example", phone: "+1 303-555-0142", street: "1700 Lincoln St", city: "Denver", zip: "80203", country_id: "United States", vat: "US-CO-5100002", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_0003", name: "Prairie State Insurance Co.", is_company: "1", email: "procurement@prairiestateins.example", phone: "+1 217-555-0143", street: "1 Capitol Sq", city: "Springfield", zip: "62701", country_id: "United States", vat: "US-IL-5100003", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_0004", name: "Northgate Credit Union", is_company: "1", email: "finance@northgatecu.example", phone: "+1 414-555-0144", street: "800 W Wisconsin Ave", city: "Milwaukee", zip: "53233", country_id: "United States", vat: "US-WI-5100004", property_payment_term_id: "15 Days", customer_rank: "1" },
        { id: "cust_0005", name: "Front Range Outfitters LLC", is_company: "1", email: "accounts@frontrangeoutfitters.example", phone: "+1 719-555-0145", street: "25 N Tejon St", city: "Colorado Springs", zip: "80903", country_id: "United States", vat: "US-CO-5100005", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_0006", name: "Heartland Foods Cooperative", is_company: "1", email: "ap@heartlandfoods.example", phone: "+1 515-555-0146", street: "400 Locust St", city: "Des Moines", zip: "50309", country_id: "United States", vat: "US-IA-5100006", property_payment_term_id: "15 Days", customer_rank: "1" },
        { id: "cust_0007", name: "Great Plains Manufacturing Corp.", is_company: "1", email: "payables@greatplainsmfg.example", phone: "+1 402-555-0147", street: "1200 Farnam St", city: "Omaha", zip: "68102", country_id: "United States", vat: "US-NE-5100007", property_payment_term_id: "End of Following Month", customer_rank: "1" },
        { id: "cust_0008", name: "Alpine Valley School District", is_company: "1", email: "business.office@alpinevalleysd.example", phone: "+1 970-555-0148", street: "300 Main St", city: "Fort Collins", zip: "80524", country_id: "United States", vat: "", property_payment_term_id: "30 Days", customer_rank: "1" },
      ],
    },
    {
      name: "Vendors",
      templateKey: "vendors",
      description: "Hardware distributor, consumables supplier, subcontracted specialists and the corporate travel agency.",
      rows: [
        { id: "vend_0001", name: "Midwest Barcode Distribution", is_company: "1", email: "orders@midwestbarcode.example", phone: "+1 630-555-0251", street: "2100 Enterprise Dr", city: "Naperville", zip: "60563", country_id: "United States", vat: "US-IL-6100001", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_0002", name: "LabelSource Supplies", is_company: "1", email: "sales@labelsource.example", phone: "+1 608-555-0252", street: "75 E Washington Ave", city: "Madison", zip: "53703", country_id: "United States", vat: "US-WI-6100002", property_supplier_payment_term_id: "15 Days", supplier_rank: "1" },
        { id: "vend_0003", name: "Ridgeline Data Specialists", is_company: "1", email: "billing@ridgelinedata.example", phone: "+1 720-555-0253", street: "1550 Wewatta St", city: "Denver", zip: "80202", country_id: "United States", vat: "US-CO-6100003", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
        { id: "vend_0004", name: "Compass Corporate Travel", is_company: "1", email: "invoices@compasstravel.example", phone: "+1 312-555-0254", street: "233 S Wacker Dr", city: "Chicago", zip: "60606", country_id: "United States", vat: "US-IL-6100004", property_supplier_payment_term_id: "End of Following Month", supplier_rank: "1" },
      ],
    },
    {
      name: "Products",
      templateKey: "products",
      description:
        "Service products sold in Hours, Days or Units, two re-invoiceable expense products and four storable hardware items. The import template only carries invoice_policy (order / delivery); after import set the service-specific fields on each product form: **Invoicing Policy** (Prepaid/Fixed Price, Based on Timesheets, Based on Milestones), **Create on Order**, **Can be Expensed** and **Re-Invoice Expenses** (verify in your training instance). Barcodes are synthetic EAN-13 codes in the in-store (20x) range.",
      rows: [
        { id: "prod_consult_hour", name: "Senior Consultant — Hour (T&M)", default_code: "SRV-CON-SR-H", detailed_type: "service", "categ_id/id": "categ_consulting", uom_id: "Hours", uom_po_id: "Hours", list_price: "175.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_consultant_hour", name: "Consultant — Hour (T&M)", default_code: "SRV-CON-CO-H", detailed_type: "service", "categ_id/id": "categ_consulting", uom_id: "Hours", uom_po_id: "Hours", list_price: "140.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_consult_day", name: "Senior Consultant — Onsite Day (T&M)", default_code: "SRV-CON-SR-D", detailed_type: "service", "categ_id/id": "categ_consulting", uom_id: "Days", uom_po_id: "Days", list_price: "1300.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_impl_fixed", name: "ERP Implementation — Fixed Price", default_code: "SRV-IMP-FIX", detailed_type: "service", "categ_id/id": "categ_consulting", uom_id: "Units", uom_po_id: "Units", list_price: "48000.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_retainer_20h", name: "Monthly Support Retainer (20 h block)", default_code: "SRV-RET-20H", detailed_type: "service", "categ_id/id": "categ_support", uom_id: "Hours", uom_po_id: "Hours", list_price: "140.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
        { id: "prod_support_overage", name: "Support Hour — Overage", default_code: "SRV-SUP-OVR", detailed_type: "service", "categ_id/id": "categ_support", uom_id: "Hours", uom_po_id: "Hours", list_price: "160.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_training_day", name: "End-User Training Day", default_code: "SRV-TRN-DAY", detailed_type: "service", "categ_id/id": "categ_training", uom_id: "Days", uom_po_id: "Days", list_price: "1100.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
        { id: "prod_exp_travel", name: "Travel & Accommodation (re-invoiced at cost)", default_code: "EXP-TRAVEL", detailed_type: "service", "categ_id/id": "product.cat_expense", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_exp_mileage", name: "Mileage (per mile)", default_code: "EXP-MILEAGE", detailed_type: "service", "categ_id/id": "product.cat_expense", uom_id: "Units", uom_po_id: "Units", list_price: "0.70", standard_price: "0.67", barcode: "", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_hw_scanner", name: "Handheld Barcode Scanner HS-20", default_code: "HW-SCN-020", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "289.00", standard_price: "182.00", barcode: "2003000000016", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_hw_printer", name: "Desktop Label Printer LP-4 (4in)", default_code: "HW-PRN-004", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "449.00", standard_price: "296.00", barcode: "2003000000023", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_hw_cradle", name: "Charging Cradle for HS-20", default_code: "HW-CRD-020", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "59.00", standard_price: "33.50", barcode: "2003000000030", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_hw_labels", name: "Thermal Label Roll 4x6in (500 labels)", default_code: "HW-LBL-046", detailed_type: "product", "categ_id/id": "categ_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "18.50", standard_price: "9.20", barcode: "2003000000047", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
      ],
    },
    {
      name: "Opening stock",
      templateKey: "opening-stock",
      description:
        "Hardware only (services are never stocked). Counted at cut-over in both storerooms. Opening value at cost: scanners 32 × 182.00 = 5,824.00; printers 16 × 296.00 = 4,736.00; cradles 30 × 33.50 = 1,005.00; label rolls 260 × 9.20 = 2,392.00 — total USD 13,957.00.",
      rows: [
        { "product_id/id": "prod_hw_scanner", location_id: "WH/Stock", inventory_quantity: "24", lot_id: "" },
        { "product_id/id": "prod_hw_scanner", location_id: "WH2/Stock", inventory_quantity: "8", lot_id: "" },
        { "product_id/id": "prod_hw_printer", location_id: "WH/Stock", inventory_quantity: "12", lot_id: "" },
        { "product_id/id": "prod_hw_printer", location_id: "WH2/Stock", inventory_quantity: "4", lot_id: "" },
        { "product_id/id": "prod_hw_cradle", location_id: "WH/Stock", inventory_quantity: "30", lot_id: "" },
        { "product_id/id": "prod_hw_labels", location_id: "WH/Stock", inventory_quantity: "200", lot_id: "" },
        { "product_id/id": "prod_hw_labels", location_id: "WH2/Stock", inventory_quantity: "60", lot_id: "" },
      ],
    },
    {
      name: "Employees & cost rates",
      description:
        "Employees linked to users, with the fully loaded hourly cost (salary + benefits + overhead share ÷ ~1,800 productive hours per year) entered in the employee's HR Settings tab (verify in your training instance). Billing rate and target utilisation are reference values for the rate card and the utilisation dashboard (CUS-02), not standard fields.",
      rows: [
        { employee: "Olivia Harper", job_title: "Partner / Engagement Director", office: "Chicago", user_login: "olivia.harper@brightpath.example", hourly_cost: "120.00", standard_rate: "250.00", target_utilisation: "50%", timesheet_approver: "—" },
        { employee: "Hannah Lindqvist", job_title: "Project Manager", office: "Chicago", user_login: "hannah.lindqvist@brightpath.example", hourly_cost: "78.00", standard_rate: "160.00", target_utilisation: "70%", timesheet_approver: "Olivia Harper" },
        { employee: "Daniel Okafor", job_title: "Senior Consultant", office: "Chicago", user_login: "daniel.okafor@brightpath.example", hourly_cost: "85.00", standard_rate: "175.00", target_utilisation: "80%", timesheet_approver: "Hannah Lindqvist" },
        { employee: "Marcus Chen", job_title: "Consultant", office: "Chicago", user_login: "marcus.chen@brightpath.example", hourly_cost: "62.00", standard_rate: "140.00", target_utilisation: "85%", timesheet_approver: "Hannah Lindqvist" },
        { employee: "Rafael Moreno", job_title: "Project Manager", office: "Denver", user_login: "rafael.moreno@brightpath.example", hourly_cost: "76.00", standard_rate: "160.00", target_utilisation: "70%", timesheet_approver: "Olivia Harper" },
        { employee: "Priya Raman", job_title: "Senior Consultant", office: "Denver", user_login: "priya.raman@brightpath.example", hourly_cost: "82.00", standard_rate: "175.00", target_utilisation: "80%", timesheet_approver: "Rafael Moreno" },
        { employee: "Sofia Alvarez", job_title: "Consultant", office: "Denver", user_login: "sofia.alvarez@brightpath.example", hourly_cost: "60.00", standard_rate: "140.00", target_utilisation: "85%", timesheet_approver: "Rafael Moreno" },
        { employee: "Ethan Brooks", job_title: "Junior Consultant", office: "Denver", user_login: "ethan.brooks@brightpath.example", hourly_cost: "42.00", standard_rate: "110.00", target_utilisation: "85%", timesheet_approver: "Rafael Moreno" },
        { employee: "Grace Whitfield", job_title: "Billing Accountant", office: "Chicago", user_login: "grace.whitfield@brightpath.example", hourly_cost: "48.00", standard_rate: "—", target_utilisation: "0% (non-billable)", timesheet_approver: "—" },
      ],
    },
    {
      name: "Project templates / stages",
      description:
        "Template projects referenced as Project Template on the service products. Stages are shared task stages; tasks are copied into every new project created from the sales order. Never log time on a template project.",
      rows: [
        { template: "Template — Fixed-Price Implementation", item: "Stage", name: "Backlog", sequence: "1", notes: "Default stage for new tasks" },
        { template: "Template — Fixed-Price Implementation", item: "Stage", name: "In Progress", sequence: "2", notes: "" },
        { template: "Template — Fixed-Price Implementation", item: "Stage", name: "Client Review", sequence: "3", notes: "Waiting for client acceptance" },
        { template: "Template — Fixed-Price Implementation", item: "Stage", name: "Done", sequence: "4", notes: "Folded stage" },
        { template: "Template — Fixed-Price Implementation", item: "Task", name: "Kick-off & project charter", sequence: "10", notes: "Allocated 8 h" },
        { template: "Template — Fixed-Price Implementation", item: "Task", name: "Requirements & design workshops", sequence: "20", notes: "Milestone: Design approved (30%)" },
        { template: "Template — Fixed-Price Implementation", item: "Task", name: "Configuration & data migration", sequence: "30", notes: "" },
        { template: "Template — Fixed-Price Implementation", item: "Task", name: "UAT & training", sequence: "40", notes: "" },
        { template: "Template — Fixed-Price Implementation", item: "Task", name: "Go-live & hypercare", sequence: "50", notes: "Milestones: Go-live (50%), Hypercare complete (20%)" },
        { template: "Template — T&M Support", item: "Task", name: "Change requests", sequence: "10", notes: "Billable — linked to the T&M SO line" },
        { template: "Template — T&M Support", item: "Task", name: "Incidents", sequence: "20", notes: "Billable — linked to the T&M SO line" },
        { template: "Template — Retainer", item: "Task", name: "Monthly support (retainer hours)", sequence: "10", notes: "Linked to the retainer SO line; overage task linked to the overage line" },
        { template: "Internal — Practice Development", item: "Project", name: "Internal — Practice Development", sequence: "—", notes: "Non-billable; tasks: Presales, Training, Internal tools" },
      ],
    },
    {
      name: "Expense categories",
      description:
        "Expense products (Expenses ▸ Configuration ▸ Expense Categories — verify in your training instance). Re-invoice policy 'At cost' copies the actual amount to the sales order; 'Sales price' uses the product price; 'No' keeps the cost internal.",
      rows: [
        { category: "Airfare", reference: "EXP-AIR", cost: "0.00 (actual)", re_invoice: "At cost", expense_account: "Travel Expenses", notes: "Economy class; receipt mandatory" },
        { category: "Accommodation", reference: "EXP-HOTEL", cost: "0.00 (actual)", re_invoice: "At cost", expense_account: "Travel Expenses", notes: "Max USD 220 per night unless client-approved" },
        { category: "Ground transport (taxi / ride share)", reference: "EXP-TAXI", cost: "0.00 (actual)", re_invoice: "At cost", expense_account: "Travel Expenses", notes: "" },
        { category: "Mileage", reference: "EXP-MILEAGE", cost: "0.67 per mile", re_invoice: "Sales price (0.70 per mile)", expense_account: "Travel Expenses", notes: "Quantity = miles driven" },
        { category: "Meals while travelling", reference: "EXP-MEALS", cost: "0.00 (actual)", re_invoice: "At cost", expense_account: "Meals & Entertainment", notes: "Per diem cap USD 75" },
        { category: "Software & subscriptions", reference: "EXP-SOFT", cost: "0.00 (actual)", re_invoice: "No", expense_account: "Software Expenses", notes: "Internal only" },
        { category: "Office supplies", reference: "EXP-OFFICE", cost: "0.00 (actual)", re_invoice: "No", expense_account: "Office Expenses", notes: "Internal only" },
      ],
    },
    {
      name: "Open engagements at cut-over",
      description:
        "Running engagements migrated as new sales orders for the remaining scope only (so revenue already invoiced in the legacy system is not invoiced twice), plus the project and remaining allocated hours.",
      rows: [
        { customer: "cust_0003", engagement: "Claims portal implementation", model: "Fixed price (milestones)", contract_value: "36000.00", invoiced_to_date: "10800.00", remaining_to_invoice: "25200.00", note: "Design approved milestone (30%) invoiced in legacy; migrate Go-live 50% (18,000.00) + Hypercare 20% (7,200.00)" },
        { customer: "cust_0005", engagement: "E-commerce support", model: "T&M (Senior Consultant, rate card 165.00/h)", contract_value: "33000.00", invoiced_to_date: "23100.00", remaining_to_invoice: "9900.00", note: "200 h sold, 140 h invoiced; migrate 60 h × 165.00" },
        { customer: "cust_0006", engagement: "Monthly support retainer", model: "Retainer (20 h × 140.00)", contract_value: "2800.00 / month", invoiced_to_date: "n/a", remaining_to_invoice: "2800.00 / month", note: "Next retainer invoice on the 1st of the month after go-live" },
      ],
    },
  ],
  phases: [
    {
      key: "discovery",
      title: "Discovery",
      tasks: [
        { title: "Kick-off meeting", description: "Align the managing partner (sponsor), PMO lead, finance controller and consultants on scope, timeline, roles and the Community vs Enterprise question.", deliverable: "Kick-off deck and project charter" },
        { title: "Stakeholder interviews", description: "Interview partners, project managers, consultants, billing and the office manager about the engagement life cycle, billing models and pain points.", deliverable: "Interview notes" },
        { title: "AS-IS process mapping", description: "Map lead-to-contract, project set-up, timesheet-to-invoice, expense claims and month-end reporting, including the spreadsheets used.", deliverable: "AS-IS process maps" },
        { title: "Revenue leakage baseline", description: "Quantify unbilled hours and un-recharged expenses over the last 6 months from the timesheet workbook and expense forms.", deliverable: "Baseline KPI sheet (leakage %, billing lead time, utilisation estimate)" },
      ],
    },
    {
      key: "requirements",
      title: "Requirements",
      tasks: [
        { title: "Requirements workshops", description: "Workshops for CRM/Sales, Project/Timesheets, Expenses and Billing/Reporting, capturing business justification per requirement.", deliverable: "Requirements register" },
        { title: "Fit-gap analysis", description: "Classify each requirement as standard, configuration, customization, integration or reporting, flagging Enterprise-only features (Timesheets app, validation, Planning, Subscriptions).", deliverable: "Fit-gap matrix with edition column" },
        { title: "Edition decision", description: "Present the cost/benefit of Enterprise (timesheet validation, grid, Planning, Subscriptions) vs Community with workarounds; obtain a sponsor decision.", deliverable: "Edition decision memo" },
        { title: "MoSCoW prioritisation", description: "Agree Must/Should/Could and freeze go-live scope.", deliverable: "Signed-off prioritised scope" },
      ],
    },
    {
      key: "design",
      title: "Solution design",
      tasks: [
        { title: "TO-BE process design", description: "Design engagement-to-cash, expense and hardware resale flows, including milestone acceptance and timesheet approval.", deliverable: "TO-BE process document" },
        { title: "Service catalogue design", description: "Define service products, invoicing policies, Create on Order options, UoM (Hours/Days) and project templates per engagement type.", deliverable: "Service catalogue and product matrix" },
        { title: "Analytic & costing design", description: "Define analytic plans (Projects, Office), hourly cost policy, rate cards (pricelists) and the billable/non-billable rules.", deliverable: "Analytic and costing design" },
        { title: "Customization specifications", description: "Specify the timesheet lock, utilisation dashboard and rate-card automation, documenting standard alternatives considered.", deliverable: "Functional/technical specs CUS-01..03" },
        { title: "Data migration design", description: "Define objects, templates, open-engagement approach (remaining scope only) and reconciliation.", deliverable: "Data migration plan" },
      ],
    },
    {
      key: "configuration",
      title: "Configuration",
      tasks: [
        { title: "Company, accounting and analytic setup", description: "Localization, journals, payment terms, analytic accounting with Projects and Office plans, expense journal.", deliverable: "Configured accounting and analytics" },
        { title: "CRM and Sales setup", description: "Pipeline stages, sales teams Chicago/Denver, quotation templates, pricelists (rate cards), service and hardware products.", deliverable: "Configured CRM & Sales" },
        { title: "Project, timesheet and expense setup", description: "Project settings (timesheets, milestones), templates and stages, employees with hourly cost and approvers, expense categories and approval rules.", deliverable: "Configured Project, Timesheets and Expenses" },
        { title: "Inventory setup for hardware", description: "Warehouses WH (Chicago) and WH2 (Denver), FIFO automated category, delivery operation types.", deliverable: "Configured inventory" },
        { title: "Users and access rights", description: "Assign groups: consultants (Timesheets: own), PMs (Project manager / timesheet approver), billing (Accounting), partners (Sales manager).", deliverable: "User access matrix" },
      ],
    },
    {
      key: "migration",
      title: "Data migration",
      tasks: [
        { title: "Data cleansing", description: "Deduplicate clients, standardise names and emails, confirm employee hourly costs with finance.", deliverable: "Cleansed data files" },
        { title: "Trial imports", description: "Import categories, customers, vendors, products and hardware stock into a test database using the templates.", deliverable: "Import log with errors fixed" },
        { title: "Open engagements and AR", description: "Create sales orders for remaining scope of open engagements, projects with remaining allocated hours and open receivables.", deliverable: "Reconciled open engagement list and AR" },
        { title: "Final cut-over load", description: "Load final data into production on the cut-over date; reconcile counts and values.", deliverable: "Cut-over sign-off" },
      ],
    },
    {
      key: "development",
      title: "Development",
      tasks: [
        { title: "Timesheet lock module", description: "Custom module preventing edits of approved/closed-period timesheets except by the controller (CUS-01).", deliverable: "Custom module + automated tests" },
        { title: "Utilisation dashboard", description: "Capacity and target fields plus a reporting view of billable vs available hours (CUS-02).", deliverable: "Custom module + report validation sheet" },
        { title: "Rate-card automation", description: "Propagate customer role rates to the project's employee/SO-line mapping (CUS-03).", deliverable: "Custom module + automated tests" },
        { title: "Payroll hours export", description: "Monthly CSV export of approved hours per employee for the payroll provider (C-REQ-24).", deliverable: "Export action and file specification" },
      ],
    },
    {
      key: "testing",
      title: "Testing",
      tasks: [
        { title: "System testing", description: "Consultants test each configured function and customization, including edition-specific behaviour.", deliverable: "System test results" },
        { title: "Integration testing", description: "End-to-end engagement-to-cash for fixed price, T&M and retainer, including expenses, hardware and credit notes.", deliverable: "Integration test log" },
        { title: "User acceptance testing", description: "Partners, PMs, consultants and billing execute the test cases on realistic data and sign off.", deliverable: "UAT sign-off" },
        { title: "Training", description: "Role-based training: consultants (timesheets, expenses), PMs (validation, milestones, profitability), billing (invoicing, credit notes).", deliverable: "Training materials and attendance" },
      ],
    },
    {
      key: "golive",
      title: "Go-live & hypercare",
      tasks: [
        { title: "Go/no-go meeting", description: "Review readiness checklist, open defects, trained users and cut-over plan.", deliverable: "Go/no-go decision" },
        { title: "Cut-over execution", description: "Freeze the timesheet workbook at month end, final loads, open engagements, first timesheet week in Odoo.", deliverable: "Cut-over checklist completed" },
        { title: "First month-end close in Odoo", description: "Support the first T&M invoicing run, retainer invoices and the profitability review.", deliverable: "First billing run report" },
        { title: "Hypercare and closure", description: "Four weeks of hypercare with daily triage, then handover and lessons learned.", deliverable: "Issue log and closure report" },
      ],
    },
  ],
  transactionScenarios: [
    {
      id: "C-TS-01",
      title: "Fixed-price implementation with milestones and hardware",
      steps: [
        "In CRM, win the opportunity 'Lakeshore Logistics — WMS rollout' (expected revenue 48,000) and create a quotation from the Implementation template",
        "Add ERP Implementation — Fixed Price × 1 at 48,000.00, plus 6 × Handheld Barcode Scanner HS-20 (289.00) and 2 × Desktop Label Printer LP-4 (449.00) from WH",
        "Confirm the SO: the project is created from 'Template — Fixed-Price Implementation'; create milestones Design approved 30%, Go-live 50%, Hypercare complete 20% linked to the fixed-price line (verify in your training instance)",
        "Validate the delivery of the hardware from WH/Stock and invoice it: 6 × 289.00 + 2 × 449.00 = 1,734.00 + 898.00 = 2,632.00",
        "Mark 'Design approved' as reached and create the invoice for the milestone: 30% × 48,000.00 = 14,400.00",
        "Later mark Go-live (24,000.00) and Hypercare complete (9,600.00) reached and invoice them",
      ],
      expected: "Milestone invoices total 14,400 + 24,000 + 9,600 = 48,000.00; hardware COGS at FIFO = 6 × 182.00 + 2 × 296.00 = 1,684.00; WH stock: scanners 24 → 18, printers 12 → 10; no milestone is invoiced before it is reached.",
    },
    {
      id: "C-TS-02",
      title: "Time & materials project invoiced from timesheets",
      steps: [
        "Create an SO for Summit Ridge Health Partners: Senior Consultant — Hour (T&M) × 120 h at 175.00 (estimate 21,000.00); confirm — project and task created",
        "During October, Daniel Okafor logs 46 h and Marcus Chen logs 38 h on the task (both linked to the T&M SO line)",
        "PM Rafael Moreno validates the October timesheets (Enterprise) or reviews the timesheet report (Community)",
        "Daniel logs 5 h on 2 November (next period)",
        "On 1 November, Create Invoice with the timesheet period restricted to 1–31 October (verify in your training instance)",
      ],
      expected: "SO line delivered = 89 h, invoice = 84 h × 175.00 = 14,700.00 (November hours excluded); timesheet cost on the analytic account for October = 46 × 85.00 + 38 × 62.00 = 3,910.00 + 2,356.00 = 6,266.00.",
    },
    {
      id: "C-TS-03",
      title: "Monthly retainer with overage",
      steps: [
        "Create an SO for Northgate Credit Union: Monthly Support Retainer (20 h block) × 20 h at 140.00 = 2,800.00 and Support Hour — Overage × 0 h at 160.00; confirm",
        "Invoice the retainer at the start of the month (Prepaid/Fixed Price — invoiceable on confirmation): 2,800.00",
        "Consultants log 26 h during the month: 20 h on the retainer task, 6 h on the overage task (Sales Order Item = overage line)",
        "At month end invoice the delivered overage: 6 h × 160.00 = 960.00",
        "For the next month: create the next retainer order (Community) or let the Subscriptions app generate the recurring invoice (Enterprise — verify in your training instance)",
      ],
      expected: "Month total billed = 2,800.00 + 960.00 = 3,760.00; retainer line shows 20 h delivered / 20 h invoiced; overage line 6 h delivered / 6 h invoiced.",
    },
    {
      id: "C-TS-04",
      title: "Consultant expense re-invoiced at cost",
      steps: [
        "Priya Raman travels to Summit Ridge Health Partners and records three expenses: Airfare 412.60, Accommodation 2 nights × 189.00 = 378.00, Taxi 46.40",
        "On each expense set the Customer to Reinvoice / sales order = the Summit Ridge T&M SO and the project analytic account (field name may vary — verify in your training instance)",
        "Create the expense report (total 837.00) and submit; PM Rafael Moreno approves",
        "Finance posts the journal entries and reimburses Priya",
        "Open the SO: expense lines are added at cost; include them in the next invoice",
      ],
      expected: "Expense report = 412.60 + 378.00 + 46.40 = 837.00; employee payable cleared on reimbursement; SO shows 837.00 of re-invoiceable expenses; invoice to the customer includes 837.00; project cost includes the 837.00 expense.",
    },
    {
      id: "C-TS-05",
      title: "Non-billable internal and goodwill time",
      steps: [
        "Sofia Alvarez logs 12 h on project 'Internal — Practice Development' (task Presales)",
        "Daniel Okafor logs 3 h of goodwill rework on the Summit Ridge project on a task not linked to a sales order item / marked non-billable (verify the option in your training instance)",
        "Run the timesheet analysis grouped by billable type for October",
      ],
      expected: "Internal cost 12 × 60.00 = 720.00 on the internal analytic account with no revenue; Summit Ridge delivered quantity unchanged by the 3 goodwill hours; goodwill cost 3 × 85.00 = 255.00 included in project cost; neither appears on any invoice.",
    },
    {
      id: "C-TS-06",
      title: "Project profitability review at month end",
      steps: [
        "After C-TS-02 and C-TS-04 (without the goodwill hours of C-TS-05), open the Summit Ridge project profitability panel / Project Updates (verify in your training instance)",
        "Compare revenue: timesheets invoiced 14,700.00 + re-invoiced expenses 837.00",
        "Compare costs: timesheet cost 6,266.00 + expenses 837.00",
        "Cross-check with the analytic report for the project analytic account",
      ],
      expected: "Revenue 15,537.00; cost 7,103.00; margin 8,434.00 (54.3%). Including the 255.00 goodwill hours from C-TS-05 the margin becomes 8,179.00 (52.6%). Panel and analytic report agree.",
    },
    {
      id: "C-TS-07",
      title: "Credit note for disputed hours",
      steps: [
        "Summit Ridge disputes 6 h on the October invoice (a workshop was logged twice)",
        "PM confirms the error; from the posted invoice create a Credit Note (partial) for 6 h × 175.00 with the reason 'Duplicate workshop hours'",
        "Correct the timesheets: delete/adjust the duplicated 6 h (requires unlocking if CUS-01 is installed)",
        "Reconcile the credit note against the open invoice",
      ],
      expected: "Credit note = 6 × 175.00 = 1,050.00 linked to the original invoice; net October timesheet revenue = 14,700.00 − 1,050.00 = 13,650.00; customer balance reduced by 1,050.00; SO invoiced quantity reduced to 78 h after the timesheet correction.",
    },
  ],
  customizations: [
    {
      id: "CUS-01",
      title: "Timesheet lock after approval (C-REQ-18)",
      spec: `## Functional specification
**Classification:** Partly standard, partly customization — classify per edition.
- **Enterprise:** timesheet **validation** (Timesheets ▸ To Validate) marks lines as validated; regular users cannot modify validated lines (verify in your training instance). That may already satisfy the requirement — test it before developing anything.
- **Community:** there is no validation step, so a lock **is a customization**.
- **Both editions:** a *period close* (no new or changed timesheets dated before the closed date unless controller) is not standard — accounting lock dates do **not** apply to timesheets, because timesheets are analytic lines, not journal entries.

### Business need
Invoices are produced from timesheets of the closed month. If consultants change hours afterwards, invoice and timesheets diverge and disputes cannot be answered.

### Design
| Item | Detail |
|---|---|
| Setting | **Timesheet Lock Date** on the company (Settings ▸ Timesheets) |
| Rule 1 | Users not in group **Timesheet Controller** cannot create, write or unlink timesheet lines dated on/before the lock date |
| Rule 2 (Community) | Field **Approved** (boolean, approver, date) on timesheet lines; approved lines are read-only for the employee |
| Unlock | Controller can move the lock date back; change logged in the company chatter |
| Error message | "Timesheets up to {lock date} are closed. Ask the finance controller to reopen the period." |

### Technical notes
- Module **brightpath_timesheet_lock** depending on hr_timesheet (and timesheet_grid if Enterprise, to reuse validation).
- Override create/write/unlink on account.analytic.line filtered to timesheet lines (project set).
- Do not block system processes (invoicing writes the invoice link on timesheets): exclude the invoice-link field from the check.

### Acceptance
- Consultant cannot edit a line dated before the lock date; controller can; invoicing still marks timesheets as invoiced.`,
    },
    {
      id: "CUS-02",
      title: "Utilisation dashboard (C-REQ-17)",
      spec: `## Functional specification
**Classification:** Reporting + customization. Standard timesheet reporting (pivot by employee/project, billable type — verify in your training instance) already gives **billable hours**. What is missing is **available capacity** (working hours minus leave) and **target utilisation** per employee, and a combined ratio. Standard alternative considered: export the pivot to a spreadsheet each month — accepted as the **Community fallback** until the module is live.

### Business need
Partners decide on hiring and staffing based on utilisation per consultant and office.

### Definitions
\`\`\`
Available hours  = working-schedule hours in period − approved time off
Billable hours   = timesheet hours linked to a billable SO line
Utilisation %    = Billable hours ÷ Available hours × 100
Gap to target    = Utilisation % − Target utilisation %
\`\`\`
Example: Daniel Okafor, October, 23 working days × 8 h = 184 h available, 46 h (Summit Ridge) + 98 h (other clients) = 144 h billable → 144 ÷ 184 = 78.3% vs target 80% → gap −1.7 points.

### Design
| Item | Detail |
|---|---|
| Field | **Target Utilisation %** on the employee (HR Settings tab) |
| Report | SQL view per employee / month / office: available, billable, non-billable hours, utilisation %, target, gap |
| Views | Pivot, graph and list; filters by office, department, month |
| Access | Partners and practice leads; consultants see only their own line |

### Technical notes
- Module **brightpath_utilisation** depending on hr_timesheet, sale_timesheet and hr_holidays.
- Available hours from the employee's resource calendar minus validated leaves.
- Office from the employee's work location or an analytic Office plan.

### Acceptance
- Report figures for 3 sample consultants match a manual calculation from the timesheet pivot and calendar.`,
    },
    {
      id: "CUS-03",
      title: "Customer rate cards applied to consultants (C-REQ-19 / C-REQ-20)",
      spec: `## Functional specification
**Classification:**
- **C-REQ-19 is configuration.** A customer **pricelist** with fixed prices per role product (e.g. Senior Consultant — Hour 165.00 for Front Range Outfitters) applies the rate card on quotations — standard Sales feature.
- **C-REQ-20 is a customization.** Odoo 17 lets a T&M project bill each employee at a specific sales order line through the project's employee / SO-item mapping (Project ▸ Settings / Invoicing tab — verify in your training instance), but the PM must fill that mapping manually on each project. Automatically building it from the employee's role is not standard.

### Business need
Key accounts are billed per role (Senior Consultant, Consultant, Junior). Today PMs forget the mapping and all hours are billed at the first SO line rate.

### Design
1. New field **Billing Role** (selection: Partner, Project Manager, Senior Consultant, Consultant, Junior) on the employee, linked to a role product.
2. On SO confirmation, for every project created, create mapping lines *employee → SO line of the role product* for all employees allocated to the project.
3. When a new employee logs time on the project and no mapping exists, create one if a matching role line exists on the SO; otherwise post a chatter warning to the PM.
4. The price itself always comes from the SO line, i.e. from the customer's pricelist (no price logic in the module).

### Technical notes
- Module **brightpath_rate_card** depending on sale_timesheet.
- Reuse the standard mapping model; do not create a parallel rate table.

### Acceptance
- Project for a customer with rate card: Senior hours billed at 165.00 and Consultant hours at the pricelist role rate without manual mapping.`,
    },
  ],
  testCases: [
    { id: "C-TC-01", requirementId: "C-REQ-01", module: "CRM", scenario: "Opportunity through pipeline to won", preconditions: "Stages New ▸ Qualified ▸ Proposal ▸ Negotiation ▸ Won configured", testData: "Lakeshore Logistics — WMS rollout, expected revenue 48,000, tag Fixed price", steps: "Create opportunity, move through stages, create quotation, mark Won", expected: "Opportunity Won; quotation linked; pipeline report shows 48,000 won for team Chicago" },
    { id: "C-TC-02", requirementId: "C-REQ-04", module: "Sales", scenario: "Service invoicing policies", preconditions: "Products imported and service fields set", testData: "SRV-CON-SR-H, SRV-IMP-FIX, SRV-RET-20H", steps: "Open each product form", expected: "Based on Timesheets (Hours), Based on Milestones, Prepaid/Fixed Price (Hours) respectively; Create on Order set" },
    { id: "C-TC-03", requirementId: "C-REQ-05", module: "Sales/Project", scenario: "Project created from SO with template", preconditions: "Template — Fixed-Price Implementation exists and is set on SRV-IMP-FIX", testData: "C-TS-01 sales order", steps: "Confirm SO, open Project smart button", expected: "Project with 4 stages and 5 template tasks; analytic account created; tasks linked to the SO line" },
    { id: "C-TC-04", requirementId: "C-REQ-06", module: "Timesheets", scenario: "Timesheet updates delivered quantity", preconditions: "T&M SO confirmed (C-TS-02)", testData: "Daniel logs 10 h", steps: "Log time on the task", expected: "SO line delivered quantity = 10 h" },
    { id: "C-TC-05", requirementId: "C-REQ-07", module: "Timesheets", scenario: "Timesheet validation (Enterprise)", preconditions: "Enterprise; Rafael is approver of Priya", testData: "Priya's week: 38 h", steps: "Rafael opens To Validate and validates the week", expected: "Lines marked validated; Priya can no longer change them (verify in your training instance)" },
    { id: "C-TC-06", requirementId: "C-REQ-08", module: "Timesheets", scenario: "Non-billable time excluded from invoice", preconditions: "Internal project exists", testData: "C-TS-05: 12 h internal, 3 h goodwill", steps: "Log time, create invoice for Summit Ridge", expected: "Invoice excludes the 15 h; internal cost 720.00, goodwill cost 255.00 visible in analytics" },
    { id: "C-TC-07", requirementId: "C-REQ-09", module: "HR/Analytic", scenario: "Timesheet cost from hourly cost", preconditions: "Daniel hourly cost 85.00", testData: "8 h on Summit Ridge", steps: "Log time, open analytic items of the project", expected: "Analytic line amount = −8 × 85.00 = −680.00" },
    { id: "C-TC-08", requirementId: "C-REQ-11", module: "Expenses/Sales", scenario: "Expense re-invoiced at cost", preconditions: "EXP-TRAVEL with Re-Invoice Expenses = At cost", testData: "C-TS-04 expenses 412.60 + 378.00 + 46.40", steps: "Submit, approve, post; open the SO", expected: "SO expense lines total 837.00 at cost; invoiceable; expense posted with project analytic" },
    { id: "C-TC-09", requirementId: "C-REQ-12", module: "Project/Invoicing", scenario: "Milestone invoiced only when reached", preconditions: "Milestones created (C-TS-01)", testData: "Design approved 30%", steps: "Try to invoice before reaching; mark reached; invoice", expected: "Nothing to invoice before; after reaching, invoice line 14,400.00" },
    { id: "C-TC-10", requirementId: "C-REQ-13", module: "Sales/Invoicing", scenario: "Retainer plus overage", preconditions: "Retainer SO (C-TS-03)", testData: "20 h retainer + 6 h overage", steps: "Invoice retainer, log 26 h, invoice overage", expected: "Invoices 2,800.00 and 960.00 (total 3,760.00)" },
    { id: "C-TC-11", requirementId: "C-REQ-14", module: "Invoicing", scenario: "Invoice limited to timesheet period", preconditions: "C-TS-02 timesheets incl. 5 h in November", testData: "Period 1–31 October", steps: "Create invoice with period filter", expected: "Invoice 84 h × 175.00 = 14,700.00; 5 November hours remain to invoice" },
    { id: "C-TC-12", requirementId: "C-REQ-16", module: "Reporting", scenario: "Project profitability", preconditions: "C-TS-02 and C-TS-04 done (no goodwill hours)", testData: "Summit Ridge project", steps: "Open profitability panel and analytic report", expected: "Revenue 15,537.00, cost 7,103.00, margin 8,434.00 (54.3%) in both" },
    { id: "C-TC-13", requirementId: "C-REQ-25", module: "Invoicing", scenario: "Credit note for disputed hours", preconditions: "October invoice posted", testData: "6 h × 175.00", steps: "Execute C-TS-07", expected: "Credit note 1,050.00 linked to invoice; customer balance reduced by 1,050.00" },
    { id: "C-TC-14", requirementId: "C-REQ-18", module: "Timesheets", scenario: "Timesheet lock after period close", preconditions: "CUS-01 installed; lock date 31 October", testData: "Marcus edits a 14 October line", steps: "Edit as Marcus; edit as controller; invoice", expected: "Marcus blocked with lock message; controller allowed; invoicing still links timesheets" },
    { id: "C-TC-15", requirementId: "C-REQ-22", module: "Inventory/Accounting", scenario: "Hardware sold with FIFO COGS", preconditions: "Opening stock loaded (13,957.00)", testData: "6 scanners + 2 printers from WH", steps: "Deliver and invoice (C-TS-01)", expected: "Invoice 2,632.00; COGS 1,684.00; stock valuation 13,957.00 − 1,684.00 = 12,273.00" },
  ],
  acceptanceCriteria: [
    "All Must requirements are implemented and their test cases passed in UAT with sign-off by the managing partner and finance controller",
    "Every confirmed engagement sales order creates its project automatically; no billable project exists without a sales order",
    "T&M invoices for the first month after go-live are produced from timesheets within 2 working days of month end, with zero manual rate entry",
    "Re-invoiceable expenses approved in a month appear on that month's customer invoices",
    "Project profitability for three sample projects matches a manual calculation (revenue, timesheet cost, expenses) to the cent",
    "Opening hardware stock equals the cut-over count with a valuation of USD 13,957.00; open engagements show only remaining scope",
    "Edition-dependent features (timesheet validation, Planning, Subscriptions) are either delivered in Enterprise or replaced by a documented Community procedure",
    "Customizations are delivered as installable modules with tests and documentation and pass code review",
    "All consultants trained and logging time daily in Odoo by the end of hypercare (timesheet completeness ≥ 95%)",
    "No open critical or high-severity defects at go/no-go",
  ],
  documentation: [
    "Project charter and plan",
    "AS-IS process document and revenue-leakage baseline",
    "Requirements register with fit-gap matrix, edition column and MoSCoW priority",
    "Edition decision memo (Community vs Enterprise)",
    "TO-BE process document (engagement-to-cash, expenses, hardware resale)",
    "Solution Design Document incl. service catalogue, analytic plans, costing and rate cards",
    "Functional and technical specifications CUS-01..CUS-03",
    "Data migration plan, templates, import logs and open-engagement reconciliation",
    "Test plan, test cases and UAT sign-off",
    "User access matrix",
    "Role-based guides: consultant (timesheets & expenses), project manager, billing accountant",
    "Cut-over plan, go-live checklist and first month-end billing runbook",
    "Hypercare issue log and project closure report",
  ],
  rubric: [
    { criterion: "Requirements analysis & fit-gap", weight: 15, excellent: "All requirements correctly classified with Enterprise-only features flagged and an argued edition recommendation", adequate: "Most requirements classified; edition impact partly identified", poor: "Misclassified requirements; Enterprise features assumed to exist in Community (or vice versa)" },
    { criterion: "Service catalogue & billing design", weight: 20, excellent: "Products, invoicing policies, Create on Order, UoM and templates correct for fixed price, T&M, retainer and expenses", adequate: "Main billing models work with minor issues", poor: "Wrong invoicing policies (e.g. T&M on ordered quantities) or no project creation from SO" },
    { criterion: "Timesheets, costing & analytics", weight: 15, excellent: "Hourly costs, billable/non-billable rules and analytic plans configured; profitability reconciles", adequate: "Timesheets work but costing or analytics incomplete", poor: "No hourly costs or analytic accounts; margin meaningless" },
    { criterion: "Expenses & invoicing execution", weight: 15, excellent: "All transaction scenarios executed with correct amounts, including period-limited invoices and credit notes", adequate: "Most scenarios executed; minor amount differences explained", poor: "Scenarios missing or amounts wrong" },
    { criterion: "Data migration", weight: 10, excellent: "Clean imports; hardware stock valued 13,957.00; open engagements migrated as remaining scope only", adequate: "Imports done with partial reconciliation", poor: "Import errors or engagements migrated at full value (double invoicing risk)" },
    { criterion: "Customization specifications", weight: 10, excellent: "Specs precise, standard/Enterprise alternatives evaluated and classification honest", adequate: "Specs present but vague", poor: "Custom work proposed for standard features" },
    { criterion: "Testing & documentation", weight: 15, excellent: "Test cases trace to requirements with evidence; complete client-ready deliverables", adequate: "Most tests executed; deliverables with gaps", poor: "Little testing evidence or missing deliverables" },
  ],
};
