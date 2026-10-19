import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: `${BRAND.productName} · ${BRAND.company}`, template: `%s · ${BRAND.company} ${BRAND.productName}` },
  description: `Practical training portal for Odoo ERP techno-functional consultants by ${BRAND.company}.`,
  applicationName: `${BRAND.company} ${BRAND.productName}`,
  authors: [{ name: BRAND.legalName, url: BRAND.website }],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Applies the saved/OS theme before paint to avoid a flash of the wrong theme.
// Also restores the collapsed/expanded navigation state so the layout doesn't jump.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);if(localStorage.getItem('sidebar')==='collapsed'){document.documentElement.setAttribute('data-sidebar','collapsed');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Browser extensions (Grammarly, ColorZilla, …) add attributes to <body> before React hydrates. */}
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
