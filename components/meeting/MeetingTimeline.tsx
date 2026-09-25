"use client";

import { useRef, useState } from "react";
import type { Attendee, Highlight, TranscriptCue } from "@/lib/types";
import type { Chapter } from "@/lib/chapters";
import { fmtClock } from "@/lib/format";

export function MeetingTimeline({
  durationMs,
  currentMs,
  onSeek,
  attendees,
  transcript,
  highlights,
  chapters,
}: {
  durationMs: number;
  currentMs: number;
  onSeek: (ms: number) => void;
  attendees: Attendee[];
  transcript: TranscriptCue[];
  highlights: Highlight[];
  chapters: Chapter[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hoverMs, setHoverMs] = useState<number | null>(null);

  const colorOf = (label: string) => attendees.find((a) => a.speakerLabel === label)?.color ?? "#888";
  const pct = (ms: number) => (durationMs ? (ms / durationMs) * 100 : 0);

  const msFromEvent = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * durationMs;
  };

  const hoverCue =
    hoverMs != null
      ? transcript.find((c) => hoverMs >= c.startMs && hoverMs < c.endMs) ??
        [...transcript].reverse().find((c) => c.startMs <= hoverMs)
      : null;

  return (
    <div className="select-none">
      <div
        ref={ref}
        className="relative h-9 cursor-pointer"
        onClick={(e) => onSeek(msFromEvent(e))}
        onMouseMove={(e) => setHoverMs(msFromEvent(e))}
        onMouseLeave={() => setHoverMs(null)}
      >
        {/* Speaker ribbon */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full overflow-hidden bg-[var(--surface-3)]">
          {transcript.map((c) => (
            <span
              key={c.id}
              className="absolute top-0 bottom-0"
              style={{
                left: `${pct(c.startMs)}%`,
                width: `${Math.max(0.4, pct(c.endMs - c.startMs))}%`,
                background: colorOf(c.speaker),
                opacity: currentMs >= c.startMs ? 0.95 : 0.4,
              }}
              title={c.speaker}
            />
          ))}
        </div>

        {/* Chapter ticks */}
        {chapters.map((ch) => (
          <span
            key={ch.id}
            className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-[var(--bg)]"
            style={{ left: `${pct(ch.startMs)}%` }}
          />
        ))}

        {/* Highlight pins */}
        {highlights.map((h) => (
          <span
            key={h.id}
            className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[var(--amber)] -translate-x-1/2"
            style={{ left: `${pct(h.startMs)}%` }}
            title={h.label}
          />
        ))}

        {/* Playhead */}
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow z-10"
          style={{ left: `${pct(currentMs)}%`, borderColor: "var(--accent)" }}
        />

        {/* Hover-scrub preview */}
        {hoverMs != null && hoverCue && (
          <div
            className="absolute bottom-full mb-2 z-20 pointer-events-none -translate-x-1/2 max-w-[280px]"
            style={{ left: `${Math.min(92, Math.max(8, pct(hoverMs)))}%` }}
          >
            <div className="card !rounded-lg px-2.5 py-1.5 shadow-[var(--shadow-md)]">
              <div className="flex items-center gap-1.5 text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorOf(hoverCue.speaker) }} />
                <span className="font-semibold" style={{ color: colorOf(hoverCue.speaker) }}>
                  {hoverCue.speaker}
                </span>
                <span className="mono text-[var(--text-3)]">{fmtClock(hoverMs)}</span>
              </div>
              <p className="text-[11.5px] text-[var(--text-2)] mt-0.5 line-clamp-2 leading-snug">
                {hoverCue.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
