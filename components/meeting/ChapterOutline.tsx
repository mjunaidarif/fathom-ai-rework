"use client";

import type { Attendee } from "@/lib/types";
import type { Chapter } from "@/lib/chapters";
import { activeChapterIndex } from "@/lib/chapters";
import { fmtClock } from "@/lib/format";
import { Avatar } from "../ui";

export function ChapterOutline({
  chapters,
  currentMs,
  onSeek,
  attendees,
}: {
  chapters: Chapter[];
  currentMs: number;
  onSeek: (ms: number) => void;
  attendees: Attendee[];
}) {
  const active = activeChapterIndex(chapters, currentMs);
  const talkTotal = attendees.reduce((s, a) => s + a.talkTimeS, 0) || 1;

  return (
    <div className="sticky top-[92px] space-y-6">
      <div>
        <h3 className="eyebrow mb-2.5">Chapters</h3>
        <div className="relative pl-3">
          <span className="absolute left-[3px] top-1 bottom-1 w-px bg-[var(--border)]" />
          <div className="space-y-0.5">
            {chapters.map((ch, i) => {
              const isActive = i === active;
              return (
                <button
                  key={ch.id}
                  onClick={() => onSeek(ch.startMs)}
                  className="relative w-full text-left px-2 py-1.5 rounded-lg transition-colors group"
                  style={isActive ? { background: "var(--accent-soft)" } : undefined}
                >
                  <span
                    className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: isActive ? "var(--accent)" : "var(--border-strong)" }}
                  />
                  <div className="flex items-baseline gap-2">
                    <span className="mono text-[10.5px] text-[var(--text-3)] shrink-0">{fmtClock(ch.startMs)}</span>
                    <span
                      className="text-[12.5px] leading-snug line-clamp-2"
                      style={{ color: isActive ? "var(--accent)" : "var(--text-2)", fontWeight: isActive ? 600 : 400 }}
                    >
                      {ch.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="eyebrow mb-2.5">Talk time</h3>
        <div className="space-y-2">
          {[...attendees]
            .sort((a, b) => b.talkTimeS - a.talkTimeS)
            .slice(0, 8)
            .map((a) => (
              <div key={a.speakerLabel} className="flex items-center gap-2">
                <Avatar name={a.name} color={a.color} size={18} />
                <span className="text-[11.5px] truncate w-14">{a.name.split(" ")[0]}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(a.talkTimeS / talkTotal) * 100}%`, background: a.color }} />
                </div>
                <span className="mono text-[10px] text-[var(--text-3)] w-7 text-right">
                  {Math.round((a.talkTimeS / talkTotal) * 100)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
