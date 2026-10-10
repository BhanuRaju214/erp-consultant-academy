import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { cn } from "./ui";

/**
 * Renders lesson/document markdown. Raw HTML is NOT rendered (react-markdown
 * escapes it by default), so admin-edited content cannot inject scripts.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("lesson-prose prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href = "", children }) =>
            href.startsWith("/") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
