import type { ProjectContent } from "../types";

/**
 * Project E — Legacy ERP to Odoo data migration.
 *
 * Fictional company, fictional legacy product ("LegacyBooks 2009") and synthetic
 * data only. Two kinds of master data files:
 *  - Legacy extracts (no templateKey) — intentionally messy, as profiled from the
 *    legacy database copy.
 *  - Cleansed Odoo-ready files (with templateKey) — use the exact column keys of
 *    the portal's import templates and must validate cleanly in the simulator.
 * All counts and control totals in the AS-IS/TO-BE markdown match the files.
 */
export const migrationProject: ProjectContent = {
  slug: "legacy-erp-migration",
  code: "E",
  title: "Crestline Distributors — legacy ERP to Odoo migration",
  industry: "Wholesale distribution (migration project)",
  level: "advanced",
  odooVersion: "Odoo 17.0",
  summary:
    "Plan and execute the data migration of a food and grocery distributor from an ageing desktop ERP/accounting package (LegacyBooks 2009) to Odoo 17.0: analyse the legacy database, write field and value mappings, cleanse and de-duplicate master data, import in dependency order, migrate opening stock, open AR/AP and the opening trial balance through a suspense account, rehearse with mock migrations and prove every number with a reconciliation pack before go-live.",
  company: {
    name: "Crestline Distributors Pvt Ltd",
    profile: `## Crestline Distributors Pvt Ltd (fictional)

Crestline Distributors buys **rice, flour, spices and edible oils** from mills and processors and distributes them to supermarkets, hotels, caterers and export traders from a main godown in Pune and a branch godown in Mumbai. The Odoo functional design (apps, warehouses, taxes, chart of accounts) has already been agreed in a separate workstream. **This project is the data migration workstream**: everything that must be true about the data on the morning of go-live.

| Attribute | Value |
|---|---|
| Founded | 2004 |
| Annual revenue | ~ INR 42 crore |
| Legacy system | **LegacyBooks 2009** (fictional) — desktop ERP + accounting package on a single on-premise server with a local SQL database; vendor support ended in 2019 |
| Legacy data | 17 years of transactions; ~1,300 customer codes, ~240 vendor codes, ~1,900 item codes — many inactive, duplicated or test records |
| Warehouses | **WH** — Pune main godown (racks R1 and R2 for spices); **WH2** — Mumbai branch godown |
| Fiscal year | April–March (Indian fiscal year) |
| Cut-off / go-live | Cut-off **31 March 2026** (fiscal year end); go-live in Odoo **1 April 2026** |
| Currency | INR (all legacy documents are in INR, including the two export customers) |

### Organisation relevant to the migration
- **Finance** (5): finance controller (data owner for balances), AR clerk, AP clerk, two accountants
- **Sales admin** (3): owns customer master data
- **Purchasing** (2): owns vendor and item master data
- **Warehouse** (16): Pune 11, Mumbai 5 — owns stock counts
- **IT** (1): administers the legacy server and database backups

### Why a dedicated migration project?
The previous attempt to "just export to Excel and import" failed: the trial import created 1,300 customers (the business actually trades with about 800), duplicate items with the same barcode, and an opening stock value that did not match the books by INR 21,928. The management board now requires a **controlled, rehearsed and reconciled** migration with formal sign-off.

### Training data
The master data files in this project are a **representative sample** of the legacy tables (12 customers, 8 vendors, 13 items, 14 stock lines, 16 open items, 17 GL accounts). All reconciliation figures in this project are calculated on that sample, so you can reproduce them exactly.`,
    locations: ["Pune, Maharashtra (Head office & WH — main godown)", "Mumbai (Bhiwandi), Maharashtra (WH2 — branch godown)"],
    employees: 46,
    currency: "INR",
  },
  requirements: [
    { id: "E-REQ-01", area: "Scoping", description: "Fix the cut-off date at 31 March 2026 (fiscal year end) and go-live at 1 April 2026; no postings in LegacyBooks after the cut-off except agreed pre-cutover adjustments approved by the finance controller.", type: "standard", priority: "Must" },
    { id: "E-REQ-02", area: "Scoping", description: "Migrate active records only: customers and vendors with a transaction in the last 24 months OR an open balance at cut-off; items with status Active OR on-hand stock; exclude test, inactive and dormant records.", type: "standard", priority: "Must" },
    { id: "E-REQ-03", area: "Scoping", description: "Do not migrate closed transactional history (paid invoices, completed orders, old stock moves); keep LegacyBooks read-only and archived for the statutory retention period (verify the period with the client's auditor).", type: "standard", priority: "Must" },
    { id: "E-REQ-04", area: "Legacy analysis", description: "Profile the legacy tables CUSTMAST, VENDMAST, ITEMMAST, STOCKBAL, AROPEN, APOPEN and GLBAL: row counts, key uniqueness, blank mandatory fields, distinct code values and obvious duplicates.", type: "standard", priority: "Must" },
    { id: "E-REQ-05", area: "Extraction", description: "Extract data with repeatable, read-only SQL scripts run against a restored COPY of the legacy database (never the live server); every extract is timestamped with row counts and control totals.", type: "customization", priority: "Must" },
    { id: "E-REQ-06", area: "Mapping", description: "Produce an approved data mapping specification per object (legacy table.field → Odoo model.field, transformation rule, mandatory flag, data owner).", type: "standard", priority: "Must" },
    { id: "E-REQ-07", area: "Mapping", description: "Maintain value mapping tables for payment terms, countries, units of measure, item groups → categories, item types → product types and godown codes → locations; every target value must exist in Odoo before import.", type: "configuration", priority: "Must" },
    { id: "E-REQ-08", area: "Cleansing", description: "De-duplicate customers and vendors (same GSTIN or same normalised name) and items (same EAN barcode) with business-approved merge decisions; re-point open documents and stock of merged codes to the surviving code.", type: "standard", priority: "Must" },
    { id: "E-REQ-09", area: "Cleansing", description: "Standardise text: trim spaces, proper-case names, lower-case emails, phone numbers in +91 international format, barcodes valid EAN-13 or blank.", type: "standard", priority: "Must" },
    { id: "E-REQ-10", area: "External IDs", description: "Use External IDs built from legacy codes (categ_<group>, cust_<CUST_CD>, vend_<VEND_CD>, prod_<ITEM_CD>) so files can reference each other and re-imports update instead of duplicating.", type: "standard", priority: "Must" },
    { id: "E-REQ-11", area: "Load sequence", description: "Load in dependency order: product categories → customers and vendors → products → opening stock → open AR/AP documents → opening trial balance entry.", type: "standard", priority: "Must" },
    { id: "E-REQ-12", area: "Inventory", description: "Configure category costing and valuation before products and stock are loaded: average cost for staples, spices and packaging, FIFO for edible oils, automated (real-time) valuation for stock categories.", type: "configuration", priority: "Must" },
    { id: "E-REQ-13", area: "Inventory", description: "Load opening stock per product and location at cut-off, valued at the agreed unit cost, so that the Odoo stock valuation equals the legacy inventory GL balance (INR 977,300.00 on the sample).", type: "standard", priority: "Must" },
    { id: "E-REQ-14", area: "Inventory", description: "Resolve stock exceptions before cut-over: negative balances recounted, consumable packaging expensed, duplicate item stock merged, zero lines dropped.", type: "standard", priority: "Must" },
    { id: "E-REQ-15", area: "Accounting", description: "Load open receivables as individual customer invoices and credit notes (legacy document number, original date, original due date, open balance) against a Migration Suspense account, without recalculating GST.", type: "configuration", priority: "Must" },
    { id: "E-REQ-16", area: "Accounting", description: "Load open payables as individual vendor bills (vendor reference, date, due date, open balance) against the Migration Suspense account.", type: "configuration", priority: "Must" },
    { id: "E-REQ-17", area: "Accounting", description: "Load the opening trial balance as one journal entry dated 31 March 2026 in which the AR, AP and inventory control accounts are replaced by Migration Suspense, so nothing is doubled; Migration Suspense must be exactly 0.00 after all loads.", type: "configuration", priority: "Must" },
    { id: "E-REQ-18", area: "Accounting", description: "Map the legacy chart of accounts to the Odoo localized chart of accounts (many-to-one allowed, e.g. two legacy fixed-asset accounts into one Odoo account) with a signed account mapping table.", type: "configuration", priority: "Must" },
    { id: "E-REQ-19", area: "Mock migrations", description: "Run at least two full mock migrations (dry runs) into a copy of the configured Odoo database, timed end to end, with an issue log and fixes before the next run.", type: "standard", priority: "Must" },
    { id: "E-REQ-20", area: "Reconciliation", description: "Produce a reconciliation pack per run: record counts (extracted / excluded / merged / loaded), control totals (stock value per location, AR and AP totals and ageing, trial balance per account) and a field-level sample check of at least 25 records.", type: "reporting", priority: "Must" },
    { id: "E-REQ-21", area: "Reconciliation", description: "Provide a reusable migration validation report comparing legacy extract figures with Odoo figures per object, re-runnable after every mock and at cut-over.", type: "reporting", priority: "Should" },
    { id: "E-REQ-22", area: "Cutover", description: "Define the cutover plan: legacy freeze time, final extract, delta load of master records created or changed since the last mock (by LAST_UPD_DT), physical stock count, opening balance loads and timeline with owners.", type: "standard", priority: "Must" },
    { id: "E-REQ-23", area: "Cutover", description: "Define a rollback plan: Odoo database backup before each load step, point of no return, go/no-go criteria and the decision maker; LegacyBooks remains usable until the go decision.", type: "standard", priority: "Must" },
    { id: "E-REQ-24", area: "Governance", description: "Obtain formal sign-off per object from the data owners (sales admin, purchasing, warehouse) and of all balances from the finance controller before go-live.", type: "standard", priority: "Must" },
    { id: "E-REQ-25", area: "Traceability", description: "Users must find any migrated customer, vendor or product by its legacy code, and any open invoice or bill by its legacy document number.", type: "standard", priority: "Should" },
  ],
  asIs: `## AS-IS — the legacy landscape

### Systems and data sources
| Source | Content | Owner | Issues found in discovery |
|---|---|---|---|
| **LegacyBooks 2009** (desktop ERP + accounting, local SQL database) | Masters, sales/purchase invoices, stock ledger, general ledger | IT / finance | Unsupported since 2019; no API; no audit of master data changes |
| Excel "customer GST list" | GSTINs maintained outside the ERP | Sales admin | Partly out of date; different spelling of names |
| Excel stock count sheets | Year-end physical count per godown | Warehouse | Rack-level counts for spices not in the ERP |

### Legacy tables in scope
| Table | Purpose | Key | Full DB rows | Sample rows | Profiling findings |
|---|---|---|---|---|---|
| CUSTMAST | Customer master | CUST_CD | 1,312 | 12 | Duplicates under new codes, mixed-case names, trailing spaces, country as "IND"/"UAE"/"U.S.", free-text payment terms, test customers, dormant accounts still Active |
| VENDMAST | Vendor master | VEND_CD | 241 | 8 | Duplicate vendor under second code, "U.A.E.", "EOM+30" terms |
| ITEMMAST | Item master | ITEM_CD | 1,936 | 13 | Same item under two codes (same EAN), EAN with spaces, wrong check digit, legacy UoM codes NOS/PCS/EA/KGS/LTR, discontinued items |
| STOCKBAL | Stock balance per item per godown | ITEM_CD + GODOWN | 2,480 | 14 | Negative balance, zero lines, packaging consumables carried as stock, stock on the duplicate item code |
| AROPEN | Open customer documents | DOC_NO | 418 | 9 | Fully paid rows still listed with balance 0, documents on duplicate customer codes, mixed date formats |
| APOPEN | Open vendor documents | DOC_NO | 133 | 7 | Same issues as AROPEN |
| GLBAL | GL balances per account | ACCT_CD | 212 | 17 | Legacy accounts more granular than Odoo; dormant suspense account |

> The "Full DB rows" column comes from profiling the restored copy of the production database. The training sample is a representative extract; all reconciliation figures in this project are computed on the **sample**.

### How the previous (failed) attempt was done
1. A clerk exported each list to Excel from the LegacyBooks report screen (not from the tables), losing codes on some reports.
2. No filter: every customer ever created was imported, including test and inactive records.
3. No External IDs: a second import to "fix" names created a second copy of every customer.
4. Opening stock was imported before product costs were set, so the valuation was zero, then corrected manually.
5. Opening balances were keyed as one lump-sum journal entry, so open invoices could not be matched with customer payments after go-live.

### Key problems the migration must solve
- **Scope** — which records are really active?
- **Quality** — duplicates, spelling, codes that do not exist in Odoo.
- **Traceability** — every Odoo record must be traceable to a legacy code.
- **Correctness of money** — stock value, AR, AP and the trial balance must match the legacy books to the paisa.
- **Repeatability** — the final load must be a rehearsed, timed routine, not an improvisation on go-live weekend.`,
  toBe: `## TO-BE — migration design

### Approach
\`\`\`
 LegacyBooks DB copy ─▶ EXTRACT (read-only SQL) ─▶ PROFILE ─▶ CLEANSE + MAP ─▶ VALIDATE (import simulator / Odoo Test)
        ─▶ LOAD into Odoo copy (mock 1, mock 2) ─▶ RECONCILE ─▶ fix ─▶ repeat ─▶ CUTOVER (final + delta) ─▶ SIGN-OFF
\`\`\`
- Extraction runs against a **restored copy** of the legacy database; the live server is never queried.
- Cleansing decisions (merge, exclude) are made by the **data owners**; consultants prepare proposals.
- Every load is done first with **Test** in Odoo's import screen (and in the portal import simulator during training).
- An Odoo database **backup** is taken before each load step so any step can be rolled back.

### Scope rules (cut-off 31 March 2026)
| Object | Included | Excluded |
|---|---|---|
| Customers / vendors | STATUS = A **and** (LAST_TXN_DT ≥ 2024-04-01 **or** open balance) | Inactive, test, dormant, duplicates (merged) |
| Items | STATUS = A **or** on-hand stock ≠ 0 | Discontinued with zero stock, inactive, duplicates (merged) |
| Stock | Storable items, quantity > 0 at cut-off | Consumables (expensed), zero lines, negative lines (recounted first) |
| Open AR / AP | BAL_AMT ≠ 0 at cut-off | Fully paid documents |
| GL | All balance-sheet accounts with a balance | Zero-balance accounts; P&L (closed to reserves at fiscal year end) |

### Field mapping (summary of the data mapping specification)
| Legacy table.field | Odoo model.field | Transformation | Mandatory |
|---|---|---|---|
| CUSTMAST.CUST_CD | res.partner.id (External ID) | "cust_" + trimmed code, e.g. cust_C1001 | Yes |
| CUSTMAST.CUST_CD | res.partner.ref | Copy (searchable legacy code) | No |
| CUSTMAST.CUST_NM | res.partner.name | Trim, proper case, keep legal suffix (Pvt Ltd, LLC) | Yes |
| CUSTMAST.CUST_TYPE | res.partner.is_company | C → 1, I → 0 | Yes |
| CUSTMAST.ADDR1 / CITY / PIN | res.partner.street / city / zip | Trim; PIN kept as text | No |
| CUSTMAST.CNTRY | res.partner.country_id | Value map (IND/india → India, UAE → United Arab Emirates, U.S./USA → United States) | Yes |
| CUSTMAST.GSTIN | res.partner.vat | Upper case, remove spaces; blank for foreign customers | No |
| CUSTMAST.PAYTRM | res.partner.property_payment_term_id | Value map (Net 30 → 30 Days, COD → Immediate Payment, EOM → End of Following Month …) | No |
| CUSTMAST.EMAIL / PHONE | res.partner.email / phone | Lower case / +91 format | No |
| CUSTMAST.STATUS, LAST_TXN_DT | — (filter) | Scope rule, not migrated | — |
| VENDMAST.* | res.partner (vendor) | Same rules; "vend_" prefix; supplier_rank = 1 | — |
| ITEMMAST.ITEM_CD | product.template.id / default_code | "prod_" + code / copy code | Yes |
| ITEMMAST.ITEM_DESC | product.template.name | Trim, proper case, expand abbreviations | Yes |
| ITEMMAST.ITEM_TYPE | product.template.detailed_type | S → product, C → consu, N → service | Yes |
| ITEMMAST.ITEM_GRP | product.template.categ_id/id | STPL → categ_staples, SPCE → categ_spices, OILS → categ_oils, PACK → categ_packaging, SRV → categ_services | Yes |
| ITEMMAST.UOM / PUR_UOM | product.template.uom_id / uom_po_id | NOS/PCS/EA → Units, KGS → kg, LTR → L | No |
| ITEMMAST.SELL_RATE / STD_COST | product.template.list_price / standard_price | Numeric, dot decimal, 2 decimals | No |
| ITEMMAST.EAN | product.template.barcode | Remove spaces; must pass EAN-13 check digit; unique | No |
| STOCKBAL.ITEM_CD | stock.quant.product_id/id | "prod_" + surviving item code | Yes |
| STOCKBAL.GODOWN | stock.quant.location_id | MAIN → WH/Stock, BR01 → WH2/Stock, MAIN-R1 → WH/Stock/Shelf 1, MAIN-R2 → WH/Stock/Shelf 2 | Yes |
| STOCKBAL.QTY | stock.quant.inventory_quantity | Sum per product + location; must be > 0 | Yes |
| AROPEN.DOC_NO / APOPEN.DOC_NO | account.move.ref | Copy legacy number (searchable) | Yes |
| AROPEN.DOC_DT / DUE_DT | account.move.invoice_date / invoice_date_due | Normalise to YYYY-MM-DD | Yes |
| AROPEN.BAL_AMT | account.move.line price_unit (account = Migration Suspense, no tax) | Open balance only; negative → credit note | Yes |
| GLBAL.ACCT_CD | account.move.line.account_id | Account mapping table (many-to-one) | Yes |

### External ID strategy and load order
| Order | File | Template | External ID pattern | Depends on |
|---|---|---|---|---|
| 0 | Configuration: payment terms, warehouses WH/WH2, shelves, Migration Suspense account, opening journals | manual / configuration | — | — |
| 1 | Product categories | product-categories | categ_<name> | — |
| 2 | Customers | customers | cust_<CUST_CD> | Countries, payment terms |
| 3 | Vendors | vendors | vend_<VEND_CD> | Countries, payment terms |
| 4 | Products | products | prod_<ITEM_CD> | Categories, UoM |
| 5 | Opening stock (then **Apply**) | opening-stock | — (product + location) | Products, locations, product costs |
| 6 | Open AR invoices / credit notes, open AP bills | account.move import | — (legacy number in ref) | Partners, Migration Suspense |
| 7 | Opening trial balance entry | account.move (journal entry) | — | Account mapping, all of the above |

### Opening balances through Migration Suspense
| Step | Entry | Migration Suspense |
|---|---|---|
| Opening stock applied | Dr Stock Valuation 977,300.00 / Cr Migration Suspense 977,300.00 | Cr 977,300.00 |
| Open AR (7 invoices 439,740.00 less 1 credit note 5,300.00) | Dr Receivable 434,440.00 / Cr Migration Suspense 434,440.00 | Cr 434,440.00 |
| Open AP (6 bills) | Dr Migration Suspense 404,000.00 / Cr Payable 404,000.00 | Dr 404,000.00 |
| Opening trial balance entry | All other balances + Dr Migration Suspense 1,007,740.00 | Dr 1,007,740.00 |
| **Balance after all loads** | 977,300.00 + 434,440.00 − 404,000.00 − 1,007,740.00 | **0.00** |

The counterpart account of the opening inventory adjustment must be Migration Suspense. In Odoo 17 this is done by setting the valuation accounts on the inventory adjustment virtual location, or by reclassifying the posted counterpart with a journal entry (verify in your training instance).

### Reconciliation (training sample)
| Object | Legacy rows | Excluded | Merged | Loaded in Odoo | Control total legacy | Control total Odoo |
|---|---|---|---|---|---|---|
| Item groups → product categories | 5 groups | — | — | 6 categories (+ parent "Food & Grocery") | — | — |
| Customers (CUSTMAST) | 12 | 3 (C1007 inactive, C1011 test, C1012 dormant) | 1 (C1003 → C1002) | 8 | — | — |
| Vendors (VENDMAST) | 8 | 1 (V2007 inactive) | 1 (V2005 → V2004) | 6 | — | — |
| Products (ITEMMAST) | 13 | 2 (I3012 discontinued, I3013 inactive) | 1 (I3009 → I3007) | 10 (8 storable, 1 consumable, 1 service) | — | — |
| Opening stock (STOCKBAL) | 14 lines | 3 (I3005/BR01 negative −4, I3010 consumable, I3012 zero) | 1 (I3009 into I3007/MAIN) | 10 quants | Raw 999,228.00 → adjusted 977,300.00 | 977,300.00 |
| Open AR (AROPEN) | 9 | 1 (INV/25-26/0390 zero balance) | 0 (1 document re-pointed C1003 → C1002) | 8 (7 invoices, 1 credit note) | 434,440.00 | 434,440.00 |
| Open AP (APOPEN) | 7 | 1 (PB-6650 zero balance) | 0 (1 document re-pointed V2005 → V2004) | 6 bills | 404,000.00 | 404,000.00 |
| Trial balance (GLBAL) | 17 accounts | 1 (2999 zero) | 2 (1501 + 1502 → one fixed-asset account) | 13 lines incl. suspense | Dr = Cr = 4,738,180.00 | Dr = Cr = 4,738,180.00 (TB report after all loads) |

**Stock value bridge:** STOCKBAL raw total 999,228.00 − packaging cartons expensed 22,200.00 (pre-cutover adjustment in LegacyBooks) + negative line corrected to zero 272.00 = **977,300.00** = GLBAL 1301 STOCK IN TRADE.

**Stock value per location (Odoo):** WH/Stock 646,300.00 · WH2/Stock 216,300.00 · WH/Stock/Shelf 1 68,800.00 · WH/Stock/Shelf 2 45,900.00 · **total 977,300.00**.

**Ageing at 31 March 2026:** AR not due 371,040.00 (incl. credit note −5,300.00), 1–30 days overdue 63,400.00, total 434,440.00. AP not due 276,000.00, 1–30 days overdue 128,000.00, total 404,000.00.`,
  masterDataFiles: [
    {
      name: "Legacy CUSTMAST extract",
      description:
        "Raw extract of the customer master from the LegacyBooks database copy (SELECT * FROM CUSTMAST, sample). Intentionally messy: duplicate C1003 (same GSTIN as C1002), trailing spaces, inconsistent case, country written as IND/UAE/U.S., free-text payment terms, inactive (C1007), test (C1011) and dormant (C1012, no transaction since 2022 and no balance) records. Not an import file.",
      rows: [
        { CUST_CD: "C1001", CUST_NM: "SHREE GANESH TRADERS ", CUST_TYPE: "C", ADDR1: "14 Market Yard Road", CITY: "Pune", PIN: "411037", CNTRY: "India", GSTIN: "27AABCS1234F1Z5", PAYTRM: "Net 30", EMAIL: "Accounts@ShreeGanesh.example", PHONE: "020-2426 1100", STATUS: "A", LAST_TXN_DT: "2026-03-18" },
        { CUST_CD: "C1002", CUST_NM: "Metro Mart Retail Pvt Ltd", CUST_TYPE: "C", ADDR1: "Unit 5, Phoenix Mills Compound", CITY: "Mumbai", PIN: "400013", CNTRY: "IND", GSTIN: "27AACCM5678K1Z2", PAYTRM: "Net 45", EMAIL: "ap@metromart.example", PHONE: "+91 22 4005 2200", STATUS: "A", LAST_TXN_DT: "2026-03-29" },
        { CUST_CD: "C1003", CUST_NM: "metro mart retail pvt. ltd.", CUST_TYPE: "C", ADDR1: "Unit 5 Phoenix Mills Cmpd", CITY: "MUMBAI", PIN: "400013", CNTRY: "India", GSTIN: "27AACCM5678K1Z2", PAYTRM: "N45", EMAIL: "", PHONE: "", STATUS: "A", LAST_TXN_DT: "2026-03-05" },
        { CUST_CD: "C1004", CUST_NM: "Coastal Hospitality Group", CUST_TYPE: "C", ADDR1: "Marine Drive, Ernakulam", CITY: "Kochi", PIN: "682011", CNTRY: "India", GSTIN: "32AAECC4321L1Z9", PAYTRM: "Net 30", EMAIL: "purchase@coastalhospitality.example", PHONE: "0484 236 7700", STATUS: "A", LAST_TXN_DT: "2026-03-25" },
        { CUST_CD: "C1005", CUST_NM: "Desert Rose Trading LLC", CUST_TYPE: "C", ADDR1: "Al Ras, Deira", CITY: "Dubai", PIN: "", CNTRY: "UAE", GSTIN: "", PAYTRM: "COD", EMAIL: "orders@desertrose.example", PHONE: "+971 4 225 0101", STATUS: "A", LAST_TXN_DT: "2026-03-14" },
        { CUST_CD: "C1006", CUST_NM: "Harbor Point Imports Inc", CUST_TYPE: "C", ADDR1: "410 Raymond Blvd", CITY: "Newark", PIN: "07102", CNTRY: "U.S.", GSTIN: "", PAYTRM: "Net 30", EMAIL: "buying@harborpoint.example", PHONE: "+1 973 555 0144", STATUS: "A", LAST_TXN_DT: "2026-01-22" },
        { CUST_CD: "C1007", CUST_NM: "Old Town Provisions", CUST_TYPE: "C", ADDR1: "Johari Bazar", CITY: "Jaipur", PIN: "302003", CNTRY: "India", GSTIN: "08AAGFO9876B1Z1", PAYTRM: "Net 30", EMAIL: "", PHONE: "0141 256 0000", STATUS: "I", LAST_TXN_DT: "2021-07-09" },
        { CUST_CD: "C1008", CUST_NM: "Lakeside Foods & Beverages", CUST_TYPE: "C", ADDR1: "22 Ulsoor Road", CITY: "Bengaluru", PIN: "560042", CNTRY: "india", GSTIN: "29aafcl2468m1z4", PAYTRM: " net 15", EMAIL: "finance@lakesidefoods.example ", PHONE: "080 4120 3300", STATUS: "A", LAST_TXN_DT: "2026-03-20" },
        { CUST_CD: "C1009", CUST_NM: "Sunrise Supermarkets", CUST_TYPE: "C", ADDR1: "Road No 12, Banjara Hills", CITY: "Hyderabad", PIN: "500034", CNTRY: "India", GSTIN: "36AAKCS1357N1Z6", PAYTRM: "EOM", EMAIL: "payables@sunrisesuper.example", PHONE: "040 2335 8800", STATUS: "A", LAST_TXN_DT: "2026-03-28" },
        { CUST_CD: "C1010", CUST_NM: "KIRAN MEHTA", CUST_TYPE: "I", ADDR1: "7 Satellite Road", CITY: "Ahmedabad", PIN: "380015", CNTRY: "India", GSTIN: "", PAYTRM: "COD", EMAIL: "kiran.mehta@mail.example", PHONE: "98250 11223", STATUS: "A", LAST_TXN_DT: "2026-02-11" },
        { CUST_CD: "C1011", CUST_NM: "TEST CUSTOMER DO NOT USE", CUST_TYPE: "C", ADDR1: "x", CITY: "Pune", PIN: "", CNTRY: "India", GSTIN: "", PAYTRM: "", EMAIL: "test@test", PHONE: "", STATUS: "I", LAST_TXN_DT: "2015-04-01" },
        { CUST_CD: "C1012", CUST_NM: "Northstar Distributors", CUST_TYPE: "C", ADDR1: "Okhla Phase II", CITY: "New Delhi", PIN: "110020", CNTRY: "India", GSTIN: "07AAHCN2468C1Z3", PAYTRM: "Net 30", EMAIL: "info@northstar.example", PHONE: "011 4161 0000", STATUS: "A", LAST_TXN_DT: "2022-03-14" },
      ],
    },
    {
      name: "Legacy VENDMAST extract",
      description:
        "Raw extract of the vendor master (sample). Duplicate V2005 is the same mill as V2004 (same GSTIN, lower-case name with trailing space); V2007 is inactive. Payment terms and countries need value mapping (EOM+30, N15, SG, U.A.E.). Not an import file.",
      rows: [
        { VEND_CD: "V2001", VEND_NM: "Annapurna Agro Foods Pvt Ltd", ADDR1: "MIDC Ambad", CITY: "Nashik", PIN: "422010", CNTRY: "India", GSTIN: "27AAGCA1122P1Z3", PAYTRM: "Net 30", EMAIL: "sales@annapurnaagro.example", PHONE: "0253 238 1000", STATUS: "A", LAST_TXN_DT: "2026-03-27" },
        { VEND_CD: "V2002", VEND_NM: "KERALA SPICE EXPORTERS", ADDR1: "Mattancherry", CITY: "Kochi", PIN: "682002", CNTRY: "India", GSTIN: "32AAHFK3344Q1Z7", PAYTRM: "Net 45", EMAIL: "trade@keralaspice.example", PHONE: "0484 222 4400", STATUS: "A", LAST_TXN_DT: "2026-03-08" },
        { VEND_CD: "V2003", VEND_NM: "Pacific Packaging Solutions Pte Ltd", ADDR1: "8 Shenton Way", CITY: "Singapore", PIN: "068811", CNTRY: "SG", GSTIN: "", PAYTRM: "EOM+30", EMAIL: "export@pacificpack.example", PHONE: "+65 6221 0909", STATUS: "A", LAST_TXN_DT: "2026-03-12" },
        { VEND_CD: "V2004", VEND_NM: "Golden Grain Mills", ADDR1: "Focal Point, Phase 4", CITY: "Ludhiana", PIN: "141010", CNTRY: "India", GSTIN: "03AAJFG5566R1Z1", PAYTRM: "Net 30", EMAIL: "accounts@goldengrain.example", PHONE: "0161 267 5500", STATUS: "A", LAST_TXN_DT: "2026-02-26" },
        { VEND_CD: "V2005", VEND_NM: "golden grain mills ", ADDR1: "Focal Pt Ph-4", CITY: "LUDHIANA", PIN: "141010", CNTRY: "India", GSTIN: "03AAJFG5566R1Z1", PAYTRM: "30 days", EMAIL: "", PHONE: "", STATUS: "A", LAST_TXN_DT: "2026-03-15" },
        { VEND_CD: "V2006", VEND_NM: "Rapid Freight Carriers", ADDR1: "Saki Vihar Road, Andheri East", CITY: "Mumbai", PIN: "400072", CNTRY: "India", GSTIN: "27AAKFR7788S1Z8", PAYTRM: "N15", EMAIL: "billing@rapidfreight.example", PHONE: "022 2857 9000", STATUS: "A", LAST_TXN_DT: "2026-03-26" },
        { VEND_CD: "V2007", VEND_NM: "Old Supplier Co", ADDR1: "", CITY: "Pune", PIN: "", CNTRY: "India", GSTIN: "", PAYTRM: "Net 30", EMAIL: "", PHONE: "", STATUS: "I", LAST_TXN_DT: "2019-10-30" },
        { VEND_CD: "V2008", VEND_NM: "Blue Ocean Edible Oils LLC", ADDR1: "Jebel Ali Free Zone", CITY: "Dubai", PIN: "", CNTRY: "U.A.E.", GSTIN: "", PAYTRM: "Net 45", EMAIL: "sales@blueoceanoils.example", PHONE: "+971 4 881 2020", STATUS: "A", LAST_TXN_DT: "2026-03-18" },
      ],
    },
    {
      name: "Legacy ITEMMAST extract",
      description:
        "Raw extract of the item master (sample). I3009 is the same 15 L sunflower oil tin as I3007 (same EAN, created by a second buyer); I3002 has spaces in the EAN; I3003 has a wrong check digit (corrected barcode 8907654001020 confirmed with the mill); legacy UoM codes NOS/PCS/EA/KGS/LTR; ITEM_TYPE S = stock, C = consumable, N = non-stock service; I3012 is discontinued with zero stock and I3013 inactive. Not an import file.",
      rows: [
        { ITEM_CD: "I3001", ITEM_DESC: "BASMATI RICE PREMIUM 5KG BAG ", ITEM_GRP: "STPL", ITEM_TYPE: "S", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "650", STD_COST: "480.00", EAN: "8907654001006", STATUS: "A" },
        { ITEM_CD: "I3002", ITEM_DESC: "Sona Masoori Rice 25kg Bag", ITEM_GRP: "STPL", ITEM_TYPE: "S", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "1,450.00", STD_COST: "1120", EAN: "8907654 001013", STATUS: "A" },
        { ITEM_CD: "I3003", ITEM_DESC: "Whole Wheat Atta 10 Kg", ITEM_GRP: "STPL", ITEM_TYPE: "S", UOM: "PCS", PUR_UOM: "PCS", SELL_RATE: "420.00", STD_COST: "315.00", EAN: "8907654001025", STATUS: "A" },
        { ITEM_CD: "I3004", ITEM_DESC: "Turmeric Pwdr 500g Pouch", ITEM_GRP: "SPCE", ITEM_TYPE: "S", UOM: "EA", PUR_UOM: "EA", SELL_RATE: "95.00", STD_COST: "58.00", EAN: "8907654001037", STATUS: "A" },
        { ITEM_CD: "I3005", ITEM_DESC: "Red Chilli Pwdr 500g Pouch", ITEM_GRP: "SPCE", ITEM_TYPE: "S", UOM: "EA", PUR_UOM: "EA", SELL_RATE: "110.00", STD_COST: "68.00", EAN: "8907654001044", STATUS: "A" },
        { ITEM_CD: "I3006", ITEM_DESC: "Black Pepper Whole - Loose", ITEM_GRP: "SPCE", ITEM_TYPE: "S", UOM: "KGS", PUR_UOM: "KGS", SELL_RATE: "720.00", STD_COST: "540.00", EAN: "", STATUS: "A" },
        { ITEM_CD: "I3007", ITEM_DESC: "Sunflower Oil 15 Ltr Tin", ITEM_GRP: "OILS", ITEM_TYPE: "S", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "2350.00", STD_COST: "1890.00", EAN: "8907654001051", STATUS: "A" },
        { ITEM_CD: "I3008", ITEM_DESC: "Groundnut Oil Loose (per ltr)", ITEM_GRP: "OILS", ITEM_TYPE: "S", UOM: "LTR", PUR_UOM: "LTR", SELL_RATE: "185.00", STD_COST: "142.00", EAN: "", STATUS: "A" },
        { ITEM_CD: "I3009", ITEM_DESC: "SUNFLOWER OIL 15L TIN", ITEM_GRP: "OILS", ITEM_TYPE: "S", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "2350.00", STD_COST: "1890.00", EAN: "8907654001051", STATUS: "A" },
        { ITEM_CD: "I3010", ITEM_DESC: "Corrugated Carton 5 Ply", ITEM_GRP: "PACK", ITEM_TYPE: "C", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "0", STD_COST: "18.50", EAN: "", STATUS: "A" },
        { ITEM_CD: "I3011", ITEM_DESC: "Delivery Charges", ITEM_GRP: "SRV", ITEM_TYPE: "N", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "250.00", STD_COST: "0", EAN: "", STATUS: "A" },
        { ITEM_CD: "I3012", ITEM_DESC: "Diwali Gift Hamper 2019", ITEM_GRP: "STPL", ITEM_TYPE: "S", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "1499.00", STD_COST: "1150.00", EAN: "", STATUS: "D" },
        { ITEM_CD: "I3013", ITEM_DESC: "Rice 1kg (old pack)", ITEM_GRP: "STPL", ITEM_TYPE: "S", UOM: "NOS", PUR_UOM: "NOS", SELL_RATE: "120.00", STD_COST: "88.00", EAN: "", STATUS: "I" },
      ],
    },
    {
      name: "Legacy STOCKBAL extract",
      description:
        "Raw stock balances per item and godown at 31 March 2026 after the year-end count (sample). Raw total STK_VALUE = 999,228.00. Exceptions: I3005 at BR01 is negative (−4); I3009 holds stock of the duplicate item; I3010 cartons are consumables; I3012 is a zero line. Not an import file.",
      rows: [
        { ITEM_CD: "I3001", GODOWN: "MAIN", QTY: "400", UOM: "NOS", UNIT_COST: "480.00", STK_VALUE: "192000.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3001", GODOWN: "BR01", QTY: "150", UOM: "NOS", UNIT_COST: "480.00", STK_VALUE: "72000.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3002", GODOWN: "MAIN", QTY: "220", UOM: "NOS", UNIT_COST: "1120.00", STK_VALUE: "246400.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3003", GODOWN: "MAIN", QTY: "300", UOM: "PCS", UNIT_COST: "315.00", STK_VALUE: "94500.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3003", GODOWN: "BR01", QTY: "120", UOM: "PCS", UNIT_COST: "315.00", STK_VALUE: "37800.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3004", GODOWN: "MAIN-R1", QTY: "600", UOM: "EA", UNIT_COST: "58.00", STK_VALUE: "34800.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3005", GODOWN: "MAIN-R1", QTY: "500", UOM: "EA", UNIT_COST: "68.00", STK_VALUE: "34000.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3005", GODOWN: "BR01", QTY: "-4", UOM: "EA", UNIT_COST: "68.00", STK_VALUE: "-272.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3006", GODOWN: "MAIN-R2", QTY: "85.000", UOM: "KGS", UNIT_COST: "540.00", STK_VALUE: "45900.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3007", GODOWN: "MAIN", QTY: "48", UOM: "NOS", UNIT_COST: "1890.00", STK_VALUE: "90720.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3009", GODOWN: "MAIN", QTY: "12", UOM: "NOS", UNIT_COST: "1890.00", STK_VALUE: "22680.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3008", GODOWN: "BR01", QTY: "750.000", UOM: "LTR", UNIT_COST: "142.00", STK_VALUE: "106500.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3010", GODOWN: "MAIN", QTY: "1200", UOM: "NOS", UNIT_COST: "18.50", STK_VALUE: "22200.00", AS_OF: "31/03/2026" },
        { ITEM_CD: "I3012", GODOWN: "MAIN", QTY: "0", UOM: "NOS", UNIT_COST: "1150.00", STK_VALUE: "0.00", AS_OF: "31/03/2026" },
      ],
    },
    {
      name: "Legacy AROPEN / APOPEN extract",
      description:
        "Open customer (AROPEN) and vendor (APOPEN) documents at 31 March 2026 (sample). Messy: fully paid rows with BAL_AMT 0, documents booked on duplicate codes C1003 and V2005, a DD/MM/YYYY date in one row, a credit note with a negative balance. Open totals: AR 434,440.00 (8 documents), AP 404,000.00 (6 documents). Not an import file.",
      rows: [
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0412", PARTY_CD: "C1001", DOC_DT: "2026-02-20", DUE_DT: "2026-03-22", DOC_AMT: "84500.00", PAID_AMT: "40000.00", BAL_AMT: "44500.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0438", PARTY_CD: "C1002", DOC_DT: "2026-03-02", DUE_DT: "2026-04-16", DOC_AMT: "156200.00", PAID_AMT: "0.00", BAL_AMT: "156200.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0441", PARTY_CD: "C1003", DOC_DT: "2026-03-05", DUE_DT: "2026-04-19", DOC_AMT: "38750.00", PAID_AMT: "0.00", BAL_AMT: "38750.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0450", PARTY_CD: "C1004", DOC_DT: "2026-03-10", DUE_DT: "2026-04-09", DOC_AMT: "62300.00", PAID_AMT: "0.00", BAL_AMT: "62300.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0457", PARTY_CD: "C1005", DOC_DT: "14/03/2026", DUE_DT: "14/03/2026", DOC_AMT: "18900.00", PAID_AMT: "0.00", BAL_AMT: "18900.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0463", PARTY_CD: "C1008", DOC_DT: "2026-03-20", DUE_DT: "2026-04-04", DOC_AMT: "27640.00", PAID_AMT: "0.00", BAL_AMT: "27640.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "CN/25-26/0021", PARTY_CD: "C1004", DOC_DT: "2026-03-25", DUE_DT: "2026-03-25", DOC_AMT: "-5300.00", PAID_AMT: "0.00", BAL_AMT: "-5300.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0470", PARTY_CD: "C1009", DOC_DT: "2026-03-28", DUE_DT: "2026-04-30", DOC_AMT: "91450.00", PAID_AMT: "0.00", BAL_AMT: "91450.00", CURR: "INR" },
        { SRC_TBL: "AROPEN", DOC_NO: "INV/25-26/0390", PARTY_CD: "C1007", DOC_DT: "2025-11-12", DUE_DT: "2025-12-12", DOC_AMT: "15600.00", PAID_AMT: "15600.00", BAL_AMT: "0.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "PB-7781", PARTY_CD: "V2001", DOC_DT: "2026-02-27", DUE_DT: "2026-03-29", DOC_AMT: "128000.00", PAID_AMT: "0.00", BAL_AMT: "128000.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "KSE/1123", PARTY_CD: "V2002", DOC_DT: "2026-03-08", DUE_DT: "2026-04-22", DOC_AMT: "74250.00", PAID_AMT: "0.00", BAL_AMT: "74250.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "PPS-INV-5590", PARTY_CD: "V2003", DOC_DT: "2026-03-12", DUE_DT: "2026-04-30", DOC_AMT: "33600.00", PAID_AMT: "0.00", BAL_AMT: "33600.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "GGM/0921", PARTY_CD: "V2005", DOC_DT: "2026-03-15", DUE_DT: "2026-04-14", DOC_AMT: "96800.00", PAID_AMT: "0.00", BAL_AMT: "96800.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "RFC-2231", PARTY_CD: "V2006", DOC_DT: "2026-03-26", DUE_DT: "2026-04-10", DOC_AMT: "12400.00", PAID_AMT: "0.00", BAL_AMT: "12400.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "BOE-0087", PARTY_CD: "V2008", DOC_DT: "2026-03-18", DUE_DT: "2026-05-02", DOC_AMT: "58950.00", PAID_AMT: "0.00", BAL_AMT: "58950.00", CURR: "INR" },
        { SRC_TBL: "APOPEN", DOC_NO: "PB-6650", PARTY_CD: "V2007", DOC_DT: "2019-09-30", DUE_DT: "2019-10-30", DOC_AMT: "8400.00", PAID_AMT: "8400.00", BAL_AMT: "0.00", CURR: "INR" },
      ],
    },
    {
      name: "Legacy GLBAL trial balance at cut-off",
      description:
        "Closing trial balance from LegacyBooks at 31 March 2026, after the approved pre-cutover adjustments (cartons expensed, negative stock corrected) and after the year's P&L was closed to reserves. Debits = credits = 4,738,180.00. Control accounts 1201, 2101 and 1301 must equal the AROPEN, APOPEN and adjusted STOCKBAL totals. Not an import file.",
      rows: [
        { ACCT_CD: "1101", ACCT_NM: "HDFC BANK C/A", DR_BAL: "1245860.00", CR_BAL: "0.00" },
        { ACCT_CD: "1105", ACCT_NM: "CASH ON HAND", DR_BAL: "18400.00", CR_BAL: "0.00" },
        { ACCT_CD: "1201", ACCT_NM: "SUNDRY DEBTORS", DR_BAL: "434440.00", CR_BAL: "0.00" },
        { ACCT_CD: "1301", ACCT_NM: "STOCK IN TRADE", DR_BAL: "977300.00", CR_BAL: "0.00" },
        { ACCT_CD: "1401", ACCT_NM: "INPUT CGST", DR_BAL: "31090.00", CR_BAL: "0.00" },
        { ACCT_CD: "1402", ACCT_NM: "INPUT SGST", DR_BAL: "31090.00", CR_BAL: "0.00" },
        { ACCT_CD: "1501", ACCT_NM: "VEHICLES (NET)", DR_BAL: "1200000.00", CR_BAL: "0.00" },
        { ACCT_CD: "1502", ACCT_NM: "WAREHOUSE EQUIPMENT (NET)", DR_BAL: "650000.00", CR_BAL: "0.00" },
        { ACCT_CD: "1601", ACCT_NM: "SECURITY DEPOSITS", DR_BAL: "150000.00", CR_BAL: "0.00" },
        { ACCT_CD: "2101", ACCT_NM: "SUNDRY CREDITORS", DR_BAL: "0.00", CR_BAL: "404000.00" },
        { ACCT_CD: "2201", ACCT_NM: "OUTPUT CGST", DR_BAL: "0.00", CR_BAL: "35760.00" },
        { ACCT_CD: "2202", ACCT_NM: "OUTPUT SGST", DR_BAL: "0.00", CR_BAL: "35760.00" },
        { ACCT_CD: "2301", ACCT_NM: "TDS PAYABLE", DR_BAL: "0.00", CR_BAL: "9860.00" },
        { ACCT_CD: "2401", ACCT_NM: "TERM LOAN - HDFC", DR_BAL: "0.00", CR_BAL: "900000.00" },
        { ACCT_CD: "2999", ACCT_NM: "SUSPENSE A/C", DR_BAL: "0.00", CR_BAL: "0.00" },
        { ACCT_CD: "3001", ACCT_NM: "SHARE CAPITAL", DR_BAL: "0.00", CR_BAL: "1000000.00" },
        { ACCT_CD: "3101", ACCT_NM: "RESERVES & SURPLUS", DR_BAL: "0.00", CR_BAL: "2352800.00" },
      ],
    },
    {
      name: "Value mapping tables",
      description:
        "Approved legacy-value → Odoo-value translations used by the transformation step. Every Odoo value must exist in the target database before the file that uses it is imported (payment terms and locations are configured in step 0).",
      rows: [
        { domain: "Country", legacy_value: "India / india / IND", odoo_value: "India", note: "Case-insensitive match after trimming" },
        { domain: "Country", legacy_value: "UAE / U.A.E.", odoo_value: "United Arab Emirates", note: "" },
        { domain: "Country", legacy_value: "U.S. / USA", odoo_value: "United States", note: "" },
        { domain: "Country", legacy_value: "SG", odoo_value: "Singapore", note: "Or use country_id/id = base.sg" },
        { domain: "Payment term", legacy_value: "Net 30 / 30 days", odoo_value: "30 Days", note: "" },
        { domain: "Payment term", legacy_value: "Net 45 / N45", odoo_value: "45 Days", note: "" },
        { domain: "Payment term", legacy_value: "net 15 / N15", odoo_value: "15 Days", note: "" },
        { domain: "Payment term", legacy_value: "COD", odoo_value: "Immediate Payment", note: "" },
        { domain: "Payment term", legacy_value: "EOM / EOM+30", odoo_value: "End of Following Month", note: "Confirmed with finance: legacy EOM meant end of following month" },
        { domain: "UoM", legacy_value: "NOS / PCS / EA", odoo_value: "Units", note: "" },
        { domain: "UoM", legacy_value: "KGS", odoo_value: "kg", note: "" },
        { domain: "UoM", legacy_value: "LTR", odoo_value: "L", note: "" },
        { domain: "Item group", legacy_value: "STPL / SPCE / OILS / PACK / SRV", odoo_value: "categ_staples / categ_spices / categ_oils / categ_packaging / categ_services", note: "Parent categ_food added for food groups" },
        { domain: "Item type", legacy_value: "S / C / N", odoo_value: "product / consu / service", note: "Odoo 17 detailed_type" },
        { domain: "Godown", legacy_value: "MAIN / BR01 / MAIN-R1 / MAIN-R2", odoo_value: "WH/Stock / WH2/Stock / WH/Stock/Shelf 1 / WH/Stock/Shelf 2", note: "Shelves created as sub-locations of WH/Stock" },
        { domain: "Merged code", legacy_value: "C1003 / V2005 / I3009", odoo_value: "cust_C1002 / vend_V2004 / prod_I3007", note: "Open documents and stock re-pointed to the surviving code" },
      ],
    },
    {
      name: "Product categories",
      templateKey: "product-categories",
      description: "Odoo categories derived from legacy ITEM_GRP, with a new parent 'Food & Grocery'. Costing method and valuation agreed with the finance controller before any product or stock is loaded.",
      rows: [
        { id: "categ_food", name: "Food & Grocery", "parent_id/id": "product.product_category_all", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_staples", name: "Staples (Rice & Flour)", "parent_id/id": "categ_food", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_spices", name: "Spices", "parent_id/id": "categ_food", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_oils", name: "Edible Oils", "parent_id/id": "categ_food", property_cost_method: "fifo", property_valuation: "real_time" },
        { id: "categ_packaging", name: "Packaging Materials", "parent_id/id": "product.product_category_all", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_services", name: "Services", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "manual_periodic" },
      ],
    },
    {
      name: "Customers (cleansed)",
      templateKey: "customers",
      description:
        "8 customers derived from 12 CUSTMAST rows: C1003 merged into C1002, C1007/C1011/C1012 excluded by scope rules. Names proper-cased and trimmed, emails lower-cased, phones in +91 format, countries and payment terms mapped. GSTINs are synthetic — if GSTIN validation is active in your training database, clear the vat column (verify in your training instance).",
      rows: [
        { id: "cust_C1001", name: "Shree Ganesh Traders", is_company: "1", email: "accounts@shreeganesh.example", phone: "+91 20 2426 1100", street: "14 Market Yard Road", city: "Pune", zip: "411037", country_id: "India", vat: "27AABCS1234F1Z5", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_C1002", name: "Metro Mart Retail Pvt Ltd", is_company: "1", email: "ap@metromart.example", phone: "+91 22 4005 2200", street: "Unit 5, Phoenix Mills Compound", city: "Mumbai", zip: "400013", country_id: "India", vat: "27AACCM5678K1Z2", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_C1004", name: "Coastal Hospitality Group", is_company: "1", email: "purchase@coastalhospitality.example", phone: "+91 484 236 7700", street: "Marine Drive, Ernakulam", city: "Kochi", zip: "682011", country_id: "India", vat: "32AAECC4321L1Z9", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_C1005", name: "Desert Rose Trading LLC", is_company: "1", email: "orders@desertrose.example", phone: "+971 4 225 0101", street: "Al Ras, Deira", city: "Dubai", zip: "", country_id: "United Arab Emirates", vat: "", property_payment_term_id: "Immediate Payment", customer_rank: "1" },
        { id: "cust_C1006", name: "Harbor Point Imports Inc", is_company: "1", email: "buying@harborpoint.example", phone: "+1 973 555 0144", street: "410 Raymond Blvd", city: "Newark", zip: "07102", country_id: "United States", vat: "", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_C1008", name: "Lakeside Foods & Beverages", is_company: "1", email: "finance@lakesidefoods.example", phone: "+91 80 4120 3300", street: "22 Ulsoor Road", city: "Bengaluru", zip: "560042", country_id: "India", vat: "29AAFCL2468M1Z4", property_payment_term_id: "15 Days", customer_rank: "1" },
        { id: "cust_C1009", name: "Sunrise Supermarkets", is_company: "1", email: "payables@sunrisesuper.example", phone: "+91 40 2335 8800", street: "Road No 12, Banjara Hills", city: "Hyderabad", zip: "500034", country_id: "India", vat: "36AAKCS1357N1Z6", property_payment_term_id: "End of Following Month", customer_rank: "1" },
        { id: "cust_C1010", name: "Kiran Mehta", is_company: "0", email: "kiran.mehta@mail.example", phone: "+91 98250 11223", street: "7 Satellite Road", city: "Ahmedabad", zip: "380015", country_id: "India", vat: "", property_payment_term_id: "Immediate Payment", customer_rank: "1" },
      ],
    },
    {
      name: "Vendors (cleansed)",
      templateKey: "vendors",
      description: "6 vendors derived from 8 VENDMAST rows: V2005 merged into V2004 (same GSTIN), V2007 excluded (inactive since 2019). Countries and payment terms mapped with the value mapping tables.",
      rows: [
        { id: "vend_V2001", name: "Annapurna Agro Foods Pvt Ltd", is_company: "1", email: "sales@annapurnaagro.example", phone: "+91 253 238 1000", street: "MIDC Ambad", city: "Nashik", zip: "422010", country_id: "India", vat: "27AAGCA1122P1Z3", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_V2002", name: "Kerala Spice Exporters", is_company: "1", email: "trade@keralaspice.example", phone: "+91 484 222 4400", street: "Mattancherry", city: "Kochi", zip: "682002", country_id: "India", vat: "32AAHFK3344Q1Z7", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
        { id: "vend_V2003", name: "Pacific Packaging Solutions Pte Ltd", is_company: "1", email: "export@pacificpack.example", phone: "+65 6221 0909", street: "8 Shenton Way", city: "Singapore", zip: "068811", country_id: "Singapore", vat: "", property_supplier_payment_term_id: "End of Following Month", supplier_rank: "1" },
        { id: "vend_V2004", name: "Golden Grain Mills", is_company: "1", email: "accounts@goldengrain.example", phone: "+91 161 267 5500", street: "Focal Point, Phase 4", city: "Ludhiana", zip: "141010", country_id: "India", vat: "03AAJFG5566R1Z1", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_V2006", name: "Rapid Freight Carriers", is_company: "1", email: "billing@rapidfreight.example", phone: "+91 22 2857 9000", street: "Saki Vihar Road, Andheri East", city: "Mumbai", zip: "400072", country_id: "India", vat: "27AAKFR7788S1Z8", property_supplier_payment_term_id: "15 Days", supplier_rank: "1" },
        { id: "vend_V2008", name: "Blue Ocean Edible Oils LLC", is_company: "1", email: "sales@blueoceanoils.example", phone: "+971 4 881 2020", street: "Jebel Ali Free Zone", city: "Dubai", zip: "", country_id: "United Arab Emirates", vat: "", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
      ],
    },
    {
      name: "Products (cleansed)",
      templateKey: "products",
      description:
        "10 products derived from 13 ITEMMAST rows: I3009 merged into I3007 (same EAN), I3012 and I3013 excluded. Legacy code kept as Internal Reference; UoM codes mapped; EAN spaces removed and the I3003 check digit corrected; costs equal the agreed opening unit costs used for valuation.",
      rows: [
        { id: "prod_I3001", name: "Basmati Rice Premium 5kg Bag", default_code: "I3001", detailed_type: "product", "categ_id/id": "categ_staples", uom_id: "Units", uom_po_id: "Units", list_price: "650.00", standard_price: "480.00", barcode: "8907654001006", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3002", name: "Sona Masoori Rice 25kg Bag", default_code: "I3002", detailed_type: "product", "categ_id/id": "categ_staples", uom_id: "Units", uom_po_id: "Units", list_price: "1450.00", standard_price: "1120.00", barcode: "8907654001013", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3003", name: "Whole Wheat Atta 10kg Bag", default_code: "I3003", detailed_type: "product", "categ_id/id": "categ_staples", uom_id: "Units", uom_po_id: "Units", list_price: "420.00", standard_price: "315.00", barcode: "8907654001020", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3004", name: "Turmeric Powder 500g Pouch", default_code: "I3004", detailed_type: "product", "categ_id/id": "categ_spices", uom_id: "Units", uom_po_id: "Units", list_price: "95.00", standard_price: "58.00", barcode: "8907654001037", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3005", name: "Red Chilli Powder 500g Pouch", default_code: "I3005", detailed_type: "product", "categ_id/id": "categ_spices", uom_id: "Units", uom_po_id: "Units", list_price: "110.00", standard_price: "68.00", barcode: "8907654001044", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3006", name: "Black Pepper Whole (loose)", default_code: "I3006", detailed_type: "product", "categ_id/id": "categ_spices", uom_id: "kg", uom_po_id: "kg", list_price: "720.00", standard_price: "540.00", barcode: "", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3007", name: "Sunflower Oil 15L Tin", default_code: "I3007", detailed_type: "product", "categ_id/id": "categ_oils", uom_id: "Units", uom_po_id: "Units", list_price: "2350.00", standard_price: "1890.00", barcode: "8907654001051", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3008", name: "Groundnut Oil (loose, per litre)", default_code: "I3008", detailed_type: "product", "categ_id/id": "categ_oils", uom_id: "L", uom_po_id: "L", list_price: "185.00", standard_price: "142.00", barcode: "", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_I3010", name: "Corrugated Carton 5-Ply", default_code: "I3010", detailed_type: "consu", "categ_id/id": "categ_packaging", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "18.50", barcode: "", sale_ok: "0", purchase_ok: "1", invoice_policy: "order" },
        { id: "prod_I3011", name: "Delivery Charges (per drop)", default_code: "I3011", detailed_type: "service", "categ_id/id": "categ_services", uom_id: "Units", uom_po_id: "Units", list_price: "250.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
      ],
    },
    {
      name: "Opening stock (cleansed)",
      templateKey: "opening-stock",
      description:
        "10 quants derived from 14 STOCKBAL lines: I3007 + I3009 summed (48 + 12 = 60), negative I3005/BR01 recounted to zero and dropped, consumable cartons and the zero line excluded. Value at product cost = 977,300.00 (WH/Stock 646,300.00; WH2/Stock 216,300.00; Shelf 1 68,800.00; Shelf 2 45,900.00).",
      rows: [
        { "product_id/id": "prod_I3001", location_id: "WH/Stock", inventory_quantity: "400", lot_id: "" },
        { "product_id/id": "prod_I3001", location_id: "WH2/Stock", inventory_quantity: "150", lot_id: "" },
        { "product_id/id": "prod_I3002", location_id: "WH/Stock", inventory_quantity: "220", lot_id: "" },
        { "product_id/id": "prod_I3003", location_id: "WH/Stock", inventory_quantity: "300", lot_id: "" },
        { "product_id/id": "prod_I3003", location_id: "WH2/Stock", inventory_quantity: "120", lot_id: "" },
        { "product_id/id": "prod_I3004", location_id: "WH/Stock/Shelf 1", inventory_quantity: "600", lot_id: "" },
        { "product_id/id": "prod_I3005", location_id: "WH/Stock/Shelf 1", inventory_quantity: "500", lot_id: "" },
        { "product_id/id": "prod_I3006", location_id: "WH/Stock/Shelf 2", inventory_quantity: "85", lot_id: "" },
        { "product_id/id": "prod_I3007", location_id: "WH/Stock", inventory_quantity: "60", lot_id: "" },
        { "product_id/id": "prod_I3008", location_id: "WH2/Stock", inventory_quantity: "750", lot_id: "" },
      ],
    },
    {
      name: "Opening AR/AP documents (Odoo-ready)",
      description:
        "Open items to be imported as individual customer invoices / credit notes and vendor bills (Accounting ▸ Customers ▸ Invoices / Vendors ▸ Bills ▸ Import records, verify in your training instance). One line each, account Migration Suspense, no taxes (GST was already accounted in LegacyBooks). Legacy number in ref; amounts are open balances. AR 434,440.00, AP 404,000.00.",
      rows: [
        { move_type: "out_invoice", "partner_id/id": "cust_C1001", ref: "INV/25-26/0412", invoice_date: "2026-02-20", invoice_date_due: "2026-03-22", line_account: "Migration Suspense", amount: "44500.00", note: "Partly paid in legacy (84,500.00 − 40,000.00)" },
        { move_type: "out_invoice", "partner_id/id": "cust_C1002", ref: "INV/25-26/0438", invoice_date: "2026-03-02", invoice_date_due: "2026-04-16", line_account: "Migration Suspense", amount: "156200.00", note: "" },
        { move_type: "out_invoice", "partner_id/id": "cust_C1002", ref: "INV/25-26/0441", invoice_date: "2026-03-05", invoice_date_due: "2026-04-19", line_account: "Migration Suspense", amount: "38750.00", note: "Re-pointed from merged code C1003" },
        { move_type: "out_invoice", "partner_id/id": "cust_C1004", ref: "INV/25-26/0450", invoice_date: "2026-03-10", invoice_date_due: "2026-04-09", line_account: "Migration Suspense", amount: "62300.00", note: "" },
        { move_type: "out_invoice", "partner_id/id": "cust_C1005", ref: "INV/25-26/0457", invoice_date: "2026-03-14", invoice_date_due: "2026-03-14", line_account: "Migration Suspense", amount: "18900.00", note: "Date converted from 14/03/2026" },
        { move_type: "out_invoice", "partner_id/id": "cust_C1008", ref: "INV/25-26/0463", invoice_date: "2026-03-20", invoice_date_due: "2026-04-04", line_account: "Migration Suspense", amount: "27640.00", note: "" },
        { move_type: "out_refund", "partner_id/id": "cust_C1004", ref: "CN/25-26/0021", invoice_date: "2026-03-25", invoice_date_due: "2026-03-25", line_account: "Migration Suspense", amount: "5300.00", note: "Credit note: positive amount on an out_refund" },
        { move_type: "out_invoice", "partner_id/id": "cust_C1009", ref: "INV/25-26/0470", invoice_date: "2026-03-28", invoice_date_due: "2026-04-30", line_account: "Migration Suspense", amount: "91450.00", note: "" },
        { move_type: "in_invoice", "partner_id/id": "vend_V2001", ref: "PB-7781", invoice_date: "2026-02-27", invoice_date_due: "2026-03-29", line_account: "Migration Suspense", amount: "128000.00", note: "" },
        { move_type: "in_invoice", "partner_id/id": "vend_V2002", ref: "KSE/1123", invoice_date: "2026-03-08", invoice_date_due: "2026-04-22", line_account: "Migration Suspense", amount: "74250.00", note: "" },
        { move_type: "in_invoice", "partner_id/id": "vend_V2003", ref: "PPS-INV-5590", invoice_date: "2026-03-12", invoice_date_due: "2026-04-30", line_account: "Migration Suspense", amount: "33600.00", note: "" },
        { move_type: "in_invoice", "partner_id/id": "vend_V2004", ref: "GGM/0921", invoice_date: "2026-03-15", invoice_date_due: "2026-04-14", line_account: "Migration Suspense", amount: "96800.00", note: "Re-pointed from merged code V2005" },
        { move_type: "in_invoice", "partner_id/id": "vend_V2006", ref: "RFC-2231", invoice_date: "2026-03-26", invoice_date_due: "2026-04-10", line_account: "Migration Suspense", amount: "12400.00", note: "" },
        { move_type: "in_invoice", "partner_id/id": "vend_V2008", ref: "BOE-0087", invoice_date: "2026-03-18", invoice_date_due: "2026-05-02", line_account: "Migration Suspense", amount: "58950.00", note: "" },
      ],
    },
    {
      name: "Opening trial balance entry (Odoo-ready)",
      description:
        "One journal entry dated 2026-03-31 in a Miscellaneous 'Opening Balances' journal. AR, AP and inventory are NOT on this entry — they arrive through the documents and the stock adjustment; Migration Suspense absorbs their net (977,300.00 + 434,440.00 − 404,000.00 = 1,007,740.00). Account names refer to the localized chart; confirm codes in your training instance. Debits = credits = 4,334,180.00.",
      rows: [
        { legacy_accounts: "1101", odoo_account: "Bank — HDFC Current Account (bank journal account)", debit: "1245860.00", credit: "0.00" },
        { legacy_accounts: "1105", odoo_account: "Cash", debit: "18400.00", credit: "0.00" },
        { legacy_accounts: "1401", odoo_account: "CGST Input", debit: "31090.00", credit: "0.00" },
        { legacy_accounts: "1402", odoo_account: "SGST Input", debit: "31090.00", credit: "0.00" },
        { legacy_accounts: "1501 + 1502", odoo_account: "Fixed Assets — Vehicles & Equipment", debit: "1850000.00", credit: "0.00" },
        { legacy_accounts: "1601", odoo_account: "Security Deposits", debit: "150000.00", credit: "0.00" },
        { legacy_accounts: "1201 − 2101 + 1301 (net)", odoo_account: "Migration Suspense", debit: "1007740.00", credit: "0.00" },
        { legacy_accounts: "2201", odoo_account: "CGST Output", debit: "0.00", credit: "35760.00" },
        { legacy_accounts: "2202", odoo_account: "SGST Output", debit: "0.00", credit: "35760.00" },
        { legacy_accounts: "2301", odoo_account: "TDS Payable", debit: "0.00", credit: "9860.00" },
        { legacy_accounts: "2401", odoo_account: "Term Loan — HDFC", debit: "0.00", credit: "900000.00" },
        { legacy_accounts: "3001", odoo_account: "Share Capital", debit: "0.00", credit: "1000000.00" },
        { legacy_accounts: "3101", odoo_account: "Retained Earnings (Reserves & Surplus)", debit: "0.00", credit: "2352800.00" },
      ],
    },
  ],
  phases: [
    {
      key: "discovery",
      title: "Discovery",
      tasks: [
        { title: "Migration kick-off", description: "Agree scope (objects, history or not), cut-off date, roles of data owners vs consultants and the number of mock migrations with the sponsor and finance controller.", deliverable: "Migration charter with RACI" },
        { title: "Legacy landscape inventory", description: "List every data source (LegacyBooks tables, Excel GST list, count sheets), its owner, format and refresh frequency.", deliverable: "Data source inventory" },
        { title: "Obtain a database copy", description: "IT restores the latest LegacyBooks backup on an isolated machine; consultants get read-only credentials only on the copy.", deliverable: "Restored legacy DB copy and access log" },
        { title: "Table profiling", description: "Count rows, check key uniqueness, blank mandatory fields and distinct values for CUSTMAST, VENDMAST, ITEMMAST, STOCKBAL, AROPEN, APOPEN and GLBAL.", deliverable: "Data profiling report" },
      ],
    },
    {
      key: "requirements",
      title: "Requirements",
      tasks: [
        { title: "Scope and cut-off rules", description: "Agree the active-record rules (24 months / open balance / on-hand stock), exclusion of history and the treatment of stock exceptions with each data owner.", deliverable: "Signed scope rules" },
        { title: "Opening balance strategy", description: "Agree with the controller: open items by document, stock by quantity × cost, trial balance through Migration Suspense, P&L closed to reserves at fiscal year end.", deliverable: "Opening balance decision record" },
        { title: "Reconciliation and sign-off criteria", description: "Define which counts and control totals prove success and who signs each object.", deliverable: "Reconciliation criteria and sign-off matrix" },
      ],
    },
    {
      key: "design",
      title: "Migration design",
      tasks: [
        { title: "Field mapping specification", description: "Map every legacy field to an Odoo model.field with transformation rules and mandatory flags (see TO-BE).", deliverable: "Data mapping specification per object" },
        { title: "Value mapping tables", description: "Build country, payment term, UoM, item group, item type and godown translation tables; confirm every target value exists in Odoo.", deliverable: "Approved value mapping tables" },
        { title: "External ID and load order design", description: "Define prefixes per object, how merged codes are handled and the dependency-ordered load plan.", deliverable: "Load plan with External ID conventions" },
        { title: "Account mapping", description: "Map the 17 legacy GL accounts to the Odoo localized chart (many-to-one where needed) and design the Migration Suspense account and opening journals.", deliverable: "Signed account mapping table" },
        { title: "Cutover and rollback design", description: "Draft timeline from legacy freeze to go decision, backup points, point of no return and go/no-go criteria.", deliverable: "Draft cutover and rollback plan" },
      ],
    },
    {
      key: "configuration",
      title: "Target configuration readiness",
      tasks: [
        { title: "Reference data in Odoo", description: "Create/verify payment terms (15/30/45 Days, Immediate Payment, End of Following Month), UoM kg and L, warehouses WH and WH2 and the shelves WH/Stock/Shelf 1 and Shelf 2.", deliverable: "Reference data checklist ticked" },
        { title: "Accounting objects for migration", description: "Create the Migration Suspense account (reconcilable off), an 'Opening Balances' miscellaneous journal and decide the sales/purchase journal used for legacy open items.", deliverable: "Migration accounts and journals" },
        { title: "Inventory valuation setup", description: "Enable automated valuation, set the counterpart of the inventory adjustment location to Migration Suspense for the opening load (verify in your training instance).", deliverable: "Valuation configuration evidence" },
        { title: "Golden copy database", description: "Duplicate the fully configured but empty Odoo database as the restore point for each mock migration.", deliverable: "Golden copy DB and backup" },
      ],
    },
    {
      key: "migration",
      title: "Data migration",
      tasks: [
        { title: "Extract", description: "Run the read-only extraction scripts on the legacy copy; store each extract with timestamp, row counts and control totals.", deliverable: "Extract set + extraction log" },
        { title: "Cleanse and transform", description: "Apply scope filters, merge duplicates, map values and build External IDs; data owners approve merge and exclusion lists.", deliverable: "Cleansed Odoo-ready files + decision log" },
        { title: "Validate and load", description: "Run each file through the import simulator and Odoo Test, then Import in dependency order; apply opening stock.", deliverable: "Import logs with zero errors" },
        { title: "Opening balances", description: "Import open AR/AP documents, post the opening trial balance entry and confirm Migration Suspense = 0.00.", deliverable: "Posted opening entries" },
        { title: "Reconciliation pack", description: "Produce counts, control totals, ageing comparison and sample checks for the run.", deliverable: "Reconciliation pack per run" },
      ],
    },
    {
      key: "development",
      title: "Migration tooling",
      tasks: [
        { title: "Extraction scripts", description: "Write and peer-review the read-only SQL extraction scripts (E-CUS-01).", deliverable: "Versioned scripts + review record" },
        { title: "Validation report", description: "Build the reusable legacy-vs-Odoo validation workbook/report (E-CUS-02).", deliverable: "Validation report template" },
        { title: "Delta extraction", description: "Add a LAST_UPD_DT filter variant of the master data scripts for the cutover delta load.", deliverable: "Delta scripts tested on mock 2" },
      ],
    },
    {
      key: "testing",
      title: "Mock migrations and testing",
      tasks: [
        { title: "Mock migration 1", description: "Full dry run on the golden copy; log every error and timing.", deliverable: "Mock 1 issue log and timings" },
        { title: "Mock migration 2 (dress rehearsal)", description: "Repeat with cleansed files, delta load and the timed cutover script; compare timings.", deliverable: "Mock 2 report with reconciliation" },
        { title: "Migration test cases", description: "Execute E-TC-01 … E-TC-15 including negative tests and reconciliation.", deliverable: "Executed test log" },
        { title: "Data owner verification", description: "Data owners spot-check 25 records each and post-go-live scenarios (payment on an opening invoice).", deliverable: "Signed object sign-offs" },
      ],
    },
    {
      key: "golive",
      title: "Cutover & go-live",
      tasks: [
        { title: "Legacy freeze and final extract", description: "Stop postings in LegacyBooks at the agreed time, take a final backup and run the final extracts.", deliverable: "Freeze confirmation + final extract log" },
        { title: "Production load", description: "Execute the rehearsed load plan into production with a backup before each step.", deliverable: "Completed cutover checklist" },
        { title: "Go/no-go", description: "Review the reconciliation pack against the go/no-go criteria; the sponsor decides.", deliverable: "Go/no-go minutes" },
        { title: "Hypercare and legacy archive", description: "Support first collections and payments on opening items; set LegacyBooks to read-only and archive it.", deliverable: "Hypercare log and archive confirmation" },
      ],
    },
  ],
  transactionScenarios: [
    {
      id: "E-TS-01",
      title: "Mock migration 1 — straight copy of legacy values (expect errors)",
      steps: [
        "Restore the golden copy database and record the start time",
        "Build first-cut files by copying legacy columns 1:1 (CNTRY, PAYTRM, UoM codes as in the extracts) with External IDs from legacy codes",
        "Validate the customers file in the import simulator: note errors such as No matching record found for name 'IND' / 'UAE' / 'U.S.' in Country and 'Net 30' / 'N45' / 'COD' in Payment Terms, and the possible-duplicate warning on the GSTIN of C1002/C1003",
        "Validate the products file before loading categories: note the dependency-order error, then load categories and re-validate: note the duplicate barcode 8907654001051 (I3007/I3009), the invalid barcode with a space (I3002) and the failed EAN-13 check digit (I3003)",
        "Validate the opening stock file: note the negative quantity (I3005 BR01 −4), the unknown location 'MAIN' and the zero line",
        "Log every issue with object, row, cause, owner and fix in the mock 1 issue log",
      ],
      expected: "No file is imported into Odoo while it still has errors; the issue log lists all mapping, duplicate, dependency and stock exceptions with owners; elapsed time is recorded as the baseline.",
    },
    {
      id: "E-TS-02",
      title: "Cleanse and re-run master data",
      steps: [
        "Apply scope filters: exclude C1007, C1011, C1012, V2007, I3012, I3013",
        "Merge duplicates with data owner approval: C1003 → C1002, V2005 → V2004, I3009 → I3007",
        "Apply the value mapping tables, trim/proper-case names, lower-case emails, normalise phones and barcodes",
        "Validate and import in order: Product categories (6), Customers (8), Vendors (6), Products (10)",
        "Re-import the customers file unchanged to prove External IDs update instead of duplicating",
      ],
      expected: "All four files validate with 0 errors; Odoo shows 6 categories, 8 customers, 6 vendors, 10 products; the re-import leaves the customer count at 8.",
    },
    {
      id: "E-TS-03",
      title: "Opening stock apply and valuation check",
      steps: [
        "Confirm product costs (standard_price) equal STOCKBAL unit costs before importing quantities",
        "Import the cleansed opening stock file (10 quants) into Physical Inventory",
        "Review counted quantities per location, then Apply with reference 'Opening stock 2026-03-31'",
        "Open the Inventory Valuation report and the Stock Valuation account balance",
        "Compare per location: WH/Stock 646,300.00, WH2/Stock 216,300.00, Shelf 1 68,800.00, Shelf 2 45,900.00",
      ],
      expected: "Stock valuation = 977,300.00 = adjusted legacy STOCKBAL = GLBAL 1301; the counterpart 977,300.00 is credited to Migration Suspense.",
    },
    {
      id: "E-TS-04",
      title: "Opening AR/AP load and ageing check",
      steps: [
        "Import the 8 open AR documents (7 invoices, 1 credit note) and 6 open AP bills, dated with their original dates and due dates, on Migration Suspense without taxes",
        "Post all documents and check that the legacy number is visible in the reference",
        "Run Aged Receivable and Aged Payable at 31 March 2026",
        "Compare per partner and per bucket with AROPEN/APOPEN",
      ],
      expected: "AR total 434,440.00 (not due 371,040.00, 1–30 days 63,400.00); AP total 404,000.00 (not due 276,000.00, 1–30 days 128,000.00); invoice INV/25-26/0441 appears under Metro Mart Retail Pvt Ltd.",
    },
    {
      id: "E-TS-05",
      title: "Trial balance tie-out",
      steps: [
        "Post the opening trial balance entry dated 2026-03-31 (13 lines, 4,334,180.00 each side)",
        "Run the Odoo Trial Balance at 31 March 2026",
        "Compare each Odoo account with the mapped legacy GLBAL accounts (1501 + 1502 → one fixed-asset account)",
        "Check the Migration Suspense balance",
      ],
      expected: "Every mapped account matches LegacyBooks; total debits = total credits = 4,738,180.00; Migration Suspense = 0.00.",
    },
    {
      id: "E-TS-06",
      title: "Cutover rehearsal (mock 2) with delta load",
      steps: [
        "Restore the golden copy and run the full load plan with the timed cutover script",
        "Simulate legacy changes since the last extract: new customer C1013 created and payment term of C1004 changed to Net 45",
        "Run the delta extraction (LAST_UPD_DT after the previous extract) and import the delta customers file",
        "Re-run the reconciliation pack and compare timings with mock 1",
      ],
      expected: "Delta load creates 1 customer and updates 1 (cust_C1004 → 45 Days) with no duplicates (9 customers in total); full run fits inside the agreed cutover window; reconciliation unchanged for balances.",
    },
    {
      id: "E-TS-07",
      title: "Go/no-go and production cutover",
      steps: [
        "Freeze LegacyBooks, take the final backup and run final extracts",
        "Execute the load plan in production with an Odoo backup before each step",
        "Present the reconciliation pack (counts, stock, AR/AP, TB, suspense = 0) to the sponsor and controller",
        "Decide go or no-go; on no-go, restore the pre-load backup and keep trading in LegacyBooks",
      ],
      expected: "Go decision recorded with signed reconciliation; or a documented rollback leaving LegacyBooks as the system of record with no data lost.",
    },
  ],
  customizations: [
    {
      id: "E-CUS-01",
      title: "Read-only legacy extraction scripts (E-REQ-05)",
      spec: `## Functional / technical specification
**Classification:** Customization **outside Odoo** — throw-away migration tooling, not an Odoo module. Nothing is installed in Odoo.

### Business need
Extracts must be complete, repeatable and identical between mock migrations and cutover. Manual exports from LegacyBooks report screens lost codes in the previous attempt.

### Design
| Item | Detail |
|---|---|
| Source | Restored **copy** of the LegacyBooks database on an isolated machine — never the live server |
| Access | Read-only database user; SELECT statements only (no UPDATE/DELETE/DDL) |
| Scripts | One per object: CUSTMAST, VENDMAST, ITEMMAST, STOCKBAL, AROPEN, APOPEN, GLBAL; plus delta variants filtered on LAST_UPD_DT |
| Output | UTF-8 CSV, one file per object, header row, dot decimal separator, ISO dates where the DB allows |
| Log | Extract timestamp, DB backup name, row count and control total per file (e.g. SUM(STK_VALUE), SUM(BAL_AMT)) |
| Versioning | Scripts kept in a repository; every change peer-reviewed |

### Rules
- Extraction does **not** cleanse — cleansing decisions belong to the data owners and are applied in the transformation step, so the raw extract stays auditable.
- Control totals in the log must equal the legacy reports (e.g. Stock Summary, Debtors Outstanding) for the same date.

### Acceptance
- Running the scripts twice on the same copy produces identical files and totals.
- No write access to the legacy DB is possible with the credentials used.`,
    },
    {
      id: "E-CUS-02",
      title: "Reusable migration validation report (E-REQ-20 / E-REQ-21)",
      spec: `## Functional specification
**Classification:** Reporting — built with **standard Odoo exports and reports** (list view export, Inventory Valuation, Aged Receivable/Payable, Trial Balance) feeding a reconciliation workbook. No Odoo module. A custom Odoo report would only be considered if the migration were repeated for many companies.

### Business need
The same checks must be repeated after mock 1, mock 2 and the production load, and the results must be comparable and signable.

### Layout (one tab per object + summary)
| Column | Source |
|---|---|
| Object | — |
| Legacy rows extracted | Extraction log |
| Excluded (by rule) / merged | Decision log |
| Expected in Odoo | = extracted − excluded − merged |
| Loaded in Odoo | Odoo list view count (filtered on External ID prefix) |
| Control total legacy | Extraction log |
| Control total Odoo | Odoo report |
| Difference / explanation / signed by | Reviewer |

### Mandatory checks
- Counts: categories 6, customers 8, vendors 6, products 10, quants 10, AR documents 8, AP documents 6 (training sample).
- Stock value per location and in total (977,300.00) vs Stock Valuation account.
- AR 434,440.00 and AP 404,000.00 per partner and per ageing bucket.
- Trial balance per mapped account; Migration Suspense = 0.00.
- Field sample: 25 random records + all merged records, field by field.

### Acceptance
- A difference that is not explained blocks sign-off of that object.`,
    },
    {
      id: "E-CUS-03",
      title: "Temporary legacy reference on partners and products (E-REQ-25)",
      spec: `## Fit-gap note
**Classification:** **Standard — no customization required.** The request was a new "Legacy Code" field on partners and products. Standard Odoo already provides:

| Need | Standard field |
|---|---|
| Legacy customer/vendor code searchable on the partner | **Reference** (res.partner.ref) — searchable in Contacts |
| Legacy item code on the product | **Internal Reference** (default_code) — we keep the legacy item code as the SKU |
| Legacy document number on open invoices/bills | **Reference** (ref) / payment reference on account.move |
| Link back to the source row | The **External ID** (cust_C1001, prod_I3001 …), visible in developer mode |

### Decision
- Load CUST_CD / VEND_CD into ref and keep ITEM_CD as default_code.
- Merged codes (C1003, V2005, I3009) are recorded in the partner/product chatter note and the decision log so users searching by the old code are guided to the surviving record.
- If a second legacy key were ever needed (e.g. legacy branch code on partners), a field added with **Studio** (Enterprise) or a small custom module would be the option — classify that as customization and remove it after hypercare.

### Acceptance
- Searching "C1001" in Contacts and "I3007" in Products finds the right record; searching "INV/25-26/0438" in Invoices finds the opening invoice.`,
    },
  ],
  testCases: [
    { id: "E-TC-01", requirementId: "E-REQ-02", module: "Migration / Scoping", scenario: "Active-record filter on customers", preconditions: "Legacy CUSTMAST extract (12 rows); scope rule approved", testData: "C1007 (Inactive), C1011 (test), C1012 (last transaction 2022-03-14, no balance)", steps: "Apply the scope rules; compare the output list with the exclusion list signed by sales admin", expected: "12 extracted − 3 excluded − 1 merged = 8 customers in the cleansed file; each exclusion has a reason" },
    { id: "E-TC-02", requirementId: "E-REQ-08", module: "Migration / Cleansing", scenario: "Negative test — duplicate customer detected", preconditions: "Import simulator available", testData: "Customers file containing both C1002 and C1003 (same GSTIN 27AACCM5678K1Z2)", steps: "Validate the file in the simulator", expected: "Possible-duplicate warning on vat (and name after normalising); merge decision C1003 → C1002 recorded; open invoice INV/25-26/0441 re-pointed to cust_C1002" },
    { id: "E-TC-03", requirementId: "E-REQ-07", module: "Migration / Mapping", scenario: "Negative test — unmapped legacy values rejected", preconditions: "First-cut customers file with legacy values", testData: "CNTRY 'IND', 'UAE', 'U.S.'; PAYTRM 'Net 30', 'COD'", steps: "Validate; then apply the value mapping tables and validate again", expected: "First run: No matching record found for name errors on Country and Payment Terms. Second run: 0 errors" },
    { id: "E-TC-04", requirementId: "E-REQ-11", module: "Migration / Load order", scenario: "Negative test — products before categories", preconditions: "Empty golden copy", testData: "Cleansed products file", steps: "Validate products before the categories file is loaded", expected: "Dependency-order error; after loading the 6 categories the products file validates with 0 errors" },
    { id: "E-TC-05", requirementId: "E-REQ-10", module: "Migration / External IDs", scenario: "Re-import updates instead of duplicating", preconditions: "8 customers imported with External IDs", testData: "Same customers file, phone of cust_C1004 changed", steps: "Re-import the file", expected: "Customer count stays 8; cust_C1004 phone updated; simulator reports existing-record info for all 8 rows" },
    { id: "E-TC-06", requirementId: "E-REQ-09", module: "Migration / Cleansing", scenario: "Negative test — barcode quality", preconditions: "First-cut products file", testData: "I3002 '8907654 001013', I3003 '8907654001025', I3009 duplicate '8907654001051'", steps: "Validate; then use the cleansed products file", expected: "First run: invalid-format error (space), EAN-13 check-digit warning, duplicate-barcode error. Cleansed file: 0 errors, 0 barcode warnings" },
    { id: "E-TC-07", requirementId: "E-REQ-12", module: "Inventory / Accounting", scenario: "Costing and valuation set before stock", preconditions: "Categories imported", testData: "categ_staples, categ_spices, categ_packaging (average), categ_oils (fifo), categ_services (standard, manual)", steps: "Open each category and check costing method and valuation", expected: "Values as designed; stock categories use automated valuation" },
    { id: "E-TC-08", requirementId: "E-REQ-13", module: "Inventory", scenario: "Opening stock reconciliation per location", preconditions: "Products imported with costs; opening stock applied", testData: "Cleansed opening stock (10 quants)", steps: "Compare quantity × cost per location and the Stock Valuation account with the adjusted STOCKBAL", expected: "WH/Stock 646,300.00; WH2/Stock 216,300.00; Shelf 1 68,800.00; Shelf 2 45,900.00; total 977,300.00 = GLBAL 1301" },
    { id: "E-TC-09", requirementId: "E-REQ-14", module: "Inventory", scenario: "Negative test — negative and duplicate stock lines", preconditions: "First-cut opening stock file", testData: "prod_I3005 WH2/Stock −4; two rows prod_I3007 WH/Stock (48 from I3007 and 12 from I3009)", steps: "Validate in the simulator", expected: "Error: opening quantities cannot be negative; error: same product, location and lot as an earlier row. Fixed file has one row prod_I3007 WH/Stock 60 and no I3005 WH2 row" },
    { id: "E-TC-10", requirementId: "E-REQ-15", module: "Accounting", scenario: "Open AR reconciliation and ageing", preconditions: "8 AR documents posted", testData: "Opening AR/AP documents file", steps: "Run Aged Receivable at 2026-03-31; compare per partner and bucket with AROPEN", expected: "Total 434,440.00; not due 371,040.00; 1–30 days 63,400.00; credit note −5,300.00 shown on Coastal Hospitality Group" },
    { id: "E-TC-11", requirementId: "E-REQ-16", module: "Accounting", scenario: "Open AP reconciliation and ageing", preconditions: "6 AP bills posted", testData: "Opening AR/AP documents file", steps: "Run Aged Payable at 2026-03-31; compare with APOPEN", expected: "Total 404,000.00; not due 276,000.00; 1–30 days 128,000.00 (PB-7781); GGM/0921 under Golden Grain Mills" },
    { id: "E-TC-12", requirementId: "E-REQ-17", module: "Accounting", scenario: "Trial balance tie-out and suspense clearing", preconditions: "Stock, AR, AP and opening entry posted", testData: "Legacy GLBAL and account mapping", steps: "Run Odoo Trial Balance at 2026-03-31; compare per mapped account; check Migration Suspense", expected: "All accounts match; total 4,738,180.00 each side; Migration Suspense 0.00" },
    { id: "E-TC-13", requirementId: "E-REQ-15", module: "Accounting", scenario: "Post-go-live payment on an opening invoice", preconditions: "Opening invoice INV/25-26/0412 for cust_C1001 open 44,500.00", testData: "Bank receipt 44,500.00 dated 2026-04-06", steps: "Register / reconcile the payment against the opening invoice", expected: "Invoice Paid; customer balance 0.00; no impact on Migration Suspense" },
    { id: "E-TC-14", requirementId: "E-REQ-22", module: "Migration / Cutover", scenario: "Delta load after the last mock", preconditions: "Mock 2 loaded; delta script available", testData: "New legacy customer C1013; C1004 payment term changed to Net 45", steps: "Run the delta extract (LAST_UPD_DT after the previous extract), map, validate and import", expected: "1 customer created (cust_C1013), 1 updated (cust_C1004 → 45 Days); total 9; no duplicates" },
    { id: "E-TC-15", requirementId: "E-REQ-23", module: "Migration / Cutover", scenario: "Rollback rehearsal", preconditions: "Backup taken before the opening stock step", testData: "Deliberately wrong cost on prod_I3002 before applying stock", steps: "Detect the valuation difference, restore the pre-step backup, correct the cost and re-run the step", expected: "Database returns to the pre-step state; re-run gives 977,300.00; restore time recorded within the cutover window" },
  ],
  acceptanceCriteria: [
    "Scope rules, merge lists and exclusion lists are signed by the data owners before the final load",
    "Every cleansed Odoo-ready file validates with zero errors in the import simulator and Odoo's Test before import",
    "Record counts reconcile for every object: extracted − excluded − merged = loaded (customers 8, vendors 6, products 10, quants 10 on the sample)",
    "Opening stock value in Odoo equals the adjusted legacy stock value and the legacy inventory GL balance (977,300.00), per location and in total",
    "Open AR (434,440.00) and AP (404,000.00) match the legacy open items per partner and per ageing bucket, with legacy document numbers searchable",
    "The Odoo trial balance at cut-off matches LegacyBooks per mapped account and Migration Suspense is exactly 0.00",
    "At least two mock migrations completed; the final rehearsal ran end to end inside the agreed cutover window",
    "The rollback procedure was rehearsed and the point of no return and go/no-go criteria are documented and approved",
    "The finance controller signs the balances and the sponsor records the go decision before users start transacting in Odoo",
  ],
  documentation: [
    "Migration charter with scope, cut-off date and RACI",
    "Data source inventory and legacy data profiling report",
    "Scope rules and exclusion/merge decision log signed by data owners",
    "Data mapping specification per object and value mapping tables",
    "Account mapping table (legacy GL → Odoo chart of accounts)",
    "Extraction script specification, scripts and extraction logs",
    "Load plan with External ID conventions and dependency order",
    "Mock migration issue logs and timing reports",
    "Reconciliation pack per run (counts, control totals, ageing, trial balance, sample checks)",
    "Cutover plan, rollback plan and go/no-go checklist",
    "Object sign-off sheets and the controller's balance sign-off",
    "Legacy archive and read-only access confirmation",
  ],
  rubric: [
    { criterion: "Legacy analysis & scoping", weight: 15, excellent: "All seven tables profiled; scope rules precise and justified; every excluded record has a reason", adequate: "Main tables profiled; scope rules present but vague", poor: "No profiling; everything migrated or exclusions arbitrary" },
    { criterion: "Field & value mapping", weight: 15, excellent: "Complete mapping with transformations, mandatory flags and value tables whose targets exist in Odoo", adequate: "Mapping present with gaps in transformations or value tables", poor: "No mapping specification; values copied as-is" },
    { criterion: "Cleansing & de-duplication", weight: 15, excellent: "Duplicates detected by rule (GSTIN, EAN), merged with approval and dependent records re-pointed", adequate: "Obvious duplicates removed, dependents not fully handled", poor: "Duplicates loaded into Odoo" },
    { criterion: "Import execution & External IDs", weight: 15, excellent: "Dependency order respected, zero-error files, re-import proven to update", adequate: "Imports succeed after several manual fixes", poor: "Import errors, missing External IDs or duplicate records after re-import" },
    { criterion: "Opening balances", weight: 15, excellent: "Stock, open items and trial balance loaded via suspense; suspense 0.00; ageing matches", adequate: "Totals match but approach not fully traceable (e.g. lump-sum AR)", poor: "Balances doubled, unreconciled or suspense not cleared" },
    { criterion: "Mock migrations & reconciliation", weight: 15, excellent: "Two timed mocks, issue logs, complete reconciliation pack with explained differences", adequate: "One mock with partial reconciliation", poor: "No rehearsal; reconciliation missing" },
    { criterion: "Cutover, rollback & documentation", weight: 10, excellent: "Clear cutover timeline, rehearsed rollback, sign-offs and professional deliverables", adequate: "Cutover plan without rollback rehearsal; some documents missing", poor: "No cutover or rollback plan; key documents missing" },
  ],
};
