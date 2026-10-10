import type { ConfigScenarioContent } from "./types";

/**
 * Business Configuration Lab scenarios.
 *
 * Each scenario walks a trainee through configuring Odoo 17.0 for a fictional
 * business, step by step. Menu paths that could differ between builds or
 * editions are marked "(verify in your training instance)". Enterprise-only
 * features are explicitly flagged.
 */
export const configScenarios: ConfigScenarioContent[] = [
  /* ================================================================ */
  /* A. Trading company                                                */
  /* ================================================================ */
  {
    slug: "trading-company",
    title: "Configure a trading company",
    businessType: "Wholesale trading / distribution",
    level: "beginner",
    odooVersion: "Odoo 17.0",
    summary:
      "Set up a buy-and-resell distributor end to end: company, accounting, partners, products, warehouses, taxes, sales and purchase workflows, opening balances, the purchase-to-pay and order-to-cash cycles, valuation checks and reporting.",
    companyProfile: `## Northstar Supply Co. (fictional)

**Northstar Supply Co.** buys office and janitorial supplies from manufacturers and resells them to small businesses, schools and clinics.

| Attribute | Value |
|---|---|
| Legal form | Limited liability company |
| Country / currency | United States / USD |
| Employees | 25 (sales 6, purchasing 3, warehouse 10, finance 3, management 3) |
| Warehouses | 1 main warehouse with a bulk storage area and a picking area |
| Product range | ~400 stocked items, a few services (delivery, installation) |
| Customers | ~300 business customers, mostly on 30-day credit |
| Vendors | ~40 suppliers, mostly on 30- or 45-day terms |

### Key business rules
- Products are purchased in cartons and sold in units.
- Stock must be valued automatically (perpetual inventory) so that the balance sheet always shows the current stock value.
- Customers are invoiced **after delivery**; vendors are paid only for **received** quantities.
- Two price levels: standard list price and a 10% discounted **Wholesale** price for key accounts.`,
    odooApps: ["Settings", "Accounting / Invoicing", "Contacts", "Sales", "Purchase", "Inventory"],
    prerequisites: [
      "A fresh Odoo 17.0 training database (no demo data recommended) with administrator access",
      "Sales, Purchase, Inventory and Accounting (or Invoicing in Community) apps installed",
      "Completed the ERP Fundamentals and Order-to-Cash / Procure-to-Pay process lessons",
      "Basic understanding of debit/credit, receivables, payables and inventory valuation",
    ],
    steps: [
      {
        title: "Create the company and set its localization",
        why: "Every document, tax, currency and report depends on the company record. The fiscal localization determines which chart of accounts, taxes and legal reports are loaded, so it must be correct before any transaction is recorded.",
        instructions: `### Goal
Create the legal entity and load the correct fiscal localization package.

1. Go to **Settings ▸ Users & Companies ▸ Companies** and open the default company (or create a new one).
2. Fill in the company details:
   - **Company Name**: Northstar Supply Co.
   - **Address**: street, city, state, ZIP, **Country = United States**
   - **Tax ID**, phone, email and website
   - **Currency**: USD
3. Upload the company logo — it is printed on quotations, invoices and delivery slips.
4. Save.
5. Go to **Accounting ▸ Configuration ▸ Settings** and find the **Fiscal Localization** section.
6. Select the **Package** for the United States (Generic/US chart) and save. Odoo installs the chart of accounts, default taxes and journals.
7. Back in **Settings**, use **Configure Document Layout** (General Settings ▸ Companies section) to choose a report layout and colours.

> **Tip:** The localization package can only be changed safely **before** any journal entries exist. Decide on it first.`,
        odooPath: "Settings ▸ Users & Companies ▸ Companies; Accounting ▸ Configuration ▸ Settings ▸ Fiscal Localization",
        validation: "The company shows the correct address, country and currency; Accounting ▸ Configuration ▸ Chart of Accounts lists accounts, and Accounting ▸ Configuration ▸ Journals lists Sales, Purchase, Bank, Cash and Miscellaneous journals. A test quotation preview shows the logo and address.",
        commonMistakes: [
          "Recording test transactions before choosing the fiscal localization, which then blocks changing the package",
          "Leaving the country empty, so the wrong localization or no tax report is proposed",
          "Setting the wrong currency on the company — it cannot easily be changed after entries are posted",
          "Forgetting the document layout, so customer-facing documents print without logo or address",
        ],
      },
      {
        title: "Configure the chart of accounts and accounting settings",
        why: "The chart of accounts is the backbone of financial reporting. Inventory valuation, receivables, payables and taxes all post to specific accounts, so they must exist and be set as defaults before transactions are processed.",
        instructions: `### Goal
Review the chart of accounts, add any company-specific accounts and set the key accounting defaults.

1. Open **Accounting ▸ Configuration ▸ Chart of Accounts**.
2. Review the account groups (assets, liabilities, equity, income, expenses). Confirm that these accounts exist:
   - Account Receivable and Account Payable
   - Stock Valuation, Stock Interim (Received), Stock Interim (Delivered)
   - Product Sales (income) and Cost of Goods Sold (expense)
3. Create any missing accounts with **New** (code, name, type). Example: *Freight Income* (type Income).
4. Open **Accounting ▸ Configuration ▸ Settings** and review:
   - **Default Taxes** (sales and purchase) — you will refine taxes in step 6
   - **Fiscal Periods**: fiscal year end date (e.g. December 31)
   - **Currencies**: enable **Multi-Currencies** only if you buy or sell in foreign currency
   - **Analytic Accounting**: enable if management wants profitability by department
5. Open **Accounting ▸ Configuration ▸ Journals** and check the **Bank** journal: set the bank account number so payments and statements are linked.
6. Save all settings.`,
        odooPath: "Accounting ▸ Configuration ▸ Chart of Accounts / Settings / Journals",
        dependsOn: [1],
        validation: "All required receivable, payable, stock valuation, interim stock, income and COGS accounts exist with the correct type; the fiscal year end is set; the bank journal has an account number.",
        commonMistakes: [
          "Creating income or expense accounts with the wrong account type, which breaks the Profit and Loss classification",
          "Deleting or renaming localization accounts that taxes and journals already reference",
          "Enabling multi-currency 'just in case' and then confusing users with currency fields",
          "Forgetting the fiscal year end, which affects period-based reports and closing",
        ],
      },
      {
        title: "Create customer and vendor records",
        why: "Partners carry the defaults that drive every transaction: addresses, payment terms, fiscal positions and contact persons. Clean partner master data avoids wrong invoices, wrong taxes and duplicate accounts.",
        instructions: `### Goal
Create a representative set of customers and vendors with correct defaults.

1. Open **Contacts** and click **New**.
2. Choose **Company** (not Individual) for business partners and fill in name, address, Tax ID, phone and email.
3. On the **Sales & Purchase** tab set:
   - **Payment Terms** (customer side), e.g. 30 Days
   - **Salesperson**
   - **Pricelist** (after step 6, e.g. Wholesale for key accounts)
   - **Payment Terms** (vendor side), e.g. 45 Days
4. On the **Accounting** tab confirm the receivable and payable accounts (defaults are fine) and add the bank account for vendors you pay by transfer.
5. Add contact persons (purchasing contact, accounts payable contact) under **Contacts & Addresses**, including a separate **Invoice** and **Delivery** address if needed.
6. Repeat for at least 3 customers and 3 vendors. For larger volumes, use the import feature (Favorites/gear menu ▸ **Import records**) with the customers and vendors templates.`,
        odooPath: "Contacts",
        dependsOn: [1, 2],
        validation: "Each partner is a Company with complete address and Tax ID; customers show customer payment terms, vendors show vendor payment terms; contact persons and invoice/delivery addresses appear as children of the company.",
        commonMistakes: [
          "Creating the same customer twice (e.g. 'ABC Ltd' and 'ABC Limited') instead of searching first",
          "Creating contact persons as separate companies instead of child contacts",
          "Putting the vendor payment term in the customer payment term field",
          "Leaving the country empty, so taxes/fiscal positions are not applied correctly",
        ],
      },
      {
        title: "Create product categories and products",
        why: "Product categories define costing method and valuation (the link between stock moves and the general ledger). Products carry prices, units of measure, routes and invoicing policy that drive every sales and purchase document.",
        instructions: `### Goal
Build a category hierarchy with automated valuation and create stockable products.

1. Open **Inventory ▸ Configuration ▸ Product Categories**.
2. Create a parent category **All / Office Supplies** and children such as **Paper**, **Writing Instruments**, **Janitorial**.
3. On each category set the **Inventory Valuation** section:
   - **Costing Method**: Average Cost (AVCO) or First In First Out (FIFO)
   - **Inventory Valuation**: Automated
   - Check the **Stock Valuation**, **Stock Input** and **Stock Output** accounts are filled.
4. If you buy in cartons and sell in units, enable **Units of Measure** in **Inventory ▸ Configuration ▸ Settings**.
5. Open **Inventory ▸ Products ▸ Products** and click **New**:
   - **Product Type**: Storable Product
   - **Invoicing Policy**: Delivered quantities
   - **Sales Price** and **Cost**
   - **Product Category**: one of your new categories
   - **Internal Reference** (SKU) and **Barcode**
   - **Unit of Measure** = Units, **Purchase UoM** = Units or a carton UoM
6. On the **Purchase** tab add the vendor, vendor price and lead time.
7. Create one **Service** product (e.g. *Delivery Charge*) and one **Consumable** for comparison.`,
        odooPath: "Inventory ▸ Configuration ▸ Product Categories; Inventory ▸ Products ▸ Products",
        dependsOn: [2, 3],
        validation: "Categories show the chosen costing method and Automated valuation with accounts filled; products are Storable with category, SKU, prices, invoicing policy and at least one vendor line.",
        commonMistakes: [
          "Creating trading items as Consumable instead of Storable, so no stock quantities or valuation are tracked",
          "Leaving all products in the default 'All' category with manual valuation",
          "Changing the costing method after stock has moved without understanding the revaluation entries it creates",
          "Mixing UoM categories (e.g. purchase in kg, sell in units) which Odoo does not allow on one product",
        ],
      },
      {
        title: "Configure warehouses and stock locations",
        why: "The warehouse structure determines where stock is held, how goods are received and shipped (1, 2 or 3 steps) and how accurately the business knows what is available to sell.",
        instructions: `### Goal
Set up the main warehouse, sub-locations and receipt/delivery routes.

1. Open **Inventory ▸ Configuration ▸ Settings** and enable under **Warehouse**:
   - **Storage Locations**
   - **Multi-Step Routes** (only if you need 2- or 3-step flows)
2. Open **Inventory ▸ Configuration ▸ Warehouses**, edit the default warehouse:
   - **Warehouse** name: Northstar Main Warehouse, **Short Name**: WH
   - **Incoming Shipments**: Receive goods directly (1 step) for this scenario
   - **Outgoing Shipments**: Deliver goods directly (1 step)
3. Open **Inventory ▸ Configuration ▸ Locations** and create internal sub-locations under **WH/Stock**: e.g. **WH/Stock/Bulk** and **WH/Stock/Pick**.
4. (Optional) Enable **Putaway rules** in settings and create a rule so that received paper goes to WH/Stock/Bulk (verify in your training instance).
5. Check **Inventory ▸ Configuration ▸ Operation Types** to see the Receipts and Delivery Orders operation types created for the warehouse (verify in your training instance).`,
        odooPath: "Inventory ▸ Configuration ▸ Settings / Warehouses / Locations",
        dependsOn: [1],
        validation: "The warehouse has the correct name and short name; sub-locations appear as WH/Stock/Bulk and WH/Stock/Pick; Inventory overview shows Receipts and Delivery Orders cards for the warehouse.",
        commonMistakes: [
          "Creating new locations as 'View' type and then trying to store stock in them",
          "Enabling 3-step delivery without staff to process the pick and pack operations, so orders get stuck",
          "Changing the warehouse short name after go-live, which changes document sequences and location names",
          "Creating locations outside WH/Stock, so their stock is not counted as available in the warehouse",
        ],
      },
      {
        title: "Configure taxes, payment terms and pricelists",
        why: "Taxes, payment terms and prices are the commercial rules applied automatically on every quotation, order and invoice. Getting them right prevents billing errors and makes due dates and aged balances meaningful.",
        instructions: `### Goal
Set default taxes, the payment terms used by customers and vendors, and a Wholesale pricelist.

**Taxes**
1. Open **Accounting ▸ Configuration ▸ Taxes**. Review the taxes loaded by the localization.
2. Create or adjust a sales tax (e.g. *Sales Tax 8%*, Type of Tax Use = Sales, Computation = Percentage of Price, Amount = 8) and confirm the **tax account** on the distribution lines.
3. Set default sales/purchase taxes in **Accounting ▸ Configuration ▸ Settings ▸ Default Taxes**.

**Payment terms**
4. Open **Accounting ▸ Configuration ▸ Payment Terms** and check that **Immediate Payment**, **15 Days**, **30 Days** and **45 Days** exist; create missing ones (due 100% after N days).
5. Optionally create **2/10 Net 30** using an early payment discount (verify in your training instance).

**Pricelists**
6. Enable **Pricelists** in **Sales ▸ Configuration ▸ Settings ▸ Pricing**.
7. Open **Sales ▸ Products ▸ Pricelists**, create **Wholesale**: a rule applying to All Products with a 10% discount on the sales price.
8. Assign the Wholesale pricelist to key-account customers (Contacts ▸ Sales & Purchase tab).`,
        odooPath: "Accounting ▸ Configuration ▸ Taxes / Payment Terms; Sales ▸ Configuration ▸ Settings; Sales ▸ Products ▸ Pricelists",
        dependsOn: [2, 3, 4],
        validation: "A test quotation for a Wholesale customer shows the discounted price, the correct tax and the customer's payment term; the invoice due date matches the payment term.",
        commonMistakes: [
          "Setting the tax as 'Included in Price' when prices are actually tax-exclusive",
          "Creating duplicate taxes with the same name, so users pick the wrong one",
          "Creating pricelists but never assigning them to customers",
          "Forgetting to enable the Pricelists setting, so the Pricelists menu is not visible",
        ],
      },
      {
        title: "Configure sales and purchase workflows",
        why: "Workflow settings decide when orders need approval, what is invoiced (ordered vs delivered quantities) and how vendor bills are controlled — the core internal controls of a trading company.",
        instructions: `### Goal
Align Sales and Purchase settings with Northstar's business rules.

**Sales**
1. Open **Sales ▸ Configuration ▸ Settings**.
2. Under **Invoicing**, set the default **Invoicing Policy** to **Invoice what is delivered**.
3. Enable **Online Signature** / **Online Payment** on quotations only if required.
4. Optionally enable **Discounts** on order lines and **Customer Addresses** (separate invoice/delivery addresses).

**Purchase**
5. Open **Purchase ▸ Configuration ▸ Settings**.
6. Enable **Purchase Order Approval** and set the minimum amount (e.g. 5,000 USD) above which a manager must approve.
7. Under **Invoicing**, set **Bill Control** to **Received quantities**.
8. Enable **3-way matching** (if available in your edition) so bills are compared with received quantities (verify in your training instance).
9. Optionally enable **Purchase Agreements** or **Warnings** if needed.

**Users**
10. In **Settings ▸ Users & Companies ▸ Users**, give the purchasing manager the Purchase *Administrator* role so they can approve orders.`,
        odooPath: "Sales ▸ Configuration ▸ Settings; Purchase ▸ Configuration ▸ Settings; Settings ▸ Users & Companies ▸ Users",
        dependsOn: [4, 6],
        validation: "A purchase order above the threshold goes to 'To Approve' for a user without approval rights; a sales order cannot be invoiced before delivery when the product uses delivered-quantity invoicing.",
        commonMistakes: [
          "Setting invoicing policy on the setting but leaving existing products on 'Ordered quantities'",
          "Setting the approval threshold but giving every buyer Administrator rights, which bypasses approval",
          "Using 'Ordered quantities' bill control, allowing payment for goods never received",
        ],
      },
      {
        title: "Import opening stock and financial balances",
        why: "Go-live requires the system to start with the same stock quantities and account balances as the legacy system. Without opening balances, stock availability, valuation, receivables and payables are wrong from day one.",
        instructions: `### Goal
Load opening stock quantities and opening general-ledger balances as of the cut-over date.

**Opening stock**
1. Prepare the opening stock template (product external ID, location, counted quantity, lot if tracked).
2. Open **Inventory ▸ Operations ▸ Physical Inventory**.
3. Use **Import records** from the gear/Favorites menu, or click **New** to add a line per product and location, entering the **Counted Quantity**.
4. Review the lines and click **Apply** (Apply All) to validate. Odoo creates inventory adjustment moves and, with automated valuation, journal entries to the stock valuation account.

**Opening balances**
5. Open receivables and payables are best imported as individual opening invoices/bills (one per open document) so they can be reconciled with later payments.
6. For general-ledger balances (bank, fixed assets, equity, loans), post an opening journal entry in the Miscellaneous journal (Accounting ▸ Accounting ▸ Journal Entries — verify in your training instance), or use the opening balance columns in the Chart of Accounts list view (verify in your training instance).
7. Make sure the stock valuation account balance after step 4 matches the legacy inventory value and is **not** entered a second time in the opening journal entry.`,
        odooPath: "Inventory ▸ Operations ▸ Physical Inventory; Accounting ▸ Configuration ▸ Chart of Accounts",
        dependsOn: [2, 4, 5],
        validation: "Inventory ▸ Reporting ▸ Stock shows the expected quantities per location; the stock valuation account balance equals the legacy inventory value; the trial balance (or GL) shows opening balances matching the legacy closing trial balance; open AR/AP totals match the legacy aged reports.",
        commonMistakes: [
          "Counting the inventory value twice: once via stock adjustment and again in the opening journal entry",
          "Importing quantities before costs are set, so valuation is zero",
          "Importing open receivables as one lump balance per customer group, making later reconciliation impossible",
          "Using the wrong cut-over date, so opening entries fall in the wrong fiscal period",
        ],
      },
      {
        title: "Execute a purchase-to-pay cycle",
        why: "Running a full P2P cycle proves that the configuration works together: approval, receipt, valuation, vendor bill control and payment posting.",
        instructions: `### Goal
Buy goods from a vendor and complete the cycle through payment.

1. **Purchase ▸ Orders ▸ Requests for Quotation ▸ New**: select a vendor, add two storable products with quantities.
2. **Send by Email** (optional) and **Confirm Order**. If above the approval threshold, log in as the manager and **Approve**.
3. Click the **Receipt** smart button, enter received quantities and **Validate**.
4. Back on the PO, click **Create Bill**. Enter the vendor bill reference and **Bill Date**, then **Confirm**.
5. On the bill click **Register Payment**, select the Bank journal and **Create Payment**.
6. Open the journal items of the receipt, the bill and the payment to understand each posting.`,
        odooPath: "Purchase ▸ Orders ▸ Purchase Orders (verify in your training instance)",
        dependsOn: [5, 6, 7, 8],
        validation: "PO shows status Fully Billed; stock on hand increased; the receipt posted Dr Stock Valuation / Cr Stock Interim (Received); the bill posted Dr Stock Interim (Received) + Tax / Cr Accounts Payable; the payment cleared payable (bill shows In Payment or Paid).",
        commonMistakes: [
          "Creating the bill before the receipt when bill control is on received quantities (bill shows zero quantity)",
          "Typing a different unit price on the bill without understanding the price difference posting",
          "Registering the payment outside the bill, so the bill stays unpaid",
        ],
      },
      {
        title: "Execute an order-to-cash cycle",
        why: "The O2C cycle tests pricing, availability, delivery, cost of goods sold, invoicing and customer payment — the revenue side of the business.",
        instructions: `### Goal
Sell goods to a customer and complete the cycle through payment.

1. **Sales ▸ Orders ▸ Quotations ▸ New**: select a Wholesale customer, add products; check that the pricelist and tax apply.
2. **Send by Email** (optional) and **Confirm**.
3. Click the **Delivery** smart button, **Check Availability**, set quantities done and **Validate**.
4. Back on the SO, click **Create Invoice** ▸ **Regular invoice** ▸ **Create Draft**, then **Confirm**.
5. **Register Payment** on the invoice (Bank journal).
6. Review the journal items of the delivery (COGS) and the invoice (revenue).`,
        odooPath: "Sales ▸ Orders ▸ Quotations",
        dependsOn: [6, 7, 9],
        validation: "SO shows Fully Invoiced; stock on hand decreased; delivery posted Dr Stock Interim (Delivered) / Cr Stock Valuation, and COGS is recognized per the localization's stock accounting (Anglo-Saxon or continental); invoice posted Dr Receivable / Cr Sales + Tax; invoice status Paid / In Payment.",
        commonMistakes: [
          "Invoicing before delivering when the policy is 'delivered quantities' (Odoo reports nothing to invoice)",
          "Overriding prices manually instead of fixing the pricelist",
          "Delivering from the wrong location because sub-locations were created outside WH/Stock",
        ],
      },
      {
        title: "Verify inventory valuation and accounting entries",
        why: "A consultant must prove that the stock value in Inventory equals the balance of the stock valuation account in Accounting. Discrepancies indicate configuration errors that will distort the balance sheet.",
        instructions: `### Goal
Reconcile inventory valuation with the general ledger.

1. Open **Inventory ▸ Reporting ▸ Valuation** (requires Accounting/automated valuation) and note the total value (verify in your training instance).
2. Open the Stock Valuation account in the general ledger or **Accounting ▸ Configuration ▸ Chart of Accounts** and check its balance (the General Ledger report is Enterprise; in Community use Journal Items filtered by account — verify in your training instance).
3. Compare the two totals. They must match.
4. Check the interim accounts: **Stock Interim (Received)** should net to zero for received-and-billed POs; **Stock Interim (Delivered)** should net to zero for delivered-and-invoiced SOs (Anglo-Saxon localizations).
5. Investigate any difference: manual journal entries on the valuation account, products in categories with manual valuation, or bills with price differences.`,
        odooPath: "Inventory ▸ Reporting ▸ Valuation (verify in your training instance)",
        dependsOn: [8, 9, 10],
        validation: "Inventory valuation total equals the Stock Valuation account balance; interim accounts have no unexplained balances.",
        commonMistakes: [
          "Posting manual journal entries directly to the stock valuation account",
          "Leaving some categories on manual (periodic) valuation, so their moves never reach the GL",
          "Ignoring open interim balances caused by goods received but not yet billed (which are legitimate accruals)",
        ],
      },
      {
        title: "Generate financial and operational reports",
        why: "Reports are how management consumes the ERP. Showing that the configured system answers real questions (profit, stock, sales, purchases, receivables) is the final proof of a successful configuration.",
        instructions: `### Goal
Produce the standard reports management needs and save useful views.

1. **Sales ▸ Reporting ▸ Sales**: analyse revenue by customer and product (pivot and graph views).
2. **Purchase ▸ Reporting ▸ Purchase**: analyse purchased quantities and vendor performance.
3. **Inventory ▸ Reporting ▸ Stock**: on-hand quantities per location; **Moves History** / **Moves Analysis** for traceability (verify in your training instance).
4. **Accounting ▸ Reporting**: Balance Sheet, Profit and Loss, Aged Receivable, Aged Payable, General Ledger. **Enterprise:** these dynamic financial reports are part of Odoo Enterprise; Community users rely on Invoice Analysis and Journal Items (verify in your training instance).
5. In any analysis view, set filters/grouping and save them via **Favorites ▸ Save current search** for reuse.
6. Export a pivot to spreadsheet (download icon) for management packs.`,
        odooPath: "Sales ▸ Reporting; Purchase ▸ Reporting; Inventory ▸ Reporting; Accounting ▸ Reporting",
        dependsOn: [9, 10, 11],
        validation: "The P&L shows the sale's revenue and COGS; the balance sheet shows inventory, receivables and payables consistent with the transactions; the aged receivable shows no open invoice for the paid customer; saved favourites reopen with the correct filters.",
        commonMistakes: [
          "Promising Enterprise financial reports to a client running Community edition",
          "Reading reports without date filters, mixing opening balances with current-period activity",
          "Exporting raw data to spreadsheets instead of using pivot grouping and saved favourites",
        ],
      },
    ],
    expectedResult: `## Expected result
At the end of the lab you have a working trading company in Odoo 17.0:

- [x] Company with US localization, chart of accounts, journals and taxes
- [x] Customers and vendors with payment terms and pricelists
- [x] Categorised storable products with automated (perpetual) valuation
- [x] One warehouse with storage sub-locations
- [x] Sales invoicing on delivered quantities and purchase bill control on received quantities, with PO approval
- [x] Opening stock and balances loaded
- [x] One complete P2P cycle and one complete O2C cycle, both paid
- [x] Inventory valuation reconciled with the Stock Valuation account
- [x] Saved reports for sales, purchases, stock and finance

### Accounting summary of the cycles
| Event | Debit | Credit |
|---|---|---|
| Goods receipt | Stock Valuation | Stock Interim (Received) |
| Vendor bill | Stock Interim (Received), Tax | Accounts Payable |
| Vendor payment | Accounts Payable | Bank (via outstanding payments) |
| Delivery | Stock Interim (Delivered) / COGS | Stock Valuation |
| Customer invoice | Accounts Receivable | Sales, Tax |
| Customer payment | Bank (via outstanding receipts) | Accounts Receivable |

*Exact accounts depend on the localization (Anglo-Saxon vs continental accounting).*`,
    commonMistakes: [
      "Skipping the localization decision and recording transactions first",
      "Using Consumable instead of Storable products for traded goods",
      "Leaving product categories on manual valuation while expecting the balance sheet to show stock",
      "Double-counting opening inventory value in both the stock adjustment and the opening journal entry",
      "Testing only the happy path and never verifying journal entries",
    ],
  },

  /* ================================================================ */
  /* B. Manufacturing company                                          */
  /* ================================================================ */
  {
    slug: "manufacturing-company",
    title: "Configure a manufacturing company",
    businessType: "Discrete manufacturing (make-to-stock)",
    level: "intermediate",
    odooVersion: "Odoo 17.0",
    summary:
      "Configure Odoo Manufacturing for a small furniture maker: components and finished goods, units of measure, bills of materials, work centers and operations, manufacturing orders, consumption, costing and production reporting.",
    companyProfile: `## Oakline Furniture Works (fictional)

**Oakline Furniture Works** manufactures solid-wood tables and chairs in a single plant and sells to retailers.

| Attribute | Value |
|---|---|
| Country / currency | United States / USD |
| Employees | 60 (40 on the shop floor) |
| Plant | 1 warehouse with raw-material store, production area and finished-goods store |
| Products | 12 finished products, ~80 components (wood boards, screws, glue, varnish, packaging) |
| Production | Make-to-stock in batches; 3 work centers: Cutting, Assembly, Finishing |

### Key business rules
- Wood is purchased in **board feet** or **meters** and consumed in the same UoM category; screws are bought in boxes of 100 and consumed in units.
- Every finished product has a single-level BoM; table tops are a **semi-finished** sub-assembly.
- Labour cost is charged through work-center hourly rates.
- Finished goods are valued at **standard cost** reviewed quarterly; components at **average cost**.`,
    odooApps: ["Manufacturing", "Inventory", "Purchase", "Accounting / Invoicing", "Sales"],
    prerequisites: [
      "Completed the Trading Company configuration lab (company, accounting, warehouse basics)",
      "Manufacturing, Inventory and Purchase apps installed in an Odoo 17.0 training database",
      "Understanding of bills of materials, routings and standard vs average costing",
    ],
    steps: [
      {
        title: "Create components and finished products",
        why: "Manufacturing needs separate records for what you buy (components), what you make in between (sub-assemblies) and what you sell (finished goods), each with the right type, category, costing and routes.",
        instructions: `### Goal
Create raw materials, a sub-assembly and finished products with correct routes and categories.

1. In **Inventory ▸ Configuration ▸ Product Categories** create **Raw Materials** (Costing Method: Average Cost, Automated) and **Finished Goods** (Standard Price, Automated).
2. In **Inventory ▸ Products ▸ Products** create components as **Storable Product**: *Oak Board 2m*, *Wood Screw*, *Wood Glue*, *Varnish*, *Carton Box*. On the **Inventory** tab tick the **Buy** route and add a vendor on the **Purchase** tab.
3. Create the sub-assembly *Table Top 180x90* as Storable, route **Manufacture**.
4. Create finished goods *Dining Table Oak 180* and *Dining Chair Oak* as Storable, **Can be Sold**, route **Manufacture**, category Finished Goods.
5. Set **Cost** on components (used for average cost start) and a provisional cost on finished goods.`,
        odooPath: "Inventory ▸ Products ▸ Products; Inventory ▸ Configuration ▸ Product Categories",
        validation: "Components show route Buy and a vendor; sub-assembly and finished goods show route Manufacture; categories show the intended costing method and automated valuation.",
        commonMistakes: [
          "Creating components as Consumable, so shortages are not detected and no valuation is recorded",
          "Ticking both Buy and Manufacture routes on the same product without understanding which one replenishment will choose",
          "Putting finished goods and raw materials in the same category with one costing method",
        ],
      },
      {
        title: "Configure units of measure",
        why: "Purchasing, stocking and consumption often happen in different units. Correct UoM conversion prevents massive quantity and cost errors in BoMs and purchase orders.",
        instructions: `### Goal
Enable units of measure and define purchase vs stock units.

1. Enable **Units of Measure** in **Inventory ▸ Configuration ▸ Settings ▸ Products**.
2. Open the UoM categories list (Inventory ▸ Configuration ▸ UoM Categories — verify in your training instance).
3. In the **Unit** category create **Box of 100** (Type: Bigger than the reference, Ratio 100).
4. Check the **Length / Distance** category contains **m** (reference) and that you are consistent: *Oak Board* stocked in Units (boards) or in m — choose one.
5. On *Wood Screw* set **Unit of Measure** = Units and **Purchase UoM** = Box of 100.`,
        odooPath: "Inventory ▸ Configuration ▸ Settings (verify UoM Categories menu in your training instance)",
        dependsOn: [1],
        validation: "A purchase order for 5 Box of 100 screws results, after receipt, in 500 Units on hand; vendor price per box is converted correctly to cost per unit.",
        commonMistakes: [
          "Creating 'Box of 100' as a new category instead of inside the Unit category, preventing conversion",
          "Setting the ratio in the wrong direction (0.01 instead of 100)",
          "Changing a product's UoM after transactions exist",
        ],
      },
      {
        title: "Create bills of materials",
        why: "The BoM defines what and how much is consumed to produce one unit. It drives component reservation, purchase requirements and product cost.",
        instructions: `### Goal
Create BoMs for the sub-assembly and the finished goods.

1. Open **Manufacturing ▸ Products ▸ Bills of Materials ▸ New**.
2. **Product**: Table Top 180x90, **Quantity** 1, **BoM Type**: Manufacture this product.
3. **Components** tab: Oak Board 2m × 3, Wood Glue × 0.2 (if glue is in litres, use the right UoM), Wood Screw × 12.
4. Save. Create the BoM for **Dining Table Oak 180**: Table Top 180x90 × 1, Table Leg (bought) × 4, Wood Screw × 16, Varnish × 0.5, Carton Box × 1.
5. Create the BoM for **Dining Chair Oak**.
6. Open the **BoM Overview** (Overview / Structure & Cost button on the BoM — verify in your training instance) to check the multi-level structure and the computed cost.`,
        odooPath: "Manufacturing ▸ Products ▸ Bills of Materials",
        dependsOn: [1, 2],
        validation: "The BoM overview for the dining table shows two levels (table top components nested) and a total cost equal to the sum of component costs.",
        commonMistakes: [
          "Creating a Kit BoM instead of Manufacture this product",
          "Entering the BoM quantity as the batch size (e.g. 10) and component quantities per unit, causing a 10× error",
          "Forgetting packaging components, understating product cost",
        ],
      },
      {
        title: "Configure work centers",
        why: "Work centers represent machines or teams that perform operations. Their capacity and hourly cost drive scheduling and the labour/overhead part of product cost.",
        instructions: `### Goal
Enable work orders and create the three work centers.

1. Open **Manufacturing ▸ Configuration ▸ Settings** and enable **Work Orders** under Operations. Save.
2. Open **Manufacturing ▸ Configuration ▸ Work Centers ▸ New**.
3. Create **Cutting**: Time Efficiency 100%, Capacity 1, Cost per hour 45, Setup Time 10 min, Cleanup Time 5 min.
4. Create **Assembly** (Cost per hour 35) and **Finishing** (Cost per hour 40).
5. Optionally set a **Working Hours** calendar per work center.`,
        odooPath: "Manufacturing ▸ Configuration ▸ Settings; Manufacturing ▸ Configuration ▸ Work Centers",
        validation: "The Work Centers menu lists Cutting, Assembly and Finishing with their hourly costs; the Work Orders setting is active (BoMs show an Operations tab).",
        commonMistakes: [
          "Looking for the Work Centers menu before enabling the Work Orders setting",
          "Leaving cost per hour at zero, so labour is missing from product cost",
          "Setting capacity higher than reality, producing unrealistic schedules",
        ],
      },
      {
        title: "Define routing operations on the BoM",
        why: "Operations describe the sequence of work (cut, assemble, finish) and the expected duration at each work center, enabling shop-floor execution, scheduling and labour costing.",
        instructions: `### Goal
Add operations to the BoMs.

1. Open the BoM of **Dining Table Oak 180** and go to the **Operations** tab (visible after enabling Work Orders).
2. Add lines:
   - **Assembly** – work center Assembly – default duration 40 min
   - **Finishing** – work center Finishing – default duration 30 min
3. Open the **Table Top 180x90** BoM and add **Cutting** – work center Cutting – 25 min.
4. On the Components tab, use **Consumed in Operation** to link varnish to the Finishing operation (so it is consumed at that step).
5. Optionally attach work instructions (PDF or text) to each operation.`,
        odooPath: "Manufacturing ▸ Products ▸ Bills of Materials (Operations tab)",
        dependsOn: [3, 4],
        validation: "BoM overview shows operations with durations and an operation cost based on work-center hourly rates.",
        commonMistakes: [
          "Entering the duration for the full batch rather than per unit of the BoM quantity",
          "Not linking components to operations, so all material is consumed at the first operation",
          "Creating operations without assigning the correct work center",
        ],
      },
      {
        title: "Create and plan a manufacturing order",
        why: "The manufacturing order (MO) is the transactional document that reserves components, schedules work and records production. It validates the BoM and routing in practice.",
        instructions: `### Goal
Create, confirm and plan an MO for 5 dining tables.

1. Make sure components are in stock (receive a PO or use a physical inventory adjustment).
2. **Manufacturing ▸ Operations ▸ Manufacturing Orders ▸ New** (verify in your training instance).
3. Product: Dining Table Oak 180, Quantity 5. The BoM is selected automatically.
4. **Confirm**. Odoo creates a child MO for the table tops if the sub-assembly is not in stock (depending on routes/replenishment) — review it.
5. Check **Component Status** (Available / Not available) and click **Check availability** if needed.
6. Click **Plan** to schedule work orders on the work centers.`,
        odooPath: "Manufacturing ▸ Operations ▸ Manufacturing Orders (verify in your training instance)",
        dependsOn: [3, 5],
        validation: "The MO is Confirmed/planned with work orders for Assembly and Finishing; components show as reserved; the sub-assembly requirement is covered by stock or a child MO.",
        commonMistakes: [
          "Confirming MOs without component stock and wondering why they cannot be produced",
          "Manually changing component quantities on the MO instead of fixing the BoM",
          "Ignoring the sub-assembly requirement",
        ],
      },
      {
        title: "Record component consumption and work orders",
        why: "Actual consumption and time drive accurate stock levels and actual cost. Recording scrap and variances is critical for shop-floor control.",
        instructions: `### Goal
Execute work orders and record actual consumption.

1. Open the MO and start the first work order (**Start** on the Work Orders tab, or via the shop-floor/tablet view — the Shop Floor app is Enterprise in Odoo 17; verify in your training instance).
2. Record actual duration (stop the timer or edit the real duration).
3. On the **Components** tab, adjust **Quantity** consumed if actual usage differs from the BoM (e.g. 16 instead of 15 boards).
4. Use **Scrap** on the MO to record a damaged board (scrap goes to the Scrap location).
5. Complete all work orders.`,
        odooPath: "Manufacturing ▸ Operations ▸ Manufacturing Orders",
        dependsOn: [6],
        validation: "Work orders show real durations; component moves show actual quantities; scrap order exists and stock decreased accordingly.",
        commonMistakes: [
          "Not recording scrap, causing stock differences at the next count",
          "Leaving timers running overnight, inflating labour cost",
          "Marking all components consumed without checking real usage",
        ],
      },
      {
        title: "Produce finished goods",
        why: "Producing moves finished goods into stock, consumes components and creates the valuation entries that transfer cost from raw materials to finished goods.",
        instructions: `### Goal
Close the MO and receive finished goods into stock.

1. On the MO set **Quantity** produced (5, or less for partial production).
2. Click **Produce All** / **Mark as Done** (button label varies; verify in your training instance).
3. If producing fewer than planned, choose whether to create a **backorder** for the rest.
4. Check **Inventory ▸ Reporting ▸ Stock** for finished-goods quantity.`,
        odooPath: "Manufacturing ▸ Operations ▸ Manufacturing Orders",
        dependsOn: [7],
        validation: "MO is Done; finished goods on hand increased by the produced quantity; component quantities decreased; a backorder exists if partially produced.",
        commonMistakes: [
          "Closing an MO for the full quantity when only part was actually produced",
          "Refusing backorders and losing track of remaining production",
          "Producing finished goods whose sub-assembly MO was never completed",
        ],
      },
      {
        title: "Review costing and inventory valuation",
        why: "Management needs to know what each product really costs. Comparing BoM (planned) cost, standard cost and actual MO cost reveals margin issues and wasted material or time.",
        instructions: `### Goal
Set and verify standard cost and inspect the valuation entries of production.

1. On the finished product form, use **Compute Price from BoM** (verify in your training instance) to update the standard cost from components and operations.
2. Open the MO's valuation entries (Valuation smart button / Inventory ▸ Reporting ▸ Valuation — verify in your training instance): components credited from Stock Valuation, finished goods debited.
3. With automated valuation and work-center costs, check the production cost posting and any variance between standard and actual cost (the posting logic depends on configuration — verify in your training instance).
4. Compare actual vs expected cost using the MO's cost analysis. **Enterprise:** the detailed Production Analysis / MO cost analysis report is part of Enterprise in Odoo 17 (verify in your training instance).`,
        odooPath: "Inventory ▸ Products ▸ Products; Inventory ▸ Reporting ▸ Valuation (verify in your training instance)",
        dependsOn: [8],
        validation: "Finished product standard cost equals BoM components + operation cost; valuation layers exist for consumed components and produced finished goods; the stock valuation account balance still equals the inventory valuation report.",
        commonMistakes: [
          "Never recomputing standard cost after component prices change",
          "Using standard costing on components with volatile prices, creating large price differences",
          "Forgetting that work-center costs are only included if hourly costs are filled",
        ],
      },
      {
        title: "Use manufacturing reports",
        why: "Production planners and managers track throughput, efficiency, delays and scrap to improve operations. Knowing which reports are standard prevents over-promising.",
        instructions: `### Goal
Analyse production performance.

1. **Manufacturing ▸ Reporting ▸ Manufacturing Orders** (pivot/graph): MOs by product, state and date (verify in your training instance).
2. **Manufacturing ▸ Reporting ▸ Work Orders**: durations vs expected per work center (verify in your training instance).
3. **Manufacturing ▸ Reporting** for **Overall Equipment Effectiveness** (OEE) based on work-center productivity losses (verify in your training instance).
4. **Inventory ▸ Reporting ▸ Stock** and **Moves Analysis** for component consumption and scrap.
5. Save frequently used analyses as Favorites.`,
        odooPath: "Manufacturing ▸ Reporting (verify in your training instance)",
        dependsOn: [8, 9],
        validation: "You can show produced quantity per product, actual vs expected work-order duration per work center, and scrap quantities for the period.",
        commonMistakes: [
          "Reporting on MOs without filtering by state (counting cancelled MOs)",
          "Expecting Enterprise-only analysis reports in Community",
        ],
      },
    ],
    expectedResult: `## Expected result
- [x] Components (Buy), sub-assembly and finished goods (Manufacture) with appropriate costing methods
- [x] UoM conversion between purchase boxes and consumption units
- [x] Multi-level BoMs with operations on 3 work centers
- [x] At least one MO completed with real durations, adjusted consumption and scrap
- [x] Finished goods in stock with correct valuation and a recomputed standard cost
- [x] Production reports showing output and work-center efficiency

### Valuation flow
| Event | Effect |
|---|---|
| Component consumption | Credit Stock Valuation (raw materials) |
| Finished goods production | Debit Stock Valuation (finished goods) |
| Labour/overhead (work-center cost) | Included in production value according to configuration (verify) |`,
    commonMistakes: [
      "Configuring operations before enabling the Work Orders setting",
      "BoM quantity and component quantity mismatch (batch vs per unit)",
      "Ignoring sub-assembly replenishment routes",
      "Skipping scrap and real-duration recording, making costs unreliable",
    ],
  },

  /* ================================================================ */
  /* C. Professional services                                          */
  /* ================================================================ */
  {
    slug: "professional-services",
    title: "Configure a professional services firm",
    businessType: "Consulting / professional services",
    level: "intermediate",
    odooVersion: "Odoo 17.0",
    summary:
      "Configure Odoo for an IT consulting firm that sells time-and-material and fixed-price projects: service products, project creation from sales orders, timesheets, expense re-invoicing, invoicing and project profitability.",
    companyProfile: `## Brightpath Consulting Group (fictional)

**Brightpath Consulting Group** delivers IT advisory and software implementation services.

| Attribute | Value |
|---|---|
| Country / currency | United States / USD |
| Employees | 35 consultants, 5 admin staff |
| Engagement types | Time & material (hourly), fixed-price milestones, prepaid support blocks |
| Billing | Monthly invoicing of approved timesheets; milestones invoiced on acceptance |
| Expenses | Travel and accommodation re-invoiced to clients at cost |

### Key business rules
- Every signed engagement must automatically create a project.
- Consultants log time daily; managers validate before invoicing.
- Profitability per project must include consultant cost (hourly cost) and re-invoiced expenses.`,
    odooApps: ["Sales", "Project", "Timesheets", "Expenses", "Accounting / Invoicing", "Employees"],
    prerequisites: [
      "Odoo 17.0 database with Sales, Project, Expenses, Employees and Accounting/Invoicing installed",
      "Timesheet functionality: the Timesheets app is Enterprise in Odoo 17; in Community, timesheets are logged on tasks via the Project 'Timesheets' setting (verify in your training instance)",
      "Basic company and accounting configuration done (see Trading Company lab steps 1–2)",
    ],
    steps: [
      {
        title: "Enable project, timesheet and analytic settings",
        why: "Service profitability relies on analytic accounting and timesheets. These settings must be on before any project or sales order is created so that costs and revenues are captured from day one.",
        instructions: `### Goal
Activate the features needed for service delivery.

1. **Accounting ▸ Configuration ▸ Settings**: enable **Analytic Accounting**.
2. **Project ▸ Configuration ▸ Settings**: enable **Timesheets** and **Milestones**.
3. **Sales ▸ Configuration ▸ Settings**: check timesheet-related options (e.g. **Timesheets** invoicing of time) are available (verify in your training instance).
4. **Employees**: create employee records for consultants, link each to a **User**, and set the **Hourly Cost** (HR Settings tab — verify in your training instance).`,
        odooPath: "Accounting ▸ Configuration ▸ Settings; Project ▸ Configuration ▸ Settings (verify in your training instance)",
        validation: "Projects show a Timesheets tab on tasks and a Milestones option; employees have users and hourly costs; analytic accounts are created automatically for new projects.",
        commonMistakes: [
          "Forgetting the employee hourly cost, so project profitability shows zero cost",
          "Not linking employees to users, so they cannot log their own time",
          "Enabling milestones after milestone-based products were already sold",
        ],
      },
      {
        title: "Create service products with invoicing policies",
        why: "The service product's invoicing policy and service-tracking option decide whether Odoo invoices hours, milestones or a fixed price and whether a project or task is created automatically.",
        instructions: `### Goal
Create one product per commercial model.

1. **Sales ▸ Products ▸ Products ▸ New** (verify in your training instance), Product Type **Service**.
2. *Consulting Hour (T&M)*: Unit of Measure **Hours**, Sales Price 150, **Invoicing Policy: Based on Timesheets**, **Create on Order: Project & Task** (choose a project template if you have one).
3. *Implementation Fixed Price*: **Invoicing Policy: Based on Milestones**, **Create on Order: Project**.
4. *Support Block 20h (Prepaid)*: **Invoicing Policy: Prepaid/Fixed Price**, **Create on Order: Task** in an existing *Support* project.
5. *Travel Expenses*: Service or Consumable, **Re-Invoice Expenses: At cost**, **Can be Expensed** ticked (verify in your training instance).`,
        odooPath: "Sales ▸ Products ▸ Products (verify in your training instance)",
        dependsOn: [1],
        validation: "Each product shows the intended invoicing policy and Create on Order option; the expense product shows Re-Invoice Expenses = At cost.",
        commonMistakes: [
          "Using 'Ordered quantities' for T&M, invoicing the estimate instead of actual hours",
          "Choosing 'Create on Order: Nothing', so no project is created",
          "Selling hours in Units instead of Hours, breaking timesheet-to-invoice conversion",
        ],
      },
      {
        title: "Create a project template and stages",
        why: "Standardised projects (stages, task lists, milestones) make delivery repeatable and allow sales orders to generate consistent projects.",
        instructions: `### Goal
Prepare a template project used when sales orders create projects.

1. **Project ▸ New**: name *Template – Implementation*.
2. Create stages: *Backlog*, *In Progress*, *Client Review*, *Done*.
3. Create standard tasks: Kick-off, Requirements Workshop, Configuration, UAT, Go-live.
4. Reference this project as the **Project Template** on the service products (step 2).`,
        odooPath: "Project",
        dependsOn: [1, 2],
        validation: "Products reference the template; the template has stages and standard tasks.",
        commonMistakes: [
          "Logging real time on the template project",
          "Creating too many stages, making boards hard to use",
        ],
      },
      {
        title: "Create projects from sales orders",
        why: "Linking the sale to the project ensures delivered work can be invoiced and that project revenue is traceable to the contract.",
        instructions: `### Goal
Sell an engagement and let Odoo create the project.

1. **Sales ▸ Orders ▸ Quotations ▸ New** for a customer.
2. Add *Consulting Hour (T&M)* × 80 hours and *Implementation Fixed Price* × 1.
3. **Confirm**. Use the **Project** smart button to open the generated project and tasks.
4. In the project, open **Milestones** and create milestones (e.g. *Design approved* 30%, *Go-live* 70%) linked to the fixed-price line (verify in your training instance).`,
        odooPath: "Sales ▸ Orders ▸ Quotations",
        dependsOn: [2, 3],
        validation: "Confirmed SO shows a Project smart button; the project contains tasks linked to the SO line; milestones are linked to the fixed-price SO line.",
        commonMistakes: [
          "Creating the project manually instead of from the SO, losing the billing link",
          "Linking milestones to the wrong sales order line",
        ],
      },
      {
        title: "Record and validate timesheets",
        why: "Timesheets are both the cost driver (employee hourly cost) and the billing driver for T&M lines.",
        instructions: `### Goal
Log time against the project and validate it.

1. As a consultant, open the task and add lines in the **Timesheets** tab (date, description, hours). In Enterprise you can also use the **Timesheets** app grid view.
2. Log 10 hours across several days.
3. **Enterprise:** a manager validates timesheets via Timesheets ▸ To Validate (verify in your training instance). In Community, define an internal review procedure.
4. Check the SO line **Delivered** quantity now shows 10 hours.`,
        odooPath: "Project ▸ (task) ▸ Timesheets tab",
        dependsOn: [4],
        validation: "Delivered quantity on the T&M SO line equals logged hours; timesheet lines appear on the project's analytic account with cost = hours × hourly cost.",
        commonMistakes: [
          "Logging time on tasks not linked to a billable SO line",
          "Logging time in the wrong period, distorting monthly invoicing",
          "Invoicing before timesheets are validated",
        ],
      },
      {
        title: "Record and re-invoice expenses",
        why: "Client-billable expenses must be reimbursed to employees and charged back to the customer without loss.",
        instructions: `### Goal
Submit an expense and re-invoice it on the sales order.

1. **Expenses ▸ My Expenses ▸ New** (verify in your training instance): product *Travel Expenses*, amount 420, attach receipt.
2. Set the **Customer to Reinvoice** / sales order field to the client SO (field name may vary — verify in your training instance) and the analytic distribution to the project.
3. **Create Report** ▸ **Submit to Manager**; manager **Approve**; accountant **Post Journal Entries**.
4. Check the SO: a new line for *Travel Expenses* at cost is added, ready to invoice.`,
        odooPath: "Expenses (verify in your training instance)",
        dependsOn: [2, 4],
        validation: "The SO has an expense line with delivered quantity 1 and price 420; the expense journal entry is posted with the project analytic distribution.",
        commonMistakes: [
          "Not setting the sales order on the expense, so nothing is re-invoiced",
          "Using an expense product without the re-invoice policy",
          "Approving but never posting the expense report",
        ],
      },
      {
        title: "Invoice timesheets, milestones and expenses",
        why: "Invoicing converts delivered work into revenue. Each line type follows its own policy, so the consultant must verify that the invoice only includes what is billable.",
        instructions: `### Goal
Create the monthly invoice.

1. In the project, mark the *Design approved* milestone as **Reached**.
2. On the SO click **Create Invoice** ▸ Regular invoice. With timesheet policies you can restrict to a timesheet period (verify in your training instance).
3. Review lines: hours delivered, milestone %, re-invoiced expense.
4. **Confirm** and send; register the customer payment when received.`,
        odooPath: "Sales ▸ Orders ▸ Sales Orders (verify in your training instance)",
        dependsOn: [5, 6],
        validation: "Invoice contains 10 hours × 150, 30% of the fixed price and the 420 expense; timesheets are marked as invoiced; SO invoiced quantities update.",
        commonMistakes: [
          "Forgetting to mark milestones reached, so they are not invoiced",
          "Invoicing the full fixed price upfront with a milestone product",
          "Editing invoice quantities manually, breaking the SO link",
        ],
      },
      {
        title: "Analyse project profitability",
        why: "Partners want to know whether each project earns money. Profitability combines revenue (invoiced and to invoice) with costs (timesheets, expenses, purchases).",
        instructions: `### Goal
Read the project profitability panel and analytic reports.

1. Open the project and its **Project Updates** / profitability section (verify in your training instance).
2. Review revenues (timesheets, milestones, re-invoiced expenses) vs costs (timesheet cost, expenses).
3. **Accounting ▸ Reporting ▸ Analytic** reports by project analytic account (verify in your training instance; some analytic reports are Enterprise).
4. Compare budgeted hours (SO quantity) with actual hours.`,
        odooPath: "Project (project form / Project Updates — verify in your training instance)",
        dependsOn: [7],
        validation: "Profitability shows revenue and costs consistent with invoice, timesheets (hours × hourly cost) and expenses; margin is calculated.",
        commonMistakes: [
          "Missing employee hourly costs, so margin looks 100%",
          "Expenses without analytic distribution not appearing in project cost",
        ],
      },
      {
        title: "Configure service reports and KPIs",
        why: "Utilisation and billable ratio are the core KPIs of a services business.",
        instructions: `### Goal
Prepare recurring analyses.

1. Timesheet analysis by employee and project (Timesheets reporting in Enterprise, or Project ▸ Reporting — verify in your training instance).
2. Sales ▸ Reporting ▸ Sales for booked services.
3. Invoice analysis for billed revenue by customer (Accounting ▸ Reporting — verify in your training instance).
4. Save favourites: *Billable hours this month*, *Unbilled delivered hours*.`,
        odooPath: "Project ▸ Reporting; Sales ▸ Reporting (verify in your training instance)",
        dependsOn: [5, 7],
        validation: "You can report billable vs non-billable hours per employee and unbilled delivered hours per customer.",
        commonMistakes: [
          "Not distinguishing billable and non-billable projects",
          "Reporting hours without filtering by period",
        ],
      },
    ],
    expectedResult: `## Expected result
- [x] Analytic accounting, timesheets and milestones enabled; employees with hourly cost
- [x] Service products for T&M, milestones, prepaid and re-invoiced expenses
- [x] A sales order that generated a project and tasks automatically
- [x] Timesheets and expenses flowing to the sales order as delivered quantities
- [x] An invoice combining hours, a milestone and an expense
- [x] Project profitability showing revenue, costs and margin

> **Edition note:** The Timesheets app (grid, validation) is Enterprise in Odoo 17. Community users log time on tasks.`,
    commonMistakes: [
      "Wrong invoicing policy on service products",
      "Projects created manually instead of from sales orders",
      "No hourly cost on employees",
      "Expenses not linked to sales orders",
    ],
  },

  /* ================================================================ */
  /* D. Retail business                                                */
  /* ================================================================ */
  {
    slug: "retail-business",
    title: "Configure a retail store with Point of Sale",
    businessType: "Retail store",
    level: "beginner",
    odooVersion: "Odoo 17.0",
    summary:
      "Set up Odoo Point of Sale for a single home-goods store: POS shop, payment methods, barcoded products, pricelists, cash control and sessions, session closing and accounting entries, replenishment and reporting.",
    companyProfile: `## Maple & Co. Home Store (fictional)

**Maple & Co.** runs one home-goods store with two checkout counters.

| Attribute | Value |
|---|---|
| Country / currency | United States / USD |
| Staff | 8 cashiers, 1 store manager, 1 back-office accountant |
| Products | ~1,500 SKUs, all barcoded |
| Payments | Cash, card (external terminal), customer account for a few businesses |
| Stock | Store stock replenished weekly from vendors |

### Key business rules
- Each cashier opens and closes their session; cash differences must be explained.
- Loyalty customers get a 5% member pricelist.
- Stock is reordered automatically below a minimum.`,
    odooApps: ["Point of Sale", "Inventory", "Purchase", "Accounting / Invoicing", "Contacts"],
    prerequisites: [
      "Odoo 17.0 database with Point of Sale, Inventory and Purchase installed",
      "Company, taxes and chart of accounts configured (Trading Company lab steps 1, 2, 6)",
      "Optional: a USB barcode scanner (keyboard emulation) for testing",
    ],
    steps: [
      {
        title: "Create and configure the POS shop",
        why: "The POS configuration defines the shop: which products appear, which warehouse it sells from, receipts and the operating features cashiers use.",
        instructions: `### Goal
Configure a Point of Sale for counter 1.

1. **Point of Sale ▸ Configuration ▸ Point of Sales ▸ New**: name *Maple Counter 1*.
2. Open **Point of Sale ▸ Configuration ▸ Settings** and select the POS (settings are per POS in Odoo 17).
3. Set the **Operation Type** / warehouse used for orders (Inventory section — verify in your training instance).
4. Configure **Receipt** header/footer and enable **Barcode** scanning features as needed.
5. Duplicate for *Maple Counter 2*.`,
        odooPath: "Point of Sale ▸ Configuration ▸ Point of Sales; Point of Sale ▸ Configuration ▸ Settings",
        validation: "Two POS cards appear on the Point of Sale dashboard; each opens a session in the correct warehouse.",
        commonMistakes: [
          "Editing settings for the wrong POS (the settings page applies to the POS selected at the top)",
          "Selling from a warehouse different from the physical store",
        ],
      },
      {
        title: "Configure payment methods",
        why: "Payment methods determine which journals receive the money and how cash, card and customer-account payments are reconciled.",
        instructions: `### Goal
Set up Cash, Card and Customer Account.

1. **Point of Sale ▸ Configuration ▸ Payment Methods**.
2. **Cash**: Journal = Cash (type Cash). This enables cash control (opening/closing counts).
3. **Card**: Journal = Bank; if using an integrated terminal, set the terminal integration (provider-specific; verify availability in your edition).
4. **Customer Account**: no journal (Identify Customer required) — the sale posts to the customer's receivable.
5. In POS settings, add these methods to both POS.`,
        odooPath: "Point of Sale ▸ Configuration ▸ Payment Methods",
        dependsOn: [1],
        validation: "Payment screen in a POS session shows Cash, Card and Customer Account; Customer Account requires selecting a customer.",
        commonMistakes: [
          "Using the same Cash journal for two POS that need separate cash drawers",
          "Using a Bank journal for cash, disabling cash control",
          "Allowing customer account payments without credit approval",
        ],
      },
      {
        title: "Create products with barcodes and POS categories",
        why: "Fast checkout depends on barcode scanning and clear POS categories; stock tracking depends on storable products.",
        instructions: `### Goal
Prepare sellable, barcoded products.

1. **Inventory ▸ Products ▸ Products ▸ New**: Storable Product, Sales Price, Cost, **Barcode** (EAN-13).
2. Tick **Available in POS** and set a **POS Category** (create categories like *Kitchen*, *Bathroom*, *Decor* via Point of Sale ▸ Configuration ▸ PoS Product Categories — verify in your training instance).
3. Set the customer tax (tax-included prices are common in retail; set the tax accordingly).
4. For many products, import with columns name, barcode, list_price, available_in_pos, pos_categ_ids (verify field names in your training instance).`,
        odooPath: "Inventory ▸ Products ▸ Products",
        dependsOn: [1],
        validation: "Scanning a barcode in the POS adds the right product at the right price; products appear under their POS categories.",
        commonMistakes: [
          "Duplicate barcodes (Odoo rejects them, failing imports)",
          "Forgetting Available in POS",
          "Tax-excluded prices on shelf labels but tax-included tax in POS (or vice versa)",
        ],
      },
      {
        title: "Configure pricelists for members",
        why: "Member pricing is a key retail lever; pricelists apply it automatically when a member is selected.",
        instructions: `### Goal
Create a member pricelist used in the POS.

1. Enable **Pricelists** (Sales ▸ Configuration ▸ Settings, or POS settings Pricing section).
2. **Sales ▸ Products ▸ Pricelists ▸ New**: *Members 5%* — rule: All Products, 5% discount.
3. In POS settings, under **Pricing**, add *Members 5%* to the available pricelists (default stays Public).
4. Set the pricelist on member customer records.`,
        odooPath: "Sales ▸ Products ▸ Pricelists; Point of Sale ▸ Configuration ▸ Settings",
        dependsOn: [3],
        validation: "Selecting a member in the POS switches the pricelist and reduces prices by 5%.",
        commonMistakes: [
          "Not adding the pricelist to the POS available pricelists",
          "Making the member pricelist the default for everyone",
        ],
      },
      {
        title: "Open sessions with cash control",
        why: "Cash control protects against loss and theft by reconciling counted cash with expected cash at opening and closing.",
        instructions: `### Goal
Run a sales session.

1. On the POS dashboard click **Open Register** (or New Session). Enter the **opening cash** counted in the drawer.
2. Sell 5 tickets: scan barcodes, pay with Cash (give change), Card, and Customer Account for a business customer.
3. Use **Cash In/Out** to record a petty-cash withdrawal with a reason.
4. Perform a refund of one item (Refund button / select original order — verify in your training instance).`,
        odooPath: "Point of Sale (dashboard)",
        dependsOn: [2, 3, 4],
        validation: "Orders appear in Point of Sale ▸ Orders ▸ Orders for the session; the refund is a negative order; stock decreases per sale and increases on refund.",
        commonMistakes: [
          "Skipping the opening cash count",
          "Processing refunds as manual negative lines instead of using the refund flow",
          "Removing cash from the drawer without Cash In/Out",
        ],
      },
      {
        title: "Close sessions and review accounting entries",
        why: "Closing consolidates sales into journal entries and highlights cash differences; it is the daily link between the store and the books.",
        instructions: `### Goal
Close the session and inspect postings.

1. Click **Close Register**. Count cash; Odoo shows the expected amount and the difference.
2. Enter a note explaining any difference and **Close Session & Post Entries**.
3. Open the session (Point of Sale ▸ Orders ▸ Sessions — verify in your training instance) and the **Journal Entries**: sales and taxes per tax, receivable lines per payment method, cash difference to the profit/loss account.
4. Reconcile card payments with the bank statement later in Accounting.`,
        odooPath: "Point of Sale (dashboard) ▸ Close Register",
        dependsOn: [5],
        validation: "Session state is Closed & Posted; journal entries balance; cash difference (if any) is posted to the configured gain/loss account; customer account sales appear on the customer's receivable.",
        commonMistakes: [
          "Leaving sessions open for days, mixing several days' sales",
          "Closing without counting cash",
          "Not reconciling card settlements, leaving outstanding receipts",
        ],
      },
      {
        title: "Configure inventory replenishment",
        why: "Retail margins depend on availability without overstock. Reordering rules automate purchase proposals based on min/max levels.",
        instructions: `### Goal
Automate weekly replenishment.

1. On a product, use the **Min/Max** (reordering rules) smart button or **Inventory ▸ Operations ▸ Replenishment** (verify in your training instance).
2. Create a rule: Location WH/Stock, Min 10, Max 40, route Buy, vendor set on the product.
3. Sell below the minimum, then open Replenishment and **Order Once** / let the scheduler create an RFQ.
4. Confirm the RFQ and receive the goods.`,
        odooPath: "Inventory ▸ Operations ▸ Replenishment (verify in your training instance)",
        dependsOn: [3, 5],
        validation: "When stock forecast drops below 10, an RFQ is proposed for up to 40 units from the product's vendor.",
        commonMistakes: [
          "Products without vendors, so no RFQ is generated",
          "Min/Max values set without considering vendor lead time",
        ],
      },
      {
        title: "Use POS and inventory reports",
        why: "Store managers need daily sales, best sellers, cashier performance and stock alerts.",
        instructions: `### Goal
Produce daily retail reporting.

1. **Point of Sale ▸ Reporting ▸ Orders** (pivot): sales by product, POS, cashier, hour (verify in your training instance).
2. **Point of Sale ▸ Reporting ▸ Sales Details** (daily sales report PDF) for a session/date range (verify in your training instance).
3. **Inventory ▸ Reporting ▸ Stock** for on-hand and low-stock items.
4. Save favourites for *Today's sales by cashier*.`,
        odooPath: "Point of Sale ▸ Reporting (verify in your training instance)",
        dependsOn: [6, 7],
        validation: "You can print a daily sales report matching the session totals and show sales by cashier and product.",
        commonMistakes: [
          "Comparing POS reports to accounting before sessions are closed and posted",
          "Not filtering refunds when analysing gross sales",
        ],
      },
    ],
    expectedResult: `## Expected result
- [x] Two POS counters selling from the store warehouse
- [x] Cash (with cash control), Card and Customer Account payment methods
- [x] Barcoded products in POS categories; member pricelist
- [x] A full session: opening count, sales, refund, cash out, closing with posted entries
- [x] Reordering rules generating RFQs
- [x] Daily sales and stock reports`,
    commonMistakes: [
      "Sessions left open for days",
      "Duplicate or missing barcodes",
      "Cash journal misconfiguration disabling cash control",
      "Consumable products used for retail stock",
    ],
  },

  /* ================================================================ */
  /* E. Multi-company                                                  */
  /* ================================================================ */
  {
    slug: "multi-company",
    title: "Configure a multi-company group",
    businessType: "Group of companies (holding + subsidiaries)",
    level: "advanced",
    odooVersion: "Odoo 17.0",
    summary:
      "Configure a group with a parent and two subsidiaries in one Odoo database: companies, multi-company user access, company-specific and shared data, inter-company transactions and consolidated reporting considerations.",
    companyProfile: `## Harborview Group (fictional)

| Company | Role | Country / currency |
|---|---|---|
| Harborview Holdings Inc. | Parent, shared services (finance, IT) | United States / USD |
| Harborview Distribution LLC | Buys and sells consumer electronics accessories | United States / USD |
| Harborview Canada Ltd. | Sells to Canadian retailers, buys from Distribution | Canada / CAD |

### Key business rules
- Products and customer master data are shared; prices, taxes, accounts and journals are company-specific.
- Finance staff see all companies; sales staff only their own company.
- Distribution sells to Canada at transfer price; the purchase order in Canada should mirror the sale (inter-company).
- Group management wants consolidated revenue and margin.`,
    odooApps: ["Settings", "Accounting", "Sales", "Purchase", "Inventory", "Contacts"],
    prerequisites: [
      "Solid understanding of single-company configuration (Trading Company lab)",
      "Odoo 17.0 database; Inter-Company Transactions and Consolidation are Enterprise features (verify in your training instance)",
      "Understanding of transfer pricing and consolidation basics",
    ],
    steps: [
      {
        title: "Create the companies and hierarchy",
        why: "Each legal entity needs its own company record for legal documents, taxes and books. The parent-child relation documents the group structure.",
        instructions: `### Goal
Create the three companies.

1. **Settings ▸ Users & Companies ▸ Companies ▸ New**: Harborview Holdings Inc. (USD).
2. Create Harborview Distribution LLC with **Parent Company** = Holdings (field visibility may vary — verify in your training instance).
3. Create Harborview Canada Ltd. (country Canada, currency CAD).
4. For each company, switch to it via the company switcher (top-right) and set the fiscal localization in **Accounting ▸ Configuration ▸ Settings** (US for the first two, Canada for the third).
5. Configure the document layout per company.`,
        odooPath: "Settings ▸ Users & Companies ▸ Companies; Accounting ▸ Configuration ▸ Settings",
        validation: "Three companies exist; each has its own chart of accounts, journals and taxes when selected in the switcher; Canada uses CAD.",
        commonMistakes: [
          "Installing the localization only in the first company",
          "Wrong country/currency on subsidiaries",
          "Using one company with branches when the entities are legally separate",
        ],
      },
      {
        title: "Configure multi-company user access",
        why: "Access rights must reflect who works for which entity; misconfigured allowed companies cause data leaks or blocked users.",
        instructions: `### Goal
Assign companies to users.

1. **Settings ▸ Users & Companies ▸ Users**: open the finance user, set **Allowed Companies** = all three, **Default Company** = Holdings.
2. Sales user of Distribution: Allowed Companies = Distribution only.
3. Sales user of Canada: Allowed Companies = Canada only.
4. Log in as each user and verify which companies appear in the switcher.`,
        odooPath: "Settings ▸ Users & Companies ▸ Users",
        dependsOn: [1],
        validation: "Distribution sales user cannot see Canada's sales orders or invoices; finance user can tick several companies in the switcher and see combined lists.",
        commonMistakes: [
          "Giving every user all companies",
          "Default company not in allowed companies",
          "Testing only as administrator, which hides access problems",
        ],
      },
      {
        title: "Set up company-specific accounting data",
        why: "Accounts, taxes, journals, fiscal positions and payment terms are legally company-specific and must be configured in each company context.",
        instructions: `### Goal
Configure each company's accounting.

1. Switch to each company (only that company ticked) and review **Accounting ▸ Configuration ▸ Chart of Accounts / Taxes / Journals**.
2. Create bank journals per company.
3. Configure company-specific product properties (income/expense accounts, costing method on categories), which are stored per company (verify in your training instance).
4. Create inter-company receivable/payable accounts if the group policy requires separate accounts for related-party balances.`,
        odooPath: "Accounting ▸ Configuration ▸ Chart of Accounts / Taxes / Journals",
        dependsOn: [1],
        validation: "Each company has its own bank journal and taxes; switching companies changes the visible accounts.",
        commonMistakes: [
          "Configuring settings while several companies are ticked, applying them to the wrong company",
          "Expecting taxes to be shared across companies",
        ],
      },
      {
        title: "Decide shared vs company-specific master data",
        why: "Shared records reduce duplication; company-specific records keep data private. The Company field on a record decides visibility.",
        instructions: `### Goal
Define the data-sharing policy and apply it.

1. **Products**: leave the **Company** field empty to share a product across companies; set it to restrict.
2. **Contacts**: leave Company empty for shared customers; set it for company-private contacts.
3. **Pricelists**: set Company per pricelist (USD for Distribution, CAD for Canada).
4. **Warehouses**: are always company-specific; create one warehouse per operating company in **Inventory ▸ Configuration ▸ Warehouses**.
5. Document the policy in a data-ownership table (record type, shared/specific, owner).`,
        odooPath: "Inventory ▸ Products ▸ Products; Contacts; Sales ▸ Products ▸ Pricelists; Inventory ▸ Configuration ▸ Warehouses",
        dependsOn: [2, 3],
        validation: "A shared product is sellable in both Distribution and Canada with different prices and taxes; a company-specific contact is invisible to the other company's user.",
        commonMistakes: [
          "Setting the company on products and then being unable to buy them in the other company",
          "Sharing pricelists across companies with different currencies",
        ],
      },
      {
        title: "Configure inter-company transactions",
        why: "Inter-company rules automatically mirror a sale in one company as a purchase in the other, avoiding double keying and ensuring related-party balances match.",
        instructions: `### Goal
Automate Distribution → Canada trade.

> **Enterprise:** Inter-Company Transactions (module inter_company_rules) is an Odoo Enterprise feature. Verify availability and exact options in your training instance.

1. **Settings** ▸ Companies section ▸ enable **Inter-Company Transactions** (verify in your training instance).
2. For Canada, select the rule: **Synchronize** sales/purchase orders and/or invoices/bills (options vary — verify in your training instance).
3. Ensure each company's partner record (created automatically for every company) is used as the customer/vendor.
4. Test: in Distribution, create an SO to customer *Harborview Canada Ltd.* and confirm; switch to Canada and check that a draft PO/bill is created.`,
        odooPath: "Settings ▸ Companies section (verify in your training instance)",
        dependsOn: [2, 3, 4],
        validation: "Confirming the Distribution SO generates a matching Canada PO (or bill) with the same lines and prices converted to the purchase currency as configured.",
        commonMistakes: [
          "Expecting this feature in Community edition",
          "Using a duplicate contact instead of the company's own partner record",
          "Ignoring currency conversion between USD and CAD",
        ],
      },
      {
        title: "Run inter-company transaction tests",
        why: "Related-party balances must eliminate on consolidation; testing the full cycle proves receivable in one company equals payable in the other.",
        instructions: `### Goal
Complete the cycle.

1. Distribution: deliver and invoice the SO.
2. Canada: receive the PO, validate the bill (generated or manual).
3. Pay the bill from Canada; register receipt in Distribution.
4. Compare inter-company receivable (Distribution) and payable (Canada) balances after conversion.`,
        odooPath: "Sales / Purchase / Accounting (per company)",
        dependsOn: [5],
        validation: "Receivable in Distribution and payable in Canada are equal (after FX) before payment and both zero after payment.",
        commonMistakes: [
          "Posting the bill in Canada with a different date or rate, creating FX mismatches",
          "Forgetting stock receipt in Canada",
        ],
      },
      {
        title: "Configure multi-company reporting views",
        why: "Group finance needs combined views while each company keeps its own books.",
        instructions: `### Goal
Produce combined operational reports.

1. As finance user, tick all companies in the switcher.
2. Open Sales ▸ Reporting ▸ Sales and group by **Company**.
3. Open Invoice analysis grouped by company (Accounting ▸ Reporting — verify in your training instance).
4. Note currency: amounts in multi-company views may be shown in each company's currency or converted — check the report's behaviour (verify in your training instance).`,
        odooPath: "Sales ▸ Reporting; Accounting ▸ Reporting (verify in your training instance)",
        dependsOn: [2, 6],
        validation: "Combined reports show each company separately and in total, with clear currency handling.",
        commonMistakes: [
          "Adding USD and CAD amounts without conversion",
          "Forgetting that inter-company sales inflate group revenue",
        ],
      },
      {
        title: "Plan consolidated financial reporting",
        why: "Statutory consolidation requires eliminating inter-company transactions and translating foreign currency statements.",
        instructions: `### Goal
Decide the consolidation approach.

1. **Enterprise:** Odoo Enterprise offers a Consolidation app/feature (availability and design changed between versions — verify in your training instance).
2. Alternative: export each company's trial balance and consolidate in a spreadsheet with elimination entries.
3. Define the elimination list: inter-company revenue/COGS, receivable/payable, unrealised profit in stock.
4. Document translation rates (closing rate for balance sheet, average rate for P&L).`,
        dependsOn: [6, 7],
        validation: "A documented consolidation procedure exists; a test consolidation eliminates the inter-company sale and balances.",
        commonMistakes: [
          "Promising automatic consolidation in Community",
          "Not eliminating unrealised profit in inventory held by Canada",
        ],
      },
    ],
    expectedResult: `## Expected result
- [x] Three companies with their own localization, currency and journals
- [x] Users with appropriate allowed companies
- [x] Documented shared vs company-specific data policy
- [x] Inter-company transactions configured (Enterprise) and tested end to end
- [x] Multi-company reports and a consolidation approach

| Data | Shared? |
|---|---|
| Products | Shared (Company empty) |
| Customers | Shared, except private contacts |
| Taxes, accounts, journals | Company-specific |
| Warehouses | Company-specific |
| Pricelists | Company-specific (currency) |`,
    commonMistakes: [
      "Configuring with multiple companies ticked",
      "Giving users access to all companies",
      "Assuming Enterprise inter-company and consolidation features exist in Community",
      "Mixing currencies in group reports",
    ],
  },
];
