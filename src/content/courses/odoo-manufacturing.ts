import type { CourseContent } from "../types";

/**
 * Odoo Manufacturing (MRP) — application training course.
 * Follows the 16-point application training template:
 *  1 overview, 2 business problems, 3 process flow, 4 dependencies, 5 prerequisites & master data,
 *  6 configuration, 7 master data creation, 8 transactions, 9 approvals & automation, 10 reports,
 *  11 accounting/inventory impact, 12 integration, 13 troubleshooting, 14 practical assignments,
 *  15 interview questions, 16 assessment (course `assessment`).
 */
export const odooManufacturing: CourseContent = {
  slug: "odoo-manufacturing",
  section: "odoo-apps",
  title: "Odoo Manufacturing: Bills of Materials, Work Centers, Manufacturing Orders and Costing",
  summary:
    "Learn how Odoo Manufacturing turns components into finished goods: bills of materials, work centers and operations, manufacturing orders and work orders, replenishment with the Manufacture route, subcontracting, production costing and the stock valuation entries behind every MO. Built around the fictional furniture maker Timbercraft Furniture Works.",
  level: "intermediate",
  platform: "odoo",
  odooVersion: "Odoo 17.0 (18.0 differences noted)",
  position: 6,
  skills: [
    "Bills of materials",
    "Work centers & routings",
    "Manufacturing orders",
    "Production costing",
    "Replenishment for manufacturing",
    "Subcontracting",
    "Manufacturing troubleshooting",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      title: "Module 1: Manufacturing Foundations",
      lessons: [
        {
          slug: "manufacturing-overview-and-process-flow",
          title: "Manufacturing Overview, Business Problems and Process Flow",
          durationMin: 40,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard"],
          body: `## 1. Application overview

A manufacturer buys raw materials, transforms them using people and machines, and sells something worth more than the sum of its parts. The **Manufacturing** app (technical name *mrp*) records *what* a product is made of, *where and how long* it takes to make, *when* it must be made and *what it cost*. It sits directly on top of Inventory: a manufacturing order (MO) is, underneath, a set of stock moves that consume components into a virtual **Production** location and bring finished goods back out of it.

Throughout this course we work with our fictional client:

| Attribute | Value |
|---|---|
| Company | Timbercraft Furniture Works |
| Business | Make-to-stock and make-to-order kitchen and bedroom furniture |
| Hero product | Kitchen Cabinet 60cm |
| Key components | Oak Panel 18mm (m²), Cabinet Hinge, Drawer Runner (pair), Wood Screw 4x30 |
| Work centers | Cutting (CNC panel saw), Assembly (two benches), Finishing (spray booth) |
| Warehouse | One warehouse "TC" with a raw-material store and a finished-goods area |
| Currency | USD |
| Pain today | Paper job cards, unknown real cost per cabinet, frequent panel shortages stopping the line |

### Core concepts in one table

| Concept | Meaning in Odoo |
|---|---|
| Bill of Materials (BoM) | The recipe: components and quantities needed to make a given quantity of a product |
| Operation | A step of the BoM (Cut, Assemble, Finish) performed at a work center with a default duration (requires the Work Orders setting) |
| Work center | A machine, line or team with capacity, efficiency, working hours and a cost per hour |
| Manufacturing order (MO) | The document that instructs production of a quantity of a product from a BoM |
| Work order (WO) | One operation of one MO, timed and executed at a work center |
| Production location | Virtual location where components are consumed and finished goods come from |
| Manufacture route | Route on the product telling replenishment to create an MO instead of an RFQ |
| Unbuild order | Reverses production: dismantles a finished product back into components |

## 2. Business problems solved

| Business problem | How Odoo Manufacturing solves it |
|---|---|
| "We don't know what a cabinet really costs." | BoM cost roll-up (Compute Price from BoM) plus work center cost per hour on actual time |
| Line stops because panels ran out | Component availability on the MO, reordering rules and the Replenishment report |
| Paper job cards get lost | Work orders with start/pause/done time tracking (tablet / Shop Floor view in Enterprise) |
| Over-consumption of oak is invisible | Consumption flexibility on the BoM (Allowed / Allowed with warning / Blocked) and scrap records |
| Custom orders built without a trigger | MTO + Manufacture routes create an MO from a confirmed sales order |
| Some steps are outsourced (spray finishing in peak season) | Subcontracting BoMs with resupply and receipt via purchase order |
| Defects found after shipping | Lot/serial tracking on finished goods, Quality checks (Enterprise) |
| Engineering changes made by word of mouth | BoM versions and Engineering Change Orders in PLM (Enterprise) |

## 3. Process flow

The standard **Plan-to-Produce** flow for Timbercraft, using 1-step manufacturing:

\`\`\`visual-flow
{
  "title": "Plan-to-Produce (1-step manufacturing)",
  "caption": "Select a step for details. Done MOs move value: components out of WH/Stock, finished goods back in.",
  "steps": [
    {
      "title": "Demand",
      "icon": "target",
      "detail": "Sales order (MTO), reordering rule, MPS or a manual MO."
    },
    {
      "title": "Manufacturing order",
      "icon": "file",
      "app": "Draft",
      "document": "WH/MO/xxxxx"
    },
    {
      "title": "Confirmed",
      "icon": "check",
      "detail": "Components are reserved where available.",
      "branch": {
        "when": "Components missing",
        "result": "Purchase RFQ (Buy route) or a child MO",
        "tone": "warning"
      }
    },
    {
      "title": "In progress",
      "icon": "factory",
      "detail": "Start the first work order or record production. Work orders: Cutting → Assembly → Finishing; produced and consumed quantities are filled in."
    },
    {
      "title": "To close",
      "icon": "clipboard",
      "detail": "Mark as Done.",
      "branch": {
        "when": "Partial quantity",
        "result": "Backorder MO created",
        "tone": "info"
      }
    },
    {
      "title": "Done",
      "icon": "warehouse",
      "impact": "WH/Stock → Virtual Locations/Production: components (value out). Virtual Locations/Production → WH/Stock: finished goods (value in)."
    },
    {
      "title": "Deliver & invoice",
      "icon": "truck",
      "app": "Inventory → Accounting"
    }
  ]
}
\`\`\`

With **3-step manufacturing** (warehouse setting) the flow gains two internal transfers:

\`\`\`visual-flow
{
  "title": "3-step manufacturing",
  "steps": [
    {
      "title": "WH/Stock",
      "icon": "warehouse"
    },
    {
      "title": "Pick Components → WH/Pre-Production",
      "icon": "package"
    },
    {
      "title": "MO → WH/Post-Production",
      "icon": "factory"
    },
    {
      "title": "Store → WH/Stock",
      "icon": "warehouse"
    }
  ]
}
\`\`\`

(Location names are Odoo defaults; verify in your training instance.)

> **Consultant tip:** In the discovery workshop, walk the shop floor with the production manager. Count the *physical* stops a cabinet makes and the places where somebody would actually record time. Those become your work centers and operations. Do not model eight operations when the client will only ever click "done" once per shift.

## How this course is structured

| Lesson | Template points covered |
|---|---|
| 1. Overview (this lesson) | Overview, business problems, process flow |
| 2. Dependencies and configuration | Dependencies, prerequisites & master data, configuration and settings |
| 3. Master data | Work centers, BoMs, operations, routes, cost roll-up |
| 4. Transactions | MOs, work orders, backorders, scrap, unbuild, subcontracting |
| 5. Automation, reports, costing and integration | Approvals & automation, reports, accounting impact, integration |
| 6. Troubleshooting and interview prep | Errors, practical tasks, interview questions |

## Version note: Odoo 17 vs 18

In **Odoo 17** a manufactured product must normally be a **Storable Product** to have on-hand quantity and valuation. In **Odoo 18** product types become **Goods**, **Service** and **Combo**; a Goods product with **Track Inventory** ticked replaces the storable product. Odoo 18 also changes some MO screens and work-in-progress accounting options — treat any 18-specific screen in this course as "verify in your training instance".

## Key takeaways

- Manufacturing is built on Inventory: an MO is a bundle of stock moves through the virtual Production location.
- The BoM is the recipe; operations and work centers describe how and where it is made.
- Demand reaches manufacturing via sales (MTO), reordering rules, MPS or manual MOs.
- Costing combines component cost and work center time cost.
- Map the physical shop floor first, configure second.`,
          flashcards: [
            { term: "Bill of Materials (BoM)", definition: "The list of components and quantities (and optionally operations and by-products) required to produce a given quantity of a product." },
            { term: "Kit BoM", definition: "A BoM type that is never manufactured: when sold or moved, the kit is exploded into its component moves." },
            { term: "Work center", definition: "A resource (machine, line or team) with capacity, time efficiency, working hours, OEE target and a cost per hour where operations are performed." },
            { term: "Work order", definition: "One operation of a manufacturing order executed at a work center, with expected and real duration." },
            { term: "Production location", definition: "The virtual location into which components are consumed and from which finished products are received on an MO." },
            { term: "Manufacture route", definition: "A product route that makes replenishment create manufacturing orders instead of purchase RFQs." },
            { term: "Unbuild order", definition: "A document that reverses production, consuming a finished product and returning its components to stock." },
            { term: "Consumption flexibility", definition: "BoM setting (Allowed / Allowed with warning / Blocked) that controls whether an MO may consume quantities different from the BoM." },
          ],
          resources: [
            { title: "Odoo 17 Manufacturing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing.html" },
          ],
        },
        {
          slug: "manufacturing-dependencies-and-configuration",
          title: "Dependencies, Prerequisites and Configuration Settings",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## 4. Dependencies on other apps

Manufacturing cannot be installed alone. Installing it installs **Inventory** automatically, because every MO is made of stock moves. Other apps are optional but change what Manufacturing can do.

| App | Dependency | What it adds to manufacturing | Edition |
|---|---|---|---|
| Inventory | **Mandatory** | Products, locations, routes, reservation, stock moves, valuation | Community & Enterprise |
| Purchase | Optional | Buy route for components; subcontracting purchase orders | Community & Enterprise |
| Accounting / Invoicing | Optional (needed for automated valuation entries) | Stock valuation journal entries, cost of production, analytic costs | Community (Invoicing) / Enterprise (full Accounting) |
| Sales | Optional | MTO demand: confirmed sales orders trigger MOs | Community & Enterprise |
| Quality | Optional | Quality control points and checks on operations | Enterprise |
| Maintenance | Optional | Preventive/corrective maintenance of work center equipment | Verify edition in your training instance (the base Maintenance app and its link to manufacturing may be packaged differently) |
| PLM | Optional | Engineering Change Orders, BoM versions and approvals | Enterprise |
| MPS (Master Production Schedule) | Optional | Mid-term demand forecast and production planning grid | Enterprise |
| Shop Floor | Optional | Operator tablet interface for work orders | Enterprise in 17 (verify) |

> **Consultant tip:** Edition matters in the proposal. If Timbercraft needs MPS, PLM or Quality, they need Enterprise. Write the edition next to every requirement in your fit-gap sheet so nobody is surprised at licensing time.

## 5. Prerequisites and master data

Before the first MO can be confirmed you need, in this order:

1. **Company, currency and fiscal settings** (from the Accounting course).
2. **Units of measure** — Timbercraft buys oak in m² and screws in Units; enable Units of Measure in Inventory settings if anything other than Units is used.
3. **Product categories** with costing method and valuation (e.g. Raw Materials – AVCO, Finished Goods – AVCO, both Automated).
4. **Warehouse** with manufacturing steps chosen (1, 2 or 3 steps).
5. **Products**: components (Buy route, vendor on Purchase tab) and finished goods (Manufacture route).
6. **Work centers** (only if Work Orders is enabled).
7. **Bills of materials** with components, operations and consumption rule.
8. **Opening stock** of components and finished goods.
9. **Reordering rules** for critical components and make-to-stock finished goods.

| Master data | Template / source | Owner at client |
|---|---|---|
| Products | /api/templates/products | Production planner + purchasing |
| Product categories | /api/templates/product-categories | Finance |
| Opening stock | /api/templates/opening-stock | Stores supervisor |
| BoMs | Engineering drawings / cutting lists | Production engineer |
| Work centers and rates | Payroll + overhead budget | Finance + production manager |

## 6. Configuration and settings

Go to **Manufacturing ▸ Configuration ▸ Settings**. Labels below are those of Odoo 17; small wording differences may exist (verify in your training instance).

| Setting | What it does | Timbercraft decision |
|---|---|---|
| Work Orders | Enables operations on BoMs, work centers, work orders and time tracking | **On** — they want time per cabinet |
| Work Order Dependencies | Lets operations be blocked until a previous operation is done (configured per BoM) | **On** — Finishing cannot start before Assembly |
| By-Products | Allows BoMs to produce secondary products (e.g. oak offcuts) | **On** — offcuts are sold as firewood bundles |
| Subcontracting | Enables the Subcontracting BoM type and resupply flows | **On** for peak-season spray finishing |
| Unlock / lock of manufacturing orders | Controls whether done quantities can be edited on a done or locked MO (verify exact label) | Leave default; unlock only for supervisors |
| Quality | Quality control points on operations | Enterprise — phase 2 |
| Master Production Schedule | Planning grid by product and period | Enterprise — phase 2 |
| Product Lifecycle Management (PLM) | ECOs and BoM versioning | Enterprise — not in scope |

Inventory settings that matter for manufacturing (**Inventory ▸ Configuration ▸ Settings**):

- **Multi-Step Routes** — required for 2-/3-step manufacturing.
- **Lots & Serial Numbers** — Timbercraft lot-tracks finished cabinets by production batch.
- **Units of Measure** — m² for oak panels.

### Warehouse manufacturing steps

Open **Inventory ▸ Configuration ▸ Warehouses ▸ TC**. With Multi-Step Routes enabled, the warehouse shows a **Manufacture** option:

| Option | Transfers created | When to use |
|---|---|---|
| Manufacture (1 step) | MO only | Components stored at the line; small shops |
| Pick components and then manufacture (2 steps) | Pick Components + MO | Central raw-material store feeding the line |
| Pick components, manufacture and then store products (3 steps) | Pick Components + MO + Store Finished Product | Separate finished-goods warehouse area |

Timbercraft chooses **2 steps**: oak panels live in the raw-material store and a storeman picks them to the line before each MO.

### Product routes

On each finished product, **Inventory tab ▸ Routes**: tick **Manufacture**. For made-to-order cabinets also tick **Replenish on Order (MTO)** (the MTO route is archived by default; unarchive it under Inventory ▸ Configuration ▸ Routes). On components tick **Buy**.

### Security

Manufacturing has User and Administrator access rights (Settings ▸ Users). Give planners User, the production manager Administrator, and operators the minimum they need (on Enterprise, Shop Floor access — verify the right group in your instance).

> **Consultant tip:** Record each setting in a configuration workbook with three columns: *setting*, *value*, *business reason*. When someone asks in six months why By-Products is on, the workbook answers.

## Key takeaways

- Inventory is mandatory; Purchase, Sales and Accounting make manufacturing useful end to end.
- MPS, PLM, Quality and Shop Floor are Enterprise features.
- Work Orders must be enabled before operations and work centers appear.
- Manufacturing steps are a warehouse setting and require Multi-Step Routes.
- Products need the Manufacture route (and optionally MTO) to be replenished by MOs.`,
          resources: [
            { title: "Odoo 17 Manufacturing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing.html" },
            { title: "Product categories import template", kind: "template", url: "/api/templates/product-categories" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 2: Master Data and Production Transactions",
      lessons: [
        {
          slug: "manufacturing-master-data",
          title: "Master Data: Work Centers, Bills of Materials and Cost Roll-Up",
          durationMin: 50,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration"],
          body: `## 7. Master data creation

Create master data in dependency order: categories ▸ products ▸ work centers ▸ BoMs. A BoM cannot reference a work center that does not exist, and Compute Price from BoM is meaningless until component costs are filled.

### 7.1 Products

Use the products template (/api/templates/products) to load Timbercraft's items.

| Internal reference | Product | Type (17) | UoM | Category | Routes | Cost |
|---|---|---|---|---|---|---|
| RM-OAK18 | Oak Panel 18mm | Storable | m² | Raw Materials (AVCO) | Buy | 25.00 / m² |
| RM-HNG | Cabinet Hinge | Storable | Units | Raw Materials (AVCO) | Buy | 1.50 |
| RM-RUN | Drawer Runner (pair) | Storable | Units | Raw Materials (AVCO) | Buy | 8.00 |
| RM-SCR | Wood Screw 4x30 | Storable | Units | Raw Materials (AVCO) | Buy | 0.05 |
| FG-KC60 | Kitchen Cabinet 60cm | Storable | Units | Finished Goods (AVCO) | Manufacture (+ MTO) | from BoM |
| BP-OFF | Oak Offcut Bundle | Storable | Units | By-products (AVCO) | — | 2.00 |

In Odoo 18 choose **Goods** and tick **Track Inventory** instead of Storable.

### 7.2 Work centers

Go to **Manufacturing ▸ Configuration ▸ Work Centers ▸ New** (visible only when Work Orders is enabled).

| Field | Cutting | Assembly | Finishing |
|---|---|---|---|
| Capacity | 1 | 2 | 1 |
| Time Efficiency | 100% | 100% | 100% |
| OEE Target | 85% | 90% | 85% |
| Setup Time (min) | 0 | 0 | 0 |
| Cleanup Time (min) | 0 | 0 | 0 |
| Cost per hour | 30.00 | 24.00 | 36.00 |
| Working Hours | Standard 40 hours/week | Standard 40 hours/week | Standard 40 hours/week |
| Alternative Workcenters | — | — | — |

Field meanings:

- **Capacity** — how many units the work center can process in parallel; Assembly has two benches.
- **Time Efficiency** — a factor applied to expected durations; 50% means operations take twice as long as the BoM default.
- **OEE Target** — the Overall Equipment Effectiveness goal used in OEE reporting.
- **Setup / Cleanup Time** — fixed minutes added before and after each work order (we keep them 0 so the cost example below stays simple; how they enter the cost roll-up should be verified in your training instance).
- **Cost per hour** — labour plus machine overhead rate; drives production cost when work orders are used.
- **Alternative Workcenters** — where the planner may move work when this center is overloaded.

> **Consultant tip:** Cost per hour is a finance decision, not an IT decision. Ask the controller for a fully loaded rate (wages + benefits + depreciation + energy) per work center, and document the calculation. Bad rates silently corrupt every product cost.

### 7.3 Bill of materials

Go to **Manufacturing ▸ Products ▸ Bills of Materials ▸ New**.

1. **Product**: Kitchen Cabinet 60cm. **Quantity**: 1 Units.
2. **BoM Type**: *Manufacture this product* (alternatives: *Kit*, *Subcontracting*).
3. **Components tab**:

| Component | Quantity | UoM |
|---|---|---|
| Oak Panel 18mm | 1.80 | m² |
| Cabinet Hinge | 4 | Units |
| Drawer Runner (pair) | 1 | Units |
| Wood Screw 4x30 | 24 | Units |

4. **Operations tab** (requires Work Orders):

| Operation | Work center | Default duration (min) |
|---|---|---|
| Cut panels | Cutting | 20 |
| Assemble carcass | Assembly | 45 |
| Spray finish | Finishing | 30 |

5. **By-products tab**: Oak Offcut Bundle, quantity 0.1 per cabinet (one bundle per 10 cabinets).
6. **Miscellaneous tab**: **Flexible Consumption** = *Allowed with warning* (operators may use extra oak for a damaged panel, but get warned); **Operation dependencies** if required (verify field location).

### BoM types compared

| Type | Creates MO? | Typical use |
|---|---|---|
| Manufacture this product | Yes | Anything produced in-house |
| Kit | No — exploded into components at delivery/transfer | "Cabinet hardware pack" sold as one line but picked as hinges + screws |
| Subcontracting | Yes, but executed at the subcontractor via a PO receipt | Outsourced spray finishing |

### Variants

If Timbercraft sells the cabinet in Oak and Walnut finishes as **product variants**, one BoM can serve all variants. Each BoM line has an **Apply on Variants** field so that "Oak Panel 18mm" applies only to the Oak variant and "Walnut Panel 18mm" only to the Walnut variant. Requires the Variants setting in Sales/Inventory.

### 7.4 Worked cost roll-up

On the product form of Kitchen Cabinet 60cm, use **Compute Price from BoM** (action on the product; the BoM Overview / Structure & Cost report shows the same breakdown — verify exact button label).

**Components (per 1 cabinet)**

| Component | Qty | Unit cost | Line cost |
|---|---|---|---|
| Oak Panel 18mm | 1.80 m² | 25.00 | 45.00 |
| Cabinet Hinge | 4 | 1.50 | 6.00 |
| Drawer Runner (pair) | 1 | 8.00 | 8.00 |
| Wood Screw 4x30 | 24 | 0.05 | 1.20 |
| **Components total** | | | **60.20** |

**Operations (per 1 cabinet)**

| Operation | Minutes | Rate / hour | Cost |
|---|---|---|---|
| Cut panels | 20 | 30.00 | 10.00 |
| Assemble carcass | 45 | 24.00 | 18.00 |
| Spray finish | 30 | 36.00 | 18.00 |
| **Operations total** | 95 | | **46.00** |

**Cost of one Kitchen Cabinet 60cm = 60.20 + 46.00 = 106.20**

Check: 20/60 × 30 = 10.00; 45/60 × 24 = 18.00; 30/60 × 36 = 18.00. By-product cost share is 0% here, so the full cost stays on the cabinet (if you assign a cost share % to a by-product, that share of the MO cost moves to the by-product — verify behaviour in your instance).

## Key takeaways

- Create categories, products, work centers, then BoMs.
- Work center cost per hour must come from finance.
- BoM type decides whether an MO exists at all (Kit never produces).
- Consumption flexibility and by-products are BoM-level decisions.
- Always prove the cost roll-up by hand before go-live.`,
          resources: [
            { title: "Products import template", kind: "template", url: "/api/templates/products" },
            { title: "Product categories import template", kind: "template", url: "/api/templates/product-categories" },
            { title: "Odoo 17 Manufacturing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing.html" },
          ],
        },
        {
          slug: "manufacturing-transactions",
          title: "Transactions: Manufacturing Orders, Work Orders, Scrap, Unbuild and Subcontracting",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise"],
          body: `## 8. Transaction processing

All walkthroughs use Timbercraft data from Lesson 3 and assume opening stock of 30 m² Oak Panel, 100 hinges, 20 runner pairs and 1,000 screws (load with /api/templates/opening-stock).

### 8.1 Manufacturing order lifecycle

| State | Meaning | Typical action |
|---|---|---|
| Draft | Created, not yet planned | Check BoM, quantity, scheduled date |
| Confirmed | Components requested/reserved; work orders created | Check component availability |
| In Progress | Production started (a work order started or quantity recorded) | Operators work |
| To Close | All quantities recorded, waiting for closure | Mark as Done |
| Done | Stock moves validated; valuation posted | Review cost |
| Cancelled | Abandoned | — |

### 8.2 Walkthrough: make 10 cabinets

1. **Manufacturing ▸ Operations ▸ Manufacturing Orders ▸ New**.
2. Product: Kitchen Cabinet 60cm. Odoo proposes the BoM. Quantity: **10**. Set the scheduled date.
3. The components tab fills automatically: 18 m² oak, 40 hinges, 10 runner pairs, 240 screws. The work orders tab shows Cut, Assemble, Finish with expected durations of 200, 450 and 300 minutes.
4. Click **Confirm**. Odoo reserves components (component status shows available / not available). With 2-step manufacturing, a **Pick Components** transfer is also created — the storeman validates it first.
5. If a component is short, use **Check availability** after stock arrives, or let the Replenishment report / reordering rules buy it.
6. **Work orders**: open the Work Orders tab (or, in Enterprise, the Shop Floor app / tablet view). Press **Start** on "Cut panels"; the timer runs. Press **Done** when finished. Repeat for Assemble and Finish. With Work Order Dependencies, Finish stays blocked until Assemble is done.
7. Enter the **quantity produced** (10) and confirm consumed quantities. If the operator used 18.5 m² oak because of a damaged sheet, change the consumed quantity; under *Allowed with warning* Odoo shows a warning before validating.
8. If the finished product is lot-tracked, enter the lot (e.g. KC60-2024-0412).
9. Click **Mark as Done** (or **Produce All** then Mark as Done — button labels vary; verify). State becomes Done.

### 8.3 Partial production and backorders

If only 6 cabinets are finished today, set quantity produced to 6 and Mark as Done. Odoo asks whether to **create a backorder**. Choosing yes closes the original MO for 6 and creates a new MO (suffix -002) for the remaining 4, carrying remaining components. Choosing *No Backorder* closes the MO at 6 and releases the rest.

### 8.4 Scrap during production

A spray defect ruins one carcass. From the MO click **Scrap**, choose the product (finished cabinet or a component), quantity and scrap location. The scrap is a stock move to Virtual Locations/Scrap and is valued at cost. Scraps are also listed under Manufacturing ▸ Operations (verify menu) and Inventory scrap reporting.

### 8.5 Unbuild orders

A customer returns a cabinet that is reused for parts. **Manufacturing ▸ Operations ▸ Unbuild Orders ▸ New**: product, BoM, quantity 1, lot if tracked, **Unbuild**. Odoo consumes the finished cabinet and returns components per the BoM to stock. (Consumables such as screws come back on paper too — adjust with a scrap if they are physically lost.)

### 8.6 Make-to-order flow

1. Sales confirms SO for 3 Kitchen Cabinets 60cm, product routes Manufacture + MTO.
2. Odoo creates an MO for 3 linked to the SO (source document shows the SO number).
3. When the MO is done, the delivery order becomes ready.

### 8.7 Subcontracting walkthrough

Peak season: SprayPro Finishing (fictional subcontractor) finishes cabinets.

1. Enable **Subcontracting** in Manufacturing settings.
2. Create a BoM of type **Subcontracting** for Kitchen Cabinet 60cm, subcontractor SprayPro Finishing, components = unfinished carcass + lacquer.
3. Add SprayPro as vendor on the cabinet with the subcontracting price (service fee per cabinet).
4. Create a **purchase order** to SprayPro for 20 cabinets. On confirmation Odoo creates a receipt and an underlying subcontracting MO; if components must be sent, a **resupply** transfer to the subcontractor location is created (via the Resupply Subcontractor route on components).
5. When finished cabinets arrive, validate the **receipt**; Odoo records component consumption at the subcontractor and the finished goods entering stock.
6. The vendor bill is for the service fee only; the cabinet value = components sent + subcontracting fee.

> **Consultant tip:** Always demo partial production, scrap and backorders in the user acceptance test. Users rarely produce exactly the planned quantity, and those edge cases are where trust in the system is won or lost.

## Key takeaways

- Draft ▸ Confirmed ▸ In Progress ▸ To Close ▸ Done is the MO lifecycle.
- Work orders capture real time per operation; that time drives cost.
- Partial production creates a backorder MO; scrap and unbuild have dedicated documents.
- MTO links an SO to an MO; subcontracting links a PO to an MO.`,
          resources: [
            { title: "Opening stock import template", kind: "template", url: "/api/templates/opening-stock" },
            { title: "Odoo 17 Manufacturing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing.html" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 3: Automation, Reporting, Costing and Integration",
      lessons: [
        {
          slug: "manufacturing-automation-reports-costing",
          title: "Approvals, Automation, Reports, Accounting Impact and Integration",
          durationMin: 55,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "enterprise", "customization"],
          body: `## 9. Approval rules and automation

### Approvals

Standard Manufacturing has **no approval workflow on MOs**: any user with Manufacturing rights can confirm and close an MO. Approval-like controls available:

| Need | Standard / Enterprise option | Classification |
|---|---|---|
| Only supervisors may edit done quantities | Lock/unlock MO behaviour + access rights | Standard configuration |
| Block over-consumption | Flexible Consumption = Blocked on the BoM | Standard configuration |
| Inspection before finishing | Quality control points on an operation | Enterprise (Quality) |
| BoM changes approved by engineering | ECO stages with approvers | Enterprise (PLM) |
| Manager approves MOs above 50 units | Not standard — Studio / automation rule or custom module | Customization |

### Automation

| Mechanism | Trigger | Result |
|---|---|---|
| Reordering rule on finished good (Manufacture route) | Forecast below minimum | Draft/confirmed MO proposed |
| Reordering rule on component (Buy route) | Forecast below minimum | RFQ to vendor |
| MTO + Manufacture | SO confirmed | MO linked to SO |
| Multi-level BoM | Component is itself manufactured with MTO | Child MO created |
| Replenishment report | Planner opens Inventory ▸ Operations ▸ Replenishment | Order Once / Automate buttons |
| MPS | Planner launches replenishment from the grid | MOs/RFQs per period (Enterprise) |

Worked reordering example: cabinet rule min 20 / max 50 / multiple 10, forecast 14. Quantity to reach max = 50 − 14 = 36, rounded up to a multiple of 10 = **40**, so Odoo proposes an MO for 40 cabinets.

## 10. Reports and dashboards

Menu names below are Odoo 17 defaults; edition-specific items should be verified.

| Report | Where | Use |
|---|---|---|
| Manufacturing Orders analysis | Manufacturing ▸ Reporting | Volumes by product, state, period |
| Work Orders analysis | Manufacturing ▸ Reporting | Expected vs real duration per work center |
| Overall Equipment Effectiveness | Manufacturing ▸ Reporting (verify) | Productive vs blocked time, OEE vs target |
| Work center load | Work center Kanban / planning views (verify) | Capacity planning |
| BoM Overview (Structure & Cost) | Button on BoM | Expected cost and availability tree |
| MO cost analysis / Production analysis | From the MO overview or Reporting (verify name and edition) | Expected vs actual cost per MO |
| Stock valuation | Inventory ▸ Reporting ▸ Valuation | Value of raw materials and finished goods |

OEE is often explained as Availability × Performance × Quality; in Odoo, OEE reporting is based on productivity time losses recorded on work centers (verify calculation details).

## 11. Accounting and inventory impact

Assume Raw Materials and Finished Goods categories are AVCO with **Automated** valuation, and the MO for 10 cabinets runs exactly at expected times.

**Inventory impact**

| Move | From | To | Quantity |
|---|---|---|---|
| Components | WH/Stock (or Pre-Production) | Virtual Locations/Production | 18 m², 40 hinges, 10 runners, 240 screws |
| Finished goods | Virtual Locations/Production | WH/Stock (or Post-Production) | 10 cabinets |

**Value calculation**

| Element | Calculation | Amount |
|---|---|---|
| Components | 10 × 60.20 | 602.00 |
| Cutting | 200 min × 30.00 / 60 | 100.00 |
| Assembly | 450 min × 24.00 / 60 | 180.00 |
| Finishing | 300 min × 36.00 / 60 | 180.00 |
| **Finished goods value** | 602.00 + 460.00 | **1,062.00** (106.20 per cabinet) |

Under AVCO/FIFO the finished goods are valued at *actual* consumption and *actual* work order time; if Assembly had taken 500 minutes, the value would rise by 50 × 24.00 / 60 = 20.00. Under Standard costing the finished goods enter at the standard price instead (verify how differences are posted in your training instance).

**Journal entry 1 — component consumption**

| Account | Debit | Credit |
|---|---|---|
| Production counterpart account (WIP / cost of production) | 602.00 | |
| Stock Valuation – Raw Materials | | 602.00 |

**Journal entry 2 — finished goods receipt**

| Account | Debit | Credit |
|---|---|---|
| Stock Valuation – Finished Goods | 1,062.00 | |
| Production counterpart account (WIP / cost of production) | | 1,062.00 |

Net on the production counterpart: 602.00 debit − 1,062.00 credit = **460.00 credit**, which is the labour and overhead absorbed into inventory. It offsets the real payroll and overhead expenses booked by Accounting.

"Production counterpart account" means the valuation account set on the **Production** virtual location if one is configured, otherwise the category's stock input/output accounts are used — confirm the exact fallback in your training instance. In Odoo 18, additional work-in-progress accounting options exist (verify).

**Scrap**: Dr Scrap/loss expense (scrap location valuation account or category default — verify), Cr Stock Valuation, at cost.

**Subcontracting**: receipt values the cabinet at components sent + subcontracting price; the vendor bill clears the interim account for the fee.

> **Consultant tip:** Before go-live, run one MO in a test database and reconcile: Valuation report movement for finished goods = journal entry 2. If the numbers differ, check category valuation (Manual vs Automated) and the Production location accounts before anything else.

## 12. Integration with other apps

| App | Integration point |
|---|---|
| Sales | MTO MOs; delivery lead times include manufacturing lead time |
| Purchase | Component RFQs from reordering rules; subcontracting POs |
| Inventory | Reservation, pick components, store finished goods, lots/serials, scrap |
| Accounting | Automated valuation entries; analytic distribution on work centers (verify) |
| Quality (Enterprise) | Quality checks on operations; quality alerts |
| Maintenance | Equipment on work centers, preventive maintenance requests (verify edition) |
| PLM (Enterprise) | ECOs create new BoM versions applied to future MOs |
| MPS (Enterprise) | Demand forecast drives MO and RFQ creation |

## Key takeaways

- Manufacturing has no native MO approval; controls are BoM rules, rights, Quality and PLM.
- Reordering rules and MTO automate MO creation.
- Finished goods value = components + work center time × cost per hour.
- The production counterpart account nets to absorbed labour/overhead.`,
          resources: [
            { title: "Odoo 17 Manufacturing documentation", kind: "link", url: "https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing.html" },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------------ */
    {
      title: "Module 4: Troubleshooting and Interview Preparation",
      lessons: [
        {
          slug: "manufacturing-troubleshooting-and-interview",
          title: "Troubleshooting, Practical Assignments and Interview Questions",
          durationMin: 45,
          odooVersions: "Odoo 17.0 / 18.0",
          scope: ["standard", "configuration", "customization"],
          body: `## 13. Common errors and troubleshooting

| Symptom / error | Likely cause | Fix |
|---|---|---|
| Operations tab missing on BoM | Work Orders setting disabled | Enable Work Orders in Manufacturing settings |
| Reordering rule creates RFQ instead of MO | Product has Buy route (or Buy has priority) and not Manufacture | Set Manufacture route; remove Buy or set route on the rule |
| MO not created from sales order | MTO route missing/archived, or no Manufacture route | Unarchive MTO; tick MTO + Manufacture on product |
| Components "Not Available" though stock exists | Stock in a location outside the MO source (e.g. raw-material store with 2-step not picked) | Validate Pick Components; check locations and reservations |
| Cannot validate MO: consumption error | Flexible Consumption = Blocked and consumed qty differs | Correct quantities or change BoM rule (with approval) |
| Product cost 0 on finished goods | Compute Price from BoM never run; component costs 0 | Fill component costs; compute price; for Standard, revalue |
| Finished goods cost lacks labour | No work orders used / cost per hour 0 | Enable Work Orders; set cost per hour; record times |
| No journal entries after MO | Category valuation Manual or product not storable | Set Automated valuation (future moves only) |
| Lot required error on Mark as Done | Finished product tracked by lot/serial | Enter lot/serial before validating |
| Cannot edit done MO | MO locked | Unlock (supervisor) or correct via unbuild/adjustment |

## 14. Practical assignments (task list)

- [ ] Enable Work Orders, Work Order Dependencies, By-Products and Subcontracting.
- [ ] Enable Multi-Step Routes and set warehouse TC to 2-step manufacturing.
- [ ] Create categories and products for Timbercraft with the templates.
- [ ] Create work centers Cutting, Assembly, Finishing with the given rates.
- [ ] Create the Kitchen Cabinet 60cm BoM with components, operations and a by-product.
- [ ] Compute Price from BoM and confirm 106.20.
- [ ] Load opening stock and process an MO for 10 cabinets with work orders.
- [ ] Produce 6, create a backorder for 4, scrap 1 cabinet.
- [ ] Unbuild 1 cabinet.
- [ ] Create a reordering rule min 20 / max 50 / multiple 10 and verify the proposed MO quantity.
- [ ] Reconcile the MO journal entries to the valuation report.

## 15. Interview questions with model answers

**Q1. What is the difference between a Kit BoM and a Manufacture BoM?**
*Model answer:* A Manufacture BoM is produced through an MO and creates a finished product in stock. A Kit is never manufactured — it is exploded into component moves when delivered or transferred, so no kit stock exists.

**Q2. Why must Inventory be installed with Manufacturing?**
*Model answer:* MOs are stock moves from stock to the Production location (components) and back (finished goods); reservation, routes and valuation all come from Inventory.

**Q3. How is the cost of a manufactured product calculated?**
*Model answer:* Components cost per BoM plus operation time × work center cost per hour. Compute Price from BoM updates product cost; on a real MO under AVCO/FIFO actual consumption and actual time determine the finished goods value.

**Q4. What is consumption flexibility?**
*Model answer:* A BoM setting controlling whether MOs can consume quantities different from the BoM: Allowed, Allowed with warning, or Blocked.

**Q5. How does a sales order trigger production?**
*Model answer:* With MTO + Manufacture routes on the product, confirming the SO creates an MO linked to it; alternatively reordering rules create MOs when forecast drops below minimum.

**Q6. Explain 3-step manufacturing.**
*Model answer:* Pick components to pre-production, manufacture, then store finished products back to stock — three documents, used when stores and the line are physically separate.

**Q7. What happens on partial production?**
*Model answer:* Marking done with a lower quantity offers a backorder MO for the remaining quantity, or closing without backorder.

**Q8. How does subcontracting work in Odoo?**
*Model answer:* A Subcontracting BoM names the subcontractor; a PO for the finished product creates a receipt and hidden MO; components can be resupplied; receipt validation consumes components and receives finished goods; the bill covers the service fee.

**Q9. A client wants manager approval for MOs above 50 units. Standard?**
*Model answer:* No. Options are Studio/automation rules (Enterprise) or a custom module; I would log it as customization and estimate it.

**Q10. Which features need Enterprise?**
*Model answer:* MPS, PLM, Quality and Shop Floor (and some reporting); BoMs, work centers, MOs, subcontracting and unbuild are standard.

> **Consultant tip:** Answer with *business reason + Odoo mechanism + example*: "Timbercraft uses 2-step manufacturing because oak is stored centrally; Odoo creates a Pick Components transfer before each MO…"

## Key takeaways

- Most manufacturing issues are routes, settings or valuation configuration.
- Practise partial production, scrap and unbuild, not only the happy path.
- Interview answers should combine business context, configuration and numbers.`,
        },
      ],
    },
  ],
  assessment: {
    slug: "odoo-manufacturing-final",
    title: "Odoo Manufacturing — Final Assessment",
    passMark: 70,
    questions: [
      {
        prompt: "Which app is automatically installed with Manufacturing because it is a mandatory dependency?",
        kind: "single",
        options: ["Purchase", "Inventory", "Quality", "Sales"],
        correct: [1],
        explanation: "Manufacturing orders are made of stock moves, so Inventory is mandatory. The others are optional integrations.",
      },
      {
        prompt: "Which setting must be enabled before operations and work centers can be used on a BoM?",
        kind: "single",
        options: ["By-Products", "Work Orders", "Subcontracting", "Multi-Step Routes"],
        correct: [1],
        explanation: "Work Orders (Manufacturing ▸ Configuration ▸ Settings) enables operations, work centers and work order time tracking.",
      },
      {
        prompt: "Which are valid BoM types in Odoo 17? (Select all that apply)",
        kind: "multiple",
        options: ["Manufacture this product", "Kit", "Subcontracting", "Dropship"],
        correct: [0, 1, 2],
        explanation: "BoM types are Manufacture this product, Kit and Subcontracting. Dropship is a route, not a BoM type.",
      },
      {
        prompt: "A Kit BoM creates a manufacturing order when the kit is sold.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [1],
        explanation: "Kits are never manufactured; they are exploded into component moves on delivery or transfer.",
      },
      {
        prompt: "Components cost 60.20 per cabinet. Operations are 20 min at 30.00/h, 45 min at 24.00/h and 30 min at 36.00/h. What is the BoM cost?",
        kind: "single",
        options: ["96.20", "106.20", "112.40", "150.20"],
        correct: [1],
        explanation: "Operations = 10.00 + 18.00 + 18.00 = 46.00; 60.20 + 46.00 = 106.20.",
      },
      {
        prompt: "What is the correct order of MO states in Odoo 17?",
        kind: "single",
        options: [
          "Draft ▸ Confirmed ▸ In Progress ▸ To Close ▸ Done",
          "Draft ▸ Ready ▸ Waiting ▸ Done",
          "New ▸ Approved ▸ Produced ▸ Posted",
          "Confirmed ▸ Draft ▸ Done ▸ To Close",
        ],
        correct: [0],
        explanation: "An MO moves Draft ▸ Confirmed ▸ In Progress ▸ To Close ▸ Done (or Cancelled).",
      },
      {
        prompt: "An MO for 10 units is marked done with 6 produced and the user accepts the backorder. What happens?",
        kind: "single",
        options: [
          "The MO stays In Progress for 4",
          "The MO is closed for 6 and a new MO for 4 is created",
          "The 4 units are scrapped",
          "Odoo raises a blocking error",
        ],
        correct: [1],
        explanation: "Partial production with backorder closes the original MO for the produced quantity and creates a backorder MO for the remainder.",
      },
      {
        prompt: "Which features require Odoo Enterprise? (Select all that apply)",
        kind: "multiple",
        options: ["Master Production Schedule", "PLM (Engineering Change Orders)", "Unbuild orders", "Quality control points"],
        correct: [0, 1, 3],
        explanation: "MPS, PLM and Quality are Enterprise; unbuild orders are standard Manufacturing.",
      },
      {
        prompt: "A cabinet reordering rule has Min 20, Max 50, Multiple 10 and the forecast is 14. What MO quantity is proposed?",
        kind: "single",
        options: ["6", "36", "40", "50"],
        correct: [2],
        explanation: "50 − 14 = 36, rounded up to a multiple of 10 = 40.",
      },
      {
        prompt: "Under automated valuation, what does consumption of components on an MO post?",
        kind: "single",
        options: [
          "Debit Stock Valuation, credit Accounts Payable",
          "Debit production counterpart (WIP/cost of production), credit Stock Valuation",
          "Debit COGS, credit Sales",
          "No entry until the finished goods are invoiced",
        ],
        correct: [1],
        explanation: "Components leave stock for the virtual Production location: Stock Valuation is credited and the production counterpart account is debited.",
      },
      {
        prompt: "With Flexible Consumption set to Blocked, an operator cannot validate an MO whose consumed quantities differ from the BoM.",
        kind: "truefalse",
        options: ["True", "False"],
        correct: [0],
        explanation: "Blocked prevents validation when consumption differs from the BoM; Allowed with warning only warns.",
      },
      {
        prompt: "A sales order confirmation did not create an MO for a manufactured product. What are likely causes? (Select all that apply)",
        kind: "multiple",
        options: [
          "The MTO route is archived or not set on the product",
          "The Manufacture route is not set on the product",
          "The customer has no email address",
          "There is no BoM of type Manufacture for the product",
        ],
        correct: [0, 1, 3],
        explanation: "MO creation from an SO needs MTO + Manufacture routes and a valid BoM; the customer's email is irrelevant.",
      },
    ],
  },
  assignments: [
    {
      slug: "odoo-manufacturing-assignment-1",
      title: "Configure Timbercraft's Manufacturing Master Data",
      instructions: `## Brief

Timbercraft Furniture Works is going live on Odoo 17 Manufacturing. Configure the settings and master data needed to produce the Kitchen Cabinet 60cm.

## Tasks

1. Enable Work Orders, Work Order Dependencies, By-Products and Subcontracting; enable Multi-Step Routes, Units of Measure and Lots & Serial Numbers in Inventory.
2. Set warehouse TC to 2-step manufacturing.
3. Create product categories (Raw Materials, Finished Goods, By-products — AVCO, Automated) using /api/templates/product-categories.
4. Create components and the finished product using /api/templates/products with correct UoM and routes.
5. Create work centers Cutting (30.00/h), Assembly (24.00/h, capacity 2) and Finishing (36.00/h).
6. Create the BoM with four components, three operations, the offcut by-product and Flexible Consumption = Allowed with warning.
7. Run Compute Price from BoM and show the hand calculation.

## Deliverables

- Configuration workbook (setting, value, business reason).
- Screenshots of the BoM (components, operations, by-products) and work centers.
- Cost roll-up table proving the product cost of 106.20.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| Settings and warehouse match the brief | 20% |
| Products, categories and work centers correct | 25% |
| BoM complete and correctly structured | 25% |
| Cost roll-up correct and explained | 20% |
| Workbook clarity and business justification | 10% |`,
    },
    {
      slug: "odoo-manufacturing-assignment-2",
      title: "Run Production End to End and Reconcile Costs",
      instructions: `## Brief

Process Timbercraft's production cycle and prove that manufacturing, inventory and accounting agree.

## Tasks

1. Load opening stock with /api/templates/opening-stock.
2. Create an MO for 10 cabinets; pick components; run all work orders with time tracking.
3. Produce 6, create a backorder for 4, then complete the backorder.
4. Scrap 1 cabinet with a spray defect; unbuild 1 returned cabinet.
5. Create a reordering rule (min 20 / max 50 / multiple 10) and an MTO sales order for 3 cabinets; show the resulting MOs.
6. Process a subcontracting PO for 5 cabinets with SprayPro Finishing (fictional).

## Deliverables

- Table of every journal entry created (reference, accounts, debit, credit) with an explanation.
- Calculation of finished goods value per MO (components + work center cost).
- One-page reconciliation of the Valuation report vs the general ledger stock accounts.

## Evaluation criteria

| Criterion | Weight |
|---|---|
| All transactions processed correctly | 30% |
| Journal entries correctly identified and explained | 30% |
| Cost calculations correct | 20% |
| Reconciliation balances (or differences explained) | 10% |
| Professional presentation | 10% |`,
    },
  ],
};
