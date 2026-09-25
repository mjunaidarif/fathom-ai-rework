"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { usePlayer } from "@/lib/usePlayer";
import { useNarration } from "@/lib/useNarration";
import { deriveChapters } from "@/lib/chapters";
import { fmtDate, fmtDuration, fmtTime } from "@/lib/format";
import { PlayerBar } from "./meeting/PlayerBar";
import { ChapterOutline } from "./meeting/ChapterOutline";
import { MeetingDocument } from "./meeting/MeetingDocument";
import { ShareModal } from "./meeting/ShareModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { AvatarStack, PlatformBadge } from "./ui";
import { IconChevron, IconShare, IconTrash } from "./icons";

export function MeetingDetail({ id }: { id: string }) {
  const { getMeeting, addHighlight: addHighlightToStore, deleteMeeting, hydrated } = useStore();
  const router = useRouter();
  const meeting = getMeeting(id);
  const durationMs = (meeting?.durationS ?? 0) * 1000;
  const player = usePlayer(durationMs);
  const [shareOpen, setShareOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [audioOn, setAudioOn] = useState(true);

  const chapters = useMemo(() => (meeting ? deriveChapters(meeting) : []), [meeting]);
  const currentCue = useMemo(
    () => meeting?.transcript.find((c) => player.currentMs >= c.startMs && player.currentMs < c.endMs),
    [meeting, player.currentMs],
  );

  useNarration({
    enabled: audioOn,
    playing: player.playing,
    currentCue,
    attendees: meeting?.attendees ?? [],
    rate: player.rate,
  });

  const addHighlightAt = (ms: number) => {
    if (!meeting) return;
    const cue = meeting.transcript.find((c) => ms >= c.startMs && ms < c.endMs) ?? meeting.transcript[0];
    if (!cue) return;
    player.pause();
    const windowCues = meeting.transcript.filter((c) => c.startMs >= cue.startMs && c.startMs < cue.startMs + 15000);
    const words = cue.text.replace(/^[^:]+:\s*/, "").split(/\s+/).slice(0, 7).join(" ");
    addHighlightToStore(meeting.id, {
      startMs: cue.startMs,
      endMs: windowCues[windowCues.length - 1]?.endMs ?? cue.endMs,
      label: `${cue.speaker}: ${words}…`,
      cueIds: windowCues.map((c) => c.id),
    });
  };

  // Keyboard control (editing-suite feel). Ref keeps the handler reading latest state.
  const kbd = useRef({ player, cues: meeting?.transcript ?? [], addHighlightAt });
  kbd.current = { player, cues: meeting?.transcript ?? [], addHighlightAt };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (/(INPUT|TEXTAREA|SELECT)/.test(el.tagName) || el.isContentEditable)) return;
      const { player, cues, addHighlightAt } = kbd.current;
      if (e.code === "Space") {
        e.preventDefault();
        player.toggle();
      } else if (e.code === "ArrowRight") {
        const next = cues.find((c) => c.startMs > player.currentMs + 250);
        if (next) player.seek(next.startMs);
      } else if (e.code === "ArrowLeft") {
        const prev = [...cues].reverse().find((c) => c.startMs < player.currentMs - 250);
        if (prev) player.seek(prev.startMs);
      } else if (e.key.toLowerCase() === "f") {
        addHighlightAt(player.currentMs);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!meeting) {
    if (!hydrated) return <div className="p-10 text-center text-[var(--text-3)]">Loading meeting…</div>;
    return (
      <div className="p-10 text-center text-[var(--text-3)]">
        Meeting not found. <Link href="/" className="text-[var(--accent)]">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-4">
      {/* Header */}
      <header className="flex items-center gap-3 mb-3">
        <Link href="/" className="btn btn-ghost !px-2 -ml-2 rotate-180" title="Back">
          <IconChevron />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-[17px] truncate leading-tight">{meeting.title}</h1>
          <div className="flex items-center gap-2.5 text-[12px] text-[var(--text-3)] mt-0.5">
            <span>{fmtDate(meeting.startedAt)}</span>
            <span>·</span>
            <span>{fmtTime(meeting.startedAt)}</span>
            <span>·</span>
            <span>{fmtDuration(meeting.durationS)}</span>
            <PlatformBadge platform={meeting.platform} />
          </div>
        </div>
        <AvatarStack attendees={meeting.attendees} max={5} />
        <button
          onClick={() => setShowDelete(true)}
          title="Delete meeting"
          className="btn btn-soft !px-2.5 hover:!border-[var(--red)] hover:!text-[var(--red)]"
        >
          <IconTrash width={16} height={16} />
        </button>
        <button onClick={() => setShareOpen(true)} className="btn btn-primary">
          <IconShare width={16} height={16} /> Share
        </button>
      </header>

      {/* Sticky player + timeline */}
      <PlayerBar
        player={player}
        durationMs={durationMs}
        attendees={meeting.attendees}
        transcript={meeting.transcript}
        currentCue={currentCue}
        highlights={meeting.highlights}
        chapters={chapters}
        audioOn={audioOn}
        onToggleAudio={() => setAudioOn((v) => !v)}
        onAddHighlight={() => addHighlightAt(player.currentMs)}
      />

      {/* Outline + document */}
      <div className="grid grid-cols-[210px_1fr] gap-8 mt-6">
        <div className="hidden lg:block">
          <ChapterOutline chapters={chapters} currentMs={player.currentMs} onSeek={player.seek} attendees={meeting.attendees} />
        </div>
        <MeetingDocument meeting={meeting} currentMs={player.currentMs} onSeek={player.seek} chapters={chapters} />
      </div>

      {shareOpen && <ShareModal meeting={meeting} onClose={() => setShareOpen(false)} />}
      {showDelete && (
        <ConfirmDialog
          title="Delete this meeting?"
          body={`“${meeting.title}” and its transcript, summary, action items and highlights will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete meeting"
          onCancel={() => setShowDelete(false)}
          onConfirm={() => {
            deleteMeeting(meeting.id);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
