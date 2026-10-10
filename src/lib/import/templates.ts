/**
 * Odoo import template definitions used by the Data Migration & Import Lab.
 *
 * Column headers use Odoo technical field names, which Odoo's import screen maps
 * automatically. Relational columns ending in "/id" are matched by External ID;
 * relational columns without the suffix are matched by display name.
 *
 * Field names target Odoo 17.0. Version differences are listed in `versionNotes`.
 */

export type FieldType =
  | "externalId"
  | "string"
  | "boolean"
  | "integer"
  | "decimal"
  | "email"
  | "selection"
  | "barcode"
  /** Relational column matched by External ID ("…/id"). */
  | "refId"
  /** Relational column matched by display name against reference data. */
  | "refName";

export interface TemplateField {
  column: string;
  label: string;
  type: FieldType;
  required: boolean;
  description: string;
  example: string;
  /** Allowed technical values for selection fields. */
  options?: string[];
  /** For refId: the template whose External IDs this column points to. */
  refTemplate?: TemplateKey;
  /** refId may point at a row earlier in the same file (e.g. parent category). */
  selfReference?: boolean;
  /** For refName: key into REFERENCE_DATA. */
  refData?: keyof typeof REFERENCE_DATA;
  /** Values must be unique within the file. "error" blocks import; "warning" flags possible duplicates. */
  unique?: "error" | "warning";
  maxLength?: number;
}

export type TemplateKey = "product-categories" | "customers" | "vendors" | "products" | "opening-stock";

export interface ImportTemplate {
  key: TemplateKey;
  title: string;
  odooModel: string;
  /** Where the trainee performs the real import in Odoo. */
  odooImportPath: string;
  order: number;
  dependsOn: TemplateKey[];
  purpose: string;
  versionNotes: string[];
  fields: TemplateField[];
  sampleRows: Record<string, string>[];
  procedure: string[];
  validationChecklist: string[];
  commonErrors: { error: string; cause: string; fix: string }[];
  reconciliation: string[];
}

/**
 * Reference data that exists in a freshly created Odoo 17 database (with a
 * localization installed) and that name-matched columns must resolve to.
 * The simulator uses these lists; real databases may contain more values.
 */
export const REFERENCE_DATA = {
  countries: [
    "United States", "Canada", "Mexico", "United Kingdom", "Ireland", "Germany", "France", "Netherlands", "Belgium",
    "Spain", "Italy", "Switzerland", "India", "United Arab Emirates", "Saudi Arabia", "Singapore", "Australia",
    "New Zealand", "South Africa", "Japan", "China", "Brazil",
  ],
  paymentTerms: [
    "Immediate Payment", "15 Days", "21 Days", "30 Days", "45 Days", "End of Following Month",
    "10 Days after End of Next Month", "30% Now, Balance 60 Days", "2/7 Net 30",
  ],
  uom: ["Units", "Dozens", "kg", "g", "t", "L", "m", "cm", "Hours", "Days"],
  locations: ["WH/Stock", "WH2/Stock", "WH/Stock/Shelf 1", "WH/Stock/Shelf 2"],
} as const;

/**
 * External IDs that exist in every Odoo database because standard modules create
 * them (module.xml_id). The simulator treats these as already imported.
 */
export const STANDARD_EXTERNAL_IDS: Partial<Record<TemplateKey, string[]>> = {
  "product-categories": ["product.product_category_all", "product.product_category_1", "product.cat_expense"],
};

