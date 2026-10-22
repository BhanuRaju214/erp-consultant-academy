/**
 * GST helpers for invoices. Course prices are inclusive of GST, so tax is worked
 * out backwards from the amount paid. Intra-state supplies (buyer in the seller's
 * state) split into CGST + SGST; inter-state supplies are charged IGST.
 */

export const GST_RATE_PERCENT = 18;

/** GST state / UT codes used for place of supply. */
export const GST_STATES: { code: string; name: string }[] = [
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "18", name: "Assam" },
  { code: "10", name: "Bihar" },
  { code: "04", name: "Chandigarh" },
  { code: "22", name: "Chhattisgarh" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "07", name: "Delhi" },
  { code: "30", name: "Goa" },
  { code: "24", name: "Gujarat" },
  { code: "06", name: "Haryana" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "01", name: "Jammu and Kashmir" },
  { code: "20", name: "Jharkhand" },
  { code: "29", name: "Karnataka" },
  { code: "32", name: "Kerala" },
  { code: "38", name: "Ladakh" },
  { code: "31", name: "Lakshadweep" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "27", name: "Maharashtra" },
  { code: "14", name: "Manipur" },
  { code: "17", name: "Meghalaya" },
  { code: "15", name: "Mizoram" },
  { code: "13", name: "Nagaland" },
  { code: "21", name: "Odisha" },
  { code: "34", name: "Puducherry" },
  { code: "03", name: "Punjab" },
  { code: "08", name: "Rajasthan" },
  { code: "11", name: "Sikkim" },
  { code: "33", name: "Tamil Nadu" },
  { code: "36", name: "Telangana" },
  { code: "16", name: "Tripura" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "05", name: "Uttarakhand" },
  { code: "19", name: "West Bengal" },
];

export function stateName(code: string): string {
  return GST_STATES.find((s) => s.code === code)?.name ?? code;
}

/** 15-character GSTIN: 2-digit state code, 10-character PAN, entity number, "Z", check character. */
export function isValidGstin(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
}

export interface GstSplit {
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
}

/** Splits a GST-inclusive amount (paise) into taxable value and tax components. */
export function splitInclusiveGst(amountPaise: number, sellerStateCode: string, buyerStateCode: string): GstSplit {
  const taxablePaise = Math.round((amountPaise * 100) / (100 + GST_RATE_PERCENT));
  const tax = amountPaise - taxablePaise;
  if (sellerStateCode && sellerStateCode === buyerStateCode) {
    const cgstPaise = Math.floor(tax / 2);
    return { taxablePaise, cgstPaise, sgstPaise: tax - cgstPaise, igstPaise: 0 };
  }
  return { taxablePaise, cgstPaise: 0, sgstPaise: 0, igstPaise: tax };
}

/** Indian financial year label for a date, e.g. "2026-27" (April–March). */
export function financialYear(date: Date): string {
  // Financial years run on Indian time.
  const ist = new Date(date.getTime() + 330 * 60_000);
  const y = ist.getUTCFullYear();
  const start = ist.getUTCMonth() >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

export function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: paise % 100 ? 2 : 0 }).format(paise / 100);
}

/** Seller details for invoices, from the environment. */
export function sellerDetails() {
  return {
    legalName: process.env.GST_LEGAL_NAME ?? "",
    gstin: process.env.GST_GSTIN ?? "",
    address: process.env.GST_ADDRESS ?? "",
    stateCode: process.env.GST_STATE_CODE ?? "",
    /** Services accounting code printed on invoices; confirm with your accountant. */
    sac: process.env.GST_SAC ?? "999293",
    invoicePrefix: process.env.INVOICE_PREFIX ?? "NXS",
  };
}
