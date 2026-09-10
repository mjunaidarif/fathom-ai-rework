"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtClock, fmtDate } from "@/lib/format";
import { PlatformBadge } from "@/components/ui";
import { IconSearch, IconPlay } from "@/components/icons";
import type { Meeting, TranscriptCue } from "@/lib/types";

interface Hit {
  meeting: Meeting;
  cues: TranscriptCue[];
  titleMatch: boolean;
}

export default function SearchPage() {
  const { meetings } = useStore();
  const [q, setQ] = useState("");

  const hits = useMemo<Hit[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const out: Hit[] = [];
    for (const m of meetings) {
      const cues = m.transcript.filter((c) => c.text.toLowerCase().includes(needle));
      const titleMatch =
        m.title.toLowerCase().includes(needle) ||
        m.recap.toLowerCase().includes(needle) ||
        m.attendees.some((a) => a.name.toLowerCase().includes(needle)) ||
        m.tags.some((t) => t.toLowerCase().includes(needle));
      if (cues.length || titleMatch) out.push({ meeting: m, cues: cues.slice(0, 4), titleMatch });
    }
    return out;
  }, [meetings, q]);

  const totalCues = hits.reduce((s, h) => s + h.cues.length, 0);
  const suggestions = ["pricing", "reliability", "security review", "expansion", "onboarding"];

  const mark = (text: string) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        …{text.slice(Math.max(0, idx - 40), idx)}
        <mark className="bg-[var(--accent-soft)] text-[var(--accent)] rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length, idx + q.length + 60)}…
      </>
    );
  };

  return (
    <div className="max-w-[860px] mx-auto px-8 py-8">
      <h1 className="text-[26px] font-bold tracking-tight">Search</h1>
      <p className="text-[14px] text-[var(--text-2)] mt-0.5">
        Search across every transcript, title, and participant.
      </p>

      <div className="relative mt-5">
        <IconSearch width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “security review”, “pricing”, a person’s name…"
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[15px] outline-none focus:border-[var(--accent)] shadow-[var(--shadow-sm)] transition-colors"
        />
      </div>

      {!q.trim() && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[var(--text-3)]">Try:</span>
          {suggestions.map((s) => (
            <button key={s} onClick={() => setQ(s)} className="chip hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {q.trim() && (
        <p className="mt-4 text-[13px] text-[var(--text-3)]">
          {totalCues} moment{totalCues !== 1 ? "s" : ""} across {hits.length} meeting{hits.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="mt-3 space-y-3">
        {hits.map(({ meeting, cues }) => (
          <div key={meeting.id} className="card p-4">
            <Link href={`/meeting/${meeting.id}`} className="flex items-center gap-3 group">
              <span className="w-9 h-9 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg, hsl(${meeting.thumbnailHue} 70% 60%), hsl(${(meeting.thumbnailHue + 40) % 360} 72% 50%))` }} />
              <div className="min-w-0">
                <div className="font-semibold text-[14.5px] group-hover:text-[var(--accent)] transition-colors truncate">
                  {meeting.title}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[var(--text-3)]">
                  {fmtDate(meeting.startedAt)}
                  <PlatformBadge platform={meeting.platform} />
                </div>
              </div>
            </Link>
            {cues.length > 0 && (
              <div className="mt-3 space-y-1.5 border-l-2 border-[var(--border)] pl-3">
                {cues.map((c) => (
                  <Link
                    key={c.id}
                    href={`/meeting/${meeting.id}`}
                    className="flex gap-2.5 text-[13px] text-[var(--text-2)] hover:text-[var(--text)] group"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-[var(--accent)] shrink-0 mt-0.5">
                      <IconPlay width={10} height={10} /> {fmtClock(c.startMs)}
                    </span>
                    <span className="leading-snug">
                      <span className="font-medium text-[var(--text)]">{c.speaker}: </span>
                      {mark(c.text)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {q.trim() && hits.length === 0 && (
          <div className="card p-10 text-center text-[var(--text-3)]">No results for “{q}”.</div>
        )}
      </div>
    </div>
  );
}
