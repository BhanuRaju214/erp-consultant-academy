import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { CircleAlert, Info, Lightbulb, TriangleAlert, Waypoints } from "lucide-react";
import { enhanceMarkdown, slugify } from "@/lib/visuals/enhance";
import { VisualBlock } from "./visuals/visual-block";
import { TaskCheckbox } from "./visuals/interactive-blocks";
import { cn } from "./ui";

/* Minimal hast typing — enough to read text and attributes from react-markdown's `node` prop. */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function hastText(node?: HastNode): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

const CALLOUTS: { match: RegExp; tone: "tip" | "warning" | "note" | "danger"; icon: typeof Info }[] = [
  { match: /^(consultant tip|tip|pro tip|best practice)/i, tone: "tip", icon: Lightbulb },
  { match: /^(warning|caution|important|security|never)/i, tone: "warning", icon: TriangleAlert },
  { match: /^(do not|risk|danger)/i, tone: "danger", icon: CircleAlert },
  { match: /^(note|version note|edition note|remember|disclaimer|compliance|definition)/i, tone: "note", icon: Info },
];
const calloutStyle = {
  tip: "border-primary/40 bg-primary-soft",
  warning: "border-warning/50 bg-warning-soft",
  danger: "border-danger/50 bg-danger-soft",
  note: "border-border bg-surface-2",
} as const;
const calloutIcon = { tip: "text-primary", warning: "text-warning", danger: "text-danger", note: "text-muted" } as const;

function heading(level: 2 | 3) {
  const Tag = `h${level}` as const;
  const Heading: Components["h2"] = ({ node, children }) => {
    const id = slugify(hastText(node as HastNode));
    return (
      <Tag id={id} className="group scroll-mt-24">
        {children}
        <a href={`#${id}`} className="ml-2 text-muted no-underline opacity-0 transition group-hover:opacity-100" aria-label="Link to this section">
          #
        </a>
      </Tag>
    );
  };
  return Heading;
}

/**
 * Renders lesson/document markdown. Raw HTML is NOT rendered (react-markdown escapes
 * it), so admin-edited content cannot inject scripts. ```visual-<type> fences render
 * as visual blocks; `enhance` adds automatic lesson enhancements (takeaway cards,
 * arrow-chain flows).
 */
export function Markdown({ children, className, enhance = false }: { children: string; className?: string; enhance?: boolean }) {
  const source = enhance ? enhanceMarkdown(children) : children;
  const components: Components = {
    a: ({ href = "", children }) =>
      href.startsWith("/") || href.startsWith("#") ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    h2: heading(2),
    h3: heading(3),
    pre: ({ node, children }) => {
      const code = (node as HastNode | undefined)?.children?.[0];
      const classes = (code?.properties?.className as string[] | undefined) ?? [];
      const lang = classes.find((c) => c.startsWith("language-"))?.slice("language-".length) ?? "";
      const text = hastText(code);
      if (lang.startsWith("visual-")) return <VisualBlock type={lang.slice("visual-".length)} source={text} />;
      // ASCII process diagrams get a light, labelled frame instead of a dark code box.
      if ((lang === "text" || lang === "") && /(-->|→|↓|─|│|\|\s*\n\s*v\b)/.test(text)) {
        return (
          <figure className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              <Waypoints className="h-3.5 w-3.5" aria-hidden /> Diagram
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-fg">{text.replace(/\n$/, "")}</pre>
          </figure>
        );
      }
      return <pre>{children}</pre>;
    },
    blockquote: ({ node, children }) => {
      const first = (node as HastNode | undefined)?.children?.find((c) => c.type === "element");
      const lead = hastText(first).trim();
      const kind = CALLOUTS.find((c) => c.match.test(lead));
      if (!kind) return <blockquote>{children}</blockquote>;
      const Icon = kind.icon;
      return (
        <aside className={cn("not-prose my-6 flex gap-3 rounded-xl border-l-4 p-4 text-sm leading-relaxed text-fg [&_p+p]:mt-2 [&_strong]:font-semibold", calloutStyle[kind.tone])}>
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", calloutIcon[kind.tone])} aria-hidden />
          <div className="min-w-0">{children}</div>
        </aside>
      );
    },
    table: ({ children }) => (
      <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-fg [&_th]:bg-surface-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-fg [&_tr:hover_td]:bg-surface-2/50">
          {children}
        </table>
      </div>
    ),
    // Task lists ("- [ ] …") become checkboxes the learner can tick (saved in this browser).
    input: ({ type }) => (type === "checkbox" ? null : <input type={type} />),
    li: ({ node, className, children }) => {
      if (className?.includes("task-list-item")) {
        return (
          <li className="flex list-none items-start [&>p]:m-0" style={{ marginLeft: "-1.25em" }}>
            <TaskCheckbox label={hastText(node as HastNode).trim()} />
            <span>{children}</span>
          </li>
        );
      }
      return <li className={className}>{children}</li>;
    },
  };

  return (
    <div className={cn("lesson-prose prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
