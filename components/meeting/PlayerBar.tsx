"use client";

import type { Player } from "@/lib/usePlayer";
import type { Attendee, Highlight, TranscriptCue } from "@/lib/types";
import type { Chapter } from "@/lib/chapters";
import { fmtClock } from "@/lib/format";
import { Avatar } from "../ui";
import { MeetingTimeline } from "./MeetingTimeline";
import { IconPlay, IconPause, IconVolume, IconMute } from "../icons";

export function PlayerBar({
  player,
  durationMs,
  attendees,
  transcript,
  currentCue,
  highlights,
  chapters,
  audioOn,
  onToggleAudio,
  onAddHighlight,
}: {
  player: Player;
  durationMs: number;
  attendees: Attendee[];
  transcript: TranscriptCue[];
  currentCue?: TranscriptCue;
  highlights: Highlight[];
  chapters: Chapter[];
  audioOn: boolean;
  onToggleAudio: () => void;
  onAddHighlight: () => void;
}) {
  const speaker = attendees.find((a) => a.speakerLabel === currentCue?.speaker);

  return (
    <div className="card px-4 py-3 sticky top-3 z-30 shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-3">
        <button onClick={player.toggle} className="btn btn-primary !px-3 shrink-0" aria-label={player.playing ? "Pause" : "Play"}>
          {player.playing ? <IconPause width={18} height={18} /> : <IconPlay width={18} height={18} />}
        </button>

        {/* Now-playing speaker */}
        <div className="flex items-center gap-2 w-[150px] shrink-0">
          {speaker ? (
            <>
              <Avatar name={speaker.name} color={speaker.color} size={26} />
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold truncate leading-tight">{speaker.name.split(" ")[0]}</div>
                <div className="mono text-[10.5px] text-[var(--text-3)] leading-tight">
                  {fmtClock(player.currentMs)} / {fmtClock(durationMs)}
                </div>
              </div>
            </>
          ) : (
            <span className="mono text-[12px] text-[var(--text-3)]">
              {fmtClock(player.currentMs)} / {fmtClock(durationMs)}
            </span>
          )}
        </div>

        {/* Timeline */}
        <div className="flex-1 min-w-0">
          <MeetingTimeline
            durationMs={durationMs}
            currentMs={player.currentMs}
            onSeek={player.seek}
            attendees={attendees}
            transcript={transcript}
            highlights={highlights}
            chapters={chapters}
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleAudio}
            className="btn btn-soft !py-1.5 !px-2"
            title={audioOn ? "Mute narration" : "Unmute narration"}
          >
            {audioOn ? <IconVolume width={15} height={15} /> : <IconMute width={15} height={15} />}
          </button>
          <select
            value={player.rate}
            onChange={(e) => player.setRate(Number(e.target.value))}
            className="btn btn-soft !py-1.5 !px-2 text-[12px]"
            aria-label="Playback speed"
          >
            {[1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r}>
                {r}×
              </option>
            ))}
          </select>
          <button onClick={onAddHighlight} className="btn btn-soft !py-1.5 text-[12.5px]">
            ＋ Highlight
          </button>
        </div>
      </div>
    </div>
  );
}
