"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Maximize2, MessageCirclePlus, Sparkles, X } from "lucide-react";
import { AssistantChat, type Msg } from "./assistant-chat";
import { cn } from "./ui";

const STORAGE_KEY = "nexsademy:assistant-conversation";

function readStored(): string | undefined {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeStored(id: string | undefined) {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private windows can block storage; the chat still works for this page view.
  }
}

/**
 * Floating "Ask AI" chat bubble shown on every portal page for learners with course
 * access. The open conversation survives page changes (kept in the layout and in
 * localStorage); the full history lives on /assistant.
 */
export function AssistantWidget({ aiConfigured }: { aiConfigured: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [conversation, setConversation] = useState<{ id?: string; messages: Msg[]; key: number } | null>(null);

  const load = useCallback(async () => {
    const id = readStored();
    if (!id) return setConversation({ messages: [], key: Date.now() });
    const res = await fetch(`/api/assistant?conversationId=${encodeURIComponent(id)}`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) {
      writeStored(undefined);
      return setConversation({ messages: [], key: Date.now() });
    }
    const json = (await res.json()) as { messages: { role: string; content: string }[] };
    setConversation({
      id,
      messages: json.messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      key: Date.now(),
    });
  }, []);

  const show = () => {
    setOpen(true);
    if (!opened) {
      setOpened(true);
      void load();
    }
  };

  const newChat = () => {
    writeStored(undefined);
    setConversation({ messages: [], key: Date.now() });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open && conversation) document.querySelector<HTMLTextAreaElement>("[data-assistant-widget] [data-assistant-input]")?.focus();
  }, [open, conversation]);

  // The full-page assistant already shows the chat.
  if (pathname === "/assistant") return null;

  return (
    <>
      <div
        data-assistant-widget
        role="dialog"
        aria-label="AI Learning Assistant"
        hidden={!open}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border border-border bg-surface shadow-2xl",
          "inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100vh-8rem))] sm:w-[400px] sm:rounded-2xl",
        )}
      >
        <header className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-fg">
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">AI Learning Assistant</p>
            <p className="truncate text-xs opacity-80">Answers from the course lessons and docs</p>
          </div>
          <button type="button" onClick={newChat} className="rounded-md p-1.5 hover:bg-white/15" title="New conversation" aria-label="New conversation">
            <MessageCirclePlus className="h-4 w-4" />
          </button>
          <Link
            href={conversation?.id ? `/assistant?c=${conversation.id}` : "/assistant"}
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 hover:bg-white/15"
            title="Open full page with all conversations"
            aria-label="Open full page"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-white/15" title="Close" aria-label="Close assistant">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1">
          {conversation ? (
            <AssistantChat
              key={conversation.key}
              variant="widget"
              conversationId={conversation.id}
              initialMessages={conversation.messages}
              aiConfigured={aiConfigured}
              onConversationChange={(id) => {
                writeStored(id);
                setConversation((c) => (c ? { ...c, id } : c));
              }}
            />
          ) : (
            <p className="p-6 text-center text-sm text-muted">Loading…</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        aria-expanded={open}
        aria-label={open ? "Close AI Learning Assistant" : "Open AI Learning Assistant"}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-fg shadow-xl shadow-primary/30 transition hover:brightness-110",
          open && "max-sm:hidden",
        )}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Sparkles className="h-5 w-5" aria-hidden />}
        <span className="hidden sm:inline">{open ? "Close" : "Ask AI"}</span>
      </button>
    </>
  );
}
