import type { ProjectContent } from "../types";

/**
 * Project B — Manufacturing company implementation.
 *
 * Fictional company and synthetic data only. Master data rows with a templateKey
 * use the exact column keys of the portal's import templates and only reference
 * values that exist in REFERENCE_DATA. Same client as the Odoo Manufacturing
 * course (Timbercraft Furniture Works); cost figures match the course roll-up.
 */
export const manufacturingProject: ProjectContent = {
  slug: "manufacturing-company-implementation",
  code: "B",
  configScenario: "manufacturing-company",
  title: "Timbercraft Furniture Works — Odoo manufacturing implementation",
  industry: "Furniture manufacturing",
  level: "intermediate",
  odooVersion: "Odoo 17.0",
  summary:
    "Implement Odoo 17.0 Manufacturing, Inventory, Purchase, Sales and Accounting for a kitchen-cabinet and wardrobe maker: products and units of measure, bills of materials (incl. a kit and a by-product), work centers and operations, manufacturing orders with backorders, MTO and reordering-rule replenishment, subcontracted spray finishing, lot tracking and standard/AVCO/FIFO costing.",
  company: {
    name: "Timbercraft Furniture Works",
    profile: `## Timbercraft Furniture Works (fictional)

Timbercraft Furniture Works manufactures **oak kitchen cabinets** and **bedroom wardrobes** in its own factory in Grand Rapids, Michigan, and sells them to kitchen dealers, home builders and a few private customers across the Great Lakes region. It is the same client used throughout the *Odoo Manufacturing* course.

| Attribute | Value |
|---|---|
| Founded | 2004 |
| Annual revenue | ~ USD 9 million |
| Customers | ~120 active accounts: kitchen dealers/studios, home builders, renovation firms, some private buyers |
| Vendors | ~25 (oak panel mill, hinge/runner maker, fasteners, lacquer and glue, one spray-finishing subcontractor) |
| Products | ~40 finished products (cabinet widths 30–90 cm, wardrobes 100–200 cm), ~150 raw materials and components |
| Production | Make-to-stock for standard cabinets, make-to-order for dealer projects; batches of 5–25 |
| Work centers | **Cutting** (CNC panel saw + edge bander), **Assembly** (benches), **Finishing** (spray booth) |
| Warehouses | **WH** — factory warehouse (raw-material store, production, factory dispatch); **WH2** — finished-goods store and showroom dispatch (2 km away) |
| Payment terms | Dealers 30–45 days; builders 30% deposit, balance 60 days; vendors 15 days to end of following month |

### Main products
| Product | Main materials | Route |
|---|---|---|
| Kitchen Cabinet 60cm (hero product) | Oak Panel 18mm, 4 hinges, 1 drawer-runner pair, 24 screws | Make-to-stock and make-to-order; peak-season finishing subcontracted |
| Wardrobe 2-Door 100cm | Oak Panel 18mm, back panel, edge banding, glue, hinges, hanging rail, lacquer | Make-to-stock |
| Cabinet Hardware Pack | 4 hinges + 24 screws, sold to fitters | Kit (never manufactured) |
| Oak Offcut Bundle | By-product of panel cutting, sold as firewood bundles | By-product |

### Organisation
- **Production** (24): production manager, planner, 2 team leads, 6 cutting, 10 assembly, 4 finishing
- **Warehouse** (5): storeman raw materials, 2 dispatch (WH), 2 finished-goods store (WH2)
- **Purchasing** (2): buyer, purchasing manager (also approves MOs above USD 5,000 today on paper)
- **Sales** (4): sales manager, 2 account managers, showroom assistant
- **Finance** (3): controller, AP/AR clerk, cost accountant (part time)
- **Management** (2): owner/CEO, operations director

### Why now?
Paper job cards and an Excel "recipe book" no longer keep up. Nobody knows the real cost of a cabinet, oak panel shortages stop the line twice a month, and the subcontracted spray finishing is tracked in emails. The owner wants one system from sales order to finished cabinet to invoice, with real production cost.

> The Odoo Manufacturing course models Timbercraft with a single warehouse code "TC". In this project the factory warehouse uses the code **WH** and the finished-goods store **WH2**, so that the import templates' location names (WH/Stock, WH2/Stock, WH/Stock/Shelf 1, WH/Stock/Shelf 2) apply directly.`,
    locations: [
      "Grand Rapids, MI (Head office, factory and WH — factory warehouse)",
      "Grand Rapids, MI — Kentwood (WH2 — finished-goods store and showroom)",
    ],
    employees: 40,
    currency: "USD",
  },
  requirements: [
    { id: "B-REQ-01", area: "Products", description: "Maintain raw materials in their natural unit of measure (oak and back panels and edge banding per m of 1,000 mm-wide panel, glue in kg, lacquer in L), components in Units, finished goods, a kit, a by-product and an installation service (Hours).", type: "configuration", priority: "Must" },
    { id: "B-REQ-02", area: "Bills of materials", description: "Single-level 'Manufacture this product' BoMs for Kitchen Cabinet 60cm, Kitchen Cabinet 60cm - Unfinished and Wardrobe 2-Door 100cm, each with components, quantities per 1 unit and operations.", type: "standard", priority: "Must" },
    { id: "B-REQ-03", area: "Bills of materials", description: "Sell the Cabinet Hardware Pack (4 hinges + 24 screws) as one sales line while the warehouse picks and the stock moves are the individual components (Kit BoM, no MO).", type: "standard", priority: "Should" },
    { id: "B-REQ-04", area: "Bills of materials", description: "Record oak offcuts produced during cutting as a by-product (Oak Offcut Bundle: 0.1 per cabinet, 0.2 per wardrobe) that enters stock and can be sold.", type: "configuration", priority: "Should" },
    { id: "B-REQ-05", area: "Manufacturing", description: "Allow operators to consume more oak than the BoM (damaged panel) with a warning, and record scrapped components and finished goods from the MO with a reason.", type: "configuration", priority: "Must" },
    { id: "B-REQ-06", area: "Work centers", description: "Define work centers Cutting, Assembly and Finishing with capacity, time efficiency, OEE target, setup/cleanup time, working hours and a fully loaded cost per hour supplied by finance.", type: "configuration", priority: "Must" },
    { id: "B-REQ-07", area: "Routings", description: "Enable the Work Orders setting and define operations (Cut panels, Assemble carcass, Spray finish) with default durations, components consumed per operation and finish blocked until assembly is done.", type: "configuration", priority: "Must" },
    { id: "B-REQ-08", area: "Manufacturing", description: "Manage the MO lifecycle (draft, confirmed, in progress, to close, done, cancelled) with component reservation, component availability status and 2-step manufacturing (Pick Components from the raw-material store, then manufacture).", type: "configuration", priority: "Must" },
    { id: "B-REQ-09", area: "Manufacturing", description: "Close an MO for the quantity actually produced and automatically create a backorder MO for the remainder, carrying the remaining components.", type: "standard", priority: "Must" },
    { id: "B-REQ-10", area: "Replenishment", description: "Dealer project orders for cabinets trigger a manufacturing order linked to the sales order (MTO + Manufacture), delivered directly from the factory warehouse WH.", type: "configuration", priority: "Must" },
    { id: "B-REQ-11", area: "Replenishment", description: "Min/max reordering rules generate RFQs for components (Buy) and keep WH2 stocked with standard cabinets resupplied from WH, with MOs created in WH for the shortfall.", type: "configuration", priority: "Must" },
    { id: "B-REQ-12", area: "Subcontracting", description: "In peak season, outsource spray finishing of cabinets to SprayPro Finishing: send unfinished cabinets, receive finished cabinets against a purchase order and pay a fee per cabinet.", type: "configuration", priority: "Should" },
    { id: "B-REQ-13", area: "Traceability", description: "Track oak panels by supplier batch (lot) and finished kitchen cabinets by production batch (lot), with upstream/downstream traceability from panel lot to customer.", type: "configuration", priority: "Must" },
    { id: "B-REQ-14", area: "Costing", description: "Perpetual (automated) valuation: oak panels FIFO, other raw materials, components and semi-finished goods AVCO, finished goods and by-products at standard price reviewed quarterly.", type: "configuration", priority: "Must" },
    { id: "B-REQ-15", area: "Costing", description: "Roll up product cost from component costs and work-center cost per hour (Compute Price from BoM / BoM Overview) to set the finished-goods standard cost.", type: "standard", priority: "Must" },
    { id: "B-REQ-16", area: "Purchase", description: "Purchase components with vendor pricelists and lead times; purchase orders above USD 5,000 require purchasing-manager approval; bills controlled on received quantities.", type: "configuration", priority: "Must" },
    { id: "B-REQ-17", area: "Sales", description: "Sell finished goods and kits to dealers (-10% Dealer pricelist) and builders (-15% Builder pricelist); standard stock is shipped from WH2; invoices based on delivered quantities.", type: "configuration", priority: "Must" },
    { id: "B-REQ-18", area: "Inventory", description: "Monthly cycle count of raw materials by location with differences posted to the inventory-loss account.", type: "standard", priority: "Should" },
    { id: "B-REQ-19", area: "Quality", description: "Dimensional check after Cutting and visual check after Finishing, with quality alerts on failure (Quality app — Enterprise; verify in your training instance).", type: "configuration", priority: "Should" },
    { id: "B-REQ-20", area: "Maintenance", description: "Preventive maintenance of the CNC panel saw (every 250 operating hours) and the spray booth (monthly filter change) linked to the work centers (Maintenance app — verify edition and the manufacturing link in your training instance).", type: "configuration", priority: "Could" },
    { id: "B-REQ-21", area: "Reporting", description: "Production reporting: MO analysis, work-order expected vs real duration, OEE per work center and expected vs actual cost per MO (verify report names and edition in your training instance).", type: "reporting", priority: "Should" },
    { id: "B-REQ-22", area: "Manufacturing", description: "Print a cutting list per MO listing every panel part (dimensions, quantity, panel lot) for the CNC operator.", type: "customization", priority: "Should" },
    { id: "B-REQ-23", area: "Bills of materials", description: "Record a panel-yield % on oak BoM lines so engineering can see net vs gross panel consumption and review the yield quarterly.", type: "customization", priority: "Could" },
    { id: "B-REQ-24", area: "Manufacturing", description: "MOs whose value (quantity × product standard cost) exceeds USD 5,000 require approval by the operations director before they can be confirmed.", type: "customization", priority: "Should" },
    { id: "B-REQ-25", area: "Data migration", description: "Load categories, partners, products, BoMs, work centers and opening stock (with lots and costs) at cut-over and reconcile quantity and value with the physical count.", type: "standard", priority: "Must" },
  ],
  asIs: `## AS-IS — current situation

### Systems in use
| Area | Current tool | Pain points |
|---|---|---|
| Product recipes | Excel "recipe book" per product family | Several versions in circulation; engineering changes not communicated |
| Production planning | Whiteboard + weekly Excel plan | No link to stock; shortages discovered when the job starts |
| Shop floor | Paper job cards per batch | Times written by hand, often missing; cards lost |
| Raw-material stock | Excel sheet updated by the storeman on Fridays | Oak shortages stop the line about twice a month |
| Purchasing | Buyer emails vendors; POs in Word | No approval, no link to production demand |
| Subcontracting | Emails and a paper delivery note to SprayPro | Nobody knows how many carcasses are at the subcontractor |
| Accounting | Desktop accounting package | Inventory valued once a month from Excel; cost per cabinet unknown |

### Current make-to-order flow (simplified)
1. Dealer emails an order for a kitchen project; the sales manager confirms a delivery date by gut feeling.
2. The planner writes the job on the whiteboard and prints a job card from the recipe book.
3. The storeman issues oak panels and hardware; nobody records what was issued.
4. Cutting, assembly and finishing write start/stop times on the job card (when they remember).
5. Finished cabinets go to the WH2 store; dispatch delivers from the paper order.
6. Finance invoices from the dispatch note days later.

### Current procure-to-produce (simplified)
1. A team lead notices the oak rack is nearly empty and tells the buyer.
2. The buyer phones Northwoods Hardwood Panels; express delivery fees are common.
3. The delivery note is signed; the oak supplier batch number is not recorded.

### Key problems
- **Unknown product cost**: prices are set from a cost sheet last updated three years ago.
- **Material shortages** stop production; express freight costs ~USD 18,000/year.
- **No traceability**: when a batch of oak panels warped, the affected customers could not be identified.
- **Subcontracted finishing** is invisible in stock; carcasses "disappear" at month end.
- **Scrap and over-consumption** of oak are not recorded; actual yield is unknown.
- **Approvals** of large batches happen on paper after the work has started.`,
  toBe: `## TO-BE — future process in Odoo 17.0

### Principles
- One database for Sales, Purchase, Inventory, Manufacturing and Accounting.
- **Standard Odoo first**: BoMs, work orders, MTO, reordering rules, subcontracting, lots and automated valuation are all standard. Three small customizations only (cutting list, panel yield, MO approval).
- Enterprise-only features (Quality, Shop Floor, MPS, PLM) are labelled and planned as phase 2 unless the client licenses Enterprise from day one (verify in your training instance).

### Warehouses
- **WH** (factory): **2-step manufacturing** — Pick Components from WH/Stock to the pre-production location, then manufacture (location names are Odoo defaults; verify in your training instance). Raw materials in WH/Stock, hardware on Shelf 1 / Shelf 2.
- **WH2** (finished-goods store): standard cabinets and wardrobes are resupplied from WH by reordering rules; dealer stock orders ship from WH2.
- Dealer **project** orders (MTO) are produced and delivered directly from WH.

### Plan to produce
\`\`\`visual-flow
{
  "title": "Plan to produce at Timbercraft",
  "caption": "Time tracking, scrap and quality checks on work orders are Enterprise features.",
  "steps": [
    {
      "title": "Demand",
      "icon": "target",
      "parallel": [
        {
          "title": "Sales order (MTO)",
          "icon": "cart"
        },
        {
          "title": "Reordering rule",
          "icon": "refresh"
        },
        {
          "title": "Planner (manual)",
          "icon": "user"
        }
      ]
    },
    {
      "title": "Manufacturing order",
      "icon": "file",
      "detail": "BoM + operations.",
      "branch": {
        "when": "Value > USD 5,000",
        "result": "Approval (custom)",
        "tone": "warning"
      }
    },
    {
      "title": "Pick components",
      "icon": "package",
      "detail": "WH/Stock → pre-production."
    },
    {
      "title": "Work orders",
      "icon": "factory",
      "detail": "Cut panels ▸ Assemble carcass ▸ Spray finish."
    },
    {
      "title": "Produce quantity",
      "icon": "check",
      "detail": "Lot KC60-yymm-nn.",
      "branch": {
        "when": "Partial",
        "result": "Backorder",
        "tone": "info"
      }
    },
    {
      "title": "Finished goods to WH/Stock",
      "icon": "warehouse",
      "detail": "Then delivery (MTO) or resupply WH2."
    }
  ]
}
\`\`\`

### Procure to produce
\`\`\`
MO confirmed ─▶ forecast below minimum ─▶ Replenishment / reordering rule
      ─▶ RFQ (vendor pricelist, lead time) ─▶ Approval (> USD 5,000) ─▶ PO
      ─▶ Receipt (oak lots) ─▶ Vendor bill (received qty) ─▶ Payment
\`\`\`

### Subcontracted finishing (peak season)
\`\`\`
MO: Kitchen Cabinet 60cm - Unfinished (Cut + Assemble in-house)
      ─▶ PO to SprayPro for Kitchen Cabinet 60cm (Subcontracting BoM)
      ─▶ Resupply transfer: unfinished cabinets ─▶ subcontracting location
      ─▶ Receipt of finished cabinets (subcontract MO done automatically)
      ─▶ Vendor bill = finishing fee only
\`\`\`

### Costing design
| Category | Costing | Valuation | Reason |
|---|---|---|---|
| Oak Panels | FIFO | Automated | Price varies per mill batch; lots already tracked |
| Raw Materials, Hardware Components, Semi-finished Goods | AVCO | Automated | Low-value, frequently bought items |
| Finished Goods | Standard | Automated | Stable cost for dealer pricing; reviewed quarterly from the BoM roll-up; variances visible per MO |
| By-products | Standard (2.00 per bundle) | Automated | Offcuts would otherwise enter at zero value (by-product cost share 0%) |
| Services | Standard | Manual | Not stocked |

The Manufacturing course values finished goods at AVCO in its examples; Timbercraft's controller chose **Standard** so dealer prices are based on an approved cost and MO overruns show as variances. Alternative considered: AVCO for finished goods (actual cost per MO flows straight into stock value).

### Approved standard cost (run-time roll-up)
| Product | Components | Operations | Standard |
|---|---|---|---|
| Kitchen Cabinet 60cm | 60.20 | 46.00 (20 + 45 + 30 min) | **106.20** |
| Kitchen Cabinet 60cm - Unfinished | 60.20 | 28.00 (20 + 45 min) | 88.20 (AVCO, reference) |
| Wardrobe 2-Door 100cm | 148.90 | 65.50 (35 + 60 + 40 min) | **214.40** |

Setup and cleanup times are kept on the work centers for scheduling. Depending on version, Compute Price from BoM may load them once per BoM quantity (for a BoM of 1 cabinet that adds 15 min × 30.00/60 + 25 min × 36.00/60 = 7.50 + 15.00 = 22.50, giving 128.70 — verify in your training instance). The controller approves the run-time figures above as standard; setup time shows as an MO variance.

### Reporting
- BoM Overview for expected cost; MO cost analysis for expected vs actual (verify name/edition).
- Work-order analysis and OEE per work center (verify menu names).
- Inventory valuation reconciled with the stock valuation accounts monthly.`,
  masterDataFiles: [
    {
      name: "Product categories",
      templateKey: "product-categories",
      description: "Category tree carrying the costing method and automated valuation agreed with the controller (see TO-BE costing design).",
      rows: [
        { id: "categ_tc_raw", name: "Raw Materials", "parent_id/id": "product.product_category_all", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_tc_oak", name: "Oak Panels", "parent_id/id": "categ_tc_raw", property_cost_method: "fifo", property_valuation: "real_time" },
        { id: "categ_tc_hardware", name: "Hardware Components", "parent_id/id": "categ_tc_raw", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_tc_semi", name: "Semi-finished Goods", "parent_id/id": "product.product_category_all", property_cost_method: "average", property_valuation: "real_time" },
        { id: "categ_tc_fg", name: "Finished Goods", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "real_time" },
        { id: "categ_tc_byprod", name: "By-products", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "real_time" },
        { id: "categ_tc_services", name: "Services", "parent_id/id": "product.product_category_all", property_cost_method: "standard", property_valuation: "manual_periodic" },
      ],
    },
    {
      name: "Vendors",
      templateKey: "vendors",
      description: "Synthetic component suppliers and the spray-finishing subcontractor.",
      rows: [
        { id: "vend_tc_0001", name: "Northwoods Hardwood Panels Inc.", is_company: "1", email: "orders@northwoodspanels.example", phone: "+1 715-555-0301", street: "2100 Mill Rd", city: "Wausau", zip: "54401", country_id: "United States", vat: "US-WI-5000001", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_tc_0002", name: "Hinterberg Beschlagtechnik GmbH", is_company: "1", email: "export@hinterberg-beschlag.example", phone: "+49 711 5550302", street: "Industriestrasse 14", city: "Stuttgart", zip: "70173", country_id: "Germany", vat: "DE-TC-5000002", property_supplier_payment_term_id: "End of Following Month", supplier_rank: "1" },
        { id: "vend_tc_0003", name: "Midwest Fastener Supply", is_company: "1", email: "sales@midwestfastener.example", phone: "+1 419-555-0303", street: "640 Summit St", city: "Toledo", zip: "43604", country_id: "United States", vat: "US-OH-5000003", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
        { id: "vend_tc_0004", name: "ClearCoat Finishes Co.", is_company: "1", email: "trade@clearcoatfinishes.example", phone: "+1 216-555-0304", street: "1801 Superior Ave", city: "Cleveland", zip: "44114", country_id: "United States", vat: "US-OH-5000004", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
        { id: "vend_tc_0005", name: "SprayPro Finishing LLC", is_company: "1", email: "jobs@sprayprofinishing.example", phone: "+1 616-555-0305", street: "77 Plainfield Ave NE", city: "Grand Rapids", zip: "49505", country_id: "United States", vat: "US-MI-5000005", property_supplier_payment_term_id: "15 Days", supplier_rank: "1" },
      ],
    },
    {
      name: "Customers",
      templateKey: "customers",
      description: "Synthetic kitchen dealers, home builders, renovators and one private customer.",
      rows: [
        { id: "cust_tc_0001", name: "Lakeshore Kitchen Studio", is_company: "1", email: "orders@lakeshorekitchens.example", phone: "+1 616-555-0101", street: "455 Fulton St W", city: "Grand Rapids", zip: "49504", country_id: "United States", vat: "US-MI-6000001", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_tc_0002", name: "Great Lakes Cabinet Dealers Inc.", is_company: "1", email: "purchasing@greatlakescabinets.example", phone: "+1 313-555-0102", street: "1500 Woodward Ave", city: "Detroit", zip: "48226", country_id: "United States", vat: "US-MI-6000002", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_tc_0003", name: "Hoosier Home Builders LLC", is_company: "1", email: "projects@hoosierbuilders.example", phone: "+1 317-555-0103", street: "200 Meridian St", city: "Indianapolis", zip: "46204", country_id: "United States", vat: "US-IN-6000003", property_payment_term_id: "30% Now, Balance 60 Days", customer_rank: "1" },
        { id: "cust_tc_0004", name: "Buckeye Kitchens & Baths", is_company: "1", email: "buyer@buckeyekitchens.example", phone: "+1 614-555-0104", street: "88 High St", city: "Columbus", zip: "43215", country_id: "United States", vat: "US-OH-6000004", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_tc_0005", name: "Prairie State Homes Corp.", is_company: "1", email: "procurement@prairiestatehomes.example", phone: "+1 312-555-0105", street: "300 Wacker Dr", city: "Chicago", zip: "60606", country_id: "United States", vat: "US-IL-6000005", property_payment_term_id: "45 Days", customer_rank: "1" },
        { id: "cust_tc_0006", name: "North Shore Renovations", is_company: "1", email: "office@northshorereno.example", phone: "+1 414-555-0106", street: "710 Water St", city: "Milwaukee", zip: "53202", country_id: "United States", vat: "US-WI-6000006", property_payment_term_id: "15 Days", customer_rank: "1" },
        { id: "cust_tc_0007", name: "Maple Ridge Interiors Ltd.", is_company: "1", email: "accounts@mapleridgeinteriors.example", phone: "+1 416-555-0107", street: "120 King St W", city: "Toronto", zip: "M5H 1J9", country_id: "Canada", vat: "CA-ON-6000007", property_payment_term_id: "30 Days", customer_rank: "1" },
        { id: "cust_tc_0008", name: "Daniel Okafor", is_company: "0", email: "daniel.okafor@mail.example", phone: "+1 616-555-0108", street: "32 Cherry St SE", city: "Grand Rapids", zip: "49503", country_id: "United States", vat: "", property_payment_term_id: "Immediate Payment", customer_rank: "1" },
      ],
    },
    {
      name: "Products",
      templateKey: "products",
      description:
        "Raw materials (m, kg, L), hardware components, a semi-finished cabinet, finished goods, a kit, a by-product and a service. Oak and back panels are bought cut-to-length from 1,000 mm-wide stock, so 1 m = 1 m² (the course uses an m² unit; m keeps the file inside the import template's unit list). Costs are the opening costs; finished-goods costs are the approved standards. Barcodes are synthetic in-store EAN-13 codes.",
      rows: [
        { id: "prod_tc_oak18", name: "Oak Panel 18mm (1000 mm wide)", default_code: "RM-OAK18", detailed_type: "product", "categ_id/id": "categ_tc_oak", uom_id: "m", uom_po_id: "m", list_price: "0.00", standard_price: "25.00", barcode: "2003000000016", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_oak08", name: "Oak Back Panel 8mm (1000 mm wide)", default_code: "RM-OAK08", detailed_type: "product", "categ_id/id": "categ_tc_raw", uom_id: "m", uom_po_id: "m", list_price: "0.00", standard_price: "9.00", barcode: "2003000000023", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_edge22", name: "Oak Edge Banding 22mm", default_code: "RM-EDG22", detailed_type: "product", "categ_id/id": "categ_tc_raw", uom_id: "m", uom_po_id: "m", list_price: "0.00", standard_price: "0.40", barcode: "2003000000030", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_glue", name: "Wood Glue PVA", default_code: "RM-GLU", detailed_type: "product", "categ_id/id": "categ_tc_raw", uom_id: "kg", uom_po_id: "kg", list_price: "0.00", standard_price: "4.50", barcode: "2003000000047", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_lacquer", name: "Clear Lacquer Satin", default_code: "RM-LAC", detailed_type: "product", "categ_id/id": "categ_tc_raw", uom_id: "L", uom_po_id: "L", list_price: "0.00", standard_price: "12.00", barcode: "2003000000054", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_hinge", name: "Cabinet Hinge", default_code: "RM-HNG", detailed_type: "product", "categ_id/id": "categ_tc_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "1.50", barcode: "2003000000061", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_runner", name: "Drawer Runner (pair)", default_code: "RM-RUN", detailed_type: "product", "categ_id/id": "categ_tc_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "8.00", barcode: "2003000000078", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_screw", name: "Wood Screw 4x30", default_code: "RM-SCR", detailed_type: "product", "categ_id/id": "categ_tc_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "0.05", barcode: "2003000000085", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_rail", name: "Wardrobe Hanging Rail 1m", default_code: "RM-RAIL", detailed_type: "product", "categ_id/id": "categ_tc_hardware", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "3.20", barcode: "2003000000092", sale_ok: "0", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_kc60u", name: "Kitchen Cabinet 60cm - Unfinished", default_code: "SF-KC60U", detailed_type: "product", "categ_id/id": "categ_tc_semi", uom_id: "Units", uom_po_id: "Units", list_price: "0.00", standard_price: "88.20", barcode: "2003000000108", sale_ok: "0", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_tc_kc60", name: "Kitchen Cabinet 60cm", default_code: "FG-KC60", detailed_type: "product", "categ_id/id": "categ_tc_fg", uom_id: "Units", uom_po_id: "Units", list_price: "249.00", standard_price: "106.20", barcode: "2003000000115", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
        { id: "prod_tc_wd100", name: "Wardrobe 2-Door 100cm", default_code: "FG-WD100", detailed_type: "product", "categ_id/id": "categ_tc_fg", uom_id: "Units", uom_po_id: "Units", list_price: "549.00", standard_price: "214.40", barcode: "2003000000122", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_tc_hwpack", name: "Cabinet Hardware Pack", default_code: "KIT-HWP", detailed_type: "consu", "categ_id/id": "categ_tc_fg", uom_id: "Units", uom_po_id: "Units", list_price: "12.00", standard_price: "7.20", barcode: "2003000000139", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_tc_offcut", name: "Oak Offcut Bundle", default_code: "BP-OFF", detailed_type: "product", "categ_id/id": "categ_tc_byprod", uom_id: "Units", uom_po_id: "Units", list_price: "6.00", standard_price: "2.00", barcode: "2003000000146", sale_ok: "1", purchase_ok: "0", invoice_policy: "delivery" },
        { id: "prod_tc_install", name: "Cabinet Installation (hour)", default_code: "SRV-INST", detailed_type: "service", "categ_id/id": "categ_tc_services", uom_id: "Hours", uom_po_id: "Hours", list_price: "55.00", standard_price: "0.00", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
      ],
    },
    {
      name: "Opening stock",
      templateKey: "opening-stock",
      description:
        "Cut-over count. Oak panels and finished cabinets are lot-tracked (one row per lot). Value at opening costs: raw materials and components 9,556.50; finished goods 2,132.00 (12 × 106.20 + 4 × 214.40); by-products 30.00; total 11,718.50.",
      rows: [
        { "product_id/id": "prod_tc_oak18", location_id: "WH/Stock", inventory_quantity: "160", lot_id: "OAK-2609-A" },
        { "product_id/id": "prod_tc_oak18", location_id: "WH/Stock", inventory_quantity: "80", lot_id: "OAK-2609-B" },
        { "product_id/id": "prod_tc_oak08", location_id: "WH/Stock", inventory_quantity: "80", lot_id: "" },
        { "product_id/id": "prod_tc_edge22", location_id: "WH/Stock", inventory_quantity: "600", lot_id: "" },
        { "product_id/id": "prod_tc_glue", location_id: "WH/Stock", inventory_quantity: "25", lot_id: "" },
        { "product_id/id": "prod_tc_lacquer", location_id: "WH/Stock", inventory_quantity: "40", lot_id: "" },
        { "product_id/id": "prod_tc_hinge", location_id: "WH/Stock/Shelf 1", inventory_quantity: "600", lot_id: "" },
        { "product_id/id": "prod_tc_runner", location_id: "WH/Stock/Shelf 1", inventory_quantity: "80", lot_id: "" },
        { "product_id/id": "prod_tc_screw", location_id: "WH/Stock/Shelf 2", inventory_quantity: "8000", lot_id: "" },
        { "product_id/id": "prod_tc_rail", location_id: "WH/Stock/Shelf 2", inventory_quantity: "20", lot_id: "" },
        { "product_id/id": "prod_tc_kc60", location_id: "WH2/Stock", inventory_quantity: "12", lot_id: "KC60-2609-01" },
        { "product_id/id": "prod_tc_wd100", location_id: "WH2/Stock", inventory_quantity: "4", lot_id: "" },
        { "product_id/id": "prod_tc_offcut", location_id: "WH/Stock", inventory_quantity: "15", lot_id: "" },
      ],
    },
    {
      name: "Work centers",
      description:
        "Created manually in Manufacturing ▸ Configuration ▸ Work Centers after enabling Work Orders (no import template). Rates are fully loaded (wages, benefits, depreciation, energy) and approved by the controller. Assembly is modelled with capacity 1 so recorded work-order time equals paid bench time; with capacity 2 Odoo halves the expected MO duration and the hourly rate would have to cover both benches.",
      rows: [
        { name: "Cutting", code: "CUT", capacity: "1", time_efficiency: "100", oee_target: "85", cost_per_hour: "30.00", setup_min: "10", cleanup_min: "5", equipment: "CNC panel saw, edge bander" },
        { name: "Assembly", code: "ASM", capacity: "1", time_efficiency: "100", oee_target: "90", cost_per_hour: "24.00", setup_min: "0", cleanup_min: "0", equipment: "Assembly benches 1 and 2" },
        { name: "Finishing", code: "FIN", capacity: "1", time_efficiency: "100", oee_target: "85", cost_per_hour: "36.00", setup_min: "15", cleanup_min: "10", equipment: "Spray booth with extraction" },
      ],
    },
    {
      name: "Routings / operations",
      description:
        "In Odoo 17 operations are defined on each BoM (Operations tab) — there is no separate routing object. Durations are per 1 unit (BoM quantity 1). Operation cost = minutes / 60 × work-center cost per hour.",
      rows: [
        { bom: "Kitchen Cabinet 60cm (Manufacture)", sequence: "10", operation: "Cut panels", work_center: "Cutting", duration_min: "20", cost: "10.00", blocked_by: "", instructions: "Cut per cutting list; edge-band visible edges" },
        { bom: "Kitchen Cabinet 60cm (Manufacture)", sequence: "20", operation: "Assemble carcass", work_center: "Assembly", duration_min: "45", cost: "18.00", blocked_by: "Cut panels", instructions: "Fit hinges and drawer runner; check square" },
        { bom: "Kitchen Cabinet 60cm (Manufacture)", sequence: "30", operation: "Spray finish", work_center: "Finishing", duration_min: "30", cost: "18.00", blocked_by: "Assemble carcass", instructions: "Two coats satin; 4 h flash-off" },
        { bom: "Kitchen Cabinet 60cm - Unfinished", sequence: "10", operation: "Cut panels", work_center: "Cutting", duration_min: "20", cost: "10.00", blocked_by: "", instructions: "As cabinet" },
        { bom: "Kitchen Cabinet 60cm - Unfinished", sequence: "20", operation: "Assemble carcass", work_center: "Assembly", duration_min: "45", cost: "18.00", blocked_by: "Cut panels", instructions: "Wrap for transport to subcontractor" },
        { bom: "Wardrobe 2-Door 100cm", sequence: "10", operation: "Cut and edge-band panels", work_center: "Cutting", duration_min: "35", cost: "17.50", blocked_by: "", instructions: "Cut per cutting list; edge-band all visible edges" },
        { bom: "Wardrobe 2-Door 100cm", sequence: "20", operation: "Assemble wardrobe", work_center: "Assembly", duration_min: "60", cost: "24.00", blocked_by: "Cut and edge-band panels", instructions: "Glue and screw carcass; fit back panel, rail, doors" },
        { bom: "Wardrobe 2-Door 100cm", sequence: "30", operation: "Spray finish", work_center: "Finishing", duration_min: "40", cost: "24.00", blocked_by: "Assemble wardrobe", instructions: "Two coats satin" },
      ],
    },
    {
      name: "Bills of materials",
      description:
        "Created in Manufacturing ▸ Products ▸ Bills of Materials (all BoM quantity 1 Units). Kitchen Cabinet 60cm has two BoMs: Manufacture (in-house) and Subcontracting (SprayPro). Rows of type by-product go on the By-products tab (enable By-Products in settings). Roll-ups: cabinet components 45.00 + 6.00 + 8.00 + 1.20 = 60.20; wardrobe components 105.00 + 18.00 + 4.80 + 0.90 + 9.00 + 3.20 + 2.00 + 6.00 = 148.90; hardware pack 6.00 + 1.20 = 7.20.",
      rows: [
        { product: "Kitchen Cabinet 60cm", bom_type: "Manufacture this product", line: "component", component: "Oak Panel 18mm (1000 mm wide)", quantity: "1.80", uom: "m", operation: "Cut panels" },
        { product: "Kitchen Cabinet 60cm", bom_type: "Manufacture this product", line: "component", component: "Cabinet Hinge", quantity: "4", uom: "Units", operation: "Assemble carcass" },
        { product: "Kitchen Cabinet 60cm", bom_type: "Manufacture this product", line: "component", component: "Drawer Runner (pair)", quantity: "1", uom: "Units", operation: "Assemble carcass" },
        { product: "Kitchen Cabinet 60cm", bom_type: "Manufacture this product", line: "component", component: "Wood Screw 4x30", quantity: "24", uom: "Units", operation: "Assemble carcass" },
        { product: "Kitchen Cabinet 60cm", bom_type: "Manufacture this product", line: "by-product", component: "Oak Offcut Bundle", quantity: "0.1", uom: "Units", operation: "Cut panels" },
        { product: "Kitchen Cabinet 60cm - Unfinished", bom_type: "Manufacture this product", line: "component", component: "Oak Panel 18mm (1000 mm wide)", quantity: "1.80", uom: "m", operation: "Cut panels" },
        { product: "Kitchen Cabinet 60cm - Unfinished", bom_type: "Manufacture this product", line: "component", component: "Cabinet Hinge", quantity: "4", uom: "Units", operation: "Assemble carcass" },
        { product: "Kitchen Cabinet 60cm - Unfinished", bom_type: "Manufacture this product", line: "component", component: "Drawer Runner (pair)", quantity: "1", uom: "Units", operation: "Assemble carcass" },
        { product: "Kitchen Cabinet 60cm - Unfinished", bom_type: "Manufacture this product", line: "component", component: "Wood Screw 4x30", quantity: "24", uom: "Units", operation: "Assemble carcass" },
        { product: "Kitchen Cabinet 60cm", bom_type: "Subcontracting (SprayPro Finishing LLC)", line: "component", component: "Kitchen Cabinet 60cm - Unfinished", quantity: "1", uom: "Units", operation: "" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Oak Panel 18mm (1000 mm wide)", quantity: "4.20", uom: "m", operation: "Cut and edge-band panels" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Oak Back Panel 8mm (1000 mm wide)", quantity: "2.00", uom: "m", operation: "Cut and edge-band panels" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Oak Edge Banding 22mm", quantity: "12", uom: "m", operation: "Cut and edge-band panels" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Wood Glue PVA", quantity: "0.20", uom: "kg", operation: "Assemble wardrobe" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Cabinet Hinge", quantity: "6", uom: "Units", operation: "Assemble wardrobe" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Wardrobe Hanging Rail 1m", quantity: "1", uom: "Units", operation: "Assemble wardrobe" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Wood Screw 4x30", quantity: "40", uom: "Units", operation: "Assemble wardrobe" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "component", component: "Clear Lacquer Satin", quantity: "0.50", uom: "L", operation: "Spray finish" },
        { product: "Wardrobe 2-Door 100cm", bom_type: "Manufacture this product", line: "by-product", component: "Oak Offcut Bundle", quantity: "0.2", uom: "Units", operation: "Cut and edge-band panels" },
        { product: "Cabinet Hardware Pack", bom_type: "Kit", line: "component", component: "Cabinet Hinge", quantity: "4", uom: "Units", operation: "" },
        { product: "Cabinet Hardware Pack", bom_type: "Kit", line: "component", component: "Wood Screw 4x30", quantity: "24", uom: "Units", operation: "" },
      ],
    },
    {
      name: "Reordering rules",
      description: "Created in Inventory ▸ Operations ▸ Replenishment (or on the product). Quantities in the product's unit of measure.",
      rows: [
        { product: "Oak Panel 18mm (1000 mm wide)", location: "WH/Stock", route: "Buy", min_qty: "60", max_qty: "240", multiple: "20" },
        { product: "Cabinet Hinge", location: "WH/Stock", route: "Buy", min_qty: "200", max_qty: "800", multiple: "100" },
        { product: "Wood Screw 4x30", location: "WH/Stock", route: "Buy", min_qty: "2000", max_qty: "10000", multiple: "1000" },
        { product: "Wardrobe Hanging Rail 1m", location: "WH/Stock", route: "Buy", min_qty: "10", max_qty: "40", multiple: "1" },
        { product: "Kitchen Cabinet 60cm", location: "WH2/Stock", route: "WH2: Supply Product from WH (resupply route — verify name)", min_qty: "10", max_qty: "30", multiple: "1" },
        { product: "Kitchen Cabinet 60cm", location: "WH/Stock", route: "Manufacture", min_qty: "0", max_qty: "0", multiple: "1" },
      ],
    },
    {
      name: "Vendor pricelists",
      description: "Purchase tab of each product (vendor, price, minimum quantity, lead time). The SprayPro line is the subcontracting fee per finished cabinet.",
      rows: [
        { product: "Oak Panel 18mm (1000 mm wide)", vendor: "Northwoods Hardwood Panels Inc.", price: "25.00", min_qty: "20", delivery_lead_days: "7" },
        { product: "Oak Back Panel 8mm (1000 mm wide)", vendor: "Northwoods Hardwood Panels Inc.", price: "9.00", min_qty: "20", delivery_lead_days: "7" },
        { product: "Cabinet Hinge", vendor: "Hinterberg Beschlagtechnik GmbH", price: "1.50", min_qty: "100", delivery_lead_days: "21" },
        { product: "Drawer Runner (pair)", vendor: "Hinterberg Beschlagtechnik GmbH", price: "8.00", min_qty: "20", delivery_lead_days: "21" },
        { product: "Wood Screw 4x30", vendor: "Midwest Fastener Supply", price: "0.05", min_qty: "1000", delivery_lead_days: "3" },
        { product: "Wardrobe Hanging Rail 1m", vendor: "Midwest Fastener Supply", price: "3.20", min_qty: "1", delivery_lead_days: "3" },
        { product: "Clear Lacquer Satin", vendor: "ClearCoat Finishes Co.", price: "12.00", min_qty: "20", delivery_lead_days: "5" },
        { product: "Wood Glue PVA", vendor: "ClearCoat Finishes Co.", price: "4.50", min_qty: "10", delivery_lead_days: "5" },
        { product: "Oak Edge Banding 22mm", vendor: "ClearCoat Finishes Co.", price: "0.40", min_qty: "200", delivery_lead_days: "5" },
        { product: "Kitchen Cabinet 60cm", vendor: "SprayPro Finishing LLC", price: "22.00", min_qty: "10", delivery_lead_days: "4" },
      ],
    },
  ],
  phases: [
    {
      key: "discovery",
      title: "Discovery",
      tasks: [
        { title: "Kick-off meeting", description: "Align owner, operations director, controller and key users on scope (Manufacturing, Inventory, Purchase, Sales, Accounting), timeline, edition (Community vs Enterprise) and roles.", deliverable: "Kick-off deck and project charter" },
        { title: "Shop-floor walk", description: "Walk the factory with the production manager; count the physical stops a cabinet makes and where time could realistically be recorded.", deliverable: "Shop-floor observation notes and draft work-center list" },
        { title: "AS-IS process mapping", description: "Map make-to-stock, make-to-order, procure-to-produce, subcontracting and month-end costing as done today.", deliverable: "AS-IS process maps" },
        { title: "Data landscape review", description: "Review the Excel recipe book, stock sheets, vendor price lists and the cost sheet; assess completeness and quality.", deliverable: "Data source inventory and quality assessment" },
      ],
    },
    {
      key: "requirements",
      title: "Requirements",
      tasks: [
        { title: "Requirements workshops", description: "Workshops for production, warehouse, purchasing, sales and finance capturing requirements with business justification.", deliverable: "Requirements register (B-REQ-01…25)" },
        { title: "Fit-gap analysis", description: "Classify each requirement (standard, configuration, customization, reporting) and note Enterprise-only features (Quality, Shop Floor, MPS, PLM).", deliverable: "Fit-gap matrix with edition column" },
        { title: "MoSCoW prioritisation", description: "Agree Must/Should/Could and phase 2 items (Quality, Maintenance) with the owner.", deliverable: "Signed-off prioritised scope" },
      ],
    },
    {
      key: "design",
      title: "Solution design",
      tasks: [
        { title: "TO-BE process design", description: "Design plan-to-produce, MTO, replenishment, subcontracting and scrap processes in Odoo, incl. 2-step manufacturing in WH and resupply of WH2.", deliverable: "TO-BE process document" },
        { title: "BoM and routing design", description: "Agree BoM structure (single-level, unfinished cabinet for subcontracting, kit, by-products), operations, durations and consumption flexibility.", deliverable: "BoM & routing design workbook" },
        { title: "Costing design", description: "Agree costing per category (FIFO/AVCO/standard), work-center cost per hour, standard-cost review cycle and how setup time and variances are treated.", deliverable: "Costing policy signed by the controller" },
        { title: "Customization specifications", description: "Write specs for the cutting list, panel-yield field and MO approval; record standard and Studio alternatives considered.", deliverable: "Functional/technical specs CUS-01…03" },
        { title: "Data migration design", description: "Define objects, load order (categories ▸ partners ▸ products ▸ work centers ▸ BoMs ▸ reordering rules ▸ opening stock), cut-over date and reconciliation.", deliverable: "Data migration plan" },
      ],
    },
    {
      key: "configuration",
      title: "Configuration",
      tasks: [
        { title: "Inventory setup", description: "Warehouses WH (2-step manufacturing) and WH2, Multi-Step Routes, Units of Measure, Lots & Serial Numbers, MTO route unarchived, resupply route WH2 from WH.", deliverable: "Configured inventory" },
        { title: "Manufacturing settings and work centers", description: "Enable Work Orders, By-Products, Subcontracting; create work centers with rates, setup/cleanup, OEE targets and working hours.", deliverable: "Configured Manufacturing settings and work centers" },
        { title: "Products, BoMs and operations", description: "Routes per product (Buy / Manufacture / MTO), tracking, BoMs with operations, consumed-in-operation, by-products, kit and subcontracting BoMs; Compute Price from BoM review.", deliverable: "BoM Overview printouts with approved costs" },
        { title: "Purchase, sales and accounting setup", description: "Vendor pricelists and lead times, PO approval at USD 5,000, bill control on received quantities, Dealer/Builder pricelists, invoicing on delivery, valuation accounts per category.", deliverable: "Configured purchase, sales and accounting" },
        { title: "Users and access rights", description: "Manufacturing User for planners/team leads, Administrator for the production manager, minimal rights for operators; approver group for MO approval.", deliverable: "User access matrix" },
      ],
    },
    {
      key: "migration",
      title: "Data migration",
      tasks: [
        { title: "Data cleansing", description: "Rationalise the recipe book into one BoM per product, standardise SKUs, units of measure and vendor names.", deliverable: "Cleansed data files" },
        { title: "Trial imports", description: "Import categories, vendors, customers, products and opening stock with the portal templates; create work centers and BoMs; fix all errors.", deliverable: "Import logs with zero errors" },
        { title: "Cost and stock reconciliation", description: "Reconcile opening stock quantity and value (11,718.50) and compare BoM Overview costs with the controller's cost sheet.", deliverable: "Reconciliation report" },
        { title: "Final cut-over load", description: "Freeze the shop floor, count, load final opening stock with lots and apply.", deliverable: "Cut-over sign-off" },
      ],
    },
    {
      key: "development",
      title: "Development",
      tasks: [
        { title: "Cutting-list report", description: "Custom QWeb report on the MO listing panel parts from the BoM with lot and quantities.", deliverable: "Custom module timbercraft_cutting_list + tests" },
        { title: "Panel-yield field", description: "Panel-yield % and net area on BoM lines (Studio or small module) with a check that gross = net / yield.", deliverable: "Studio customization export or module timbercraft_panel_yield" },
        { title: "MO approval", description: "Approval step for MOs above USD 5,000 using Studio approval rules (Enterprise) or a small custom module (Community).", deliverable: "Approval configuration or module timbercraft_mo_approval + tests" },
      ],
    },
    {
      key: "testing",
      title: "Testing",
      tasks: [
        { title: "System testing", description: "Consultants test each BoM, work center, route and customization in isolation.", deliverable: "System test results" },
        { title: "Integration testing", description: "Run transaction scenarios B-TS-01…08 end to end, including the accounting entries.", deliverable: "Integration test log with journal-entry evidence" },
        { title: "User acceptance testing", description: "Planner, team leads, storeman, buyer and controller execute B-TC-01…15 and sign off.", deliverable: "UAT sign-off" },
        { title: "Training", description: "Role-based training: planner (MOs, replenishment), operators (work orders, scrap), storeman (picking, counts), controller (costing, variances).", deliverable: "Training materials and attendance list" },
      ],
    },
    {
      key: "golive",
      title: "Go-live & hypercare",
      tasks: [
        { title: "Go/no-go meeting", description: "Review readiness checklist, open defects, standard costs approval and cut-over plan.", deliverable: "Go/no-go decision" },
        { title: "Cut-over execution", description: "Close open paper job cards, count raw materials and finished goods, load opening stock, create first MOs in Odoo.", deliverable: "Cut-over checklist completed" },
        { title: "Hypercare support", description: "Two weeks on the shop floor helping operators with work orders and the storeman with picks; daily issue triage.", deliverable: "Issue log and resolution report" },
        { title: "Project closure", description: "First month-end with variance review, lessons learned, handover to support.", deliverable: "Closure report" },
      ],
    },
  ],
  transactionScenarios: [
    {
      id: "B-TS-01",
      title: "Make-to-order — dealer project order creates an MO",
      steps: [
        "Kitchen Cabinet 60cm has routes Manufacture + Replenish on Order (MTO); the SO warehouse is WH (factory dispatch)",
        "Create a quotation for Lakeshore Kitchen Studio (Dealer pricelist) for 3 Kitchen Cabinet 60cm and confirm it",
        "Open the MO created from the SO (source document = SO number); confirm components: 5.40 m oak, 12 hinges, 3 runner pairs, 72 screws",
        "Validate the Pick Components transfer (oak lot OAK-2609-A), run the three work orders and produce 3 cabinets into lot KC60-2610-01",
        "Validate the delivery order and invoice the delivered quantity",
      ],
      expected: "Unit price 249.00 × 0.90 = 224.10; invoice 672.30 untaxed. MO linked to the SO; finished goods enter at standard 3 × 106.20 = 318.60; lot KC60-2610-01 traceable to the customer.",
    },
    {
      id: "B-TS-02",
      title: "Partial production with backorder",
      steps: [
        "Create and confirm an MO for 10 Kitchen Cabinet 60cm (lot KC60-2610-02)",
        "Complete the work orders for 6 cabinets only (finishing booth down for the afternoon)",
        "Set quantity produced to 6 and click Mark as Done; choose Create Backorder",
        "Check the original MO and the new backorder MO (suffix -002)",
      ],
      expected: "Original MO done for 6: consumed 10.80 m oak, 24 hinges, 6 runner pairs, 144 screws; 6 × 106.20 = 637.20 into finished goods. Backorder MO for 4 carries 7.20 m oak, 16 hinges, 4 runner pairs, 96 screws.",
    },
    {
      id: "B-TS-03",
      title: "Component shortage triggers purchase",
      steps: [
        "Wardrobe Hanging Rail 1m: 20 on hand, reordering rule WH min 10 / max 40 / multiple 1, vendor Midwest Fastener Supply",
        "Create an MO for 25 Wardrobe 2-Door 100cm (value 25 × 214.40 = 5,360.00 → approval by the operations director, CUS-03) and confirm it",
        "MO component status shows Hanging Rail not available (need 25, have 20)",
        "Open Inventory ▸ Operations ▸ Replenishment; the rail shows a suggested quantity; click Order Once",
        "Confirm the RFQ (below the USD 5,000 PO approval threshold), receive the rails and check availability on the MO",
      ],
      expected: "Forecast = 20 − 25 = −5, below min 10 → order quantity 40 − (−5) = 45 rails; PO 45 × 3.20 = 144.00. After receipt, components show Available and the MO can start.",
    },
    {
      id: "B-TS-04",
      title: "Subcontracted spray finishing (SprayPro)",
      steps: [
        "Start with 20 Kitchen Cabinet 60cm - Unfinished in WH/Stock (produced on an earlier MO, valued at 88.20 each = 1,764.00)",
        "Create a PO to SprayPro Finishing LLC for 20 Kitchen Cabinet 60cm at 22.00 (subcontracting BoM) and confirm",
        "Validate the resupply transfer sending 20 unfinished cabinets to the subcontracting location",
        "When SprayPro returns the cabinets, validate the receipt into WH/Stock (lot KC60-2610-SP1)",
        "Create the vendor bill from the PO and post it",
      ],
      expected: "Receipt completes the underlying subcontract MO automatically; 20 unfinished cabinets consumed; vendor bill 20 × 22.00 = 440.00. Actual cost 1,764.00 + 440.00 = 2,204.00 (110.20 each); with standard costing the cabinets enter at 20 × 106.20 = 2,124.00 and the 80.00 difference is a variance (verify the account used in your training instance).",
    },
    {
      id: "B-TS-05",
      title: "Scrap during production",
      steps: [
        "Create and confirm an MO for 5 Wardrobe 2-Door 100cm (needs 21.00 m oak)",
        "During Cutting, a 2.10 m oak length (lot OAK-2609-A) is mis-cut: click Scrap on the MO, product Oak Panel 18mm, quantity 2.10 m, lot OAK-2609-A, reason 'Cutting error'",
        "Pick a replacement length and finish the MO consuming 21.00 m per the BoM",
        "Review the scrap order and the journal entry",
      ],
      expected: "Scrap move WH/Stock → Virtual Locations/Scrap of 2.10 m valued at FIFO 25.00 = 52.50 (Dr scrap/loss, Cr Stock Valuation – oak; verify accounts). Total oak out for the job 23.10 m = 577.50; MO and scrap linked for yield analysis.",
    },
    {
      id: "B-TS-06",
      title: "Cost roll-up check vs actual MO cost",
      steps: [
        "Open the BoM Overview of Kitchen Cabinet 60cm: components 60.20 + operations 46.00 = 106.20 (run-time; note any setup/cleanup loading)",
        "Create an MO for 10 cabinets; expected durations Cutting 10 + 200 + 5 = 215 min, Assembly 450 min, Finishing 15 + 300 + 10 = 325 min",
        "Record actual: oak consumed 18.50 m (warning under Allowed with warning), Cutting 230 min, Assembly 450 min, Finishing 330 min; Mark as Done",
        "Compare expected vs actual cost in the MO cost analysis / overview (verify name) and review the valuation entries",
      ],
      expected: "Actual = components 462.50 + 60.00 + 80.00 + 12.00 = 614.50 plus operations 115.00 + 180.00 + 198.00 = 493.00 → 1,107.50 (110.75 per cabinet). Expected MO cost incl. setup 1,084.50; standard value 10 × 106.20 = 1,062.00. Variance vs standard 45.50 = material 12.50 (0.50 m × 25.00) + Cutting 15.00 + Finishing 18.00. Plus 1 Oak Offcut Bundle at standard 2.00.",
    },
    {
      id: "B-TS-07",
      title: "Kit sale — Cabinet Hardware Pack",
      steps: [
        "Create an SO for North Shore Renovations for 10 Cabinet Hardware Pack from WH",
        "Confirm the SO and open the delivery order",
        "Validate the delivery and invoice",
      ],
      expected: "No MO is created. The delivery shows 40 Cabinet Hinge and 240 Wood Screw 4x30; invoice 10 × 12.00 = 120.00; COGS 40 × 1.50 + 240 × 0.05 = 72.00.",
    },
    {
      id: "B-TS-08",
      title: "Monthly stock count of raw materials",
      steps: [
        "Open Inventory ▸ Operations ▸ Physical Inventory filtered on WH/Stock/Shelf 2",
        "Enter counted quantities, e.g. Wood Screw 4x30 counted 6,900 vs 6,968 system",
        "Apply the adjustment with reference 'Cycle count Shelf 2'",
      ],
      expected: "Screws adjusted by −68; journal entry 68 × 0.05 = 3.40 to the inventory-loss account (AVCO).",
    },
  ],
  customizations: [
    {
      id: "CUS-01",
      title: "Cutting list per manufacturing order (B-REQ-22)",
      spec: `## Functional specification
**Classification:** Customization (custom module with a QWeb report). The standard MO printout (Production Order) and the work-order instructions (PDF/text per operation) were considered: they show components and quantities, but not individual panel *parts* with dimensions. Studio (Enterprise) can edit report layouts but cannot generate a per-part list without a new data model.

### Business need
The CNC operator needs, per MO, every part to cut, multiplied by the MO quantity, with the oak lot to use. Today this is copied by hand from the recipe book.

### Design
| Item | Detail |
|---|---|
| New model | **Cut Part** (one2many on the BoM): part name, length mm, width mm, quantity per unit, material (product), edge-banded edges |
| Report | **Cutting List** button and print menu on the MO |
| Content | MO number, product, quantity, lot of the oak panel reserved on Pick Components, then a table: part, L × W, qty per unit, qty for MO, area m² |
| Totals | Net area for the MO; gross panel reserved (BoM quantity × MO quantity) and resulting yield |

### Example — Kitchen Cabinet 60cm, MO for 10
| Part | L × W (mm) | Qty/unit | Qty MO | Area m² (MO) |
|---|---|---|---|---|
| Side panel | 720 × 560 | 2 | 20 | 8.064 |
| Bottom | 564 × 560 | 1 | 10 | 3.158 |
| Shelf | 562 × 520 | 1 | 10 | 2.922 |
| Top rail | 564 × 100 | 2 | 20 | 1.128 |
| **Net total** | | | | **15.273** |

Gross panel for 10 cabinets = 18.00 m (1.80 × 10) → yield ≈ 15.273 / 18.00 = 84.8%.

### Technical notes
- Module **timbercraft_cutting_list** depending on mrp.
- Parts are maintained by engineering on the BoM; copying a BoM copies its parts.
- Read-only report; no change to stock or costing logic.

### Acceptance
- Report prints for any MO whose BoM has parts; quantities equal qty/unit × MO quantity; lot shown when reserved.`,
    },
    {
      id: "CUS-02",
      title: "Panel-yield % on BoM lines (B-REQ-23)",
      spec: `## Functional specification
**Classification:** Light customization. A display-only field can be added with **Studio** (Enterprise — verify in your training instance); the consistency check and the quarterly review list need a small **custom module** (Community or Enterprise). Standard alternative considered: putting yield in the BoM line note — rejected because it cannot be reported.

### Business need
Engineering wants to see, for each oak line, the net panel area actually in the product and the yield assumed in the BoM quantity, so that yield improvements translate into lower BoM quantities and cost.

### Design
| Field (BoM line) | Type | Example (Kitchen Cabinet 60cm) |
|---|---|---|
| Net area (m²) | decimal | 1.53 |
| Panel yield % | decimal | 85 |
| Gross quantity (computed) | decimal, read-only | 1.53 / 0.85 = 1.80 m |

- Warning on save when the BoM line quantity differs from the computed gross quantity by more than 2%.
- List view **BoM lines with yield** grouped by product for the quarterly review.
- Wardrobe 2-Door 100cm: net 3.57 m², yield 85% → gross 4.20 m (matches the BoM).

### Technical notes
- Module **timbercraft_panel_yield** extending mrp.bom.line; no change to MO consumption (Odoo keeps consuming the BoM quantity).

### Acceptance
- Fields visible on oak lines; computed gross matches the BoM quantity for both products; warning triggers when they diverge.`,
    },
    {
      id: "CUS-03",
      title: "Approval of manufacturing orders above USD 5,000 (B-REQ-24)",
      spec: `## Functional specification
**Classification:** Customization. Odoo 17 has **no standard approval** on manufacturing orders (purchase-order approval exists but applies only to POs). Options:
1. **Studio approval rules** on the MO **Confirm** button (Enterprise — verify in your training instance): no code, approver group = Operations Director, but the threshold condition must be expressible as a domain on a stored field.
2. **Custom module** (Community or Enterprise) when a computed value is needed.

Recommended: option 2, because the MO value must be computed.

### Business need
Large batches tie up oak and booth capacity; the operations director must approve them before materials are reserved.

### Design
| Item | Detail |
|---|---|
| MO value | Quantity to produce × product cost (standard), stored and recomputed on change |
| Threshold | Company setting, default USD 5,000 |
| Rule | Confirm by a user outside group **MO Approver** with value > threshold → blocked with message "MO value above approval limit — request approval" |
| Request | Button **Request Approval** creates an activity for the approver group |
| Approve | **Approve** button (MO Approver only) records approver and date in chatter, then Confirm is allowed |
| MTO | MOs created automatically from SOs are created in draft-approval state if above the limit (verify interaction with procurement in testing) |

### Examples
- MO 25 × Wardrobe 2-Door 100cm = 25 × 214.40 = **5,360.00** → approval required.
- MO 20 × Kitchen Cabinet 60cm = 20 × 106.20 = **2,124.00** → no approval.

### Technical notes
- Module **timbercraft_mo_approval** depending on mrp; override the confirm action; reuse standard activities and chatter.

### Acceptance
- Above limit: planner blocked; approval logged; confirmation succeeds after approval. Below limit: unchanged standard behaviour.`,
    },
  ],
  testCases: [
    { id: "B-TC-01", requirementId: "B-REQ-01", module: "Inventory/Purchase", scenario: "Oak panel bought and stocked in m with lot", preconditions: "Oak Panel 18mm UoM m, tracked by lot, vendor price 25.00", testData: "PO 40 m to Northwoods Hardwood Panels", steps: "Confirm PO, receive with lot OAK-2610-C", expected: "On hand +40.00 m in WH/Stock under lot OAK-2610-C; valuation +1,000.00" },
    { id: "B-TC-02", requirementId: "B-REQ-15", module: "Manufacturing/Costing", scenario: "BoM cost roll-up", preconditions: "Work centers with rates 30/24/36; component costs loaded", testData: "Kitchen Cabinet 60cm BoM", steps: "Open BoM Overview; run Compute Price from BoM", expected: "Components 60.20 + operations 46.00 = 106.20 run-time; if setup/cleanup is loaded per BoM quantity the figure is 128.70 (difference 22.50) — record which behaviour applies (verify in your training instance)" },
    { id: "B-TC-03", requirementId: "B-REQ-03", module: "Sales/Inventory", scenario: "Kit exploded at delivery", preconditions: "Kit BoM on Cabinet Hardware Pack", testData: "SO 10 Cabinet Hardware Pack from WH", steps: "Confirm SO, open delivery", expected: "No MO; delivery lists 40 hinges and 240 screws; invoice 120.00" },
    { id: "B-TC-04", requirementId: "B-REQ-25", module: "Inventory/Accounting", scenario: "Opening stock reconciliation", preconditions: "Opening stock file imported and applied", testData: "Opening stock file", steps: "Compare Inventory Valuation report with the approved cut-over value", expected: "Total 11,718.50 (raw materials/components 9,556.50, finished goods 2,132.00, by-products 30.00); lots OAK-2609-A 160 m, OAK-2609-B 80 m" },
    { id: "B-TC-05", requirementId: "B-REQ-05", module: "Manufacturing", scenario: "Over-consumption warning", preconditions: "Flexible Consumption = Allowed with warning", testData: "MO 10 cabinets, consume 18.50 m oak", steps: "Change consumed oak to 18.50, Mark as Done", expected: "Consumption warning shown; validation possible after confirming; 18.50 m consumed" },
    { id: "B-TC-06", requirementId: "B-REQ-07", module: "Manufacturing", scenario: "Work orders and dependencies", preconditions: "Work Orders enabled; operations on BoM with blocking", testData: "MO 10 cabinets", steps: "Confirm and plan the MO; try to start Spray finish first", expected: "Three work orders, expected 215 / 450 / 325 min; Spray finish blocked until Assemble carcass is done; at completion 1 Oak Offcut Bundle produced" },
    { id: "B-TC-07", requirementId: "B-REQ-08", module: "Manufacturing/Inventory", scenario: "2-step manufacturing and reservation", preconditions: "WH set to Pick components and then manufacture", testData: "MO 5 wardrobes", steps: "Confirm MO; check transfers and component status", expected: "Pick Components transfer from WH/Stock to pre-production created; components reserved; MO state Confirmed, component status Available" },
    { id: "B-TC-08", requirementId: "B-REQ-09", module: "Manufacturing", scenario: "Partial production backorder", preconditions: "Components available", testData: "MO 10 cabinets, produce 6", steps: "Execute B-TS-02", expected: "MO done for 6; backorder MO -002 for 4 with 7.20 m oak, 16 hinges, 4 runners, 96 screws" },
    { id: "B-TC-09", requirementId: "B-REQ-10", module: "Sales/Manufacturing", scenario: "MTO creates linked MO", preconditions: "Routes Manufacture + MTO on cabinet", testData: "SO 3 cabinets for Lakeshore Kitchen Studio", steps: "Execute B-TS-01", expected: "MO for 3 with SO as source; delivery ready after MO done; unit price 224.10" },
    { id: "B-TC-10", requirementId: "B-REQ-11", module: "Inventory/Purchase", scenario: "Reordering rule after MO demand", preconditions: "Rail rule min 10 / max 40; 20 on hand", testData: "MO 25 wardrobes", steps: "Confirm MO, open Replenishment", expected: "Suggested quantity 45; RFQ to Midwest Fastener Supply for 144.00" },
    { id: "B-TC-11", requirementId: "B-REQ-12", module: "Purchase/Manufacturing", scenario: "Subcontracting PO", preconditions: "Subcontracting BoM for SprayPro; 20 unfinished cabinets in stock", testData: "PO 20 cabinets at 22.00", steps: "Execute B-TS-04", expected: "Resupply transfer of 20 unfinished cabinets; receipt of 20 cabinets; vendor bill 440.00; subcontract MO done" },
    { id: "B-TC-12", requirementId: "B-REQ-13", module: "Inventory", scenario: "Lot traceability panel → customer", preconditions: "B-TS-01 done", testData: "Lot OAK-2609-A", steps: "Open Lots/Serial Numbers ▸ OAK-2609-A ▸ Traceability", expected: "Shows consumption in the MO producing KC60-2610-01 and delivery of that lot to Lakeshore Kitchen Studio" },
    { id: "B-TC-13", requirementId: "B-REQ-14", module: "Accounting/Manufacturing", scenario: "Standard cost valuation and variance", preconditions: "Finished Goods category Standard, automated", testData: "B-TS-06 actuals", steps: "Mark MO as Done; review valuation layers and journal entries", expected: "Finished goods valued 1,062.00 (10 × 106.20); components credited 614.50 from raw-material valuation; actual cost 1,107.50 shown in cost analysis; variance 45.50 explained" },
    { id: "B-TC-14", requirementId: "B-REQ-24", module: "Manufacturing", scenario: "MO approval threshold", preconditions: "CUS-03 installed; threshold 5,000", testData: "MO 25 wardrobes (5,360.00); MO 20 cabinets (2,124.00)", steps: "Confirm both as planner; request and grant approval as operations director", expected: "Wardrobe MO blocked until approved, approval in chatter; cabinet MO confirms directly" },
    { id: "B-TC-15", requirementId: "B-REQ-22", module: "Manufacturing", scenario: "Cutting list printed", preconditions: "CUS-01 installed; parts defined on cabinet BoM", testData: "MO 10 cabinets", steps: "Print Cutting List", expected: "Parts with quantities 20/10/10/20, net area 15.273 m², gross 18.00 m, oak lot shown" },
  ],
  acceptanceCriteria: [
    "All Must requirements are implemented and their test cases passed in UAT with sign-off by the production manager and controller",
    "Every active finished product has an approved BoM with operations; BoM Overview costs match the controller's cost sheet (Kitchen Cabinet 60cm 106.20, Wardrobe 2-Door 100cm 214.40)",
    "Opening stock quantity and value match the cut-over count (total 11,718.50) with lots for oak panels and finished cabinets",
    "MTO, make-to-stock (reordering rule) and subcontracting flows run end to end without manual workarounds",
    "Inventory valuation report equals the stock valuation account balances after the test scenarios; MO variances are explained",
    "Oak panel lots are traceable from receipt through MO to the customer delivery",
    "Operators record work-order times and scrap in Odoo for every MO from go-live (no paper job cards)",
    "Customizations are delivered as installable modules or exported Studio customizations with documentation and pass code review",
    "Users trained by role with access rights verified; no open critical or high-severity defects at go/no-go",
  ],
  documentation: [
    "Project charter and plan",
    "AS-IS process document",
    "Requirements register with fit-gap matrix, edition column and MoSCoW priority",
    "TO-BE process document (plan-to-produce, MTO, replenishment, subcontracting, scrap)",
    "Solution Design Document incl. BoM & routing workbook and work-center definitions",
    "Costing policy (categories, cost per hour calculation, standard-cost review, variance treatment)",
    "Functional and technical specifications CUS-01…03",
    "Data migration plan, templates, import logs and reconciliation reports",
    "Test plan, test cases B-TC-01…15 and UAT sign-off",
    "User access matrix",
    "Role-based user guides (planner, operator, storeman, buyer, controller)",
    "Cut-over plan, go-live checklist, hypercare issue log and closure report",
  ],
  rubric: [
    { criterion: "Requirements analysis & fit-gap", weight: 15, excellent: "All requirements correctly classified, Enterprise-only features (Quality, Shop Floor, MPS) flagged, MO approval recognised as non-standard", adequate: "Most requirements classified, minor misclassifications", poor: "Customizations proposed for standard features or edition ignored" },
    { criterion: "BoM, routing & work-center design", weight: 20, excellent: "Correct BoM types (manufacture, kit, subcontracting), by-products, operations with consumed-in-operation and dependencies, realistic work centers", adequate: "BoMs and operations work with minor issues", poor: "Wrong BoM types, batch quantities entered as unit quantities, no operations" },
    { criterion: "Replenishment & inventory configuration", weight: 15, excellent: "2-step manufacturing, MTO, reordering rules and WH2 resupply configured and justified; lots set up", adequate: "Main routes work, some gaps", poor: "Shortages not detected, routes conflicting" },
    { criterion: "Costing & valuation", weight: 15, excellent: "Costing per category justified; roll-up arithmetic correct; MO variance and journal entries reconciled", adequate: "Costs roughly right, variance not explained", poor: "Manual valuation or zero work-center rates" },
    { criterion: "Data migration", weight: 10, excellent: "All templates import cleanly; opening stock reconciled to 11,718.50 with lots", adequate: "Imports done, partial reconciliation", poor: "Import errors or unreconciled stock" },
    { criterion: "Customization specifications", weight: 10, excellent: "Precise specs with standard/Studio alternatives and honest classification", adequate: "Specs present but vague", poor: "No specs or unjustified custom work" },
    { criterion: "Testing", weight: 10, excellent: "Test cases trace to requirements and were executed with evidence (screenshots, journal entries)", adequate: "Most tests executed", poor: "Little or no testing evidence" },
    { criterion: "Documentation & communication", weight: 5, excellent: "Complete, client-ready deliverables", adequate: "Deliverables present with gaps", poor: "Missing key deliverables" },
  ],
};
