import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { cn } from "./ui";

/**
 * nexusEPM wordmark. The artwork has dark text on a transparent background, so on
 * dark surfaces (sidebar, dark mode) it sits on a white chip to stay legible.
 */
export function BrandLogo({ className, chip = false, height = 24 }: { className?: string; chip?: boolean; height?: number }) {
  const width = Math.round((BRAND.logo.width / BRAND.logo.height) * height);
  const img = <Image src={BRAND.logo.src} alt={BRAND.logo.alt} width={width} height={height} priority className="block h-auto max-w-full" />;
  return chip ? (
    <span className={cn("inline-flex items-center rounded-md bg-white px-2 py-1.5", className)}>{img}</span>
  ) : (
    <span className={cn("inline-flex items-center dark:rounded-md dark:bg-white dark:px-2 dark:py-1.5", className)}>{img}</span>
  );
}
