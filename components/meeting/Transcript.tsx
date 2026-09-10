"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Attendee, Highlight, TranscriptCue } from "@/lib/types";
import { fmtClock } from "@/lib/format";
import { IconSearch } from "../icons";

export function Transcript({
  cues,
  attendees,
  currentMs,
  onSeek,
  highlights,
}: {
  cues: TranscriptCue[];
  attendees: Attendee[];
  currentMs: number;
  onSeek: (ms: number) => void;
  highlights: Highlight[];
}) {
  const [q, setQ] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const colorOf = (label: string) =>
    attendees.find((a) => a.speakerLabel === label)?.color ?? "#888";

  const activeId = useMemo(() => {
    const c = cues.find((c) => currentMs >= c.startMs && currentMs < c.endMs);
    return c?.id ?? null;
  }, [cues, currentMs]);

  const highlightedCueIds = useMemo(
    () => new Set(highlights.flatMap((h) => h.cueIds)),
    [highlights],
  );

  useEffect(() => {
    if (!autoScroll || !activeRef.current || !containerRef.current) return;
    activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeId, autoScroll]);

  const matches = (text: string) =>
    q.trim() ? text.toLowerCase().includes(q.toLowerCase()) : false;

  const render = (text: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[var(--accent-soft)] text-[var(--accent)] rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const matchCount = q.trim() ? cues.filter((c) => matches(c.text)).length : 0;

  return (
    <div className="card flex flex-col min-h-0 h-full">
      <div className="p-3 border-b border-[var(--border)] flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch
            width={16}
            height={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search this transcript…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-[13px] outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
        </div>
        {q.trim() && (
          <span className="text-[12px] text-[var(--text-3)] whitespace-nowrap">{matchCount} match{matchCount !== 1 ? "es" : ""}</span>
        )}
        <label className="flex items-center gap-1.5 text-[12px] text-[var(--text-3)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Follow
        </label>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto scroll-thin p-2">
        {cues.map((c) => {
          const active = c.id === activeId;
          const dim = q.trim() && !matches(c.text);
          return (
            <div
              key={c.id}
              ref={active ? activeRef : undefined}
              onClick={() => onSeek(c.startMs)}
              className="group flex gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                opacity: dim ? 0.4 : 1,
              }}
            >
              <button className="text-[11px] tabular-nums font-medium mt-0.5 shrink-0 w-10 text-left" style={{ color: active ? "var(--accent)" : "var(--text-3)" }}>
                {fmtClock(c.startMs)}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold" style={{ color: colorOf(c.speaker) }}>
                    {c.speaker}
                  </span>
                  {highlightedCueIds.has(c.id) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" title="In a highlight" />
                  )}
                </div>
                <p className="text-[13.5px] leading-relaxed text-[var(--text)] mt-0.5">
                  {render(c.text)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
