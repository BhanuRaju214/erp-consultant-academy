"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { Markdown } from "./markdown";
import { Badge, Callout, buttonClass, cn, inputClass } from "./ui";

export type Msg = { role: "user" | "assistant"; content: string; sources?: { title: string; href: string }[]; provider?: string };
type Ctx = { odooVersion: string; edition: string; apps: string[]; mode: string };

const MODES = [
  ["explain", "Explain a concept"],
  ["troubleshoot", "Troubleshoot an error"],
  ["test-scenarios", "Generate test scenarios"],
  ["spec-review", "Review a requirement/spec"],
  ["code", "Explain code"],
  ["interview", "Mock interview"],
  ["hint", "Give me a hint only"],
] as const;
const APPS = ["CRM", "Sales", "Purchase", "Inventory", "Accounting", "Invoicing", "Manufacturing", "Project", "Timesheets", "POS", "Website"];

const STARTERS = [
  "Explain the difference between a storable product and a consumable in Odoo 17.",
  "My product import says: No matching record found for external id 'categ_kitchen'. What does it mean?",
  "Generate test scenarios for a partial delivery with a backorder.",
  "What is the business purpose of the Invoicing Policy field on a product?",
];

/**
 * The AI learning assistant conversation. `page` is the full /assistant view (keeps the
 * conversation in the URL); `widget` is the compact chat in the floating bubble, which
 * reports the conversation to its parent instead of navigating.
 */