const partnerFields =(kind: "customer" | "vendor"): TemplateField[] => [
  {
    column: "id",
    label: "External ID",
    type: "externalId",
    required: true,
    unique: "error",
    description:
      "Stable unique key for the record (e.g. the legacy system code). Re-importing a file with the same External IDs updates records instead of creating duplicates, and other files reference this value.",
    example: kind === "customer" ? "cust_0001" : "vend_0001",
  },
  {
    column: "name",
    label: "Name",
    type: "string",
    required: true,
    unique: "warning",
    maxLength: 128,
    description: "Legal / display name of the company or individual. The only field Odoo strictly requires on a contact.",
    example: kind === "customer" ? "Harborview Hotels Inc" : "Apex Components Ltd",
  },
  {
    column: "is_company",
    label: "Is a Company",
    type: "boolean",
    required: false,
    description: "1 for a company, 0 for an individual. Companies can hold child contacts (addresses, people).",
    example: "1",
  },
  {
    column: "email",
    label: "Email",
    type: "email",
    required: false,
    unique: "warning",
    description: "Used to send quotations, invoices and follow-ups. Duplicate emails often indicate duplicate partners.",
    example: kind === "customer" ? "accounts@harborview.example" : "sales@apexcomponents.example",
  },
  { column: "phone", label: "Phone", type: "string", required: false, description: "Main phone number in international format.", example: "+1 555 0100" },
  { column: "street", label: "Street", type: "string", required: false, description: "First address line (printed on documents).", example: "120 Harbor Road" },
  { column: "city", label: "City", type: "string", required: false, description: "City.", example: "Portland" },
  { column: "zip", label: "ZIP", type: "string", required: false, description: "Postal code. Keep as text so leading zeros are preserved.", example: "97201" },
  {
    column: "country_id",
    label: "Country",
    type: "refName",
    refData: "countries",
    required: false,
    description: "Matched by country name. Drives address format and, with fiscal positions, the taxes applied.",
    example: "United States",
  },
  {
    column: "vat",
    label: "Tax ID",
    type: "string",
    required: false,
    unique: "warning",
    description: "VAT / GST / tax identification number. Some localizations validate its format when the base_vat module is installed.",
    example: kind === "customer" ? "US-12-3456789" : "US-98-7654321",
  },
  kind === "customer"
    ? {
        column: "property_payment_term_id",
        label: "Customer Payment Terms",
        type: "refName",
        refData: "paymentTerms",
        required: false,
        description: "Default payment terms proposed on quotations and invoices for this customer; determines due dates.",
        example: "30 Days",
      }
    : {
        column: "property_supplier_payment_term_id",
        label: "Vendor Payment Terms",
        type: "refName",
        refData: "paymentTerms",
        required: false,
        description: "Default payment terms proposed on purchase orders and vendor bills.",
        example: "45 Days",
      },
  kind === "customer"
    ? {
        column: "customer_rank",
        label: "Customer Rank",
        type: "integer",
        required: false,
        description:
          "Set to 1 so the contact appears under customer filters before the first sale (Odoo increments it automatically on sales).",
        example: "1",
      }
    : {
        column: "supplier_rank",
        label: "Vendor Rank",
        type: "integer",
        required: false,
        description: "Set to 1 so the contact appears under vendor filters before the first purchase.",
        example: "1",
      },
];

