"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { fmtRelative } from "@/lib/format";
import { IconHome, IconSearch, IconSparkle, IconPlaylist, IconPlay } from "./icons";

interface Item {
  id: string;
  label: string;
  hint?: string;
  href: string;
  kind: "action" | "meeting";
  icon: React.ReactNode;
}

export function CommandPalette() {
  const router = useRouter();
  const { meetings } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const openEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", openEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", openEvt);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const actions: Item[] = useMemo(
    () => [
      { id: "a-record", label: "New recording", hint: "Start a capture", href: "/record", kind: "action", icon: <span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> },
      { id: "a-home", label: "Home", hint: "Meeting library", href: "/", kind: "action", icon: <IconHome width={16} height={16} /> },
      { id: "a-search", label: "Search", hint: "Across all calls", href: "/search", kind: "action", icon: <IconSearch width={16} height={16} /> },
      { id: "a-ask", label: "Ask Fathom", hint: "Q&A over meetings", href: "/ask", kind: "action", icon: <IconSparkle width={16} height={16} /> },
      { id: "a-playlists", label: "Playlists", hint: "Highlight reels", href: "/playlists", kind: "action", icon: <IconPlaylist width={16} height={16} /> },
    ],
    [],
  );

  const results: Item[] = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const mtgItems: Item[] = meetings
      .filter((m) => !needle || m.title.toLowerCase().includes(needle) || m.attendees.some((a) => a.name.toLowerCase().includes(needle)))
      .slice(0, 6)
      .map((m) => ({
        id: m.id,
        label: m.title,
        hint: fmtRelative(m.startedAt),
        href: `/meeting/${m.id}`,
        kind: "meeting",
        icon: <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${m.thumbnailHue} 65% 58%)` }} />,
      }));
    const acts = actions.filter((a) => !needle || a.label.toLowerCase().includes(needle));
    return [...acts, ...mtgItems];
  }, [q, meetings, actions]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const go = (item: Item) => {
    setOpen(false);
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active]);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[560px] card !rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-[var(--border)]">
          <IconSearch width={18} height={18} className="text-[var(--text-3)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search meetings or jump to…"
            className="flex-1 py-3.5 bg-transparent outline-none text-[15px]"
          />
          <kbd className="text-[10px] text-[var(--text-3)] border border-[var(--border)] rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-[340px] overflow-y-auto scroll-thin p-1.5">
          {results.length === 0 && <div className="px-3 py-6 text-center text-[13px] text-[var(--text-3)]">No matches.</div>}
          {results.map((item, i) => (
            <button
              key={item.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
              style={i === active ? { background: "var(--accent-soft)" } : undefined}
            >
              <span className="w-5 grid place-items-center text-[var(--text-2)]">{item.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="text-[13.5px] block truncate" style={{ color: i === active ? "var(--accent)" : "var(--text)" }}>
                  {item.label}
                </span>
              </span>
              {item.hint && <span className="text-[11.5px] text-[var(--text-3)] shrink-0">{item.hint}</span>}
              {i === active && <IconPlay width={12} height={12} className="text-[var(--accent)] shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
