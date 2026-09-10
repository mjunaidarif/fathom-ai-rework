"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtClock } from "@/lib/format";
import { IconPlaylist, IconPlay, IconClip } from "@/components/icons";

export default function PlaylistsPage() {
  const { playlists, getMeeting, createPlaylist } = useStore();
  const [name, setName] = useState("");

  return (
    <div className="max-w-[860px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Playlists</h1>
          <p className="text-[14px] text-[var(--text-2)] mt-0.5">
            Curated reels of highlights — onboarding, wins, customer signal.
          </p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) { createPlaylist(name.trim()); setName(""); } }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name…"
            className="px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[13.5px] outline-none focus:border-[var(--accent)]"
          />
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </div>

      <div className="mt-6 space-y-5">
        {playlists.map((pl) => {
          const clips = pl.highlightRefs
            .map((r) => {
              const m = getMeeting(r.meetingId);
              const h = m?.highlights.find((x) => x.id === r.highlightId);
              return m && h ? { m, h } : null;
            })
            .filter(Boolean) as { m: NonNullable<ReturnType<typeof getMeeting>>; h: NonNullable<ReturnType<typeof getMeeting>>["highlights"][number] }[];

          const totalMs = clips.reduce((s, c) => s + (c.h.endMs - c.h.startMs), 0);

          return (
            <div key={pl.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center">
                  <IconPlaylist width={22} height={22} />
                </span>
                <div>
                  <h2 className="font-semibold text-[16px]">{pl.name}</h2>
                  <p className="text-[12.5px] text-[var(--text-3)]">
                    {clips.length} clip{clips.length !== 1 ? "s" : ""} · {fmtClock(totalMs)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {clips.length === 0 && (
                  <p className="text-[13px] text-[var(--text-3)] py-3">
                    Empty. Add highlights to this playlist from any meeting.
                  </p>
                )}
                {clips.map(({ m, h }, i) => (
                  <Link
                    key={h.id}
                    href={`/meeting/${m.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors group"
                  >
                    <span className="text-[12px] tabular-nums text-[var(--text-3)] w-5 text-right">{i + 1}</span>
                    <span className="w-8 h-8 rounded-lg grid place-items-center text-white shrink-0" style={{ background: `hsl(${m.thumbnailHue} 60% 55%)` }}>
                      <IconPlay width={14} height={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium truncate group-hover:text-[var(--accent)] transition-colors">{h.label}</p>
                      <p className="text-[11.5px] text-[var(--text-3)] truncate">
                        {m.title} · {fmtClock(h.startMs)}–{fmtClock(h.endMs)}
                      </p>
                    </div>
                    <IconClip width={15} height={15} className="text-[var(--text-3)]" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
