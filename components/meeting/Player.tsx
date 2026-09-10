"use client";

import { useRef } from "react";
import type { Player } from "@/lib/usePlayer";
import type { Attendee, Highlight, TranscriptCue } from "@/lib/types";
import { fmtClock } from "@/lib/format";
import { Avatar } from "../ui";
import { IconPlay, IconPause } from "../icons";

export function PlayerView({
  player,
  durationMs,
  hue,
  attendees,
  currentCue,
  highlights,
  onAddHighlight,
}: {
  player: Player;
  durationMs: number;
  hue: number;
  attendees: Attendee[];
  currentCue?: TranscriptCue;
  highlights: Highlight[];
  onAddHighlight: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const speaker = attendees.find((a) => a.speakerLabel === currentCue?.speaker);
  const pct = durationMs ? (player.currentMs / durationMs) * 100 : 0;

  const seekFromEvent = (e: React.MouseEvent) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    player.seek(ratio * durationMs);
  };

  return (
    <div className="card overflow-hidden">
      {/* "Video" surface */}
      <div
        className="relative aspect-video grid place-items-center"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, hsl(${hue} 55% 30%), hsl(${(hue + 30) % 360} 60% 14%))`,
        }}
      >
        {speaker ? (
          <div className="flex flex-col items-center gap-3 animate-in" key={speaker.speakerLabel}>
            <Avatar name={speaker.name} color={speaker.color} size={72} />
            <div className="text-white font-semibold text-[15px]">{speaker.name}</div>
            <Waveform active={player.playing} color={speaker.color} />
          </div>
        ) : (
          <div className="text-white/70 text-sm">Press play to start</div>
        )}

        <span className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-black/30 px-2 py-1 rounded-full backdrop-blur">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
        </span>

        <button
          onClick={player.toggle}
          className="absolute inset-0 grid place-items-center group"
          aria-label={player.playing ? "Pause" : "Play"}
        >
          {!player.playing && (
            <span className="w-16 h-16 rounded-full bg-white/95 grid place-items-center shadow-lg group-hover:scale-105 transition-transform">
              <IconPlay width={28} height={28} className="text-[var(--accent)] translate-x-0.5" />
            </span>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 py-3">
        {/* Scrubber */}
        <div className="relative py-2 cursor-pointer" onClick={seekFromEvent} ref={barRef}>
          <div className="h-1.5 rounded-full bg-[var(--surface-2)] relative">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: "var(--accent)" }}
            />
            {/* highlight markers */}
            {highlights.map((h) => (
              <span
                key={h.id}
                className="absolute -top-0.5 w-1 h-2.5 rounded-full bg-[var(--amber)]"
                style={{ left: `${(h.startMs / durationMs) * 100}%` }}
                title={h.label}
              />
            ))}
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow"
              style={{ left: `${pct}%`, borderColor: "var(--accent)" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <button onClick={player.toggle} className="btn btn-primary !px-3">
            {player.playing ? <IconPause width={18} height={18} /> : <IconPlay width={18} height={18} />}
          </button>
          <span className="text-[13px] tabular-nums text-[var(--text-2)]">
            {fmtClock(player.currentMs)} <span className="text-[var(--text-3)]">/ {fmtClock(durationMs)}</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={player.rate}
              onChange={(e) => player.setRate(Number(e.target.value))}
              className="btn btn-soft !py-1.5 !px-2 text-[12px]"
            >
              {[1, 1.25, 1.5, 2].map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </select>
            <button onClick={onAddHighlight} className="btn btn-soft !py-1.5">
              ＋ Highlight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Waveform({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full"
          style={{
            background: color,
            opacity: 0.85,
            height: active ? `${20 + Math.abs(Math.sin(i * 1.7)) * 80}%` : "18%",
            transition: "height 0.25s ease",
            animation: active ? `wf 0.9s ease-in-out ${i * 0.05}s infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`@keyframes wf { from { transform: scaleY(0.5) } to { transform: scaleY(1.1) } }`}</style>
    </div>
  );
}
