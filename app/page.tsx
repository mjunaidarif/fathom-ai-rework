"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { CALENDAR } from "@/lib/seed";
import { MeetingCard } from "@/components/MeetingCard";
import { PlatformBadge } from "@/components/ui";
import { IconSearch, IconCalendar, IconClock, IconStar } from "@/components/icons";
import { fmtDuration, fmtTime, fmtRelative } from "@/lib/format";

type Filter = "all" | "mine" | "team";

export default function LibraryPage() {
  const { meetings, currentUser } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = [...meetings].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
    if (filter === "mine") list = list.filter((m) => m.ownerId === currentUser.id);
    if (filter === "team") list = list.filter((m) => m.isTeamShared);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(needle) ||
          m.recap.toLowerCase().includes(needle) ||
          m.attendees.some((a) => a.name.toLowerCase().includes(needle)) ||
          m.tags.some((t) => t.toLowerCase().includes(needle)),
      );
    }
    return list;
  }, [meetings, filter, q, currentUser.id]);

  const totalMin = meetings.reduce((s, m) => s + m.durationS, 0);
  const totalHighlights = meetings.reduce((s, m) => s + m.highlights.length, 0);

  return (
    <div className="max-w-[980px] mx-auto px-8 py-8">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Meetings</h1>
          <p className="text-[14px] text-[var(--text-2)] mt-0.5">
            Everything Fathom captured, summarized and ready to search.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch
              width={17}
              height={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter meetings…"
              className="w-[220px] pl-9 pr-3 py-2 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <Link href="/record" className="btn btn-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-white/90" /> Record
          </Link>
        </div>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <StatTile icon={<IconCalendar width={18} height={18} />} label="Meetings" value={String(meetings.length)} />
        <StatTile icon={<IconClock width={18} height={18} />} label="Captured" value={fmtDuration(totalMin)} />
        <StatTile icon={<IconStar width={18} height={18} />} label="Highlights" value={String(totalHighlights)} />
      </div>

      {/* Upcoming */}
      <section className="mt-7">
        <div className="flex items-center gap-2 mb-2.5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Upcoming — notetaker joining
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-thin pb-1">
          {CALENDAR.map((e) => (
            <div key={e.id} className="card px-4 py-3 min-w-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-3)]">
                  {fmtRelative(e.startAt)} · {fmtTime(e.startAt)}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: e.willRecord ? "var(--green)" : "var(--text-3)" }}
                  title={e.willRecord ? "Will record" : "Not recording"}
                />
              </div>
              <div className="mt-1 font-semibold text-[14px] truncate">{e.title}</div>
              <div className="mt-2 flex items-center justify-between">
                <PlatformBadge platform={e.platform} />
                <span className="text-[12px] text-[var(--text-3)]">{fmtDuration(e.durationS)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter tabs */}
      <div className="mt-8 flex items-center gap-1 border-b border-[var(--border)]">
        {(
          [
            ["all", "All meetings"],
            ["mine", "My calls"],
            ["team", "Team calls"],
          ] as [Filter, string][]
        ).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-2 text-[13.5px] font-medium -mb-px border-b-2 transition-colors"
            style={
              filter === f
                ? { borderColor: "var(--accent)", color: "var(--accent)" }
                : { borderColor: "transparent", color: "var(--text-2)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((m) => (
          <MeetingCard key={m.id} m={m} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-[var(--text-3)]">
            No meetings match “{q}”.
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-[12px] text-[var(--text-3)]">
        Ask anything across your calls with{" "}
        <Link href="/ask" className="text-[var(--accent)] font-medium">
          Ask Fathom
        </Link>
        .
      </p>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card px-4 py-3.5 flex items-center gap-3">
      <span className="w-9 h-9 rounded-[10px] grid place-items-center bg-[var(--accent-soft)] text-[var(--accent)]">
        {icon}
      </span>
      <div>
        <div className="text-[20px] font-bold leading-none">{value}</div>
        <div className="text-[12px] text-[var(--text-3)] mt-1">{label}</div>
      </div>
    </div>
  );
}
