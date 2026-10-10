import type { CourseContent } from "../types";

/**
 * Odoo Inventory — application training course.
 * Follows the 16-point application training template:
 *  1 overview, 2 business problems, 3 process flow, 4 dependencies, 5 prerequisites & master data,
 *  6 configuration, 7 master data creation, 8 transactions, 9 approvals & automation, 10 reports,
 *  11 accounting impact, 12 integration, 13 troubleshooting, 14 practical assignments,
 *  15 interview questions, 16 assessment (course `assessment`).
 */
export const odooInventory: CourseContent = {
  slug: "odoo-inventory",
  section: "odoo-apps",
  title: "Odoo Inventory: Warehouses, Routes, Stock Operations and Valuation",
  summary:
    "Learn how Odoo Inventory models warehouses, locations, routes and stock moves, how to configure products and valuation, process receipts, deliveries, counts and scrap, and how every stock move hits the general ledger. Built around the fictional B2B distributor Northwind Office Supplies Pvt Ltd.",
  level: "intermediate",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 4,
  skills: [
    "Warehouse and location design",
    "Multi-step routes (receipts and deliveries)",
    "Product types, categories and units of measure",
    "Lots and serial number traceability",
    "Reordering rules and replenishment",
    "Physical inventory and scrap",
    "Inventory valuation (Standard, AVCO, FIFO; manual vs automated)",
    "Stock accounting journal entries",
    "Inventory troubleshooting",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1: Inventory Foundations",
      lessons: [
        {
          slug: "inventory-overview-and-process-flow",
          title: "Inventory Overview, Business Problems and Process Flow",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. Overview

Inventory is the operational heart of any company that buys, stores, makes or sells physical goods. In Odoo, the **Inventory** app records *where* every unit is, *how* it got there and *what it is worth*. It is a double-entry stock system: every movement is a **stock move** from one **location** to another, exactly like a journal entry moves value from one account to another.

Throughout this course we work with our fictional client:

| Attribute | Value |
|---|---|
| Company | Northwind Office Supplies Pvt Ltd |
| Business | B2B distributor of paper, toner, furniture and IT accessories |
| Warehouse | One main warehouse "NW-MAIN" with racks and a dispatch area |
| Currency | USD |
| Customers | ~400 corporate accounts, ordering weekly |
| Vendors | ~60 suppliers, some overseas (freight and duty costs) |
| Pain today | Spreadsheets, frequent stock-outs of toner, unknown stock value at month end |

### Core concepts in one table

| Concept | Meaning in Odoo |
|---|---|
| Warehouse | A physical site; Odoo auto-creates its locations, operation types and routes |
| Location | A place where stock can sit (shelf, rack) or a *virtual* place (vendor, customer, loss) |
| Stock move | Movement of a quantity of one product from a source to a destination location |
| Transfer (picking) | A document grouping moves, e.g. a Receipt or a Delivery Order |
| Operation type | Template for transfers (Receipts, Delivery Orders, Internal Transfers, Pick, Pack) |
| Route | A chain of rules telling Odoo how to bring or send goods (Buy, Manufacture, MTO, multi-step) |
| Quant | The on-hand quantity of a product in a location (plus lot/package/owner) |
| Valuation layer | The value record created when stock enters or leaves the company |

## 2. Business problems solved

| Business problem | How Odoo Inventory solves it |
|---|---|
| "We never know what is in stock." | Real-time quants per location; Inventory ▸ Reporting ▸ Stock |
| Stock-outs of fast-moving items | Reordering rules (min/max) and the Replenishment screen |
| Wrong items shipped | Multi-step deliveries (Pick ▸ Pack ▸ Ship), barcode validation (Enterprise Barcode app) |
| Recall of a defective batch | Lots and serial numbers with full upstream/downstream traceability |
| Shrinkage and damage not recorded | Physical Inventory counts and Scrap orders with automatic accounting |
| Unknown stock value at month end | Product category valuation (Standard / AVCO / FIFO) with perpetual (automated) accounting |
| Freight and duty not in product cost | Landed Costs (verify edition and setting in your training instance) |
| Partial shipments from vendors | Backorders created automatically on partial validation |

## 3. Process flow

The standard **Procure-to-Stock-to-Ship** flow for Northwind, using one-step routes:

\`\`\`text
 Purchase Order (Purchase app)
        │  confirm
        ▼
 Receipt WH/IN/xxxxx   Vendors ──► WH/Stock         (stock IN, valuation layer +)
        │  validate
        ▼
 On-hand stock (quants in WH/Stock, optionally putaway to WH/Stock/Shelf A)
        │
        ▼
 Sales Order (Sales app)
        │  confirm
        ▼
 Delivery WH/OUT/xxxxx  WH/Stock ──► Customers      (stock OUT, valuation layer −)
        │  validate
        ▼
 Customer invoice (Accounting) ── COGS recognised (automated valuation)
\`\`\`

With **3-step delivery** the outbound side becomes:

\`\`\`text
 WH/Stock ──Pick──► WH/Packing Zone ──Pack──► WH/Output ──Ship──► Partners/Customers
\`\`\`

With **3-step receipt**:

\`\`\`text
 Partners/Vendors ──Receive──► WH/Input ──Quality──► WH/Quality Control ──Store──► WH/Stock
\`\`\`

Side flows that also generate stock moves:

- **Physical inventory**: WH/Stock ⇄ Virtual Locations/Inventory adjustment
- **Scrap**: WH/Stock ──► Virtual Locations/Scrap
- **Returns**: Customers ──► WH/Stock (return of a delivery) or WH/Stock ──► Vendors (return of a receipt)

> **Consultant tip:** In a workshop, draw this flow on a whiteboard *before* opening Odoo. Ask the client to point at every place where goods physically stop. Each stop is a candidate location; each arrow is a candidate operation type. Do not create steps that nobody will actually scan or validate — every extra step is extra clicks forever.

## How this course is structured

| Lesson | Template points covered |
|---|---|
| 1. Overview (this lesson) | Overview, business problems, process flow |
| 2. Dependencies and configuration | Dependencies, prerequisites, configuration and settings |
| 3. Master data | Products, categories, UoM, warehouses, locations, routes, lots |
| 4. Transactions | Receipts, deliveries, backorders, internal transfers, counts, scrap |
| 5. Automation, reports and valuation | Reordering, reports, accounting impact, integration |
| 6. Troubleshooting and interview prep | Errors, practical tasks, interview questions |

## Version note: Odoo 17 vs 18

In **Odoo 17** a product has a *Product Type* of **Storable Product**, **Consumable** or **Service**. Only storable products have tracked on-hand quantities and valuation. In **Odoo 18** the types become **Goods**, **Service** and **Combo**, and a **Track Inventory** checkbox on a Goods product replaces the Storable/Consumable distinction. When you read older blogs or Odoo 18 documentation, translate accordingly (verify in your training instance).

## Key takeaways

- Odoo Inventory is double-entry: every move has a source and destination location.
- Warehouses automatically generate locations, operation types and routes.
- Virtual locations (Vendors, Customers, Inventory adjustment, Scrap) are where stock "comes from" or "goes to" outside your company.
- Valuation (what stock is worth) is driven by the product category, not the warehouse.
- Map the client's physical flow first; configure routes second.`,
          flashcards: [
            { term: "Stock move", definition: "A movement of a quantity of one product from a source location to a destination location; the atomic unit of Odoo Inventory." },
            { term: "Quant", definition: "The on-hand quantity of a product in a specific location (optionally per lot, package and owner)." },
            { term: "Operation type", definition: "A template for transfers such as Receipts, Delivery Orders or Internal Transfers, defining sequence, default locations and reservation behaviour." },
            { term: "Route", definition: "A set of rules (push/pull) that determines how products are procured or moved, e.g. Buy, Manufacture, MTO, 2-step delivery." },
            { term: "Virtual location", definition: "A non-physical location such as Vendors, Customers, Inventory adjustment or Scrap used as the counterpart of stock entering or leaving the company." },
            { term: "Backorder", definition: "A new transfer automatically created for the remaining quantity when a transfer is validated partially." },
            { term: "Storable Product (Odoo 17)", definition: "Product type whose on-hand quantity is tracked and valued; replaced in Odoo 18 by Goods with the Track Inventory checkbox." },
            { term: "Reordering rule", definition: "A min/max rule per product and location that triggers replenishment (RFQ or manufacturing order) when forecast stock falls below the minimum." },
          ],
          resources: [
            { title: "Odoo 17 Inventory documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/inventory.html" },
          ],
        },
        {
          slug: "inventory-dependencies-and-configuration",
          title: "Dependencies, Prerequisites and Configuration Settings",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## 4. Dependencies on other apps

Inventory can be installed alone, but in real projects it almost never lives alone. Understand what each neighbour adds:

| App | Relationship with Inventory | Required? |
|---|---|---|
| Sales | Confirming a sales order creates delivery orders | Optional, typical |
| Purchase | Confirming a purchase order creates receipts; enables the **Buy** route | Optional, typical |
| Manufacturing | Adds the **Manufacture** route and component/finished-goods moves | Optional |
| Invoicing / Accounting | Needed for automated (perpetual) valuation journal entries and landed costs | Needed for stock accounting |
| Barcode | Scanner-based picking and counting | Enterprise |
| Quality | Quality checks on operations | Enterprise |
| Point of Sale | Creates stock moves when orders are processed | Optional |

> **Consultant tip:** Install apps in a logical order during a project: Accounting/Invoicing (with the localization) ▸ Inventory ▸ Purchase ▸ Sales ▸ Manufacturing. Installing accounting first ensures stock accounts exist when you configure product categories.

## 5. Prerequisites and master data checklist

Before a single receipt can be validated in a live database, the following must be agreed and loaded:

| # | Item | Owner | Template |
|---|---|---|---|
| 1 | Company details, currency (USD), fiscal localization | Finance | — |
| 2 | Warehouse(s) and short codes | Operations | — |
| 3 | Storage location hierarchy (rack/shelf/bin) | Warehouse manager | — |
| 4 | Units of measure and categories (Units, Box of 12, Ream) | Operations | — |
| 5 | Product categories with costing method and valuation | Finance + Ops | /api/templates/product-categories |
| 6 | Products (internal reference, barcode, type, UoM, cost, sales price, vendor) | Product team | /api/templates/products |
| 7 | Vendors and customers | Purchasing / Sales | — |
| 8 | Opening stock per location (and lot/serial if tracked) | Warehouse + Finance | /api/templates/opening-stock |
| 9 | Reordering rules (min/max) for fast movers | Purchasing | — |

**Golden rule:** Product categories (and their valuation settings) must be finalised **before** opening stock is loaded. Changing the costing method later creates revaluation entries and confusion.

## 6. Configuration and settings

### 6.1 Inventory settings

Path: **Inventory ▸ Configuration ▸ Settings**. The most important options (labels as in Odoo 17 — verify in your training instance):

| Setting | Section | Why enable it | Northwind decision |
|---|---|---|---|
| Storage Locations | Warehouse | Track stock in sub-locations (racks, shelves); required for putaway rules | Yes |
| Multi-Step Routes | Warehouse | Use 2/3-step receipts and deliveries, custom routes | Yes |
| Units of Measure | Products | Buy in boxes, sell in units | Yes |
| Variants | Products | Colour/size variants (e.g. chair colours) | Yes |
| Packages | Operations | Put products in boxes/pallets | Later phase |
| Lots & Serial Numbers | Traceability | Track toner lots and serials of laptops | Yes |
| Expiration Dates | Traceability | Shelf-life products | No |
| Landed Costs | Valuation | Add freight/duty to product cost (with Accounting) | Yes |
| Barcode Scanner | Barcode | Use the Barcode app | Enterprise; phase 2 |

Enabling **Multi-Step Routes** automatically enables **Storage Locations**.

### 6.2 Warehouse configuration

Path: **Inventory ▸ Configuration ▸ Warehouses** ▸ open the warehouse.

| Field | Options | Effect |
|---|---|---|
| Short Name | e.g. NW | Prefix of all locations and transfer references (NW/IN/00001) |
| Incoming Shipments | Receive goods directly (1 step) / Receive goods in input and then stock (2 steps) / Receive goods in input, then quality and then stock (3 steps) | Creates Input and Quality Control locations and extra operation types |
| Outgoing Shipments | Deliver goods directly (1 step) / Send goods in output and then deliver (2 steps) / Pack goods, send goods in output and then deliver (3 steps) | Creates Packing Zone and Output locations and Pick/Pack operations |

Northwind decision: **1-step receipts** (small receiving team) and **2-step deliveries** (Pick then Ship), because orders are consolidated at a dispatch bay.

### 6.3 Operation types

Path: **Inventory ▸ Configuration ▸ Operation Types**. Key fields:

- **Type of Operation**: Receipt, Delivery, Internal Transfer (Manufacturing when MRP is installed).
- **Sequence Prefix**: e.g. NW/OUT/.
- **Default Source / Destination Location**.
- **Reservation Method** (for outgoing/internal types): *At Confirmation*, *Manually*, or *Before scheduled date* (with a number of days).
- **Create Backorder**: Ask / Always / Never.
- **Use Existing Lots/Serial Numbers** and **Create New Lots/Serial Numbers** for tracked products.

### 6.4 Product category valuation (preview)

Path: **Inventory ▸ Configuration ▸ Product Categories**.

| Field | Options |
|---|---|
| Costing Method | Standard Price / Average Cost (AVCO) / First In First Out (FIFO) |
| Inventory Valuation | Manual / Automated |
| Stock Valuation Account, Stock Input Account, Stock Output Account, Stock Journal | Visible when valuation is Automated |

We study the accounting effect in Lesson 5. Developer mode may be needed to see some accounting fields (verify in your training instance).

> **Consultant tip:** Record every setting decision in a *Configuration Workbook* (setting, value, reason, approved by). When someone asks "why is Packages off?" six months later, the workbook answers it.

## Standard vs Enterprise vs customization

| Requirement | Classification |
|---|---|
| Multi-step routes, lots/serials, reordering rules | Standard (configuration) |
| Barcode scanning app, Quality checks | Enterprise |
| Auto-assign a picker by zone with a custom dashboard | Customization |
| Real-time sync with a 3PL warehouse | Third-party / integration |

## Key takeaways

- Install Accounting (with localization) before configuring stock valuation.
- Storage Locations and Multi-Step Routes are the two settings that unlock warehouse design.
- Warehouse "Incoming/Outgoing Shipments" choices auto-create locations, operation types and routes.
- Reservation method and backorder policy live on the operation type.
- Freeze product categories before importing opening stock.`,
          resources: [
            { title: "Product categories import template", kind: "template", url: "/api/templates/product-categories" },
            { title: "Odoo 17 Inventory documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/inventory.html" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2: Master Data and Daily Transactions",
      lessons: [
        {
          slug: "inventory-master-data",
          title: "Master Data: Products, UoM, Locations, Routes and Lots",
          durationMin: 50,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 7. Master data creation

Clean master data is 80% of a successful inventory go-live. In this lesson we create Northwind's core records.

### 7.1 Units of measure

Path: **Inventory ▸ Configuration ▸ UoM Categories** (requires the Units of Measure setting).

| UoM category | Unit | Type | Ratio |
|---|---|---|---|
| Unit | Units | Reference | 1 |
| Unit | Box of 12 | Bigger than reference | 12 |
| Unit | Ream (500 sheets) — sold as Units | — | Use a separate product UoM if needed |

On the product: **Unit of Measure** (sales/stock UoM) and **Purchase UoM** must belong to the *same category*. Northwind buys pens in *Box of 12* and sells in *Units*: receiving 10 boxes increases stock by 120 units.

### 7.2 Product categories

Create the hierarchy **All ▸ Saleable ▸ Paper / Toner / Furniture / IT Accessories**.

| Category | Costing Method | Inventory Valuation | Reason |
|---|---|---|---|
| Paper | Average Cost (AVCO) | Automated | Price fluctuates, high volume |
| Toner | FIFO | Automated | Lots tracked; cost per batch matters |
| Furniture | Standard Price | Automated | Stable negotiated price list |
| IT Accessories | FIFO | Automated | Serialised items |

### 7.3 Products

Path: **Inventory ▸ Products ▸ Products ▸ New**.

| Field | Example (A4 Copy Paper 80gsm) |
|---|---|
| Product Name | A4 Copy Paper 80gsm (Ream) |
| Product Type (17) | Storable Product (in 18: Goods + Track Inventory) |
| Internal Reference | NW-PAP-A4-80 |
| Barcode | 8901234567890 |
| Product Category | All / Saleable / Paper |
| Sales Price | 6.50 |
| Cost | 4.00 |
| Unit of Measure / Purchase UoM | Units / Units |
| Inventory tab ▸ Routes | Buy |
| Inventory tab ▸ Tracking | No tracking (By Lots for toner, By Unique Serial Number for laptops) |
| Purchase tab ▸ Vendors | Paper Mills Inc, price 4.00, min qty 100, lead time 5 days |

Product type decision guide (Odoo 17):

| Type | Stock tracked? | Valued? | Example |
|---|---|---|---|
| Storable Product | Yes | Yes | Paper, toner, chairs |
| Consumable | No (always assumed available) | No | Packing tape, staples used internally |
| Service | No | No | Delivery charge, installation |

### 7.4 Warehouses and locations

After enabling Storage Locations, go to **Inventory ▸ Configuration ▸ Locations**.

| Location type | Examples | Holds real stock? |
|---|---|---|
| View | NW (parent of all warehouse locations) | No — used only to group |
| Internal | NW/Stock, NW/Stock/Rack-A, NW/Output | Yes |
| Vendor | Partners/Vendors | No (virtual) |
| Customer | Partners/Customers | No (virtual) |
| Inventory Loss | Virtual Locations/Inventory adjustment, Virtual Locations/Scrap | No (virtual) |
| Production | Virtual Locations/Production | No (virtual, MRP) |
| Transit | Inter-warehouse / inter-company transit | Special |

Northwind sub-locations: NW/Stock/Rack-A (paper), NW/Stock/Rack-B (toner), NW/Stock/Floor (furniture), NW/Stock/Cage (IT accessories, secured).

### 7.5 Putaway rules

Path: **Inventory ▸ Configuration ▸ Putaway Rules**. Rule example: *When product category = Paper arrives in NW/Stock, store to NW/Stock/Rack-A*. Product-specific rules override category rules.

### 7.6 Routes

Path: **Inventory ▸ Configuration ▸ Routes** (with Multi-Step Routes enabled).

| Route | Where selectable | Behaviour |
|---|---|---|
| Buy | Product | Replenishment creates an RFQ to the first vendor (Purchase installed) |
| Manufacture | Product | Replenishment creates a manufacturing order (MRP installed) |
| Replenish on Order (MTO) | Product | Each sales order line triggers its own procurement; archived by default — unarchive it in Routes (verify in your training instance) |
| Warehouse routes (1/2/3 step) | Warehouse | Created by the warehouse shipment settings |

Northwind uses **MTO + Buy** for large custom furniture orders: confirming a sales order for 20 executive desks automatically creates an RFQ to the furniture vendor.

### 7.7 Lots and serial numbers

Enable **Lots & Serial Numbers**, then on the product set **Tracking**. Lots: Inventory ▸ Products ▸ Lots/Serial Numbers. Toner lot "TN-2024-118" can be traced from vendor receipt to every customer delivery.

### 7.8 Opening stock

Two standard approaches:

1. **Physical Inventory import** — Inventory ▸ Operations ▸ Physical Inventory, import product, location, lot, counted quantity, then **Apply**. Uses the Inventory adjustment virtual location.
2. **Receipt from vendor** — less common for migration; distorts vendor history.

Use the template at /api/templates/opening-stock. Make sure the product *Cost* is correct before applying: the cost at the moment of applying is the valuation of the opening stock (for AVCO/Standard).

> **Consultant tip:** Agree with the finance team which *account* receives the counterpart of opening stock. With automated valuation the default counterpart comes from the inventory adjustment location or category accounts; finance will usually want it reversed into an opening-balance equity/suspense account. Plan this before go-live, not after.

## Key takeaways

- Purchase UoM and sales UoM must belong to the same UoM category.
- Product type (17) or Track Inventory (18) decides whether quantities are tracked.
- View locations group; internal locations hold stock; virtual locations are counterparts.
- Putaway rules automate where incoming goods are stored.
- Set product costs before loading opening stock.`,
          resources: [
            { title: "Products import template", kind: "template", url: "/api/templates/products" },
            { title: "Product categories import template", kind: "template", url: "/api/templates/product-categories" },
            { title: "Opening stock import template", kind: "template", url: "/api/templates/opening-stock" },
          ],
        },
        {
          slug: "inventory-transactions",
          title: "Transaction Processing: Receipts, Deliveries, Counts and Scrap",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 8. Transaction processing

All transfers are found under **Inventory ▸ Operations ▸ Transfers** (or via the operation-type cards on the Inventory Overview dashboard). Each transfer moves through states:

| State | Meaning |
|---|---|
| Draft | Created, not confirmed |
| Waiting Another Operation | Waiting for a previous step (e.g. Ship waits for Pick) |
| Waiting | Confirmed, but not enough stock could be reserved yet |
| Ready | Quantities reserved, can be processed |
| Done | Validated; stock and valuation updated |
| Cancelled | Cancelled |

### 8.1 Walkthrough: Receipt with backorder

Scenario: Northwind orders **500 reams** of A4 paper at USD 4.00 from Paper Mills Inc (PO P00021). The vendor ships only 300 now.

1. Confirm PO P00021 in Purchase. A receipt NW/IN/00012 is created (Vendors ▸ NW/Stock).
2. Open the receipt (Purchase order ▸ **Receipt** smart button, or Inventory ▸ Operations ▸ Transfers).
3. In the operations line, set **Quantity** to 300 (in 17 the column is "Quantity"; earlier versions show "Done").
4. Click **Validate**.
5. Odoo asks whether to **Create Backorder** or **No Backorder**. Choose *Create Backorder*.
6. NW/IN/00012 is Done for 300; a new receipt NW/IN/00013 for 200 is created and linked to the same PO.
7. If putaway rules exist, the move line destination becomes NW/Stock/Rack-A automatically.

Result: on hand = 300, incoming forecast = 200.

### 8.2 Walkthrough: 2-step delivery (Pick ▸ Ship)

Scenario: Customer Contoso Ltd orders 120 reams (SO S00045).

1. Confirm SO S00045. Odoo creates **NW/PICK/00031** (NW/Stock ▸ NW/Output) and **NW/OUT/00028** (NW/Output ▸ Customers). The OUT is *Waiting another operation*.
2. Open the PICK. With reservation method *At Confirmation*, 120 units are already reserved. Click **Check Availability** if not.
3. Picker collects goods; set quantities and click **Validate**.
4. NW/OUT/00028 becomes **Ready**. Dispatch loads the truck and validates it.
5. The sales order line shows *Delivered = 120*; it is now invoiceable if the invoicing policy is "Delivered quantities".

### 8.3 Walkthrough: lot-tracked receipt

1. Receive 50 cartridges of Toner HP 26A (tracked by lots).
2. On the receipt line click the **details** (list) icon to open the detailed operations.
3. Enter Lot/Serial Number **TN-2024-118**, quantity 50.
4. Validate. The lot is created and stocked in NW/Stock/Rack-B.

For serial-tracked laptops, one line per serial number (quantity 1 each). Odoo can generate a range of serials from the first number entered (verify the exact button in your training instance).

### 8.4 Internal transfer

Move 40 chairs from NW/Stock/Floor to NW/Stock/Showroom: Inventory ▸ Operations ▸ Transfers ▸ New, Operation Type *Internal Transfers*, source and destination, product and quantity, **Mark as To Do**, then **Validate**. Internal transfers create **no** accounting entry (value stays inside the company).

### 8.5 Returns

Open a done delivery and click **Return**. Select quantities, confirm, then validate the return transfer. The return reverses the stock move (and, with automated valuation, the valuation entry at the original cost).

### 8.6 Physical inventory (cycle count)

Path: **Inventory ▸ Operations ▸ Physical Inventory**.

1. Filter by location NW/Stock/Rack-B.
2. For each quant, enter the **Counted Quantity** (e.g. system 50, counted 47 for lot TN-2024-118).
3. The **Difference** column shows −3.
4. Select the lines and click **Apply** (optionally enter a reason / reference).
5. Odoo posts a move NW/Stock/Rack-B ▸ Virtual Locations/Inventory adjustment for 3 units.

### 8.7 Scrap

Path: **Inventory ▸ Operations ▸ Scrap** (or the **Scrap** button on a transfer). Example: 5 chairs damaged during unloading.

1. New scrap order: product Executive Chair, quantity 5, source NW/Stock/Floor, scrap location Virtual Locations/Scrap.
2. Click **Validate**. Stock decreases by 5 and, with automated valuation, the loss is posted.

### 8.8 Landed costs (summary)

Path: **Inventory ▸ Operations ▸ Landed Costs** (after enabling the setting; requires accounting — verify in your training instance). Create a landed cost, select the done receipt(s), add a cost line using a service product flagged as a landed cost (e.g. "Sea Freight", USD 600), choose a **Split Method** (Equal, By Quantity, By Current Cost, By Weight, By Volume), **Compute**, then **Validate**. Product unit costs for AVCO/FIFO increase accordingly.

> **Consultant tip:** Train warehouse users to *never* validate a transfer with quantities they did not physically handle. "Validate everything, fix it later" is the number one cause of negative stock and wrong valuation.

## Key takeaways

- Receipts and deliveries are generated by purchase and sales orders; you rarely create them manually.
- Partial validation creates backorders according to the operation type policy.
- Multi-step flows chain transfers; later steps wait for earlier ones.
- Lots/serials are captured on detailed operations.
- Counts and scrap move stock to virtual loss locations, which drives accounting.`,
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3: Automation, Reporting and Valuation",
      lessons: [
        {
          slug: "inventory-automation-reports-valuation",
          title: "Replenishment, Reports, Accounting Impact and Integration",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## 9. Approval rules and automation

Odoo Inventory has **few built-in approvals**; controls come from access rights, operation design and upstream apps.

| Control | How | Scope |
|---|---|---|
| Who can validate transfers / apply counts | User access: Inventory *User* vs *Administrator* (verify which actions need Administrator in your training instance) | Standard |
| Purchase approval above an amount | Purchase ▸ Configuration ▸ Settings ▸ Purchase Order Approval | Standard (Purchase) |
| Quality check before stock | Quality app / 3-step receipt | Enterprise |
| Approval of large scrap | Approvals app or Studio/automation rule | Enterprise / customization |

### Automation: reordering rules and replenishment

Path: **Inventory ▸ Operations ▸ Replenishment** (or Product ▸ smart button *Min/Max*).

| Field | Northwind value (A4 paper) |
|---|---|
| Location | NW/Stock |
| Min Quantity | 400 |
| Max Quantity | 1,200 |
| Multiple Quantity | 100 |
| Route | Buy |
| Trigger | Auto (scheduler) or Manual (Order from the Replenishment screen) |

Logic: when **forecasted** quantity (on hand + incoming − outgoing) drops below 400, Odoo proposes enough to reach 1,200, rounded to multiples of 100. With Trigger *Auto* the scheduler creates or updates an RFQ; with *Manual* a buyer clicks **Order Once**. The Replenishment screen also *suggests* rules for products with negative forecasts.

Other automation: MTO route, reservation method, automatic backorders, putaway rules, and (Enterprise) automated actions via Studio.

## 10. Reports and dashboards

| Report | Path (Odoo 17) | Use |
|---|---|---|
| Inventory Overview | Inventory ▸ Overview | Operation-type cards: ready, waiting, late |
| Stock | Inventory ▸ Reporting ▸ Stock | On hand, reserved, forecast per product |
| Locations | Inventory ▸ Reporting ▸ Locations (Storage Locations on) | Quants by location/lot/package |
| Moves History | Inventory ▸ Reporting ▸ Moves History | Done move lines — audit trail |
| Moves Analysis | Inventory ▸ Reporting ▸ Moves Analysis | Pivot/graph of stock moves |
| Valuation | Inventory ▸ Reporting ▸ Valuation | Stock valuation layers: quantity and value |
| Forecasted report | Product ▸ Forecasted smart button | Future availability by date |

Exact menu names can change between 17 and 18 (verify in your training instance). At month end, finance compares the **Inventory Valuation** total with the balance of the Stock Valuation account in the General Ledger — they must match under automated valuation.

## 11. Accounting impact

### Costing methods

| Method | Unit cost behaviour | Northwind example |
|---|---|---|
| Standard Price | Fixed cost on product; differences go to price-difference handling at bill time | Furniture at 120.00 |
| Average Cost (AVCO) | Recomputed on each receipt | Paper: 300 @ 4.00 then 200 @ 4.30 ⇒ (1,200 + 860)/500 = 4.12 |
| FIFO | Oldest layers consumed first | Toner lots |

### Manual vs Automated valuation

- **Manual (periodic):** stock valuation layers are created, but **no journal entries** are posted at each move. Accountants post a periodic adjustment.
- **Automated (perpetual):** every incoming/outgoing valued move posts a journal entry in the category's *Stock Journal*.

### Journal entries with automated valuation (Anglo-Saxon style)

Account names follow the generic chart (Stock Valuation, Stock Interim (Received), Stock Interim (Delivered)); your localization may differ.

**Receipt of 300 reams @ 4.00**

| Account | Debit | Credit |
|---|---|---|
| Stock Valuation | 1,200.00 | |
| Stock Interim (Received) — Stock Input | | 1,200.00 |

**Vendor bill for 300 reams @ 4.00**

| Account | Debit | Credit |
|---|---|---|
| Stock Interim (Received) | 1,200.00 | |
| Accounts Payable | | 1,200.00 |

**Delivery of 120 reams (AVCO 4.00)**

| Account | Debit | Credit |
|---|---|---|
| Stock Interim (Delivered) — Stock Output | 480.00 | |
| Stock Valuation | | 480.00 |

**Customer invoice 120 × 6.50 (tax ignored)**

| Account | Debit | Credit |
|---|---|---|
| Accounts Receivable | 780.00 | |
| Product Sales | | 780.00 |
| Cost of Goods Sold | 480.00 | |
| Stock Interim (Delivered) | | 480.00 |

**Physical inventory loss: 3 toner @ 55.00**

| Account | Debit | Credit |
|---|---|---|
| Inventory loss / adjustment expense (per location or category accounts) | 165.00 | |
| Stock Valuation | | 165.00 |

**Scrap 5 chairs @ 120.00** — similar: debit the scrap/loss account, credit Stock Valuation 600.00.

Internal transfers between internal locations create **no** journal entry. Accounts for inventory adjustment and scrap come from the virtual location's valuation accounts if set, otherwise from the category (verify in your training instance).

## 12. Integration with other apps

| App | Integration point |
|---|---|
| Purchase | PO ▸ Receipt; received quantities drive billable quantities ("On received quantities" control policy) |
| Sales | SO ▸ Delivery; delivered quantities drive invoicing policy |
| Accounting | Valuation entries, landed costs, COGS on invoices |
| Manufacturing | Component consumption and finished goods production moves |
| eCommerce / POS | Availability shown to customers; POS sessions create pickings |

> **Consultant tip:** Always run an end-to-end test (PO ▸ receipt ▸ bill ▸ SO ▸ delivery ▸ invoice) and open each journal entry. Showing the CFO the exact entries in a sandbox wins more trust than any slide.

## Key takeaways

- Reordering rules use the *forecast*, not just on-hand.
- Inventory has few approvals; use access rights, Purchase approvals and Enterprise apps.
- Costing method + valuation type live on the product category.
- Automated valuation posts entries at each receipt and delivery; internal moves post nothing.
- Valuation report total should equal the Stock Valuation GL balance.`,
          resources: [
            { title: "Odoo 17 Inventory documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/inventory.html" },
          ],
        },
        {
          slug: "inventory-troubleshooting-and-interview",
          title: "Troubleshooting, Practical Assignments and Interview Questions",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "customization"],
          body: `## 13. Common errors and troubleshooting

| Symptom / error | Likely cause | Fix |
|---|---|---|
| Product not available on delivery although stock exists | Stock is in a location outside the operation's source (e.g. NW/Input), or reserved by another order | Check Inventory ▸ Reporting ▸ Locations; unreserve/reassign; complete the Input ▸ Stock step |
| Negative on-hand quantity | Delivery validated with more than available | Count the location and apply; train users; review reservation method |
| Cannot select Purchase UoM | Purchase UoM in different UoM category | Choose UoMs in the same category |
| No journal entry after receipt | Category valuation is Manual, or product type is Consumable | Set category to Automated (with correct accounts) — impacts future moves only |
| Wrong cost on opening stock | Product cost was 0 when count was applied | Revalue (Enterprise/standard revaluation tools — verify) or reverse and re-import |
| MTO route not visible on product | Route archived by default | Inventory ▸ Configuration ▸ Routes ▸ filter Archived ▸ unarchive |
| Reordering rule does not trigger | Forecast already above min (incoming RFQ exists), trigger Manual, or vendor missing on product | Check forecast, trigger and vendor list |
| Lot/serial required error on validation | Product tracked; lot not entered | Fill detailed operations with lot numbers |
| Cannot change product type/UoM | Stock moves already exist | Archive and create a new product, or clear moves in a test DB only |
| Valuation report ≠ Stock Valuation GL | Manual entries to stock account, or manual-valuation categories | Lock the stock account against manual posting by policy; reconcile differences |

## 14. Practical assignments (task list)

Complete these in your training instance using Northwind data:

- [ ] Enable Storage Locations, Multi-Step Routes, Units of Measure, Lots & Serial Numbers.
- [ ] Configure warehouse NW with 1-step receipts and 2-step deliveries.
- [ ] Create sub-locations Rack-A, Rack-B, Floor, Cage and a putaway rule for Paper ▸ Rack-A.
- [ ] Create four product categories with the costing methods from Lesson 3, Automated valuation.
- [ ] Create 5 products (one lot-tracked, one serial-tracked, one with Box of 12 purchase UoM).
- [ ] Import opening stock using /api/templates/opening-stock and apply it.
- [ ] Process a PO for 500 units, receive 300, create a backorder.
- [ ] Process an SO through Pick and Ship.
- [ ] Count Rack-B and record a loss of 3 units; scrap 5 chairs.
- [ ] Create a reordering rule (min 400 / max 1,200 / multiple 100) and run the replenishment.
- [ ] Export the Valuation report and reconcile it to the Stock Valuation account balance.

## 15. Interview questions with model answers

**Q1. What is the difference between a Storable Product and a Consumable in Odoo 17?**
*Model answer:* Storable products have on-hand quantities tracked per location and are valued; consumables create stock moves but Odoo assumes they are always available and does not value them. In Odoo 18 this is expressed by a Goods product with or without the Track Inventory checkbox.

**Q2. Explain virtual locations.**
*Model answer:* They are counterpart locations that do not hold physical stock — Vendors, Customers, Inventory adjustment, Scrap, Production, Transit. Moving stock to or from them represents stock entering or leaving the company and triggers valuation.

**Q3. How do 3-step deliveries work?**
*Model answer:* Pick (Stock ▸ Packing Zone), Pack (Packing Zone ▸ Output), Ship (Output ▸ Customers). Each step is a separate transfer; later steps wait for earlier ones.

**Q4. AVCO vs FIFO vs Standard?**
*Model answer:* Standard uses a fixed cost; AVCO recalculates a weighted average on each receipt; FIFO consumes the oldest cost layers first. All are set on the product category.

**Q5. What is the difference between manual and automated valuation?**
*Model answer:* Both keep valuation layers; only automated posts real-time journal entries to stock valuation, input and output accounts.

**Q6. How does a reordering rule calculate the quantity to order?**
*Model answer:* When forecasted quantity is below the minimum, it orders enough to reach the maximum, rounded up to the multiple quantity, using the product's route (Buy/Manufacture).

**Q7. A client wants an approval before every scrap above USD 500. Standard or custom?**
*Model answer:* Not standard in Inventory. Options are the Approvals app or Studio/automation rules (Enterprise) or a custom module. I would classify it as customization and estimate it.

**Q8. How do you load opening stock?**
*Model answer:* Set categories and costs first, then import counted quantities via Physical Inventory and Apply; agree with finance on the counterpart account and reconcile valuation to the GL.

**Q9. What happens when you validate a receipt partially?**
*Model answer:* Depending on the operation type's backorder policy, Odoo asks, always creates, or never creates a backorder for the remaining quantity.

**Q10. Why might stock show on hand but not be reservable for a delivery?**
*Model answer:* It is in a location outside the delivery's source location tree, reserved by another transfer, or belongs to a different lot/package/owner than required.

> **Consultant tip:** In interviews, always answer with *business reason + Odoo mechanism + example*. "We use 2-step delivery because orders are consolidated at a dispatch bay; Odoo creates PICK and OUT transfers; for Northwind…" sounds like a consultant, not a user.

## Key takeaways

- Most inventory issues come from locations, reservation and valuation settings.
- Practise end-to-end flows and reconcile valuation to the GL.
- Interview answers should combine business context, configuration and examples.`,
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-inventory-final",
    title: "Odoo Inventory — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "In Odoo 17, which product type has its on-hand quantity tracked and valued?",
        kind: "single",
        options: ["Consumable", "Service", "Storable Product", "Combo"],
        correct: [2],
        explanation: "Only Storable Products are tracked and valued in Odoo 17. Combo is an Odoo 18 type; in 18 Goods + Track Inventory replaces Storable.",
      },
      {
        prompt: "Which setting must be enabled to use 2-step or 3-step receipts and deliveries?",
        kind: "single",
        options: ["Packages", "Multi-Step Routes", "Variants", "Landed Costs"],
        correct: [1],
        explanation: "Multi-Step Routes (Inventory ▸ Configuration ▸ Settings) unlocks multi-step warehouse flows and also enables Storage Locations.",
      },
      {
        prompt: "Which of the following are virtual (non-physical) locations? (Select all that apply)",
        kind: "multiple",
        options: ["Partners/Vendors", "WH/Stock/Rack-A", "Virtual Locations/Inventory adjustment", "Partners/Customers"],
        correct: [0, 2, 3],
        explanation: "Vendors, Customers and Inventory adjustment are virtual counterpart locations; WH/Stock/Rack-A is an internal location holding real stock.",
      },
      {
        prompt: "An internal transfer between two internal locations of the same warehouse creates a journal entry under automated valuation.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Value does not leave the company, so no valuation journal entry is posted for internal-to-internal moves.",
      },
      {
        prompt: "Where are the costing method and inventory valuation (manual/automated) configured?",
        kind: "single",
        options: ["On the warehouse", "On the product category", "On the operation type", "On the location"],
        correct: [1],
        explanation: "Costing Method and Inventory Valuation are fields of the product category.",
      },
      {
        prompt: "Northwind receives 300 reams at 4.00 and then 200 reams at 4.30 with AVCO. What is the new average cost?",
        kind: "single",
        options: ["4.00", "4.12", "4.15", "4.30"],
        correct: [1],
        explanation: "(300 × 4.00 + 200 × 4.30) / 500 = (1,200 + 860) / 500 = 4.12.",
      },
      {
        prompt: "A reordering rule has Min 400, Max 1,200, Multiple 100. Forecast is 350. How much does Odoo propose?",
        kind: "single",
        options: ["50", "850", "900", "1,200"],
        correct: [2],
        explanation: "Needed to reach max: 1,200 − 350 = 850, rounded up to a multiple of 100 = 900.",
      },
      {
        prompt: "What happens when a user validates a receipt for 300 of 500 ordered units and chooses 'Create Backorder'?",
        kind: "single",
        options: [
          "The PO is cancelled for 200 units",
          "A new receipt for 200 units is created and linked to the PO",
          "The receipt stays Ready with 200 remaining",
          "Odoo raises an error",
        ],
        correct: [1],
        explanation: "A backorder transfer is created for the remaining quantity and remains linked to the same purchase order.",
      },
      {
        prompt: "Under automated (Anglo-Saxon) valuation, what does validating a delivery post?",
        kind: "single",
        options: [
          "Debit Accounts Receivable, credit Sales",
          "Debit Stock Output (Interim Delivered), credit Stock Valuation",
          "Debit Stock Valuation, credit Stock Input",
          "Nothing until the invoice",
        ],
        correct: [1],
        explanation: "The delivery removes value from Stock Valuation into the interim delivered (output) account; the invoice then moves it to COGS.",
      },
      {
        prompt: "Where do you record a cycle count in Odoo 17?",
        kind: "single",
        options: ["Inventory ▸ Operations ▸ Physical Inventory", "Inventory ▸ Reporting ▸ Moves Analysis", "Inventory ▸ Configuration ▸ Locations", "Purchase ▸ Orders"],
        correct: [0],
        explanation: "Enter the Counted Quantity in Physical Inventory and click Apply; the difference posts against the Inventory adjustment location.",
      },
      {
        prompt: "The 'Replenish on Order (MTO)' route is not visible on the product form. What is the most likely reason?",
        kind: "single",
        options: ["MTO requires Enterprise", "The route is archived by default", "Lots must be enabled", "The product is a Service"],
        correct: [1],
        explanation: "In recent versions the MTO route is archived by default and must be unarchived under Inventory ▸ Configuration ▸ Routes.",
      },
      {
        prompt: "A client asks for a mandatory manager approval before any scrap above USD 500. How should a consultant classify it?",
        kind: "single",
        options: ["Standard Inventory feature", "Customization (or Enterprise Approvals/Studio)", "Not possible in Odoo", "Localization setting"],
        correct: [1],
        explanation: "Inventory has no native scrap approval; it needs the Approvals app/Studio automation (Enterprise) or a custom module.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-inventory-assignment-1",
      title: "Design and Configure Northwind's Warehouse",
      instructions: `## Brief

Northwind Office Supplies Pvt Ltd is going live on Odoo 17 Inventory. Design and configure their warehouse in your training instance.

## Tasks

1. Enable the required settings (Storage Locations, Multi-Step Routes, UoM, Lots & Serial Numbers).
2. Configure warehouse **NW**: 1-step receipts, 2-step deliveries.
3. Create sub-locations (Rack-A, Rack-B, Floor, Cage) and two putaway rules.
4. Create four product categories (Paper AVCO, Toner FIFO, Furniture Standard, IT FIFO) with Automated valuation.
5. Create 8 products using /api/templates/products (include one lot-tracked and one serial-tracked product).
6. Load opening stock using /api/templates/opening-stock.

## Deliverables

- Configuration workbook (setting, value, business reason).
- Screenshots of warehouse, locations, categories and the applied opening stock.
- Inventory Valuation report export with total value.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Settings and warehouse match the brief | 25% |
| Master data quality (naming, UoM, tracking, categories) | 25% |
| Opening stock correct and valued | 25% |
| Workbook clarity and business justification | 25% |`,
    },
    {
      slug: "odoo-inventory-assignment-2",
      title: "End-to-End Stock Flow and Valuation Reconciliation",
      instructions: `## Brief

Run Northwind's full procure-to-ship cycle and prove that inventory and accounting agree.

## Tasks

1. Create a PO for 500 reams at 4.00; receive 300 and create a backorder; receive the remaining 200 at a revised price of 4.30.
2. Create and confirm an SO for 120 reams; process Pick and Ship; invoice the customer.
3. Count Rack-B and post a loss of 3 toner cartridges; scrap 5 chairs.
4. Set up a reordering rule and run replenishment.
5. Compare the Valuation report with the Stock Valuation account balance.

## Deliverables

- A table of every journal entry created (date, reference, accounts, debit, credit).
- The AVCO calculation shown step by step.
- A one-page reconciliation of valuation report vs general ledger.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| All transactions processed correctly | 30% |
| Journal entries correctly identified and explained | 30% |
| Reconciliation balances (or differences explained) | 25% |
| Professional presentation | 15% |`,
    },
  ],
};