export function AssistantChat({
  conversationId: initialId,
  initialMessages,
  aiConfigured,
  variant = "page",
  onConversationChange,
}: {
  conversationId?: string;
  initialMessages: Msg[];
  aiConfigured: boolean;
  variant?: "page" | "widget";
  onConversationChange?: (id: string | undefined) => void;
}) {
  const router = useRouter();
  const uid = useId();
  const widget = variant === "widget";
  const [conversationId, setConversationId] = useState(initialId);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [ctx, setCtx] = useState<Ctx>({ odooVersion: "17.0", edition: "Community", apps: ["Sales", "Inventory", "Invoicing"], mode: "explain" });
  const [showSettings, setShowSettings] = useState(!widget);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll only the message list (scrollIntoView would also scroll the page behind the widget).
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setError(undefined);
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message, context: ctx }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "The assistant is unavailable.");
      setMessages((m) => [...m, { role: "assistant", content: json.content, sources: json.sources, provider: json.provider }]);
      if (!conversationId) {
        setConversationId(json.conversationId);
        if (widget) onConversationChange?.(json.conversationId);
        else {
          router.replace(`/assistant?c=${json.conversationId}`, { scroll: false });
          router.refresh();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!conversationId) return;
    await fetch(`/api/assistant?conversationId=${conversationId}`, { method: "DELETE" });
    if (widget) {
      setConversationId(undefined);
      setMessages([]);
      onConversationChange?.(undefined);
    } else {
      router.push("/assistant");
      router.refresh();
    }
  };

  const settings = (
    <div className={cn("grid gap-3 border-b border-border p-4", !widget && "sm:grid-cols-3")}>
      <div>
        <label htmlFor={`${uid}-mode`} className="mb-1 block text-xs font-medium text-muted">
          Mode
        </label>
        <select id={`${uid}-mode`} value={ctx.mode} onChange={(e) => setCtx({ ...ctx, mode: e.target.value })} className={inputClass}>
          {MODES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className={cn(widget && "grid grid-cols-2 gap-3")}>
        <div>
          <label htmlFor={`${uid}-version`} className="mb-1 block text-xs font-medium text-muted">
            Odoo version
          </label>
          <select id={`${uid}-version`} value={ctx.odooVersion} onChange={(e) => setCtx({ ...ctx, odooVersion: e.target.value })} className={inputClass}>
            {["16.0", "17.0", "18.0", "19.0"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        {widget && editionSelect()}
      </div>
      {!widget && <div>{editionSelect()}</div>}
      <fieldset className={cn(!widget && "sm:col-span-3")}>
        <legend className="mb-1 text-xs font-medium text-muted">Installed apps</legend>
        <div className="flex flex-wrap gap-1.5">
          {APPS.map((a) => {
            const on = ctx.apps.includes(a);
            return (
              <button
                key={a}
                type="button"
                aria-pressed={on}
                onClick={() => setCtx({ ...ctx, apps: on ? ctx.apps.filter((x) => x !== a) : [...ctx.apps, a] })}
                className={cn("rounded-full border px-2.5 py-0.5 text-xs", on ? "border-primary bg-primary-soft text-primary" : "border-border text-muted")}
              >
                {a}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );

  function editionSelect() {
    return (
      <div>
        <label htmlFor={`${uid}-edition`} className="mb-1 block text-xs font-medium text-muted">
          Edition
        </label>
        <select id={`${uid}-edition`} value={ctx.edition} onChange={(e) => setCtx({ ...ctx, edition: e.target.value })} className={inputClass}>
          {["Community", "Enterprise", "Odoo Online"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-surface", widget ? "h-full min-h-0" : "min-h-[70vh] rounded-xl border border-border")}>
      {widget && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted">
          <span>
            {MODES.find(([v]) => v === ctx.mode)?.[1]} · Odoo {ctx.odooVersion} {ctx.edition}
          </span>
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            className="inline-flex items-center gap-1 rounded px-1.5 py-1 font-semibold text-primary hover:bg-surface-2"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> {showSettings ? "Done" : "Settings"}
          </button>
        </div>
      )}
      {showSettings && settings}

      {!aiConfigured && (
        <div className="px-4 pt-4">
          <Callout tone="warning" title="Offline mode">
            No AI provider is configured on the server (OPENAI_API_KEY). The assistant will return the most relevant portal passages instead of generated
            answers.
          </Callout>
        </div>
      )}

      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 && (
          <div className={cn("text-center", widget ? "py-2" : "py-6")}>
            <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <p className="mt-2 text-sm text-muted">Ask about ERP concepts, Odoo fields, import errors, test scenarios, specs or code.</p>
            <div className={cn("mx-auto mt-4 grid gap-2", widget ? "max-w-full" : "max-w-2xl sm:grid-cols-2")}>
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="rounded-lg border border-border p-3 text-left text-sm text-fg hover:border-primary">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm",
                widget ? "max-w-[92%]" : "max-w-[92%] sm:max-w-[80%]",
                m.role === "user" ? "bg-primary text-primary-fg" : "bg-surface-2 text-fg",
              )}
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-line">{m.content}</p>
              ) : (
                <>
                  <Markdown className="text-sm">{m.content}</Markdown>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 border-t border-border pt-2 text-xs">
                      <span className="font-semibold text-muted">Portal sources: </span>
                      {m.sources.map((s, si) => (
                        <a key={`${si}-${s.href}`} href={s.href} className="mr-2 text-primary hover:underline">
                          [S{si + 1}] {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                  {m.provider && (
                    <div className="mt-2">
                      <Badge tone={m.provider === "openai" ? "info" : "warning"}>{m.provider === "openai" ? "AI-generated — validate in your training instance" : "Offline: portal passages"}</Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm text-muted">Thinking…</div>}
        {error && <Callout tone="danger">{error}</Callout>}
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor={`${uid}-input`} className="sr-only">
          Your question
        </label>
        <textarea
          id={`${uid}-input`}
          data-assistant-input
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={widget ? "Ask a question… (Enter to send)" : "Ask a question… (Enter to send, Shift+Enter for a new line). Never paste credentials or real customer data."}
          className={inputClass}
          maxLength={4000}
        />
        <button type="submit" disabled={busy || !input.trim()} className={buttonClass("primary")} aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
        {conversationId && (
          <button type="button" onClick={remove} className={buttonClass("ghost")} aria-label="Delete conversation" title="Delete conversation">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
