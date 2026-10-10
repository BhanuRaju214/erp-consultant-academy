import type { TemplateKey } from "./templates";

/**
 * Deterministic synthetic data generator for fictional businesses.
 * All names, addresses, emails and tax IDs are fabricated and use the reserved
 * ".example" domain so they can never reach a real mailbox.
 */

export type BusinessType = "trading" | "retail" | "manufacturing" | "services";

export interface GeneratorOptions {
  business: BusinessType;
  seed: number;
  customers: number;
  vendors: number;
  products: number;
  /** Deliberately inject data-quality problems for cleansing practice. */
  injectErrors: boolean;
}

export interface GeneratedDataset {
  companyName: string;
  files: Record<TemplateKey, Record<string, string>[]>;
  /** Answer key for injected problems (empty when injectErrors is false). */
  injected: { template: TemplateKey; row: number; column: string; problem: string }[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CITIES: [string, string, string][] = [
  ["Portland", "97201", "United States"],
  ["Austin", "73301", "United States"],
  ["Denver", "80202", "United States"],
  ["Toronto", "M5H 1J9", "Canada"],
  ["Manchester", "M1 1AE", "United Kingdom"],
  ["Rotterdam", "3011 AA", "Netherlands"],
  ["Dubai", "00000", "United Arab Emirates"],
  ["Pune", "411001", "India"],
  ["Singapore", "049315", "Singapore"],
  ["Melbourne", "3000", "Australia"],
];
const STREETS = ["Harbor Road", "Market Lane", "King Street", "Industrial Ave", "Station Road", "Park Avenue", "Mill Street", "Commerce Way"];
const NAME_A = ["Harbor", "Maple", "Summit", "Bluebird", "Ironwood", "Silverline", "Crescent", "Granite", "Evergreen", "Northgate", "Riverside", "Copperleaf", "Brightpath", "Oakridge", "Lakeshore"];
const NAME_B_CUSTOMER = ["Hotels", "Interiors", "Cafe Group", "Builders", "Retail Co", "Facilities", "Hospitality", "Design Studio", "Home Stores", "Contractors"];
const NAME_B_VENDOR = ["Components", "Supply Co", "Manufacturing", "Wholesale", "Imports", "Industries", "Trading House", "Logistics"];
const SUFFIX = ["Inc", "LLC", "Ltd", "GmbH", "Pvt Ltd", "Pty Ltd"];
const TERMS_C = ["Immediate Payment", "15 Days", "30 Days", "45 Days"];
const TERMS_V = ["30 Days", "45 Days", "End of Following Month"];

const CATALOG: Record<BusinessType, { categories: [string, string, string | null, string][]; items: [string, string, string, number, string][] }> = {
  // categories: [extId, name, parentExtId, costMethod]; items: [name stem, code prefix, category, base price, type]
  trading: {
    categories: [
      ["categ_saleable", "Saleable", null, "average"],
      ["categ_appliances", "Appliances", "categ_saleable", "average"],
      ["categ_hardware", "Hardware", "categ_saleable", "fifo"],
      ["categ_services", "Services", null, "standard"],
    ],
    items: [
      ["Electric Kettle", "KET", "categ_appliances", 39.9, "product"],
      ["Toaster", "TOA", "categ_appliances", 29, "product"],
      ["Blender", "BLE", "categ_appliances", 79, "product"],
      ["Microwave Oven", "MIC", "categ_appliances", 149, "product"],
      ["Door Hinge Set", "HIN", "categ_hardware", 12.5, "product"],
      ["Cabinet Handle", "HAN", "categ_hardware", 4.2, "product"],
      ["Drawer Slide", "SLI", "categ_hardware", 9.8, "product"],
      ["Installation Service", "SRV", "categ_services", 60, "service"],
    ],
  },
  retail: {
    categories: [
      ["categ_store", "Store Items", null, "average"],
      ["categ_apparel", "Apparel", "categ_store", "average"],
      ["categ_accessories", "Accessories", "categ_store", "average"],
      ["categ_bags", "Shopping Bags", null, "standard"],
    ],
    items: [
      ["Cotton T-Shirt", "TSH", "categ_apparel", 19.9, "product"],
      ["Denim Jeans", "JEA", "categ_apparel", 59, "product"],
      ["Hoodie", "HOO", "categ_apparel", 45, "product"],
      ["Leather Belt", "BEL", "categ_accessories", 25, "product"],
      ["Baseball Cap", "CAP", "categ_accessories", 15, "product"],
      ["Paper Bag", "BAG", "categ_bags", 0.2, "consu"],
    ],
  },
  manufacturing: {
    categories: [
      ["categ_raw", "Raw Materials", null, "average"],
      ["categ_components", "Components", null, "fifo"],
      ["categ_finished", "Finished Goods", null, "standard"],
    ],
    items: [
      ["Oak Panel 18mm", "RM-OAK", "categ_raw", 42, "product"],
      ["Steel Screw M4", "RM-SCR", "categ_raw", 0.05, "product"],
      ["Wood Glue 1L", "RM-GLU", "categ_raw", 8, "consu"],
      ["Drawer Runner", "CP-RUN", "categ_components", 6.5, "product"],
      ["Cabinet Hinge", "CP-HIN", "categ_components", 3.1, "product"],
      ["Kitchen Cabinet 60cm", "FG-CAB60", "categ_finished", 320, "product"],
      ["Wardrobe 2-Door", "FG-WAR2", "categ_finished", 690, "product"],
    ],
  },
  services: {
    categories: [
      ["categ_consulting", "Consulting", null, "standard"],
      ["categ_licences", "Licences & Materials", null, "fifo"],
    ],
    items: [
      ["Implementation Consulting (hour)", "CON-IMP", "categ_consulting", 95, "service"],
      ["Training Day", "CON-TRN", "categ_consulting", 800, "service"],
      ["Support Retainer (month)", "CON-SUP", "categ_consulting", 1200, "service"],
      ["Barcode Scanner", "MAT-SCN", "categ_licences", 180, "product"],
      ["Label Printer", "MAT-LBL", "categ_licences", 260, "product"],
    ],
  },
};

const COMPANY: Record<BusinessType, string> = {
  trading: "Bluewave Trading LLC",
  retail: "Urban Thread Stores",
  manufacturing: "Timbercraft Furniture Works",
  services: "Clearpath Consulting Group",
};

function ean13(base12: string): string {
  const digits = base12.split("").map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return base12 + String((10 - (sum % 10)) % 10);
}

export function generateDataset(opts: GeneratorOptions): GeneratedDataset {
  const rnd = mulberry32(opts.seed);
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
  const catalog = CATALOG[opts.business];
  const usedNames = new Set<string>();

  const partner = (kind: "customer" | "vendor", i: number): Record<string, string> => {
    let name = "";
    for (let tries = 0; tries < 20; tries++) {
      name = `${pick(NAME_A)} ${pick(kind === "customer" ? NAME_B_CUSTOMER : NAME_B_VENDOR)} ${pick(SUFFIX)}`;
      if (!usedNames.has(name)) break;
    }
    usedNames.add(name);
    const [city, zip, country] = pick(CITIES);
    const domain = name.split(" ")[0].toLowerCase() + name.split(" ")[1].toLowerCase().replace(/[^a-z]/g, "");
    const num = String(i + 1).padStart(4, "0");
    const base = {
      id: `${kind === "customer" ? "cust" : "vend"}_${num}`,
      name,
      is_company: "1",
      email: `${kind === "customer" ? "accounts" : "sales"}@${domain}.example`,
      phone: `+1 555 ${String(1000 + Math.floor(rnd() * 8999))}`,
      street: `${1 + Math.floor(rnd() * 250)} ${pick(STREETS)}`,
      city,
      zip,
      country_id: country,
      vat: `TX-${Math.floor(10 + rnd() * 89)}-${Math.floor(1000000 + rnd() * 8999999)}`,
    };
    return kind === "customer"
      ? { ...base, property_payment_term_id: pick(TERMS_C), customer_rank: "1" }
      : { ...base, property_supplier_payment_term_id: pick(TERMS_V), supplier_rank: "1" };
  };

  const customers = Array.from({ length: opts.customers }, (_, i) => partner("customer", i));
  const vendors = Array.from({ length: opts.vendors }, (_, i) => partner("vendor", i));

  const categories = catalog.categories.map(([id, name, parent, cost]) => ({
    id,
    name,
    "parent_id/id": parent ?? "",
    property_cost_method: cost,
    property_valuation: cost === "standard" && opts.business === "services" ? "manual_periodic" : "real_time",
  }));

  const variantsPerItem = Math.max(1, Math.ceil(opts.products / catalog.items.length));
  const products: Record<string, string>[] = [];
  outer: for (let v = 0; v < variantsPerItem; v++) {
    for (const [stem, prefix, categ, price, type] of catalog.items) {
      if (products.length >= opts.products) break outer;
      const n = products.length + 1;
      const isService = type === "service";
      const listPrice = Math.round(price * (1 + v * 0.15) * 100) / 100;
      const cost = isService ? 0 : Math.round(listPrice * (0.45 + rnd() * 0.2) * 100) / 100;
      products.push({
        id: `prod_${prefix.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${String(n).padStart(3, "0")}`,
        name: v === 0 ? stem : `${stem} Mk${v + 1}`,
        default_code: `${prefix}-${String(n).padStart(3, "0")}`,
        detailed_type: type,
        "categ_id/id": categ,
        uom_id: isService ? "Hours" : "Units",
        uom_po_id: isService ? "Hours" : "Units",
        list_price: listPrice.toFixed(2),
        standard_price: cost.toFixed(2),
        barcode: isService ? "" : ean13("40" + String(Math.floor(1e9 + rnd() * 8.99e9)).slice(0, 10)),
        sale_ok: "1",
        purchase_ok: isService ? "0" : "1",
        invoice_policy: isService ? "order" : "delivery",
      });
    }
  }

  const openingStock = products
    .filter((p) => p.detailed_type === "product")
    .map((p) => ({
      "product_id/id": p.id,
      location_id: "WH/Stock",
      inventory_quantity: String(5 + Math.floor(rnd() * 200)),
      lot_id: "",
    }));

  const files: GeneratedDataset["files"] = {
    "product-categories": categories,
    customers,
    vendors,
    products,
    "opening-stock": openingStock,
  };

  const injected: GeneratedDataset["injected"] = [];
  if (opts.injectErrors) {
    const mutate = (template: TemplateKey, rowIdx: number, column: string, value: string, problem: string) => {
      const rows = files[template];
      if (!rows[rowIdx]) return;
      rows[rowIdx] = { ...rows[rowIdx], [column]: value };
      injected.push({ template, row: rowIdx + 1, column, problem });
    };
    if (customers.length > 2) {
      mutate("customers", 1, "email", "accounts(at)example", "Invalid email address");
      mutate("customers", 2, "country_id", "USA", "Country abbreviation not matching Odoo country name");
      const dupe = { ...customers[0], id: `cust_${String(customers.length + 1).padStart(4, "0")}`, name: `  ${customers[0].name}` };
      customers.push(dupe);
      injected.push({ template: "customers", row: customers.length, column: "name", problem: "Duplicate customer (same name with leading spaces, same email)" });
    }
    if (customers.length > 3) mutate("customers", 3, "property_payment_term_id", "Net 30", "Payment term that does not exist in Odoo");
    if (vendors.length > 1) mutate("vendors", 1, "name", "", "Missing required name");
    if (products.length > 3) {
      mutate("products", 1, "list_price", "1,299.00", "Thousands separator in a number");
      mutate("products", 2, "categ_id/id", "categ_unknown", "Category External ID that does not exist");
      mutate("products", 3, "default_code", products[0].default_code, "Duplicate internal reference (SKU)");
    }
    if (products.length > 4) mutate("products", 4, "detailed_type", "Storable", "Label used instead of technical selection value");
    if (openingStock.length > 1) mutate("opening-stock", 1, "inventory_quantity", "-4", "Negative opening quantity");
  }

  return { companyName: COMPANY[opts.business], files, injected };
}