export const IMPORT_TEMPLATES: ImportTemplate[] = [
  {
    key: "product-categories",
    title: "Product Categories",
    odooModel: "product.category",
    odooImportPath: "Inventory ▸ Configuration ▸ Product Categories ▸ ⚙ (gear) ▸ Import records",
    order: 1,
    dependsOn: [],
    purpose:
      "Categories group products for reporting and — critically — carry the inventory costing method and valuation mode, plus the stock accounts used when valuation is automated.",
    versionNotes: [
      "Costing method and inventory valuation fields are only visible when Inventory is installed.",
      "Stock accounts on categories (property_stock_valuation_account_id etc.) appear when valuation is Automated and the Accounting/Invoicing app is installed.",
    ],
    fields: [
      {
        column: "id",
        label: "External ID",
        type: "externalId",
        required: true,
        unique: "error",
        description: "Key used by the products file (categ_id/id) to link products to this category.",
        example: "categ_appliances",
      },
      { column: "name", label: "Category Name", type: "string", required: true, description: "Category name shown on products and reports.", example: "Appliances" },
      {
        column: "parent_id/id",
        label: "Parent Category (External ID)",
        type: "refId",
        refTemplate: "product-categories",
        selfReference: true,
        required: false,
        description:
          "External ID of the parent category. The parent must already exist in Odoo or appear on an earlier row of the same file.",
        example: "categ_all_saleable",
      },
      {
        column: "property_cost_method",
        label: "Costing Method",
        type: "selection",
        options: ["standard", "fifo", "average"],
        required: false,
        description: "standard = Standard Price, fifo = First In First Out, average = Average Cost (AVCO). Hard to change once stock moves exist.",
        example: "average",
      },
      {
        column: "property_valuation",
        label: "Inventory Valuation",
        type: "selection",
        options: ["manual_periodic", "real_time"],
        required: false,
        description: "manual_periodic = Manual (no automatic journal entries); real_time = Automated (perpetual) journal entries on every stock move.",
        example: "real_time",
      },
    ],
    sampleRows: [
      { id: "categ_all_saleable", name: "Saleable", "parent_id/id": "", property_cost_method: "average", property_valuation: "real_time" },
      { id: "categ_appliances", name: "Appliances", "parent_id/id": "categ_all_saleable", property_cost_method: "average", property_valuation: "real_time" },
      { id: "categ_hardware", name: "Hardware", "parent_id/id": "categ_all_saleable", property_cost_method: "fifo", property_valuation: "real_time" },
      { id: "categ_services", name: "Services", "parent_id/id": "", property_cost_method: "standard", property_valuation: "manual_periodic" },
    ],
    procedure: [
      "Confirm the costing policy with the finance controller before importing — it drives margins and stock valuation.",
      "Order rows so every parent appears before its children.",
      "Open the import screen, upload the file and click Test to run Odoo's own validation.",
      "Check the field mapping (columns map automatically when technical names are used).",
      "Click Import, then open a category to confirm costing method and valuation.",
    ],
    validationChecklist: [
      "Every External ID is unique and follows the naming convention (categ_…).",
      "Every parent reference resolves to an earlier row or an existing category.",
      "Costing method values are one of standard / fifo / average.",
      "Valuation values are one of manual_periodic / real_time.",
    ],
    commonErrors: [
      { error: "No matching record found for external id 'categ_x' in field 'Parent Category'", cause: "Parent row missing or listed after the child.", fix: "Add the parent row earlier in the file or import parents first." },
      { error: "Value 'Average' not found in selection field 'Costing Method'", cause: "Label used instead of technical value, or a typo.", fix: "Use average / fifo / standard (technical values) or exact labels as shown in Odoo." },
      { error: "Recursion detected", cause: "A category is its own ancestor.", fix: "Check parent chains for loops." },
    ],
    reconciliation: ["Count of categories in the file = count created in Odoo.", "Category tree in Odoo matches the approved hierarchy."],
  },
  {
    key: "customers",
    title: "Customers",
    odooModel: "res.partner",
    odooImportPath: "Contacts (or Sales ▸ Orders ▸ Customers) ▸ ⚙ (gear) ▸ Import records",
    order: 2,
    dependsOn: [],
    purpose:
      "Customer master data feeds quotations, deliveries, invoices and receivables. Clean partner data prevents duplicate customers, wrong taxes and mis-addressed documents.",
    versionNotes: [
      "Customers and vendors are both res.partner records; customer_rank / supplier_rank only drive default filters.",
      "Payment terms and fiscal positions are company-dependent properties; import while logged into the right company.",
    ],
    fields: partnerFields("customer"),
    sampleRows: [
      { id: "cust_0001", name: "Harborview Hotels Inc", is_company: "1", email: "accounts@harborview.example", phone: "+1 555 0100", street: "120 Harbor Road", city: "Portland", zip: "97201", country_id: "United States", vat: "US-12-3456789", property_payment_term_id: "30 Days", customer_rank: "1" },
      { id: "cust_0002", name: "Maple Leaf Interiors", is_company: "1", email: "ap@mapleleaf.example", phone: "+1 555 0101", street: "45 King Street", city: "Toronto", zip: "M5H 1J9", country_id: "Canada", vat: "", property_payment_term_id: "45 Days", customer_rank: "1" },
      { id: "cust_0003", name: "Greenfield Cafe Group", is_company: "1", email: "finance@greenfieldcafe.example", phone: "+1 555 0102", street: "9 Market Lane", city: "Austin", zip: "73301", country_id: "United States", vat: "US-55-1029384", property_payment_term_id: "15 Days", customer_rank: "1" },
    ],
    procedure: [
      "Extract customers from the legacy system including the legacy customer code.",
      "Cleanse: trim spaces, standardise country names, lower-case emails, merge duplicates.",
      "Build External IDs from the legacy code (cust_<code>) so later files and re-imports can reference them.",
      "Import in Odoo with Test first; fix every error before clicking Import.",
      "Reconcile counts and spot-check 5–10 records against the source.",
    ],
    validationChecklist: [
      "No duplicate External IDs; no unintended duplicate names, emails or tax IDs.",
      "Every country and payment term matches a value that exists in Odoo.",
      "Emails are valid and belong to the customer (no personal data from unrelated people).",
      "Company vs individual flag is correct.",
    ],
    commonErrors: [
      { error: "No matching record found for name 'USA' in field 'Country'", cause: "Country written as an abbreviation or local spelling.", fix: "Use the country name as shown in Odoo (United States) or use country_id/id with the ISO-based external id (base.us)." },
      { error: "No matching record found for name 'Net 30' in field 'Payment Terms'", cause: "Legacy payment term names differ from Odoo's.", fix: "Create the payment term in Odoo first, or map legacy names to existing Odoo terms." },
      { error: "Duplicate customers after re-import", cause: "File imported without the id column.", fix: "Always include External IDs so re-imports update instead of create." },
    ],
    reconciliation: ["Record count in Odoo equals the cleansed source count.", "Customers per country and per payment term match the source summary."],
  },
  {
    key: "vendors",
    title: "Vendors",
    odooModel: "res.partner",
    odooImportPath: "Purchase ▸ Orders ▸ Vendors ▸ ⚙ (gear) ▸ Import records",
    order: 3,
    dependsOn: [],
    purpose: "Vendor master data feeds RFQs, purchase orders, receipts, vendor bills and payables.",
    versionNotes: ["Vendor bank accounts are a separate model (res.partner.bank) and are usually imported in a second file."],
    fields: partnerFields("vendor"),
    sampleRows: [
      { id: "vend_0001", name: "Apex Components Ltd", is_company: "1", email: "sales@apexcomponents.example", phone: "+44 20 7946 0000", street: "1 Foundry Way", city: "Leeds", zip: "LS1 4AP", country_id: "United Kingdom", vat: "GB123456789", property_supplier_payment_term_id: "45 Days", supplier_rank: "1" },
      { id: "vend_0002", name: "Sunrise Appliances Co", is_company: "1", email: "orders@sunriseappliances.example", phone: "+1 555 0200", street: "77 Industrial Ave", city: "Dayton", zip: "45402", country_id: "United States", vat: "US-77-1234567", property_supplier_payment_term_id: "30 Days", supplier_rank: "1" },
    ],
    procedure: [
      "Extract active vendors only (purchased from in the last 24 months, or with open POs / balances).",
      "Cleanse and de-duplicate exactly as for customers.",
      "Use vend_<legacy code> External IDs.",
      "Import with Test first, then Import, then reconcile.",
    ],
    validationChecklist: [
      "No duplicate External IDs, names or tax IDs.",
      "Payment terms exist in Odoo.",
      "Vendors that are also customers are a single partner (one External ID), not two records.",
    ],
    commonErrors: [
      { error: "The same company appears as two partners", cause: "Customer and vendor files both created it.", fix: "Use one External ID for the partner and set both ranks; import once and update the other attributes." },
      { error: "No matching record found for name '60 days EOM'", cause: "Payment term missing.", fix: "Create the payment term or map to an existing one." },
    ],
    reconciliation: ["Vendor count matches the cleansed source.", "Vendors with open payables in the legacy system all exist in Odoo."],
  },
  {
    key: "products",
    title: "Products",
    odooModel: "product.template",
    odooImportPath: "Inventory ▸ Products ▸ Products ▸ ⚙ (gear) ▸ Import records",
    order: 4,
    dependsOn: ["product-categories"],
    purpose:
      "Products drive sales, purchasing, stock and valuation. The product type decides whether stock is tracked; the category decides how it is valued.",
    versionNotes: [
      "Odoo 17: detailed_type = product (Storable), consu (Consumable) or service.",
      "Odoo 18: product type becomes Goods / Service / Combo (type = consu / service / combo) and stock tracking is the is_storable checkbox. Adjust the template when training on 18.",
      "Variants (attributes) are imported separately via product.product or attribute lines.",
    ],
    fields: [
      { column: "id", label: "External ID", type: "externalId", required: true, unique: "error", description: "Key used by opening stock, BoMs and pricelists to reference the product.", example: "prod_kettle_17" },
      { column: "name", label: "Product Name", type: "string", required: true, maxLength: 256, description: "Name shown on orders and documents.", example: "Electric Kettle 1.7L" },
      { column: "default_code", label: "Internal Reference", type: "string", required: false, unique: "error", description: "SKU. Must be unique in practice — integrations and searches rely on it.", example: "KET-17" },
      {
        column: "detailed_type",
        label: "Product Type",
        type: "selection",
        options: ["product", "consu", "service"],
        required: true,
        description: "product = Storable (stock tracked & valued), consu = Consumable (not tracked), service = Service.",
        example: "product",
      },
      {
        column: "categ_id/id",
        label: "Product Category (External ID)",
        type: "refId",
        refTemplate: "product-categories",
        required: true,
        description: "External ID of the product category. Import categories first.",
        example: "categ_appliances",
      },
      { column: "uom_id", label: "Unit of Measure", type: "refName", refData: "uom", required: false, description: "Unit for stock and sales (defaults to Units).", example: "Units" },
      {
        column: "uom_po_id",
        label: "Purchase Unit of Measure",
        type: "refName",
        refData: "uom",
        required: false,
        description: "Unit for purchasing; must be in the same UoM category as uom_id (e.g. Units ↔ Dozens).",
        example: "Units",
      },
      { column: "list_price", label: "Sales Price", type: "decimal", required: false, description: "Default sales price before pricelists.", example: "39.90" },
      { column: "standard_price", label: "Cost", type: "decimal", required: false, description: "Unit cost. For AVCO/FIFO the opening stock valuation uses this cost.", example: "21.50" },
      { column: "barcode", label: "Barcode", type: "barcode", required: false, unique: "error", description: "EAN-13/UPC barcode. Odoo enforces unique barcodes.", example: "4006381333931" },
      { column: "sale_ok", label: "Can be Sold", type: "boolean", required: false, description: "1 to show the product on sales documents.", example: "1" },
      { column: "purchase_ok", label: "Can be Purchased", type: "boolean", required: false, description: "1 to show the product on purchase documents.", example: "1" },
      {
        column: "invoice_policy",
        label: "Invoicing Policy",
        type: "selection",
        options: ["order", "delivery"],
        required: false,
        description: "order = invoice ordered quantities; delivery = invoice delivered quantities.",
        example: "delivery",
      },
    ],
    sampleRows: [
      { id: "prod_kettle_17", name: "Electric Kettle 1.7L", default_code: "KET-17", detailed_type: "product", "categ_id/id": "categ_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "39.90", standard_price: "21.50", barcode: "4006381333931", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
      { id: "prod_toaster_2s", name: "Toaster 2-Slice", default_code: "TOA-2S", detailed_type: "product", "categ_id/id": "categ_appliances", uom_id: "Units", uom_po_id: "Units", list_price: "29.00", standard_price: "14.20", barcode: "4006381333948", sale_ok: "1", purchase_ok: "1", invoice_policy: "delivery" },
      { id: "prod_install", name: "Installation Service (hour)", default_code: "SRV-INST", detailed_type: "service", "categ_id/id": "categ_services", uom_id: "Hours", uom_po_id: "Hours", list_price: "60.00", standard_price: "0", barcode: "", sale_ok: "1", purchase_ok: "0", invoice_policy: "order" },
    ],
    procedure: [
      "Import product categories first.",
      "Agree the product type for every item with operations (storable vs consumable vs service).",
      "De-duplicate SKUs and barcodes; fix UoM names to match Odoo.",
      "Import with Test, resolve errors, Import.",
      "Open several products and check type, category, costs and the Inventory/Accounting tabs.",
    ],
    validationChecklist: [
      "SKU (default_code) and barcode are unique.",
      "Every categ_id/id resolves to an imported category.",
      "Product type agreed and correct (services are never storable).",
      "Sales and purchase UoM belong to the same UoM category.",
      "Prices and costs are numeric with a dot decimal separator.",
    ],
    commonErrors: [
      { error: "No matching record found for external id 'categ_kitchen' in field 'Product Category'", cause: "Category not imported or External ID typo.", fix: "Import categories first and copy External IDs exactly." },
      { error: "The default Unit of Measure and the purchase Unit of Measure must be in the same category", cause: "e.g. Units vs kg.", fix: "Use units from the same UoM category." },
      { error: "A barcode can only be assigned to one product", cause: "Duplicate barcode.", fix: "De-duplicate barcodes in the source." },
      { error: "Value 'Storable' not found in selection field 'Product Type'", cause: "Label/version mismatch.", fix: "Use product / consu / service on Odoo 17; on 18 use the type + is_storable fields." },
    ],
    reconciliation: ["Product count per category matches the source.", "Sum of list prices and costs per category matches the source extract (control totals)."],
  },
  {
    key: "opening-stock",
    title: "Opening Stock",
    odooModel: "stock.quant",
    odooImportPath: "Inventory ▸ Operations ▸ Physical Inventory ▸ ⚙ (gear) ▸ Import records, then Apply",
    order: 5,
    dependsOn: ["products"],
    purpose:
      "Loads on-hand quantities per location at the cut-over date. With automated valuation, applying the counts creates inventory valuation journal entries.",
    versionNotes: [
      "Imported lines set the Counted Quantity; stock only changes after you click Apply (Apply All).",
      "With automated valuation the counterpart account is the inventory adjustment/loss location's account — agree with finance how opening stock is offset against opening balances.",
      "Lot/serial tracked products need lot_id values; lots must exist or be creatable.",
    ],
    fields: [
      { column: "product_id/id", label: "Product (External ID)", type: "refId", refTemplate: "products", required: true, description: "External ID of the storable product.", example: "prod_kettle_17" },
      { column: "location_id", label: "Location", type: "refName", refData: "locations", required: true, description: "Full location name, e.g. WH/Stock. Must be an internal location.", example: "WH/Stock" },
      { column: "inventory_quantity", label: "Counted Quantity", type: "decimal", required: true, description: "Physically counted quantity at cut-over, in the product's UoM. Must not be negative.", example: "120" },
      { column: "lot_id", label: "Lot/Serial Number", type: "string", required: false, description: "Only for tracked products.", example: "" },
    ],
    sampleRows: [
      { "product_id/id": "prod_kettle_17", location_id: "WH/Stock", inventory_quantity: "120", lot_id: "" },
      { "product_id/id": "prod_toaster_2s", location_id: "WH/Stock", inventory_quantity: "80", lot_id: "" },
    ],
    procedure: [
      "Freeze stock movements and perform (or obtain) the cut-over count.",
      "Make sure product costs are correct BEFORE applying quantities — valuation uses them.",
      "Import the counted quantities and review the Physical Inventory list.",
      "Click Apply and enter a meaningful reference (e.g. 'Opening stock 2026-10-01').",
      "Reconcile quantity and value against the legacy stock report.",
    ],
    validationChecklist: [
      "Only storable products are included.",
      "Each product + location (+ lot) appears once.",
      "No negative or non-numeric quantities.",
      "Locations exist and are internal locations.",
    ],
    commonErrors: [
      { error: "No matching record found for name 'Main Warehouse' in field 'Location'", cause: "Warehouse name used instead of location full name.", fix: "Use the location's full name, e.g. WH/Stock." },
      { error: "Quantities imported but stock unchanged", cause: "Counted quantity is not applied automatically.", fix: "Click Apply on the Physical Inventory list." },
      { error: "Opening stock value differs from finance's figure", cause: "Costs not set before applying.", fix: "Correct product costs, then reverse/redo the adjustment in a test database first." },
    ],
    reconciliation: [
      "Total quantity per location = legacy stock report.",
      "Inventory Valuation report total = approved opening stock value.",
      "Stock valuation account balance in the GL = Inventory Valuation report (automated valuation).",
    ],
  },
];

export function getTemplate(key: string): ImportTemplate | undefined {
  return IMPORT_TEMPLATES.find((t) => t.key === key);
}

export function isTemplateKey(key: string): key is TemplateKey {
  return IMPORT_TEMPLATES.some((t) => t.key === key);
}
