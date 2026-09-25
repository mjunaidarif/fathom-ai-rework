"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Meeting, TemplateId } from "@/lib/types";
import type { Chapter } from "@/lib/chapters";
import { TEMPLATES } from "@/lib/templates";
import { getSummary } from "@/lib/summarize";
import { useStore } from "@/lib/store";
import { fmtClock } from "@/lib/format";
import {
  IconCheck, IconPlay, IconStar, IconLightning, IconPlaylist, IconSearch,
} from "../icons";

export function MeetingDocument({
  meeting,
  currentMs,
  onSeek,
  chapters,
}: {
  meeting: Meeting;
  currentMs: number;
  onSeek: (ms: number) => void;
  chapters: Chapter[];
}) {
  return (
    <div className="space-y-8 pb-24">
      <SummarySection meeting={meeting} />
      <ActionsSection meeting={meeting} onSeek={onSeek} />
      <TranscriptSection meeting={meeting} currentMs={currentMs} onSeek={onSeek} chapters={chapters} />
      <HighlightsSection meeting={meeting} onSeek={onSeek} />
      <CommentsSection meeting={meeting} currentMs={currentMs} onSeek={onSeek} />
    </div>
  );
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-[15px] font-bold tracking-tight">{children}</h2>
      {count != null && <span className="chip !text-[11px]">{count}</span>}
    </div>
  );
}

