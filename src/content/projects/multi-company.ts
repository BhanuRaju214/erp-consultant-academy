import type { ProjectContent } from "../types";

/**
 * Project D — Multi-company implementation.
 *
 * Fictional group and synthetic data only. Consistent with the "multi-company"
 * Business Configuration Lab scenario (Harborview Group). Master data rows use
 * the exact column keys of the portal's import templates (templateKey).
 */
export const multiCompanyProject: ProjectContent = {
  slug: "multi-company-implementation",
  code: "D",
  title: "Harborview Group — multi-company Odoo rollout",
  industry: "Group with trading and services subsidiaries",
  level: "advanced",
  odooVersion: "Odoo 17.0",
  summary:
    "Roll out Odoo 17.0 for a four-company group (US holding, US distribution, US installation services and a Canadian sales subsidiary) in one database: separate legal entities, multi-company user access, shared vs company-specific master data, inter-company trade with transfer pricing, foreign-currency revaluation and monthly consolidated reporting.",
  configScenario: "multi-company",
  company: {
    name: "Harborview Group",
    profile: `## Harborview Group (fictional)

Harborview Group distributes **consumer electronics accessories** (cables, chargers, power banks, TV mounts, audio) to retailers in the US Pacific Northwest and Canada, and installs TV mounts and AV equipment for hotels and homeowners. The group consists of four legal entities that today run on **four separate copies** of a desktop accounting package.

| Company | Role | Country / currency | Fiscal year |
|---|---|---|---|
| **Harborview Holdings Inc.** | Parent; shared services (finance, IT, HR); charges a monthly management fee | United States / USD | 1 Jan – 31 Dec |
| **Harborview Distribution LLC** | Buys from Asian and US manufacturers, stocks and sells to US retailers; sells to the sister companies at transfer price | United States / USD | 1 Jan – 31 Dec |
| **Harborview Installations LLC** | Installs TV mounts and AV equipment; buys all hardware from Distribution | United States / USD | 1 Jan – 31 Dec |
| **Harborview Canada Ltd.** | Sells to Canadian retailers; buys stock from Distribution in USD | Canada / CAD | 1 Apr – 31 Mar |

| Attribute | Value |
|---|---|
| Group revenue | ~ USD 31 million (Distribution 21 m, Canada CAD 10.5 m ≈ USD 7.7 m, Installations 2.3 m) |
| Customers | ~380 active (US retail 210, Canadian retail 95, installation customers ~75 recurring) |
| Vendors | ~40 (manufacturers, freight, services) |
| SKUs | ~1,400 stocked items, all bought centrally by Distribution |
| Warehouses | **WH** — Distribution, Tacoma WA; **WH2** — Canada, Vancouver BC; Installations holds no stock (vans are replenished per job) |
| Inter-company volume | ~60 inter-company orders per month (Distribution → Canada, Distribution → Installations) plus 3 management-fee invoices |

### Organisation
- **Group finance (Holdings shared service centre)** (6): Group CFO, group accountant, 2 AP clerks, 1 AR clerk, 1 treasury/FX analyst — work for **all** companies
- **Distribution** (24): sales 7, purchasing 3, warehouse 12, customer service 2
- **Installations** (14): service coordinator, 12 installers, 1 sales/estimator
- **Canada** (9): general manager, 4 sales reps, warehouse 3, office administrator
- **IT** (2): IT lead (Odoo administrator), support analyst

### Shared vs company-specific records — the core design question
| Record | Policy | Why |
|---|---|---|
| Products (catalogue) | **Shared** — Company field empty | One catalogue, one SKU list, bought centrally |
| Product prices / pricelists | **Company-specific** | USD vs CAD, different markets and transfer prices |
| Product accounts, costing method | **Company-specific (company-dependent properties)** | Each company has its own chart of accounts |
| Retail customers | **Shared** where the customer buys from several entities, otherwise **company-specific** | Avoid duplicates, keep local customers private |
| Vendors | Shared for group manufacturers; **company-specific** for local vendors (e.g. Canadian freight) | |
| Sister companies as partners | **The partner record Odoo creates for each company** — never a duplicate contact | Required for inter-company rules |
| Chart of accounts, taxes, journals, fiscal positions | **Company-specific** (legal requirement) | |
| Warehouses, locations, stock | **Company-specific** | Stock is owned by one legal entity |
| Users | One user, several **allowed companies** | Shared service centre staff work for all entities |

### Why now?
Month-end close takes **15 working days** because inter-company balances never agree, the Canadian books are kept in CAD with manually typed USD rates, and consolidation is a 40-tab spreadsheet. The auditors issued a management letter point on related-party reconciliation and on staff having access to every company's files.`,
    locations: [
      "Seattle, WA (Holdings head office & shared service centre)",
      "Tacoma, WA (Distribution — WH main warehouse)",
      "Seattle, WA (Installations — service base, no stock)",
      "Vancouver, BC, Canada (Canada — WH2 warehouse and sales office)",
    ],
    employees: 55,
    currency: "USD (group reporting); CAD for Harborview Canada Ltd.",
  },
  requirements: [
    { id: "D-REQ-01", area: "Company setup", description: "Create four companies (Holdings, Distribution, Installations, Canada) with legal name, address, tax ID, logo and Holdings as parent company of the three subsidiaries.", type: "configuration", priority: "Must" },
    { id: "D-REQ-02", area: "Company setup", description: "Install the correct fiscal localization per company (United States for Holdings, Distribution, Installations; Canada for Harborview Canada Ltd.) so each has its own chart of accounts, taxes and journals.", type: "configuration", priority: "Must" },
    { id: "D-REQ-03", area: "Company setup", description: "Company currency USD for the three US entities and CAD for Canada; multi-currency enabled with daily automatic exchange-rate updates (USD/CAD).", type: "configuration", priority: "Must" },
    { id: "D-REQ-04", area: "Company setup", description: "Fiscal year per company (US: 1 Jan – 31 Dec; Canada: 1 Apr – 31 Mar) and separate lock dates per company for month-end close.", type: "configuration", priority: "Must" },
    { id: "D-REQ-05", area: "Access", description: "Assign each user the allowed companies and default company defined in the user access matrix; shared service centre staff can work in several companies, operational staff in one only.", type: "configuration", priority: "Must" },
    { id: "D-REQ-06", area: "Access", description: "Users must not see other companies' sales orders, purchase orders, invoices, journal entries, stock or company-specific contacts (standard multi-company record rules); verified with negative tests.", type: "standard", priority: "Must" },
    { id: "D-REQ-07", area: "Master data", description: "Products and group-wide customers/vendors are shared across companies (Company field empty); local customers and vendors are restricted to their company.", type: "configuration", priority: "Must" },
    { id: "D-REQ-08", area: "Master data", description: "Company-specific product properties: income/expense accounts and costing method/valuation per company on product categories.", type: "configuration", priority: "Should" },
    { id: "D-REQ-09", area: "Accounting", description: "Taxes, fiscal positions, bank journals and payment terms configured per company, including an 'Inter-company' fiscal position that removes sales tax on related-party trade.", type: "configuration", priority: "Must" },
    { id: "D-REQ-10", area: "Accounting", description: "Separate inter-company receivable and payable accounts in each company so related-party balances can be reconciled and eliminated.", type: "configuration", priority: "Should" },
    { id: "D-REQ-11", area: "Inventory", description: "One warehouse per stock-holding company: Distribution WH (Tacoma) and Canada WH2 (Vancouver); Holdings and Installations hold no stock.", type: "configuration", priority: "Must" },
    { id: "D-REQ-12", area: "Inter-company", description: "A purchase order confirmed in Canada or Installations to Harborview Distribution LLC automatically creates the matching sales order in Distribution (Inter-Company Transactions — Odoo Enterprise; verify in your training instance).", type: "configuration", priority: "Must" },
    { id: "D-REQ-13", area: "Inter-company", description: "A customer invoice posted by one group company to a sister company automatically creates the matching draft vendor bill in the sister company (Enterprise; verify in your training instance), including management-fee invoices from Holdings.", type: "configuration", priority: "Must" },
    { id: "D-REQ-14", area: "Inter-company", description: "Transfer pricing: Distribution sells to Canada at cost + 10% and to Installations at cost + 5% (USD) using company-specific inter-company pricelists; the policy is documented for tax purposes.", type: "configuration", priority: "Must" },
    { id: "D-REQ-15", area: "Inter-company", description: "Holdings bills a fixed monthly management fee to each subsidiary (Distribution USD 12,000; Installations USD 4,000; Canada USD 6,000).", type: "standard", priority: "Should" },
    { id: "D-REQ-16", area: "Reporting", description: "Monthly consolidated P&L and balance sheet in USD with elimination of inter-company revenue/COGS, receivables/payables and unrealised profit in stock (Odoo Enterprise Consolidation — verify in your training instance — or per-company trial balance exports consolidated in a spreadsheet).", type: "reporting", priority: "Must" },
    { id: "D-REQ-17", area: "Reporting", description: "Operational multi-company reports (sales, invoices, stock) with all allowed companies selected, grouped by company, with clear currency handling.", type: "reporting", priority: "Should" },
    { id: "D-REQ-18", area: "Accounting", description: "Month-end revaluation of open foreign-currency receivables/payables and bank balances in Canada (USD items in a CAD company) with automatic reversal on the first day of the next month (Enterprise unrealized currency gains/losses report; verify in your training instance — manual entry in Community).", type: "configuration", priority: "Must" },
    { id: "D-REQ-19", area: "Access", description: "Role-based access tests for every role in the access matrix, including users who must NOT see Holdings or other subsidiaries' data, executed before UAT sign-off.", type: "standard", priority: "Must" },
    { id: "D-REQ-20", area: "Documents", description: "Document layout per company: own logo, address, tax ID and footer on quotations, invoices and POs; Canadian documents show the GST/HST registration number.", type: "configuration", priority: "Should" },
    { id: "D-REQ-21", area: "Approvals", description: "Purchase order approval thresholds per company: Distribution USD 25,000; Installations USD 5,000; Canada CAD 20,000 (standard two-step PO approval is a per-company setting).", type: "configuration", priority: "Must" },
    { id: "D-REQ-22", area: "Approvals", description: "Approval matrix per company with named approvers and delegation during absence (e.g. Canada GM delegates to Group CFO), with an audit trail.", type: "customization", priority: "Should" },
    { id: "D-REQ-23", area: "Reporting", description: "Group dashboard for management: revenue, gross margin, open inter-company balances and cash per company, translated to USD.", type: "customization", priority: "Could" },
    { id: "D-REQ-24", area: "Reporting", description: "Inter-company margin report showing transfer-price margin earned by Distribution and the unrealised profit still in Canada's stock at month end.", type: "customization", priority: "Should" },
    { id: "D-REQ-25", area: "Migration", description: "Migrate open AR/AP and opening trial balances per company; inter-company opening balances must agree between the two counterparties (after FX) at cut-over.", type: "standard", priority: "Must" },
  ],
  asIs: `## AS-IS — current situation

### Systems in use
| Area | Current tool | Pain points |
|---|---|---|
| Accounting | Four separate copies of a desktop accounting package (one per company) | Four charts of accounts with different numbering; no shared master data |
| Order taking | Distribution: Excel order log; Canada: emails to Distribution; Installations: paper job sheets | Inter-company orders keyed twice (PO in Canada, SO in Distribution) |
| Inventory | Excel per warehouse (Tacoma, Vancouver) | Canada cannot see Distribution stock before ordering |
| Inter-company billing | Distribution emails PDF invoices to Canada and Installations; management fees by spreadsheet | Bills entered late or at different amounts; balances never agree |
| FX | Canada books USD bills at a rate typed by the AP clerk | Rates differ between clerks; no month-end revaluation |
| Consolidation | 40-tab spreadsheet built by the group accountant | 5 days per month; eliminations done by plugging differences |
| Access | Shared network folders; everyone in finance opens every company file | Audit finding: no segregation by entity |

### Current inter-company purchase (Canada buys from Distribution)
1. Canada GM emails a stock request to the Distribution sales manager.
2. Distribution types a sales order into its Excel order log, prices from a "Canada price list" spreadsheet (sometimes outdated).
3. Distribution ships from Tacoma; Canada receives in Vancouver and updates its stock sheet.
4. Distribution invoices in USD; Canada AP keys the bill days later at "today's rate".
5. At month end the group accountant finds Distribution AR from Canada ≠ Canada AP to Distribution and books a plug.

### Current month-end
1. Each company closes separately (different days, no lock dates).
2. Trial balances are exported to Excel; CAD balances translated with a single rate.
3. Inter-company revenue and receivables are eliminated manually; differences go to a suspense account.
4. Unrealised profit in Canada's stock is not eliminated at all.

### Key problems
- **Duplicate keying** of every inter-company transaction (PO/SO, invoice/bill).
- **Inter-company balances do not agree**; plugs in consolidation.
- **No FX revaluation** of open USD items in the CAD company.
- **No access segregation**; auditors require entity-level access control.
- **Master data duplicated** four times (products, customers, vendors), with different codes.`,
  toBe: `## TO-BE — future process in Odoo 17.0

### Principles
- **One database, four companies.** Each legal entity has its own localization, currency, chart of accounts, taxes, journals and lock dates.
- **Share what is the same, separate what is legal.** Products and group-wide contacts shared; accounting, prices, warehouses company-specific.
- **Least-privilege access.** Users only get the companies they work for; shared service centre staff get several.
- **Standard first.** Inter-company rules and Consolidation are **Odoo Enterprise** features (verify in your training instance); Community fallbacks are documented for every Enterprise dependency.

### Company structure
\`\`\`
Harborview Holdings Inc. (USD, US)  ── parent
 ├── Harborview Distribution LLC (USD, US)    WH  (Tacoma)
 ├── Harborview Installations LLC (USD, US)   no stock
 └── Harborview Canada Ltd. (CAD, Canada)     WH2 (Vancouver)
\`\`\`

### Inter-company purchase → sale (Enterprise, verify in your training instance)
\`\`\`
Canada: PO to "Harborview Distribution LLC" (USD, transfer-price pricelist)
   ─▶ Confirm PO ─▶ [Inter-company rule] ─▶ Distribution: SO created for "Harborview Canada Ltd."
   ─▶ Distribution: delivery from WH ─▶ Canada: receipt into WH2
   ─▶ Distribution: customer invoice (USD) ─▶ [rule] ─▶ Canada: draft vendor bill (USD, booked in CAD at the bill-date rate)
   ─▶ Canada: payment ─▶ Distribution: receipt ─▶ both inter-company accounts = 0
\`\`\`
1. Canada creates the PO to the **company partner** of Distribution; the vendor pricelist carries the cost + 10% transfer price.
2. On confirmation the inter-company rule creates the SO in Distribution, either as a draft or confirmed, depending on the rule (verify the options in your training instance).
3. Distribution ships; Canada receives. Stock is valued in each company's own currency.
4. Distribution's invoice generates Canada's draft bill. Canada AP checks it and posts it.
5. The Inter-company fiscal position removes sales tax; inter-company AR/AP accounts are used.

**Community fallback:** Canada keys the PO, Distribution keys the SO with the PO number as Customer Reference, and AP enters the bill manually from the PDF; a weekly inter-company reconciliation report compares the balances.

### Installation job (Installations buys from Distribution)
\`\`\`
Installations: quotation to customer (mounts + labour hours) ─▶ confirm
   ─▶ PO to Distribution (cost + 5%) ─▶ [rule] SO in Distribution ─▶ delivery to job site
   ─▶ Installations: invoice customer ─▶ Distribution invoice ─▶ [rule] Installations bill
\`\`\`

### Users and access
- **Allowed Companies** and **Default Company** per user (Settings ▸ Users & Companies ▸ Users).
- The company switcher (top right) decides which companies' records are displayed; several companies can be ticked at once for combined views.
- Standard multi-company record rules hide records whose Company is not among the user's **selected** companies.

### Month-end close (per company, then group)
1. Each company: post all inter-company bills, run **FX revaluation** (Canada), reconcile banks, set the **lock date**.
2. Group: confirm inter-company balances agree (custom margin report / partner ledger filtered on sister companies).
3. Consolidate: Enterprise **Consolidation** (verify in your training instance) **or** export trial balances per company and consolidate in the standard Excel workbook with elimination entries and translation (closing rate for balance sheet, average rate for P&L).

### Approvals
- Standard **Purchase Order Approval** (two-step) with a per-company amount.
- Approval matrix with delegation is a small customization (see specifications).`,
  masterDataFiles: [
    {
      name: "Companies",
      description: "One row per legal entity. Create in Settings ▸ Users & Companies ▸ Companies, then switch to each company (only that company ticked) and install its fiscal localization in Accounting ▸ Configuration ▸ Settings. Not an import template — configure manually.",
      rows: [
        { company: "Harborview Holdings Inc.", parent: "—", country: "United States", currency: "USD", tax_id: "US-91-1000001", fiscal_year: "1 Jan – 31 Dec", localization: "United States (Generic US chart)", address: "500 Harbor Point Blvd, Seattle WA 98101", warehouse: "Auto-created warehouse renamed to code HQ and archived (no stock)" },
        { company: "Harborview Distribution LLC", parent: "Harborview Holdings Inc.", country: "United States", currency: "USD", tax_id: "US-91-1000002", fiscal_year: "1 Jan – 31 Dec", localization: "United States (Generic US chart)", address: "2200 Port of Tacoma Rd, Tacoma WA 98421", warehouse: "WH — Tacoma (location WH/Stock)" },
        { company: "Harborview Installations LLC", parent: "Harborview Holdings Inc.", country: "United States", currency: "USD", tax_id: "US-91-1000003", fiscal_year: "1 Jan – 31 Dec", localization: "United States (Generic US chart)", address: "4100 E Marginal Way S, Seattle WA 98134", warehouse: "Auto-created warehouse code INS kept for drop-ship receipts; no opening stock" },
        { company: "Harborview Canada Ltd.", parent: "Harborview Holdings Inc.", country: "Canada", currency: "CAD", tax_id: "CA123456789RT0001", fiscal_year: "1 Apr – 31 Mar (last day 31 March)", localization: "Canada", address: "800 Granville St, Vancouver BC V6Z 1K3", warehouse: "WH2 — Vancouver (location WH2/Stock)" },
      ],
    },
    {
      name: "Users & allowed companies",
      description: "User access matrix. Allowed Companies decide what a user may ever see; Default Company is the company selected at login and MUST be one of the allowed companies. Access groups are per user (not per company) in Odoo 17 — a user who is Purchase Manager is manager in every allowed company (verify in your training instance).",
      rows: [
        { user: "Grace Lin", role: "Group CFO", allowed_companies: "Holdings, Distribution, Installations, Canada", default_company: "Harborview Holdings Inc.", access: "Accounting: Administrator; Sales/Purchase/Inventory: read via reporting" },
        { user: "Omar Haddad", role: "Group accountant (shared service centre)", allowed_companies: "Holdings, Distribution, Installations, Canada", default_company: "Harborview Holdings Inc.", access: "Accounting: Accountant" },
        { user: "Jenna Park", role: "AP clerk (shared service centre)", allowed_companies: "Distribution, Installations, Canada", default_company: "Harborview Distribution LLC", access: "Invoicing: Billing (no Holdings access — management fees are confidential)" },
        { user: "Alex Morgan", role: "IT lead / Odoo administrator", allowed_companies: "Holdings, Distribution, Installations, Canada", default_company: "Harborview Holdings Inc.", access: "Settings: Administration (no daily transactions)" },
        { user: "Priya Nair", role: "Distribution sales manager", allowed_companies: "Distribution", default_company: "Harborview Distribution LLC", access: "Sales: Administrator; Inventory: User" },
        { user: "Tom Becker", role: "Distribution warehouse lead", allowed_companies: "Distribution", default_company: "Harborview Distribution LLC", access: "Inventory: Administrator" },
        { user: "Luis Romero", role: "Installations service coordinator", allowed_companies: "Installations", default_company: "Harborview Installations LLC", access: "Sales: All Documents; Purchase: User" },
        { user: "Marc Gagnon", role: "Canada general manager (PO approver)", allowed_companies: "Canada", default_company: "Harborview Canada Ltd.", access: "Sales: Administrator; Purchase: Administrator; Inventory: User" },
        { user: "Sophie Tremblay", role: "Canada sales rep", allowed_companies: "Canada", default_company: "Harborview Canada Ltd.", access: "Sales: Own Documents Only" },
      ],
    },
    {
      name: "Intercompany pricing",
      description: "Transfer-price policy: Distribution → Canada at standard cost + 10%, Distribution → Installations at cost + 5%, invoiced in USD. Loaded as company-specific pricelists in Distribution ('IC Canada USD', 'IC Installations USD') and as vendor prices in the buying companies. Management fees are fixed monthly amounts billed by Holdings in USD.",
      rows: [
        { seller: "Distribution", buyer: "Canada", item: "HV-CBL-HD2 HDMI 2.1 Cable 2m", basis: "Cost + 10%", cost_usd: "6.40", markup_pct: "10", transfer_price_usd: "7.04" },
        { seller: "Distribution", buyer: "Canada", item: "HV-CHG-065 65W USB-C GaN Charger", basis: "Cost + 10%", cost_usd: "21.00", markup_pct: "10", transfer_price_usd: "23.10" },
        { seller: "Distribution", buyer: "Canada", item: "HV-PWB-020 20,000 mAh Power Bank", basis: "Cost + 10%", cost_usd: "27.50", markup_pct: "10", transfer_price_usd: "30.25" },
        { seller: "Distribution", buyer: "Canada", item: "HV-AUD-ANC Wireless ANC Earbuds", basis: "Cost + 10%", cost_usd: "58.00", markup_pct: "10", transfer_price_usd: "63.80" },
        { seller: "Distribution", buyer: "Canada", item: "HV-AUD-SPK Portable Bluetooth Speaker", basis: "Cost + 10%", cost_usd: "34.00", markup_pct: "10", transfer_price_usd: "37.40" },
        { seller: "Distribution", buyer: "Installations", item: "HV-MNT-T70 Tilting TV Wall Mount 32-70in", basis: "Cost + 5%", cost_usd: "38.00", markup_pct: "5", transfer_price_usd: "39.90" },
        { seller: "Distribution", buyer: "Installations", item: "HV-MNT-SB1 Universal Soundbar Bracket", basis: "Cost + 5%", cost_usd: "11.20", markup_pct: "5", transfer_price_usd: "11.76" },
        { seller: "Distribution", buyer: "Installations", item: "HV-CBL-HD2 HDMI 2.1 Cable 2m", basis: "Cost + 5%", cost_usd: "6.40", markup_pct: "5", transfer_price_usd: "6.72" },
        { seller: "Holdings", buyer: "Distribution", item: "SRV-MGT-FEE Group management fee (monthly)", basis: "Fixed fee", cost_usd: "—", markup_pct: "—", transfer_price_usd: "12000.00" },
        { seller: "Holdings", buyer: "Installations", item: "SRV-MGT-FEE Group management fee (monthly)", basis: "Fixed fee", cost_usd: "—", markup_pct: "—", transfer_price_usd: "4000.00" },
        { seller: "Holdings", buyer: "Canada", item: "SRV-MGT-FEE Group management fee (monthly)", basis: "Fixed fee", cost_usd: "—", markup_pct: "—", transfer_price_usd: "6000.00" },
      ],
    },
    {
      name: "Product categories",
      templateKey: "product-categories",
      description: "Shared category tree. Costing method and valuation are company-dependent properties in Odoo 17: import once, then switch to each stock-holding company (Distribution, Canada) and confirm or set the values and stock accounts there (verify in your training instance).",
      rows: [
        { id: "categ_hv_accessories", name: "Electronics Accessories", "parent_id/id": "product.product_category_all", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_hv_cables", name: "Cables & Chargers", "parent_id/id": "categ_hv_accessories", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_hv_mounts", name: "Mounts & Brackets", "parent_id/id": "categ_hv_accessories", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_hv_audio", name: "Audio", "parent_id/id": "categ_hv_accessories", property_cost_method: "fifo", property_valuation: "real_time" },
        { id: "categ_hv_services", name: "Services", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "manual_periodic" },
      ],
    },
    {
      name: "Customers",
      templateKey: "customers",
      description: "Synthetic retail and installation customers. Import with no Company set (shared); after import set Company = Harborview Canada Ltd. on the cust_ca_* rows and Company = Harborview Installations LLC on cust_us_0003/0004 so they are private to that company. Payment terms are company-dependent: import while logged into the company that sells to the customer. Sister companies are NOT in this file — they are the auto-created company partners (see Vendors).",
      rows: [
        { id: "cust_us_0001", name: "Coastline Electronics Retail Inc.", is_company: "1", email: "purchasing@coastline-electronics.example", phone: "+1 206-555-0141", street: "1500 4th Ave", city: "Seattle", zip: "98101", country_id: "United States", vat: "US-91-2000001", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_us_0002", name: "Bay Area Gadget Stores Inc.", is_company: "1", email: "ap@bayareagadget.example", phone: "+1 415-555-0142", street: "220 Market St", city: "San Francisco", zip: "94105", country_id: "United States", vat: "US-94-2000002", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_us_0003", name: "Pinecrest Hotels Group", is_company: "1", email: "facilities@pinecresthotels.example", phone: "+1 503-555-0143", street: "900 SW 5th Ave", city: "Portland", zip: "97204", country_id: "United States", vat: "US-93-2000003", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_us_0004", name: "Daniel Okafor", is_company: "0", email: "daniel.okafor@mail.example", phone: "+1 206-555-0144", street: "48 Lakeview Dr", city: "Bellevue", zip: "98004", country_id: "United States", vat: "", property_payment_term_id: "Immediate Payment", customer_rank: "1" },
        { id: "cust_ca_0001", name: "Northern Lights Retail Inc.", is_company: "1", email: "buying@northernlights.example", phone: "+1 416-555-0151", street: "100 King St W", city: "Toronto", zip: "M5X 1A9", country_id: "Canada", vat: "CA210000001RT0001", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_ca_0002", name: "Prairie Tech Outlets Ltd.", is_company: "1", email: "orders@prairietech.example", phone: "+1 403-555-0152", street: "300 8 Ave SW", city: "Calgary", zip: "T2P 1C5", country_id: "Canada", vat: "CA210000002RT0001", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_ca_0003", name: "Maritime Home Electronics", is_company: "1", email: "accounts@maritimehome.example", phone: "+1 902-555-0153", street: "1800 Argyle St", city: "Halifax", zip: "B3J 3N8", country_id: "Canada", vat: "CA210000003RT0001", property_payment_term_id: "30 Days", customer_rank: "1" },
      ],
    },
    {
      name: "Vendors",
      templateKey: "vendors",
      description: "Group manufacturers (shared), one Canada-only freight vendor (set Company = Harborview Canada Ltd. after import) and the four sister companies. IMPORTANT: Odoo creates a partner for every company automatically. The ic_partner_* rows must UPDATE those records, not create duplicates — before importing, attach these External IDs to the existing company partners (Settings ▸ Technical ▸ External Identifiers in developer mode, or export the partners with 'I want to update data' and reuse the generated IDs; verify in your training instance). A duplicate sister-company contact breaks the inter-company rules.",
      rows: [
        { id: "vend_0001", name: "Shenzhen Brightlink Electronics Co.", is_company: "1", email: "export@brightlink.example", phone: "+86 755 5550 0201", street: "88 Keji Road", city: "Shenzhen", zip: "518057", country_id: "China", vat: "CN-91440300000001", property_supplier_payment_term_id: "End of Following Month", supplier_rank: "1" },
        { id: "vend_0002", name: "Cascade Cable Works Inc.", is_company: "1", email: "sales@cascadecable.example", phone: "+1 503-555-0202", street: "7700 NE Columbia Blvd", city: "Portland", zip: "97218", country_id: "United States", vat: "US-93-4000002", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_0003", name: "Great Lakes Mounting Systems", is_company: "1", email: "orders@greatlakesmounts.example", phone: "+1 313-555-0203", street: "1200 Woodward Ave", city: "Detroit", zip: "48226", country_id: "United States", vat: "US-38-4000003", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
        { id: "vend_0004", name: "Maple Freight Logistics Inc.", is_company: "1", email: "billing@maplefreight.example", phone: "+1 905-555-0204", street: "6500 Airport Rd", city: "Mississauga", zip: "L4V 1E8", country_id: "Canada", vat: "CA310000004RT0001", property_supplier_payment_term_id: "15 Days", supplier_rank: "1" },
        { id: "ic_partner_holdings", name: "Harborview Holdings Inc.", is_company: "1", email: "finance@harborviewgroup.example", phone: "+1 206-555-0100", street: "500 Harbor Point Blvd", city: "Seattle", zip: "98101", country_id: "United States", vat: "US-91-1000001", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "ic_partner_distribution", name: "Harborview Distribution LLC", is_company: "1", email: "intercompany@hv-distribution.example", phone: "+1 253-555-0110", street: "2200 Port of Tacoma Rd", city: "Tacoma", zip: "98421", country_id: "United States", vat: "US-91-1000002", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "ic_partner_installations", name: "Harborview Installations LLC", is_company: "1", email: "office@hv-installations.example", phone: "+1 206-555-0120", street: "4100 E Marginal Way S", city: "Seattle", zip: "98134", country_id: "United States", vat: "US-91-1000003", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "ic_partner_canada", name: "Harborview Canada Ltd.", is_company: "1", email: "accounts@hv-canada.example", phone: "+1 604-555-0130", street: "800 Granville St", city: "Vancouver", zip: "V6Z 1K3", country_id: "Canada", vat: "CA123456789RT0001", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
      ],
    },
    {
      name: "Products",
      templateKey: "products",
      description: "Shared catalogue (Company field left empty) used by Distribution, Canada and Installations. Sales prices here are Distribution's USD list prices; Canada sells from its own CAD pricelist. The installation service is set to Company = Harborview Installations LLC after import; the management fee to Company empty (used by Holdings to sell and by subsidiaries to buy). Barcodes are synthetic EAN-13 codes in the in-store (20x) range.",
      rows: [
        { id: "prod_hdmi_2m", name: "HDMI 2.1 Cable 2m", default_code: "HV-CBL-HD2", detailed_type: "product", "categ_id/id": "categ_hv_cables", uom_id: "Units", uom_po_id: "Units", list_price: "19.90", standard_price: "6.40", barcode: "2003000000108", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_usbc_charger_65", name: "65W USB-C GaN Charger", default_code: "HV-CHG-065", detailed_type: "product", "categ_id/id": "categ_hv_cables", uom_id: "Units", uom_po_id: "Units", list_price: "49.00", standard_price: "21.00", barcode: "2003000000207", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_powerbank_20k", name: "20,000 mAh Power Bank", default_code: "HV-PWB-020", detailed_type: "product", "categ_id/id": "categ_hv_cables", uom_id: "Units", uom_po_id: "Units", list_price: "59.00", standard_price: "27.50", barcode: "2003000000306", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_cat6_30m", name: "Cat6 Patch Cable 30m", default_code: "HV-CBL-C630", detailed_type: "product", "categ_id/id": "categ_hv_cables", uom_id: "Units", uom_po_id: "Units", list_price: "24.50", standard_price: "8.90", barcode: "2003000000405", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tv_mount_t70", name: "Tilting TV Wall Mount 32-70in", default_code: "HV-MNT-T70", detailed_type: "product", "categ_id/id": "categ_hv_mounts", uom_id: "Units", uom_po_id: "Units", list_price: "89.00", standard_price: "38.00", barcode: "2003000000504", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_soundbar_bracket", name: "Universal Soundbar Bracket", default_code: "HV-MNT-SB1", detailed_type: "product", "categ_id/id": "categ_hv_mounts", uom_id: "Units", uom_po_id: "Units", list_price: "29.00", standard_price: "11.20", barcode: "2003000000603", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_earbuds_anc", name: "Wireless ANC Earbuds", default_code: "HV-AUD-ANC", detailed_type: "product", "categ_id/id": "categ_hv_audio", uom_id: "Units", uom_po_id: "Units", list_price: "129.00", standard_price: "58.00", barcode: "2003000000702", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_bt_speaker", name: "Portable Bluetooth Speaker", default_code: "HV-AUD-SPK", detailed_type: "product", "categ_id/id": "categ_hv_audio", uom_id: "Units", uom_po_id: "Units", list_price: "79.00", standard_price: "34.00", barcode: "2003000000801", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_install_hour", name: "TV & AV Installation (hour)", default_code: "SRV-INS-HR", detailed_type: "service", "categ_id/id": "categ_hv_services", uom_id: "Hours", uom_po_id: "Hours", list_price: "85.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
        { id: "prod_mgmt_fee", name: "Group Management Fee (monthly)", default_code: "SRV-MGT-FEE", detailed_type: "service", "categ_id/id": "categ_hv_services", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "1", invoice_policy: "order" },
      ],
    },
    {
      name: "Opening stock",
      templateKey: "opening-stock",
      description: "Counted quantities at cut-over. WH/Stock is Harborview Distribution LLC's warehouse (Tacoma) — import with ONLY Distribution selected in the company switcher. WH2/Stock is Harborview Canada Ltd.'s warehouse (Vancouver) — import in a second run with ONLY Canada selected, after setting the product costs in Canada's context (cost is company-dependent; Canada values its stock in CAD). Holdings and Installations have no opening stock.",
      rows: [
        { "product_id/id": "prod_hdmi_2m", location_id: "WH/Stock", inventory_quantity: "4200", lot_id: "" },
        { "product_id/id": "prod_usbc_charger_65", location_id: "WH/Stock", inventory_quantity: "1500", lot_id: "" },
        { "product_id/id": "prod_powerbank_20k", location_id: "WH/Stock", inventory_quantity: "900", lot_id: "" },
        { "product_id/id": "prod_cat6_30m", location_id: "WH/Stock", inventory_quantity: "650", lot_id: "" },
        { "product_id/id": "prod_tv_mount_t70", location_id: "WH/Stock", inventory_quantity: "480", lot_id: "" },
        { "product_id/id": "prod_soundbar_bracket", location_id: "WH/Stock", inventory_quantity: "300", lot_id: "" },
        { "product_id/id": "prod_earbuds_anc", location_id: "WH/Stock", inventory_quantity: "720", lot_id: "" },
        { "product_id/id": "prod_bt_speaker", location_id: "WH/Stock", inventory_quantity: "540", lot_id: "" },
        { "product_id/id": "prod_hdmi_2m", location_id: "WH2/Stock", inventory_quantity: "800", lot_id: "" },
        { "product_id/id": "prod_usbc_charger_65", location_id: "WH2/Stock", inventory_quantity: "260", lot_id: "" },
        { "product_id/id": "prod_powerbank_20k", location_id: "WH2/Stock", inventory_quantity: "140", lot_id: "" },
        { "product_id/id": "prod_earbuds_anc", location_id: "WH2/Stock", inventory_quantity: "95", lot_id: "" },
        { "product_id/id": "prod_bt_speaker", location_id: "WH2/Stock", inventory_quantity: "110", lot_id: "" },
      ],
    },
    {
      name: "Opening inter-company balances",
      description: "Open inter-company documents at cut-over (2026-10-01). Each balance appears on BOTH sides and must agree: Canada books USD documents in CAD at the legacy booking rate (1 USD = 1.3500 CAD). Import as individual opening invoices/bills on the inter-company receivable/payable accounts so they can be reconciled with future payments.",
      rows: [
        { company: "Harborview Distribution LLC", type: "AR", partner: "ic_partner_canada", document: "HVD-INV-5521", date: "2026-09-18", due_date: "2026-10-18", amount: "8450.00", currency: "USD", amount_company_currency: "8450.00 USD" },
        { company: "Harborview Canada Ltd.", type: "AP", partner: "ic_partner_distribution", document: "HVD-INV-5521", date: "2026-09-18", due_date: "2026-10-18", amount: "8450.00", currency: "USD", amount_company_currency: "11407.50 CAD (rate 1.3500)" },
        { company: "Harborview Holdings Inc.", type: "AR", partner: "ic_partner_installations", document: "HVH-MF-2609", date: "2026-09-30", due_date: "2026-10-30", amount: "4000.00", currency: "USD", amount_company_currency: "4000.00 USD" },
        { company: "Harborview Installations LLC", type: "AP", partner: "ic_partner_holdings", document: "HVH-MF-2609", date: "2026-09-30", due_date: "2026-10-30", amount: "4000.00", currency: "USD", amount_company_currency: "4000.00 USD" },
      ],
    },
  ],
  phases: [
    {
      key: "discovery",
      title: "Discovery",
      tasks: [
        { title: "Kick-off with group and entity sponsors", description: "Align the Group CFO, the three subsidiary managers and IT on scope, timeline, governance and which decisions are group-level vs entity-level.", deliverable: "Kick-off deck and project charter" },
        { title: "Legal-entity and tax review", description: "Confirm legal entities, tax registrations, fiscal years, currencies and transfer-pricing policy with group finance and the external tax adviser.", deliverable: "Legal-entity fact sheet per company" },
        { title: "AS-IS inter-company and close mapping", description: "Map how inter-company orders, invoices, management fees, FX and consolidation work today, with volumes and error examples.", deliverable: "AS-IS process maps and pain-point log" },
        { title: "Edition decision input", description: "List features that depend on Odoo Enterprise (Inter-Company Transactions, Consolidation, FX revaluation report) and quantify the manual effort of Community fallbacks.", deliverable: "Edition impact note (Enterprise vs Community)" },
      ],
    },
    {
      key: "requirements",
      title: "Requirements",
      tasks: [
        { title: "Requirements workshops per entity and per group function", description: "Separate workshops for Distribution, Installations, Canada and group finance; capture who needs to see which company's data.", deliverable: "Requirements register" },
        { title: "Data-ownership and sharing matrix", description: "Decide for each record type whether it is shared or company-specific and who owns it.", deliverable: "Data-ownership matrix" },
        { title: "User access matrix", description: "List every user with role, allowed companies, default company and access groups; include users who must be excluded from Holdings.", deliverable: "Signed user access matrix" },
        { title: "Fit-gap and MoSCoW", description: "Classify requirements (standard, configuration, Enterprise feature, customization, reporting) and agree priorities.", deliverable: "Fit-gap matrix with signed-off scope" },
      ],
    },
    {
      key: "design",
      title: "Solution design",
      tasks: [
        { title: "Company and accounting design", description: "Company hierarchy, localizations, currencies, fiscal years, inter-company accounts and fiscal positions per company.", deliverable: "Solution design document — finance chapter" },
        { title: "Inter-company flow design", description: "Inter-company rules per company (SO/PO and/or invoice/bill synchronisation, auto-validation, warehouse), transfer-price pricelists and Community fallback.", deliverable: "Inter-company design with flow diagrams" },
        { title: "Security design", description: "Map access matrix to allowed companies, groups and record rules; design negative access tests.", deliverable: "Security design and test plan" },
        { title: "Consolidation and FX design", description: "Group chart mapping, elimination list, translation rates (closing vs average), revaluation procedure and month-end calendar.", deliverable: "Consolidation and close manual" },
        { title: "Customization specifications", description: "Specs for the group dashboard, inter-company margin report and approval matrix with delegation.", deliverable: "Functional/technical specs" },
      ],
    },
    {
      key: "configuration",
      title: "Configuration",
      tasks: [
        { title: "Companies and localizations", description: "Create the four companies, set parent, currency, localization, fiscal year, document layout and lock dates per company — always with only that company ticked.", deliverable: "Configured companies" },
        { title: "Accounting per company", description: "Taxes, fiscal positions, journals, inter-company accounts, payment terms, exchange-rate provider.", deliverable: "Configured accounting per company" },
        { title: "Inventory, sales and purchase per company", description: "Warehouses WH and WH2, company-specific pricelists, PO approval threshold per company, inter-company rules.", deliverable: "Configured operations" },
        { title: "Users and companies", description: "Create users from the access matrix, set allowed and default companies and access groups.", deliverable: "Configured users matching the access matrix" },
      ],
    },
    {
      key: "migration",
      title: "Data migration",
      tasks: [
        { title: "Master data consolidation", description: "Merge the four legacy product and contact lists into one catalogue and one contact list with unique codes; flag company-specific records.", deliverable: "De-duplicated master data files" },
        { title: "Company partner External IDs", description: "Attach ic_partner_* External IDs to the partners Odoo created for each company so the vendor file updates them instead of creating duplicates.", deliverable: "External ID mapping evidence" },
        { title: "Trial imports per company context", description: "Import categories, contacts and products once; import opening stock twice (Distribution → WH/Stock, Canada → WH2/Stock) with the correct company selected.", deliverable: "Import logs with errors fixed" },
        { title: "Opening balances and inter-company agreement", description: "Import opening trial balances and open AR/AP per company; confirm every inter-company balance agrees with its counterpart.", deliverable: "Inter-company balance agreement report" },
      ],
    },
    {
      key: "development",
      title: "Development",
      tasks: [
        { title: "Inter-company margin report", description: "Read-only reporting model joining inter-company sales lines with standard cost and the buyer's remaining stock.", deliverable: "Custom module + unit tests" },
        { title: "Approval matrix with delegation", description: "Per-company approval thresholds with named approvers and time-bound delegation on purchase orders.", deliverable: "Custom module + unit tests incl. multi-company record rules" },
        { title: "Group dashboard", description: "Management dashboard per company translated to USD; reuse standard spreadsheet dashboards where possible.", deliverable: "Dashboard + data-source documentation" },
      ],
    },
    {
      key: "testing",
      title: "Testing",
      tasks: [
        { title: "Security and access testing", description: "Log in as every role in the access matrix; execute positive and negative access tests (URL access, search, reports, company switcher).", deliverable: "Access test log with screenshots" },
        { title: "Inter-company integration testing", description: "Execute PO→SO, delivery/receipt, invoice→bill and payment cycles for Canada and Installations.", deliverable: "Integration test log" },
        { title: "Month-end dry run", description: "Run a full close: FX revaluation, lock dates, trial balance exports, consolidation with eliminations.", deliverable: "Dry-run consolidation workbook / report" },
        { title: "UAT and training", description: "Entity key users and group finance execute test cases; role-based training incl. company switcher.", deliverable: "UAT sign-off and training attendance" },
      ],
    },
    {
      key: "golive",
      title: "Go-live & hypercare",
      tasks: [
        { title: "Go/no-go", description: "Review readiness per company, open defects, access test results and cut-over plan.", deliverable: "Go/no-go decision per company" },
        { title: "Cut-over", description: "Freeze legacy systems, final loads, opening stock per warehouse, opening balances, inter-company agreement sign-off.", deliverable: "Cut-over checklist completed" },
        { title: "Hypercare through first close", description: "Support until the first month-end consolidation in Odoo is completed and reviewed by the Group CFO.", deliverable: "Issue log and first-close review" },
        { title: "Project closure", description: "Handover, lessons learned, updated access matrix and close manual.", deliverable: "Closure report" },
      ],
    },
  ],
  transactionScenarios: [
    {
      id: "D-TS-01",
      title: "Inter-company purchase: Canada PO creates a sales order in Distribution (Enterprise — verify in your training instance)",
      steps: [
        "Log in as Marc Gagnon (Canada). Create an RFQ to vendor Harborview Distribution LLC (the company partner), currency USD: 200 Wireless ANC Earbuds at 63.80 and 300 65W USB-C GaN Chargers at 23.10, deliver to WH2",
        "Check the total: 200 × 63.80 = 12,760.00 + 300 × 23.10 = 6,930.00 → USD 19,690.00 (Inter-company fiscal position: no tax)",
        "Confirm the PO (USD 19,690 ≈ CAD 26,778 at 1.3600 is above the CAD 20,000 approval threshold, so Marc approves as Purchase Manager)",
        "Log in as Priya Nair (Distribution): open the sales order generated by the inter-company rule for customer Harborview Canada Ltd.; check lines, prices, warehouse WH and the PO reference",
        "Validate the delivery from WH/Stock in Distribution; as Canada, validate the receipt into WH2/Stock",
      ],
      expected: "Exactly one SO exists in Distribution with the same lines and amounts (USD 19,690.00); Distribution WH stock decreases by 200 earbuds and 300 chargers; Canada WH2 increases by the same; neither user can open the other company's document.",
    },
    {
      id: "D-TS-02",
      title: "Inter-company invoice creates the vendor bill (Enterprise — verify in your training instance)",
      steps: [
        "In Distribution, create and post the customer invoice for the delivered quantities of D-TS-01 (USD 19,690.00, inter-company receivable account)",
        "Switch to Canada (Omar Haddad, only Canada ticked): open the draft vendor bill created by the rule",
        "Check the bill date and rate: 1 USD = 1.3600 CAD → 19,690.00 × 1.3600 = CAD 26,778.40",
        "Link the bill to the PO (or confirm the rule did), check quantities against the receipt and post",
      ],
      expected: "Distribution AR from Canada USD 19,690.00; Canada AP to Distribution USD 19,690.00 = CAD 26,778.40; no duplicate bill from the PO; no tax lines.",
    },
    {
      id: "D-TS-03",
      title: "Shared product sold by two companies with different prices, taxes and accounts",
      steps: [
        "As Priya (Distribution) sell 100 HDMI 2.1 Cable 2m to Coastline Electronics Retail at USD 19.90 → USD 1,990.00 (+ US sales tax per the customer's fiscal position)",
        "As Sophie (Canada) sell 100 of the same product to Northern Lights Retail (Ontario) from the CAD pricelist at CAD 26.90 → CAD 2,690.00",
        "Check that Canada's invoice applies 13% HST: 2,690.00 × 0.13 = 349.70 → total CAD 3,039.70",
        "Compare the income account and journal on both invoices",
      ],
      expected: "Same product record (one SKU) used in both companies; each invoice uses its own company's pricelist, taxes, income account, journal and warehouse (WH vs WH2).",
    },
    {
      id: "D-TS-04",
      title: "Installation job sourced inter-company",
      steps: [
        "As Luis (Installations) create a quotation for Pinecrest Hotels Group: 10 Tilting TV Wall Mounts at 89.00 = 890.00 and 12 h installation at 85.00 = 1,020.00 → USD 1,910.00; confirm",
        "Create a PO to Harborview Distribution LLC for 10 mounts at the cost + 5% transfer price 39.90 → USD 399.00 and confirm",
        "Distribution: the inter-company SO is created; deliver (drop-ship to the hotel or via Installations' INS warehouse, as designed)",
        "Distribution invoices USD 399.00 → Installations bill is generated; Installations invoices the hotel USD 1,910.00",
      ],
      expected: "Installations margin on the job = 1,910.00 − 399.00 = USD 1,511.00; Distribution margin on the inter-company sale = 10 × (39.90 − 38.00) = USD 19.00; Luis cannot see Distribution's cost price on the SO in Distribution.",
    },
    {
      id: "D-TS-05",
      title: "Shared service user switching companies",
      steps: [
        "Log in as Omar Haddad (default company Holdings); confirm the switcher shows the four companies",
        "Tick only Distribution and open Accounting ▸ Vendors ▸ Bills: only Distribution bills are listed",
        "Switch to Canada only and create a bill for Maple Freight Logistics: the journal, taxes and currency proposed are Canada's",
        "Tick all four companies and open the Invoice Analysis grouped by Company",
      ],
      expected: "Lists follow the ticked companies; new records are created in the active (highlighted) company; combined view groups by company and shows amounts with the currency handling documented in the design.",
    },
    {
      id: "D-TS-06",
      title: "Access-denied test (negative)",
      steps: [
        "As Priya (Distribution) copy the URL of the Distribution SO from D-TS-01",
        "Log in as Sophie Tremblay (Canada only) and paste the URL",
        "As Sophie search Contacts for 'Pinecrest' (Installations-private customer) and Purchase ▸ Vendors for 'Cascade Cable Works' (shared)",
        "As Jenna Park (no Holdings access) try to open the Holdings management-fee invoice HVH-MF-2609",
      ],
      expected: "Sophie receives an access error on the Distribution SO and finds no Pinecrest contact; the shared vendor Cascade Cable Works is visible; Jenna gets an access error on the Holdings invoice and Holdings is not in her company switcher.",
    },
    {
      id: "D-TS-07",
      title: "Month-end consolidation export and eliminations (October 2026)",
      steps: [
        "Each company posts all inter-company invoices/bills, including management fees 12,000 + 4,000 + 6,000 = USD 22,000.00",
        "Confirm inter-company balances agree per pair (partner ledger filtered on ic_partner_* or the margin report)",
        "Export each company's trial balance (or run Enterprise Consolidation — verify in your training instance); translate Canada's P&L at the October average rate and balance sheet at the closing rate",
        "Eliminate inter-company revenue: Distribution → Canada 19,690.00 + Distribution → Installations 399.00 + management fees 22,000.00 = USD 42,089.00",
        "Eliminate unrealised profit in Canada's stock: 150 earbuds unsold × (63.80 − 58.00) = 870.00 + 300 chargers unsold × (23.10 − 21.00) = 630.00 → USD 1,500.00",
      ],
      expected: "Consolidated revenue excludes USD 42,089.00 of inter-company sales; inventory reduced by USD 1,500.00 unrealised profit; inter-company AR = AP after translation; the consolidation balances with no suspense plug.",
    },
    {
      id: "D-TS-08",
      title: "Foreign-currency revaluation in Canada",
      steps: [
        "At 31 Oct 2026 Canada still owes Distribution USD 19,690.00 booked at 1.3600 = CAD 26,778.40",
        "Month-end rate 1 USD = 1.3750 CAD → 19,690.00 × 1.3750 = CAD 27,073.75",
        "Run the unrealized currency gains/losses report (Enterprise — verify in your training instance) or book a manual entry in Community, with auto-reversal on 1 Nov 2026",
        "On 10 Nov pay the bill at 1.3700 → CAD 26,975.30",
      ],
      expected: "October: unrealised FX loss CAD 295.35 (27,073.75 − 26,778.40), reversed on 1 Nov. On payment: realised FX loss CAD 196.90 (26,975.30 − 26,778.40); Canada AP to Distribution is zero in both USD and CAD.",
    },
  ],
  customizations: [
    {
      id: "D-CUS-01",
      title: "Group dashboard per company in USD (D-REQ-23)",
      spec: `## Functional specification
**Classification:** Reporting / customization (light). Standard alternatives considered first:
- Odoo 17 **Dashboards** with spreadsheet-based dashboards (Enterprise for editable spreadsheets — verify in your training instance) can show sales and invoicing KPIs per company.
- Enterprise **Consolidation** (verify in your training instance) produces consolidated statements but not an operational KPI dashboard.
Customization is only needed for the **USD translation of Canada** and the **inter-company balance tile**.

### Business need
The Group CFO wants one screen at month end showing each company and the group total.

### Design
| Tile | Source | Translation |
|---|---|---|
| Revenue MTD per company | Posted customer invoices (account.move.line, income accounts) | Canada at month-average rate |
| Gross margin % | Revenue − COGS from stock valuation / expense accounts | Ratio, no translation |
| Open inter-company balances | Partner = any ic_partner_* on receivable/payable accounts | Canada at closing rate |
| Cash per company | Bank journal balances | Canada at closing rate |

- Only users with allowed access to **all** companies (Group CFO, group accountant) can open the dashboard; record rules still apply.
- Rates come from the standard currency rate table (res.currency.rate) of Holdings.

### Technical notes
- Module **harborview_group_dashboard**; prefer a spreadsheet dashboard fed by standard pivots; add a computed SQL view only for the translated figures.
- No writes to accounting data.

### Acceptance
- Totals per company equal the respective trial balance; group total equals the sum of translated figures.`,
    },
    {
      id: "D-CUS-02",
      title: "Inter-company margin and unrealised profit report (D-REQ-24)",
      spec: `## Functional specification
**Classification:** Reporting customization. Standard Sales Analysis shows margin per order line (when the Margins setting is enabled) and can be filtered on the sister-company partners, but it cannot show how much of that margin is **still in the buyer's stock** at month end — needed for the consolidation elimination.

### Business need
Group finance needs, per month and product: inter-company quantity sold, transfer price, cost, margin, and the quantity still on hand in the buying company.

### Design
| Column | Source |
|---|---|
| Seller / buyer company | sale.order.company_id / partner = buyer's company partner |
| Product, quantity, transfer price | sale.order.line (delivered quantities) |
| Seller cost | Stock valuation layer of the delivery (seller currency) |
| Margin | (transfer price − cost) × quantity |
| Buyer qty on hand | stock.quant in the buyer's warehouse (e.g. WH2/Stock), limited to quantities received from the seller (FIFO assumption) |
| Unrealised profit | min(on-hand, received) × unit margin |

Example (October 2026): earbuds 150 on hand × 5.80 = 870.00; chargers 300 × 2.10 = 630.00 → USD 1,500.00.

### Technical notes
- Module **harborview_ic_margin**: read-only SQL view model with pivot/list views; sudo-free — the report must respect multi-company record rules, so only users allowed in both companies see a row.
- Export to Excel for the consolidation workbook.

### Acceptance
- Report matches D-TS-07 figures; a single-company user sees no rows for companies they are not allowed in.`,
    },
    {
      id: "D-CUS-03",
      title: "Approval matrix per company with delegation (D-REQ-21 / D-REQ-22)",
      spec: `## Functional specification
**Classification:** D-REQ-21 is **configuration** — Purchase ▸ Configuration ▸ Settings ▸ **Purchase Order Approval** with a minimum amount is a per-company setting in Odoo 17 (verify in your training instance): Distribution USD 25,000; Installations USD 5,000; Canada CAD 20,000. D-REQ-22 (named approvers per company and **delegation during absence**) is **not** standard and is a **customization**. The Enterprise **Approvals** app was considered: it handles generic approval requests but does not block PO confirmation by itself.

### Business need
In the standard, any Purchase Manager can approve — and access groups are not per company, so a manager in Distribution would also be manager in any other allowed company. The group wants named approvers per company and a temporary delegate (e.g. Marc Gagnon → Grace Lin during leave).

### Design
| Object | Fields |
|---|---|
| Approval rule | Company, document type (PO), amount from/to (company currency), approver user |
| Delegation | Approver, delegate, date from, date to, reason |

1. On **Confirm Order**, if the PO amount in company currency exceeds the company threshold, the PO goes to **To Approve** (standard) and an activity is created for the rule's approver.
2. Only the approver, or an active delegate in the date range, can click **Approve**; others get a user error.
3. Approver, delegate and timestamp are logged in the chatter.

### Technical notes
- Module **harborview_po_approval_matrix** depending on purchase; rule and delegation models carry company_id with standard multi-company record rules.
- Reuse the standard two-step approval state; do not replace it.

### Acceptance
- Canada PO of CAD 26,778 requires Marc (or delegate Grace during the delegation dates); Priya cannot approve a Canada PO; delegation outside its dates is rejected.`,
    },
  ],
  testCases: [
    { id: "D-TC-01", requirementId: "D-REQ-01", module: "Settings", scenario: "Company records and hierarchy", preconditions: "Companies created", testData: "Companies file", steps: "Open Settings ▸ Companies; check legal name, tax ID, parent of each company", expected: "Four companies; Holdings is parent of Distribution, Installations and Canada; tax IDs match the Companies file" },
    { id: "D-TC-02", requirementId: "D-REQ-02", module: "Accounting", scenario: "Localization per company", preconditions: "Localizations installed", testData: "Canada", steps: "Tick only Canada; open Chart of Accounts and Taxes", expected: "Canadian chart and GST/HST taxes; no US accounts or taxes visible" },
    { id: "D-TC-03", requirementId: "D-REQ-04", module: "Accounting", scenario: "Fiscal year and lock date per company", preconditions: "Canada fiscal year end 31 March; Distribution lock date 30 Sep 2026", testData: "Journal entry dated 2026-09-29", steps: "Post the entry in Distribution, then in Canada", expected: "Rejected in Distribution (locked); accepted in Canada (not locked)" },
    { id: "D-TC-04", requirementId: "D-REQ-05", module: "Settings", scenario: "Default and allowed companies at login", preconditions: "Users created from the access matrix", testData: "Jenna Park", steps: "Log in as Jenna; open the company switcher", expected: "Default company Distribution; switcher shows Distribution, Installations, Canada — not Holdings" },
    { id: "D-TC-05", requirementId: "D-REQ-06", module: "Sales", scenario: "NEGATIVE — cross-company document by URL", preconditions: "Distribution SO from D-TS-01 exists", testData: "Sophie Tremblay (Canada only)", steps: "Paste the Distribution SO URL", expected: "Access error; no data of the SO displayed" },
    { id: "D-TC-06", requirementId: "D-REQ-06", module: "Accounting", scenario: "NEGATIVE — other companies' invoices in lists and reports", preconditions: "Invoices posted in all companies", testData: "Priya Nair (Distribution only)", steps: "Open Invoices list with all filters removed; open Sales Analysis grouped by company", expected: "Only Distribution records; no Canada or Installations rows or totals" },
    { id: "D-TC-07", requirementId: "D-REQ-07", module: "Contacts/Inventory", scenario: "Shared product, private contact", preconditions: "Products shared; Pinecrest set to Installations", testData: "HV-CBL-HD2; Pinecrest Hotels Group", steps: "As Sophie search the product and the contact", expected: "Product found; Pinecrest not found (negative)" },
    { id: "D-TC-08", requirementId: "D-REQ-09", module: "Accounting", scenario: "Company-specific tax on shared product", preconditions: "Canada taxes configured", testData: "D-TS-03", steps: "Invoice 100 HDMI cables to Northern Lights (Ontario)", expected: "HST 13% = CAD 349.70; total CAD 3,039.70; Canada income account and journal" },
    { id: "D-TC-09", requirementId: "D-REQ-11", module: "Inventory", scenario: "NEGATIVE — warehouse of another company", preconditions: "WH belongs to Distribution", testData: "Sophie, new SO", steps: "Try to select warehouse WH on a Canada SO", expected: "WH not selectable; only WH2 offered" },
    { id: "D-TC-10", requirementId: "D-REQ-12", module: "Purchase/Sales", scenario: "PO in Canada generates SO in Distribution", preconditions: "Inter-company rule active (Enterprise — verify in your training instance)", testData: "D-TS-01", steps: "Confirm the Canada PO; check Distribution", expected: "One SO for Harborview Canada Ltd., USD 19,690.00, same lines, WH warehouse" },
    { id: "D-TC-11", requirementId: "D-REQ-13", module: "Accounting", scenario: "Invoice generates bill", preconditions: "D-TC-10 passed; invoice/bill sync active", testData: "D-TS-02", steps: "Post Distribution invoice; open Canada bills", expected: "Draft bill USD 19,690.00 = CAD 26,778.40 at 1.3600; no duplicate bill" },
    { id: "D-TC-12", requirementId: "D-REQ-14", module: "Sales", scenario: "Transfer price applied", preconditions: "IC pricelists in Distribution", testData: "10 × HV-MNT-T70 to Installations", steps: "Create SO / check generated SO price", expected: "Unit price 39.90 (38.00 × 1.05); total USD 399.00" },
    { id: "D-TC-13", requirementId: "D-REQ-16", module: "Reporting", scenario: "Consolidation eliminations", preconditions: "D-TS-01..D-TS-04 and management fees posted", testData: "October 2026", steps: "Run consolidation (Enterprise or export workbook)", expected: "Inter-company revenue eliminated USD 42,089.00; unrealised profit USD 1,500.00; no suspense balance" },
    { id: "D-TC-14", requirementId: "D-REQ-18", module: "Accounting", scenario: "FX revaluation of open USD bill", preconditions: "Bill of D-TS-02 open at 31 Oct; rate 1.3750", testData: "USD 19,690.00", steps: "Run revaluation; post; check reversal date", expected: "Unrealised loss CAD 295.35 dated 31 Oct, reversed 1 Nov" },
    { id: "D-TC-15", requirementId: "D-REQ-19", module: "Security", scenario: "NEGATIVE — shared service clerk excluded from Holdings", preconditions: "Holdings invoice HVH-MF-2609 exists", testData: "Jenna Park", steps: "Open the invoice by URL; search Holdings journals", expected: "Access error; no Holdings journals or entries returned" },
    { id: "D-TC-16", requirementId: "D-REQ-20", module: "Documents", scenario: "Document layout per company", preconditions: "Layouts configured", testData: "One invoice per company", steps: "Print each invoice", expected: "Each shows its own logo, address and tax ID; Canada shows GST/HST number CA123456789RT0001" },
    { id: "D-TC-17", requirementId: "D-REQ-21", module: "Purchase", scenario: "PO approval threshold per company", preconditions: "Thresholds configured", testData: "Installations PO USD 6,000; Distribution PO USD 6,000", steps: "Confirm both as a purchase user", expected: "Installations PO goes to To Approve; Distribution PO confirmed directly" },
    { id: "D-TC-18", requirementId: "D-REQ-25", module: "Accounting", scenario: "Opening inter-company balances agree", preconditions: "Opening documents imported", testData: "Opening inter-company balances file", steps: "Compare Distribution AR from Canada with Canada AP; Holdings AR with Installations AP", expected: "USD 8,450.00 = USD 8,450.00 (CAD 11,407.50); USD 4,000.00 = USD 4,000.00" },
  ],
  acceptanceCriteria: [
    "All Must requirements implemented and their test cases passed in UAT with sign-off by each entity and by group finance",
    "Each company has its own localization, currency, fiscal year, journals, taxes and lock dates, verified with only that company selected",
    "Every user in the access matrix tested; all negative access tests (URL, list, search, reports, company switcher) return no data from non-allowed companies",
    "Inter-company PO→SO and invoice→bill flows run end to end without re-keying (Enterprise) or with the documented Community fallback and weekly reconciliation",
    "Inter-company balances agree pairwise (after FX) at cut-over and after the first month-end",
    "Opening stock per warehouse (WH Distribution, WH2 Canada) matches the cut-over count and the stock valuation account of each company",
    "First month-end close completed in Odoo: FX revaluation posted and reversed, consolidation produced with documented eliminations and no suspense plug",
    "No duplicate sister-company partners; products and shared contacts exist once",
    "Customizations delivered as installable modules that respect multi-company record rules, with documentation and code review",
  ],
  documentation: [
    "Project charter and plan",
    "Legal-entity fact sheets (per company)",
    "AS-IS process maps incl. inter-company and month-end close",
    "Requirements register with fit-gap matrix, MoSCoW and Enterprise dependencies",
    "Data-ownership matrix (shared vs company-specific records)",
    "User access matrix (allowed companies, default company, groups)",
    "TO-BE process document with inter-company flows and Community fallback",
    "Solution Design Document per company and for the group",
    "Transfer-pricing policy and pricelist set-up",
    "Consolidation and month-end close manual (eliminations, translation rates, FX revaluation)",
    "Functional and technical specifications for customizations",
    "Data migration plan, import logs and inter-company balance agreement report",
    "Test plan incl. negative access tests, test results and UAT sign-off",
    "Cut-over plan, go-live checklist and hypercare/first-close review",
  ],
  rubric: [
    { criterion: "Company and accounting design", weight: 15, excellent: "Companies, localizations, currencies, fiscal years and inter-company accounts correct and justified per legal entity", adequate: "Companies work with minor gaps (e.g. lock dates or fiscal year missing)", poor: "Branches used instead of companies, or localization/currency wrong" },
    { criterion: "Security and access", weight: 20, excellent: "Access matrix fully implemented; positive and negative tests executed with evidence for every role", adequate: "Access mostly correct; few negative tests", poor: "Users given all companies; no negative testing" },
    { criterion: "Shared vs company-specific data", weight: 10, excellent: "Clear data-ownership matrix applied; no duplicate company partners; company-dependent properties handled", adequate: "Policy defined, minor inconsistencies", poor: "Duplicated products/partners or private data visible to other companies" },
    { criterion: "Inter-company flows and transfer pricing", weight: 15, excellent: "PO→SO and invoice→bill tested end to end, prices and FX correct, Enterprise dependency and Community fallback documented", adequate: "Flows work but FX or pricing gaps", poor: "Inter-company not working or edition dependency ignored" },
    { criterion: "Month-end, FX and consolidation", weight: 15, excellent: "Revaluation, eliminations and translation correct with reconciled figures", adequate: "Consolidation produced with some manual plugs", poor: "No consolidation approach or mixed currencies added together" },
    { criterion: "Data migration", weight: 10, excellent: "Imports in correct company context; opening stock and inter-company balances reconciled", adequate: "Imports done; partial reconciliation", poor: "Stock loaded into wrong company or balances do not agree" },
    { criterion: "Customization specs and documentation", weight: 15, excellent: "Honest classification, standard alternatives considered, complete client-ready deliverables", adequate: "Specs and documents present but vague", poor: "Unjustified custom work or missing deliverables" },
  ],
};
