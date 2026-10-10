/** Single source of truth for portal branding and copyright. */
export const BRAND = {
  company: "nexusEPM",
  legalName: "NEXUSEPM Consulting Private Limited",
  website: "https://www.nexusepm.com/",
  productName: "ERP Consultant Academy",
  logo: { src: "/brand/nexusepm-logo.png", width: 388, height: 72, alt: "nexusEPM" },
} as const;

export function copyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND.legalName}. All rights reserved.`;
}