function SummarySection({ meeting }: { meeting: Meeting }) {
  const [templateId, setTemplateId] = useState<TemplateId>(meeting.summaries[0]?.templateId ?? "general");
  const { summary, generated } = useMemo(() => getSummary(meeting, templateId), [meeting, templateId]);

  return (
    <section id="doc-summary">
      <SectionTitle>Summary</SectionTitle>
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            title={t.description}
            className="text-[12px] font-medium px-2.5 py-1 rounded-full border transition-colors"
            style={
              templateId === t.id
                ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                : { background: "var(--surface)", color: "var(--text-2)", borderColor: "var(--border)" }
            }
          >
            {t.name}
          </button>
        ))}
      </div>
      {generated && (
        <div className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-lg px-2.5 py-1.5">
          <IconLightning width={13} height={13} /> Generated on-device from the transcript for this template.
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
        {summary.sections.map((s, i) => (
          <div key={i}>
            <h4 className="eyebrow mb-2">{s.heading}</h4>
            <ul className="space-y-1.5">
              {s.bullets.map((b, j) => (
                <li key={j} className="flex gap-2 text-[13.5px] leading-relaxed">
                  <span className="mt-2 w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionsSection({ meeting, onSeek }: { meeting: Meeting; onSeek: (ms: number) => void }) {
  const { toggleActionItem } = useStore();
  if (meeting.actionItems.length === 0) return null;
  return (
    <section id="doc-actions">
      <SectionTitle count={meeting.actionItems.filter((a) => !a.done).length}>Action items</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-2">
        {meeting.actionItems.map((a) => (
          <div key={a.id} className="flex gap-2.5 items-start p-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors">
            <button
              onClick={() => toggleActionItem(meeting.id, a.id)}
              className="mt-0.5 w-[18px] h-[18px] rounded-md border grid place-items-center shrink-0 transition-colors"
              style={a.done ? { background: "var(--green)", borderColor: "var(--green)" } : { borderColor: "var(--border-strong)" }}
            >
              {a.done && <IconCheck width={13} height={13} className="text-white" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] leading-snug" style={{ textDecoration: a.done ? "line-through" : "none", color: a.done ? "var(--text-3)" : "var(--text)" }}>
                {a.text}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[var(--text-3)]">
                {a.assignee && <span className="chip !py-0.5">{a.assignee}</span>}
                {a.atMs != null && (
                  <button onClick={() => onSeek(a.atMs!)} className="mono inline-flex items-center gap-1 hover:text-[var(--accent)]">
                    <IconPlay width={10} height={10} /> {fmtClock(a.atMs)}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TranscriptSection({ meeting, currentMs, onSeek, chapters }: { meeting: Meeting; currentMs: number; onSeek: (ms: number) => void; chapters: Chapter[] }) {
  const { addHighlight } = useStore();
  const chapterByFirstCue = useMemo(() => {
    const m = new Map<string, Chapter>();
    for (const ch of chapters) if (ch.cueIds[0]) m.set(ch.cueIds[0], ch);
    return m;
  }, [chapters]);
  const [q, setQ] = useState("");
  const [follow, setFollow] = useState(true);
  const [sel, setSel] = useState<{ x: number; y: number; cueIds: string[]; startMs: number; endMs: number; label: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const cues = meeting.transcript;
  const attendees = meeting.attendees;
  const colorOf = (l: string) => attendees.find((a) => a.speakerLabel === l)?.color ?? "#888";
  const activeId = useMemo(() => cues.find((c) => currentMs >= c.startMs && currentMs < c.endMs)?.id ?? null, [cues, currentMs]);
  const highlightedCueIds = useMemo(() => new Set(meeting.highlights.flatMap((h) => h.cueIds)), [meeting.highlights]);

  useLayoutEffect(() => {
    if (follow && activeRef.current) activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeId, follow]);

  const onMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) return setSel(null);
    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return setSel(null);
    const chosen = cues.filter((c) => {
      const el = containerRef.current!.querySelector(`[data-cue="${c.id}"]`);
      return el && selection.containsNode(el, true);
    });
    if (chosen.length === 0) return setSel(null);
    const rect = range.getBoundingClientRect();
    const first = chosen[0].text.replace(/^[^:]+:\s*/, "").split(/\s+/).slice(0, 7).join(" ");
    setSel({
      x: rect.left + rect.width / 2,
      y: rect.top,
      cueIds: chosen.map((c) => c.id),
      startMs: Math.min(...chosen.map((c) => c.startMs)),
      endMs: Math.max(...chosen.map((c) => c.endMs)),
      label: `${chosen[0].speaker}: ${first}…`,
    });
  };

  const createFromSelection = () => {
    if (!sel) return;
    addHighlight(meeting.id, { startMs: sel.startMs, endMs: sel.endMs, label: sel.label, cueIds: sel.cueIds });
    window.getSelection()?.removeAllRanges();
    setSel(null);
  };

  const render = (text: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[var(--accent-soft)] text-[var(--accent)] rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <section id="doc-transcript">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[15px] font-bold tracking-tight">Transcript</h2>
        <div className="relative ml-auto">
          <IconSearch width={15} height={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-[180px] pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-[12.5px] outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
        </div>
        <label className="flex items-center gap-1.5 text-[12px] text-[var(--text-3)] cursor-pointer select-none">
          <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} className="accent-[var(--accent)]" />
          Follow
        </label>
      </div>

      <p className="text-[11.5px] text-[var(--text-3)] mb-2">Tip: select any text to clip it into a highlight.</p>

      <div ref={containerRef} onMouseUp={onMouseUp} className="space-y-0.5">
        {cues.map((c) => {
          const active = c.id === activeId;
          const dim = q.trim() && !c.text.toLowerCase().includes(q.toLowerCase());
          const chapter = chapterByFirstCue.get(c.id);
          return (
            <div key={`w-${c.id}`}>
            {chapter && (
              <div id={`ch-${chapter.id}`} className="flex items-center gap-3 pt-5 pb-2 first:pt-1">
                <span className="mono text-[10.5px] text-[var(--text-3)]">{fmtClock(chapter.startMs)}</span>
                <h4 className="text-[13px] font-bold tracking-tight">{chapter.title}</h4>
                <span className="flex-1 h-px bg-[var(--border)]" />
              </div>
            )}
            <div
              key={c.id}
              ref={active ? activeRef : undefined}
              data-cue={c.id}
              className="group flex gap-3 px-3 py-2 rounded-lg border-l-2 transition-colors"
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                borderLeftColor: active ? "var(--accent)" : "transparent",
                opacity: dim ? 0.4 : 1,
              }}
            >
              <button
                onClick={() => onSeek(c.startMs)}
                className="mono text-[11px] font-medium mt-0.5 shrink-0 w-10 text-left"
                style={{ color: active ? "var(--accent)" : "var(--text-3)" }}
              >
                {fmtClock(c.startMs)}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold" style={{ color: colorOf(c.speaker) }}>{c.speaker}</span>
                  {highlightedCueIds.has(c.id) && <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" title="In a highlight" />}
                </div>
                <p className="text-[14px] leading-relaxed mt-0.5">{render(c.text)}</p>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {/* Floating select-to-highlight action */}
      {sel && (
        <button
          onClick={createFromSelection}
          className="fixed z-50 btn btn-primary !py-1.5 shadow-[var(--shadow-lg)] -translate-x-1/2 -translate-y-full"
          style={{ left: sel.x, top: sel.y - 8 }}
        >
          <IconStar width={14} height={14} /> Highlight
        </button>
      )}
    </section>
  );
}

function HighlightsSection({ meeting, onSeek }: { meeting: Meeting; onSeek: (ms: number) => void }) {
  const { removeHighlight, playlists, createPlaylist, addToPlaylist } = useStore();
  const [openFor, setOpenFor] = useState<string | null>(null);
  if (meeting.highlights.length === 0) return null;
  return (
    <section id="doc-highlights">
      <SectionTitle count={meeting.highlights.length}>Highlights</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {meeting.highlights.map((h) => (
          <div key={h.id} className="p-3 rounded-xl border border-[var(--border)]">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-[var(--amber)] shrink-0"><IconStar width={15} height={15} /></span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium leading-snug">{h.label}</p>
                {h.note && <p className="text-[12.5px] text-[var(--text-2)] mt-0.5">{h.note}</p>}
                <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-[var(--text-3)]">
                  <button onClick={() => onSeek(h.startMs)} className="mono inline-flex items-center gap-1 hover:text-[var(--accent)]">
                    <IconPlay width={11} height={11} /> {fmtClock(h.startMs)}–{fmtClock(h.endMs)}
                  </button>
                  <span>· {h.createdBy}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setOpenFor(openFor === h.id ? null : h.id)} className="btn btn-soft !py-1 !text-[12px]">
                <IconPlaylist width={13} height={13} /> Playlist
              </button>
              <button onClick={() => removeHighlight(meeting.id, h.id)} className="btn btn-ghost !py-1 !text-[12px] ml-auto">Remove</button>
            </div>
            {openFor === h.id && (
              <div className="mt-2 p-2 rounded-lg bg-[var(--surface-2)] space-y-1">
                {playlists.map((p) => (
                  <button key={p.id} onClick={() => { addToPlaylist(p.id, meeting.id, h.id); setOpenFor(null); }} className="w-full text-left text-[12.5px] px-2 py-1.5 rounded-md hover:bg-[var(--surface)]">
                    {p.name}
                  </button>
                ))}
                <button onClick={async () => { const id = await createPlaylist("New playlist"); addToPlaylist(id, meeting.id, h.id); setOpenFor(null); }} className="w-full text-left text-[12.5px] px-2 py-1.5 rounded-md text-[var(--accent)] font-medium hover:bg-[var(--surface)]">
                  ＋ New playlist
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CommentsSection({ meeting, currentMs, onSeek }: { meeting: Meeting; currentMs: number; onSeek: (ms: number) => void }) {
  const { addComment } = useStore();
  const [text, setText] = useState("");
  return (
    <section id="doc-comments">
      <SectionTitle count={meeting.comments.length || undefined}>Comments</SectionTitle>
      <div className="space-y-3 mb-3">
        {meeting.comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <button onClick={() => onSeek(c.atMs)} className="mono text-[11px] text-[var(--accent)] font-medium w-10 shrink-0 text-left hover:underline">
              {fmtClock(c.atMs)}
            </button>
            <div>
              <div className="text-[12.5px] font-semibold">{c.author}</div>
              <p className="text-[13px] mt-0.5">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addComment(meeting.id, Math.round(currentMs), text.trim()); setText(""); } }}
        className="flex gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Comment at ${fmtClock(currentMs)}…`} className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-2)] text-[13px] outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        <button type="submit" className="btn btn-primary !py-2">Post</button>
      </form>
    </section>
  );
}
