import { BrandLogo } from "@/components/brand-logo";
import { BRAND, copyrightLine } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-text lg:flex">
        <div>
          <BrandLogo chip height={28} />
          <div className="mt-3 text-sm font-semibold text-white">{BRAND.productName}</div>
        </div>
        <div className="space-y-6">
          <p className="text-3xl font-semibold leading-tight text-white">
            Understand the business. Configure the system. Migrate the data. Test, implement, support.
          </p>
          <ol className="space-y-2 text-sm">
            {[
              "ERP fundamentals & business processes",
              "Odoo application training (CRM → Manufacturing → eCommerce)",
              "Configuration lab & data import simulator",
              "End-to-end implementation projects",
              "Assessments, certificates & trainer feedback",
            ].map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs text-white">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-1 text-xs">
          <p>Training environment · fictional companies and synthetic data only.</p>
          <p>{copyrightLine()}</p>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 lg:hidden">
          <BrandLogo height={26} />
        </div>
        <div className="w-full max-w-sm">{children}</div>
        <p className="mt-10 text-center text-xs text-muted lg:hidden">{copyrightLine()}</p>
      </main>
    </div>
  );
}
