"use client";

import { useMemo, useState } from "react";
import type { Meeting, TemplateId } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { getSummary } from "@/lib/summarize";
import { useStore } from "@/lib/store";
import { fmtClock } from "@/lib/format";
import { Avatar } from "../ui";
import { IconCheck, IconPlay, IconSparkle, IconStar, IconLightning, IconPlaylist } from "../icons";

type Tab = "summary" | "actions" | "highlights" | "comments";

export function RightPanel({
  meeting,
  currentMs,
  onSeek,
}: {
  meeting: Meeting;
  currentMs: number;
  onSeek: (ms: number) => void;
}) {
  const [tab, setTab] = useState<Tab>("summary");
  const openCount = meeting.actionItems.filter((a) => !a.done).length;

  const tabs: [Tab, string, number | null][] = [
    ["summary", "Summary", null],
    ["actions", "Actions", openCount || null],
    ["highlights", "Highlights", meeting.highlights.length || null],
    ["comments", "Comments", meeting.comments.length || null],
  ];

  return (
    <div className="card flex flex-col h-full min-h-0">
      <div className="flex items-center gap-1 p-1.5 border-b border-[var(--border)]">
        {tabs.map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={tab === t ? { background: "var(--accent-soft)", color: "var(--accent)" } : { color: "var(--text-2)" }}
          >
            {label}
            {count != null && (
              <span className="text-[11px] font-semibold px-1.5 rounded-full" style={{ background: tab === t ? "var(--accent)" : "var(--surface-2)", color: tab === t ? "#fff" : "var(--text-3)" }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-4">
        {tab === "summary" && <SummaryTab meeting={meeting} />}
        {tab === "actions" && <ActionsTab meeting={meeting} onSeek={onSeek} />}
        {tab === "highlights" && <HighlightsTab meeting={meeting} onSeek={onSeek} />}
        {tab === "comments" && <CommentsTab meeting={meeting} currentMs={currentMs} onSeek={onSeek} />}
      </div>
    </div>
  );
}

function SummaryTab({ meeting }: { meeting: Meeting }) {
  const [templateId, setTemplateId] = useState<TemplateId>(meeting.summaries[0]?.templateId ?? "general");
  const { summary, generated } = useMemo(() => getSummary(meeting, templateId), [meeting, templateId]);

  const talkTotal = meeting.attendees.reduce((s, a) => s + a.talkTimeS, 0);

  return (
    <div className="animate-in">
      {/* Template switcher */}
      <div className="flex items-center gap-1.5 flex-wrap">
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
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-lg px-2.5 py-1.5">
          <IconLightning width={13} height={13} />
          On-device generated from the transcript for this template.
        </div>
      )}

      <div className="mt-4 space-y-4">
        {summary.sections.map((s, i) => (
          <div key={i}>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-3)] mb-1.5">
              {s.heading}
            </h4>
            <ul className="space-y-1.5">
              {s.bullets.map((b, j) => (
                <li key={j} className="flex gap-2 text-[13.5px] leading-relaxed text-[var(--text)]">
                  <span className="mt-2 w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Talk time */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-3)] mb-2.5">
          Talk time
        </h4>
        <div className="space-y-2">
          {[...meeting.attendees]
            .sort((a, b) => b.talkTimeS - a.talkTimeS)
            .map((a) => (
              <div key={a.speakerLabel} className="flex items-center gap-2.5">
                <Avatar name={a.name} color={a.color} size={22} />
                <span className="text-[12.5px] w-24 truncate">{a.name.split(" ")[0]}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(a.talkTimeS / talkTotal) * 100}%`, background: a.color }} />
                </div>
                <span className="text-[11px] tabular-nums text-[var(--text-3)] w-10 text-right">
                  {Math.round((a.talkTimeS / talkTotal) * 100)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function ActionsTab({ meeting, onSeek }: { meeting: Meeting; onSeek: (ms: number) => void }) {
  const { toggleActionItem } = useStore();
  return (
    <div className="space-y-2 animate-in">
      {meeting.actionItems.length === 0 && <Empty icon={<IconCheck />} text="No action items." />}
      {meeting.actionItems.map((a) => (
        <div key={a.id} className="flex gap-2.5 items-start p-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
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
              {a.assignee && <span className="chip">{a.assignee}</span>}
              {a.atMs != null && (
                <button onClick={() => onSeek(a.atMs!)} className="inline-flex items-center gap-1 hover:text-[var(--accent)]">
                  <IconPlay width={11} height={11} /> {fmtClock(a.atMs)}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HighlightsTab({ meeting, onSeek }: { meeting: Meeting; onSeek: (ms: number) => void }) {
  const { removeHighlight, playlists, createPlaylist, addToPlaylist } = useStore();
  const [openFor, setOpenFor] = useState<string | null>(null);

  return (
    <div className="space-y-2.5 animate-in">
      {meeting.highlights.length === 0 && (
        <Empty icon={<IconStar />} text="No highlights yet. Use ＋ Highlight on the player to clip a moment." />
      )}
      {meeting.highlights.map((h) => (
        <div key={h.id} className="p-3 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[var(--amber)] shrink-0"><IconStar width={15} height={15} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium leading-snug">{h.label}</p>
              {h.note && <p className="text-[12.5px] text-[var(--text-2)] mt-0.5">{h.note}</p>}
              <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-[var(--text-3)]">
                <button onClick={() => onSeek(h.startMs)} className="inline-flex items-center gap-1 hover:text-[var(--accent)]">
                  <IconPlay width={11} height={11} /> {fmtClock(h.startMs)}–{fmtClock(h.endMs)}
                </button>
                <span>· {h.createdBy}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => setOpenFor(openFor === h.id ? null : h.id)} className="btn btn-soft !py-1 !text-[12px]">
              <IconPlaylist width={13} height={13} /> Add to playlist
            </button>
            <button onClick={() => removeHighlight(meeting.id, h.id)} className="btn btn-ghost !py-1 !text-[12px] ml-auto">
              Remove
            </button>
          </div>
          {openFor === h.id && (
            <div className="mt-2 p-2 rounded-lg bg-[var(--surface-2)] space-y-1">
              {playlists.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { addToPlaylist(p.id, meeting.id, h.id); setOpenFor(null); }}
                  className="w-full text-left text-[12.5px] px-2 py-1.5 rounded-md hover:bg-[var(--surface)] transition-colors"
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => { const id = createPlaylist("New playlist"); addToPlaylist(id, meeting.id, h.id); setOpenFor(null); }}
                className="w-full text-left text-[12.5px] px-2 py-1.5 rounded-md text-[var(--accent)] font-medium hover:bg-[var(--surface)]"
              >
                ＋ New playlist
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CommentsTab({ meeting, currentMs, onSeek }: { meeting: Meeting; currentMs: number; onSeek: (ms: number) => void }) {
  const { addComment } = useStore();
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col h-full animate-in">
      <div className="flex-1 space-y-3">
        {meeting.comments.length === 0 && <Empty icon={<IconSparkle />} text="No comments yet." />}
        {meeting.comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <div className="w-8 shrink-0">
              <button onClick={() => onSeek(c.atMs)} className="text-[11px] tabular-nums text-[var(--accent)] font-medium hover:underline">
                {fmtClock(c.atMs)}
              </button>
            </div>
            <div className="flex-1">
              <div className="text-[12.5px]"><span className="font-semibold">{c.author}</span></div>
              <p className="text-[13px] text-[var(--text)] mt-0.5">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addComment(meeting.id, Math.round(currentMs), text.trim()); setText(""); } }}
        className="mt-3 pt-3 border-t border-[var(--border)] flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Comment at ${fmtClock(currentMs)}…`}
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-2)] text-[13px] outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
        />
        <button type="submit" className="btn btn-primary !py-2">Post</button>
      </form>
    </div>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-10 text-[var(--text-3)]">
      <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] grid place-items-center mx-auto mb-2">{icon}</div>
      <p className="text-[13px] max-w-[220px] mx-auto">{text}</p>
    </div>
  );
}
