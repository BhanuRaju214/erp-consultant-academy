/** Single source of truth for portal branding and copyright. */
export const BRAND = {
  company: "nexusEPM",
  legalName: "NexusEPM Consulting",
  website: "https://www.nexusepm.com/",
  productName: "Nexsademy",
  logo: { src: "/brand/nexusepm-logo.png", width: 388, height: 72, alt: "nexusEPM" },
  /** linkedin.com/company/nexusepm: shown as the issuer when learners add a certificate to their profile. */
  linkedinOrgId: "104465476",
} as const;

export function copyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND.legalName}. All rights reserved.`;
}
